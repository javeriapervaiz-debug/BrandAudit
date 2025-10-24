<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { ArrowRight, Palette, Search, Sparkles } from 'lucide-svelte';
</script>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
	<div class="container mx-auto px-4 text-center">
		<h1 class="mb-4 text-5xl font-bold text-gray-900">EternaBrand</h1>
		<p class="mb-6 text-2xl font-medium text-blue-600">AI Brand Guideline Assistant</p>
		<p class="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
			Generate complete brand guidelines, audit existing assets, and create stunning branded content
			with the power of AI
		</p>
		<div class="flex justify-center gap-4">
			<Button size="lg" class="px-8" href="/dashboard">
				Start Free Trial
				<ArrowRight class="ml-2 h-5 w-5" />
			</Button>
			<Button variant="outline" size="lg" href="/auth">Login</Button>
		</div>
	</div>
</section>

<!-- Features Overview -->
<section class="py-20">
	<div class="container mx-auto px-4">
		<div class="mb-16 text-center">
			<h2 class="mb-4 text-3xl font-bold text-gray-900">
				Everything you need to build a consistent brand
			</h2>
			<p class="mx-auto max-w-2xl text-lg text-gray-600">
				From brand guidelines to creative assets, EternaBrand helps you maintain brand consistency
				across all touchpoints
			</p>
		</div>

		<div class="grid gap-8 md:grid-cols-3">
			<!-- Brand Builder -->
			<Card class="text-center">
				<CardHeader>
					<div
						class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100"
					>
						<Palette class="h-6 w-6 text-blue-600" />
					</div>
					<CardTitle>Brand Builder</CardTitle>
					<CardDescription>
						Generate complete brand guidelines including logos, colors, typography, and tone of
						voice
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ul class="space-y-2 text-sm text-gray-600">
						<li>• Logo generation & guidelines</li>
						<li>• Color palette creation</li>
						<li>• Typography recommendations</li>
						<li>• Tone of voice definition</li>
					</ul>
				</CardContent>
			</Card>

			<!-- Brand Audit -->
			<Card class="text-center">
				<CardHeader>
					<div
						class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100"
					>
						<Search class="h-6 w-6 text-green-600" />
					</div>
					<CardTitle>Brand Audit</CardTitle>
					<CardDescription>
						Analyze existing websites and assets against your brand guidelines
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ul class="space-y-2 text-sm text-gray-600">
						<li>• Website compliance check</li>
						<li>• Asset consistency analysis</li>
						<li>• Automated fix suggestions</li>
						<li>• Before/after previews</li>
					</ul>
				</CardContent>
			</Card>

			<!-- Creative Generator -->
			<Card class="text-center">
				<CardHeader>
					<div
						class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100"
					>
						<Sparkles class="h-6 w-6 text-purple-600" />
					</div>
					<CardTitle>Creative Generator</CardTitle>
					<CardDescription>
						Create branded social media posts and campaign creatives instantly
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ul class="space-y-2 text-sm text-gray-600">
						<li>• Social media templates</li>
						<li>• Campaign creatives</li>
						<li>• Multi-platform formats</li>
						<li>• Brand-consistent designs</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="bg-gray-50 py-20">
	<div class="container mx-auto px-4 text-center">
		<h2 class="mb-4 text-3xl font-bold text-gray-900">Ready to build your brand?</h2>
		<p class="mx-auto mb-8 max-w-xl text-lg text-gray-600">
			Join thousands of businesses using EternaBrand to create consistent, professional brand
			experiences
		</p>
		<Button size="lg" class="px-8" href="/dashboard">
			Get Started for Free
			<ArrowRight class="ml-2 h-5 w-5" />
		</Button>
	</div>
</section>
