// Enhanced Free LLM Analysis with user-friendly, actionable feedback
// This provides intelligent analysis without requiring API keys

// Type definitions
/**
 * @typedef {Object} ScrapedElement
 * @property {string} type - Element type (h1, h2, p, button, etc.)
 * @property {string} text - Element text content
 * @property {Object} styles - CSS styles
 * @property {string} styles.fontFamily - Font family
 * @property {string} styles.fontSize - Font size
 * @property {string} styles.fontWeight - Font weight
 * @property {string} styles.color - Text color
 * @property {string} styles.letterSpacing - Letter spacing
 * @property {string} [styles.width] - Element width
 * @property {number} index - Element index
 */

/**
 * @typedef {Object} ScrapedData
 * @property {string} url - Scraped URL
 * @property {ScrapedElement[]} elements - Array of scraped elements
 * @property {string[]} fonts - Found fonts
 * @property {string[]} colors - Found colors
 */

/**
 * @typedef {Object} BrandGuideline
 * @property {string} brandName - Brand name
 * @property {Object} colors - Color guidelines
 * @property {string} [colors.primary] - Primary color
 * @property {Object} [colors.forbidden] - Forbidden colors
 * @property {Object} typography - Typography guidelines
 * @property {string} [typography.primaryFont] - Primary font
 * @property {string} [typography.secondaryFont] - Secondary font
 * @property {Object} [typography.hierarchy] - Typography hierarchy
 * @property {string[]} [typography.forbiddenFonts] - Forbidden fonts
 * @property {Object} logo - Logo guidelines
 * @property {string} [logo.minWidth] - Minimum logo width
 * @property {string} [logo.maxWidth] - Maximum logo width
 * @property {Object} voiceAndTone - Voice and tone guidelines
 * @property {string[]} [voiceAndTone.forbiddenWords] - Forbidden words
 * @property {string[]} [voiceAndTone.keywords] - Preferred keywords
 */

/**
 * @typedef {Object} Violation
 * @property {string} elementType - Type of element with violation
 * @property {string} issueType - Type of issue (typography, color, etc.)
 * @property {string} issue - Specific issue description
 * @property {string} location - Location description
 * @property {string} found - What was found
 * @property {string} expected - What was expected
 * @property {string} suggestion - Fix suggestion
 * @property {string} severity - Severity level
 * @property {string} impact - Impact description
 * @property {string} priority - Priority level
 * @property {Object[]} [affectedElements] - Array of affected elements
 */

// Normalize color values to prevent false positives
/**
 * @param {string} color - Color value to normalize
 * @returns {string} Normalized color value
 */
function normalizeColor(color) {
	if (!color) return '';
	
	// Convert to lowercase and trim
	color = color.toLowerCase().trim();
	
	// Convert rgb() to hex
	if (color.startsWith('rgb(')) {
		const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
		if (rgbMatch) {
			const r = parseInt(rgbMatch[1]);
			const g = parseInt(rgbMatch[2]);
			const b = parseInt(rgbMatch[3]);
			return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		}
	}
	
	// Convert rgba() to hex (ignoring alpha)
	if (color.startsWith('rgba(')) {
		const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
		if (rgbaMatch) {
			const r = parseInt(rgbaMatch[1]);
			const g = parseInt(rgbaMatch[2]);
			const b = parseInt(rgbaMatch[3]);
			return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		}
	}
	
	// Ensure hex colors are uppercase for consistency
	if (color.startsWith('#')) {
		return color.toUpperCase();
	}
	
	return color;
}

/**
 * @param {ScrapedData} scrapedData - Scraped website data
 * @param {BrandGuideline} brandGuideline - Brand guidelines to check against
 * @returns {Promise<Object>} Analysis results with violations and score
 */
export async function analyzeWithFreeLLM(scrapedData, brandGuideline) {
	console.log('Using enhanced free rule-based analysis...');
	
	const violations = [];
	let totalViolations = 0;
	
	// Analyze colors with detailed feedback
	const colorViolations = analyzeColors(scrapedData, brandGuideline);
	violations.push(...colorViolations);
	totalViolations += colorViolations.length;
	
	// Analyze typography with specific element feedback
	const typographyViolations = analyzeTypography(scrapedData, brandGuideline);
	violations.push(...typographyViolations);
	totalViolations += typographyViolations.length;
	
	// Analyze logo usage
	const logoViolations = analyzeLogo(scrapedData, brandGuideline);
	violations.push(...logoViolations);
	totalViolations += logoViolations.length;
	
	// Note: Layout analysis removed - only checking brand guideline violations
	// Layout structure is not part of brand guidelines unless specifically defined
	
	// Analyze tone of voice
	const toneViolations = analyzeToneOfVoice(scrapedData, brandGuideline);
	violations.push(...toneViolations);
	totalViolations += toneViolations.length;
	
	// Calculate severity breakdown
	const highSeverity = violations.filter(v => v.severity === 'high').length;
	const mediumSeverity = violations.filter(v => v.severity === 'medium').length;
	const lowSeverity = violations.filter(v => v.severity === 'low').length;
	
	// CRITICAL FIX: Normalize severity case first (LLM returns UPPERCASE, code expects lowercase)
	const normalizedViolations = violations.map(v => ({
		...v,
		severity: v.severity ? v.severity.toLowerCase() : 'low'
	}));
	
	// Pre-process violations to ensure consistent severity labeling
	const processedViolations = preprocessViolationSeverity(normalizedViolations);
	
	// Calculate compliance score using refined approach
	const criticalSeverity = processedViolations.filter(v => v.severity === 'critical').length;
	const highSeverityProcessed = processedViolations.filter(v => v.severity === 'high').length;
	const mediumSeverityProcessed = processedViolations.filter(v => v.severity === 'medium').length;
	const lowSeverityProcessed = processedViolations.filter(v => v.severity === 'low').length;
	
	// Debug logging to verify counting
	console.log(`Counted violations: ${criticalSeverity} critical, ${highSeverityProcessed} high, ${mediumSeverityProcessed} medium, ${lowSeverityProcessed} low`);

	let score = 100;
	
	// Deduct points based on severity with refined caps
	// Critical severity: -8 points each (max 40 points for 5+ violations)
	score -= Math.min(criticalSeverity * 8, 40);
	
	// High severity: -5 points each (max 40 points for 8+ violations)
	score -= Math.min(highSeverityProcessed * 5, 40);
	
	// Medium severity: -3 points each (max 24 points for 8+ violations)  
	score -= Math.min(mediumSeverityProcessed * 3, 24);
	
	// Low severity: -1 point each (max 12 points for 12+ violations)
	score -= Math.min(lowSeverityProcessed * 1, 12);
	
	// Bonus for having some brand-compliant elements
	const hasBrandElements = scrapedData.colors?.length > 0 || scrapedData.fonts?.length > 0 || scrapedData.elements?.length > 0;
	if (hasBrandElements) {
		score += 3; // Reduced bonus to be more balanced
	}
	
	// Critical violations can set a maximum score ceiling
	if (criticalSeverity > 0) {
		score = Math.min(score, 80); // Cannot score above 80 with critical violations
	}
	
	// Ensure score is between 0 and 100
	score = Math.max(0, Math.min(100, score));
	
	// Log scoring calculation for debugging
	console.log(`Score Calculation: 100 - ${Math.min(criticalSeverity * 8, 40)} (critical) - ${Math.min(highSeverityProcessed * 5, 40)} (high) - ${Math.min(mediumSeverityProcessed * 3, 24)} (med) - ${Math.min(lowSeverityProcessed * 1, 12)} (low) + ${hasBrandElements ? 3 : 0} (bonus) = ${score}`);
	
	return {
		score: Math.round(score),
		totalViolations,
		severityBreakdown: {
			critical: criticalSeverity,
			high: highSeverityProcessed,
			medium: mediumSeverityProcessed,
			low: lowSeverityProcessed
		},
		violations: processedViolations,
		summary: {
			criticalIssues: criticalSeverity,
			moderateIssues: highSeverityProcessed + mediumSeverityProcessed,
			minorIssues: lowSeverityProcessed,
			overallCompliance: score >= 85 ? 'Excellent' : 
							  score >= 70 ? 'Good' : 
							  score >= 55 ? 'Needs Improvement' : 
							  score >= 40 ? 'Poor' : 'Very Poor'
		},
		analysisType: 'free_rule_based'
	};
}

/**
 * @param {ScrapedData} scrapedData - Scraped website data
 * @param {BrandGuideline} brandGuideline - Brand guidelines to check against
 * @returns {Violation[]} Array of color violations
 */
function analyzeColors(scrapedData, brandGuideline) {
	const violations = [];
	const foundColors = scrapedData.colors || [];
	const brandColors = brandGuideline.colors || {};
	
	// Extract colors from new schema structure
	const semanticColors = brandColors.semantic || {};
	const neutralColors = brandColors.neutral || {};
	const forbiddenColors = brandColors.forbidden || [];
	
	// Get all allowed colors
	const allowedColors = [
		...Object.values(semanticColors).map(color => color.hex),
		...Object.values(neutralColors).map(color => color.hex)
	];
	
	// Check for forbidden colors
	forbiddenColors.forEach(forbiddenColor => {
		const foundForbidden = foundColors.some(color => 
			normalizeColor(color) === normalizeColor(forbiddenColor)
		);
		
		if (foundForbidden) {
			violations.push({
				elementType: 'color_usage',
				issueType: 'color',
				issue: 'Forbidden color detected',
				location: 'Global color usage',
				elementText: 'Forbidden color found in design',
				found: `Forbidden color: ${forbiddenColor}`,
				expected: 'Use only approved brand colors',
				suggestion: `🚫 Remove ${forbiddenColor} and replace with an approved brand color from the palette.`,
				severity: 'high',
				impact: 'Brand consistency compromised',
				priority: 'Fix immediately'
			});
		}
	});
	
	// Check for primary color usage
	if (semanticColors.primary) {
		const primaryColor = semanticColors.primary.hex;
		const hasPrimaryColor = foundColors.some(color => 
			normalizeColor(color) === normalizeColor(primaryColor)
		);
		
		if (!hasPrimaryColor) {
			const elementsNeedingPrimaryColor = scrapedData.elements?.filter(el => 
				el.type?.includes('button') || el.type?.includes('h1') || el.type?.includes('h2')
			) || [];
			
			violations.push({
				elementType: 'color_scheme',
				issueType: 'color',
				issue: 'Missing primary brand color',
				location: 'Primary brand color missing',
				elementText: `Found ${elementsNeedingPrimaryColor.length} key elements without primary color`,
				found: `Current colors: ${foundColors.slice(0, 3).join(', ')}`,
				expected: `Primary color: ${primaryColor}`,
				suggestion: `🎨 Use ${primaryColor} for your main buttons, headings, and call-to-action elements. This will make your brand more recognizable and professional.`,
				severity: 'high',
				impact: `${elementsNeedingPrimaryColor.length} key elements affected`,
				priority: 'Fix immediately'
			});
		}
	}
	
	// Check for forbidden colors if specified in brand guidelines
	if (brandColors.forbidden && typeof brandColors.forbidden === 'object') {
		const forbiddenColorValues = Object.values(brandColors.forbidden);
	const hasForbiddenColors = foundColors.some(color => 
			forbiddenColorValues.some(forbidden => 
			normalizeColor(color) === normalizeColor(forbidden)
		)
	);
	
	if (hasForbiddenColors) {
		const forbiddenFound = foundColors.filter(color => 
				forbiddenColorValues.some(forbidden => 
				normalizeColor(color) === normalizeColor(forbidden)
			)
		);
		
		violations.push({
			elementType: 'color_scheme',
			issueType: 'color',
			issue: 'Forbidden colors detected',
			location: 'Forbidden colors detected',
			elementText: `Found ${forbiddenFound.length} forbidden color(s)`,
			found: forbiddenFound.join(', '),
			expected: 'Brand-approved colors only',
			suggestion: `🚫 Remove these forbidden colors: ${forbiddenFound.join(', ')}. Use only colors specified in your brand guidelines.`,
			severity: 'high',
			impact: 'Violates brand guidelines',
			priority: 'Fix immediately'
		});
	}
	}
	
	// Note: Generic color consistency checks removed - only checking specific brand guideline violations
	
	return violations;
}

/**
 * @param {ScrapedData} scrapedData - Scraped website data
 * @param {BrandGuideline} brandGuideline - Brand guidelines to check against
 * @returns {Violation[]} Array of typography violations
 */
function analyzeTypography(scrapedData, brandGuideline) {
	const violations = [];
	const foundFonts = scrapedData.fonts || [];
	const brandFonts = brandGuideline.typography || {};
	const elements = scrapedData.elements || [];
	
	// Create a function to normalize font names for comparison
	/**
	 * @param {string} fontName - Font name to normalize
	 * @returns {string} Normalized font name
	 */
	const normalizeFontName = (fontName) => {
		if (!fontName) return '';
		// Remove common CSS font stack suffixes and normalize
		return fontName.toLowerCase()
			.replace(/,.*$/, '') // Remove everything after comma (font stack)
			.replace(/['"]/g, '') // Remove quotes
			.trim();
	};
	
	// Get approved fonts from new schema structure
	const approvedFonts = [];
	if (brandFonts.fonts?.primary) approvedFonts.push(brandFonts.fonts.primary);
	if (brandFonts.fonts?.fallback) approvedFonts.push(brandFonts.fonts.fallback);
	if (brandFonts.fonts?.monospace) approvedFonts.push(brandFonts.fonts.monospace);
	
	// Create normalized approved fonts list
	const normalizedApprovedFonts = approvedFonts.map(font => normalizeFontName(font));
	
	// Debug logging
	console.log('🔍 Typography Analysis Debug:');
	console.log('  Found fonts:', foundFonts);
	console.log('  Approved fonts:', approvedFonts);
	console.log('  Normalized approved fonts:', normalizedApprovedFonts);
	console.log('  Brand hierarchy:', brandFonts.hierarchy);
	
	// Group elements by type and violation type for better organization
	/** @type {Record<string, any>} */
	const violationsByType = {};
	
	// Check each element against specific typography rules
	/**
	 * @param {ScrapedElement} element - Element to check
	 */
	elements.forEach(element => {
		const elementType = element.type || 'unknown';
		const fontFamily = element.styles?.fontFamily;
		const fontSize = element.styles?.fontSize;
		const fontWeight = element.styles?.fontWeight;
		const letterSpacing = element.styles?.letterSpacing;
		const elementText = element.text?.trim() || `${elementType} element`;
		
		if (!fontFamily) return;
		
		const normalizedFont = normalizeFontName(fontFamily);
		const isApprovedFont = normalizedApprovedFonts.some(approved => 
			normalizedFont === normalizeFontName(approved)
		);
		
		// Check if font is approved
		if (!isApprovedFont) {
			const violationKey = `font_family_${elementType}`;
			if (!violationsByType[violationKey]) {
				violationsByType[violationKey] = {
					elementType: elementType,
					issueType: 'typography',
					issue: 'Wrong font family',
					found: fontFamily,
					expected: normalizedApprovedFonts.join(' or '),
					severity: 'high',
					priority: 'Fix immediately',
					affectedElements: []
				};
			}
			violationsByType[violationKey].affectedElements.push({
				text: elementText,
				location: `Line ${element.index + 1}`,
				styles: { fontFamily, fontSize, fontWeight }
			});
			return;
		}
		
		// Check specific typography rules for headings
		if (elementType.startsWith('h') && brandFonts.hierarchy) {
			const headingLevel = elementType;
			const headingRules = /** @type {any} */ (brandFonts.hierarchy)[headingLevel];
			
			if (headingRules) {
				// Check font weight for headings (should be Poppins Bold 800)
				if (headingRules.weight && fontWeight && parseInt(fontWeight) !== headingRules.weight) {
					const violationKey = `font_weight_${elementType}`;
					if (!violationsByType[violationKey]) {
						violationsByType[violationKey] = {
							elementType: elementType,
							issueType: 'typography',
							issue: 'Incorrect font weight',
							found: `font-weight: ${fontWeight}`,
							expected: `font-weight: ${headingRules.weight} (${headingRules.font})`,
							severity: elementType === 'h1' || elementType === 'h2' ? 'high' : 'medium',
							priority: 'Fix soon',
							affectedElements: []
						};
					}
					violationsByType[violationKey].affectedElements.push({
						text: elementText,
						location: `Line ${element.index + 1}`,
						styles: { fontFamily, fontSize, fontWeight }
					});
				}
				
				// Check font size for headings
				if (headingRules.size && fontSize) {
					const expectedSize = headingRules.size.replace('px', '');
					const actualSize = fontSize.replace('px', '');
					if (Math.abs(parseInt(actualSize) - parseInt(expectedSize)) > 2) { // Allow 2px tolerance
						const violationKey = `font_size_${elementType}`;
						if (!violationsByType[violationKey]) {
							violationsByType[violationKey] = {
								elementType: elementType,
								issueType: 'typography',
								issue: 'Incorrect font size',
								found: `font-size: ${fontSize}`,
								expected: `font-size: ${headingRules.size}`,
								severity: 'medium',
								priority: 'Fix soon',
								affectedElements: []
							};
						}
						violationsByType[violationKey].affectedElements.push({
							text: elementText,
							location: `Line ${element.index + 1}`,
							styles: { fontFamily, fontSize, fontWeight }
						});
					}
				}
				
				// Check letter spacing for headings
				if (headingRules.letterSpacing && letterSpacing) {
					const expectedSpacing = headingRules.letterSpacing;
					const actualSpacing = letterSpacing.replace('px', '');
					if (Math.abs(parseFloat(actualSpacing) - parseFloat(expectedSpacing)) > 0.1) { // Allow 0.1px tolerance
						const violationKey = `letter_spacing_${elementType}`;
						if (!violationsByType[violationKey]) {
							violationsByType[violationKey] = {
								elementType: elementType,
								issueType: 'typography',
								issue: 'Incorrect letter spacing',
								found: `letter-spacing: ${letterSpacing}`,
								expected: `letter-spacing: ${expectedSpacing}`,
								severity: 'low',
								priority: 'Fix when possible',
								affectedElements: []
							};
						}
						violationsByType[violationKey].affectedElements.push({
							text: elementText,
							location: `Line ${element.index + 1}`,
							styles: { fontFamily, fontSize, fontWeight, letterSpacing }
						});
					}
				}
			}
		}
		
		// Check paragraph typography rules
		if (elementType === 'p' && brandFonts.hierarchy) {
			const paragraphRules = /** @type {any} */ (brandFonts.hierarchy).paragraph;
			
			// Check font weight for paragraphs (should be Roboto Regular 400)
			if (paragraphRules.weight && fontWeight && parseInt(fontWeight) !== paragraphRules.weight) {
				const violationKey = `font_weight_paragraph`;
				if (!violationsByType[violationKey]) {
					violationsByType[violationKey] = {
						elementType: elementType,
						issueType: 'typography',
						issue: 'Incorrect font weight',
						found: `font-weight: ${fontWeight}`,
						expected: `font-weight: ${paragraphRules.weight} (${paragraphRules.font})`,
						severity: 'medium',
						priority: 'Fix soon',
						affectedElements: []
					};
				}
				violationsByType[violationKey].affectedElements.push({
					text: elementText,
					location: `Line ${element.index + 1}`,
					styles: { fontFamily, fontSize, fontWeight }
			});
		}
	}
	});
	
	// Convert grouped violations to individual violations with better context
	Object.values(violationsByType).forEach(violationGroup => {
		const elementCount = violationGroup.affectedElements.length;
		const elementType = violationGroup.elementType;
		
		// Create a comprehensive violation with all affected elements
		violations.push({
			elementType: elementType,
			issueType: violationGroup.issueType,
			issue: violationGroup.issue,
			location: `${elementType.toUpperCase()} elements (${elementCount} found)`,
			found: violationGroup.found,
			expected: violationGroup.expected,
			suggestion: `📝 ${violationGroup.issue === 'Wrong font family' 
				? `Change all ${elementType} elements to use "${violationGroup.expected}" font as specified in brand guidelines.`
				: `Update ${elementType} ${violationGroup.issue.toLowerCase()} to match brand guidelines.`
			}`,
			severity: violationGroup.severity,
			impact: `${elementCount} ${elementType} element${elementCount > 1 ? 's' : ''} affected`,
			priority: violationGroup.priority,
			affectedElements: violationGroup.affectedElements.map(/** @param {any} el */ el => ({
				text: el.text.length > 60 ? el.text.substring(0, 60) + '...' : el.text,
				location: el.location,
				currentStyles: el.styles
			}))
		});
	});
	
	// Check for forbidden fonts if specified in brand guidelines
	if (brandFonts.forbiddenFonts && Array.isArray(brandFonts.forbiddenFonts)) {
		const forbiddenFonts = brandFonts.forbiddenFonts;
		const hasForbiddenFonts = foundFonts.some(/** @param {string} font */ font => 
			forbiddenFonts.some(/** @param {string} forbidden */ forbidden => 
				font.toLowerCase().includes(forbidden.toLowerCase())
			)
		);
	
	if (hasForbiddenFonts) {
		const forbiddenFound = foundFonts.filter(/** @param {string} font */ font => 
			forbiddenFonts.some(/** @param {string} forbidden */ forbidden => 
				font.toLowerCase().includes(forbidden.toLowerCase())
			)
		);
		
		violations.push({
			elementType: 'typography',
			issueType: 'typography',
			issue: 'Forbidden fonts detected',
			location: 'Forbidden fonts detected',
			elementText: `Found ${forbiddenFound.length} forbidden font(s)`,
			found: forbiddenFound.join(', '),
			expected: 'Brand-approved fonts only',
			suggestion: `📝 Replace these forbidden fonts: ${forbiddenFound.join(', ')}. Use only fonts specified in your brand guidelines.`,
			severity: 'high',
			impact: 'Violates brand guidelines',
			priority: 'Fix immediately'
		});
	}
	}
	
	// Note: Generic font consistency checks removed - only checking specific brand guideline violations
	
	return violations;
}

/**
 * @param {ScrapedData} scrapedData - Scraped website data
 * @param {BrandGuideline} brandGuideline - Brand guidelines to check against
 * @returns {Violation[]} Array of logo violations
 */
function analyzeLogo(scrapedData, brandGuideline) {
	const violations = [];
	const logoElements = scrapedData.elements?.filter(el => el.type === 'logo') || [];
	const logoGuidelines = brandGuideline.logo || {};
	
	// Check logo size against brand guidelines
	if (logoGuidelines.minWidth && logoElements.length > 0) {
		const logoElement = logoElements[0];
		if (logoElement.styles?.width) {
			const width = parseInt(logoElement.styles.width);
			const minWidth = parseInt(logoGuidelines.minWidth);
			if (width < minWidth) {
				violations.push({
					elementType: 'logo',
					issueType: 'logo',
					issue: 'Logo too small',
					location: 'Logo too small',
					elementText: `Logo width: ${logoElement.styles.width}`,
					found: `Width: ${logoElement.styles.width}`,
					expected: `Minimum ${logoGuidelines.minWidth} width`,
					suggestion: `🏷️ Make your logo larger (at least ${logoGuidelines.minWidth} wide) as specified in your brand guidelines.`,
					severity: 'medium',
					impact: 'Violates brand guidelines',
					priority: 'Fix soon'
				});
			}
		}
	}
	
	// Check logo size against maximum width if specified
	if (logoGuidelines.maxWidth && logoElements.length > 0) {
		const logoElement = logoElements[0];
		if (logoElement.styles?.width) {
			const width = parseInt(logoElement.styles.width);
			const maxWidth = parseInt(logoGuidelines.maxWidth);
			if (width > maxWidth) {
				violations.push({
					elementType: 'logo',
					issueType: 'logo',
					issue: 'Logo too large',
					location: 'Logo too large',
					elementText: `Logo width: ${logoElement.styles.width}`,
					found: `Width: ${logoElement.styles.width}`,
					expected: `Maximum ${logoGuidelines.maxWidth} width`,
					suggestion: `🏷️ Make your logo smaller (maximum ${logoGuidelines.maxWidth} wide) as specified in your brand guidelines.`,
					severity: 'medium',
					impact: 'Violates brand guidelines',
					priority: 'Fix soon'
				});
			}
		}
	}
	
	return violations;
}

// Layout analysis removed - only checking brand guideline violations
// Layout structure is not part of brand guidelines unless specifically defined

/**
 * @param {ScrapedData} scrapedData - Scraped website data
 * @param {BrandGuideline} brandGuideline - Brand guidelines to check against
 * @returns {Violation[]} Array of tone of voice violations
 */
function analyzeToneOfVoice(scrapedData, brandGuideline) {
	const violations = [];
	const textElements = scrapedData.elements?.filter(el => 
		el.text && el.text.length > 10
	) || [];
	const toneGuidelines = brandGuideline.voiceAndTone || {};
	
	// Check for forbidden words if specified in brand guidelines
	if (toneGuidelines.forbiddenWords && Array.isArray(toneGuidelines.forbiddenWords)) {
		const forbiddenWords = toneGuidelines.forbiddenWords;
		const violatingElements = textElements.filter(/** @param {ScrapedElement} el */ el => 
			forbiddenWords.some(/** @param {string} word */ word => 
				el.text.toLowerCase().includes(word.toLowerCase())
			)
		);
		
		if (violatingElements.length > 0) {
			const foundWords = forbiddenWords.filter(/** @param {string} word */ word => 
				violatingElements.some(/** @param {ScrapedElement} el */ el => 
					el.text.toLowerCase().includes(word.toLowerCase())
				)
			);
			
		violations.push({
			elementType: 'tone_of_voice',
			issueType: 'tone_of_voice',
			issue: 'Forbidden words detected',
			location: 'Tone guideline violation',
			elementText: `Found ${violatingElements.length} element(s) with forbidden words`,
			found: foundWords.join(', '),
			expected: 'Brand-approved language only',
			suggestion: `💬 Replace these words with alternatives that match your brand tone: ${foundWords.join(', ')}.`,
			severity: 'medium',
			impact: 'Violates brand tone guidelines',
			priority: 'Fix soon'
		});
		}
	}
	
	// Check for preferred keywords if specified in guidelines
	if (toneGuidelines.keywords && Array.isArray(toneGuidelines.keywords)) {
		const preferredKeywords = toneGuidelines.keywords;
		const hasPreferredKeywords = textElements.some(/** @param {ScrapedElement} el */ el => 
			preferredKeywords.some(/** @param {string} keyword */ keyword => 
				el.text.toLowerCase().includes(keyword.toLowerCase())
			)
		);
		
		// This is more of a positive reinforcement, so we won't create violations
		// Just log that preferred keywords are being used
		if (hasPreferredKeywords) {
			console.log('✅ Brand-preferred keywords detected in content');
		}
	}
	
	return violations;
}

/**
 * @param {Violation[]} violations - Array of violations to process
 * @returns {Violation[]} Processed violations with adjusted severity
 */
function preprocessViolationSeverity(violations) {
	return violations.map(/** @param {Violation} violation */ violation => {
		// Create a copy to avoid mutating the original
		const processed = { ...violation };
		
		// Enforce severity rules for specific high-impact issues
		if (violation.issueType === 'typography' && 
			(violation.elementType.includes('h1') || violation.elementType.includes('h2'))) {
			processed.severity = 'high'; // Main headings must use correct font
		}
		
		if (violation.elementType === 'logo' && 
			(violation.issueType === 'missing' || violation.issueType === 'wrong_usage')) {
			processed.severity = 'critical'; // Missing or wrong logo is critical
		}
		
		if (violation.issueType === 'color' && 
			violation.elementType.includes('primary') && 
			violation.severity !== 'critical') {
			processed.severity = 'high'; // Primary color violations are high severity
		}
		
		if (violation.issueType === 'tone_of_voice' && 
			violation.found && 
			(violation.found.includes('awesome') || violation.found.includes('amazing') || 
			 violation.found.includes('epic') || violation.found.includes('insane'))) {
			processed.severity = 'medium'; // Unprofessional language is medium severity
		}
		
		// Ensure severity is valid
		if (!['critical', 'high', 'medium', 'low'].includes(processed.severity)) {
			processed.severity = 'medium'; // Default to medium if invalid
		}
		
		return processed;
	});
}