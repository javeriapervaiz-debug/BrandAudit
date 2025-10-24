<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Separator } from '$lib/components/ui/separator';
	import { Sparkles, Download, Instagram, Linkedin, Facebook, RefreshCw } from 'lucide-svelte';
	import { mockCreatives } from '$lib/data/mock-data';

	let campaignGoal = '';
	let selectedPlatform = '';
	let productHighlights = '';
	let targetAction = '';
	let showCreatives = false;
	let isGenerating = false;

	const platforms = [
		{ value: 'instagram', label: 'Instagram', icon: Instagram },
		{ value: 'facebook', label: 'Facebook', icon: Facebook },
		{ value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
		{ value: 'twitter', label: 'Twitter (X)' },
		{ value: 'tiktok', label: 'TikTok' },
		{ value: 'youtube', label: 'YouTube' }
	];

	const campaignTypes = [
		'Product Launch',
		'Brand Awareness',
		'Lead Generation',
		'Event Promotion',
		'Sale/Discount',
		'Educational Content',
		'User Generated Content',
		'Testimonial/Review'
	];

	const callsToAction = [
		'Shop Now',
		'Learn More',
		'Sign Up',
		'Download',
		'Contact Us',
		'Book Demo',
		'Get Started',
		'Join Now'
	];

	async function generateCreatives() {
		if (!campaignGoal.trim() || !selectedPlatform.trim()) return;

		isGenerating = true;
		// Simulate generation time
		setTimeout(() => {
			isGenerating = false;
			showCreatives = true;
		}, 3000);
	}

	function downloadCreative(creative: any, format: string) {
		alert(
			`Downloading ${creative.title} as ${format.toUpperCase()}. This will be implemented in the full version!`
		);
	}

	function regenerateCreative(creative: any) {
		alert(`Regenerating ${creative.title}. This will be implemented in the full version!`);
	}
</script>

<div class="max-w-6xl">
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold text-gray-900">Creative Generator</h1>
		<p class="text-gray-600">Create branded social media posts and campaign creatives with AI</p>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Form Section -->
		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Campaign Details</CardTitle>
					<CardDescription
						>Tell us about your campaign to generate targeted creatives</CardDescription
					>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="campaign-goal">Campaign Goal</Label>
						<select
							id="campaign-goal"
							bind:value={campaignGoal}
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Select campaign goal</option>
							{#each campaignTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<Label for="platform">Platform</Label>
						<select
							id="platform"
							bind:value={selectedPlatform}
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Select platform</option>
							{#each platforms as platform}
								<option value={platform.value}>{platform.label}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<Label for="product-highlights">Product/Service Highlights</Label>
						<Textarea
							id="product-highlights"
							bind:value={productHighlights}
							placeholder="Describe key features, benefits, or selling points..."
							rows={3}
						/>
					</div>

					<div class="space-y-2">
						<Label for="call-to-action">Call to Action</Label>
						<select
							id="call-to-action"
							bind:value={targetAction}
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Select call to action</option>
							{#each callsToAction as action}
								<option value={action}>{action}</option>
							{/each}
						</select>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Additional Options</CardTitle>
					<CardDescription>Customize your creative generation</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="custom-message">Custom Message (Optional)</Label>
						<Input id="custom-message" placeholder="Any specific message to include..." />
					</div>

					<div class="space-y-2">
						<Label for="variations">Creative Variations</Label>
						<select
							id="variations"
							value="3"
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="1">1 variation</option>
							<option value="3">3 variations</option>
							<option value="5">5 variations</option>
						</select>
					</div>

					<div class="space-y-2">
						<Label for="style">Style Preference</Label>
						<select
							id="style"
							value="brand-consistent"
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="brand-consistent">Brand Consistent</option>
							<option value="modern">Modern</option>
							<option value="minimalist">Minimalist</option>
							<option value="bold">Bold & Vibrant</option>
						</select>
					</div>
				</CardContent>
			</Card>

			<Button
				class="w-full"
				size="lg"
				onclick={generateCreatives}
				disabled={!campaignGoal.trim() || !selectedPlatform.trim() || isGenerating}
			>
				{#if isGenerating}
					<RefreshCw class="mr-2 h-4 w-4 animate-spin" />
					Generating Creatives...
				{:else}
					<Sparkles class="mr-2 h-4 w-4" />
					Generate Creatives
				{/if}
			</Button>
		</div>

		<!-- Results Section -->
		<div class="space-y-6">
			{#if isGenerating}
				<Card>
					<CardContent class="p-8 text-center">
						<RefreshCw class="mx-auto mb-4 h-16 w-16 animate-spin text-purple-600" />
						<h3 class="mb-2 text-lg font-medium text-gray-900">Creating Your Creatives</h3>
						<p class="text-gray-600">AI is crafting the perfect branded content...</p>
						<div class="mt-4 space-y-2 text-sm text-gray-500">
							<p>✓ Analyzing brand guidelines</p>
							<p>✓ Selecting optimal layouts</p>
							<p>⏳ Generating copy variations</p>
							<p>⏳ Applying brand colors & fonts</p>
						</div>
					</CardContent>
				</Card>
			{:else if showCreatives}
				<div class="space-y-6">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold text-gray-900">Generated Creatives</h2>
						<Button variant="outline" size="sm" onclick={generateCreatives}>
							<RefreshCw class="mr-2 h-4 w-4" />
							Regenerate
						</Button>
					</div>

					{#each mockCreatives as creative}
						<Card>
							<CardHeader>
								<CardTitle class="text-lg">{creative.title}</CardTitle>
								<CardDescription>
									{creative.platform} • {creative.dimensions}
								</CardDescription>
							</CardHeader>
							<CardContent class="space-y-4">
								<!-- Creative Preview -->
								<div class="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-6 text-center">
									<div
										class="mb-4 flex h-32 w-full items-center justify-center rounded-lg bg-white shadow-sm"
									>
										<div class="text-center">
											<div
												class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600"
											>
												<Sparkles class="h-6 w-6 text-white" />
											</div>
											<p class="text-sm font-medium text-gray-900">{campaignGoal || 'Campaign'}</p>
											<p class="text-xs text-gray-500">{selectedPlatform || 'Social'} Creative</p>
										</div>
									</div>
									<p class="text-sm text-gray-600">AI-generated creative preview</p>
								</div>

								<!-- Sample Copy -->
								<div class="rounded-lg bg-gray-50 p-4">
									<h4 class="mb-2 text-sm font-medium text-gray-900">Generated Copy:</h4>
									<p class="mb-3 text-sm text-gray-700">
										🚀 Ready to transform your {campaignGoal?.toLowerCase() || 'business'}?
										{productHighlights
											? `Our ${productHighlights.slice(0, 50)}...`
											: 'Discover amazing features that will revolutionize your workflow.'}
									</p>
									<p class="text-sm font-medium text-purple-600">
										{targetAction || 'Learn More'} 👆
									</p>
								</div>

								<Separator />

								<div class="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										class="flex-1"
										onclick={() => regenerateCreative(creative)}
									>
										<RefreshCw class="mr-2 h-3 w-3" />
										Regenerate
									</Button>
									<Button size="sm" onclick={() => downloadCreative(creative, 'png')}>
										<Download class="mr-2 h-3 w-3" />
										PNG
									</Button>
									<Button
										variant="outline"
										size="sm"
										onclick={() => downloadCreative(creative, 'svg')}
									>
										SVG
									</Button>
									{#if creative.type.includes('video') || creative.platform === 'TikTok'}
										<Button
											variant="outline"
											size="sm"
											onclick={() => downloadCreative(creative, 'mp4')}
										>
											MP4
										</Button>
									{/if}
								</div>
							</CardContent>
						</Card>
					{/each}

					<!-- Bulk Actions -->
					<Card>
						<CardContent class="p-4">
							<div class="flex items-center justify-between">
								<p class="text-sm text-gray-600">Export all creatives</p>
								<div class="flex gap-2">
									<Button variant="outline" size="sm">
										<Download class="mr-2 h-3 w-3" />
										Download ZIP
									</Button>
									<Button size="sm">
										<Download class="mr-2 h-3 w-3" />
										Export Package
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			{:else}
				<Card class="flex h-96 items-center justify-center">
					<div class="text-center text-gray-500">
						<Sparkles class="mx-auto mb-4 h-16 w-16 opacity-50" />
						<p class="mb-2 text-lg font-medium">Creative Previews</p>
						<p class="text-sm">Fill out the campaign details to generate branded creatives</p>
					</div>
				</Card>
			{/if}
		</div>
	</div>
</div>
