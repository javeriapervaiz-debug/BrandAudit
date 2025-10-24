// Mock LLM Analysis for Brand Compliance
// This simulates what an AI would return when analyzing brand violations

export function generateMockViolations(scrapedData, brandGuideline) {
	// This is a hardcoded analysis of the known violations in our mock website
	// In production, this would be replaced with actual LLM API calls
	
	const violations = [
		{
			elementType: "h1",
			issueType: "color",
			severity: "high",
			found: "#EF4444 (red)",
			expected: "#3B82F6 (primary blue)",
			suggestion: "Change the main heading color from red (#EF4444) to primary blue (#3B82F6) to match brand guidelines.",
			elementText: "Welcome to SaaSGamma!!!",
			location: "Main page heading"
		},
		{
			elementType: "h1", 
			issueType: "typography",
			severity: "high",
			found: "Comic Sans MS, 3rem, weight 900",
			expected: "Inter, 2.5rem, weight 700",
			suggestion: "Update heading to use Inter font, 2.5rem size, and weight 700 as specified in brand guidelines.",
			elementText: "Welcome to SaaSGamma!!!",
			location: "Main page heading"
		},
		{
			elementType: "body",
			issueType: "typography",
			severity: "high", 
			found: "Arial, sans-serif",
			expected: "Inter, system-ui, sans-serif",
			suggestion: "Replace Arial with Inter font family as the primary brand font.",
			elementText: "We're the most bestest company...",
			location: "Body text"
		},
		{
			elementType: "button",
			issueType: "color",
			severity: "high",
			found: "#8B5CF6 (purple) background",
			expected: "#3B82F6 (primary blue) background", 
			suggestion: "Change primary button background from purple (#8B5CF6) to primary blue (#3B82F6).",
			elementText: "Sign Up Now!!!",
			location: "Primary button"
		},
		{
			elementType: "button",
			issueType: "styling",
			severity: "medium",
			found: "20px border-radius, 8px 16px padding",
			expected: "8px border-radius, 12px 24px padding",
			suggestion: "Update button styling to use 8px border radius and 12px 24px padding as per brand guidelines.",
			elementText: "Sign Up Now!!!",
			location: "Primary button"
		},
		{
			elementType: "logo",
			issueType: "size",
			severity: "high",
			found: "80px width, 20px height",
			expected: "120px+ width, proper aspect ratio",
			suggestion: "Increase logo width to at least 120px and maintain proper 5:1 aspect ratio.",
			elementText: "SaaSGamma Logo",
			location: "Header logo"
		},
		{
			elementType: "logo",
			issueType: "spacing",
			severity: "medium",
			found: "5px margin",
			expected: "24px clear space",
			suggestion: "Add 24px minimum clear space around the logo on all sides.",
			elementText: "SaaSGamma Logo", 
			location: "Header logo"
		},
		{
			elementType: "container",
			issueType: "layout",
			severity: "medium",
			found: "1400px max-width, 10px padding",
			expected: "1200px max-width, 32px padding",
			suggestion: "Reduce container max-width to 1200px and increase padding to 32px.",
			elementText: "Main container",
			location: "Page layout"
		},
		{
			elementType: "h2",
			issueType: "color",
			severity: "high",
			found: "#8B5CF6 (purple)",
			expected: "#1F2937 (dark gray)",
			suggestion: "Change h2 color from purple (#8B5CF6) to dark gray (#1F2937) for proper hierarchy.",
			elementText: "Why Choose Us?",
			location: "Section heading"
		},
		{
			elementType: "text",
			issueType: "tone_of_voice",
			severity: "high",
			found: "Unprofessional language: 'bestest', 'epic', 'insane', 'literally'",
			expected: "Professional, clear, confident tone",
			suggestion: "Replace unprofessional language with clear, confident business language. Avoid slang and excessive exclamation marks.",
			elementText: "We're the most bestest company in the whole wide world for realsies!",
			location: "Hero section text"
		},
		{
			elementType: "button",
			issueType: "color",
			severity: "high",
			found: "#EC4899 (pink) background",
			expected: "#10B981 (success green) background",
			suggestion: "Change secondary button from pink (#EC4899) to success green (#10B981).",
			elementText: "Learn More",
			location: "Secondary button"
		},
		{
			elementType: "form",
			issueType: "styling",
			severity: "medium",
			found: "Courier New font, 15px border-radius, 5px border",
			expected: "Inter font, 8px border-radius, 2px border",
			suggestion: "Update form inputs to use Inter font, 8px border radius, and 2px border width.",
			elementText: "Email input field",
			location: "Contact form"
		}
	];

	// Calculate compliance score
	const totalViolations = violations.length;
	const highSeverity = violations.filter(v => v.severity === 'high').length;
	const mediumSeverity = violations.filter(v => v.severity === 'medium').length;
	const lowSeverity = violations.filter(v => v.severity === 'low').length;

	// Simple scoring: start with 100, deduct points for violations
	let score = 100;
	score -= highSeverity * 10; // -10 points per high severity
	score -= mediumSeverity * 5; // -5 points per medium severity  
	score -= lowSeverity * 2; // -2 points per low severity

	score = Math.max(0, score); // Don't go below 0

	return {
		score: Math.round(score),
		totalViolations,
		severityBreakdown: {
			high: highSeverity,
			medium: mediumSeverity,
			low: lowSeverity
		},
		violations: violations,
		summary: {
			criticalIssues: highSeverity,
			moderateIssues: mediumSeverity,
			minorIssues: lowSeverity,
			overallCompliance: score >= 80 ? 'Good' : score >= 60 ? 'Needs Improvement' : 'Poor'
		},
		analysisType: 'mock'
	};
}
