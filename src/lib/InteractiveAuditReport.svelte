<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { AlertTriangle, CheckCircle, Copy, Download, Eye, EyeOff, Maximize2, X } from 'lucide-svelte';
	import ColorSwatch from './components/ColorSwatch.svelte';

	export let auditData: any;
	export let originalScreenshot: string | null;
	export let highlightedScreenshot: string | null;
	export let legendImage: string | null;

	let activeViolationIndex: number | null = null;
	let copiedViolation: string | null = null;
	let isFullscreen: boolean = false;
	let showDebugInfo: boolean = false;
	let showFullscreenModal: boolean = false;

	// Function to handle clicking on a violation in the list
	function focusViolation(index: number) {
		activeViolationIndex = activeViolationIndex === index ? null : index;
	}

	// Function to handle fullscreen modal
	function toggleFullscreen() {
		showFullscreenModal = !showFullscreenModal;
	}

	// Function to close fullscreen modal
	function closeFullscreen() {
		showFullscreenModal = false;
	}

	// Function to copy CSS fix to clipboard
	function copyCSSFix(violation: any) {
		const cssFix = generateCSSFix(violation);
		navigator.clipboard.writeText(cssFix).then(() => {
			copiedViolation = violation.elementType;
			setTimeout(() => {
				copiedViolation = null;
			}, 2000);
		});
	}

	// Function to extract colors from text
	function extractColors(text: string): string[] {
		const colors: string[] = [];
		
		// Look for hex patterns like #ffffff, #fff, etc.
		const hexMatches = text.match(/#([0-9a-fA-F]{3,6})/g);
		if (hexMatches) {
			colors.push(...hexMatches);
		}
		
		// Look for rgb patterns
		const rgbMatches = text.match(/rgb\(\d+,\s*\d+,\s*\d+\)/g);
		if (rgbMatches) {
			colors.push(...rgbMatches);
		}
		
		// Look for rgba patterns
		const rgbaMatches = text.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/g);
		if (rgbaMatches) {
			colors.push(...rgbaMatches);
		}
		
		return colors;
	}

	// Function to check if violation is color-related
	function isColorViolation(violation: any): boolean {
		return violation.issueType === 'color' || 
			   violation.issueType === 'fontFamily' && violation.found?.includes('color') ||
			   violation.found?.includes('#') || 
			   violation.found?.includes('rgb') ||
			   violation.expected?.includes('#') || 
			   violation.expected?.includes('rgb');
	}

	// Function to create color comparison component
	function createColorComparison(violation: any) {
		const foundColors = extractColors(violation.found || '');
		const expectedColors = extractColors(violation.expected || '');
		
		return {
			found: foundColors,
			expected: expectedColors,
			hasColors: foundColors.length > 0 || expectedColors.length > 0
		};
	}

	// Generate CSS fix for a violation
	function generateCSSFix(violation: any): string {
		const elementType = violation.elementType.toLowerCase();
		const property = violation.issueType === 'color' ? 'color' : 
						violation.issueType === 'typography' ? 'font-family' : 
						violation.issueType === 'spacing' ? 'padding' : 'background-color';
		
		let selector = '';
		if (elementType.includes('button')) {
			selector = 'button, .btn, [type="button"]';
		} else if (elementType.includes('h1')) {
			selector = 'h1';
		} else if (elementType.includes('h2')) {
			selector = 'h2';
		} else if (elementType.includes('h3')) {
			selector = 'h3';
		} else if (elementType.includes('logo')) {
			selector = '.logo, header img, [class*="logo"]';
		} else {
			selector = elementType;
		}

		const value = violation.expected.includes('#') ? violation.expected : 
					 violation.expected.includes('Inter') ? '"Inter", sans-serif' :
					 violation.expected;

		return `${selector} { ${property}: ${value} !important; }`;
	}

	// Get severity color for styling
	function getSeverityColor(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical':
				return 'text-red-600 bg-red-50 border-red-200';
			case 'high':
				return 'text-red-600 bg-red-50 border-red-200';
			case 'medium':
				return 'text-orange-600 bg-orange-50 border-orange-200';
			case 'low':
				return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}

	// Get severity icon
	function getSeverityIcon(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical':
			case 'high':
				return 'h-4 w-4 text-red-500';
			case 'medium':
				return 'h-4 w-4 text-orange-500';
			case 'low':
				return 'h-4 w-4 text-yellow-500';
			default:
				return 'h-4 w-4 text-gray-500';
		}
	}

	// Get highlight color for markers
	function getHighlightColor(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical':
			case 'high':
				return 'bg-red-500 border-red-600';
			case 'medium':
				return 'bg-orange-500 border-orange-600';
			case 'low':
				return 'bg-yellow-500 border-yellow-600';
			default:
				return 'bg-gray-500 border-gray-600';
		}
	}

	// Get highlight text color
	function getHighlightTextColor(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical':
			case 'high':
				return 'text-red-600';
			case 'medium':
				return 'text-orange-600';
			case 'low':
				return 'text-yellow-600';
			default:
				return 'text-gray-600';
		}
	}

	// Get highlight background color
	function getHighlightBackgroundColor(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical':
			case 'high':
				return 'bg-red-100';
			case 'medium':
				return 'bg-orange-100';
			case 'low':
				return 'bg-yellow-100';
			default:
				return 'bg-gray-100';
		}
	}
</script>

<div class="interactive-audit-container">
	<!-- Main Audit Results -->
	{#if auditData}
		<Card>
			<CardHeader>
				<CardTitle>Audit Results</CardTitle>
				<CardDescription>
					Score: {auditData.score || 0}/100 • 
					{auditData.severityBreakdown?.high || 0} High • 
					{auditData.severityBreakdown?.medium || 0} Medium • 
					{auditData.severityBreakdown?.low || 0} Low
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="audit-visualization">
					<!-- Website Preview with Interactive Overlay -->
					<div class="website-preview">
						{#if originalScreenshot}
							<div class="screenshot-container">
								<img 
									src={`data:image/png;base64,${originalScreenshot}`} 
									alt="Website screenshot" 
									class="website-screenshot"
								/>
								
								<!-- Clean screenshot -->
							</div>
						{:else}
							<div class="no-screenshot">
								<EyeOff class="h-12 w-12 text-gray-400 mx-auto mb-2" />
								<p class="text-gray-500">No screenshot available</p>
							</div>
						{/if}
					</div>

					<!-- Violation Sidebar -->
					<div class="violation-sidebar">
						<div class="sidebar-header">
							<h3>Issues Found ({auditData.violations?.length || 0})</h3>
							<p class="text-sm text-gray-600">Click any issue to highlight it</p>
						</div>
						
						<div class="violation-list">
							{#each auditData.violations as violation, index}
								<div 
									class="violation-item {getSeverityColor(violation.severity)} {activeViolationIndex === index ? 'active' : ''}"
									on:click={() => focusViolation(index)}
									role="button"
									tabindex="0"
									on:keydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											focusViolation(index);
										}
									}}
								>
									<div class="violation-marker {getHighlightColor(violation.severity)}">
										<span class="marker-number">{index + 1}</span>
									</div>
									<div class="violation-content">
										<div class="violation-header">
											<span class="violation-type">{violation.elementType}</span>
											{#if violation.location}
												<span class="violation-location">• {violation.location}</span>
											{/if}
											<span class="violation-severity {violation.severity?.toLowerCase() || 'unknown'}">{violation.severity?.toUpperCase() || 'UNKNOWN'}</span>
										</div>
										<p class="violation-suggestion">{violation.suggestion}</p>
										
										<!-- Color swatches for color-related violations -->
										{#if isColorViolation(violation)}
											{@const colorComparison = createColorComparison(violation)}
											{#if colorComparison.hasColors}
												<div class="color-comparison mb-3 p-3 bg-gray-50 rounded-lg border">
													<div class="flex items-center gap-4">
														<div class="flex-1">
															<div class="text-sm font-medium text-gray-700 mb-2">Found Colors:</div>
															<div class="flex flex-wrap gap-2">
																{#each colorComparison.found as color}
																	<ColorSwatch color={color} label="Found" size="sm" />
																{:else}
																	<span class="text-sm text-gray-500">No colors detected</span>
																{/each}
															</div>
														</div>
														<div class="flex-1">
															<div class="text-sm font-medium text-gray-700 mb-2">Expected Colors:</div>
															<div class="flex flex-wrap gap-2">
																{#each colorComparison.expected as color}
																	<ColorSwatch color={color} label="Expected" size="sm" />
																{:else}
																	<span class="text-sm text-gray-500">No colors specified</span>
																{/each}
															</div>
														</div>
													</div>
												</div>
											{/if}
										{/if}
										
										<div class="violation-details">
											<p><strong>Found:</strong> {violation.found}</p>
											<p><strong>Expected:</strong> {violation.expected}</p>
										</div>

										{#if activeViolationIndex === index}
											<div class="violation-fix">
												<div class="fix-header">
													<span class="text-sm font-medium">CSS Fix:</span>
													<button
														type="button"
														class="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
														on:click={(e) => {
															e.stopPropagation();
															copyCSSFix(violation);
														}}
													>
														{#if copiedViolation === violation.elementType}
															<CheckCircle class="h-3 w-3 mr-1" />
															Copied!
														{:else}
															<Copy class="h-3 w-3 mr-1" />
															Copy CSS
														{/if}
													</button>
												</div>
												<code class="css-fix-code">
													{generateCSSFix(violation)}
												</code>
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>


				<!-- Action Buttons -->
				<div class="action-buttons">
					<button 
						type="button"
						class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						on:click={() => toggleFullscreen()}
					>
						<Maximize2 class="mr-2 h-4 w-4" />
						Fullscreen Screenshot
					</button>
					<button
						type="button"
						class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						on:click={() => showDebugInfo = !showDebugInfo}
					>
						<Eye class="mr-2 h-4 w-4" />
						Debug Info
					</button>
				</div>

				<!-- Debug Information -->
				{#if showDebugInfo}
					<div class="debug-info">
						<h4 class="font-bold mb-2">Debug Information</h4>
						<div class="debug-grid">
							<div>
								<strong>Total Violations:</strong> {auditData.violations?.length || 0}
							</div>
							<div>
								<strong>Active Violation:</strong> {activeViolationIndex !== null ? activeViolationIndex + 1 : 'None'}
							</div>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	{/if}

	<!-- Fullscreen Modal -->
	{#if showFullscreenModal}
		<div class="fullscreen-modal" on:click={closeFullscreen}>
			<div class="fullscreen-content" on:click|stopPropagation>
				<div class="fullscreen-header">
					<div class="flex items-center gap-4">
						<h3>Website Screenshot</h3>
						<div class="text-sm text-gray-500">
							Scroll to view full image
						</div>
					</div>
					<div class="flex items-center gap-2">
						<button 
							class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
							on:click={() => {
								const container = document.querySelector('.fullscreen-image-container');
								if (container) {
									container.scrollTo({ top: 0, behavior: 'smooth' });
								}
							}}
						>
							↑ Top
						</button>
						<button
							type="button"
							class="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							on:click={() => closeFullscreen()}
						>
							<X class="h-4 w-4" />
						</button>
					</div>
				</div>
				<div class="fullscreen-image-container">
					{#if originalScreenshot}
						<img 
							src={`data:image/png;base64,${originalScreenshot}`} 
							alt="Website screenshot - fullscreen view"
							class="fullscreen-image"
						/>
					{:else}
						<div class="no-screenshot-fullscreen">
							<EyeOff class="h-16 w-16 text-gray-400 mx-auto mb-4" />
							<p class="text-gray-500 text-lg">No screenshot available</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.interactive-audit-container {
		width: 100%;
	}

	.audit-visualization {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 24px;
		height: 800px;
		min-height: 800px;
		width: 100%;
		max-width: 100%;
	}

	.website-preview {
		position: relative;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		background: #f9fafb;
	}

	.screenshot-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.website-screenshot {
		width: 100%;
		height: 100%;
		object-fit: contain;
		object-position: top;
		min-height: 750px;
		max-height: 800px;
		max-width: 100%;
	}



	.no-screenshot {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.violation-sidebar {
		overflow-y: auto;
		overflow-x: hidden;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 24px;
		background: white;
		max-height: 800px;
		min-width: 0;
	}

	.sidebar-header {
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #e5e7eb;
	}

	.sidebar-header h3 {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 4px 0;
	}

	.violation-list {
		space-y: 8px;
	}

	.violation-item {
		display: flex;
		gap: 16px;
		padding: 16px;
		margin-bottom: 12px;
		border-radius: 8px;
		cursor: pointer;
		border-left: 4px solid;
		text-align: left;
		width: 100%;
		transition: all 0.2s ease;
		min-height: 80px;
	}

	.violation-item:hover {
		transform: translateX(2px);
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.violation-item.active {
		background: #eff6ff !important;
		border-left-color: #3b82f6 !important;
		transform: translateX(4px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
	}

	.violation-marker {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		margin-top: 6px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid currentColor;
		background: white;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.marker-number {
		font-size: 11px;
		font-weight: bold;
		color: currentColor;
	}

	.violation-content {
		flex: 1;
		min-width: 0;
		overflow-wrap: break-word;
		word-wrap: break-word;
	}

	.violation-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
		flex-wrap: wrap;
	}

	.violation-type {
		font-weight: 600;
		font-size: 16px;
	}

	.violation-location {
		font-size: 14px;
		color: #6b7280;
	}

	.violation-severity {
		font-size: 11px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 6px;
		text-transform: uppercase;
		display: inline-block;
	}

	.violation-severity.high {
		background: #fef2f2;
		color: #dc2626;
		border: 1px solid #fecaca;
	}

	.violation-severity.medium {
		background: #fffbeb;
		color: #d97706;
		border: 1px solid #fed7aa;
	}

	.violation-severity.low {
		background: #f0fdf4;
		color: #16a34a;
		border: 1px solid #bbf7d0;
	}

	.violation-severity.unknown {
		background: #f3f4f6;
		color: #6b7280;
		border: 1px solid #d1d5db;
	}

	.violation-suggestion {
		font-size: 15px;
		margin: 8px 0;
		line-height: 1.5;
		font-weight: 500;
	}

	.violation-details {
		font-size: 13px;
		background: rgba(255, 255, 255, 0.8);
		padding: 12px;
		border-radius: 6px;
		margin: 12px 0;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.violation-details p {
		margin: 4px 0;
		font-weight: 500;
	}

	.violation-fix {
		margin-top: 16px;
		padding: 16px;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 8px;
		border: 1px solid #e5e7eb;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.fix-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.css-fix-code {
		display: block;
		font-size: 12px;
		background: #f8f9fa;
		padding: 12px;
		border-radius: 6px;
		font-family: 'Courier New', monospace;
		overflow-x: auto;
		white-space: pre-wrap;
		word-break: break-all;
		border: 1px solid #e9ecef;
		max-width: 100%;
	}

	.action-buttons {
		display: flex;
		gap: 16px;
		margin-top: 32px;
		padding-top: 24px;
		border-top: 1px solid #e5e7eb;
	}

	.debug-info {
		margin-top: 20px;
		padding: 16px;
		background: #f9fafb;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
	}

	.debug-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		font-size: 14px;
	}

	/* Responsive design */
	@media (max-width: 1400px) {
		.audit-visualization {
			grid-template-columns: 1fr;
			height: auto;
			min-height: 600px;
		}
		
		.website-preview {
			height: 500px;
		}
		
		.violation-sidebar {
			max-height: 500px;
		}
	}

	@media (max-width: 768px) {
		.audit-visualization {
			gap: 20px;
		}
		
		.website-preview {
			height: 400px;
		}
		
		.violation-item {
			padding: 12px;
			margin-bottom: 8px;
		}
		
		.violation-type {
			font-size: 14px;
		}
		
	.violation-suggestion {
		font-size: 13px;
	}
}

/* Color comparison styles */
.color-comparison {
	background: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	padding: 12px;
	margin-bottom: 12px;
}

.color-comparison .flex {
	display: flex;
	align-items: flex-start;
	gap: 16px;
}

.color-comparison .flex-1 {
	flex: 1;
}

.color-comparison .text-sm {
	font-size: 14px;
	line-height: 1.25;
}

.color-comparison .font-medium {
	font-weight: 500;
}

.color-comparison .text-gray-700 {
	color: #374151;
}

.color-comparison .text-gray-500 {
	color: #6b7280;
}

.color-comparison .mb-2 {
	margin-bottom: 8px;
}

.color-comparison .flex-wrap {
	flex-wrap: wrap;
}

.color-comparison .gap-2 {
	gap: 8px;
}

	/* Fullscreen mode */
	.interactive-audit-container:global(.fullscreen) {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 50;
		background: white;
		padding: 20px;
	}

	.interactive-audit-container:global(.fullscreen) .audit-visualization {
		height: calc(100vh - 120px);
	}

	/* Fullscreen Modal Styles */
	.fullscreen-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.9);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		width: 100vw;
		height: 100vh;
	}

	.fullscreen-content {
		background: white;
		border-radius: 12px;
		max-width: 95vw;
		max-height: 95vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	}

	.fullscreen-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.fullscreen-header h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}

	.fullscreen-image-container {
		flex: 1;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		overflow: auto;
		background: #f3f4f6;
		padding: 20px;
		/* Custom scrollbar styling */
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 #f1f5f9;
	}

	.fullscreen-image-container::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.fullscreen-image-container::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 4px;
	}

	.fullscreen-image-container::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 4px;
	}

	.fullscreen-image-container::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}

	.fullscreen-image {
		max-width: 100%;
		height: auto;
		object-fit: contain;
		border-radius: 8px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.no-screenshot-fullscreen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px;
		text-align: center;
	}
</style>
