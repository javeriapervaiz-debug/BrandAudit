<script lang="ts">
	export let color: string;
	export let label: string;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	
	// Function to extract hex color from text
	function extractHexColor(text: string): string | null {
		// Look for hex patterns like #ffffff, #fff, etc.
		const hexMatch = text.match(/#([0-9a-fA-F]{3,6})/);
		if (hexMatch) {
			let hex = hexMatch[1];
			// Convert 3-digit hex to 6-digit
			if (hex.length === 3) {
				hex = hex.split('').map(char => char + char).join('');
			}
			return '#' + hex;
		}
		
		// Look for rgb patterns and convert to hex
		const rgbMatch = text.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
		if (rgbMatch) {
			const r = parseInt(rgbMatch[1]);
			const g = parseInt(rgbMatch[2]);
			const b = parseInt(rgbMatch[3]);
			return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		}
		
		// Look for rgba patterns and convert to hex (ignoring alpha)
		const rgbaMatch = text.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
		if (rgbaMatch) {
			const r = parseInt(rgbaMatch[1]);
			const g = parseInt(rgbaMatch[2]);
			const b = parseInt(rgbaMatch[3]);
			return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		}
		
		return null;
	}
	
	// Function to get contrasting text color (black or white)
	function getContrastColor(hex: string): string {
		// Remove # if present
		hex = hex.replace('#', '');
		
		// Convert to RGB
		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);
		
		// Calculate luminance
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		
		// Return black for light colors, white for dark colors
		return luminance > 0.5 ? '#000000' : '#ffffff';
	}
	
	$: hexColor = extractHexColor(color);
	$: textColor = hexColor ? getContrastColor(hexColor) : '#000000';
	$: sizeClass = size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12';
	$: textSizeClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
</script>

{#if hexColor}
	<div class="color-swatch-container inline-flex items-center gap-2">
		<div 
			class="color-swatch {sizeClass} rounded border border-gray-300 shadow-sm flex items-center justify-center font-mono {textSizeClass} font-bold"
			style="background-color: {hexColor}; color: {textColor};"
			title="{hexColor}"
		>
			{#if size === 'lg'}
				{hexColor.toUpperCase()}
			{/if}
		</div>
		<div class="color-info">
			<div class="font-mono text-sm font-medium">{hexColor.toUpperCase()}</div>
			{#if label}
				<div class="text-xs text-gray-600">{label}</div>
			{/if}
		</div>
	</div>
{:else}
	<!-- Fallback for non-color text -->
	<div class="color-swatch-container inline-flex items-center gap-2">
		<div class="color-swatch-placeholder {sizeClass} rounded border border-gray-300 bg-gray-100 flex items-center justify-center">
			<span class="text-gray-400 text-xs">?</span>
		</div>
		<div class="color-info">
			<div class="font-mono text-sm font-medium">{color}</div>
			{#if label}
				<div class="text-xs text-gray-600">{label}</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.color-swatch-container {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.color-swatch {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #d1d5da;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		font-family: 'Courier New', monospace;
		font-weight: bold;
	}
	
	.color-swatch-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f3f4f6;
		border: 1px solid #d1d5da;
	}
	
	.color-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
</style>

