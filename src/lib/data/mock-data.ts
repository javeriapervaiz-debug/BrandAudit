// Mock data for EternaBrand prototype

export const mockBrandGuidelines = {
	logo: '/placeholder-logo.svg',
	colors: {
		primary: '#3B82F6',
		secondary: '#F59E0B',
		accent: '#10B981',
		neutral: '#6B7280',
		background: '#FFFFFF',
		text: '#1F2937'
	},
	typography: {
		headingFont: 'Inter',
		bodyFont: 'Inter',
		sizes: {
			h1: '2.5rem',
			h2: '2rem',
			h3: '1.5rem',
			body: '1rem',
			small: '0.875rem'
		}
	},
	toneOfVoice: {
		personality: ['Professional', 'Approachable', 'Innovative'],
		doWords: ['Create', 'Innovate', 'Transform', 'Empower'],
		avoidWords: ['Cheap', 'Basic', 'Outdated', 'Complicated']
	}
};

export const mockAuditReport = {
	overallScore: 72,
	issues: [
		{
			type: 'color',
			severity: 'high',
			message: 'Primary color #FF0000 does not match brand guideline #3B82F6',
			element: 'Header background',
			suggestion: 'Update to brand primary color #3B82F6'
		},
		{
			type: 'typography',
			severity: 'medium',
			message: 'Font family "Arial" should be "Inter" according to brand guidelines',
			element: 'Body text',
			suggestion: 'Change font-family to Inter'
		},
		{
			type: 'spacing',
			severity: 'low',
			message: 'Inconsistent margin spacing detected',
			element: 'Content sections',
			suggestion: 'Use consistent 24px margins between sections'
		}
	],
	suggestions: [
		'Implement consistent color palette across all elements',
		'Update typography to match brand guidelines',
		'Improve visual hierarchy with proper spacing'
	]
};

export const mockCreatives = [
	{
		id: '1',
		type: 'instagram-post',
		title: 'Instagram Post - Product Launch',
		preview: '/mock-creative-1.jpg',
		platform: 'Instagram',
		dimensions: '1080x1080'
	},
	{
		id: '2',
		type: 'linkedin-ad',
		title: 'LinkedIn Ad - Professional Services',
		preview: '/mock-creative-2.jpg',
		platform: 'LinkedIn',
		dimensions: '1200x628'
	},
	{
		id: '3',
		type: 'facebook-story',
		title: 'Facebook Story - Brand Awareness',
		preview: '/mock-creative-3.jpg',
		platform: 'Facebook',
		dimensions: '1080x1920'
	}
];

export const mockIndustries = [
	'Technology',
	'Healthcare',
	'Finance',
	'Education',
	'Retail',
	'Food & Beverage',
	'Real Estate',
	'Consulting',
	'Creative Agency',
	'Non-profit'
];

export const mockMoodOptions = [
	'Professional',
	'Creative',
	'Playful',
	'Minimalist',
	'Bold',
	'Elegant',
	'Modern',
	'Traditional',
	'Friendly',
	'Authoritative'
];

export const mockTargetAudiences = [
	'Young Professionals (25-35)',
	'Small Business Owners',
	'Enterprise Executives',
	'Creative Professionals',
	'Students',
	'Families',
	'Seniors (55+)',
	'Tech Enthusiasts',
	'Health Conscious',
	'Budget Conscious'
];
