// @ts-nocheck
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGoogleAIAPIKey } from '../../config/llmConfig.js';

/**
 * Solution-focused LLM processor that provides actionable fixes
 */
export class SolutionLLMProcessor {
  constructor() {
    this.apiKey = getGoogleAIAPIKey();
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 3000,
      }
    });
  }

  /**
   * Generate actionable solutions for brand compliance issues
   */
  async generateActionableSolutions(issues, brandGuidelines, scrapedData) {
    if (!issues || issues.length === 0) return [];

    try {
      const prompt = this.buildSolutionsPrompt(issues, brandGuidelines, scrapedData);
      const response = await this.generateContentWithRetry(prompt);
      
      if (!response) {
        console.warn('⚠️ LLM solutions failed, using fallback');
        return this.fallbackGenerateSolutions(issues, brandGuidelines);
      }

      const solutions = this.parseLLMResponse(response);
      
      if (Array.isArray(solutions) && solutions.length > 0) {
        console.log(`✅ Generated ${solutions.length} actionable solutions`);
        return solutions;
      } else {
        console.warn('⚠️ LLM returned empty or invalid solutions, using fallback');
        return this.fallbackGenerateSolutions(issues, brandGuidelines);
      }
      
    } catch (error) {
      console.error('❌ LLM solutions generation failed:', error);
      return this.fallbackGenerateSolutions(issues, brandGuidelines);
    }
  }

  buildSolutionsPrompt(issues, brandGuidelines, scrapedData) {
    const brandName = brandGuidelines?.brandName || 'the brand';
    const primaryColor = brandGuidelines?.colors?.primary?.hex || '#000000';
    const secondaryColor = brandGuidelines?.colors?.secondary?.hex || '#666666';
    const primaryFont = brandGuidelines?.typography?.primary?.font || 'Arial';
    const secondaryFont = brandGuidelines?.typography?.secondary?.font || 'Arial';

    // Extract current implementation details
    const currentFonts = scrapedData?.typography?.fonts?.join(', ') || 'Unknown';
    const currentColors = scrapedData?.colors?.palette?.slice(0, 5).join(', ') || 'Unknown';

    return `
You are a senior web developer and brand compliance expert. Your task is to provide SPECIFIC, ACTIONABLE SOLUTIONS to fix brand compliance issues.

BRAND GUIDELINES FOR ${brandName.toUpperCase()}:
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor} 
- Primary Font: ${primaryFont}
- Secondary Font: ${secondaryFont}

CURRENT IMPLEMENTATION:
- Current Fonts: ${currentFonts}
- Current Colors: ${currentColors}

ISSUES THAT NEED SOLUTIONS:
${JSON.stringify(issues, null, 2)}

CRITICAL REQUIREMENTS:
1. Provide SPECIFIC SOLUTIONS, not just problem descriptions
2. Each solution must be ACTIONABLE and IMPLEMENTABLE
3. Include EXACT CSS code, HTML changes, or specific steps
4. Solutions must use the EXACT brand values from guidelines
5. Focus on HOW to fix, not just what's wrong

SOLUTION FORMAT - Return JSON array with:
[
  {
    "issueTitle": "Short description of the problem",
    "problem": "What exactly is wrong",
    "solution": "Specific, step-by-step solution",
    "implementation": {
      "css": "Exact CSS code to implement",
      "html": "HTML changes if needed", 
      "steps": ["Step 1", "Step 2", "Step 3"]
    },
    "priority": "high/medium/low",
    "estimatedTime": "15 minutes, 1 hour, etc.",
    "expectedResult": "What will be fixed after implementation"
  }
]

Generate 3-5 most critical solutions. Focus on SPECIFIC IMPLEMENTATION STEPS.

Return ONLY the JSON array, no other text.
`;
  }

  /**
   * Robust content generation
   */
  async generateContentWithRetry(prompt, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        
        if (!response?.text) throw new Error('Empty response');
        
        const text = response.text().trim();
        if (text.length < 10) throw new Error('Response too short');
        
        return text;
        
      } catch (error) {
        console.warn(`⚠️ LLM attempt ${attempt + 1} failed:`, error.message);
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return null;
  }

  /**
   * Fallback solutions when LLM fails
   */
  fallbackGenerateSolutions(issues, brandGuidelines) {
    const brandName = brandGuidelines?.brandName || 'the brand';
    const primaryColor = brandGuidelines?.colors?.primary?.hex || '#000000';
    const primaryFont = brandGuidelines?.typography?.primary?.font || 'Arial';

    const solutions = [];

    // Color issues solution
    if (issues.some(issue => issue.category === 'colors' || issue.type === 'colors')) {
      solutions.push({
        issueTitle: "Brand Colors Not Implemented",
        problem: `Website is not using the primary brand color ${primaryColor}`,
        solution: `Implement ${primaryColor} across all primary UI elements`,
        implementation: {
          css: `/* Primary Brand Color Implementation */\n.primary-button, .cta-button, .header {\n  background-color: ${primaryColor};\n}\n\nh1, h2, h3, .primary-text {\n  color: ${primaryColor};\n}\n\n.border-brand {\n  border-color: ${primaryColor};\n}`,
          html: "Add CSS classes to relevant HTML elements",
          steps: [
            `Add the CSS above to your stylesheet`,
            `Apply 'primary-button' class to main CTA buttons`,
            `Apply 'primary-text' class to important headings`,
            `Test that ${primaryColor} appears correctly`
          ]
        },
        priority: "high",
        estimatedTime: "25 minutes",
        expectedResult: `Primary brand color ${primaryColor} will be visible throughout the site`
      });
    }

    // Typography issues solution
    if (issues.some(issue => issue.category === 'typography' || issue.type === 'typography')) {
      solutions.push({
        issueTitle: "Incorrect Font Family",
        problem: `Website using incorrect fonts instead of ${primaryFont}`,
        solution: `Update global font stack to use ${primaryFont}`,
        implementation: {
          css: `/* Global Font Update */\nbody, h1, h2, h3, h4, h5, h6, p, button, a, input, textarea {\n  font-family: '${primaryFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n}`,
          html: "Ensure font is loaded via CDN or local files",
          steps: [
            `Add font import if using Google Fonts: @import url('https://fonts.googleapis.com/css2?family=...')`,
            `Replace existing font-family declarations with the CSS above`,
            `Test all text elements to ensure ${primaryFont} is applied`
          ]
        },
        priority: "high",
        estimatedTime: "30 minutes",
        expectedResult: `All text will display in ${primaryFont} as required`
      });
    }

    // Logo issues solution
    if (issues.some(issue => issue.category === 'logo' || issue.type === 'logo')) {
      solutions.push({
        issueTitle: "Brand Logo Missing",
        problem: "Official brand logo is not present on the page",
        solution: "Add the official brand logo to the header area",
        implementation: {
          css: `.brand-logo {\n  height: 40px;\n  width: auto;\n  display: block;\n}`,
          html: `<header>\n  <a href="/" class="brand-logo">\n    <img src="/assets/brand-logo.svg" alt="${brandName} Logo" />\n  </a>\n</header>`,
          steps: [
            "Add the HTML structure to your header",
            "Upload the official logo to /assets/brand-logo.svg",
            "Apply the CSS for proper sizing",
            "Test logo visibility and linking"
          ]
        },
        priority: "high",
        estimatedTime: "15 minutes",
        expectedResult: "Official brand logo will be visible in the header"
      });
    }

    return solutions.slice(0, 3); // Return top 3 solutions
  }

  /**
   * JSON parsing with error handling and repair
   */
  parseLLMResponse(text) {
    try {
      let cleanText = text.trim()
        .replace(/```json\s*/g, '')
        .replace(/\s*```/g, '')
        .replace(/```/g, ''); // Remove any remaining markdown
      
      const jsonStart = cleanText.indexOf('[');
      const jsonEnd = cleanText.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        console.error('❌ No JSON array found in response');
        return []; // Return empty array instead of throwing
      }
      
      cleanText = cleanText.substring(jsonStart, jsonEnd);
      
      // Try to fix common JSON issues
      cleanText = this.repairJson(cleanText);
      
      const parsed = JSON.parse(cleanText);
      return Array.isArray(parsed) ? parsed : [];
      
    } catch (error) {
      console.error('❌ JSON parsing failed after repair:', error.message);
      console.error('📄 Failed text snippet:', text.substring(0, 200));
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Repair common JSON issues
   */
  repairJson(jsonText) {
    let repaired = jsonText;
    
    // Fix trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix missing commas between properties (basic attempt)
    repaired = repaired.replace(/}([\s\n]*){/g, '},{');
    
    // Fix unclosed strings
    repaired = repaired.replace(/:\s*"([^"]*?)([\r\n]+)([^"]*?)"/g, ':"$1 $3"');
    
    // Remove comments
    repaired = repaired.replace(/\/\/.*$/gm, '');
    repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, '');
    
    return repaired;
  }

  /**
   * Main processing method
   */
  async processIssues(issues, brandGuidelines, scrapedData) {
    console.log('🛠️ Generating actionable solutions...');
    
    const solutions = await this.generateActionableSolutions(issues, brandGuidelines, scrapedData);
    
    return {
      solutions: solutions,
      summary: this.generateSummary(solutions)
    };
  }

  generateSummary(solutions) {
    const highPriority = solutions.filter(s => s.priority === 'high').length;
    
    return {
      totalSolutions: solutions.length,
      highPriorityIssues: highPriority,
      recommendation: `Start with the ${highPriority} high-priority solutions for maximum impact`
    };
  }
}

export default SolutionLLMProcessor;
