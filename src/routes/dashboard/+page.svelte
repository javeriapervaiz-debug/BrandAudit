<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { ArrowRight, Palette, Search, Sparkles, TrendingUp } from 'lucide-svelte';
</script>

<div class="max-w-6xl">
	<!-- Welcome Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold text-gray-900">Welcome back!</h1>
		<p class="text-gray-600">Ready to create amazing brand experiences? Let's get started.</p>
	</div>

	<!-- Quick Stats -->
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium text-gray-600">Brand Guidelines</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-gray-900">3</div>
				<p class="flex items-center text-xs text-gray-600">
					<TrendingUp class="mr-1 h-3 w-3 text-green-500" />
					+2 this month
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium text-gray-600">Audits Completed</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-gray-900">12</div>
				<p class="flex items-center text-xs text-gray-600">
					<TrendingUp class="mr-1 h-3 w-3 text-green-500" />
					+5 this week
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium text-gray-600">Creatives Generated</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-gray-900">47</div>
				<p class="flex items-center text-xs text-gray-600">
					<TrendingUp class="mr-1 h-3 w-3 text-green-500" />
					+15 this week
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Quick Actions -->
	<div class="mb-8">
		<h2 class="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- Brand Builder -->
			<Card class="cursor-pointer transition-shadow hover:shadow-md">
				<CardHeader>
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
						<Palette class="h-6 w-6 text-blue-600" />
					</div>
					<CardTitle class="text-lg">Create Brand Guidelines</CardTitle>
					<CardDescription>
						Generate comprehensive brand guidelines for your business
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button class="w-full" href="/dashboard/builder">
						Start Building
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<!-- Brand Audit -->
			<Card class="cursor-pointer transition-shadow hover:shadow-md">
				<CardHeader>
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
						<Search class="h-6 w-6 text-green-600" />
					</div>
					<CardTitle class="text-lg">Audit Website</CardTitle>
					<CardDescription>Analyze your website against brand guidelines</CardDescription>
				</CardHeader>
				<CardContent>
					<Button class="w-full" href="/dashboard/audit">
						Start Audit
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>

			<!-- Creative Generator -->
			<Card class="cursor-pointer transition-shadow hover:shadow-md">
				<CardHeader>
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
						<Sparkles class="h-6 w-6 text-purple-600" />
					</div>
					<CardTitle class="text-lg">Generate Creative</CardTitle>
					<CardDescription>Create branded social media and campaign content</CardDescription>
				</CardHeader>
				<CardContent>
					<Button class="w-full" href="/dashboard/creative">
						Create Content
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>
		</div>
	</div>

	<!-- Recent Activity -->
	<div>
		<h2 class="mb-4 text-xl font-semibold text-gray-900">Recent Activity</h2>
		<Card>
			<CardContent class="p-6">
				<div class="space-y-4">
					<div class="flex items-center space-x-4">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
							<Palette class="h-4 w-4 text-blue-600" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium text-gray-900">
								Brand guidelines created for "TechCorp"
							</p>
							<p class="text-xs text-gray-500">2 hours ago</p>
						</div>
					</div>

					<div class="flex items-center space-x-4">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
							<Search class="h-4 w-4 text-green-600" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium text-gray-900">
								Website audit completed for "example.com"
							</p>
							<p class="text-xs text-gray-500">5 hours ago</p>
						</div>
					</div>

					<div class="flex items-center space-x-4">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
							<Sparkles class="h-4 w-4 text-purple-600" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium text-gray-900">
								Instagram post generated for summer campaign
							</p>
							<p class="text-xs text-gray-500">1 day ago</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
