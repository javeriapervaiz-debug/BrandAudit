/**
 * Google AI (Gemini) Service
 * Real implementation of Google AI API integration for brand guideline enhancement
 * Uses the free Gemini API which is more cost-effective than OpenAI
 */

import { getLLMConfig, getGoogleAIAPIKey } from '../../config/llmConfig.js';

export class GoogleAIService {
  constructor() {
    this.config = getLLMConfig('google');
    this.apiKey = getGoogleAIAPIKey();
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-flash-latest'; // Working model
  }

  /**
   * Check if Google AI is properly configured
   */
  isConfigured() {
    const apiKey = getGoogleAIAPIKey();
    // Check if we're in a browser environment and API key is not available
    if (typeof window !== 'undefined' && !apiKey) {
      console.warn('⚠️ Google AI API key not available in browser environment');
      return false;
    }
    return !!apiKey && apiKey.length > 10;
  }

  /**
   * Make a request to Google AI API
   */
  async makeRequest(prompt, options = {}) {
    const apiKey = getGoogleAIAPIKey();
    if (!apiKey) {
      throw new Error('Google AI API key not configured');
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: options.temperature || this.config.temperature,
        maxOutputTokens: options.maxTokens || this.config.maxTokens,
        responseMimeType: "application/json"
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google AI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Google AI API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Google AI API request failed:', error);
      throw error;
    }
  }

  /**
   * Enhance brand guidelines using Google AI Gemini
   */
  async enhanceBrandGuidelines(text, brandName, baseResult, context) {
    const prompt = this.buildEnhancementPrompt(text, brandName, baseResult, context);
    
    try {
      console.log('🤖 Using Google AI Gemini for brand guideline enhancement...');
      const response = await this.makeRequest(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Google AI enhancement failed:', error);
      throw error;
    }
  }

  /**
   * Build enhancement prompt optimized for Gemini
   */
  buildEnhancementPrompt(text, brandName, baseResult, context) {
    const textSample = text.substring(0, 12000);
    
    return `You are a brand identity expert. Extract and enhance brand guideline data for "${brandName}" from the following text.

CURRENT EXTRACTION CONFIDENCE: ${baseResult.metadata.confidence}

HISTORICAL CONTEXT:
${context.historicalData ? JSON.stringify(context.historicalData, null, 2) : 'No historical data available'}

CURRENT EXTRACTION:
${JSON.stringify(baseResult, null, 2)}

TEXT TO ANALYZE:
"""${textSample}"""

Enhance the extraction by:
1. Filling missing information using semantic understanding
2. Correcting obvious errors
3. Using historical context for consistency
4. Standardizing the output format
5. IMPORTANT: Look for hex color codes both with (#003366) and without (#003366) the # symbol
6. Extract color names from context like "Primary:", "Secondary:", "Accent:", etc.
7. Convert any 6-digit hex codes without # to proper hex format (e.g., 003366 → #003366)

Return ONLY valid JSON with this exact structure:
{
  "colors": {
    "primary": "hex color or null",
    "secondary": ["array of hex colors"],
    "accent": ["array of hex colors"],
    "palette": ["complete color palette"],
    "rgbColors": ["RGB values found"],
    "cmykColors": ["CMYK values found"],
    "pantoneColors": ["Pantone references"],
    "colorNames": ["brand color names"],
    "descriptions": {"color name": "description"},
    "confidence": 0.0-1.0
  },
  "typography": {
    "primaryFont": "main font name",
    "secondaryFont": "secondary font name",
    "fonts": ["all fonts found"],
    "weights": ["font weights"],
    "sizes": ["font sizes"],
    "hierarchy": {"h1": "description", "h2": "description"},
    "notes": "usage notes",
    "confidence": 0.0-1.0
  },
  "logo": {
    "minPrintSize": "minimum print size",
    "minDigitalSize": "minimum digital size",
    "clearspace": "clearspace requirements",
    "aspectRatio": "aspect ratio",
    "rules": ["usage rules"],
    "forbidden": ["forbidden practices"],
    "variants": ["logo variants"],
    "confidence": 0.0-1.0
  },
  "tone": {
    "style": "tone description",
    "descriptors": ["tone descriptors"],
    "examples": ["example phrases"],
    "keywords": ["brand keywords"],
    "forbidden": ["forbidden words"],
    "confidence": 0.0-1.0
  },
  "imagery": {
    "style": "visual style description",
    "styleDescriptors": ["style descriptors"],
    "colorTone": "color tone description",
    "compositionRules": ["composition rules"],
    "confidence": 0.0-1.0
  }
}

Only extract information actually present in the text. Do not invent data.`;
  }

  /**
   * Test the Google AI connection
   */
  async testConnection() {
    try {
      const testPrompt = "Respond with a simple JSON: {\"status\": \"connected\"}";
      const response = await this.makeRequest(testPrompt);
      const result = JSON.parse(response);
      return result.status === "connected";
    } catch (error) {
      console.error('Google AI connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleAIService = new GoogleAIService();
