<!-- Interactive Audit Report Component with Visual Highlights -->
<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { AlertTriangle, Eye, EyeOff, Download, Copy, Check } from 'lucide-svelte';

	export let auditData: any;
	export let originalScreenshot: string | null;
	export let highlightedScreenshot: string | null;
	export let legendImage: string | null;

	let currentView: 'original' | 'highlighted' = 'highlighted';
	let activeViolationIndex: number | null = null;
	let copiedViolation: string | null = null;
	let overlayData: any = null;
	let isFullscreen: boolean = false;
	let showDebugInfo: boolean = false;

	// Check if highlighted screenshot is base64 image or JSON overlay data
	let isBase64Image = false;
	let violationPositions = [];
	
	$: if (highlightedScreenshot) {
		isBase64Image = highlightedScreenshot.startsWith('data:image/');
		console.log('Highlighted screenshot type:', isBase64Image ? 'Base64 Image' : 'JSON Overlay');
		
		if (!isBase64Image) {
			// Try to parse as JSON overlay data
			try {
				overlayData = JSON.parse(highlightedScreenshot);
				violationPositions = overlayData?.violations || [];
			} catch (e) {
				console.warn('Could not parse overlay data:', e);
				overlayData = null;
				violationPositions = [];
			}
		} else {
			overlayData = null;
			// For base64 images, we need to create position data from the violations
			violationPositions = auditData?.violations?.map((violation, index) => ({
				id: index,
				severity: violation.severity,
				elementType: violation.elementType,
				location: violation.location,
				elementText: violation.elementText,
				position: {
					top: 50 + (index * 40),
					left: 50 + (index * 20),
					width: 200,
					height: 30
				}
			})) || [];
		}
	}

	// Function to handle clicking on a violation in the list
	function focusViolation(index: number) {
		activeViolationIndex = activeViolationIndex === index ? null : index;
	}

	// Function to copy CSS fix to clipboard
	async function copyCSSFix(violation: any) {
		const cssFix = generateCSSFix(violation);
		try {
			await navigator.clipboard.writeText(cssFix);
			copiedViolation = violation.elementType;
			setTimeout(() => {
				copiedViolation = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy CSS fix:', err);
		}
	}

	// Generate CSS fix for a violation
	function generateCSSFix(violation: any) {
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

	// Get severity color classes
	function getSeverityColor(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical': return 'bg-red-100 border-red-500 text-red-800';
			case 'high': return 'bg-red-50 border-red-400 text-red-700';
			case 'medium': return 'bg-orange-50 border-orange-400 text-orange-700';
			case 'low': return 'bg-blue-50 border-blue-400 text-blue-700';
			default: return 'bg-gray-50 border-gray-400 text-gray-700';
		}
	}

	// Get severity icon
	function getSeverityIcon(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical': return 'h-4 w-4 text-red-600';
			case 'high': return 'h-4 w-4 text-red-500';
			case 'medium': return 'h-4 w-4 text-orange-500';
			case 'low': return 'h-4 w-4 text-blue-500';
			default: return 'h-4 w-4 text-gray-500';
		}
	}

	// Get legend color for severity
	function getLegendColor(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical': return 'bg-red-600';
			case 'high': return 'bg-red-500';
			case 'medium': return 'bg-orange-500';
			case 'low': return 'bg-blue-500';
			default: return 'bg-gray-500';
		}
	}

	// Get highlight border color for severity
	function getHighlightColor(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical': return 'border-red-600';
			case 'high': return 'border-red-500';
			case 'medium': return 'border-orange-500';
			case 'low': return 'border-blue-500';
			default: return 'border-gray-500';
		}
	}

	// Get highlight text color for severity
	function getHighlightTextColor(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical': return 'text-red-600';
			case 'high': return 'text-red-500';
			case 'medium': return 'text-orange-500';
			case 'low': return 'text-blue-500';
			default: return 'text-gray-500';
		}
	}

	// Get highlight background color for severity
	function getHighlightBackgroundColor(severity: string) {
		switch (severity?.toLowerCase()) {
			case 'critical': return 'bg-red-500';
			case 'high': return 'bg-red-500';
			case 'medium': return 'bg-orange-500';
			case 'low': return 'bg-blue-500';
			default: return 'bg-gray-500';
		}
	}
</script>

<div class="space-y-6">
	<!-- Score Header -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center justify-between">
				<span>Brand Audit Results</span>
				<div class="flex items-center gap-2">
					<span class="text-3xl font-bold text-blue-600">
						{auditData?.score || 0}
					</span>
					<span class="text-sm text-gray-500">/100</span>
				</div>
			</CardTitle>
			<CardDescription>
				{auditData?.summary?.overallCompliance || 'N/A'}
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div class="text-center">
					<div class="text-2xl font-bold text-red-600">{auditData?.severityBreakdown?.critical || 0}</div>
					<div class="text-sm text-gray-600">Critical</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-red-500">{auditData?.severityBreakdown?.high || 0}</div>
					<div class="text-sm text-gray-600">High</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-orange-500">{auditData?.severityBreakdown?.medium || 0}</div>
					<div class="text-sm text-gray-600">Medium</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-blue-500">{auditData?.severityBreakdown?.low || 0}</div>
					<div class="text-sm text-gray-600">Low</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Screenshot Viewer -->
	{#if originalScreenshot || highlightedScreenshot}
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center justify-between">
					<span>Visual Analysis</span>
					<div class="flex gap-2">
						{#if !isBase64Image}
							<Button
								variant={currentView === 'original' ? 'default' : 'outline'}
								size="sm"
								onclick={() => currentView = 'original'}
							>
								<Eye class="h-4 w-4 mr-1" />
								Original
							</Button>
							<Button
								variant={currentView === 'highlighted' ? 'default' : 'outline'}
								size="sm"
								onclick={() => currentView = 'highlighted'}
							>
								<EyeOff class="h-4 w-4 mr-1" />
								With Highlights
							</Button>
						{:else}
							<span class="text-sm text-gray-600">Highlights are drawn directly on the image</span>
						{/if}
						<Button
							variant="outline"
							size="sm"
							onclick={() => isFullscreen = !isFullscreen}
						>
							<Download class="h-4 w-4 mr-1" />
							{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => showDebugInfo = !showDebugInfo}
						>
							Debug
						</Button>
					</div>
				</CardTitle>
				<CardDescription>
					{currentView === 'highlighted' ? 'Issues are highlighted with colored borders' : 'Original website screenshot'}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<!-- Screenshot Container -->
					<div class="border rounded-lg overflow-hidden bg-gray-50 relative {isFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}">
					<img 
						src={isBase64Image ? highlightedScreenshot : (overlayData?.originalScreenshot || `data:image/png;base64,${originalScreenshot}`)} 
						alt="Website screenshot with brand audit highlights" 
						class="w-full h-auto {isFullscreen ? 'max-h-[calc(100vh-8rem)]' : 'max-h-[600px]'} object-contain"
					/>
						
						<!-- Highlight overlays (unified for both base64 images and JSON overlay data) -->
						{#if currentView === 'highlighted' && violationPositions.length > 0}
							{#each violationPositions as highlight, index}
								<div 
									class="absolute border-3 rounded-lg pointer-events-none transition-all duration-200 {getHighlightColor(highlight.severity)} {activeViolationIndex === index ? 'ring-4 ring-blue-400' : ''}"
									style="
										top: {highlight.position?.top || 0}px;
										left: {highlight.position?.left || 0}px;
										width: {highlight.position?.width || 200}px;
										height: {highlight.position?.height || 30}px;
										box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
									"
								>
									<div class="absolute -top-8 -left-2 bg-white text-xs px-2 py-1 rounded font-bold shadow-md {getHighlightTextColor(highlight.severity)}">
										{index + 1}
									</div>
									<!-- Add a subtle background to make the highlight more visible -->
									<div class="absolute inset-0 {getHighlightBackgroundColor(highlight.severity)} opacity-10 rounded-lg"></div>
								</div>
							{/each}
						{/if}
						
						<!-- Fullscreen overlay -->
						{#if isFullscreen}
							<div class="absolute top-4 right-4">
								<Button
									variant="outline"
									size="sm"
									onclick={() => isFullscreen = false}
									class="bg-white/90 hover:bg-white"
								>
									<Download class="h-4 w-4 mr-1" />
									Exit Fullscreen
								</Button>
							</div>
						{/if}
					</div>

					<!-- Debug Information -->
					{#if showDebugInfo}
						<div class="bg-gray-100 p-4 rounded-lg text-xs">
							<h4 class="font-bold mb-2">Debug Information</h4>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<strong>Page Metrics:</strong>
									<pre>{JSON.stringify(overlayData?.pageMetrics || {}, null, 2)}</pre>
								</div>
								<div>
									<strong>Screenshot Dimensions:</strong>
									<pre>{JSON.stringify(overlayData?.screenshotDimensions || {}, null, 2)}</pre>
								</div>
							</div>
							<div class="mt-2">
								<strong>Violation Positions ({violationPositions.length}):</strong>
								{#each violationPositions as violation, index}
									<div class="mt-1 p-2 bg-white rounded border">
										<strong>#{index + 1} {violation.elementType}</strong> - {violation.severity}
										<br>Position: {JSON.stringify(violation.position)}
										<br>Text: {violation.elementText?.substring(0, 30) || 'N/A'}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Legend -->
					{#if currentView === 'highlighted' && legendImage}
						<div class="flex items-center justify-center">
							<img src={legendImage} alt="Severity legend" class="h-16" />
						</div>
					{:else if currentView === 'highlighted'}
						<div class="flex items-center justify-center gap-6 text-sm">
							<div class="flex items-center gap-2">
								<div class="w-4 h-4 bg-red-600 rounded"></div>
								<span>Critical ({violationPositions.filter(v => v.severity === 'critical').length})</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="w-4 h-4 bg-red-500 rounded"></div>
								<span>High ({violationPositions.filter(v => v.severity === 'high').length})</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="w-4 h-4 bg-orange-500 rounded"></div>
								<span>Medium ({violationPositions.filter(v => v.severity === 'medium').length})</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="w-4 h-4 bg-yellow-500 rounded"></div>
								<span>Low ({violationPositions.filter(v => v.severity === 'low').length})</span>
							</div>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Violations List -->
	{#if auditData?.violations && auditData.violations.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>Issues Found ({auditData.violations.length})</CardTitle>
				<CardDescription>
					Click on any issue to highlight it. Each issue includes a one-click CSS fix.
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				{#each auditData.violations as violation, index}
					<button 
						type="button"
						class="w-full text-left rounded-lg border p-4 transition-all duration-200 cursor-pointer hover:shadow-md {getSeverityColor(violation.severity)} {activeViolationIndex === index ? 'ring-2 ring-blue-500' : ''}"
						onclick={() => focusViolation(index)}
					>
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-2 mb-2">
									<AlertTriangle class={getSeverityIcon(violation.severity)} />
									<span class="px-2 py-1 text-xs font-medium rounded border {getSeverityColor(violation.severity)}">
										{violation.severity?.toUpperCase() || 'UNKNOWN'}
									</span>
									<span class="font-medium text-sm">
										{violation.elementType} • {violation.location}
									</span>
								</div>
								
								<p class="text-sm mb-2 font-medium">{violation.suggestion}</p>
								
								<div class="text-xs space-y-1 bg-white/50 p-2 rounded">
									<p><strong>Found:</strong> {violation.found}</p>
									<p><strong>Expected:</strong> {violation.expected}</p>
								</div>

								{#if activeViolationIndex === index}
									<div class="mt-3 p-3 bg-white/70 rounded border">
										<div class="flex items-center justify-between mb-2">
											<span class="text-sm font-medium">CSS Fix:</span>
											<Button
												size="sm"
												variant="outline"
												onclick={(e) => {
													e.stopPropagation();
													copyCSSFix(violation);
												}}
											>
												{#if copiedViolation === violation.elementType}
													<Check class="h-3 w-3 mr-1" />
													Copied!
												{:else}
													<Copy class="h-3 w-3 mr-1" />
													Copy CSS
												{/if}
											</Button>
										</div>
										<code class="text-xs bg-gray-100 p-2 rounded block font-mono">
											{generateCSSFix(violation)}
										</code>
									</div>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</CardContent>
		</Card>
	{:else}
		<Card>
			<CardContent class="text-center py-8">
				<div class="text-green-600 mb-2">
					<svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-1">No Issues Found!</h3>
				<p class="text-gray-600">Your website is fully compliant with the brand guidelines.</p>
			</CardContent>
		</Card>
	{/if}
</div>

<style>
	/* Additional custom styles if needed */
	.cursor-pointer {
		cursor: pointer;
	}
</style>
