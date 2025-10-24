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
	import { Separator } from '$lib/components/ui/separator';
	import { Eye, EyeOff, ArrowRight } from 'lucide-svelte';

	let isLogin = true;
	let email = '';
	let password = '';
	let confirmPassword = '';
	let fullName = '';
	let showPassword = false;
	let showConfirmPassword = false;

	function toggleMode() {
		isLogin = !isLogin;
		// Clear form when switching modes
		email = '';
		password = '';
		confirmPassword = '';
		fullName = '';
	}

	function handleSubmit() {
		if (isLogin) {
			alert('Login functionality will be implemented with Auth.js in the full version!');
		} else {
			alert('Signup functionality will be implemented with Auth.js in the full version!');
		}
	}

	function handleSocialLogin(provider: string) {
		alert(`${provider} login will be implemented with Auth.js in the full version!`);
	}
</script>

<svelte:head>
	<title>{isLogin ? 'Login' : 'Sign Up'} - EternaBrand</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
>
	<div class="w-full max-w-md">
		<!-- Logo/Brand -->
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold text-gray-900">EternaBrand</h1>
			<p class="text-gray-600">AI Brand Guideline Assistant</p>
		</div>

		<Card>
			<CardHeader class="text-center">
				<CardTitle class="text-2xl">
					{isLogin ? 'Welcome back' : 'Create your account'}
				</CardTitle>
				<CardDescription>
					{isLogin
						? 'Sign in to your EternaBrand account'
						: 'Join thousands of brands using AI to build better guidelines'}
				</CardDescription>
			</CardHeader>

			<CardContent class="space-y-6">
				<!-- Social Login -->
				<div class="grid grid-cols-2 gap-4">
					<Button variant="outline" class="w-full" onclick={() => handleSocialLogin('Google')}>
						<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="currentColor"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="currentColor"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="currentColor"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Google
					</Button>

					<Button variant="outline" class="w-full" onclick={() => handleSocialLogin('GitHub')}>
						<svg class="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
						GitHub
					</Button>
				</div>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<Separator />
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-white px-2 text-gray-500">Or continue with email</span>
					</div>
				</div>

				<!-- Form -->
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					class="space-y-4"
				>
					{#if !isLogin}
						<div class="space-y-2">
							<Label for="full-name">Full Name</Label>
							<Input
								id="full-name"
								bind:value={fullName}
								placeholder="Enter your full name"
								required
							/>
						</div>
					{/if}

					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							bind:value={email}
							placeholder="Enter your email"
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="password">Password</Label>
						<div class="relative">
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="Enter your password"
								required
								class="pr-10"
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center pr-3"
								onclick={() => (showPassword = !showPassword)}
							>
								{#if showPassword}
									<EyeOff class="h-4 w-4 text-gray-400" />
								{:else}
									<Eye class="h-4 w-4 text-gray-400" />
								{/if}
							</button>
						</div>
					</div>

					{#if !isLogin}
						<div class="space-y-2">
							<Label for="confirm-password">Confirm Password</Label>
							<div class="relative">
								<Input
									id="confirm-password"
									type={showConfirmPassword ? 'text' : 'password'}
									bind:value={confirmPassword}
									placeholder="Confirm your password"
									required
									class="pr-10"
								/>
								<button
									type="button"
									class="absolute inset-y-0 right-0 flex items-center pr-3"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
								>
									{#if showConfirmPassword}
										<EyeOff class="h-4 w-4 text-gray-400" />
									{:else}
										<Eye class="h-4 w-4 text-gray-400" />
									{/if}
								</button>
							</div>
						</div>
					{/if}

					{#if isLogin}
						<div class="flex items-center justify-between">
							<label class="flex items-center space-x-2">
								<input type="checkbox" class="rounded" />
								<span class="text-sm text-gray-600">Remember me</span>
							</label>
							<button type="button" class="text-sm text-blue-600 hover:underline">
								Forgot password?
							</button>
						</div>
					{/if}

					<Button type="submit" class="w-full" size="lg">
						{isLogin ? 'Sign In' : 'Create Account'}
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</form>

				<!-- Toggle Mode -->
				<div class="text-center">
					<p class="text-sm text-gray-600">
						{isLogin ? "Don't have an account?" : 'Already have an account?'}
						<button
							type="button"
							class="font-medium text-blue-600 hover:underline"
							onclick={toggleMode}
						>
							{isLogin ? 'Sign up' : 'Sign in'}
						</button>
					</p>
				</div>

				{#if !isLogin}
					<p class="text-center text-xs text-gray-500">
						By creating an account, you agree to our
						<button type="button" class="text-blue-600 hover:underline">Terms of Service</button>
						and
						<button type="button" class="text-blue-600 hover:underline">Privacy Policy</button>
					</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Back to Home -->
		<div class="mt-6 text-center">
			<Button variant="ghost" href="/">← Back to Home</Button>
		</div>
	</div>
</div>
