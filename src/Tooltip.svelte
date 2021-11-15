<script>

	export let title = '';
	
	let isHovered = false;
	
	function mouseOver() {
		isHovered = true
		console.log('hovered')
	}
	
	function mouseLeave() {
		isHovered = false
		console.log('left')
	}

</script>

<div 
		 on:mouseOver={mouseOver}
		 on:mouseLeave={mouseLeave}>
	<slot />
</div>

{#if isHovered}
	<div class="tooltip">{title}</div>
{/if}

<style>
	.tooltip {
		border: 1px solid black;
		background: white;
		padding: 4px;
	}
</style>