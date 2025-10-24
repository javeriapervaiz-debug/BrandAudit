// Real LLM Integration for Brand Compliance Analysis
import { OPENAI_API_KEY, GOOGLE_AI_API_KEY } from '$env/static/private';

export async function analyzeWithLLM(scrapedData, brandGuideline) {
	try {
		// Debug logging for API keys
		console.log('🔑 API Key Debug:');
		console.log('  GOOGLE_AI_API_KEY exists:', !!GOOGLE_AI_API_KEY);
		console.log('  GOOGLE_AI_API_KEY value:', GOOGLE_AI_API_KEY ? GOOGLE_AI_API_KEY.substring(0, 10) + '...' : 'undefined');
		console.log('  OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
		console.log('  OPENAI_API_KEY value:', OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'undefined');
		
		// Try Google AI Studio first (free), then OpenAI
		if (GOOGLE_AI_API_KEY && GOOGLE_AI_API_KEY !== 'your_google_ai_api_key_here') {
			console.log('Using Google AI Studio (Gemini)...');
			try {
				return await analyzeWithGemini(scrapedData, brandGuideline);
			} catch (geminiError) {
				console.error('Google AI Studio failed, trying OpenAI:', geminiError.message);
				if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
					console.log('Using OpenAI API key:', OPENAI_API_KEY.substring(0, 10) + '...');
					return await analyzeWithOpenAI(scrapedData, brandGuideline);
				} else {
					throw geminiError;
				}
			}
		} else if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
			console.log('Using OpenAI API key:', OPENAI_API_KEY.substring(0, 10) + '...');
			return await analyzeWithOpenAI(scrapedData, brandGuideline);
		} else {
			throw new Error('No API key configured. Please set GOOGLE_AI_API_KEY or OPENAI_API_KEY in your .env file.');
		}
	} catch (error) {
		console.error('LLM Analysis Error:', error);
		throw error;
	}
}

async function analyzeWithGemini(scrapedData, brandGuideline) {
	// Pre-process scraped data to reduce prompt size and focus on relevant information
	const relevantData = preprocessScrapedData(scrapedData);
	
	const prompt = `
You are a Brand Compliance Officer analyzing a website against brand guidelines. 

Analyze the provided "Website Data" against the "Brand Guidelines" and identify discrepancies.
Be fair and balanced - recognize when a website follows the general brand aesthetic even if it has specific violations.

Output your findings as a valid JSON object with this exact structure:
{
  "violations": [
    {
      "elementType": "logo",
      "issueType": "color", 
      "location": "Header",
      "elementText": "Logo text if applicable",
      "found": "What was found on the website",
      "expected": "What the brand guideline requires",
      "suggestion": "Specific action to fix the issue",
      "severity": "high"
    }
  ]
}

Focus on these key areas:
1. Color violations (wrong colors, missing brand colors)
2. Typography violations (wrong fonts, sizes, weights)
3. Logo usage violations (missing, wrong size, wrong placement)
4. Layout and spacing violations
5. Tone of voice violations (unprofessional language)

Severity Guidelines:
- HIGH: Fundamental brand identity violations (wrong primary colors, wrong main fonts, missing logo)
- MEDIUM: Important but not critical violations (wrong secondary colors, font weight issues)
- LOW: Minor violations (spacing issues, tone of voice, minor color shades)

Additional Grading Guidelines:
- Be reasonable: Don't mark every single pixel difference. Focus on meaningful deviations.
- Consider context: A slightly different shade of blue in a footer is less severe than in the main logo.
- Group similar issues: If the same color error appears on 10 buttons, consider counting it as 1 recurring issue rather than 10 separate violations for a more fair score.
- Acknowledge partial compliance: If a website uses the correct font family but wrong weight, acknowledge the partial compliance.
- Focus on user impact: Violations that significantly affect brand recognition are more severe than minor styling inconsistencies.

Be thorough but fair. A website that captures the brand's overall aesthetic should not get a very low score.

BRAND GUIDELINES:
${JSON.stringify(brandGuideline, null, 2)}

WEBSITE DATA:
${JSON.stringify(relevantData, null, 2)}`;

	// Call Google AI Studio API
	const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GOOGLE_AI_API_KEY}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			contents: [{
				parts: [{
					text: prompt
				}]
			}],
			generationConfig: {
				temperature: 0.1,
				maxOutputTokens: 4000,
				responseMimeType: "application/json"
			}
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('Google AI API Error Response:', errorText);
		throw new Error(`Google AI API error: ${response.status} ${response.statusText} - ${errorText}`);
	}

	const data = await response.json();
	
	// Check if the response has the expected structure
	if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
		console.error('Unexpected Google AI API response structure:', JSON.stringify(data, null, 2));
		throw new Error('Invalid response structure from Google AI API');
	}

	const responseText = data.candidates[0].content.parts[0].text;
	console.log('Google AI Response:', responseText.substring(0, 500) + '...');

	// Try to parse the JSON response
	let analysis;
	try {
		analysis = JSON.parse(responseText);
	} catch (parseError) {
		console.error('JSON Parse Error:', parseError);
		console.error('Response text length:', responseText.length);
		console.error('Response text (first 1000 chars):', responseText.substring(0, 1000));
		console.error('Response text (last 500 chars):', responseText.substring(Math.max(0, responseText.length - 500)));
		
		// Try to fix common JSON truncation issues
		let fixedResponse = responseText;
		
		// If the response ends abruptly, try to close it properly
		if (responseText.includes('"severity"') && !responseText.trim().endsWith('}')) {
			// Find the last complete violation and close the JSON
			const lastCompleteViolation = responseText.lastIndexOf('}');
			if (lastCompleteViolation > 0) {
				fixedResponse = responseText.substring(0, lastCompleteViolation + 1);
				// Add closing bracket for violations array and main object
				if (!fixedResponse.includes('"violations"')) {
					fixedResponse = '{"violations":[]}';
				} else if (!fixedResponse.endsWith(']}')) {
					fixedResponse = fixedResponse.replace(/,\s*$/, '') + ']}';
				}
			}
		}
		
		try {
			analysis = JSON.parse(fixedResponse);
			console.log('Successfully fixed truncated JSON response');
		} catch (fixError) {
			console.error('Failed to fix JSON, using fallback analysis');
			throw new Error(`Invalid JSON response from Google AI API (truncated): ${parseError.message}`);
		}
	}

	// Validate the response structure
	if (!analysis || !Array.isArray(analysis.violations)) {
		console.error('Invalid analysis structure:', analysis);
		throw new Error('Invalid response format from Google AI API - missing violations array');
	}

	// CRITICAL FIX: Normalize severity case first (LLM returns UPPERCASE, code expects lowercase)
	const normalizedViolations = analysis.violations.map(v => ({
		...v,
		severity: v.severity ? v.severity.toLowerCase() : 'low'
	}));
	
	// Pre-process violations to ensure consistent severity labeling
	const processedViolations = preprocessViolationSeverity(normalizedViolations);
	
	// Calculate compliance score using refined approach
	const totalViolations = processedViolations.length;
	const criticalSeverity = processedViolations.filter(v => v.severity === 'critical').length;
	const highSeverity = processedViolations.filter(v => v.severity === 'high').length;
	const mediumSeverity = processedViolations.filter(v => v.severity === 'medium').length;
	const lowSeverity = processedViolations.filter(v => v.severity === 'low').length;
	
	// Debug logging to verify counting
	console.log(`Counted violations: ${criticalSeverity} critical, ${highSeverity} high, ${mediumSeverity} medium, ${lowSeverity} low`);

	// More realistic scoring that recognizes partial compliance
	let score = 100;
	
	// Deduct points based on severity with refined caps
	// Critical severity: -8 points each (max 40 points for 5+ violations)
	score -= Math.min(criticalSeverity * 8, 40);
	
	// High severity: -5 points each (max 40 points for 8+ violations)
	score -= Math.min(highSeverity * 5, 40);
	
	// Medium severity: -3 points each (max 24 points for 8+ violations)  
	score -= Math.min(mediumSeverity * 3, 24);
	
	// Low severity: -1 point each (max 12 points for 12+ violations)
	score -= Math.min(lowSeverity * 1, 12);
	
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
	console.log(`Score Calculation: 100 - ${Math.min(criticalSeverity * 8, 40)} (critical) - ${Math.min(highSeverity * 5, 40)} (high) - ${Math.min(mediumSeverity * 3, 24)} (med) - ${Math.min(lowSeverity * 1, 12)} (low) + ${hasBrandElements ? 3 : 0} (bonus) = ${score}`);

	return {
		score: Math.round(score),
		totalViolations,
		severityBreakdown: {
			critical: criticalSeverity,
			high: highSeverity,
			medium: mediumSeverity,
			low: lowSeverity
		},
		violations: processedViolations,
		summary: {
			criticalIssues: criticalSeverity,
			moderateIssues: highSeverity + mediumSeverity,
			minorIssues: lowSeverity,
			overallCompliance: score >= 85 ? 'Excellent' : 
							  score >= 70 ? 'Good' : 
							  score >= 55 ? 'Needs Improvement' : 
							  score >= 40 ? 'Poor' : 'Very Poor'
		},
		analysisType: 'real_llm'
	};
}

async function analyzeWithOpenAI(scrapedData, brandGuideline) {
	// Pre-process scraped data to reduce prompt size and focus on relevant information
	const relevantData = preprocessScrapedData(scrapedData);
	
	// Construct the prompt for the LLM
	const prompt = `
You are a Brand Compliance Officer analyzing a website against brand guidelines. 

Analyze the provided "Website Data" against the "Brand Guidelines" and identify discrepancies.
Be fair and balanced - recognize when a website follows the general brand aesthetic even if it has specific violations.

Output your findings as a valid JSON object with this exact structure:
{
  "violations": [
    {
      "elementType": "logo",
      "issueType": "color",
      "location": "Header", 
      "elementText": "Logo text if applicable",
      "found": "What was found on the website",
      "expected": "What the brand guideline requires",
      "suggestion": "Specific action to fix the issue",
      "severity": "high"
    }
  ]
}

Focus on these key areas:
1. Color violations (wrong colors, missing brand colors)
2. Typography violations (wrong fonts, sizes, weights)
3. Logo usage violations (missing, wrong size, wrong placement)
4. Layout and spacing violations
5. Tone of voice violations (unprofessional language)

Severity Guidelines:
- HIGH: Fundamental brand identity violations (wrong primary colors, wrong main fonts, missing logo)
- MEDIUM: Important but not critical violations (wrong secondary colors, font weight issues)
- LOW: Minor violations (spacing issues, tone of voice, minor color shades)

Additional Grading Guidelines:
- Be reasonable: Don't mark every single pixel difference. Focus on meaningful deviations.
- Consider context: A slightly different shade of blue in a footer is less severe than in the main logo.
- Group similar issues: If the same color error appears on 10 buttons, consider counting it as 1 recurring issue rather than 10 separate violations for a more fair score.
- Acknowledge partial compliance: If a website uses the correct font family but wrong weight, acknowledge the partial compliance.
- Focus on user impact: Violations that significantly affect brand recognition are more severe than minor styling inconsistencies.

Be thorough but fair. A website that captures the brand's overall aesthetic should not get a very low score.

BRAND GUIDELINES:
${JSON.stringify(brandGuideline, null, 2)}

WEBSITE DATA:
${JSON.stringify(relevantData, null, 2)}`;

	// Call OpenAI API
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${OPENAI_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'gpt-4o',
			messages: [
				{
					role: 'system',
					content: 'You are a professional brand compliance officer with expertise in design systems and brand guidelines. Always respond with valid JSON.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			response_format: { type: "json_object" },
			temperature: 0.1,
			max_tokens: 4000
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('OpenAI API Error Response:', errorText);
		throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
	}

	const data = await response.json();
	const responseText = data.choices[0].message.content;
	
	// Try to parse the JSON response with robust error handling
	let analysis;
	try {
		analysis = JSON.parse(responseText);
	} catch (parseError) {
		console.error('OpenAI JSON Parse Error:', parseError);
		console.error('Response text length:', responseText.length);
		console.error('Response text (first 1000 chars):', responseText.substring(0, 1000));
		console.error('Response text (last 500 chars):', responseText.substring(Math.max(0, responseText.length - 500)));
		
		// Try to fix common JSON truncation issues
		let fixedResponse = responseText;
		
		// If the response ends abruptly, try to close it properly
		if (responseText.includes('"severity"') && !responseText.trim().endsWith('}')) {
			// Find the last complete violation and close the JSON
			const lastCompleteViolation = responseText.lastIndexOf('}');
			if (lastCompleteViolation > 0) {
				fixedResponse = responseText.substring(0, lastCompleteViolation + 1);
				// Add closing bracket for violations array and main object
				if (!fixedResponse.includes('"violations"')) {
					fixedResponse = '{"violations":[]}';
				} else if (!fixedResponse.endsWith(']}')) {
					fixedResponse = fixedResponse.replace(/,\s*$/, '') + ']}';
				}
			}
		}
		
		try {
			analysis = JSON.parse(fixedResponse);
			console.log('Successfully fixed truncated OpenAI JSON response');
		} catch (fixError) {
			console.error('Failed to fix OpenAI JSON, using fallback analysis');
			throw new Error(`Invalid JSON response from OpenAI API (truncated): ${parseError.message}`);
		}
	}

	// Validate the response structure
	if (!analysis || !Array.isArray(analysis.violations)) {
		console.error('Invalid analysis structure:', analysis);
		throw new Error('Invalid response format from OpenAI API - missing violations array');
	}

	return analysis;
}

// Pre-process scraped data to reduce prompt size and focus on relevant information
// Normalize color values to prevent false positives
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

function preprocessScrapedData(scrapedData) {
	// Keep only the most essential information for brand compliance analysis
	const relevantData = {
		url: scrapedData.url,
		title: scrapedData.title,
		metaDescription: scrapedData.metaDescription,
		// Filter and simplify elements
		elements: (scrapedData.elements || []).map(element => {
			const simplifiedElement = {
				type: element.type,
				text: element.text ? element.text.substring(0, 150) : '', // Limit text length
				styles: {}
			};
			
			// Only include the most crucial styles for brand analysis
			if (element.styles) {
				const importantStyles = [
					'color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight',
					'width', 'height', 'margin', 'padding', 'borderRadius', 'border',
					'textAlign', 'lineHeight', 'letterSpacing'
				];
				
				importantStyles.forEach(style => {
					if (element.styles[style]) {
						// Normalize color values to prevent false positives
						if (style === 'color' || style === 'backgroundColor') {
							simplifiedElement.styles[style] = normalizeColor(element.styles[style]);
						} else {
							simplifiedElement.styles[style] = element.styles[style];
						}
					}
				});
			}
			
			// Keep position data for spatial analysis (logos, layout)
			if (element.position) {
				simplifiedElement.position = element.position;
			}
			
			// Keep size data for logo analysis
			if (element.size) {
				simplifiedElement.size = element.size;
			}
			
			// Keep specific properties for different element types
			if (element.type === 'logo' && element.src) {
				simplifiedElement.src = element.src;
				simplifiedElement.alt = element.alt || '';
			}
			
			if (element.type === 'navigation' && element.items) {
				simplifiedElement.items = element.items.map(item => ({
					text: item.text ? item.text.substring(0, 50) : '', // Limit navigation text
					href: item.href
				}));
			}
			
			if (element.type === 'form_input') {
				simplifiedElement.inputType = element.inputType;
				simplifiedElement.placeholder = element.placeholder ? element.placeholder.substring(0, 50) : '';
			}
			
			return simplifiedElement;
		}),
		// Keep colors and fonts as they are essential, normalize colors
		colors: (scrapedData.colors || []).map(normalizeColor),
		fonts: scrapedData.fonts || [],
		// Remove screenshot to save space (not needed for text analysis)
		// screenshot: scrapedData.screenshot
	};
	
	console.log(`Preprocessed data: ${JSON.stringify(relevantData).length} characters (reduced from ${JSON.stringify(scrapedData).length})`);
	
	return relevantData;
}

function preprocessViolationSeverity(violations) {
	return violations.map(violation => {
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