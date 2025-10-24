<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		orientation?: 'horizontal' | 'vertical';
		decorative?: boolean;
	}

	let { 
		class: className = '', 
		orientation = 'horizontal',
		decorative = true,
		...restProps 
	}: SeparatorProps = $props();

	const classes = $derived(cn(
		"shrink-0 bg-border",
		orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
		className
	));
</script>

<div 
	role={decorative ? 'none' : 'separator'} 
	aria-orientation={orientation}
	class={classes} 
	{...restProps}
></div>