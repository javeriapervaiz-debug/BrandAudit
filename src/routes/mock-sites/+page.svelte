<script>
	import { onMount } from 'svelte';
	
	let mockSites = [
		{
			name: 'GitHub Mock',
			description: '80% compliant with GitHub brand guidelines',
			url: '/mock-github',
			color: '#24292e',
			violations: [
				'Wrong font family (Arial instead of SF Pro Text)',
				'Wrong primary button color (#238636 instead of #0366d6)',
				'Incorrect gradient colors'
			]
		},
		{
			name: 'Apple Mock',
			description: '80% compliant with Apple brand guidelines',
			url: '/mock-apple',
			color: '#007AFF',
			violations: [
				'Wrong font family (Helvetica instead of SF Pro Display)',
				'Wrong primary button color (#0071e3 instead of #007AFF)',
				'Incorrect gradient colors'
			]
		},
		{
			name: 'Buffer Mock',
			description: '80% compliant with Buffer brand guidelines',
			url: '/mock-buffer',
			color: '#5c8ac0',
			violations: [
				'Wrong font family (Arial instead of Roboto)',
				'Wrong primary button color (#d85629 instead of #5c8ac0)',
				'Incorrect logo color shade'
			]
		}
	];
	
	function testSite(site) {
		// Open the mock site in a new tab
		window.open(site.url, '_blank');
	}
	
	function auditSite(site) {
		// Open the audit page with the mock site URL
		const auditUrl = `/dashboard/audit?url=${encodeURIComponent(site.url)}`;
		window.open(auditUrl, '_blank');
	}
</script>

<svelte:head>
	<title>Mock Websites for Testing - Brand Guideline Auditor</title>
</svelte:head>

<div class="container">
	<header class="header">
		<h1>Mock Websites for Testing</h1>
		<p>These mock websites are designed to be 80% compliant with their respective brand guidelines, with intentional violations for testing purposes.</p>
	</header>
	
	<div class="sites-grid">
		{#each mockSites as site}
			<div class="site-card" style="border-left-color: {site.color}">
				<div class="site-header">
					<h2>{site.name}</h2>
					<p>{site.description}</p>
				</div>
				
				<div class="violations">
					<h3>Intentional Violations:</h3>
					<ul>
						{#each site.violations as violation}
							<li>{violation}</li>
						{/each}
					</ul>
				</div>
				
				<div class="actions">
					<button class="btn btn-secondary" on:click={() => testSite(site)}>
						View Mock Site
					</button>
					<button class="btn btn-primary" on:click={() => auditSite(site)}>
						Run Brand Audit
					</button>
				</div>
			</div>
		{/each}
	</div>
	
	<div class="instructions">
		<h2>How to Test</h2>
		<ol>
			<li><strong>View Mock Site:</strong> Click to see the mock website with intentional brand violations</li>
			<li><strong>Run Brand Audit:</strong> Click to audit the mock site against its brand guidelines</li>
			<li><strong>Expected Results:</strong> Each mock site should score around 60-80/100, detecting the intentional violations</li>
		</ol>
		
		<div class="note">
			<strong>Note:</strong> These mock websites are designed to test the brand audit system's ability to detect subtle violations while still being mostly compliant with their respective brand guidelines.
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 40px 20px;
	}
	
	.header {
		text-align: center;
		margin-bottom: 60px;
	}
	
	.header h1 {
		font-size: 48px;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 16px;
	}
	
	.header p {
		font-size: 18px;
		color: #666;
		max-width: 600px;
		margin: 0 auto;
	}
	
	.sites-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 30px;
		margin-bottom: 60px;
	}
	
	.site-card {
		background: white;
		border: 1px solid #e1e5e9;
		border-left: 4px solid #007AFF;
		border-radius: 8px;
		padding: 30px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease;
	}
	
	.site-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	}
	
	.site-header h2 {
		font-size: 24px;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 8px;
	}
	
	.site-header p {
		color: #666;
		margin-bottom: 20px;
	}
	
	.violations {
		margin-bottom: 24px;
	}
	
	.violations h3 {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 12px;
	}
	
	.violations ul {
		list-style: none;
		padding: 0;
	}
	
	.violations li {
		font-size: 14px;
		color: #666;
		margin-bottom: 6px;
		padding-left: 16px;
		position: relative;
	}
	
	.violations li::before {
		content: "⚠️";
		position: absolute;
		left: 0;
		top: 0;
	}
	
	.actions {
		display: flex;
		gap: 12px;
	}
	
	.btn {
		padding: 12px 24px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		flex: 1;
		text-align: center;
	}
	
	.btn-primary {
		background-color: #007AFF;
		color: white;
	}
	
	.btn-primary:hover {
		background-color: #0056b3;
	}
	
	.btn-secondary {
		background-color: transparent;
		color: #007AFF;
		border: 1px solid #007AFF;
	}
	
	.btn-secondary:hover {
		background-color: #007AFF;
		color: white;
	}
	
	.instructions {
		background: #f8f9fa;
		padding: 30px;
		border-radius: 8px;
		margin-top: 40px;
	}
	
	.instructions h2 {
		font-size: 24px;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 16px;
	}
	
	.instructions ol {
		margin-bottom: 20px;
	}
	
	.instructions li {
		margin-bottom: 8px;
		color: #666;
	}
	
	.note {
		background: #e3f2fd;
		padding: 16px;
		border-radius: 6px;
		border-left: 4px solid #2196f3;
	}
	
	.note strong {
		color: #1976d2;
	}
</style>
