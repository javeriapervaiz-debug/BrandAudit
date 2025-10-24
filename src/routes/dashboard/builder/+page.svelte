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
	import { Upload, Download, Eye, Palette, Type, MessageCircle } from 'lucide-svelte';
	import {
		mockBrandGuidelines,
		mockIndustries,
		mockMoodOptions,
		mockTargetAudiences
	} from '$lib/data/mock-data';

	let brandName = '';
	let brandValues = '';
	let selectedIndustry = '';
	let selectedMood = '';
	let selectedAudience = '';
	let logoFile: File | null = null;
	let showGuidelines = false;
	

	function handleLogoUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			logoFile = target.files[0];
		}
	}

	function generateGuidelines() {
		if (brandName.trim()) {
			showGuidelines = true;
		}
	}

	function exportGuidelines() {
		alert('Export functionality will be implemented in the full version!');
	}



</script>

<div class="max-w-6xl">
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold text-gray-900">Brand Builder</h1>
		<p class="text-gray-600">Create comprehensive brand guidelines with AI assistance</p>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Form Section -->
		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Brand Information</CardTitle>
					<CardDescription
						>Tell us about your brand to generate personalized guidelines</CardDescription
					>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="brand-name">Brand Name *</Label>
						<Input id="brand-name" bind:value={brandName} placeholder="Enter your brand name" />
					</div>

					<div class="space-y-2">
						<Label for="brand-values">Brand Values & Mission</Label>
						<Textarea
							id="brand-values"
							bind:value={brandValues}
							placeholder="Describe your brand's core values and mission..."
							rows={3}
						/>
					</div>

					<div class="space-y-2">
						<Label for="industry">Industry</Label>
						<select
							id="industry"
							bind:value={selectedIndustry}
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Select your industry</option>
							{#each mockIndustries as industry}
								<option value={industry}>{industry}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<Label for="mood">Brand Mood</Label>
						<select
							id="mood"
							bind:value={selectedMood}
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Select brand mood</option>
							{#each mockMoodOptions as mood}
								<option value={mood}>{mood}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<Label for="audience">Target Audience</Label>
						<select
							id="audience"
							bind:value={selectedAudience}
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Select target audience</option>
							{#each mockTargetAudiences as audience}
								<option value={audience}>{audience}</option>
							{/each}
						</select>
					</div>
				</CardContent>
			</Card>


			<Card>
				<CardHeader>
					<CardTitle>Logo</CardTitle>
					<CardDescription>Upload existing logo or let AI generate one for you</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
						<Upload class="mx-auto mb-4 h-12 w-12 text-gray-400" />
						<div class="space-y-2">
							<p class="text-sm font-medium text-gray-900">Upload your logo</p>
							<p class="text-xs text-gray-500">PNG, JPG, SVG up to 5MB</p>
						</div>
						<input
							type="file"
							class="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
							accept="image/*"
							onchange={handleLogoUpload}
						/>
					</div>

					<div class="text-center">
						<p class="mb-2 text-sm text-gray-500">or</p>
						<Button variant="outline" class="w-full">Generate Logo with AI</Button>
					</div>
				</CardContent>
			</Card>

			<Button class="w-full" size="lg" onclick={generateGuidelines} disabled={!brandName.trim()}>
				Generate Brand Guidelines
			</Button>
		</div>

		<!-- Preview Section -->
		<div class="space-y-6">
			{#if showGuidelines}
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<Eye class="h-5 w-5" />
							Brand Guidelines Preview
						</CardTitle>
						<CardDescription>Your generated brand guidelines for {brandName}</CardDescription>
					</CardHeader>
					<CardContent class="space-y-6">
						<!-- Logo Section -->
						<div>
							<h3 class="mb-3 flex items-center gap-2 font-semibold text-gray-900">
								<Palette class="h-4 w-4" />
								Logo
							</h3>
							<div class="rounded-lg bg-gray-50 p-6 text-center">
								<div
									class="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-lg bg-blue-600"
								>
									<span class="text-lg font-bold text-white"
										>{brandName.charAt(0).toUpperCase()}</span
									>
								</div>
								<p class="text-sm text-gray-600">Logo placeholder for {brandName}</p>
							</div>
						</div>

						<!-- Color Palette -->
						<div>
							<h3 class="mb-3 flex items-center gap-2 font-semibold text-gray-900">
								<Palette class="h-4 w-4" />
								Color Palette
							</h3>
							<div class="grid grid-cols-3 gap-3">
								{#each Object.entries(mockBrandGuidelines.colors) as [name, color]}
									<div class="text-center">
										<div
											class="mb-2 h-12 w-full rounded-lg"
											style="background-color: {color}"
										></div>
										<p class="text-xs font-medium text-gray-900 capitalize">{name}</p>
										<p class="text-xs text-gray-500">{color}</p>
									</div>
								{/each}
							</div>
						</div>

						<!-- Typography -->
						<div>
							<h3 class="mb-3 flex items-center gap-2 font-semibold text-gray-900">
								<Type class="h-4 w-4" />
								Typography
							</h3>
							<div class="space-y-3">
								<div>
									<p
										class="text-2xl font-bold"
										style="font-family: {mockBrandGuidelines.typography.headingFont}"
									>
										Heading Font - {mockBrandGuidelines.typography.headingFont}
									</p>
								</div>
								<div>
									<p
										class="text-base"
										style="font-family: {mockBrandGuidelines.typography.bodyFont}"
									>
										Body Font - {mockBrandGuidelines.typography.bodyFont}
									</p>
								</div>
							</div>
						</div>

						<!-- Tone of Voice -->
						<div>
							<h3 class="mb-3 flex items-center gap-2 font-semibold text-gray-900">
								<MessageCircle class="h-4 w-4" />
								Tone of Voice
							</h3>
							<div class="space-y-3">
								<div>
									<p class="mb-1 text-sm font-medium text-gray-700">Personality</p>
									<div class="flex flex-wrap gap-2">
										{#each mockBrandGuidelines.toneOfVoice.personality as trait}
											<span class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
												{trait}
											</span>
										{/each}
									</div>
								</div>
								<div>
									<p class="mb-1 text-sm font-medium text-gray-700">Do Use</p>
									<p class="text-sm text-gray-600">
										{mockBrandGuidelines.toneOfVoice.doWords.join(', ')}
									</p>
								</div>
								<div>
									<p class="mb-1 text-sm font-medium text-gray-700">Avoid</p>
									<p class="text-sm text-gray-600">
										{mockBrandGuidelines.toneOfVoice.avoidWords.join(', ')}
									</p>
								</div>
							</div>
						</div>

						<Separator />

						<div class="flex gap-3">
							<Button class="flex-1" onclick={exportGuidelines}>
								<Download class="mr-2 h-4 w-4" />
								Export PDF
							</Button>
							<Button variant="outline" class="flex-1" onclick={exportGuidelines}>
								Export Text
							</Button>
						</div>
					</CardContent>
				</Card>
			{:else}
				<Card class="flex h-96 items-center justify-center">
					<div class="text-center text-gray-500">
						<Palette class="mx-auto mb-4 h-16 w-16 opacity-50" />
						<p class="mb-2 text-lg font-medium">Brand Guidelines Preview</p>
						<p class="text-sm">
							Fill out the form and click "Generate" to see your brand guidelines
						</p>
					</div>
				</Card>
			{/if}
		</div>
	</div>
</div>
