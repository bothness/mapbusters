<script>
	import { renderHexJSON } from './hexjson';
	import { getData, getAdjacents } from './utils';
	import { hexurl, dataurl } from './config';
	import adj from './adj.json';
	import HexMap from './HexMap.svelte';
	import Tooltip from './Tooltip.svelte'
	
	const width = 800;
	const height = 1000;
	const adjdist = 32.653; // Distance between two adjacent hexes
	
	let start; // Starting place
	let dest; // Destination
	let selectedRoute;
	
	// DOM
	let qcontainer;
	
	// DATA
	let data = [];
	let hexes;
	
	// GAME STATE

	let state = {
		screen: "start"
	};
	let selected;
	let next;
	let status = 'select'; // Game status, other options 'question', 'lost', 'won'
	let right = []; // Array of place codes correctly guessed
	let wrong = []; // Array of place codes wrongly guessed

	const routes = [
		{name: "Lands End to John o'Groats", start:'E06000052', end:'S12000017'},
		{name: "London to Edinburgh", start:"E09000033", end:"S12000036"}
	]

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
			//if the place is the same as the entry - mark as selected
			if (selected && d.key == selected.key) {
				d.status = 'selected';
			} else if (next && d.key == next.key) {
				d.status = 'next';
			//'right' meaning correct
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

	function startGameCustom() {
		right.push(start);
		state.screen = "quiz";
		selected = data.find(d => d.key == start);
		setStatus();
	}

	function startGamePreset() {
		start = selectedRoute.start;
		dest = selectedRoute.end;
		right.push(start);
		
		state.screen = "quiz";
		selected = data.find(d => d.key == start);
		setStatus();
	}
	
	function startGameRandom() {
		let moves = 10;
		
		let obj = hexes[Math.floor(Math.random() * hexes.length)]; // Select random start place
		start = obj.key;
		
		let arr = []; // Array of places that are ~{moves} away
		hexes.forEach(d => {
			let dist = Math.sqrt((d.x - obj.x) ** 2 + (d.y - obj.y) ** 2);
			if (dist > (moves - 1) * adjdist && dist < (moves + 1) * adjdist) {
				arr.push(d.key);
			}
		});
		
		dest = arr[Math.floor(Math.random() * arr.length)];
		
		right.push(start);
		state.screen = "quiz";
		selected = data.find(d => d.key == start);
		setStatus();
	}

	// function selectNew() {
	// 	state.screen = "start";
	// }
	
	fetch(hexurl)
	.then(res => res.json())
	.then(json => {
		let newhexes = renderHexJSON(json, width, height);
		hexes = newhexes.filter(d => ['E','W', 'S'].includes(d.key.slice(0,1)));
		
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
			
			data = [...data];
		});
	});


</script>

<main>

{#if data}

<h1 class="orbitron">
	MapBusters
</h1>

{#if state.screen === "start"}

<h2>Pick a starting location:</h2>

<select bind:value={start}>
	{#each data as option}
	<option value={option.key}>{option.n}</option>
	{/each} -->
</select>

<br>

<h2>Pick an end location:</h2>

<select bind:value={dest}>
	{#each data as option}
	<option value={option.key}>{option.n}</option>
	{/each} -->
</select>

<br>

<button on:click={startGameCustom}>Start Custom Game</button>

<hr>
	
<button on:click={startGameRandom}>Start Random Game</button>

<hr>

<h2 class='tooltip' title="this is a test">Or select a preset route</h2>
<select bind:value={selectedRoute}>
	{#each routes as option}
	<option value={option}>{option.name}</option>
	{/each} -->
</select>
<br>
<button on:click={startGamePreset}>Start Game</button>

<!-- <button on:click={()=>console.log("test")}>reset choices</button> -->

{:else if state.screen === "quiz"}

<h2 class='tooltip' title="this is a test">
	{data.find(d => d.key == start).n} to {data.find(d => d.key == dest).n} edition
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

{/if}
	
<!-- <Tooltip> THIS IS A TEST </Tooltip> -->

<p class="text-sml">
	Coded by <a href="https://twitter.com/bothness" target="_blank">Ahmad Barclay</a> with support from <a href="https://twitter.com/SamCtrl" target="_blank">Sam Cottrell</a>. Gameplay concept inspired by <a href="https://twitter.com/Frankman1000" target="_blank">Frank Donnarumma</a> and the brilliant ONS digital content team. Local authorities <a href="https://github.com/odileeds/hexmaps/" target="_blank">hexmap</a> by <a href="https://twitter.com/ODILeeds" target="_blank">ODI Leeds</a>. Hexmap <a href="https://github.com/olihawkins/d3-hexjson/" target="_blank">rendering script</a> by <a href="https://twitter.com/olihawkins" target="_blank">Oli Hawkins</a>. 2020 mid-year population estimates from <a href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/populationestimatesforukenglandandwalesscotlandandnorthernireland" target="_blank">ONS</a>.
</p>

{/if}

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