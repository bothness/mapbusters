<script>
	import { renderHexJSON } from './hexjson';
	import { getData, getAdjacents } from './utils';
	import { hexurl, dataurl } from './config';
	import adj from './adj.json';
	import HexMap from './HexMap.svelte';
	
	const width = 800;
	const height = 1000;
	const start = 'E06000052'; // Starting place
	const dest = 'S12000017'; // Destination
	
	// DOM
	let qcontainer;
	
	// DATA
	let data;
	
	// GAME STATE
	let selected;
	let next;
	let status = 'select'; // Game status, other options 'question', 'lost', 'won'
	let right = []; // Array of place codes correctly guessed
	let wrong = []; // Array of place codes wrongly guessed
	
	function doSelect(e) {
		if (status == 'select') {
			next = e.detail.obj;
			status = 'question';
			qcontainer.scrollIntoView({behavior: "smooth"});
			setStatus();
			data = [...data];
		}
	}
	
	function setStatus() {
		data.forEach(d => {
			if (selected && d.key == selected.key) {
				d.status = 'selected';
			} else if (next && d.key == next.key) {
				d.status = 'next';
			} else if (right.includes(d.key)) {
				d.status = 'right';
			} else if (wrong.includes(d.key)) {
				d.status = 'wrong';
			} else if (d.key == dest) {
				d.status = 'dest';
			} else if (status == 'select' && selected.adj.includes(d.key)) {
				d.status = 'adjacent';
			} else {
				d.status = '';
			}
		});
	}
	
	function guess(hl) {
		if ((hl == 'higher' && next.value >= selected.value) || (hl == 'lower' && next.value <= selected.value)) {
			right.push(next.key);
			if (next.key == dest) {
				status = 'won';
			} else {
				status = 'select';
				selected = next;
			}
		} else {
			wrong.push(next.key);
			let adjacent = data.filter(d => selected.adj.includes(d.key));
			adjacent = adjacent.filter(d => !wrong.includes(d.key) && !right.includes(d.key));
			if (!adjacent[0]) {
				status = 'lost';
			} else {
				status = 'select';
			}
		}
		next = null;
		setStatus();
		data = [...data];
	}
	
	function restartGame() {
		right = [];
		wrong = [];
		next = null;
		selected = data.find(d => d.key == start);
		right.push(start);
		status = 'select';
		setStatus();
		data = [...data];
	}
	
	fetch(hexurl)
	.then(res => res.json())
	.then(json => {
		let hexes = renderHexJSON(json, width, height);
		hexes = hexes.filter(d => ['E','W', 'S'].includes(d.key.slice(0,1)));
		
		getData(dataurl)
		.then(arr => {
			let ind = {};
			arr.forEach(d => ind[d.code] = d.value);
			
			hexes.forEach(d => {
				d.value = ind[d.key];
				d.adj = adj[d.key];
			});
			data = hexes;
			selected = data.find(d => d.key == start);
			right.push(start);
			setStatus();
			data = [...data];
		});
	});
</script>

<main>

<h1 class="orbitron">
	MapBusters
</h1>
<h2>
	Land's End to John o' Groats edition
</h2>

{#if data && selected}

<div id="q-container" bind:this={qcontainer}>
	{#if status == 'won'}
	<span class="text-lrg orbitron">Yay! You won!</span><br/>
	<button on:click={restartGame} class="green">Play again</button>
	{:else if status == 'lost'}
	<span class="text-lrg orbitron">Bad luck... You lose!</span><br/>
	<button on:click={restartGame} class="green">Play again</button>
	{:else}
	<div>
		<span class="text-lrg orbitron">{selected.n}</span><br/>
		Population <strong>{selected.value.toLocaleString()}</strong>
	</div>
	<div>
		{#if !next}
		<span class="text-lrg orbitron">Select a place</span>
		{:else}
		<span class="text-lrg orbitron">{next.n}</span><br/>
		<button on:click={() => guess('higher')} class="green">Higher</button> or <button on:click|preventDefault={() => guess('lower')} class="red">Lower</button>
		{/if}
	</div>
	{/if}
</div>

<div id="map-container">
	<HexMap {data} {width} {height} {selected} on:select={doSelect}/>
</div>
{/if}

<p class="text-sml">
	Coded by <a href="https://twitter.com/bothness" target="_blank">Ahmad Barclay</a> with support from <a href="https://twitter.com/SamCtrl" target="_blank">Sam Cottrell</a>. Gameplay concept inspired by <a href="https://twitter.com/Frankman1000" target="_blank">Frank Donnarumma</a> and the brilliant ONS digital content team. Local authorities <a href="https://github.com/odileeds/hexmaps/" target="_blank">hexmap</a> by <a href="https://twitter.com/ODILeeds" target="_blank">ODI Leeds</a>. Hexmap <a href="https://github.com/olihawkins/d3-hexjson/" target="_blank">rendering script</a> by <a href="https://twitter.com/olihawkins" target="_blank">Oli Hawkins</a>. 2020 mid-year population estimates from <a href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/populationestimatesforukenglandandwalesscotlandandnorthernireland" target="_blank">ONS</a>.
</p>

</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');
	
	:global(body) {
		background: #222;
		color: white;
	}
	.orbitron {
		font-family: 'Orbitron', sans-serif;
	}
	.text-lrg {
		font-size: 1.4em;
		font-weight: bold;
	}
	.text-sml {
		font-size: 0.85em;
		color: lightgrey;
	}
	#q-container {
		min-height: 75px;
		box-sizing: border-box;
		margin: 0 0 20px 0;
		padding: 10px 0;
		border-top: 1px solid #ddd;
		border-bottom: 1px solid #ddd;
	}
	#q-container > div {
		display: inline-block;
		margin: 0;
		width: 49%;
		vertical-align: top;
	}
	#q-container button {
		padding: 0 3px;
		font-weight: bold;
		border: none;
		cursor: pointer;
		margin: 0;
	}
	.green {
		background-color: lightgreen;
	}
	.red {
		background-color: pink;
	}
	#map-container {
		width: 100%;
		height: 350px;
		position: relative;
	}
	a {
		color: lightblue;
	}
	h1 {
		margin-bottom: 0;
	}
	h2 {
		margin-top: 0;
		font-weight: normal;
		font-size: 1.2em;
	}
	main {
		max-width: 900px;
		margin-left: auto;
		margin-right: auto;
	}
</style>