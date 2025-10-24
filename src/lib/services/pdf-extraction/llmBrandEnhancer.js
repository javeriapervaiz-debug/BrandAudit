/**
 * LLM Brand Enhancement Service
 * Implements three-tier architecture: Regex → Heuristics → LLM Reasoning
 * Provides confidence gating and intelligent fallback for brand guideline extraction
 */
import { googleAIService } from '../utilities/googleAIService.js';
import { getLLMConfig, isProviderConfigured, getGoogleAIAPIKey } from '../../config/llmConfig.js';

export class LLMBrandEnhancer {
  constructor() {
    this.confidenceThreshold = 0.6; // Gate for LLM activation
    this.maxTextLength = 12000; // Max text length for LLM processing
    this.llmProviders = {
      google: this.googleAIEnhance.bind(this),
      local: this.localLLMEnhance.bind(this)
    };
    
    // Default to Google AI (free), but can be configured
    this.activeProvider = 'google';
    this.apiKey = null;
  }

  /**
   * Main enhancement function with confidence gating
   */
  async enhanceExtraction(text, brandName, baseResult) {
    console.log('🤖 LLM Enhancement Service - Checking confidence...');
    console.log('📊 Base confidence:', baseResult.metadata.confidence);
    
    // Tier 1: Check if we need LLM enhancement
    if (baseResult.metadata.confidence >= this.confidenceThreshold) {
      console.log('✅ High confidence - skipping LLM enhancement');
      return baseResult;
    }

    console.log('🧠 Low confidence detected - invoking LLM refinement...');
    
    try {
      // Tier 2: Prepare context and history
      const context = await this.prepareContext(brandName, baseResult);
      
      // Tier 3: LLM reasoning and enhancement
      const enhancedResult = await this.refineWithLLM(text, brandName, baseResult, context);
      
      console.log('✅ LLM enhancement completed');
      return enhancedResult;
      
    } catch (error) {
      console.error('❌ LLM enhancement failed:', error);
      console.log('🔄 Falling back to base result with enhanced metadata');
      
      return {
        ...baseResult,
        metadata: {
          ...baseResult.metadata,
          llmEnhancement: 'failed',
          llmError: error.message,
          fallbackUsed: true
        }
      };
    }
  }

  /**
   * Prepare historical context for RAG-style enhancement
   */
  async prepareContext(brandName, baseResult) {
    try {
      // In a real implementation, you would query your database for historical brand data
      // For now, we'll simulate this with brand-specific knowledge
      const brandContext = this.getBrandContext(brandName);
      
      return {
        historicalData: brandContext,
        currentExtraction: baseResult,
        brandName: brandName.toLowerCase()
      };
    } catch (error) {
      console.warn('⚠️ Context preparation failed:', error);
      return { brandName: brandName.toLowerCase() };
    }
  }

  /**
   * Get brand-specific context (simulated database lookup)
   */
  getBrandContext(brandName) {
    const brandLower = brandName.toLowerCase();
    
    const brandContexts = {
      'spotify': {
        knownColors: ['#1DB954', '#191414', '#FFFFFF', '#B3B3B3'],
        knownFonts: ['Circular', 'Arial'],
        brandTone: 'music-driven, friendly, energetic, inclusive',
        logoRules: ['minimum size 45px digital', 'clearspace 1/3 width']
      },
      'github': {
        knownColors: ['#24292e', '#f6f8fa', '#0366d6', '#28a745'],
        knownFonts: ['SF Pro Display', 'Segoe UI'],
        brandTone: 'technical, professional, developer-focused',
        logoRules: ['octocat symbol', 'minimum size 32px']
      },
      'apple': {
        knownColors: ['#007AFF', '#000000', '#FFFFFF', '#F2F2F7'],
        knownFonts: ['SF Pro', 'Helvetica Neue'],
        brandTone: 'minimalist, premium, innovative',
        logoRules: ['apple logo', 'minimal clearspace']
      }
    };

    return brandContexts[brandLower] || null;
  }

  /**
   * Main LLM refinement function
   */
  async refineWithLLM(text, brandName, baseResult, context) {
    const provider = this.llmProviders[this.activeProvider];
    if (!provider) {
      throw new Error(`LLM provider '${this.activeProvider}' not supported`);
    }

    return await provider(text, brandName, baseResult, context);
  }

  /**
   * Google AI (Gemini)-based enhancement
   */
  async googleAIEnhance(text, brandName, baseResult, context) {
    // Check if Google AI is available
    const apiKey = getGoogleAIAPIKey();
    if (!apiKey) {
      console.warn('⚠️ Google AI API key not configured, using fallback enhancement');
      return this.fallbackEnhancement(baseResult, context);
    }

    try {
      console.log('🤖 Using Google AI (Gemini) for brand guideline enhancement...');
      const enhancedData = await googleAIService.enhanceBrandGuidelines(text, brandName, baseResult, context);
      
      return {
        ...baseResult,
        ...enhancedData,
        metadata: {
          ...baseResult.metadata,
          llmEnhancement: 'google',
          llmConfidence: 0.9,
          enhancementMethod: 'google-gemini'
        }
      };
    } catch (error) {
      console.error('Google AI API error:', error);
      return this.fallbackEnhancement(baseResult, context);
    }
  }


  /**
   * Local LLM enhancement (Ollama, LM Studio, etc.)
   */
  async localLLMEnhance(text, brandName, baseResult, context) {
    console.log('🤖 Using local LLM for enhancement...');
    return this.fallbackEnhancement(baseResult, context);
  }


  /**
   * Parse LLM response and merge with base result
   */
  parseLLMResponse(response, baseResult) {
    try {
      const llmData = JSON.parse(response);
      
      // Merge LLM data with base result, preferring LLM data when available
      return {
        colors: this.mergeObjects(baseResult.colors, llmData.colors),
        typography: this.mergeObjects(baseResult.typography, llmData.typography),
        logo: this.mergeObjects(baseResult.logo, llmData.logo),
        tone: this.mergeObjects(baseResult.tone, llmData.tone),
        imagery: this.mergeObjects(baseResult.imagery, llmData.imagery)
      };
    } catch (error) {
      console.error('❌ Failed to parse LLM response:', error);
      console.log('📄 Raw response:', response);
      return baseResult;
    }
  }

  /**
   * Merge two objects, preferring the second when values exist
   */
  mergeObjects(base, enhanced) {
    const result = { ...base };
    
    for (const key in enhanced) {
      if (enhanced[key] !== null && enhanced[key] !== undefined) {
        if (Array.isArray(enhanced[key]) && enhanced[key].length > 0) {
          result[key] = enhanced[key];
        } else if (typeof enhanced[key] === 'object' && enhanced[key] !== null) {
          result[key] = this.mergeObjects(result[key] || {}, enhanced[key]);
        } else if (enhanced[key] !== '') {
          result[key] = enhanced[key];
        }
      }
    }
    
    return result;
  }

  /**
   * Fallback enhancement when LLM is not available
   */
  fallbackEnhancement(baseResult, context) {
    console.log('🔄 Using fallback enhancement...');
    
    const enhanced = { ...baseResult };
    
    // Apply historical context if available
    if (context.historicalData) {
      const history = context.historicalData;
      
      // Enhance colors with historical data
      if (history.knownColors && enhanced.colors.palette.length === 0) {
        enhanced.colors.palette = history.knownColors;
        enhanced.colors.primary = history.knownColors[0];
        enhanced.colors.confidence = Math.max(enhanced.colors.confidence, 0.7);
      }
      
      // Enhance typography with historical data
      if (history.knownFonts && enhanced.typography.fonts.length === 0) {
        enhanced.typography.fonts = history.knownFonts;
        enhanced.typography.primaryFont = history.knownFonts[0];
        enhanced.typography.confidence = Math.max(enhanced.typography.confidence, 0.7);
      }
      
      // Enhance tone with historical data
      if (history.brandTone && enhanced.tone.style === "Brand tone not clearly defined") {
        enhanced.tone.style = history.brandTone;
        enhanced.tone.confidence = Math.max(enhanced.tone.confidence, 0.7);
      }
    }
    
    // Boost overall confidence
    enhanced.metadata = {
      ...enhanced.metadata,
      llmEnhancement: 'fallback',
      llmConfidence: 0.6,
      enhancementMethod: 'fallback-heuristic'
    };
    
    return enhanced;
  }

  /**
   * Configure LLM provider and API key
   */
  configure(provider, apiKey = null) {
    this.activeProvider = provider;
    this.apiKey = apiKey;
    console.log(`🤖 LLM provider configured: ${provider}`);
  }

  /**
   * Set confidence threshold for LLM activation
   */
  setConfidenceThreshold(threshold) {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`🎯 LLM confidence threshold set to: ${this.confidenceThreshold}`);
  }
}

// Export singleton instance
export const llmBrandEnhancer = new LLMBrandEnhancer();
