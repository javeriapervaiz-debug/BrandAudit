// Buffer Brand Guidelines - Based on official Buffer brand guidelines PDF
// https://uploads-ssl.webflow.com/5d60176738c00e7ae2afeba2/6012ae7ab475e299997aab43_brandboard.pdf
// Comprehensive guidelines extracted and structured for AI analysis

export const bufferBrandGuideline = {
	brandName: "Buffer",
	version: "4.0",
	lastUpdated: "2024-01-22",
	
	// Core Brand Colors - Extracted from official PDF
	colors: {
		primary: [
			{ name: "Buffer Black", value: "#0A0A0A", usage: "Primary text, headers, main navigation" },
			{ name: "Buffer White", value: "#FFFFFF", usage: "Backgrounds, negative space" }
		],
		accent: [
			{ name: "Ocean", value: "#0FA3B1", usage: "Secondary actions, highlights" },
			{ name: "Sunshine", value: "#F7D002", usage: "Warnings, attention elements" },
			{ name: "Coral", value: "#F75C03", usage: "Primary CTAs, main action buttons" },
			{ name: "Lavender", value: "#8B35C3", usage: "Special features, premium elements" },
			{ name: "Forest", value: "#1B512D", usage: "Success states, positive indicators" }
		],
		neutral: [
			{ name: "Light Gray", value: "#F8F9FA", usage: "Subtle backgrounds, dividers" },
			{ name: "Medium Gray", value: "#6C757D", usage: "Secondary text, captions" },
			{ name: "Dark Gray", value: "#333333", usage: "Body text, descriptions" }
		],
		// Specific usage rules for common elements
		usage: {
			text: "#0A0A0A",
			background: "#FFFFFF", 
			primaryButton: "#F75C03", // Coral for main CTAs
			secondaryButton: "transparent with #0A0A0A border",
			success: "#1B512D", // Forest for success
			warning: "#F7D002", // Sunshine for warnings
			links: "#0FA3B1" // Ocean for links
		},
		rules: "Coral (#F75C03) is the primary action color for main CTAs. Ocean (#0FA3B1) for secondary actions and links. Use Buffer Black (#0A0A0A) for primary text. White (#FFFFFF) for backgrounds."
	},
	// Typography System - Based on Buffer's official brand guidelines
	typography: {
		primaryFont: "Poppins, sans-serif",
		secondaryFont: "Roboto, sans-serif",
		fallbackFont: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
		
		// Specific font weights and styles as per brand guidelines
		weights: {
			poppins: {
				bold: 800, // Poppins Bold (800) for headings only
				available: [800] // Only Bold (800) weight allowed for Poppins
			},
			roboto: {
				light: 300,
				regular: 400,
				medium: 500,
				bold: 700,
				black: 900,
				available: [300, 400, 500, 700, 900] // All weights available for Roboto
			}
		},
		
		// Exact specifications from brand guidelines
		hierarchy: {
			// Headings: Poppins Bold (800) only
			h1: { 
				font: "Poppins Bold", 
				size: "48px", 
				weight: 800, 
				letterSpacing: "0px",
				kerning: "optical",
				case: "sentence case",
				usage: "Hero headlines, main page titles"
			},
			h2: { 
				font: "Poppins Bold", 
				size: "34px", 
				weight: 800, 
				letterSpacing: "0px",
				kerning: "optical",
				case: "sentence case",
				usage: "Section headers, major headings"
			},
			h3: { 
				font: "Poppins Bold", 
				size: "26px", 
				weight: 800, 
				letterSpacing: "0px",
				kerning: "optical",
				case: "sentence case",
				usage: "Subsection headers, card titles"
			},
			h4: { 
				font: "Poppins Bold", 
				size: "16px", 
				weight: 800, 
				letterSpacing: "0.2px",
				kerning: "optical",
				case: "sentence case",
				usage: "Small headers, labels"
			},
			
			// Body text: Roboto family
			paragraph: { 
				font: "Roboto Regular", 
				size: "18px", 
				weight: 400, 
				letterSpacing: "0.2px",
				kerning: "optical",
				case: "sentence case or title case",
				usage: "Body text, descriptions"
			},
			
			// Labels: Roboto Bold
			label: { 
				font: "Roboto Bold", 
				size: "16px", 
				weight: 700, 
				letterSpacing: "0.5px",
				kerning: "optical",
				case: "all caps",
				usage: "Labels, tags, small UI elements"
			}
		},
		
		// Font usage rules from brand guidelines
		rules: [
			"Headings (H1-H4): Use Poppins Bold (800) only. Do not use other Poppins weights.",
			"Body text: Use Roboto family for all text and paragraph content.",
			"Labels: Use Roboto Bold (700) in all caps with 0.5px letter-spacing.",
			"Always use optical kerning for both Poppins and Roboto.",
			"Set letter-spacing to 0 for general headings, 0.2px for small headings (16px).",
			"Use sentence case for headings, not all caps or all lowercase.",
			"Only use all caps or all lowercase for short labels."
		]
	},
	// Logo Guidelines - Based on Buffer's official brand standards
	logo: {
		clearSpace: "The width of the 'B' in the logo", // As specified in PDF
		minSize: "20px", // Minimum size for digital use
		preferredSize: "120px", // Recommended size for web headers
		variations: [
			{ name: "Primary Logo", usage: "Main brand mark, headers" },
			{ name: "Wordmark", usage: "Text-only version" },
			{ name: "Icon Only", usage: "Favicons, small spaces" }
		],
		rules: [
			"Do not stretch or distort the logo",
			"Use provided SVG files for crisp rendering",
			"Maintain clear space equal to the width of the 'B'",
			"Never recolor or modify the logo",
			"Use on white or light backgrounds for best visibility",
			"Ensure minimum size of 20px for readability"
		]
	},
	// Button System - Based on Buffer's official design system
	buttons: {
		primary: {
			backgroundColor: "#F75C03", // Coral for primary actions
			textColor: "#FFFFFF",
			borderRadius: "6px",
			padding: "12px 24px",
			fontSize: "1rem",
			fontWeight: 500,
			hover: "#E55100",
			usage: "Main CTAs, sign-up buttons, primary actions"
		},
		secondary: {
			backgroundColor: "#0FA3B1", // Ocean for secondary actions
			textColor: "#FFFFFF",
			borderRadius: "6px",
			padding: "12px 24px",
			fontSize: "1rem",
			fontWeight: 500,
			hover: "#0D8A96",
			usage: "Secondary actions, feature highlights"
		},
		outline: {
			backgroundColor: "transparent",
			textColor: "#0A0A0A", // Buffer Black
			border: "2px solid #0A0A0A",
			borderRadius: "6px",
			padding: "10px 22px",
			fontSize: "1rem",
			fontWeight: 500,
			hover: "#F8F9FA",
			usage: "Alternative actions, less prominent CTAs"
		},
		ghost: {
			backgroundColor: "transparent",
			textColor: "#0FA3B1", // Ocean for links
			border: "none",
			borderRadius: "6px",
			padding: "12px 24px",
			fontSize: "1rem",
			fontWeight: 500,
			hover: "#F8F9FA",
			usage: "Text links, subtle actions"
		},
		success: {
			backgroundColor: "#1B512D", // Forest for success
			textColor: "#FFFFFF",
			borderRadius: "6px",
			padding: "12px 24px",
			fontSize: "1rem",
			fontWeight: 500,
			hover: "#144025",
			usage: "Success states, confirmation actions"
		},
		warning: {
			backgroundColor: "#F7D002", // Sunshine for warnings
			textColor: "#0A0A0A",
			borderRadius: "6px",
			padding: "12px 24px",
			fontSize: "1rem",
			fontWeight: 500,
			hover: "#F4C430",
			usage: "Warning states, attention-grabbing actions"
		},
		rules: "Coral (#F75C03) is the primary action color. Ocean (#0FA3B1) for secondary actions. Use 6px border radius. Minimum 44px touch target. Maintain consistent padding and typography."
	},
	spacing: {
		unit: "8px",
		sectionPadding: "80px",
		containerMaxWidth: "1200px",
		rules: "Use 8px grid system. Sections should have 80px vertical padding. Container max width should be 1200px for optimal readability."
	},
	// Voice and Tone - Based on Buffer's brand personality
	voiceAndTone: {
		description: "Human, helpful, humble. We speak like a thoughtful friend who happens to be really good at social media.",
		attributes: ["Clear", "Encouraging", "Authentic", "Practical"],
		personality: {
			human: "We're real people, not robots. We make mistakes and learn from them.",
			helpful: "We genuinely want to help our community succeed with social media.",
			humble: "We don't brag or oversell. We let our work speak for itself.",
			thoughtful: "We think deeply about social media and share insights that matter."
		},
		rules: "Use active voice. Be encouraging and solution-oriented. Avoid jargon and corporate speak. Write as if speaking to a friend who's also a professional. Be authentic and honest about challenges."
	},
	
	// Imagery Guidelines - Based on Buffer's visual style
	imagery: {
		style: "Authentic, bright, human-centered photography",
		characteristics: [
			"Real people in real situations",
			"Bright, natural lighting",
			"Diverse and inclusive representation", 
			"Genuine emotions and interactions",
			"Clean, uncluttered compositions"
		],
		rules: [
			"Use real people in real situations, not stock photos",
			"Prioritize bright, natural light over artificial lighting",
			"Show diverse teams and individuals",
			"Avoid overly polished or staged-looking images",
			"Focus on authentic moments and genuine expressions"
		]
	},
	layout: {
		gridSystem: "12-column grid",
		breakpoints: {
			mobile: "768px",
			tablet: "1024px",
			desktop: "1200px"
		},
		rules: "Use 12-column grid system. Ensure responsive design across all breakpoints. Maintain consistent spacing and alignment."
	}
};
