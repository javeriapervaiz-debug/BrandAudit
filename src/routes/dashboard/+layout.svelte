<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Home, Palette, Search, Sparkles, User, Settings, LogOut } from 'lucide-svelte';

	let { children } = $props();

	const navItems = [
		{ href: '/dashboard', icon: Home, label: 'Dashboard', exact: true },
		{ href: '/dashboard/builder', icon: Palette, label: 'Builder' },
		{ href: '/dashboard/audit', icon: Search, label: 'Audit' },
		{ href: '/dashboard/creative', icon: Sparkles, label: 'Creative' }
	];

	function isActive(href: string, exact = false) {
		if (exact) {
			return $page.url.pathname === href;
		}
		return $page.url.pathname.startsWith(href);
	}
</script>

<div class="flex h-screen bg-gray-50">
	<!-- Sidebar -->
	<aside class="flex w-64 flex-col border-r border-gray-200 bg-white">
		<!-- Logo -->
		<div class="border-b border-gray-200 p-6">
			<h1 class="text-xl font-bold text-gray-900">EternaBrand</h1>
			<p class="text-sm text-gray-500">AI Brand Assistant</p>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 p-4">
			<ul class="space-y-2">
				{#each navItems as item (item.href)}
					{@const Icon = item.icon}
					<li>
						<a
							href={item.href}
							class="flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors {isActive(
								item.href,
								item.exact
							)
								? 'bg-blue-100 text-blue-700'
								: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
						>
							<Icon class="mr-3 h-5 w-5" />
							{item.label}
						</a>
					</li>
				{/each}
			</ul>

			<Separator class="my-4" />

			<!-- User Section -->
			<div class="space-y-2">
				<Button variant="ghost" class="w-full justify-start" size="sm">
					<User class="mr-3 h-5 w-5" />
					Profile
				</Button>
				<Button variant="ghost" class="w-full justify-start" size="sm">
					<Settings class="mr-3 h-5 w-5" />
					Settings
				</Button>
				<Button variant="ghost" class="w-full justify-start" size="sm">
					<LogOut class="mr-3 h-5 w-5" />
					Sign Out
				</Button>
			</div>
		</nav>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 overflow-auto">
		<div class="p-8">
			{@render children?.()}
		</div>
	</main>
</div>
