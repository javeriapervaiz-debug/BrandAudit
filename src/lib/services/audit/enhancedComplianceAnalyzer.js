// @ts-nocheck
import { scrapedDataRepository } from '../../repositories/scrapedDataRepository.js';
import { parseSizeToPx, compareSizes, checkHeadingRatios, generateSizeReport } from '$lib/utils/sizeUtils.js';
import { isFontLoaded, checkFontsLoaded, getPageRootFontSize, getComputedFontSize, isUsingBrandFont } from '$lib/utils/fontUtils.js';
import LLMIssueProcessor from './llmIssueProcessor.js';

// Type definitions
/** @typedef {Object} Issue
 * @property {string} type
 * @property {string} severity
 * @property {string} description
 * @property {string} details
 * @property {string} recommendation
 * @property {string} expected
 * @property {string} actual
 * @property {Object} context
 * @property {string} timestamp
 */

/** @typedef {Object} Recommendation
 * @property {string} title
 * @property {string} message
 * @property {string} priority
 * @property {string} action
 * @property {string} timestamp
 */

/** @typedef {Object} ScrapedData
 * @property {ColorData} colors
 * @property {TypographyData} typography
 * @property {LogoData} logo
 * @property {SpacingData} layout
 * @property {ImageryData} imagery
 */

/** @typedef {Object} BrandGuidelines
 * @property {ColorData} colors
 * @property {TypographyData} typography
 * @property {LogoData} logo
 * @property {SpacingData} spacing
 * @property {ImageryData} imagery
 */

// Add more specific type definitions to avoid TypeScript errors
/** @typedef {Object} ColorData
 * @property {string} primary
 * @property {string[]} secondary
 * @property {string[]} palette
 */

/** @typedef {Object} TypographyData
 * @property {string} primaryFont
 * @property {string[]} fonts
 * @property {string[]} weights
 * @property {string[]} sizes
 */

/** @typedef {Object} LogoData
 * @property {string} minPrintSize
 * @property {string} minDigitalSize
 * @property {string} clearspace
 * @property {string[]} rules
 */

/** @typedef {Object} SpacingData
 * @property {string} margin
 * @property {string} padding
 * @property {string} lineHeight
 */

/** @typedef {Object} ImageryData
 * @property {string} style
 * @property {string} quality
 * @property {string} tone
 */

export class EnhancedComplianceAnalyzer {
  constructor() {
    this.tolerance = {
      color: 0.1, // 10% tolerance for color matching
      fontSize: 0.05, // 5% tolerance for font size
      spacing: 0.1 // 10% tolerance for spacing
    };
    this.llmProcessor = new LLMIssueProcessor();
    /** @type {Issue[]} */
    this.issues = [];
    /** @type {Recommendation[]} */
    this.recommendations = [];
  }

  /**
   * Enhanced compliance analysis with detailed scoring and user-friendly results
   * @param {ScrapedData} scrapedData
   * @param {BrandGuidelines} brandGuidelines
   */
  async analyzeCompliance(scrapedData, brandGuidelines) {
    console.log('🔍 Enhanced compliance analysis starting...');
    
    this.issues = []; // Reset issues array
    this.recommendations = []; // Reset recommendations

    // Debug: Log scraped data structure
    console.log('📊 Scraped data structure:', {
      hasColors: !!scrapedData.colors,
      hasTypography: !!scrapedData.typography,
      hasLogo: !!scrapedData.logo,
      hasComponents: !!scrapedData.components,
      scrapedDataKeys: Object.keys(scrapedData)
    });

    // Debug: Log brand guidelines structure
    console.log('📋 Brand guidelines structure:', {
      hasColors: !!brandGuidelines.colors,
      hasTypography: !!brandGuidelines.typography,
      hasLogo: !!brandGuidelines.logo,
      hasSpacing: !!brandGuidelines.spacing,
      hasImagery: !!brandGuidelines.imagery,
      brandGuidelinesKeys: Object.keys(brandGuidelines)
    });

    // Debug: Log brand guidelines content
    console.log('📋 Brand guidelines content:', {
      colors: brandGuidelines.colors,
      typography: brandGuidelines.typography,
      logo: brandGuidelines.logo
    });

    // Add component-based analysis
    if (scrapedData.components) {
      console.log('🎯 Performing component-based analysis...');
      await this.analyzeComponents(scrapedData.components, brandGuidelines);
    }

    // Extract data from components if main categories are missing
    if (!scrapedData.colors && scrapedData.components) {
      scrapedData.colors = this.extractColorsFromComponents(scrapedData.components);
      console.log('🎨 Extracted colors from components:', scrapedData.colors);
    }
    if (!scrapedData.typography && scrapedData.components) {
      scrapedData.typography = this.extractTypographyFromComponents(scrapedData.components);
      console.log('📝 Extracted typography from components:', scrapedData.typography);
    }
    if (!scrapedData.logo && scrapedData.components) {
      scrapedData.logo = this.extractLogoFromComponents(scrapedData.components);
      console.log('🏷️ Extracted logo from components:', scrapedData.logo);
    }
    
    const analysis = {
      overallScore: 0,
      categoryScores: {
        colors: 0,
        typography: 0,
        logo: 0
      },
      issues: [],
      recommendations: [],
      /** @type {string[]} */
      skippedCategories: [],
      detailedSummary: {},
      confidence: 0,
      summary: {
        totalIssues: 0,
        criticalIssues: 0,
        mediumIssues: 0,
        lowIssues: 0
      }
    };

    // Check what data is available in brand guidelines (handle nested structure)
    const hasColors = brandGuidelines.colors && (
      brandGuidelines.colors.palette?.length > 0 || 
      brandGuidelines.colors.primary || 
      brandGuidelines.colors.secondary?.length > 0 ||
      brandGuidelines.colors.semantic?.primary ||
      brandGuidelines.colors.semantic?.secondary ||
      brandGuidelines.colors.neutral?.white ||
      Object.keys(brandGuidelines.colors).length > 0
    );
    
    const hasTypography = brandGuidelines.typography && (
      brandGuidelines.typography.fonts?.length > 0 || 
      brandGuidelines.typography.primaryFont ||
      brandGuidelines.typography.weights?.length > 0 ||
      brandGuidelines.typography.sizes?.length > 0 ||
      brandGuidelines.typography.primary?.fontFamily ||
      brandGuidelines.typography.secondary?.fontFamily ||
      Object.keys(brandGuidelines.typography).length > 0
    );
    
    const hasLogo = brandGuidelines.logo && (
      brandGuidelines.logo.minDigitalSize || 
      brandGuidelines.logo.minPrintSize ||
      brandGuidelines.logo.clearspace ||
      brandGuidelines.logo.rules?.length > 0
    );
    
    const hasSpacing = brandGuidelines.spacing && (
      brandGuidelines.spacing.margin ||
      brandGuidelines.spacing.padding ||
      brandGuidelines.spacing.lineHeight
    );
    
    const hasImagery = brandGuidelines.imagery && (
      brandGuidelines.imagery.style ||
      brandGuidelines.imagery.quality ||
      brandGuidelines.imagery.tone
    );

    console.log(`📊 Available brand guideline categories:`, {
      colors: hasColors,
      typography: hasTypography,
      logo: hasLogo,
      spacing: hasSpacing,
      imagery: hasImagery
    });

    // Only analyze categories that have brand guideline data
    if (hasColors) {
      console.log('🎨 Starting universal color analysis with:', {
        scrapedColors: scrapedData.colors,
        brandColors: brandGuidelines.colors
      });
      try {
        const { UniversalColorAnalyzer } = await import('./universalColorAnalyzer.js');
        const colorAnalyzer = new UniversalColorAnalyzer();
        const colorAnalysis = colorAnalyzer.analyzeColorsUniversal(scrapedData.colors, brandGuidelines.colors);
        analysis.categoryScores.colors = colorAnalysis.score;
        this.issues.push(...colorAnalysis.issues);
        console.log('🎨 Universal color analysis result:', colorAnalysis.score);
        analysis.detailedSummary.colors = this.generateCategorySummary('colors', colorAnalysis.score);
      } catch (error) {
        console.warn('⚠️ Universal color analysis failed, using enhanced fallback:', error.message);
        try {
          const { EnhancedColorAnalyzer } = await import('./enhancedColorAnalyzer.js');
          const colorAnalyzer = new EnhancedColorAnalyzer();
          const colorAnalysis = colorAnalyzer.analyzeColorCompliance(scrapedData.colors, brandGuidelines.colors);
          analysis.categoryScores.colors = colorAnalysis.score;
          this.issues.push(...colorAnalysis.issues);
          console.log('🎨 Enhanced color analysis result:', colorAnalysis.score);
          analysis.detailedSummary.colors = this.generateCategorySummary('colors', colorAnalysis.score);
        } catch (fallbackError) {
          console.warn('⚠️ Enhanced color analysis also failed, using original:', fallbackError.message);
          analysis.categoryScores.colors = await this.analyzeColorCompliance(scrapedData.colors, brandGuidelines.colors);
          console.log('🎨 Original color analysis result:', analysis.categoryScores.colors);
          analysis.detailedSummary.colors = this.generateCategorySummary('colors', analysis.categoryScores.colors);
        }
      }
    } else {
      console.log('🎨 Skipping color analysis - no brand color guidelines');
      analysis.skippedCategories.push('Colors');
      this.addRecommendation('Color Guidelines Missing', 'No color guidelines found in brand document. Consider adding color palette, primary colors, and usage rules.', 'medium', 'Add comprehensive color guidelines to your brand document.');
    }

    if (hasTypography) {
      console.log('📝 Starting universal typography analysis with:', {
        scrapedTypography: scrapedData.typography,
        brandTypography: brandGuidelines.typography
      });
      try {
        const { UniversalFontAnalyzer } = await import('./universalFontAnalyzer.js');
        const fontAnalyzer = new UniversalFontAnalyzer();
        const fontAnalysis = fontAnalyzer.analyzeFontsUniversal(scrapedData.typography, brandGuidelines.typography);
        analysis.categoryScores.typography = fontAnalysis.score;
        this.issues.push(...fontAnalysis.issues);
        console.log('📝 Universal typography analysis result:', fontAnalysis.score);
        analysis.detailedSummary.typography = this.generateCategorySummary('typography', fontAnalysis.score);
      } catch (error) {
        console.warn('⚠️ Universal typography analysis failed, using enhanced fallback:', error.message);
        try {
          const { EnhancedTypographyAnalyzer } = await import('./enhancedTypographyAnalyzer.js');
          const typographyAnalyzer = new EnhancedTypographyAnalyzer();
          const typographyAnalysis = typographyAnalyzer.analyzeTypographyCompliance(scrapedData.typography, brandGuidelines.typography);
          analysis.categoryScores.typography = typographyAnalysis.score;
          this.issues.push(...typographyAnalysis.issues);
          console.log('📝 Enhanced typography analysis result:', typographyAnalysis.score);
          analysis.detailedSummary.typography = this.generateCategorySummary('typography', typographyAnalysis.score);
        } catch (fallbackError) {
          console.warn('⚠️ Enhanced typography analysis also failed, using original:', fallbackError.message);
          analysis.categoryScores.typography = await this.analyzeTypographyCompliance(scrapedData.typography, brandGuidelines.typography);
          console.log('📝 Original typography analysis result:', analysis.categoryScores.typography);
          analysis.detailedSummary.typography = this.generateCategorySummary('typography', analysis.categoryScores.typography);
        }
      }
    } else {
      console.log('📝 Skipping typography analysis - no brand typography guidelines');
      analysis.skippedCategories.push('Typography');
      this.addRecommendation('Typography Guidelines Missing', 'No typography guidelines found in brand document. Consider adding font families, sizes, weights, and hierarchy rules.', 'medium', 'Add comprehensive typography guidelines to your brand document.');
    }

    if (hasLogo) {
      console.log('🏷️ Starting universal logo analysis with:', {
        scrapedLogo: scrapedData.logo,
        brandLogo: brandGuidelines.logo
      });
      try {
        const { UniversalLogoAnalyzer } = await import('./universalLogoAnalyzer.js');
        const logoAnalyzer = new UniversalLogoAnalyzer();
        const logoAnalysis = logoAnalyzer.analyzeLogoUniversal(scrapedData.logo, brandGuidelines.logo);
        analysis.categoryScores.logo = logoAnalysis.score;
        this.issues.push(...logoAnalysis.issues);
        console.log('🏷️ Universal logo analysis result:', logoAnalysis.score);
        analysis.detailedSummary.logo = this.generateCategorySummary('logo', logoAnalysis.score);
      } catch (error) {
        console.warn('⚠️ Universal logo analysis failed, using enhanced fallback:', error.message);
        try {
          const { EnhancedLogoAnalyzer } = await import('./enhancedLogoAnalyzer.js');
          const logoAnalyzer = new EnhancedLogoAnalyzer();
          const logoAnalysis = logoAnalyzer.analyzeLogoCompliance(scrapedData.logo, brandGuidelines.logo);
          analysis.categoryScores.logo = logoAnalysis.score;
          this.issues.push(...logoAnalysis.issues);
          console.log('🏷️ Enhanced logo analysis result:', logoAnalysis.score);
          analysis.detailedSummary.logo = this.generateCategorySummary('logo', logoAnalysis.score);
        } catch (fallbackError) {
          console.warn('⚠️ Enhanced logo analysis also failed, using original:', fallbackError.message);
          analysis.categoryScores.logo = await this.analyzeLogoCompliance(scrapedData.logo, brandGuidelines.logo);
          console.log('🏷️ Original logo analysis result:', analysis.categoryScores.logo);
          analysis.detailedSummary.logo = this.generateCategorySummary('logo', analysis.categoryScores.logo);
        }
      }
    } else {
      // Give partial credit for having logo rules even if no logo is found on the page
      if (brandGuidelines.logo && brandGuidelines.logo.rules && brandGuidelines.logo.rules.length > 0) {
        analysis.categoryScores.logo = 0.4; // 40% credit for having logo guidelines
        analysis.detailedSummary.logo = this.generateCategorySummary('logo', analysis.categoryScores.logo);
        this.addRecommendation('Logo Not Found', 'Logo guidelines are available but no logo was detected on the page. Consider adding a logo to improve brand recognition.', 'medium', 'Add a logo to your website using the provided brand guidelines.');
      } else {
        console.log('🏷️ Skipping logo analysis - no brand logo guidelines');
        analysis.skippedCategories.push('Logo');
        this.addRecommendation('Logo Guidelines Missing', 'No logo guidelines found in brand document. Consider adding logo sizing, clearspace, and usage rules.', 'medium', 'Add comprehensive logo guidelines to your brand document.');
      }
    }

    // Skip layout analysis for now
    analysis.skippedCategories.push('Layout');
    console.log('📐 Skipping layout analysis - not currently supported');

    // Skip imagery analysis for now  
    analysis.skippedCategories.push('Imagery');
    console.log('🖼️ Skipping imagery analysis - not currently supported');

    // Calculate overall score based only on available categories
    const availableScores = Object.values(analysis.categoryScores).filter(score => score > 0);
    analysis.overallScore = availableScores.length > 0 ? 
      availableScores.reduce((sum, score) => sum + score, 0) / availableScores.length : 0;
    
    console.log('📊 Final analysis results:', {
      categoryScores: {
        colors: analysis.categoryScores.colors,
        typography: analysis.categoryScores.typography,
        logo: analysis.categoryScores.logo
      },
      availableScores: availableScores,
      overallScore: analysis.overallScore,
      skippedCategories: analysis.skippedCategories
    });

    // Collect all issues
    analysis.issues = [...this.issues];
    
    // Generate user-friendly recommendations
    analysis.recommendations = this.generateUserFriendlyRecommendations(analysis);
    
    // Calculate summary statistics
    analysis.summary = this.calculateSummary(analysis.issues);
    
    // Calculate confidence
    analysis.confidence = this.calculateConfidence(scrapedData, brandGuidelines);

    // Process issues with LLM for grouping and CSS generation
    if (analysis.issues && analysis.issues.length > 0) {
      try {
        console.log('🧠 Processing issues with LLM for grouping and CSS generation...');
        const processedIssues = await this.llmProcessor.processIssues(analysis.issues);
        analysis.issues = processedIssues;
        console.log(`📊 LLM processed ${analysis.issues.length} issue groups`);
      } catch (error) {
        console.error('❌ LLM issue processing failed:', error);
        // Continue with original issues if LLM fails
      }
    }

    console.log(`✅ Enhanced compliance analysis complete - Overall Score: ${(analysis.overallScore * 100).toFixed(1)}%`);
    return analysis;
  }

  /**
   * Enhanced color compliance analysis with contextual awareness
   * @param {Object} scrapedColors
   * @param {Object} brandColors
   */
  async analyzeColorCompliance(scrapedColors, brandColors) {
    if (!scrapedColors || !brandColors) return 0;

    console.log('🎨 Analyzing color compliance...', {
      scrapedColors: scrapedColors,
      brandColors: brandColors
    });

    let score = 0;
    let checks = 0;

    // Extract colors from nested structure
    const extractedColors = this.extractColorsFromBrandGuidelines(brandColors);
    console.log('🎨 Extracted colors from brand guidelines:', extractedColors);

    // Normalize scraped colors for comparison
    const normalizedScrapedColors = {
      ...scrapedColors,
      palette: scrapedColors.palette?.map(color => this.normalizeColorToHex(color)).filter(Boolean) || [],
      primary: scrapedColors.primary ? this.normalizeColorToHex(scrapedColors.primary) : null,
      secondary: scrapedColors.secondary?.map(color => this.normalizeColorToHex(color)).filter(Boolean) || []
    };
    
    console.log('🎨 Normalized scraped colors:', normalizedScrapedColors);

    // Enhanced contextual color analysis
    const colorContext = this.analyzeColorContext(normalizedScrapedColors, extractedColors);
    
    // Check primary color usage in correct contexts
    if (extractedColors.primary) {
      checks++;
      const primaryContextScore = this.checkPrimaryColorContext(colorContext, extractedColors.primary);
      score += primaryContextScore;
      console.log(`🎨 Primary color score: ${primaryContextScore}`);
    }

    // Check secondary color usage
    if (extractedColors.secondary && extractedColors.secondary.length > 0) {
      checks++;
      const secondaryContextScore = this.checkSecondaryColorContext(colorContext, extractedColors.secondary);
      score += secondaryContextScore;
      console.log(`🎨 Secondary color score: ${secondaryContextScore}`);
    }

    // Check color palette compliance with context
    if (extractedColors.palette && extractedColors.palette.length > 0) {
      checks++;
      const paletteContextScore = this.checkPaletteContext(colorContext, extractedColors.palette);
      score += paletteContextScore;
      console.log(`🎨 Palette color score: ${paletteContextScore}`);
    }

    // If no specific checks, give partial credit for having colors
    if (checks === 0 && scrapedColors.found && scrapedColors.found.length > 0) {
      checks = 1;
      score = 0.5; // Partial credit for having colors
      console.log(`🎨 Partial credit for having colors: ${score}`);
    }

    // Check for unauthorized colors with context
    this.checkUnauthorizedColorsWithContext(colorContext, extractedColors);

    return checks > 0 ? score / checks : 0;
  }

  /**
   * Analyze color context - where colors are used on the website
   * @param {Object} scrapedColors
   * @param {Object} brandColors
   */
  analyzeColorContext(scrapedColors, brandColors) {
    return {
      // Button colors (CTAs, primary actions)
      buttonColors: this.extractButtonColors(scrapedColors),
      // Text colors (headings, body text)
      textColors: this.extractTextColors(scrapedColors),
      // Background colors (main backgrounds, sections)
      backgroundColors: this.extractBackgroundColors(scrapedColors),
      // Accent colors (borders, highlights, secondary elements)
      accentColors: this.extractAccentColors(scrapedColors),
      // All colors found
      allColors: scrapedColors.palette || [],
      // Brand color expectations
      brandExpectations: {
        primary: brandColors.primary,
        secondary: brandColors.secondary || [],
        palette: brandColors.palette || []
      }
    };
  }

  /**
   * Extract button colors from scraped data
   * @param {Object} scrapedColors
   */
  extractButtonColors(scrapedColors) {
    // This would ideally come from the web scraper with element context
    // For now, we'll use heuristics based on color usage patterns
    const buttonColors = [];
    
    if (scrapedColors.primary) {
      buttonColors.push({
        color: scrapedColors.primary,
        context: 'primary-button',
        confidence: 0.8
      });
    }
    
    // Look for common button color patterns
    if (scrapedColors.palette) {
      scrapedColors.palette.forEach(color => {
        // Heuristic: bright, saturated colors are often buttons
        const normalized = this.normalizeColorToRgb(color);
        if (normalized && this.isLikelyButtonColor(normalized)) {
          buttonColors.push({
            color: color,
            context: 'button',
            confidence: 0.6
          });
        }
      });
    }
    
    return buttonColors;
  }

  /**
   * Extract text colors from scraped data
   * @param {Object} scrapedColors
   */
  extractTextColors(scrapedColors) {
    const textColors = [];
    
    // Common text colors
    const commonTextColors = ['#000000', '#333333', '#666666', '#FFFFFF', '#FFFFFF'];
    
    if (scrapedColors.palette) {
      scrapedColors.palette.forEach(color => {
        const normalized = this.normalizeColorToRgb(color);
        if (normalized && this.isLikelyTextColor(normalized)) {
          textColors.push({
            color: color,
            context: 'text',
            confidence: 0.7
          });
        }
      });
    }
    
    return textColors;
  }

  /**
   * Extract background colors from scraped data
   * @param {Object} scrapedColors
   */
  extractBackgroundColors(scrapedColors) {
    const backgroundColors = [];
    
    if (scrapedColors.palette) {
      scrapedColors.palette.forEach(color => {
        const normalized = this.normalizeColorToRgb(color);
        if (normalized && this.isLikelyBackgroundColor(normalized)) {
          backgroundColors.push({
            color: color,
            context: 'background',
            confidence: 0.6
          });
        }
      });
    }
    
    return backgroundColors;
  }

  /**
   * Extract accent colors from scraped data
   * @param {Object} scrapedColors
   */
  extractAccentColors(scrapedColors) {
    const accentColors = [];
    
    if (scrapedColors.palette) {
      scrapedColors.palette.forEach(color => {
        const normalized = this.normalizeColorToRgb(color);
        if (normalized && this.isLikelyAccentColor(normalized)) {
          accentColors.push({
            color: color,
            context: 'accent',
            confidence: 0.5
          });
        }
      });
    }
    
    return accentColors;
  }

  /**
   * Check if a color is likely used for buttons
   * @param {Object} colorRgb
   */
  isLikelyButtonColor(colorRgb) {
    // Bright, saturated colors are often buttons
    const saturation = this.calculateSaturation(colorRgb);
    const brightness = this.calculateBrightness(colorRgb);
    
    return saturation > 0.3 && brightness > 0.2 && brightness < 0.9;
  }

  /**
   * Check if a color is likely used for text
   * @param {Object} colorRgb
   */
  isLikelyTextColor(colorRgb) {
    // Text colors are usually dark or very light
    const brightness = this.calculateBrightness(colorRgb);
    return brightness < 0.3 || brightness > 0.9;
  }

  /**
   * Check if a color is likely used for backgrounds
   * @param {Object} colorRgb
   */
  isLikelyBackgroundColor(colorRgb) {
    // Background colors are usually neutral or light
    const brightness = this.calculateBrightness(colorRgb);
    const saturation = this.calculateSaturation(colorRgb);
    
    return (brightness > 0.7 && saturation < 0.3) || // Light neutral
           (brightness < 0.3 && saturation < 0.3);   // Dark neutral
  }

  /**
   * Check if a color is likely used for accents
   * @param {Object} colorRgb
   */
  isLikelyAccentColor(colorRgb) {
    // Accent colors are usually medium brightness with some saturation
    const brightness = this.calculateBrightness(colorRgb);
    const saturation = this.calculateSaturation(colorRgb);
    
    return brightness > 0.3 && brightness < 0.8 && saturation > 0.2;
  }

  /**
   * Calculate color saturation
   * @param {Object} colorRgb
   */
  calculateSaturation(colorRgb) {
    const { r, g, b } = colorRgb;
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    return max === 0 ? 0 : (max - min) / max;
  }

  /**
   * Calculate color brightness
   * @param {Object} colorRgb
   */
  calculateBrightness(colorRgb) {
    const { r, g, b } = colorRgb;
    return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  }

  /**
   * Check primary color usage in correct contexts
   * @param {Object} colorContext
   * @param {string} brandPrimary
   */
  checkPrimaryColorContext(colorContext, brandPrimary) {
    let score = 0;
    let checks = 0;

    // Check if primary color is used for buttons (correct context)
    const primaryInButtons = colorContext.buttonColors.some(button => 
      this.compareColors(brandPrimary, button.color) > 0.8
    );

    if (primaryInButtons) {
      score += 1;
      checks++;
    } else {
      // Primary color not found in buttons - this is a problem
      this.addEnhancedIssue('color', 'high',
        `Primary brand color not used for buttons/CTAs`,
        `Expected: ${brandPrimary} for buttons, but found other colors`,
        'Use the primary brand color for all call-to-action buttons and primary interactive elements',
        brandPrimary,
        'Not found in buttons',
        {
          element: 'buttons',
          cssProperty: 'background-color',
          expectedHex: brandPrimary,
          foundHex: colorContext.buttonColors.map(b => b.color).join(', ') || 'None'
        }
      );
      checks++;
    }

    // Check if primary color is incorrectly used for text
    const primaryInText = colorContext.textColors.some(text => 
      this.compareColors(brandPrimary, text.color) > 0.8
    );

    if (primaryInText) {
      this.addEnhancedIssue('color', 'medium',
        `Primary brand color used for text (may not be optimal)`,
        `Primary color ${brandPrimary} is being used for text, which may reduce readability`,
        'Consider using primary color for buttons/CTAs and neutral colors for text',
        'Neutral text color (black/white/gray)',
        brandPrimary,
        {
          element: 'text',
          cssProperty: 'color',
          expectedHex: 'Neutral color',
          foundHex: brandPrimary
        }
      );
    }

    return checks > 0 ? score / checks : 0.5;
  }

  /**
   * Check secondary color usage in correct contexts
   * @param {Object} colorContext
   * @param {string[]} brandSecondary
   */
  checkSecondaryColorContext(colorContext, brandSecondary) {
    let score = 0;
    let checks = 0;

    // Check if secondary colors are used appropriately
    for (const secondaryColor of brandSecondary) {
      const foundInAccents = colorContext.accentColors.some(accent => 
        this.compareColors(secondaryColor, accent.color) > 0.8
      );
      
      const foundInBackgrounds = colorContext.backgroundColors.some(bg => 
        this.compareColors(secondaryColor, bg.color) > 0.8
      );

      if (foundInAccents || foundInBackgrounds) {
        score += 1;
        checks++;
      } else {
        this.addIssue('color', 'medium',
          `Secondary color ${secondaryColor} not found in appropriate contexts`,
          'Secondary colors should be used for accents, backgrounds, or secondary elements',
          'Use secondary colors for accents, backgrounds, or secondary interactive elements',
          secondaryColor,
          'Not found'
        );
        checks++;
      }
    }

    return checks > 0 ? score / checks : 0.5;
  }

  /**
   * Check color palette compliance with context
   * @param {Object} colorContext
   * @param {string[]} brandPalette
   */
  checkPaletteContext(colorContext, brandPalette) {
    let score = 0;
    let checks = 0;

    // Check if brand colors are used in appropriate contexts
    for (const brandColor of brandPalette) {
      const foundInContext = 
        colorContext.buttonColors.some(btn => this.compareColors(brandColor, btn.color) > 0.8) ||
        colorContext.accentColors.some(acc => this.compareColors(brandColor, acc.color) > 0.8) ||
        colorContext.backgroundColors.some(bg => this.compareColors(brandColor, bg.color) > 0.8);

      if (foundInContext) {
        score += 1;
        checks++;
      }
    }

    return checks > 0 ? score / checks : 0.5;
  }

  /**
   * Check for unauthorized colors with context awareness
   * @param {Object} colorContext
   * @param {Object} brandColors
   */
  checkUnauthorizedColorsWithContext(colorContext, brandColors) {
    const brandPalette = brandColors.palette || [];
    const unauthorizedColors = [];

    // Define acceptable neutral colors that are usually OK
    const acceptableNeutrals = [
      '#FFFFFF', '#000000', '#F5F5F5', '#F8F8F8', '#FAFAFA', '#F0F0F0',
      '#E5E5E5', '#D3D3D3', '#C0C0C0', '#A9A9A9', '#808080', '#696969',
      '#555555', '#333333', '#2A2A2A', '#1A1A1A', '#111111', '#000000',
      // Add more common web colors
      '#F9F9F9', '#F7F7F7', '#F3F3F3', '#EEEEEE', '#E8E8E8', '#DDDDDD',
      '#CCCCCC', '#BBBBBB', '#AAAAAA', '#999999', '#888888', '#777777',
      '#666666', '#444444', '#222222', '#111111'
    ];

    // If no brand palette is defined, be more lenient
    if (brandPalette.length === 0) {
      console.log('🎨 No brand palette defined, skipping unauthorized color check');
      return;
    }

    // Check all found colors against brand palette
    colorContext.allColors.forEach(foundColor => {
      // Normalize both colors to the same format for comparison
      const normalizedFound = this.normalizeColorToHex(foundColor);
      const normalizedBrand = brandPalette.map(brandColor => this.normalizeColorToHex(brandColor));
      
      // Check if it's an acceptable neutral first
      const isAcceptableNeutral = acceptableNeutrals.some(neutral => 
        this.compareColors(neutral, normalizedFound) > 0.9
      );
      
      if (isAcceptableNeutral) {
        return; // Skip neutral colors
      }
      
      const isAuthorized = normalizedBrand.some(brandColor => 
        this.compareColors(brandColor, normalizedFound) > 0.7 // Lower threshold for matching
      );
      
      if (!isAuthorized && !isAcceptableNeutral) {
        // Check if this unauthorized color is used in critical contexts
        const usedInButtons = colorContext.buttonColors.some(btn => 
          this.compareColors(normalizedFound, this.normalizeColorToHex(btn.color)) > 0.8
        );
        
        const usedInText = colorContext.textColors.some(text => 
          this.compareColors(normalizedFound, this.normalizeColorToHex(text.color)) > 0.8
        );

        unauthorizedColors.push({
          color: foundColor,
          normalized: normalizedFound,
          context: usedInButtons ? 'buttons' : usedInText ? 'text' : 'other',
          severity: usedInButtons ? 'high' : usedInText ? 'medium' : 'low'
        });
      }
    });

    if (unauthorizedColors.length > 0) {
      // Group by severity
      const highSeverity = unauthorizedColors.filter(c => c.severity === 'high');
      const mediumSeverity = unauthorizedColors.filter(c => c.severity === 'medium');
      const lowSeverity = unauthorizedColors.filter(c => c.severity === 'low');

      // Report high severity unauthorized colors (used in buttons)
      if (highSeverity.length > 0) {
        this.addEnhancedIssue('color', 'high',
          `🚨 Critical: Non-brand colors used for buttons`,
          `Your website uses ${highSeverity.length} colors for buttons that aren't in your brand palette. This affects brand consistency.`,
          `Replace these button colors with your approved brand colors: ${brandPalette.map(c => this.normalizeColorToHex(c)).join(', ')}`,
          `Brand colors: ${brandPalette.map(c => this.normalizeColorToHex(c)).join(', ')}`,
          `Found: ${highSeverity.map(c => this.normalizeColorToHex(c.color)).join(', ')}`,
          {
            unauthorizedColors: highSeverity.map(c => ({
              original: c.color,
              hex: this.normalizeColorToHex(c.color),
              context: c.context
            }))
          }
        );
      }

      // Report medium severity unauthorized colors (used in text)
      if (mediumSeverity.length > 0) {
        this.addEnhancedIssue('color', 'medium',
          `⚠️ Text colors don't match brand palette`,
          `Your website uses ${mediumSeverity.length} colors for text that aren't in your brand palette. Consider using brand colors or neutral colors for better consistency.`,
          `Use your brand colors for important text: ${brandPalette.map(c => this.normalizeColorToHex(c)).join(', ')} or neutral colors like black/white/gray`,
          `Brand colors: ${brandPalette.map(c => this.normalizeColorToHex(c)).join(', ')}`,
          `Found: ${mediumSeverity.map(c => this.normalizeColorToHex(c.color)).join(', ')}`,
          {
            unauthorizedColors: mediumSeverity.map(c => ({
              original: c.color,
              hex: this.normalizeColorToHex(c.color),
              context: c.context
            }))
          }
        );
      }

      // Report low severity unauthorized colors (used elsewhere)
      if (lowSeverity.length > 0) {
        this.addEnhancedIssue('color', 'low',
          `💡 Minor: Non-brand colors found`,
          `Your website uses ${lowSeverity.length} colors that aren't in your brand palette. These are used in less critical areas.`,
          `Consider using your brand colors for better consistency: ${brandPalette.map(c => this.normalizeColorToHex(c)).join(', ')}`,
          `Brand colors: ${brandPalette.map(c => this.normalizeColorToHex(c)).join(', ')}`,
          `Found: ${lowSeverity.map(c => this.normalizeColorToHex(c.color)).join(', ')}`,
          {
            unauthorizedColors: lowSeverity.map(c => ({
              original: c.color,
              hex: this.normalizeColorToHex(c.color),
              context: c.context
            }))
          }
        );
      }
    }
  }

  /**
   * Enhanced typography compliance analysis
   * @param {Object} scrapedTypography
   * @param {Object} brandTypography
   */
  async analyzeTypographyCompliance(scrapedTypography, brandTypography) {
    if (!scrapedTypography || !brandTypography) return 0;

    console.log('📝 Analyzing typography compliance...', {
      scrapedTypography: scrapedTypography,
      brandTypography: brandTypography
    });

    // Extract typography from nested structure
    const extractedTypography = this.extractTypographyFromBrandGuidelines(brandTypography);
    console.log('📝 Extracted typography from brand guidelines:', extractedTypography);

    let score = 0;
    let checks = 0;

    // Check primary font
    if (extractedTypography.primaryFont) {
      checks++;
      console.log(`📝 Checking primary font: ${extractedTypography.primaryFont} vs ${scrapedTypography.primaryFont}`);
      if (scrapedTypography.primaryFont) {
        const fontMatch = this.compareFonts(extractedTypography.primaryFont, scrapedTypography.primaryFont);
        console.log(`📝 Font match result: ${fontMatch}`);
        if (fontMatch) {
          score += 1;
          console.log(`📝 Primary font match - score: ${score}`);
        } else {
          // Give partial credit for having a font, even if it's wrong
          score += 0.3;
          console.log(`📝 Primary font mismatch - partial credit: ${score}`);
          this.addEnhancedIssue('typography', 'high',
            'Incorrect font family used for headings and body text',
            `Expected: ${extractedTypography.primaryFont}, Found: ${scrapedTypography.primaryFont}`,
            `Update to ${extractedTypography.primaryFont} or its approved fallback fonts`,
            extractedTypography.primaryFont,
            scrapedTypography.primaryFont,
            {
              element: 'headings / body text',
              cssProperty: 'font-family',
              location: 'CSS font declarations'
            }
          );
        }
      } else {
        console.log(`📝 No scraped primary font found - adding issue`);
        this.addIssue('typography', 'high',
          'Primary brand font not found',
          'The primary brand font should be used for headings and key text',
          'Apply the primary brand font to important text elements',
          extractedTypography.primaryFont,
          'Not found'
        );
      }
    } else {
      console.log(`📝 No extracted primary font found`);
    }

    // Check font family compliance
    if (extractedTypography.fonts && extractedTypography.fonts.length > 0) {
      checks++;
      const brandFonts = extractedTypography.fonts;
      const scrapedFonts = scrapedTypography.fonts || [];
      
      let matchingFonts = 0;
      for (const brandFont of brandFonts) {
        const found = scrapedFonts.some(scrapedFont => 
          this.compareFonts(brandFont, scrapedFont)
        );
        if (found) matchingFonts++;
      }
      
      const fontScore = matchingFonts / brandFonts.length;
      // Give partial credit even if no fonts match
      const adjustedScore = fontScore > 0 ? fontScore : 0.2; // 20% credit for having fonts
      score += adjustedScore;
      console.log(`📝 Font family score: ${fontScore} -> adjusted: ${adjustedScore}`);
      
      if (fontScore < 0.5) {
        this.addIssue('typography', 'medium',
          `Only ${(fontScore * 100).toFixed(0)}% of brand fonts found`,
          `Expected: ${brandFonts.length} brand fonts, Found: ${matchingFonts} matches`,
          'Use more fonts from the approved brand typography',
          brandFonts.join(', '),
          scrapedFonts.join(', ')
        );
      }
    }

    // Check font weights
    if (brandTypography.weights && brandTypography.weights.length > 0) {
      checks++;
      const brandWeights = brandTypography.weights;
      const scrapedWeights = scrapedTypography.weights || [];
      
      let matchingWeights = 0;
      for (const brandWeight of brandWeights) {
        const found = scrapedWeights.some(scrapedWeight => 
          this.compareFontWeights(brandWeight, scrapedWeight)
        );
        if (found) matchingWeights++;
      }
      
      const weightScore = matchingWeights / brandWeights.length;
      score += weightScore;
      
      if (weightScore < 0.3) {
        this.addIssue('typography', 'medium',
          `Font weights don't match brand guidelines`,
          `Expected weights: ${brandWeights.join(', ')}, Found: ${scrapedWeights.join(', ')}`,
          'Use the correct font weights as specified in brand guidelines',
          brandWeights.join(', '),
          scrapedWeights.join(', ')
        );
      }
    }

    // Check font sizes with robust unit conversion and tolerance
    if (brandTypography.sizes && brandTypography.sizes.length > 0) {
      checks++;
      const brandSizes = brandTypography.sizes;
      const scrapedSizes = scrapedTypography.sizes || [];
      
      // Get page root font size for unit conversion
      const pageRootFontSize = getPageRootFontSize();
      
      let matchingSizes = 0;
      let sizeIssues = 0;
      
      for (const brandSize of brandSizes) {
        const found = scrapedSizes.some(scrapedSize => {
          // Convert both sizes to pixels for comparison
          const expectedPx = parseSizeToPx(brandSize, pageRootFontSize);
          const foundPx = parseSizeToPx(scrapedSize, pageRootFontSize);
          
          if (expectedPx && foundPx) {
            const comparison = compareSizes(expectedPx, foundPx, { tolerancePct: 12 });
            if (comparison.pass) {
              return true;
            } else {
              sizeIssues++;
              const report = generateSizeReport(comparison, 'font-size', brandSize);
              this.addEnhancedIssue('typography', report.severity,
                report.message,
                report.details.expected + ' vs ' + report.details.found,
                report.recommendation,
                brandSize,
                scrapedSize,
                {
                  element: 'font-size',
                  cssProperty: 'font-size',
                  location: 'CSS font-size declarations',
                  differencePct: comparison.differencePct,
                  tolerancePct: comparison.tolerancePct
                }
              );
              return false;
            }
          }
          
          // Fallback to original comparison if conversion fails
          return this.compareFontSizes(brandSize, scrapedSize);
        });
        
        if (found) matchingSizes++;
      }
      
      const sizeScore = matchingSizes / brandSizes.length;
      score += sizeScore;
      
      if (sizeScore < 0.3) {
        this.addIssue('typography', 'low',
          `Font sizes don't follow brand guidelines`,
          `Expected sizes: ${brandSizes.join(', ')}, Found: ${scrapedSizes.join(', ')}`,
          'Use the correct font sizes as specified in brand guidelines',
          brandSizes.join(', '),
          scrapedSizes.join(', ')
        );
      }
    }

    // If no specific checks, give partial credit for having typography
    if (checks === 0 && scrapedTypography.found && scrapedTypography.found.length > 0) {
      checks = 1;
      score = 0.5; // Partial credit for having typography
      console.log(`📝 Partial credit for having typography: ${score}`);
    }

    const finalScore = checks > 0 ? score / checks : 0;
    console.log(`📝 Typography compliance score: ${finalScore}`);
    return finalScore;
  }

  /**
   * Check typography hierarchy with robust size comparison
   * @param {object} hierarchy - Brand typography hierarchy
   * @param {object} components - Scraped components
   * @param {number} pageRootFontSize - Page root font size
   * @returns {number} - Hierarchy compliance score
   */
  checkTypographyHierarchy(hierarchy, components, pageRootFontSize) {
    if (!hierarchy || !components) return 0;

    let score = 0;
    let checks = 0;

    // Check heading hierarchy
    const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
    for (const level of headingLevels) {
      if (hierarchy[level] && components[level]) {
        checks++;
        const expectedSize = parseSizeToPx(hierarchy[level].size, pageRootFontSize);
        const foundSize = parseSizeToPx(components[level].size, pageRootFontSize);
        
        if (expectedSize && foundSize) {
          const comparison = compareSizes(expectedSize, foundSize, { tolerancePct: 12 });
          if (comparison.pass) {
            score += 1;
          } else {
            const report = generateSizeReport(comparison, level, hierarchy[level].size);
            this.addEnhancedIssue('typography', report.severity,
              report.message,
              report.details.expected + ' vs ' + report.details.found,
              report.recommendation,
              hierarchy[level].size,
              components[level].size,
              {
                element: level,
                cssProperty: 'font-size',
                location: 'CSS font-size declarations',
                differencePct: comparison.differencePct,
                tolerancePct: comparison.tolerancePct
              }
            );
          }
        }
      }
    }

    return checks > 0 ? score / checks : 0;
  }

  /**
   * Extract colors from components data
   * @param {Object} components - Scraped components data
   * @returns {Object} - Extracted colors data
   */
  extractColorsFromComponents(components) {
    const colors = {
      primary: null,
      secondary: [],
      palette: [],
      found: []
    };

    // Extract colors from all components
    const allComponents = [
      ...(components.headings || []),
      ...(components.paragraphs || []),
      ...(components.buttons || []),
      ...(components.links || []),
      ...(components.navigation || []),
      ...(components.forms || []),
      ...(components.cards || []),
      ...(components.sections || [])
    ];

    allComponents.forEach(component => {
      if (component.styles) {
        // Extract text colors
        if (component.styles.color) {
          colors.found.push({
            color: component.styles.color,
            element: component.tag || component.type || 'element',
            usage: 'text'
          });
        }
        // Extract background colors
        if (component.styles.backgroundColor) {
          colors.found.push({
            color: component.styles.backgroundColor,
            element: component.tag || component.type || 'element',
            usage: 'background'
          });
        }
      }
    });

    // Remove duplicates and normalize
    const uniqueColors = [...new Set(colors.found.map(c => this.normalizeColorToHex(c.color)))];
    colors.palette = uniqueColors.filter(c => c && c !== '#000000' && c !== '#ffffff');

    return colors;
  }

  /**
   * Extract typography from components data
   * @param {Object} components - Scraped components data
   * @returns {Object} - Extracted typography data
   */
  extractTypographyFromComponents(components) {
    const typography = {
      primaryFont: null,
      fonts: [],
      weights: [],
      sizes: [],
      found: []
    };

    // Extract typography from all components
    const allComponents = [
      ...(components.headings || []),
      ...(components.paragraphs || []),
      ...(components.buttons || []),
      ...(components.links || [])
    ];

    allComponents.forEach(component => {
      if (component.styles) {
        // Extract font family
        if (component.styles.fontFamily) {
          typography.found.push({
            fontFamily: component.styles.fontFamily,
            element: component.tag || component.type || 'element'
          });
        }
        // Extract font size
        if (component.styles.fontSize) {
          typography.found.push({
            fontSize: component.styles.fontSize,
            element: component.tag || component.type || 'element'
          });
        }
        // Extract font weight
        if (component.styles.fontWeight) {
          typography.found.push({
            fontWeight: component.styles.fontWeight,
            element: component.tag || component.type || 'element'
          });
        }
      }
    });

    // Extract unique values
    const uniqueFonts = [...new Set(typography.found.filter(f => f.fontFamily).map(f => f.fontFamily))];
    const uniqueSizes = [...new Set(typography.found.filter(f => f.fontSize).map(f => f.fontSize))];
    const uniqueWeights = [...new Set(typography.found.filter(f => f.fontWeight).map(f => f.fontWeight))];

    typography.fonts = uniqueFonts;
    typography.sizes = uniqueSizes;
    typography.weights = uniqueWeights;
    typography.primaryFont = uniqueFonts[0] || null;

    return typography;
  }

  /**
   * Extract logo data from components
   * @param {Object} components - Scraped components data
   * @returns {Object} - Extracted logo data
   */
  extractLogoFromComponents(components) {
    const logo = {
      found: [],
      sizes: [],
      spacing: []
    };

    // Look for logo-related elements
    const allComponents = [
      ...(components.headings || []),
      ...(components.buttons || []),
      ...(components.navigation || [])
    ];

    allComponents.forEach(component => {
      if (component.styles) {
        // Check for logo-like elements (usually in headers/navigation)
        if (component.tag === 'h1' || component.type === 'logo' || 
            (component.text && component.text.toLowerCase().includes('logo'))) {
          logo.found.push({
            element: component.tag || component.type,
            text: component.text,
            styles: component.styles
          });
        }
      }
    });

    return logo;
  }

  /**
   * Extract colors from nested brand guidelines structure
   * @param {Object} brandColors - Brand colors from database
   * @returns {Object} - Flattened color structure
   */
  extractColorsFromBrandGuidelines(brandColors) {
    const extracted = {
      primary: null,
      secondary: [],
      palette: [],
      semantic: {},
      neutral: {}
    };

    if (!brandColors) return extracted;

    console.log('🎨 Raw brand colors structure:', brandColors);

    // Handle array format (current structure)
    if (Array.isArray(brandColors)) {
      console.log('🎨 Processing array format brand colors');
      
      // Extract all hex colors from the array
      brandColors.forEach((colorObj, index) => {
        if (colorObj.hex) {
          extracted.palette.push(colorObj.hex);
          
          // Set primary color (first one or the one marked as primary)
          if (index === 0 || colorObj.usage?.includes('Primary') || colorObj.usage?.includes('primary')) {
            extracted.primary = colorObj.hex;
          }
          
          // Add to secondary if marked as secondary
          if (colorObj.usage?.includes('Secondary') || colorObj.usage?.includes('secondary')) {
            extracted.secondary.push(colorObj.hex);
          }
        }
      });
      
      // If no primary was set, use the first color
      if (!extracted.primary && extracted.palette.length > 0) {
        extracted.primary = extracted.palette[0];
      }
      
      // If no secondary was set, use the second color
      if (extracted.secondary.length === 0 && extracted.palette.length > 1) {
        extracted.secondary.push(extracted.palette[1]);
      }
    }
    // Handle object format (nested structure)
    else if (typeof brandColors === 'object') {
      console.log('🎨 Processing object format brand colors');
      
      // Extract from simple structure (if exists)
      if (brandColors.primary) extracted.primary = brandColors.primary;
      if (brandColors.secondary) extracted.secondary = Array.isArray(brandColors.secondary) ? brandColors.secondary : [brandColors.secondary];
      if (brandColors.palette) extracted.palette = Array.isArray(brandColors.palette) ? brandColors.palette : [brandColors.palette];

      // Extract from nested semantic structure
      if (brandColors.semantic) {
        extracted.semantic = brandColors.semantic;
        
        // Extract primary from semantic
        if (brandColors.semantic.primary?.hex) {
          extracted.primary = brandColors.semantic.primary.hex;
        }
        
        // Extract secondary from semantic
        if (brandColors.semantic.secondary?.hex) {
          extracted.secondary.push(brandColors.semantic.secondary.hex);
        }
        
        // Add all semantic colors to palette
        Object.values(brandColors.semantic).forEach(color => {
          if (color?.hex) {
            extracted.palette.push(color.hex);
          }
        });
      }

      // Extract from nested neutral structure
      if (brandColors.neutral) {
        extracted.neutral = brandColors.neutral;
        
        // Add all neutral colors to palette
        Object.values(brandColors.neutral).forEach(color => {
          if (color?.hex) {
            extracted.palette.push(color.hex);
          }
        });
      }
    }

    // Remove duplicates from palette
    extracted.palette = [...new Set(extracted.palette)];

    console.log('🎨 Extracted colors:', extracted);
    return extracted;
  }

  /**
   * Normalize color to HEX format for comparison
   * @param {string} color - Color in any format (RGB, HEX, etc.)
   * @returns {string} - Normalized HEX color
   */
  normalizeColorToHex(color) {
    if (!color) return null;
    
    // Ensure color is a string
    if (typeof color !== 'string') {
      console.warn('⚠️ normalizeColorToHex received non-string value:', color, typeof color);
      return null;
    }
    
    // If already HEX format
    if (color.startsWith('#')) {
      return color.toUpperCase();
    }
    
    // Convert RGB to HEX
    if (color.startsWith('rgb(')) {
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      }
    }
    
    // Convert RGBA to HEX (ignore alpha)
    if (color.startsWith('rgba(')) {
      const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
      if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
      }
    }
    
    // Handle CSS variables and other formats
    if (color.includes('var(') || color.includes('/')) {
      return null; // Skip complex CSS values
    }
    
    // If it's a 6-digit hex without #
    if (/^[0-9A-Fa-f]{6}$/.test(color)) {
      return `#${color.toUpperCase()}`;
    }
    
    // If it's a 3-digit hex without #
    if (/^[0-9A-Fa-f]{3}$/.test(color)) {
      const r = color[0] + color[0];
      const g = color[1] + color[1];
      const b = color[2] + color[2];
      return `#${r}${g}${b}`.toUpperCase();
    }
    
    return null;
  }

  /**
   * Extract typography from nested brand guidelines structure
   * @param {Object} brandTypography - Brand typography from database
   * @returns {Object} - Flattened typography structure
   */
  extractTypographyFromBrandGuidelines(brandTypography) {
    const extracted = {
      primaryFont: null,
      secondaryFont: null,
      fonts: [],
      weights: [],
      sizes: []
    };

    if (!brandTypography) return extracted;

    console.log('📝 Raw brand typography structure:', brandTypography);

    // Handle array format (current structure)
    if (Array.isArray(brandTypography)) {
      console.log('📝 Processing array format brand typography');
      
      brandTypography.forEach((fontObj, index) => {
        console.log(`📝 Processing font object ${index}:`, fontObj);
        
        if (fontObj.font) {
          extracted.fonts.push(fontObj.font);
          console.log(`📝 Added font: ${fontObj.font}`);
          
          // Set primary font (first one or marked as primary)
          if (!extracted.primaryFont || fontObj.usage?.includes('Primary') || fontObj.usage?.includes('primary')) {
            extracted.primaryFont = fontObj.font;
            console.log(`📝 Set primary font: ${fontObj.font}`);
          }
        }
        
        // Extract weights if available
        if (fontObj.weights && Array.isArray(fontObj.weights)) {
          console.log(`📝 Adding weights:`, fontObj.weights);
          extracted.weights.push(...fontObj.weights);
        } else {
          console.log(`📝 No weights found in font object:`, fontObj.weights);
        }
      });
    }
    // Handle object format (nested structure)
    else if (typeof brandTypography === 'object') {
      console.log('📝 Processing object format brand typography');
      
      // Extract from simple structure (if exists)
      if (brandTypography.primaryFont) extracted.primaryFont = brandTypography.primaryFont;
      if (brandTypography.secondaryFont) extracted.secondaryFont = brandTypography.secondaryFont;
      if (brandTypography.fonts) extracted.fonts = Array.isArray(brandTypography.fonts) ? brandTypography.fonts : [brandTypography.fonts];
      if (brandTypography.weights) extracted.weights = Array.isArray(brandTypography.weights) ? brandTypography.weights : [brandTypography.weights];
      if (brandTypography.sizes) extracted.sizes = Array.isArray(brandTypography.sizes) ? brandTypography.sizes : [brandTypography.sizes];

      // Extract from nested structure
      if (brandTypography.primary?.fontFamily) {
        extracted.primaryFont = brandTypography.primary.fontFamily;
        extracted.fonts.push(brandTypography.primary.fontFamily);
      }
      if (brandTypography.secondary?.fontFamily) {
        extracted.secondaryFont = brandTypography.secondary.fontFamily;
        extracted.fonts.push(brandTypography.secondary.fontFamily);
      }
    }

    // Remove duplicates from fonts and weights
    extracted.fonts = [...new Set(extracted.fonts)];
    extracted.weights = [...new Set(extracted.weights)];

    console.log('📝 Extracted typography:', extracted);
    return extracted;
  }

  /**
   * Enhanced logo compliance analysis
   * @param {Object} scrapedLogo
   * @param {Object} brandLogo
   */
  async analyzeLogoCompliance(scrapedLogo, brandLogo) {
    if (!brandLogo) return 0;

    let score = 0;
    let checks = 0;

    // Give partial credit for having logo rules even if no logo is found
    if (brandLogo.rules && brandLogo.rules.length > 0) {
      checks++;
      if (scrapedLogo && scrapedLogo.found) {
        score += 1;
      } else {
        score += 0.3; // 30% credit for having rules but no logo found
      }
    }

    // Check if logo is present
    if (brandLogo.minPrintSize || brandLogo.minDigitalSize) {
      checks++;
      if (scrapedLogo && scrapedLogo.found) {
        score += 1;
      } else {
        this.addIssue('logo', 'high',
          'Brand logo not found on website',
          'The brand logo should be prominently displayed',
          'Add the brand logo to the header or main navigation',
          'Brand logo required',
          'Not found'
        );
      }
    }

    // Check logo sizing (if available)
    if (scrapedLogo.found && brandLogo.minDigitalSize) {
      checks++;
      const minSize = this.parseSize(brandLogo.minDigitalSize);
      const actualSize = this.parseSize(scrapedLogo.width || scrapedLogo.height);
      
      if (minSize && actualSize && actualSize < minSize) {
        this.addIssue('logo', 'medium',
          'Logo size is too small',
          `Minimum size: ${brandLogo.minDigitalSize}, Found: ${scrapedLogo.width || scrapedLogo.height}`,
          'Ensure the logo meets the minimum size requirements',
          brandLogo.minDigitalSize,
          scrapedLogo.width || scrapedLogo.height
        );
      } else {
        score += 1;
      }
    }

    // Check logo clearspace (if available)
    if (scrapedLogo.found && brandLogo.clearspace) {
      checks++;
      // This would need more detailed analysis of actual spacing
      // For now, just check if logo is present
      score += 1;
    }

    // Check logo aspect ratio (if available)
    if (scrapedLogo.found && brandLogo.aspectRatio) {
      checks++;
      // This would need more detailed analysis of actual aspect ratio
      // For now, just check if logo is present
      score += 1;
    }

    // Check logo rules (do's and don'ts)
    if (scrapedLogo.found && brandLogo.rules && brandLogo.rules.length > 0) {
      checks++;
      // This would need more detailed analysis of logo usage
      // For now, just check if logo is present
      score += 1;
    }

    return checks > 0 ? score / checks : 0;
  }

  /**
   * Parse size string to numeric value
   * @param {string} sizeStr
   */
  parseSize(sizeStr) {
    if (!sizeStr) return null;
    const match = sizeStr.toString().match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  /**
   * Enhanced layout compliance analysis
   * @param {Object} scrapedLayout
   * @param {Object} brandSpacing
   */
  async analyzeLayoutCompliance(scrapedLayout, brandSpacing) {
    if (!scrapedLayout || !brandSpacing) return 0;

    console.log('📐 Analyzing layout compliance...', {
      scrapedLayout: scrapedLayout,
      brandSpacing: brandSpacing
    });

    let score = 0;
    let checks = 0;

    // Check margin compliance
    if (brandSpacing.margin) {
      checks++;
      const brandMargin = this.parseSize(brandSpacing.margin);
      const scrapedMargin = this.parseSize(scrapedLayout.margin);
      
      if (brandMargin && scrapedMargin) {
        const tolerance = brandMargin * 0.2; // 20% tolerance
        if (Math.abs(brandMargin - scrapedMargin) <= tolerance) {
          score += 1;
        } else {
          this.addIssue('layout', 'medium',
            'Margin spacing doesn\'t match brand guidelines',
            `Expected: ${brandSpacing.margin}, Found: ${scrapedLayout.margin}`,
            'Use the correct margin spacing as specified in brand guidelines',
            brandSpacing.margin,
            scrapedLayout.margin
          );
        }
      } else {
        score += 0.5; // Partial credit if we can't compare
      }
    }

    // Check padding compliance
    if (brandSpacing.padding) {
      checks++;
      const brandPadding = this.parseSize(brandSpacing.padding);
      const scrapedPadding = this.parseSize(scrapedLayout.padding);
      
      if (brandPadding && scrapedPadding) {
        const tolerance = brandPadding * 0.2; // 20% tolerance
        if (Math.abs(brandPadding - scrapedPadding) <= tolerance) {
          score += 1;
        } else {
          this.addIssue('layout', 'medium',
            'Padding spacing doesn\'t match brand guidelines',
            `Expected: ${brandSpacing.padding}, Found: ${scrapedLayout.padding}`,
            'Use the correct padding spacing as specified in brand guidelines',
            brandSpacing.padding,
            scrapedLayout.padding
          );
        }
      } else {
        score += 0.5; // Partial credit if we can't compare
      }
    }

    // Check line height compliance
    if (brandSpacing.lineHeight) {
      checks++;
      const brandLineHeight = this.parseSize(brandSpacing.lineHeight);
      const scrapedLineHeight = this.parseSize(scrapedLayout.lineHeight);
      
      if (brandLineHeight && scrapedLineHeight) {
        const tolerance = brandLineHeight * 0.2; // 20% tolerance
        if (Math.abs(brandLineHeight - scrapedLineHeight) <= tolerance) {
          score += 1;
        } else {
          this.addIssue('layout', 'low',
            'Line height doesn\'t match brand guidelines',
            `Expected: ${brandSpacing.lineHeight}, Found: ${scrapedLayout.lineHeight}`,
            'Use the correct line height as specified in brand guidelines',
            brandSpacing.lineHeight,
            scrapedLayout.lineHeight
          );
        }
      } else {
        score += 0.5; // Partial credit if we can't compare
      }
    }

    // If no specific checks, give partial credit for having layout
    if (checks === 0 && scrapedLayout && Object.keys(scrapedLayout).length > 0) {
      checks = 1;
      score = 0.5; // Partial credit for having layout
      console.log(`📐 Partial credit for having layout: ${score}`);
    }

    const finalScore = checks > 0 ? score / checks : 0.8; // Default score if no spacing rules
    console.log(`📐 Layout compliance score: ${finalScore}`);
    return finalScore;
  }

  /**
   * Enhanced imagery compliance analysis
   * @param {Object} scrapedImagery
   * @param {Object} brandImagery
   */
  async analyzeImageryCompliance(scrapedImagery, brandImagery) {
    if (!scrapedImagery || !brandImagery) return 0;

    let score = 0;
    let checks = 0;

    // Check image style compliance
    if (brandImagery.style) {
      checks++;
      const brandStyle = brandImagery.style.toLowerCase();
      const scrapedStyle = scrapedImagery.style?.toLowerCase() || '';
      
      if (scrapedStyle.includes(brandStyle) || brandStyle.includes(scrapedStyle)) {
        score += 1;
      } else {
        this.addEnhancedIssue('imagery', 'medium',
          'Image style doesn\'t match brand guidelines',
          `Expected style: ${brandImagery.style}, Found: ${scrapedImagery.style || 'not specified'}`,
          'Use images that match the described brand tone and style',
          brandImagery.style,
          scrapedImagery.style || 'not specified',
          {
            element: 'images / photos',
            cssProperty: 'image-style',
            location: 'image content analysis'
          }
        );
      }
    }

    // Check image quality compliance
    if (brandImagery.quality) {
      checks++;
      const brandQuality = brandImagery.quality.toLowerCase();
      const scrapedQuality = scrapedImagery.quality?.toLowerCase() || '';
      
      if (scrapedQuality.includes(brandQuality) || brandQuality.includes(scrapedQuality)) {
        score += 1;
      } else {
        this.addEnhancedIssue('imagery', 'low',
          'Image quality doesn\'t meet brand standards',
          `Expected quality: ${brandImagery.quality}, Found: ${scrapedImagery.quality || 'not specified'}`,
          'Ensure images meet the quality standards specified in brand guidelines',
          brandImagery.quality,
          scrapedImagery.quality || 'not specified',
          {
            element: 'images',
            cssProperty: 'image-quality',
            location: 'image resolution and clarity'
          }
        );
      }
    }

    // Check image tone compliance
    if (brandImagery.tone) {
      checks++;
      const brandTone = brandImagery.tone.toLowerCase();
      const scrapedTone = scrapedImagery.tone?.toLowerCase() || '';
      
      if (scrapedTone.includes(brandTone) || brandTone.includes(scrapedTone)) {
        score += 1;
      } else {
        this.addEnhancedIssue('imagery', 'medium',
          'Image tone doesn\'t align with brand voice',
          `Expected tone: ${brandImagery.tone}, Found: ${scrapedImagery.tone || 'not specified'}`,
          'Use images that reflect the brand\'s tone and personality',
          brandImagery.tone,
          scrapedImagery.tone || 'not specified',
          {
            element: 'images',
            cssProperty: 'image-tone',
            location: 'image mood and atmosphere'
          }
        );
      }
    }

    return checks > 0 ? score / checks : 0.7; // Default score if no imagery rules
  }

  /**
   * Compare two colors for similarity with format normalization
   * @param {string} color1
   * @param {string} color2
   */
  compareColors(color1, color2) {
    if (!color1 || !color2) return 0;
    
    // Normalize both colors to RGB format
    const rgb1 = this.normalizeColorToRgb(color1);
    const rgb2 = this.normalizeColorToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    // Calculate Euclidean distance
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
    
    // Convert to similarity (0-1)
    const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
    return 1 - (distance / maxDistance);
  }

  /**
   * Normalize any color format to RGB and return both RGB and HEX formats
   * @param {string} color
   */
  normalizeColorToRgb(color) {
    if (!color) return null;
    
    // Ensure color is a string
    if (typeof color !== 'string') {
      console.warn('⚠️ normalizeColorToRgb received non-string value:', color, typeof color);
      return null;
    }
    
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b, hex: color.toUpperCase() };
    }
    
    // Handle rgb() colors
    if (color.startsWith('rgb(')) {
      const values = color.match(/\d+/g);
      if (values && values.length >= 3) {
        const r = parseInt(values[0]);
        const g = parseInt(values[1]);
        const b = parseInt(values[2]);
        const hex = this.rgbToHex(r, g, b);
        return { r, g, b, hex };
      }
    }
    
    // Handle rgba() colors (ignore alpha for comparison)
    if (color.startsWith('rgba(')) {
      const values = color.match(/\d+/g);
      if (values && values.length >= 3) {
        const r = parseInt(values[0]);
        const g = parseInt(values[1]);
        const b = parseInt(values[2]);
        const hex = this.rgbToHex(r, g, b);
        return { r, g, b, hex };
      }
    }
    
    return null;
  }

  /**
   * Convert RGB values to HEX
   * @param {number} r
   * @param {number} g
   * @param {number} b
   */
  rgbToHex(r, g, b) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  }

  /**
   * Normalize any color format to HEX
   * @param {string} color
   */
  normalizeColorToHex(color) {
    if (!color) return null;
    
    // Ensure color is a string
    if (typeof color !== 'string') {
      console.warn('⚠️ normalizeColorToHex received non-string value:', color, typeof color);
      return null;
    }
    
    // Handle hex colors
    if (color.startsWith('#')) {
      return color.toUpperCase();
    }
    
    // Handle rgb() colors
    if (color.startsWith('rgb(')) {
      const values = color.match(/\d+/g);
      if (values && values.length >= 3) {
        const r = parseInt(values[0]);
        const g = parseInt(values[1]);
        const b = parseInt(values[2]);
        return this.rgbToHex(r, g, b);
      }
    }
    
    // Handle rgba() colors (ignore alpha for comparison)
    if (color.startsWith('rgba(')) {
      const values = color.match(/\d+/g);
      if (values && values.length >= 3) {
        const r = parseInt(values[0]);
        const g = parseInt(values[1]);
        const b = parseInt(values[2]);
        return this.rgbToHex(r, g, b);
      }
    }
    
    return null;
  }

  /**
   * Convert color to RGB
   * @param {string} color
   */
  colorToRgb(color) {
    if (!color) return null;
    
    // Ensure color is a string
    if (typeof color !== 'string') {
      console.warn('⚠️ colorToRgb received non-string value:', color, typeof color);
      return null;
    }
    
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }
    
    // Handle rgb() colors
    if (color.startsWith('rgb(')) {
      const values = color.match(/\d+/g);
      if (values && values.length >= 3) {
        return {
          r: parseInt(values[0]),
          g: parseInt(values[1]),
          b: parseInt(values[2])
        };
      }
    }
    
    return null;
  }

  /**
   * Compare two fonts for similarity
   * @param {string} font1
   * @param {string} font2
   */
  compareFonts(font1, font2) {
    if (!font1 || !font2) return false;
    
    // Normalize font names
    const normalize = (font) => font.toLowerCase().replace(/['"]/g, '').trim();
    
    const norm1 = normalize(font1);
    const norm2 = normalize(font2);
    
    return norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1);
  }

  /**
   * Compare font weights
   * @param {string} weight1
   * @param {string} weight2
   */
  compareFontWeights(weight1, weight2) {
    if (!weight1 || !weight2) return false;
    
    // Normalize weights
    const normalize = (weight) => {
      const w = weight.toString().toLowerCase().trim();
      if (w === 'normal' || w === '400') return '400';
      if (w === 'bold' || w === '700') return '700';
      if (w === 'light' || w === '300') return '300';
      if (w === 'medium' || w === '500') return '500';
      if (w === 'semibold' || w === '600') return '600';
      return w;
    };
    
    return normalize(weight1) === normalize(weight2);
  }

  /**
   * Compare font sizes
   * @param {string} size1
   * @param {string} size2
   */
  compareFontSizes(size1, size2) {
    if (!size1 || !size2) return false;
    
    // Extract numeric values
    const getNumericSize = (size) => {
      const match = size.toString().match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : 0;
    };
    
    const num1 = getNumericSize(size1);
    const num2 = getNumericSize(size2);
    
    if (num1 === 0 || num2 === 0) return size1 === size2;
    
    // Allow 10% tolerance
    const tolerance = Math.max(num1, num2) * 0.1;
    return Math.abs(num1 - num2) <= tolerance;
  }

  /**
   * Add an issue to the analysis
   */
  /**
   * Add a compliance issue with enhanced details
   * @param {string} type
   * @param {string} severity
   * @param {string} description
   * @param {string} details
   * @param {string} recommendation
   * @param {string} expected
   * @param {string} actual
   * @param {Object} colorInfo
   */
  addIssue(type, severity, description, details, recommendation, expected, actual, colorInfo = null) {
    this.issues.push({
      type,
      severity,
      description,
      details,
      recommendation,
      expected,
      actual,
      colorInfo,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Add a recommendation to the analysis
   */
  /**
   * Add a recommendation
   * @param {string} title
   * @param {string} message
   * @param {string} priority
   * @param {string} action
   */
  addRecommendation(title, message, priority, action) {
    this.recommendations.push({
      title,
      message,
      priority,
      action,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate detailed category summary with contextual information
   */
  generateCategorySummary(category, score) {
    const categoryIssues = this.issues.filter(issue => issue.type === category);
    const totalIssues = categoryIssues.length;
    const criticalIssues = categoryIssues.filter(issue => issue.severity === 'high').length;
    const mediumIssues = categoryIssues.filter(issue => issue.severity === 'medium').length;
    const lowIssues = categoryIssues.filter(issue => issue.severity === 'low').length;

    let summary = '';
    if (score >= 0.9) {
      summary = `Excellent compliance with ${totalIssues === 0 ? 'no issues' : `${totalIssues} minor issue${totalIssues > 1 ? 's' : ''}`}`;
    } else if (score >= 0.7) {
      summary = `Good compliance with ${totalIssues} issue${totalIssues > 1 ? 's' : ''} (${criticalIssues} critical, ${mediumIssues} medium)`;
    } else if (score >= 0.4) {
      summary = `Fair compliance with ${totalIssues} issue${totalIssues > 1 ? 's' : ''} (${criticalIssues} critical, ${mediumIssues} medium, ${lowIssues} minor)`;
    } else {
      summary = `Poor compliance with ${totalIssues} issue${totalIssues > 1 ? 's' : ''} (${criticalIssues} critical, ${mediumIssues} medium, ${lowIssues} minor)`;
    }

    return {
      score,
      totalIssues,
      criticalIssues,
      mediumIssues,
      lowIssues,
      summary,
      issues: categoryIssues
    };
  }

  /**
   * Add enhanced issue with contextual information
   */
  /**
   * Add an enhanced issue with color information
   * @param {string} type
   * @param {string} severity
   * @param {string} description
   * @param {string} details
   * @param {string} recommendation
   * @param {string} expected
   * @param {string} actual
   * @param {Object} context
   */
  addEnhancedIssue(type, severity, description, details, recommendation, expected, actual, context = {}) {
    // Calculate dynamic severity based on deviation
    let calculatedSeverity = severity;
    if (expected && actual && typeof expected === 'string' && typeof actual === 'string') {
      const deviation = this.calculateDeviation(expected, actual);
      if (deviation > 0.4) calculatedSeverity = 'high';
      else if (deviation > 0.2) calculatedSeverity = 'medium';
      else calculatedSeverity = 'low';
    }

    this.issues.push({
      type,
      severity: calculatedSeverity,
      description,
      details,
      recommendation,
      expected,
      actual,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Calculate deviation between expected and actual values
   * @param {string} expected
   * @param {string} actual
   */
  calculateDeviation(expected, actual) {
    if (typeof expected === 'string' && typeof actual === 'string') {
      // For color comparison
      if (expected.startsWith('#') || actual.startsWith('#')) {
        const expectedRgb = this.normalizeColorToRgb(expected);
        const actualRgb = this.normalizeColorToRgb(actual);
        if (expectedRgb && actualRgb) {
          const distance = Math.sqrt(
            Math.pow(expectedRgb.r - actualRgb.r, 2) +
            Math.pow(expectedRgb.g - actualRgb.g, 2) +
            Math.pow(expectedRgb.b - actualRgb.b, 2)
          );
          return distance / Math.sqrt(3 * Math.pow(255, 2));
        }
      }
      // For text comparison
      return expected.toLowerCase() === actual.toLowerCase() ? 0 : 1;
    }
    return 0;
  }

  /**
   * Generate human-readable issue explanation
   */
  generateReadableIssue(issue) {
    const severityText = {
      'high': 'Critical',
      'medium': 'Important', 
      'low': 'Minor'
    };

    return `${severityText[issue.severity]} ${issue.type} issue: ${issue.description}. Expected "${issue.expected}", but found "${issue.actual}". ${issue.recommendation}`;
  }

  /**
   * Generate user-friendly recommendations
   * @param {Object} analysis
   */
  generateUserFriendlyRecommendations(analysis) {
    const recommendations = [];
    
    // Overall score recommendations
    if (analysis.overallScore < 0.5) {
      recommendations.push({
        category: 'overall',
        priority: 'high',
        title: 'Major Brand Compliance Issues',
        message: 'Your website has significant brand compliance issues that need immediate attention.',
        action: 'Review all brand guidelines and update your website accordingly.'
      });
    } else if (analysis.overallScore < 0.8) {
      recommendations.push({
        category: 'overall',
        priority: 'medium',
        title: 'Some Brand Compliance Issues',
        message: 'Your website has some brand compliance issues that should be addressed.',
        action: 'Focus on the high-priority issues first, then address medium-priority items.'
      });
    } else {
      recommendations.push({
        category: 'overall',
        priority: 'low',
        title: 'Good Brand Compliance',
        message: 'Your website follows brand guidelines well with only minor issues.',
        action: 'Address the remaining minor issues to achieve perfect brand compliance.'
      });
    }

    // Category-specific recommendations
    if (analysis.categoryScores.colors < 0.6) {
      recommendations.push({
        category: 'colors',
        priority: 'high',
        title: 'Color Usage Issues',
        message: 'Your website colors don\'t match the brand guidelines.',
        action: 'Update colors to match the approved brand palette.'
      });
    }

    if (analysis.categoryScores.typography < 0.6) {
      recommendations.push({
        category: 'typography',
        priority: 'high',
        title: 'Typography Issues',
        message: 'Your website fonts don\'t match the brand guidelines.',
        action: 'Update fonts to match the approved brand typography.'
      });
    }

    if (analysis.categoryScores.logo < 0.6) {
      recommendations.push({
        category: 'logo',
        priority: 'high',
        title: 'Logo Issues',
        message: 'Your website logo usage doesn\'t follow brand guidelines.',
        action: 'Update logo usage to match brand guidelines.'
      });
    }

    return recommendations;
  }

  /**
   * Calculate summary statistics
   * @param {Issue[]} issues
   */
  calculateSummary(issues) {
    const summary = {
      totalIssues: issues.length,
      criticalIssues: 0,
      mediumIssues: 0,
      lowIssues: 0
    };

    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          summary.criticalIssues++;
          break;
        case 'medium':
          summary.mediumIssues++;
          break;
        case 'low':
          summary.lowIssues++;
          break;
      }
    });

    return summary;
  }

  /**
   * Calculate confidence score
   * @param {ScrapedData} scrapedData
   * @param {BrandGuidelines} brandGuidelines
   */
  calculateConfidence(scrapedData, brandGuidelines) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on data completeness
    if (scrapedData.colors && scrapedData.colors.palette && scrapedData.colors.palette.length > 0) {
      confidence += 0.1;
    }
    if (scrapedData.typography && scrapedData.typography.fonts && scrapedData.typography.fonts.length > 0) {
      confidence += 0.1;
    }
    if (scrapedData.logo && scrapedData.logo.found) {
      confidence += 0.1;
    }
    
    // Increase confidence based on brand guideline completeness
    if (brandGuidelines.colors && brandGuidelines.colors.palette && brandGuidelines.colors.palette.length > 0) {
      confidence += 0.1;
    }
    if (brandGuidelines.typography && brandGuidelines.typography.fonts && brandGuidelines.typography.fonts.length > 0) {
      confidence += 0.1;
    }
    
    return Math.min(1.0, confidence);
  }

  /**
   * Analyze components individually for detailed compliance checking
   * @param {Object} components - Component data from web scraper
   * @param {Object} brandGuidelines - Brand guidelines from PDF extraction
   */
  async analyzeComponents(components, brandGuidelines) {
    console.log('🎯 Starting component-based analysis...');

    // Analyze headings (h1-h6)
    if (components.headings && components.headings.length > 0) {
      await this.analyzeHeadingComponents(components.headings, brandGuidelines);
    }

    // Analyze paragraphs
    if (components.paragraphs && components.paragraphs.length > 0) {
      await this.analyzeParagraphComponents(components.paragraphs, brandGuidelines);
    }

    // Analyze buttons
    if (components.buttons && components.buttons.length > 0) {
      await this.analyzeButtonComponents(components.buttons, brandGuidelines);
    }

    // Analyze links
    if (components.links && components.links.length > 0) {
      await this.analyzeLinkComponents(components.links, brandGuidelines);
    }

    // Analyze navigation
    if (components.navigation && components.navigation.length > 0) {
      await this.analyzeNavigationComponents(components.navigation, brandGuidelines);
    }

    // Analyze forms
    if (components.forms && components.forms.length > 0) {
      await this.analyzeFormComponents(components.forms, brandGuidelines);
    }

    // Analyze cards
    if (components.cards && components.cards.length > 0) {
      await this.analyzeCardComponents(components.cards, brandGuidelines);
    }

    // Analyze sections
    if (components.sections && components.sections.length > 0) {
      await this.analyzeSectionComponents(components.sections, brandGuidelines);
    }

    console.log('✅ Component-based analysis complete');
  }

  /**
   * Analyze heading components (h1-h6)
   */
  async analyzeHeadingComponents(headings, brandGuidelines) {
    console.log(`📝 Analyzing ${headings.length} heading components...`);

    headings.forEach((heading, index) => {
      const { tag, text, styles } = heading;
      
      // Check font family compliance
      if (brandGuidelines.typography?.primaryFont && styles.fontFamily) {
        const isFontCompliant = this.checkFontCompliance(styles.fontFamily, brandGuidelines.typography.primaryFont);
        if (!isFontCompliant) {
          this.addEnhancedIssue(
            'typography',
            'medium',
            `Heading ${tag} uses incorrect font`,
            `Expected: ${brandGuidelines.typography.primaryFont}, Found: ${styles.fontFamily}`,
            'Update the font family to match brand guidelines',
            brandGuidelines.typography.primaryFont,
            styles.fontFamily,
            { element: tag, cssProperty: 'font-family', location: `Heading ${index + 1}` }
          );
        }
      }

      // Check color compliance
      if (brandGuidelines.colors?.primary && styles.color) {
        const isColorCompliant = this.checkColorCompliance(styles.color, brandGuidelines.colors.primary);
        if (!isColorCompliant) {
          // Extract color values for display
          const brandColorValue = typeof brandGuidelines.colors.primary === 'string' 
            ? brandGuidelines.colors.primary 
            : brandGuidelines.colors.primary.hex || brandGuidelines.colors.primary.name;
          
          this.addEnhancedIssue(
            'colors',
            'high',
            `Heading ${tag} uses incorrect color`,
            `Expected: ${brandColorValue}, Found: ${styles.color}`,
            'Update the text color to match brand guidelines',
            brandColorValue,
            styles.color,
            { element: tag, cssProperty: 'color', location: `Heading ${index + 1}` }
          );
        }
      }

      // Check font size hierarchy
      if (styles.fontSize) {
        this.checkFontSizeHierarchy(tag, styles.fontSize, brandGuidelines);
      }
    });
  }

  /**
   * Analyze paragraph components
   */
  async analyzeParagraphComponents(paragraphs, brandGuidelines) {
    console.log(`📄 Analyzing ${paragraphs.length} paragraph components...`);

    paragraphs.forEach((paragraph, index) => {
      const { text, styles } = paragraph;
      
      // Check font family compliance
      if (brandGuidelines.typography?.primaryFont && styles.fontFamily) {
        const isFontCompliant = this.checkFontCompliance(styles.fontFamily, brandGuidelines.typography.primaryFont);
        if (!isFontCompliant) {
          this.addEnhancedIssue(
            'typography',
            'medium',
            `Paragraph uses incorrect font`,
            `Expected: ${brandGuidelines.typography.primaryFont}, Found: ${styles.fontFamily}`,
            'Update the font family to match brand guidelines',
            brandGuidelines.typography.primaryFont,
            styles.fontFamily,
            { element: 'p', cssProperty: 'font-family', location: `Paragraph ${index + 1}` }
          );
        }
      }

      // Check line height compliance
      if (brandGuidelines.spacing?.lineHeight && styles.lineHeight) {
        const isLineHeightCompliant = this.checkSpacingCompliance(styles.lineHeight, brandGuidelines.spacing.lineHeight);
        if (!isLineHeightCompliant) {
          this.addEnhancedIssue(
            'spacing',
            'low',
            `Paragraph has incorrect line height`,
            `Expected: ${brandGuidelines.spacing.lineHeight}, Found: ${styles.lineHeight}`,
            'Update the line height to match brand guidelines',
            brandGuidelines.spacing.lineHeight,
            styles.lineHeight,
            { element: 'p', cssProperty: 'line-height', location: `Paragraph ${index + 1}` }
          );
        }
      }
    });
  }

  /**
   * Analyze button components
   */
  async analyzeButtonComponents(buttons, brandGuidelines) {
    console.log(`🔘 Analyzing ${buttons.length} button components...`);

    buttons.forEach((button, index) => {
      const { text, styles } = button;
      
      // Check button color compliance (should use primary color)
      if (brandGuidelines.colors?.primary && styles.backgroundColor) {
        const isColorCompliant = this.checkColorCompliance(styles.backgroundColor, brandGuidelines.colors.primary);
        if (!isColorCompliant) {
          // Extract color values for display
          const brandColorValue = typeof brandGuidelines.colors.primary === 'string' 
            ? brandGuidelines.colors.primary 
            : brandGuidelines.colors.primary.hex || brandGuidelines.colors.primary.name;
          
          this.addEnhancedIssue(
            'colors',
            'high',
            `Button uses incorrect background color`,
            `Expected: ${brandColorValue}, Found: ${styles.backgroundColor}`,
            'Update button background color to match brand primary color',
            brandColorValue,
            styles.backgroundColor,
            { element: 'button', cssProperty: 'background-color', location: `Button "${text}"` }
          );
        }
      }

      // Check button text color compliance
      if (brandGuidelines.colors?.secondary && styles.color) {
        const isTextColorCompliant = this.checkColorCompliance(styles.color, brandGuidelines.colors.secondary[0]);
        if (!isTextColorCompliant) {
          this.addEnhancedIssue(
            'colors',
            'medium',
            `Button uses incorrect text color`,
            `Expected: ${brandGuidelines.colors.secondary[0]}, Found: ${styles.color}`,
            'Update button text color to match brand guidelines',
            brandGuidelines.colors.secondary[0],
            styles.color,
            { element: 'button', cssProperty: 'color', location: `Button "${text}"` }
          );
        }
      }

      // Check button font compliance
      if (brandGuidelines.typography?.primaryFont && styles.fontFamily) {
        const isFontCompliant = this.checkFontCompliance(styles.fontFamily, brandGuidelines.typography.primaryFont);
        if (!isFontCompliant) {
          this.addEnhancedIssue(
            'typography',
            'medium',
            `Button uses incorrect font`,
            `Expected: ${brandGuidelines.typography.primaryFont}, Found: ${styles.fontFamily}`,
            'Update button font to match brand guidelines',
            brandGuidelines.typography.primaryFont,
            styles.fontFamily,
            { element: 'button', cssProperty: 'font-family', location: `Button "${text}"` }
          );
        }
      }
    });
  }

  /**
   * Analyze link components
   */
  async analyzeLinkComponents(links, brandGuidelines) {
    console.log(`🔗 Analyzing ${links.length} link components...`);

    links.forEach((link, index) => {
      const { text, styles } = link;
      
      // Check link color compliance
      if (brandGuidelines.colors?.primary && styles.color) {
        const isColorCompliant = this.checkColorCompliance(styles.color, brandGuidelines.colors.primary);
        if (!isColorCompliant) {
          // Extract color values for display
          const brandColorValue = typeof brandGuidelines.colors.primary === 'string' 
            ? brandGuidelines.colors.primary 
            : brandGuidelines.colors.primary.hex || brandGuidelines.colors.primary.name;
          
          this.addEnhancedIssue(
            'colors',
            'medium',
            `Link uses incorrect color`,
            `Expected: ${brandColorValue}, Found: ${styles.color}`,
            'Update link color to match brand guidelines',
            brandColorValue,
            styles.color,
            { element: 'a', cssProperty: 'color', location: `Link "${text}"` }
          );
        }
      }
    });
  }

  /**
   * Analyze navigation components
   */
  async analyzeNavigationComponents(navigation, brandGuidelines) {
    console.log(`🧭 Analyzing ${navigation.length} navigation components...`);

    navigation.forEach((nav, index) => {
      const { styles } = nav;
      
      // Check navigation background color
      if (brandGuidelines.colors?.secondary && styles.backgroundColor) {
        const isColorCompliant = this.checkColorCompliance(styles.backgroundColor, brandGuidelines.colors.secondary[0]);
        if (!isColorCompliant) {
          this.addEnhancedIssue(
            'colors',
            'medium',
            `Navigation uses incorrect background color`,
            `Expected: ${brandGuidelines.colors.secondary[0]}, Found: ${styles.backgroundColor}`,
            'Update navigation background color to match brand guidelines',
            brandGuidelines.colors.secondary[0],
            styles.backgroundColor,
            { element: 'nav', cssProperty: 'background-color', location: `Navigation ${index + 1}` }
          );
        }
      }
    });
  }

  /**
   * Analyze form components
   */
  async analyzeFormComponents(forms, brandGuidelines) {
    console.log(`📝 Analyzing ${forms.length} form components...`);

    forms.forEach((form, index) => {
      const { styles } = form;
      
      // Check form styling compliance
      if (brandGuidelines.colors?.secondary && styles.backgroundColor) {
        const isColorCompliant = this.checkColorCompliance(styles.backgroundColor, brandGuidelines.colors.secondary[0]);
        if (!isColorCompliant) {
          this.addEnhancedIssue(
            'colors',
            'low',
            `Form uses incorrect background color`,
            `Expected: ${brandGuidelines.colors.secondary[0]}, Found: ${styles.backgroundColor}`,
            'Update form background color to match brand guidelines',
            brandGuidelines.colors.secondary[0],
            styles.backgroundColor,
            { element: 'form', cssProperty: 'background-color', location: `Form ${index + 1}` }
          );
        }
      }
    });
  }

  /**
   * Analyze card components
   */
  async analyzeCardComponents(cards, brandGuidelines) {
    console.log(`🃏 Analyzing ${cards.length} card components...`);

    cards.forEach((card, index) => {
      const { styles } = card;
      
      // Check card background color
      if (brandGuidelines.colors?.secondary && styles.backgroundColor) {
        const isColorCompliant = this.checkColorCompliance(styles.backgroundColor, brandGuidelines.colors.secondary[0]);
        if (!isColorCompliant) {
          this.addEnhancedIssue(
            'colors',
            'low',
            `Card uses incorrect background color`,
            `Expected: ${brandGuidelines.colors.secondary[0]}, Found: ${styles.backgroundColor}`,
            'Update card background color to match brand guidelines',
            brandGuidelines.colors.secondary[0],
            styles.backgroundColor,
            { element: 'card', cssProperty: 'background-color', location: `Card ${index + 1}` }
          );
        }
      }
    });
  }

  /**
   * Analyze section components
   */
  async analyzeSectionComponents(sections, brandGuidelines) {
    console.log(`📑 Analyzing ${sections.length} section components...`);

    sections.forEach((section, index) => {
      const { type, styles } = section;
      
      // Check section background color
      if (brandGuidelines.colors?.secondary && styles.backgroundColor) {
        const isColorCompliant = this.checkColorCompliance(styles.backgroundColor, brandGuidelines.colors.secondary[0]);
        if (!isColorCompliant) {
          this.addEnhancedIssue(
            'colors',
            'low',
            `${type} section uses incorrect background color`,
            `Expected: ${brandGuidelines.colors.secondary[0]}, Found: ${styles.backgroundColor}`,
            `Update ${type} background color to match brand guidelines`,
            brandGuidelines.colors.secondary[0],
            styles.backgroundColor,
            { element: type, cssProperty: 'background-color', location: `${type} ${index + 1}` }
          );
        }
      }
    });
  }

  /**
   * Check font compliance between scraped and brand guidelines
   */
  checkFontCompliance(scrapedFont, brandFont) {
    if (!scrapedFont || !brandFont) return true;
    
    // Normalize font names for comparison
    const normalizeFont = (font) => font.toLowerCase().replace(/['"]/g, '').trim();
    const normalizedScraped = normalizeFont(scrapedFont);
    const normalizedBrand = normalizeFont(brandFont);
    
    // Check if scraped font contains brand font or vice versa
    return normalizedScraped.includes(normalizedBrand) || normalizedBrand.includes(normalizedScraped);
  }

  /**
   * Check color compliance between scraped and brand guidelines
   */
  checkColorCompliance(scrapedColor, brandColor) {
    if (!scrapedColor || !brandColor) return true;
    
    // Extract color value from objects if needed
    const extractColorValue = (color) => {
      if (typeof color === 'string') return color;
      if (typeof color === 'object' && color !== null) {
        return color.hex || color.color || color.value || null;
      }
      return null;
    };
    
    const scrapedColorValue = extractColorValue(scrapedColor);
    const brandColorValue = extractColorValue(brandColor);
    
    if (!scrapedColorValue || !brandColorValue) return true;
    
    // Normalize colors to hex format for comparison
    const normalizedScraped = this.normalizeColorToHex(scrapedColorValue);
    const normalizedBrand = this.normalizeColorToHex(brandColorValue);
    
    return normalizedScraped === normalizedBrand;
  }

  /**
   * Check spacing compliance
   */
  checkSpacingCompliance(scrapedSpacing, brandSpacing) {
    if (!scrapedSpacing || !brandSpacing) return true;
    
    // Extract numeric values for comparison
    const scrapedValue = parseFloat(scrapedSpacing);
    const brandValue = parseFloat(brandSpacing);
    
    if (isNaN(scrapedValue) || isNaN(brandValue)) return true;
    
    // Allow 10% tolerance
    const tolerance = 0.1;
    const difference = Math.abs(scrapedValue - brandValue) / brandValue;
    
    return difference <= tolerance;
  }

  /**
   * Check font size hierarchy
   */
  checkFontSizeHierarchy(tag, fontSize, brandGuidelines) {
    // Define more reasonable expected font size hierarchy with ranges
    const expectedSizeRanges = {
      'h1': { min: '1.5rem', max: '3rem', ideal: '2.5rem' },
      'h2': { min: '1.25rem', max: '2.5rem', ideal: '2rem' },
      'h3': { min: '1.125rem', max: '2rem', ideal: '1.75rem' },
      'h4': { min: '1rem', max: '1.75rem', ideal: '1.5rem' },
      'h5': { min: '0.875rem', max: '1.5rem', ideal: '1.25rem' },
      'h6': { min: '0.75rem', max: '1.25rem', ideal: '1rem' }
    };

    const sizeRange = expectedSizeRanges[tag];
    if (sizeRange && fontSize) {
      // Get page root font size for unit conversion
      const pageRootFontSize = getPageRootFontSize();
      
      // Convert sizes to pixels for comparison
      const minPx = parseSizeToPx(sizeRange.min, pageRootFontSize);
      const maxPx = parseSizeToPx(sizeRange.max, pageRootFontSize);
      const idealPx = parseSizeToPx(sizeRange.ideal, pageRootFontSize);
      const foundPx = parseSizeToPx(fontSize, pageRootFontSize);
      
      if (minPx && maxPx && foundPx) {
        // Check if font size is within acceptable range
        const isWithinRange = foundPx >= minPx && foundPx <= maxPx;
        
        if (!isWithinRange) {
          // Calculate how far off the size is
          const distanceFromMin = Math.abs(foundPx - minPx);
          const distanceFromMax = Math.abs(foundPx - maxPx);
          const distanceFromIdeal = Math.abs(foundPx - idealPx);
          
          // Determine severity based on how far off it is
          const severity = distanceFromIdeal > (idealPx * 0.5) ? 'high' : 'medium';
          
          this.addEnhancedIssue(
            'typography',
            severity,
            `${tag} font size is outside recommended range`,
            `Expected: ${sizeRange.min} - ${sizeRange.max} (ideal: ${sizeRange.ideal}), Found: ${fontSize}`,
            `Adjust ${tag} font size to be within ${sizeRange.min} - ${sizeRange.max} range`,
            `${sizeRange.ideal} (ideal)`,
            fontSize,
            {
              element: tag,
              cssProperty: 'font-size',
              location: 'CSS font-size declarations'
            }
          );
        }
      } else {
        // Fallback to original comparison if conversion fails
        const isSizeCompliant = this.checkSpacingCompliance(fontSize, expectedSize);
        if (!isSizeCompliant) {
          this.addEnhancedIssue(
            'typography',
            'medium',
            `${tag} has incorrect font size`,
            `Expected: ${expectedSize}, Found: ${fontSize}`,
            `Update ${tag} font size to maintain proper hierarchy`,
            expectedSize,
            fontSize,
            { element: tag, cssProperty: 'font-size', location: `${tag} element` }
          );
        }
      }
    }
  }
}

// Export singleton instance
export const enhancedComplianceAnalyzer = new EnhancedComplianceAnalyzer();
