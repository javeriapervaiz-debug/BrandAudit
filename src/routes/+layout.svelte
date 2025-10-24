<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>EternaBrand - AI Brand Guideline Assistant</title>
	<meta
		name="description"
		content="Generate complete brand guidelines, audit websites, and create branded content with AI"
	/>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
