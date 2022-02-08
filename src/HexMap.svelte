<script>
	import { createEventDispatcher, onMount } from 'svelte';
	const dispatch = createEventDispatcher();
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	
	export let data;
	export let width = 100;
	export let height = 100;
	export let selected = null;
	
	let el = {};
	let zoomfactor = tweened(1, {
		duration: 400,
		easing: cubicOut
	});
	
	function makePoints(vertices) {
		let points = [];
		vertices.forEach(d => points.push(d.x + ',' + d.y));
		return points.join(' ');
	}
	
	function onClick(e, d) {
		if (selected.adj.includes(d.key) && !['wrong','right'].includes(d.status)) {
			dispatch('select', {
				code: d.key,
				obj: d,
				event: e
			});
		}
	}
	
	onMount(async () => {
		reCenter(selected);
	});
	
	function reCenter(selected) {
		if (el[selected.key]) {
			el[selected.key].scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
		}
	}
	
	$: reCenter(selected);
</script>

<div class="control">
	<button on:click={() => zoomfactor.set($zoomfactor * 1.5)}>+</button>
	<button on:click={() => zoomfactor.set($zoomfactor / 1.5)}>-</button>
</div>

<div class="map">
	<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" style="width: {width * $zoomfactor}px;">
		{#each data as d}
		<g on:click="{(e) => onClick(e, d)}" bind:this={el[d.key]} class="{d.status}" transform="translate({d.x} {d.y})">
			<polygon class="hex" points="{makePoints(d.vertices)}"/>
			<text class="text">{d.n.slice(0,1)}</text>
			<title>{d.n}</title>
		</g>
		{/each}
	</svg>
</div>

<style>
	.hex {
		fill: darkgrey;
		stroke: darkgrey;
		stroke-width: 3px;
		transform: scale(0.85);
	}
	.text {
		fill: white;
		font-family: 'Orbitron', sans-serif;
		font-size: 16px;
		font-weight: bold;
		text-anchor: middle;
		dominant-baseline: middle;
		pointer-events: none;
	}
	.selected > polygon, .right > polygon {
		fill: #206095;
		stroke: #206095;
	}
	.wrong {
		opacity: 0;
	}
	.next > polygon {
		fill: #22D0B6;
		stroke: #22D0B6;
	}
	.dest > polygon {
		fill: #F66068;
		stroke: #F66068;
	}
	.adjacent {
		animation: blink 1s linear infinite;
		cursor: pointer;
	}
	.map {
		width: 100%;
		height: 100%;
		overflow: scroll;
	}
	.control {
		position: absolute;
		top: 0;
		right: 24px;
	}
	.control > button {
		width: 36px;
		height: 36px;
		font-size: 1.2em;
		font-weight: bold;
		line-height: 0;
		clear: right;
    float: right;
		margin: 0 0 5px 0;
		border: 2px solid #777;
		border-radius: 5px;
		cursor: pointer;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>