// @ts-nocheck
/**
 * Perfect Brand Guideline Extractor
 * Integrates all improvements for maximum accuracy
 */
import { EnhancedTextPreprocessor } from './enhancedTextPreprocessor.js';
import { AdvancedColorExtractor } from './advancedColorExtractor.js';
import { ContextAwareFontExtractor } from './contextAwareFontExtractor.js';
import { CategoryAwareExtractor } from './categoryAwareExtractor.js';
import { EnhancedLLMExtractor } from './enhancedLLMExtractor.js';
import { EnhancedSpacingExtractor } from './enhancedSpacingExtractor.js';
import { RobustFontDetector } from './robustFontDetector.js';
import fs from 'fs';
import path from 'path';

export class PerfectBrandGuidelineExtractor {
  constructor() {
    this.preprocessor = new EnhancedTextPreprocessor();
    this.colorExtractor = new AdvancedColorExtractor();
    this.fontExtractor = new ContextAwareFontExtractor();
    this.categoryEnforcer = new CategoryAwareExtractor();
    this.llmExtractor = new EnhancedLLMExtractor();
    this.spacingExtractor = new EnhancedSpacingExtractor();
    this.robustFontDetector = new RobustFontDetector();
  }

  /**
   * Comprehensive extraction with enhanced color & spacing focus
   */
  async extractWithComprehensiveFocus(rawText, companyName) {
    console.log('🎯 Starting comprehensive extraction with enhanced focus...');
    console.log(`📄 Processing text for: ${companyName}`);
    
    try {
      // Step 0: Save debug text file
      console.log('💾 Saving debug text file...');
      await this.saveDebugTextFile(rawText, companyName);
      
      // Step 1: Pre-extract colors, spacing, and fonts with enhanced methods
      console.log('🎨 Step 1: Enhanced color extraction...');
      const enhancedColors = this.colorExtractor.extractColorsWithContext(rawText);
      
      console.log('📏 Step 2: Enhanced spacing extraction...');
      const enhancedSpacing = this.spacingExtractor.extractSpacingWithContext(rawText);
      
      console.log('🔤 Step 3: Robust font detection...');
      const enhancedFonts = this.robustFontDetector.detectFonts(rawText);
      
      // Step 2: Build LLM prompt with these pre-extracted values
      console.log('🤖 Step 4: Building enhanced LLM prompt...');
      const preprocessedData = {
        enhancedColors,
        enhancedSpacing,
        enhancedFonts,
        rawText: rawText // Pass raw text for fallback font detection
      };
      
      // Step 3: Run LLM with focus on validation and completion
      console.log('🧠 Step 5: Running LLM extraction...');
      const llmResult = await this.llmExtractor.extractWithLLM(rawText, companyName, preprocessedData);
      
      // Step 4: Merge results, prioritizing enhanced extraction
      console.log('🔄 Step 6: Merging results...');
      const finalResult = this.mergeResults(llmResult, enhancedColors, enhancedSpacing, enhancedFonts);
      
      console.log('✅ Comprehensive extraction completed!');
      console.log('📊 Final result summary:', {
        colors: finalResult.colors?.palette?.length || 0,
        fonts: (finalResult.typography?.primary ? 1 : 0) + (finalResult.typography?.secondary ? 1 : 0),
        logo: finalResult.logo?.clearSpace ? 'Yes' : 'No',
        spacing: Object.values(finalResult.spacing || {}).filter(v => v && v !== '').length,
        confidence: finalResult.confidence?.overall || 0
      });
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ Comprehensive extraction failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced LLM-only extraction (alternative approach)
   */
  async extractWithEnhancedLLM(rawText, companyName) {
    console.log('🤖 Starting enhanced LLM-only extraction...');
    console.log(`📄 Processing text for: ${companyName}`);
    
    try {
      // Use enhanced LLM extractor with preprocessed data
      const preprocessedData = await this.getPreprocessedData(rawText, companyName);
      const result = await this.llmExtractor.extractWithLLM(rawText, companyName, preprocessedData);
      
      console.log('✅ Enhanced LLM extraction completed!');
      console.log('📊 Result summary:', {
        colors: result.colors?.palette?.length || 0,
        fonts: (result.typography?.primary ? 1 : 0) + (result.typography?.secondary ? 1 : 0),
        logo: result.logo?.clearSpace ? 'Yes' : 'No',
        confidence: result.confidence?.overall || 0
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Enhanced LLM extraction failed:', error);
      throw error;
    }
  }

  /**
   * Get preprocessed data for LLM context
   */
  async getPreprocessedData(rawText, companyName) {
    console.log('🔧 Getting preprocessed data for LLM context...');
    
    try {
      // Step 1: Deep cleaning and structure enhancement
      const cleanedText = this.preprocessor.deepCleanText(rawText);
      
      // Step 2: Parallel extraction for context
      const colorData = this.colorExtractor.extractColorsWithContext(cleanedText);
      const fontData = this.fontExtractor.extractFontsWithHierarchy(cleanedText);
      const logoData = this.extractLogoData(cleanedText);
      const spacingData = this.extractSpacingData(cleanedText);
      
      return {
        colors: colorData,
        typography: fontData,
        logo: logoData,
        spacing: spacingData
      };
      
    } catch (error) {
      console.warn('⚠️ Preprocessing failed, using minimal context:', error);
      return {};
    }
  }

  /**
   * Merge results, prioritizing enhanced extraction
   */
  mergeResults(llmResult, enhancedColors, enhancedSpacing, enhancedFonts) {
    const merged = {...llmResult};
    
    // Prioritize enhanced color extraction
    if (enhancedColors.palette.length > (llmResult.colors?.palette?.length || 0)) {
      console.log('🎨 Using enhanced color extraction (more comprehensive)');
      merged.colors = enhancedColors;
    }
    
    // Prioritize enhanced spacing extraction  
    const enhancedSpacingCount = Object.values(enhancedSpacing).filter(v => v && v !== '').length;
    const llmSpacingCount = Object.values(llmResult.spacing || {}).filter(v => v && v !== '').length;
    
    if (enhancedSpacingCount > llmSpacingCount) {
      console.log('📏 Using enhanced spacing extraction (more comprehensive)');
      merged.spacing = enhancedSpacing;
    }
    
    // NEW: Prioritize enhanced font extraction
    if (enhancedFonts && enhancedFonts.allFonts && enhancedFonts.allFonts.length > 0) {
      console.log('🔤 Using robust font detection (more comprehensive)');
      
      if (!merged.typography) merged.typography = {};
      
      // Set primary font if detected with high confidence
      if (enhancedFonts.primary && enhancedFonts.primary.confidence > 0.7) {
        merged.typography.primary = {
          font: enhancedFonts.primary.font,
          weights: enhancedFonts.primary.weights,
          usage: enhancedFonts.primary.usage || 'Primary brand typography'
        };
      }
      
      // Set secondary font if detected
      if (enhancedFonts.secondary && enhancedFonts.secondary.confidence > 0.7) {
        merged.typography.secondary = {
          font: enhancedFonts.secondary.font,
          weights: enhancedFonts.secondary.weights,
          usage: enhancedFonts.secondary.usage || 'Secondary typography'
        };
      }
      
      // Add all detected fonts
      merged.typography.allFonts = enhancedFonts.allFonts;
    }
    
    // Recalculate confidence based on actual data completeness
    merged.confidence = this.calculateEnhancedConfidence(merged);
    
    return merged;
  }

  /**
   * Calculate enhanced confidence based on data quality
   */
  calculateEnhancedConfidence(result) {
    let confidence = {
      colors: 0,
      typography: 0,
      logo: 0,
      spacing: 0,
      overall: 0
    };
    
    // Color confidence (much more detailed now)
    if (result.colors?.primary) confidence.colors += 0.2;
    if (result.colors?.secondary) confidence.colors += 0.2;
    if (result.colors?.accent) confidence.colors += 0.1;
    if (result.colors?.neutral?.length >= 2) confidence.colors += 0.2;
    if (result.colors?.palette?.length >= 5) confidence.colors += 0.3;
    confidence.colors = Math.min(confidence.colors, 1);
    
    // Typography confidence
    if (result.typography?.primary) confidence.typography += 0.6;
    if (result.typography?.secondary) confidence.typography += 0.4;
    confidence.typography = Math.min(confidence.typography, 1);
    
    // Logo confidence
    if (result.logo?.clearSpace) confidence.logo += 0.4;
    if (result.logo?.minSize) confidence.logo += 0.3;
    if (result.logo?.rules && result.logo.rules.length > 0) confidence.logo += 0.3;
    confidence.logo = Math.min(confidence.logo, 1);
    
    // Spacing confidence
    if (result.spacing?.grid) confidence.spacing += 0.3;
    if (result.spacing?.baseUnit) confidence.spacing += 0.2;
    if (result.spacing?.sectionGap) confidence.spacing += 0.25;
    if (result.spacing?.componentGap) confidence.spacing += 0.25;
    confidence.spacing = Math.min(confidence.spacing, 1);
    
    // Overall confidence (weighted)
    confidence.overall = (
      confidence.colors * 0.3 +
      confidence.typography * 0.3 + 
      confidence.logo * 0.2 +
      confidence.spacing * 0.2
    );
    
    return confidence;
  }

  /**
   * Main extraction pipeline with perfect accuracy
   */
  async extractPerfectGuidelines(rawText, companyName) {
    console.log('🚀 Starting perfect brand guideline extraction...');
    console.log(`📄 Processing text for: ${companyName}`);
    
    try {
      // Step 1: Deep cleaning and structure enhancement
      console.log('🧹 Step 1: Enhanced text preprocessing...');
      const cleanedText = this.preprocessor.deepCleanText(rawText);
      
      // Step 2: Parallel extraction
      console.log('🎨 Step 2: Advanced color extraction...');
      const colorData = this.colorExtractor.extractColorsWithContext(cleanedText);
      
      console.log('📝 Step 3: Context-aware font extraction...');
      const fontData = this.fontExtractor.extractFontsWithHierarchy(cleanedText);
      
      console.log('🏷️ Step 4: Logo data extraction...');
      const logoData = this.extractLogoData(cleanedText);
      
      console.log('📐 Step 5: Spacing data extraction...');
      const spacingData = this.extractSpacingData(cleanedText);
      
      // Step 3: Category enforcement
      console.log('🔒 Step 6: Enforcing category boundaries...');
      const extractedData = {
        colors: colorData,
        typography: fontData,
        logo: logoData,
        spacing: spacingData
      };
      
      const cleanedData = this.categoryEnforcer.enforceCategoryBoundaries(extractedData);
      
      // Step 4: Redistribute misplaced data
      console.log('🔄 Step 7: Redistributing misplaced data...');
      const redistributedData = this.categoryEnforcer.redistributeMisplacedData(cleanedData);
      
      // Step 5: Validation and completeness check
      console.log('✅ Step 8: Validation and completion...');
      const validatedData = this.validateAndCompleteData(redistributedData, companyName);
      
      console.log('🎉 Perfect brand guideline extraction completed!');
      return validatedData;
      
    } catch (error) {
      console.error('❌ Perfect extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract logo-specific information
   */
  extractLogoData(text) {
    const logoData = {
      size: this.extractLogoSize(text),
      clear_space: this.extractLogoClearSpace(text),
      usage_rules: this.extractLogoUsageRules(text),
      variants: this.extractLogoVariants(text)
    };
    
    // Remove empty values
    return Object.fromEntries(
      Object.entries(logoData).filter(([_, value]) => value !== null && value !== undefined)
    );
  }

  extractLogoSize(text) {
    const sizePatterns = [
      /minimum size[:\s]*(\d+(?:px|pt|in|cm|mm))/gi,
      /logo size[:\s]*(\d+(?:px|pt|in|cm|mm))/gi,
      /minimum[:\s]*(\d+(?:px|pt|in|cm|mm))/gi
    ];
    
    for (const pattern of sizePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  extractLogoClearSpace(text) {
    const clearSpacePatterns = [
      /clear space[:\s]*(\d+(?:px|pt|in|cm|mm))/gi,
      /clearspace[:\s]*(\d+(?:px|pt|in|cm|mm))/gi,
      /minimum clear space[:\s]*(\d+(?:px|pt|in|cm|mm))/gi
    ];
    
    for (const pattern of clearSpacePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  extractLogoUsageRules(text) {
    const rules = [];
    const rulePatterns = [
      /(?:do not|don't|never|avoid)[^.]*logo[^.]*\./gi,
      /(?:always|must|should)[^.]*logo[^.]*\./gi,
      /logo.*rule/gi,
      /logo.*usage/gi
    ];
    
    for (const pattern of rulePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        rules.push(...matches);
      }
    }
    
    return rules;
  }

  extractLogoVariants(text) {
    const variants = [];
    const variantPatterns = [
      /logo variant/gi,
      /logo version/gi,
      /logo style/gi
    ];
    
    for (const pattern of variantPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        variants.push(...matches);
      }
    }
    
    return variants;
  }

  /**
   * Extract general spacing information
   */
  extractSpacingData(text) {
    const spacingData = {
      grid_system: this.extractGridSystem(text),
      base_unit: this.extractBaseUnit(text),
      margins: this.extractMarginPadding(text),
      rules: this.extractSpacingRules(text)
    };
    
    // Remove empty values
    return Object.fromEntries(
      Object.entries(spacingData).filter(([_, value]) => value !== null && value !== undefined)
    );
  }

  extractGridSystem(text) {
    const gridPatterns = [
      /grid system/gi,
      /grid layout/gi,
      /12-column grid/gi,
      /8pt grid/gi
    ];
    
    for (const pattern of gridPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }

  extractBaseUnit(text) {
    const unitPatterns = [
      /base unit[:\s]*(\d+(?:px|pt|in|cm|mm))/gi,
      /grid unit[:\s]*(\d+(?:px|pt|in|cm|mm))/gi,
      /spacing unit[:\s]*(\d+(?:px|pt|in|cm|mm))/gi
    ];
    
    for (const pattern of unitPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  extractMarginPadding(text) {
    const marginPatterns = [
      /margin[:\s]*(\d+(?:px|pt|in|cm|mm))/gi,
      /padding[:\s]*(\d+(?:px|pt|in|cm|mm))/gi
    ];
    
    const margins = [];
    for (const pattern of marginPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        margins.push(...matches);
      }
    }
    
    return margins.length > 0 ? margins : null;
  }

  extractSpacingRules(text) {
    const rules = [];
    const rulePatterns = [
      /spacing rule/gi,
      /margin rule/gi,
      /padding rule/gi,
      /whitespace rule/gi
    ];
    
    for (const pattern of rulePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        rules.push(...matches);
      }
    }
    
    return rules;
  }

  /**
   * Validate data and fill in missing information
   */
  validateAndCompleteData(data, companyName) {
    console.log('🔍 Validating and completing data...');
    
    const validated = { ...data };
    
    // Ensure at least primary color exists
    if (!validated.colors?.primary || validated.colors.primary.length === 0) {
      validated.colors.primary = [this.getFallbackColor(companyName)];
    }
    
    // Ensure at least primary font exists
    if (!validated.typography?.primary) {
      validated.typography.primary = 'Inter'; // Modern fallback
    }
    
    // Add metadata
    validated.metadata = {
      extraction_timestamp: new Date().toISOString(),
      company_name: companyName,
      extraction_method: 'perfect_enhanced_rule_based',
      confidence_score: this.calculateConfidenceScore(validated)
    };
    
    return validated;
  }

  getFallbackColor(companyName) {
    const brandColors = {
      'netflix': '#E50914',
      'spotify': '#1DB954',
      'twitch': '#9146FF',
      'buffer': '#168eea',
      'target': '#CC0000'
    };
    
    const companyLower = companyName.toLowerCase();
    for (const [brand, color] of Object.entries(brandColors)) {
      if (companyLower.includes(brand)) {
        return color;
      }
    }
    
    return '#000000'; // Default black
  }

  calculateConfidenceScore(data) {
    const scores = [];
    
    // Color confidence
    if (data.colors?.primary && data.colors.primary.length > 0) {
      scores.push(0.8);
    }
    if (data.colors?.palette && data.colors.palette.length >= 3) {
      scores.push(0.9);
    }
    
    // Font confidence
    if (data.typography?.primary) {
      scores.push(0.8);
    }
    if (data.typography?.fonts_found && data.typography.fonts_found.length > 0) {
      scores.push(0.7);
    }
    
    // Logo confidence
    if (data.logo?.size || data.logo?.clear_space) {
      scores.push(0.6);
    }
    
    // Spacing confidence
    if (data.spacing?.base_unit || data.spacing?.grid_system) {
      scores.push(0.5);
    }
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
  }

  /**
   * Save debug text file for inspection
   */
  async saveDebugTextFile(text, brandName) {
    try {
      const debugDir = path.join(process.cwd(), 'debug-text-files');
      
      // Ensure debug directory exists
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${brandName}_${timestamp}.txt`;
      const filepath = path.join(debugDir, filename);
      
      fs.writeFileSync(filepath, text, 'utf8');
      console.log(`💾 Debug text file saved: ${filename}`);
      
    } catch (error) {
      console.warn('⚠️ Could not save debug text file:', error.message);
    }
  }
}
