// Apple Brand Guidelines - Comprehensive Design System
// Based on Apple's Human Interface Guidelines and design principles
// Core principles: Clarity, Deference, Depth

export const appleBrandGuideline = {
	brandName: "Apple",
	version: "2.0",
	colors: {
		// Primary Brand Colors
		primary: [
			{ name: "Apple Blue", value: "#007AFF", usage: "Primary actions, links, and interactive elements" },
			{ name: "Apple Blue Dark", value: "#0051D5", usage: "Hover states and pressed states" }
		],
		secondary: [
			{ name: "Apple Green", value: "#34C759", usage: "Success states, positive actions" },
			{ name: "Apple Red", value: "#FF3B30", usage: "Destructive actions, errors" },
			{ name: "Apple Orange", value: "#FF9500", usage: "Warnings, highlights" },
			{ name: "Apple Purple", value: "#AF52DE", usage: "Accent elements, special features" }
		],
		neutral: [
			{ name: "System Gray", value: "#8E8E93", usage: "Secondary text, disabled states" },
			{ name: "System Gray 2", value: "#AEAEB2", usage: "Borders, dividers" },
			{ name: "System Gray 3", value: "#C7C7CC", usage: "Light borders, backgrounds" },
			{ name: "System Gray 4", value: "#D1D1D6", usage: "Very light backgrounds" },
			{ name: "System Gray 5", value: "#E5E5EA", usage: "Backgrounds, separators" },
			{ name: "System Gray 6", value: "#F2F2F7", usage: "Light backgrounds" }
		],
		background: [
			{ name: "White", value: "#FFFFFF", usage: "Primary background" },
			{ name: "System Background", value: "#F2F2F7", usage: "Secondary background" },
			{ name: "System Background Dark", value: "#1C1C1E", usage: "Dark mode background" }
		],
		text: [
			{ name: "Label", value: "#000000", usage: "Primary text" },
			{ name: "Secondary Label", value: "#3C3C43", usage: "Secondary text" },
			{ name: "Tertiary Label", value: "#3C3C43", usage: "Tertiary text" },
			{ name: "Quaternary Label", value: "#2C2C2E", usage: "Quaternary text" }
		],
		usage: {
			primaryButton: "#007AFF",
			secondaryButton: "transparent with #007AFF border",
			success: "#34C759",
			error: "#FF3B30",
			warning: "#FF9500",
			text: "#000000",
			background: "#FFFFFF"
		},
		rules: "Use Apple Blue (#007AFF) for primary actions. Green (#34C759) for success, Red (#FF3B30) for errors. Maintain high contrast ratios (4.5:1 minimum). Use system colors for consistency across platforms."
	},
	typography: {
		// Apple's Font System
		primaryFont: "SF Pro Display, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		textFont: "SF Pro Text, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		fallbackFont: "system-ui, -apple-system, sans-serif",
		
		// Font Weights
		weights: {
			ultraLight: 100,
			thin: 200,
			light: 300,
			regular: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
			heavy: 800,
			black: 900
		},
		
		// Typography Scale
		hierarchy: {
			largeTitle: { 
				size: "3.5rem", 
				weight: "700", 
				lineHeight: "1.0", 
				letterSpacing: "-0.02em",
				font: "SF Pro Display"
			},
			title1: { 
				size: "2.75rem", 
				weight: "700", 
				lineHeight: "1.1", 
				letterSpacing: "-0.01em",
				font: "SF Pro Display"
			},
			title2: { 
				size: "2.25rem", 
				weight: "700", 
				lineHeight: "1.2", 
				letterSpacing: "0",
				font: "SF Pro Display"
			},
			title3: { 
				size: "1.875rem", 
				weight: "600", 
				lineHeight: "1.3", 
				letterSpacing: "0",
				font: "SF Pro Display"
			},
			headline: { 
				size: "1.125rem", 
				weight: "600", 
				lineHeight: "1.4", 
				letterSpacing: "0",
				font: "SF Pro Text"
			},
			body: { 
				size: "1rem", 
				weight: "400", 
				lineHeight: "1.5", 
				letterSpacing: "0",
				font: "SF Pro Text"
			},
			callout: { 
				size: "1rem", 
				weight: "400", 
				lineHeight: "1.4", 
				letterSpacing: "0",
				font: "SF Pro Text"
			},
			subhead: { 
				size: "0.875rem", 
				weight: "400", 
				lineHeight: "1.4", 
				letterSpacing: "0",
				font: "SF Pro Text"
			},
			footnote: { 
				size: "0.8125rem", 
				weight: "400", 
				lineHeight: "1.4", 
				letterSpacing: "0",
				font: "SF Pro Text"
			},
			caption1: { 
				size: "0.75rem", 
				weight: "400", 
				lineHeight: "1.3", 
				letterSpacing: "0",
				font: "SF Pro Text"
			},
			caption2: { 
				size: "0.6875rem", 
				weight: "400", 
				lineHeight: "1.3", 
				letterSpacing: "0",
				font: "SF Pro Text"
			}
		},
		
		// Button Typography
		buttons: {
			large: { size: "1.125rem", weight: "600", lineHeight: "1.2" },
			medium: { size: "1rem", weight: "500", lineHeight: "1.2" },
			small: { size: "0.875rem", weight: "500", lineHeight: "1.2" }
		},
		
		rules: "Use SF Pro Display for headings and large text. SF Pro Text for body text and UI elements. Maintain generous line heights (1.4-1.6). Use appropriate letter spacing for large text. Ensure minimum 16px font size for body text."
	},
	logo: {
		primaryUrl: "/apple-logo.svg",
		variants: {
			monochrome: "Black logo on white background",
			white: "White logo on dark backgrounds",
			colored: "Full color logo (use sparingly)"
		},
		sizing: {
			minWidth: "100px",
			maxWidth: "200px",
			clearSpace: "24px minimum",
			aspectRatio: "1:1"
		},
		placement: {
			header: "Top-left corner, aligned with navigation",
			footer: "Centered or left-aligned",
			avoid: "Never place on busy backgrounds or images"
		},
		rules: "Apple logo must be at least 100px wide with 24px clear space. Never modify, distort, or recolor the logo. Use monochrome version on white/light backgrounds, white version on dark backgrounds. Maintain proper aspect ratio."
	},
	buttons: {
		// Primary Button (Call-to-Action)
		primary: {
			backgroundColor: "#007AFF",
			textColor: "#FFFFFF",
			borderRadius: "8px",
			padding: "12px 24px",
			fontSize: "1rem",
			fontWeight: "600",
			minHeight: "44px",
			hover: {
				backgroundColor: "#0051D5",
				transform: "scale(0.98)"
			},
			focus: {
				outline: "2px solid #007AFF",
				outlineOffset: "2px"
			}
		},
		// Secondary Button (Outlined)
		secondary: {
			backgroundColor: "transparent",
			textColor: "#007AFF",
			border: "1px solid #007AFF",
			borderRadius: "8px",
			padding: "11px 23px",
			fontSize: "1rem",
			fontWeight: "500",
			minHeight: "44px",
			hover: {
				backgroundColor: "#007AFF",
				textColor: "#FFFFFF"
			}
		},
		// Ghost Button (Text only)
		ghost: {
			backgroundColor: "transparent",
			textColor: "#007AFF",
			border: "none",
			borderRadius: "8px",
			padding: "12px 24px",
			fontSize: "1rem",
			fontWeight: "500",
			minHeight: "44px",
			hover: {
				backgroundColor: "#F2F2F7"
			}
		},
		// Destructive Button
		destructive: {
			backgroundColor: "#FF3B30",
			textColor: "#FFFFFF",
			borderRadius: "8px",
			padding: "12px 24px",
			fontSize: "1rem",
			fontWeight: "600",
			minHeight: "44px",
			hover: {
				backgroundColor: "#D70015"
			}
		},
		// Button Sizes
		sizes: {
			large: { padding: "16px 32px", fontSize: "1.125rem", minHeight: "52px" },
			medium: { padding: "12px 24px", fontSize: "1rem", minHeight: "44px" },
			small: { padding: "8px 16px", fontSize: "0.875rem", minHeight: "36px" }
		},
		rules: "Use 8px border radius consistently. Maintain 44px minimum touch target. Primary buttons should be blue (#007AFF), secondary should be outlined. Use destructive buttons sparingly for dangerous actions. Ensure proper focus states for accessibility."
	},
	spacing: {
		// 8px Grid System
		unit: "8px",
		scale: {
			xs: "4px",    // 0.5 units
			sm: "8px",    // 1 unit
			md: "16px",   // 2 units
			lg: "24px",   // 3 units
			xl: "32px",   // 4 units
			"2xl": "48px", // 6 units
			"3xl": "64px", // 8 units
			"4xl": "96px", // 12 units
			"5xl": "128px" // 16 units
		},
		sectionPadding: "120px",
		containerMaxWidth: "1024px",
		contentMaxWidth: "768px",
		gutters: {
			mobile: "16px",
			tablet: "24px",
			desktop: "32px"
		},
		rules: "Use 8px grid system consistently. Generous white space is essential to Apple's design. Sections should have 120px vertical padding. Container max width should be 1024px, content max width 768px."
	},
	
	// Apple's Design Principles
	designPrinciples: {
		clarity: "Clear, legible text and intuitive navigation. Every element should have a purpose.",
		deference: "Content is king. UI should not compete with content for attention.",
		depth: "Use visual hierarchy, motion, and layering to create engaging experiences."
	},
	
	toneOfVoice: {
		description: "Simple, clear, and human. Focus on what the product does, not how it does it. Be confident but not arrogant.",
		characteristics: [
			"Conversational and approachable",
			"Confident but not boastful", 
			"Clear and concise",
			"Benefit-focused, not feature-focused",
			"Accessible to all users"
		],
		keywords: ["innovation", "simplicity", "elegance", "powerful", "beautiful", "intuitive", "seamless"],
		do: [
			"Use simple, everyday language",
			"Focus on what users can accomplish",
			"Be specific and concrete",
			"Use active voice",
			"Write for all skill levels"
		],
		dont: [
			"Use technical jargon or buzzwords",
			"Make exaggerated claims",
			"Use passive voice unnecessarily",
			"Write in all caps",
			"Use overly complex sentences"
		],
		rules: "Use simple, clear language. Focus on benefits, not features. Be confident and aspirational. Avoid technical jargon. Write for humans, not machines."
	},
	
	layout: {
		gridSystem: "12-column responsive grid",
		breakpoints: {
			mobile: "320px",
			"mobile-large": "414px",
			tablet: "768px",
			"tablet-large": "1024px",
			desktop: "1440px",
			"desktop-large": "1920px"
		},
		containers: {
			small: "320px",
			medium: "768px", 
			large: "1024px",
			"extra-large": "1440px"
		},
		columns: {
			mobile: 1,
			tablet: 2,
			desktop: 3,
			"desktop-large": 4
		},
		rules: "Use 12-column grid with generous gutters. Maintain consistent spacing. Focus on content hierarchy and visual flow. Ensure touch targets are at least 44px. Use responsive design principles."
	},
	
	// Accessibility Guidelines
	accessibility: {
		contrast: {
			minimum: "4.5:1 for normal text",
			enhanced: "7:1 for large text",
			ui: "3:1 for UI components"
		},
		touchTargets: {
			minimum: "44px x 44px",
			recommended: "48px x 48px",
			spacing: "8px between targets"
		},
		typography: {
			minimumSize: "16px for body text",
			lineHeight: "1.4 minimum",
			letterSpacing: "0.5px minimum for small text"
		},
		rules: "Ensure 4.5:1 contrast ratio minimum. Use 44px minimum touch targets. Maintain 16px minimum font size. Provide focus indicators. Support keyboard navigation."
	},
	
	// Animation and Motion
	motion: {
		duration: {
			fast: "0.2s",
			normal: "0.3s", 
			slow: "0.5s"
		},
		easing: {
			easeIn: "cubic-bezier(0.4, 0, 1, 1)",
			easeOut: "cubic-bezier(0, 0, 0.2, 1)",
			easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)"
		},
		principles: [
			"Motion should feel natural and purposeful",
			"Use motion to guide user attention",
			"Keep animations subtle and refined",
			"Respect user preferences for reduced motion"
		],
		rules: "Use motion purposefully to enhance usability. Keep animations under 0.5s. Use easing curves that feel natural. Respect prefers-reduced-motion setting."
	}
};
