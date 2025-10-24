// @ts-nocheck
/**
 * Context-Aware Font Extractor with Hierarchy Detection
 * Handles font recognition with proper context and usage
 */
export class ContextAwareFontExtractor {
  constructor() {
    this.fontWhitelist = this.loadComprehensiveFontList();
    this.fontContexts = {
      'heading': ['heading', 'headline', 'title', 'h1', 'h2', 'h3'],
      'body': ['body', 'paragraph', 'text', 'content', 'copy'],
      'ui': ['button', 'label', 'interface', 'ui', 'ux'],
      'code': ['code', 'monospace', 'terminal']
    };
  }

  /**
   * Load comprehensive font list including common alternatives
   */
  loadComprehensiveFontList() {
    const fonts = new Set([
      // Google Fonts
      'poppins', 'roboto', 'open sans', 'lato', 'montserrat', 'raleway',
      'inter', 'source sans pro', 'nunito', 'oswald', 'roboto condensed',
      'ubuntu', 'merriweather', 'playfair display', 'pt sans', 'noto sans',
      
      // System fonts
      'helvetica', 'arial', 'tahoma', 'verdana', 'georgia', 'times new roman',
      'courier new', 'impact', 'trebuchet ms', 'comic sans ms',
      
      // Brand fonts
      'circular', 'sf pro', 'sf pro display', 'segoe ui', 'myriad pro',
      'futura', 'gill sans', 'din', 'avenir', 'proxima nova'
    ]);
    
    // Add common variations
    const variations = [];
    for (const font of fonts) {
      variations.push(
        font.toLowerCase(),
        font.toUpperCase(),
        font.charAt(0).toUpperCase() + font.slice(1),
        font.replace(/\s+/g, ''),
        font.replace(/-/g, ' ')
      );
    }
    
    variations.forEach(variation => fonts.add(variation));
    return fonts;
  }

  /**
   * Extract fonts with proper hierarchy and usage context
   */
  extractFontsWithHierarchy(text) {
    console.log('📝 Extracting fonts with hierarchy...');
    
    const fontData = {
      'primary': null,
      'secondary': null,
      'heading': null,
      'body': null,
      'fonts_found': [],
      'hierarchy': {},
      'usage_rules': []
    };
    
    // Extract all font mentions with context
    const fontMentions = this.findFontMentions(text);
    console.log(`Found ${fontMentions.length} font mentions`);
    
    // Categorize fonts by usage
    const categorizedFonts = this.categorizeFontsByUsage(fontMentions, text);
    
    // Determine primary and secondary fonts
    const fontHierarchy = this.determineFontHierarchy(categorizedFonts);
    
    // Extract font usage rules
    const usageRules = this.extractFontUsageRules(text);
    
    return {
      ...fontHierarchy,
      'fonts_found': fontMentions,
      'usage_rules': usageRules
    };
  }

  /**
   * Find all font mentions with context
   */
  findFontMentions(text) {
    const fontPatterns = [
      // Direct font declarations
      /font[\s:-]*["']?([A-Za-z\s\-]+(?:[\s]+(?:bold|regular|light|medium))?)["']?/gi,
      /typeface[\s:-]*["']?([A-Za-z\s\-]+)["']?/gi,
      /typography[\s:-]*["']?([A-Za-z\s\-,]+)["']?/gi,
      
      // Contextual font usage
      /(?:heading|headline)[^.]*font[^:]*:([^.\n]+)/gi,
      /(?:body|text|paragraph)[^.]*font[^:]*:([^.\n]+)/gi,
      /font family[\s:]*["']?([^;"']+)["']?/gi,
      
      // Font with size specifications
      /([A-Za-z\s\-]+)[\s]+(?:\d+pt|\d+px)/gi,
      
      // Common font patterns
      /(?:use|using|font)[\s:]*([A-Za-z\s\-]+)(?:\s+for|\s+in|\s+on)/gi
    ];
    
    const mentions = [];
    
    for (const pattern of fontPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const fontText = match[1].trim();
        const contextWindow = this.getContextWindow(text, match.index, 200);
        
        // Extract clean font names
        const cleanFonts = this.extractCleanFontNames(fontText);
        
        for (const fontName of cleanFonts) {
          if (this.isValidFont(fontName)) {
            mentions.push({
              'font': fontName,
              'context': contextWindow,
              'position': match.index,
              'confidence': this.calculateFontConfidence(fontName, contextWindow)
            });
          }
        }
      }
    }
    
    return mentions;
  }

  /**
   * Extract clean font names from text
   */
  extractCleanFontNames(fontText) {
    // Remove weight specifications but keep for reference
    let cleanText = fontText.replace(/\s+(?:bold|regular|light|medium|black|italic)$/i, '');
    
    // Split by commas and clean
    const fonts = [];
    for (const part of cleanText.split(',')) {
      let fontName = part.trim();
      
      // Remove quotes and extra spaces
      fontName = fontName.replace(/["']/g, '');
      fontName = fontName.trim();
      
      if (fontName && fontName.length > 1) {
        fonts.push(fontName);
      }
    }
    
    return fonts;
  }

  /**
   * Check if font name is valid using multiple strategies
   */
  isValidFont(fontName) {
    const fontLower = fontName.toLowerCase();
    
    // Check against whitelist
    if (Array.from(this.fontWhitelist).some(font => 
      fontLower.includes(font) || font.includes(fontLower)
    )) {
      return true;
    }
    
    // Check for common font patterns
    const fontPatterns = [
      /^[A-Za-z\s\-]+$/,  // Only letters, spaces, hyphens
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/  // Proper capitalization
    ];
    
    return fontPatterns.some(pattern => pattern.test(fontName));
  }

  /**
   * Calculate font confidence based on context
   */
  calculateFontConfidence(fontName, context) {
    let confidence = 0.5;
    
    // Higher confidence for whitelisted fonts
    if (this.fontWhitelist.has(fontName.toLowerCase())) {
      confidence += 0.3;
    }
    
    // Higher confidence for specific contexts
    const contextLower = context.toLowerCase();
    if (contextLower.includes('font family') || contextLower.includes('typeface')) {
      confidence += 0.2;
    }
    
    if (contextLower.includes('primary') || contextLower.includes('main')) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Categorize fonts by their usage context
   */
  categorizeFontsByUsage(fontMentions, text) {
    const categorized = {};
    
    // Initialize categories
    for (const category of Object.keys(this.fontContexts)) {
      categorized[category] = [];
    }
    
    for (const mention of fontMentions) {
      const fontName = mention.font;
      const context = mention.context.toLowerCase();
      
      for (const [category, keywords] of Object.entries(this.fontContexts)) {
        if (keywords.some(keyword => context.includes(keyword))) {
          categorized[category].push(mention);
          break;
        }
      }
    }
    
    return categorized;
  }

  /**
   * Determine primary and secondary fonts based on usage patterns
   */
  determineFontHierarchy(categorizedFonts) {
    const hierarchy = {
      'primary': null,
      'secondary': null,
      'heading': null,
      'body': null
    };
    
    // Prioritize heading fonts for primary
    if (categorizedFonts.heading && categorizedFonts.heading.length > 0) {
      hierarchy.primary = categorizedFonts.heading[0].font;
      hierarchy.heading = categorizedFonts.heading[0].font;
    }
    
    // Use body fonts for secondary
    if (categorizedFonts.body && categorizedFonts.body.length > 0) {
      hierarchy.secondary = categorizedFonts.body[0].font;
      hierarchy.body = categorizedFonts.body[0].font;
    }
    
    // Fallback logic
    const allFonts = [];
    for (const categoryFonts of Object.values(categorizedFonts)) {
      allFonts.push(...categoryFonts.map(f => f.font));
    }
    
    // Remove duplicates while preserving order
    const uniqueFonts = [];
    const seen = new Set();
    for (const font of allFonts) {
      if (!seen.has(font)) {
        uniqueFonts.push(font);
        seen.add(font);
      }
    }
    
    if (!hierarchy.primary && uniqueFonts.length > 0) {
      hierarchy.primary = uniqueFonts[0];
    }
    
    if (!hierarchy.secondary && uniqueFonts.length > 1) {
      hierarchy.secondary = uniqueFonts[1];
    }
    
    return hierarchy;
  }

  /**
   * Extract font usage rules and constraints
   */
  extractFontUsageRules(text) {
    const rules = [];
    
    const rulePatterns = [
      /(?:do not|don't|never|avoid)[^.]*font[^.]*\./gi,
      /(?:always|must|should)[^.]*font[^.]*\./gi,
      /font.*pair/gi,
      /typography.*rule/gi,
      /font.*hierarchy/gi,
      /line.*height/gi,
      /letter.*spacing/gi
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
   * Get context window around a position
   */
  getContextWindow(text, position, windowSize = 200) {
    const start = Math.max(0, position - windowSize);
    const end = Math.min(text.length, position + windowSize);
    return text.substring(start, end);
  }
}
