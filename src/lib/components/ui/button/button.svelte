<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	interface ButtonProps extends HTMLButtonAttributes {
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		class?: string;
		href?: string;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		href,
		onclick,
		...restProps
	}: ButtonProps = $props();

	// Remove href from restProps to avoid conflicts
	const { href: _, ...buttonProps } = restProps;

	const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
	
	const variantClasses = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline'
	};
	
	const sizeClasses = {
		default: 'h-9 px-4 py-2',
		sm: 'h-8 rounded-md px-3 text-xs',
		lg: 'h-10 rounded-md px-8',
		icon: 'h-9 w-9'
	};

	const classes = $derived(cn(
		baseClasses,
		variantClasses[variant],
		sizeClasses[size],
		className
	));
</script>

{#if href}
	<a href={href} class={classes} {...buttonProps}>
		<slot />
	</a>
{:else}
	<button class={classes} onclick={onclick} {...buttonProps}>
		<slot />
	</button>
{/if}