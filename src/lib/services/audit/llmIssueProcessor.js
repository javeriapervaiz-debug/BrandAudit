// @ts-nocheck
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGoogleAIAPIKey } from '../../config/llmConfig.js';

/**
 * LLM-based issue processing service for grouping similar issues and generating CSS fixes
 */
export class LLMIssueProcessor {
  constructor() {
    this.apiKey = getGoogleAIAPIKey();
    this.model = new GoogleGenerativeAI(this.apiKey).getGenerativeModel({ 
      model: 'gemini-flash-latest'
    });
  }

  /**
   * Group similar issues together to reduce repetition
   */
  async groupSimilarIssues(issues) {
    if (!issues || issues.length === 0) return [];

    try {
      const prompt = `
Analyze the following brand compliance issues and group similar ones together. 
Create a summary for each group instead of listing individual elements.

Issues to analyze:
${JSON.stringify(issues, null, 2)}

Return a JSON array with grouped issues. Each group should have:
- type: "typography", "color", "logo", "spacing", etc.
- severity: "high", "medium", "low"
- description: A single summary description for the group
- elements: Array of element types affected (e.g., ["h1", "h2", "h3", "p", "button"])
- count: Number of individual issues in this group
- details: Object with expected vs found values
- recommendation: Single recommendation for the group

Example format:
[
  {
    "type": "typography",
    "severity": "high", 
    "description": "All headings and body text use incorrect font family",
    "elements": ["h1", "h2", "h3", "h4", "p", "button"],
    "count": 8,
    "details": {
      "expected": "Roobert",
      "found": "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial"
    },
    "recommendation": "Update all text elements to use Roobert font family"
  }
]

Group similar issues together and provide concise, actionable summaries.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse LLM response as JSON:', parseError);
      }
      
      return issues; // Fallback to original issues
    } catch (error) {
      console.error('❌ LLM issue grouping failed:', error);
      return issues; // Fallback to original issues
    }
  }

  /**
   * Generate proper CSS fixes for issues using LLM
   */
  async generateCSSFixes(groupedIssues) {
    if (!groupedIssues || groupedIssues.length === 0) return [];

    try {
      const prompt = `
Generate proper CSS fixes for the following brand compliance issues.
For each issue, provide a complete, valid CSS rule that can be copied and used.

Issues to fix:
${JSON.stringify(groupedIssues, null, 2)}

Return a JSON array with CSS fixes. Each fix should have:
- type: The issue type
- selector: The CSS selector (e.g., "h1, h2, h3", ".button", "body")
- property: The CSS property to fix
- value: The correct value
- css: Complete CSS rule
- explanation: Brief explanation of the fix

Example format:
[
  {
    "type": "typography",
    "selector": "h1, h2, h3, h4, p, button",
    "property": "font-family",
    "value": "Roobert, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "css": "h1, h2, h3, h4, p, button {\n  font-family: Roobert, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n}",
    "explanation": "Updates all text elements to use Roobert as the primary font with appropriate fallbacks"
  }
]

Generate complete, valid CSS that addresses each issue group.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse LLM CSS response as JSON:', parseError);
      }
      
      return []; // Fallback to empty array
    } catch (error) {
      console.error('❌ LLM CSS generation failed:', error);
      return []; // Fallback to empty array
    }
  }

  /**
   * Simple fallback grouping without LLM
   */
  fallbackGroupIssues(issues) {
    const groups = {};
    
    issues.forEach(issue => {
      const key = `${issue.type}-${issue.severity}`;
      if (!groups[key]) {
        groups[key] = {
          type: issue.type,
          severity: issue.severity,
          description: issue.description,
          elements: [issue.context?.element || 'unknown'],
          count: 1,
          details: issue.details,
          recommendation: issue.recommendation || `Fix ${issue.type} issues`
        };
      } else {
        groups[key].count++;
        if (issue.context?.element && !groups[key].elements.includes(issue.context.element)) {
          groups[key].elements.push(issue.context.element);
        }
      }
    });
    
    return Object.values(groups);
  }

  /**
   * Simple fallback CSS generation
   */
  fallbackGenerateCSS(groupedIssues) {
    return groupedIssues.map(issue => ({
      type: issue.type,
      selector: issue.elements.join(', '),
      property: issue.type === 'typography' ? 'font-family' : 'color',
      value: issue.details?.expected || 'inherit',
      css: `${issue.elements.join(', ')} {\n  ${issue.type === 'typography' ? 'font-family' : 'color'}: ${issue.details?.expected || 'inherit'};\n}`,
      explanation: `Fix ${issue.type} issues for ${issue.elements.join(', ')}`
    }));
  }

  /**
   * Process issues: group similar ones and generate CSS fixes
   */
  async processIssues(issues) {
    console.log('🧠 LLM Issue Processing - Starting...');
    
    try {
      // Group similar issues
      const groupedIssues = await this.groupSimilarIssues(issues);
      console.log(`📊 Grouped ${issues.length} issues into ${groupedIssues.length} groups`);
      
      // Generate CSS fixes
      const cssFixes = await this.generateCSSFixes(groupedIssues);
      console.log(`🎨 Generated ${cssFixes.length} CSS fixes`);
      
      // Merge grouped issues with CSS fixes
      const processedIssues = groupedIssues.map((issue, index) => ({
        ...issue,
        cssFix: cssFixes[index] || null,
        id: `issue-${index}`
      }));
      
      console.log('✅ LLM Issue Processing complete');
      return processedIssues;
    } catch (error) {
      console.warn('⚠️ LLM processing failed, using fallback grouping...');
      
      // Fallback to simple grouping
      const groupedIssues = this.fallbackGroupIssues(issues);
      const cssFixes = this.fallbackGenerateCSS(groupedIssues);
      
      const processedIssues = groupedIssues.map((issue, index) => ({
        ...issue,
        cssFix: cssFixes[index] || null,
        id: `issue-${index}`
      }));
      
      console.log(`📊 Fallback grouped ${issues.length} issues into ${groupedIssues.length} groups`);
      return processedIssues;
    }
  }
}

export default LLMIssueProcessor;
