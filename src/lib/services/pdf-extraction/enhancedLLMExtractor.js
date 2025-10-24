// @ts-nocheck
/**
 * Enhanced LLM Extractor with Unified Single-Pass Approach
 * Implements comprehensive improvements for better extraction accuracy
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

export class EnhancedLLMExtractor {
  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!this.apiKey) {
      throw new Error('Google AI API key not found');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.1, // Very low temperature for consistent results
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4000
      }
    });
    
    this.maxInputLength = 12000; // Reduced for better focus
  }

  /**
   * Main extraction method with unified single-pass approach
   */
  async extractWithLLM(rawText, brandName, preprocessedData = {}) {
    console.log('🤖 Starting unified LLM extraction...');
    console.log(`📄 Text length: ${rawText.length}`);
    console.log(`🏢 Brand: ${brandName}`);
    
    const prompt = this.buildUnifiedPrompt(brandName, preprocessedData);
    const input = this.prepareOptimizedInput(rawText, preprocessedData);
    
    try {
      const result = await this.generateStructuredContent(prompt, input);
      const cleaned = this.validateAndCleanResult(result, brandName, preprocessedData);
      
      console.log('✅ Unified LLM extraction completed');
      console.log('📊 Result summary:', {
        colors: cleaned.colors?.palette?.length || 0,
        fonts: (cleaned.typography?.primary ? 1 : 0) + (cleaned.typography?.secondary ? 1 : 0),
        logo: cleaned.logo?.clearSpace ? 'Yes' : 'No',
        confidence: cleaned.confidence?.overall || 0
      });
      
      return cleaned;
    } catch (error) {
      console.error('❌ LLM extraction failed:', error);
      console.log('🔄 Using fallback result...');
      return this.createFallbackResult(brandName, preprocessedData);
    }
  }

  /**
   * Build unified prompt with clear, focused instructions
   */
  buildUnifiedPrompt(brandName, preprocessedData) {
    return `
CRITICAL INSTRUCTIONS - READ CAREFULLY:

You are a brand guideline extraction expert. Extract ONLY what you can clearly identify from the text.

# EXTRACTION RULES

## COLORS
- Extract ONLY hex codes (#RRGGBB format)
- Convert RGB/PMS to hex: rgb(255,0,0) → #FF0000, PMS 186 → #CC0000
- Look for color names NEAR hex codes
- IGNORE colors mentioned without codes
- Group by: primary, secondary, accent, neutral

## TYPOGRAPHY  
- Extract ONLY specific font families (Helvetica, Arial, etc.)
- IGNORE generic terms (sans-serif, serif, system fonts)
- Extract weights: Bold, Regular, Light, Medium, etc.
- Look for font size examples (12px, 14pt)
- Assign usage: heading, body, UI

## LOGO
- Extract clear space requirements (minimum spacing)
- Extract size constraints (min/max dimensions)
- Extract usage rules (do/don't)
- Extract background requirements

## SEPARATION CRITICAL
- NEVER mix colors and typography
- If "Bold" appears near hex, it's TYPOGRAPHY weight
- If "#" appears near font, it's COLOR code

# OUTPUT FORMAT - RETURN ONLY VALID JSON
{
  "brandName": "${brandName}",
  "colors": {
    "primary": { "name": "Brand Red", "hex": "#FF0000", "usage": "logo, buttons" },
    "secondary": { "name": "Brand Blue", "hex": "#0000FF", "usage": "accent elements" },
    "accent": { "name": "Brand Yellow", "hex": "#FFFF00", "usage": "highlights" },
    "neutral": [
      { "name": "Black", "hex": "#000000", "usage": "text" },
      { "name": "White", "hex": "#FFFFFF", "usage": "backgrounds" }
    ],
    "palette": ["#FF0000", "#0000FF", "#FFFF00"]
  },
  "typography": {
    "primary": { "font": "Helvetica", "weights": ["Bold", "Regular"], "usage": "headings", "sizes": ["24px", "18px"] },
    "secondary": { "font": "Arial", "weights": ["Regular", "Light"], "usage": "body text", "sizes": ["16px", "14px"] }
  },
  "logo": {
    "clearSpace": "24px",
    "minSize": "120px", 
    "maxSize": "300px",
    "aspectRatio": "3:1",
    "rules": ["Use on solid backgrounds", "Maintain clear space"],
    "constraints": ["Do not rotate", "Do not recolor"]
  },
  "spacing": {
    "baseUnit": "8px",
    "grid": "8pt grid",
    "sectionGap": "64px",
    "componentGap": "24px"
  },
  "confidence": {
    "overall": 0.8,
    "colors": 0.9,
    "typography": 0.7,
    "logo": 0.8
  }
}

# PREPROCESSED DATA FOR CONTEXT
${this.formatPreprocessedContext(preprocessedData)}

# TYPOGRAPHY EXTRACTION - BE AGGRESSIVE
Look for ANY mention of:
- Font names (Arial, Helvetica, Roboto, etc.)
- Font sizes (16px, 18pt, large, small, etc.)
- Font weights (bold, regular, light, 400, 700, etc.)
- Typography sections or headings
- Font-family declarations
- Text styling mentions

# CRITICAL: 
- Be CONSERVATIVE for colors and logo - only extract clear, unambiguous information
- For TYPOGRAPHY: Be more AGGRESSIVE - look for ANY font mentions, even partial ones
- Use preprocessed data as GUIDANCE, not absolute truth
- For typography: If you see font names, font sizes, or font weights, extract them
- Fill missing information ONLY when strongly implied
- Return EMPTY arrays/objects if no clear data found
- Confidence scores should reflect certainty (0.1-1.0)
`;
  }

  /**
   * Format preprocessed data as context for LLM
   */
  formatPreprocessedContext(preprocessedData) {
    if (!preprocessedData || Object.keys(preprocessedData).length === 0) {
      return "No preprocessed data available";
    }

    const context = [];
    
    if (preprocessedData.colors && preprocessedData.colors.palette) {
      context.push(`Detected color candidates: ${preprocessedData.colors.palette.slice(0, 5).join(', ')}`);
    }
    
    if (preprocessedData.typography && preprocessedData.typography.fonts_found) {
      context.push(`Detected font candidates: ${preprocessedData.typography.fonts_found.map(f => f.font).slice(0, 3).join(', ')}`);
    }
    
    if (preprocessedData.logo && preprocessedData.logo.size) {
      context.push(`Detected logo size: ${preprocessedData.logo.size}`);
    }
    
    return context.length > 0 ? context.join('\n') : "Limited preprocessed context";
  }

  /**
   * Prepare optimized input with section extraction
   */
  prepareOptimizedInput(rawText, preprocessedData) {
    // Stage 1: Extract high-value sections
    const sections = this.extractHighValueSections(rawText);
    
    // Stage 2: Add preprocessed highlights
    const highlights = this.generateHighlights(preprocessedData);
    
    // Stage 3: Structure for LLM comprehension
    return this.structureForLLM(sections, highlights);
  }

  /**
   * Extract high-value sections from text
   */
  extractHighValueSections(text) {
    const sections = {
      colors: this.extractColorSections(text),
      typography: this.extractTypographySections(text),
      logo: this.extractLogoSections(text),
      spacing: this.extractSpacingSections(text)
    };

    // Build structured context
    let structuredText = "";
    
    if (sections.colors.length > 0) {
      structuredText += "=== COLOR SECTIONS ===\n" + sections.colors.join('\n\n') + "\n\n";
    }
    
    if (sections.typography.length > 0) {
      structuredText += "=== TYPOGRAPHY SECTIONS ===\n" + sections.typography.join('\n\n') + "\n\n";
    }
    
    if (sections.logo.length > 0) {
      structuredText += "=== LOGO SECTIONS ===\n" + sections.logo.join('\n\n') + "\n\n";
    }
    
    if (sections.spacing.length > 0) {
      structuredText += "=== SPACING SECTIONS ===\n" + sections.spacing.join('\n\n') + "\n\n";
    }

    // Add remaining text if under limit
    const remainingSpace = this.maxInputLength - structuredText.length;
    if (remainingSpace > 1000 && structuredText.length < text.length) {
      structuredText += "=== ADDITIONAL CONTEXT ===\n" + 
        text.substring(0, Math.min(1000, text.length));
    }

    return structuredText;
  }

  /**
   * Extract color sections with keywords
   */
  extractColorSections(text) {
    const colorKeywords = ['color', 'colour', 'palette', 'hex', 'rgb', 'pms', 'primary', 'secondary'];
    return this.extractSectionsWithKeywords(text, colorKeywords, 300);
  }

  /**
   * Extract typography sections with keywords
   */
  extractTypographySections(text) {
    const fontKeywords = [
      'font', 'typeface', 'typography', 'heading', 'body', 'weight', 'bold', 'regular',
      'arial', 'helvetica', 'times', 'courier', 'verdana', 'georgia', 'tahoma', 'calibri',
      'roboto', 'open sans', 'lato', 'montserrat', 'poppins', 'inter', 'source sans',
      'font-family', 'font-size', 'font-weight', 'text', 'title', 'subtitle', 'caption',
      'px', 'pt', 'em', 'rem', 'pixel', 'point', 'size', 'large', 'small', 'medium'
    ];
    return this.extractSectionsWithKeywords(text, fontKeywords, 300);
  }

  /**
   * Extract logo sections with keywords
   */
  extractLogoSections(text) {
    const logoKeywords = ['logo', 'logotype', 'brandmark', 'clear space', 'minimum size', 'aspect ratio'];
    return this.extractSectionsWithKeywords(text, logoKeywords, 300);
  }

  /**
   * Extract spacing sections with keywords
   */
  extractSpacingSections(text) {
    const spacingKeywords = ['spacing', 'whitespace', 'margin', 'padding', 'grid', 'layout'];
    return this.extractSectionsWithKeywords(text, spacingKeywords, 200);
  }

  /**
   * Extract sections with keywords and context
   */
  extractSectionsWithKeywords(text, keywords, contextChars = 200) {
    const sections = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      if (keywords.some(keyword => line.includes(keyword))) {
        // Extract context around this line
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 3);
        const context = lines.slice(start, end).join('\n');
        
        if (!sections.includes(context)) {
          sections.push(context);
        }
      }
    }
    
    return sections.slice(0, 5); // Limit to top 5 sections
  }

  /**
   * Generate highlights from preprocessed data
   */
  generateHighlights(preprocessedData) {
    const highlights = [];
    
    if (preprocessedData.colors?.palette) {
      highlights.push(`Color palette detected: ${preprocessedData.colors.palette.slice(0, 3).join(', ')}`);
    }
    
    if (preprocessedData.typography?.primary) {
      highlights.push(`Primary font detected: ${preprocessedData.typography.primary}`);
    }
    
    // Add fallback typography detection
    if (!preprocessedData.typography?.primary) {
      const fallbackFonts = this.detectFallbackFonts(preprocessedData.rawText || '');
      if (fallbackFonts.length > 0) {
        highlights.push(`Potential fonts detected: ${fallbackFonts.slice(0, 2).join(', ')}`);
      }
    }
    
    if (preprocessedData.logo?.size) {
      highlights.push(`Logo size detected: ${preprocessedData.logo.size}`);
    }
    
    return highlights;
  }

  /**
   * Detect fallback fonts using pattern matching
   */
  detectFallbackFonts(text) {
    const commonFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
      'Verdana', 'Georgia', 'Tahoma', 'Calibri', 'Roboto', 'Open Sans', 'Lato',
      'Montserrat', 'Poppins', 'Inter', 'Source Sans Pro', 'Nunito', 'Raleway',
      'Ubuntu', 'PT Sans', 'PT Serif', 'Merriweather', 'Playfair Display'
    ];
    
    const detectedFonts = [];
    const textLower = text.toLowerCase();
    
    for (const font of commonFonts) {
      const fontLower = font.toLowerCase();
      if (textLower.includes(fontLower)) {
        detectedFonts.push(font);
      }
    }
    
    // Also look for font patterns like "font-family: Arial"
    const fontFamilyPattern = /font-family:\s*['"]?([^'",;]+)['"]?/gi;
    let match;
    while ((match = fontFamilyPattern.exec(text)) !== null) {
      const fontName = match[1].trim();
      if (fontName && !detectedFonts.includes(fontName)) {
        detectedFonts.push(fontName);
      }
    }
    
    return detectedFonts.slice(0, 3); // Return top 3 fonts
  }

  /**
   * Structure content for LLM comprehension
   */
  structureForLLM(sections, highlights) {
    let structured = sections;
    
    if (highlights.length > 0) {
      structured += "\n\n=== PREPROCESSED HIGHLIGHTS ===\n" + highlights.join('\n');
    }
    
    return structured;
  }

  /**
   * Generate structured content with robust error handling
   */
  async generateStructuredContent(prompt, input) {
    const fullContent = `${prompt}\n\nBRAND GUIDELINE TEXT TO ANALYZE:\n${input}`;
    
    // Truncate if needed (safety measure)
    const finalContent = fullContent.length > 30000 
      ? fullContent.substring(0, 30000) + "\n\n[Content truncated due to length]"
      : fullContent;

    console.log(`📝 LLM input: ${finalContent.length} chars`);
    
    try {
      const result = await this.model.generateContent(finalContent);
      
      if (!result?.response) {
        throw new Error('No response from LLM');
      }
      
      const responseText = result.response.text();
      console.log(`📄 LLM response: ${responseText.length} chars`);
      
      return this.parseAndValidateResponse(responseText);
      
    } catch (error) {
      console.error('❌ LLM generation failed:', error);
      throw error;
    }
  }

  /**
   * Parse and validate LLM response
   */
  parseAndValidateResponse(responseText) {
    // Clean response
    let cleanText = responseText.trim();
    
    // Remove markdown code blocks
    cleanText = cleanText.replace(/```json\s*/g, '').replace(/\s*```/g, '');
    
    // Extract JSON using multiple strategies
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    let jsonText = jsonMatch[0];
    
    // Fix common JSON issues
    jsonText = this.fixCommonJSONIssues(jsonText);
    
    try {
      const parsed = JSON.parse(jsonText);
      return this.validateStructure(parsed);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.log('📄 Problematic JSON:', jsonText.substring(0, 500));
      throw new Error(`JSON parsing failed: ${parseError.message}`);
    }
  }

  /**
   * Fix common JSON issues
   */
  fixCommonJSONIssues(jsonText) {
    let fixed = jsonText;
    
    // Fix trailing commas
    fixed = fixed.replace(/,\s*([\]}])/g, '$1');
    
    // Fix missing quotes around keys
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
    
    // Fix unescaped quotes in strings
    fixed = fixed.replace(/:\\s*"([^"\\]*(\\.[^"\\]*)*)"\\s*([,}])/g, (match) => {
      return match.replace(/([^\\])"/g, '$1\\"');
    });
    
    return fixed;
  }

  /**
   * Validate JSON structure
   */
  validateStructure(parsed) {
    const requiredStructure = {
      brandName: 'string',
      colors: 'object',
      typography: 'object', 
      logo: 'object',
      spacing: 'object',
      confidence: 'object'
    };
    
    // Check required top-level structure
    for (const [key, type] of Object.entries(requiredStructure)) {
      if (!(key in parsed)) {
        throw new Error(`Missing required field: ${key}`);
      }
      if (typeof parsed[key] !== type && parsed[key] !== null) {
        throw new Error(`Invalid type for ${key}: expected ${type}, got ${typeof parsed[key]}`);
      }
    }
    
    // Validate color structure
    if (parsed.colors) {
      this.validateColors(parsed.colors);
    }
    
    // Validate typography structure  
    if (parsed.typography) {
      this.validateTypography(parsed.typography);
    }
    
    return parsed;
  }

  /**
   * Validate colors structure
   */
  validateColors(colors) {
    if (colors.primary && typeof colors.primary !== 'object') {
      throw new Error('Invalid colors.primary structure');
    }
    if (colors.neutral && !Array.isArray(colors.neutral)) {
      throw new Error('colors.neutral should be an array');
    }
    if (colors.palette && !Array.isArray(colors.palette)) {
      throw new Error('colors.palette should be an array');
    }
  }

  /**
   * Validate typography structure
   */
  validateTypography(typography) {
    if (typography.primary && typeof typography.primary !== 'object') {
      throw new Error('Invalid typography.primary structure');
    }
    if (typography.secondary && typeof typography.secondary !== 'object') {
      throw new Error('Invalid typography.secondary structure');
    }
  }

  /**
   * Validate and clean result
   */
  validateAndCleanResult(result, brandName, preprocessedData) {
    const cleaned = JSON.parse(JSON.stringify(result)); // Deep clone
    
    // Ensure brand name
    cleaned.brandName = cleaned.brandName || brandName || 'Unknown Brand';
    
    // Clean and validate colors
    cleaned.colors = this.cleanColors(cleaned.colors, preprocessedData);
    
    // Clean and validate typography
    cleaned.typography = this.cleanTypography(cleaned.typography, preprocessedData);
    
    // Clean and validate logo
    cleaned.logo = this.cleanLogo(cleaned.logo);
    
    // Recalculate confidence based on actual data quality
    cleaned.confidence = this.calculateRealConfidence(cleaned, preprocessedData);
    
    return cleaned;
  }

  /**
   * Clean and validate colors
   */
  cleanColors(colors, preprocessedData) {
    const cleaned = {
      primary: null,
      secondary: null,
      accent: null,
      neutral: [],
      palette: []
    };
    
    if (!colors) return cleaned;
    
    // Validate primary color
    if (colors.primary && this.isValidColor(colors.primary)) {
      cleaned.primary = colors.primary;
      cleaned.palette.push(colors.primary.hex);
    }
    
    // Validate secondary color
    if (colors.secondary && this.isValidColor(colors.secondary)) {
      cleaned.secondary = colors.secondary;
      cleaned.palette.push(colors.secondary.hex);
    }
    
    // Validate neutral colors
    if (Array.isArray(colors.neutral)) {
      cleaned.neutral = colors.neutral.filter(color => this.isValidColor(color));
      cleaned.palette.push(...cleaned.neutral.map(c => c.hex));
    }
    
    // Add from preprocessed data if LLM missed them
    if (preprocessedData.colors && preprocessedData.colors.palette) {
      preprocessedData.colors.palette.forEach(hex => {
        if (!cleaned.palette.includes(hex) && this.isValidHex(hex)) {
          cleaned.palette.push(hex);
        }
      });
    }
    
    // Remove duplicates
    cleaned.palette = [...new Set(cleaned.palette)];
    
    return cleaned;
  }

  /**
   * Clean and validate typography
   */
  cleanTypography(typography, preprocessedData) {
    const cleaned = {
      primary: null,
      secondary: null
    };
    
    if (!typography) return cleaned;
    
    // Validate primary font
    if (typography.primary && this.isValidFont(typography.primary)) {
      cleaned.primary = typography.primary;
    }
    
    // Validate secondary font  
    if (typography.secondary && this.isValidFont(typography.secondary)) {
      cleaned.secondary = typography.secondary;
    }
    
    // Fallback to preprocessed data
    if (!cleaned.primary && preprocessedData.typography && preprocessedData.typography.primary) {
      cleaned.primary = {
        font: preprocessedData.typography.primary,
        weights: ['Regular', 'Bold'],
        usage: 'primary font',
        sizes: ['16px']
      };
    }
    
    return cleaned;
  }

  /**
   * Clean and validate logo
   */
  cleanLogo(logo) {
    const cleaned = {
      clearSpace: null,
      minSize: null,
      maxSize: null,
      aspectRatio: null,
      rules: [],
      constraints: []
    };
    
    if (!logo) return cleaned;
    
    // Validate and clean logo properties
    if (logo.clearSpace && typeof logo.clearSpace === 'string') {
      cleaned.clearSpace = logo.clearSpace;
    }
    
    if (logo.minSize && typeof logo.minSize === 'string') {
      cleaned.minSize = logo.minSize;
    }
    
    if (logo.maxSize && typeof logo.maxSize === 'string') {
      cleaned.maxSize = logo.maxSize;
    }
    
    if (logo.aspectRatio && typeof logo.aspectRatio === 'string') {
      cleaned.aspectRatio = logo.aspectRatio;
    }
    
    if (Array.isArray(logo.rules)) {
      cleaned.rules = logo.rules.filter(rule => typeof rule === 'string');
    }
    
    if (Array.isArray(logo.constraints)) {
      cleaned.constraints = logo.constraints.filter(constraint => typeof constraint === 'string');
    }
    
    return cleaned;
  }

  /**
   * Check if color is valid
   */
  isValidColor(color) {
    return color && 
           typeof color === 'object' &&
           color.hex && 
           this.isValidHex(color.hex) &&
           color.name && 
           typeof color.name === 'string';
  }

  /**
   * Check if hex color is valid
   */
  isValidHex(hex) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  /**
   * Check if font is valid
   */
  isValidFont(font) {
    return font && 
           typeof font === 'object' &&
           font.font && 
           typeof font.font === 'string' &&
           font.font.length > 1 &&
           !font.font.toLowerCase().includes('sans-serif') &&
           !font.font.toLowerCase().includes('serif');
  }

  /**
   * Calculate real confidence based on data quality
   */
  calculateRealConfidence(result, preprocessedData) {
    let scores = {
      colors: 0,
      typography: 0,
      logo: 0,
      overall: 0
    };
    
    // Color confidence
    if (result.colors.primary) scores.colors += 0.4;
    if (result.colors.palette.length >= 2) scores.colors += 0.3;
    if (result.colors.palette.length >= 4) scores.colors += 0.3;
    scores.colors = Math.min(scores.colors, 1);
    
    // Typography confidence
    if (result.typography.primary) scores.typography += 0.6;
    if (result.typography.secondary) scores.typography += 0.4;
    scores.typography = Math.min(scores.typography, 1);
    
    // Logo confidence
    if (result.logo.clearSpace) scores.logo += 0.4;
    if (result.logo.minSize) scores.logo += 0.3;
    if (result.logo.rules && result.logo.rules.length > 0) scores.logo += 0.3;
    scores.logo = Math.min(scores.logo, 1);
    
    // Overall confidence (weighted average)
    scores.overall = (scores.colors * 0.4 + scores.typography * 0.3 + scores.logo * 0.3);
    
    return scores;
  }

  /**
   * Create fallback result when LLM fails
   */
  createFallbackResult(brandName, preprocessedData) {
    return {
      brandName: brandName || 'Unknown Brand',
      colors: {
        primary: null,
        secondary: null,
        accent: null,
        neutral: [],
        palette: preprocessedData?.colors?.palette || []
      },
      typography: {
        primary: preprocessedData?.typography?.primary ? {
          font: preprocessedData.typography.primary,
          weights: ['Regular', 'Bold'],
          usage: 'primary font'
        } : null,
        secondary: null
      },
      logo: {
        clearSpace: null,
        minSize: null,
        maxSize: null,
        aspectRatio: null,
        rules: [],
        constraints: []
      },
      spacing: {
        baseUnit: null,
        grid: null,
        sectionGap: null,
        componentGap: null
      },
      confidence: {
        overall: 0.3,
        colors: 0.3,
        typography: 0.2,
        logo: 0.1
      }
    };
  }
}
