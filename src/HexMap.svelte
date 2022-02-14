<script>
	import { createEventDispatcher, onMount } from "svelte";
	const dispatch = createEventDispatcher();
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";

	export let data;
	export let width = 100;
	export let height = 100;
	export let selected = null;
	let svg;

	let el = {};
	let zoomfactor = tweened(1, {
		duration: 400,
		easing: cubicOut,
	});

	function makePoints(vertices) {
		let points = [];
		vertices.forEach((d) => points.push(d.x + "," + d.y));
		return points.join(" ");
	}

	function onClick(e, d) {
		if (
			selected.adj.includes(d.key) &&
			!["wrong", "right"].includes(d.status)
		) {
			dispatch("select", {
				// code: d.key,
				obj: d,
			});
		}
	}

	onMount(async () => {
		// click events
		svg.addEventListener("keypress", function (key) {
			// This section deals with the keyboard interaction of the game
			console.error(key);

			switch (key.code) {
				case "Equal": // = or +// send higher
					dispatch("guesskey", { code: "higher" });
					break;
				case "Minus": // - or _  // send lower
					dispatch("guesskey", { code: "lower" });
					break;

				default:
					try {
						if (key.code.slice(0, 5) === "Digit") {
							var select = [
								...document.querySelectorAll(".adjacent .text"),
							]
								.filter((d) => d.textContent == key.code[5])[0]
								;

							dispatch("select", {
								// code: select
								obj: JSON.parse(select.getAttribute("data")),
							});
						}
					} catch (err) {}
			}
		});

		reCenter(selected);
	});

	function reCenter(selected) {
		if (el[selected.key]) {
			el[selected.key].scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "center",
			});
		}
	}

	$: reCenter(selected);
</script>

<main>
	<div class="control">
		<button on:click={() => zoomfactor.set($zoomfactor * 1.5)}>+</button>
		<button on:click={() => zoomfactor.set($zoomfactor / 1.5)}>-</button>
	</div>

	<div class="map" tabIndex="0" bind:this={svg}>
		<svg
			viewBox="0 0 {width} {height}"
			xmlns="http://www.w3.org/2000/svg"
			style="width: {width * $zoomfactor}px;"
			id="hexsvg"
		>
			{#each data as d}
				<!-- for each hexagon -->
				<g
					on:click={(e) => onClick(e, d)}
					bind:this={el[d.key]}
					class={d.status}
					tabIndex={-(d.status != "adjacent")}
					transform="translate({d.x} {d.y})"
				>
					<polygon class="hex" points={makePoints(d.vertices)} />
					<text class="text" data={JSON.stringify(d)}
						>{d.id || d.n.slice(0, 1)}</text
					>
					<title>{d.n}</title>
				</g>
			{/each}
		</svg>
	</div>
</main>

<style>
	.hex {
		fill: darkgrey;
		stroke: darkgrey;
		stroke-width: 3px;
		transform: scale(0.85);
	}
	.text {
		fill: white;
		font-family: "Orbitron", sans-serif;
		font-size: 16px;
		font-weight: bold;
		text-anchor: middle;
		dominant-baseline: middle;
		pointer-events: none;
	}
	.selected > polygon,
	.right > polygon {
		fill: #1a609a;
		stroke: #206095;
	}

	.start > polygon,
	.right > polygon {
		fill: #11384a;
		stroke: #206095;
	}
	.wrong {
		opacity: 0;
	}
	.next > polygon {
		fill: #22d0b6;
		stroke: #22d0b6;
	}
	.dest > polygon {
		fill: #f66068;
		stroke: #f66068;
	}
	.adjacent > polygon {
		fill: rgb(255, 194, 62);
		stroke: white;
	}
	.adjacent > text {
		fill: #11384a;
	}
	.adjacent {
		animation: blink 2s linear infinite;

		cursor: pointer;
	}
	.map {
		width: 100%;
		height: 80%;
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
			fill-opacity: 0.3;
		}
	}
</style>
