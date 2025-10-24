<script>
	import { onMount } from 'svelte';
	
	onMount(() => {
		// Redirect to the static HTML file
		window.location.href = '/mock-github.html';
	});
</script>

<div class="loading">
	<h2>Loading GitHub Mock Website...</h2>
	<p>Redirecting to the mock website for testing...</p>
</div>

<style>
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
	}
	
	h2 {
		margin-bottom: 1rem;
		color: #333;
	}
	
	p {
		color: #666;
	}
</style>
