<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	interface LabelProps extends HTMLLabelAttributes {
		class?: string;
	}

	let { class: className = '', ...restProps }: LabelProps = $props();

	const classes = $derived(cn(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
		className
	));
</script>

<label class={classes} {...restProps}>
	<slot />
</label>