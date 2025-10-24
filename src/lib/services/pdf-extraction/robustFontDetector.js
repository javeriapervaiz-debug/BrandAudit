// @ts-nocheck
/**
 * Robust Font Detection System
 * Handles multiple font patterns and contexts for comprehensive extraction
 */

export class RobustFontDetector {
  constructor() {
    this.fontWhitelist = this.loadComprehensiveFontList();
    this.fontPatterns = this.buildFontPatterns();
    this.sectionKeywords = this.buildSectionKeywords();
  }

  loadComprehensiveFontList() {
    return new Set([
      // Google Fonts
      'poppins', 'roboto', 'helvetica', 'arial', 'inter', 'montserrat', 
      'open sans', 'lato', 'raleway', 'source sans pro', 'nunito',
      'oswald', 'roboto condensed', 'ubuntu', 'merriweather',
      'playfair display', 'pt sans', 'noto sans', 'fira sans',
      
      // System & Classic Fonts
      'helvetica neue', 'times new roman', 'verdana', 'georgia',
      'tahoma', 'courier new', 'impact', 'trebuchet ms', 'comic sans ms',
      
      // Brand Fonts
      'omnes', 'neighbor', 'greatest richmond', 'chirp', 'circular',
      'sf pro', 'sf pro display', 'segoe ui', 'myriad pro', 'futura',
      'gill sans', 'din', 'avenir', 'proxima nova'
    ]);
  }

  buildFontPatterns() {
    return [
      // Direct font declarations with weights (more precise)
      {
        pattern: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:bold|regular|light|medium|black|italic|hairline|thin|extralight|semibold|extrabold)\b/gi,
        extractor: (match) => this.extractFontAndWeight(match[1], match[0])
      },
      
      // Font family declarations (more specific)
      {
        pattern: /font[\s:]*["']?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)["']?(?:\s*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)*/gi,
        extractor: (match) => this.extractFontAndWeight(match[1])
      },
      
      // Typography section patterns (more precise)
      {
        pattern: /(?:typeface|typography|font family)[\s:]*["']?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)["']?/gi,
        extractor: (match) => this.extractFontAndWeight(match[1])
      },
      
      // Headline/Body copy specifications (X/Twitter specific)
      {
        pattern: /(HEADLINES|BODY COPY|DATA NUMBERS|SUB-HEADLINES)[\s|]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*[\d\s\-PT]+/gi,
        extractor: (match) => this.extractFontFromUsage(match[1], match[2])
      },
      
      // Primary/Secondary typeface declarations (Switcher specific)
      {
        pattern: /(?:primary typeface|secondary typefaces?)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
        extractor: (match) => this.extractFontWithRole(match[1], match[0])
      },
      
      // Font names in typography sections only
      {
        pattern: /(?:typography|typeface|font)[\s\S]*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s*,\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*))*/gi,
        extractor: (match) => this.extractMultipleFonts(match[1])
      },
      
      // Standalone font names (capitalized words) - but only in typography context
      {
        pattern: /(?:typography|typeface|font)[\s\S]*?\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b(?=\s*(?:bold|regular|light|medium|black|italic|weight|font|typeface))/gi,
        extractor: (match) => this.extractFontAndWeight(match[1])
      }
    ];
  }

  buildSectionKeywords() {
    return {
      typography: ['typography', 'typeface', 'font', 'fonts', 'type', 'text'],
      headings: ['headline', 'heading', 'title', 'h1', 'h2', 'h3'],
      body: ['body', 'paragraph', 'copy', 'content', 'text'],
      primary: ['primary', 'main', 'brand'],
      secondary: ['secondary', 'supporting', 'alternate']
    };
  }

  detectFonts(text) {
    console.log('🔤 Starting robust font detection...');
    
    const fontCandidates = new Map();
    
    // Step 1: Focus on typography sections first
    const typographySections = this.findTypographySections(text);
    console.log('🔤 Found typography sections:', typographySections.length);
    
    for (const section of typographySections) {
      const sectionFonts = this.extractFontsFromSection(section.content);
      for (const font of sectionFonts) {
        this.addFontCandidates([font], fontCandidates, text, 0);
      }
    }
    
    // Step 2: Extract using all patterns (but with better filtering)
    for (const {pattern, extractor} of this.fontPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const fonts = extractor(match);
        // Filter out color-related terms and apply strict validation
        const filteredFonts = fonts.filter(font => 
          !this.isColorRelated(font.font) && 
          !this.isGenericTerm(font.font.toLowerCase()) &&
          this.isValidFont(font.font)
        );
        this.addFontCandidates(filteredFonts, fontCandidates, text, match.index);
      }
    }
    
    // Step 2.5: Fallback - look for known font names in the text
    if (fontCandidates.size === 0) {
      console.log('🔤 No fonts found in sections, trying fallback detection...');
      const fallbackFonts = this.extractKnownFonts(text);
      this.mergeFontCandidates(fallbackFonts, fontCandidates);
    }
    
    // Step 3: Categorize fonts by usage
    const categorized = this.categorizeFonts([...fontCandidates.values()], text);
    
    console.log('🔤 Font detection results:', categorized);
    return categorized;
  }

  isColorRelated(fontName) {
    const colorTerms = [
      'rgb', 'hex', 'cmyk', 'pantone', 'hsl', 'hsb', 'color', 'palette',
      'primary', 'secondary', 'accent', 'neutral', 'black', 'white',
      'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink',
      'brand', 'guidelines', 'document', 'version', 'quick', 'guide'
    ];
    
    const lowerFont = fontName.toLowerCase();
    return colorTerms.some(term => lowerFont.includes(term));
  }

  extractFontAndWeight(fontText, fullMatch = '') {
    const fonts = [];
    
    // Clean the font text
    let cleanFont = fontText.replace(/["']/g, '').trim();
    
    // Extract weights from the text
    const weights = this.extractWeights(fullMatch || cleanFont);
    
    // Handle multiple fonts separated by commas
    const fontParts = cleanFont.split(',').map(f => f.trim());
    
    for (let fontPart of fontParts) {
      // Remove weight specifications to get clean font name
      const fontName = this.cleanFontName(fontPart);
      
      if (this.isValidFont(fontName)) {
        fonts.push({
          font: fontName,
          weights: weights.length > 0 ? weights : ['Regular'],
          rawText: fontPart,
          confidence: this.calculateFontConfidence(fontName, fontPart)
        });
      }
    }
    
    return fonts;
  }

  extractMultipleFonts(fontsText) {
    const fonts = [];
    const fontList = fontsText.split(',').map(f => f.trim());
    
    for (const fontItem of fontList) {
      const cleanFont = this.cleanFontName(fontItem);
      if (this.isValidFont(cleanFont)) {
        fonts.push({
          font: cleanFont,
          weights: ['Regular', 'Bold'], // Default weights
          rawText: fontItem,
          confidence: 0.8
        });
      }
    }
    
    return fonts;
  }

  extractFontFromUsage(usageType, fontText) {
    const cleanFont = this.cleanFontName(fontText);
    
    if (!this.isValidFont(cleanFont)) {
      return [];
    }
    
    const usage = this.determineFontUsage(usageType);
    const weights = this.determineWeightsFromUsage(usageType);
    
    return [{
      font: cleanFont,
      weights: weights,
      usage: usage,
      rawText: fontText,
      confidence: 0.9
    }];
  }

  extractFontWithRole(fontText, role) {
    const cleanFont = this.cleanFontName(fontText);
    
    if (!this.isValidFont(cleanFont)) {
      return [];
    }
    
    const isPrimary = role.toLowerCase().includes('primary');
    
    return [{
      font: cleanFont,
      weights: isPrimary ? ['Regular', 'Medium', 'Semibold'] : ['Regular', 'Light'],
      usage: isPrimary ? 'Primary brand typography' : 'Secondary/Supporting typography',
      rawText: fontText,
      confidence: 0.85
    }];
  }

  extractFontFromSample(sampleText) {
    const cleanFont = this.cleanFontName(sampleText);
    
    if (!this.isValidFont(cleanFont)) {
      return [];
    }
    
    return [{
      font: cleanFont,
      weights: ['Regular'], // Default for samples
      rawText: sampleText,
      confidence: 0.7
    }];
  }

  cleanFontName(fontName) {
    return fontName
      .replace(/\s+(?:bold|regular|light|medium|black|italic|hairline|thin|extralight|semibold|extrabold)$/gi, '')
      .replace(/["']/g, '')
      .trim();
  }

  extractWeights(text) {
    const weights = [];
    const weightPatterns = [
      { pattern: /\bbold\b/gi, weight: 'Bold' },
      { pattern: /\bregular\b/gi, weight: 'Regular' },
      { pattern: /\blight\b/gi, weight: 'Light' },
      { pattern: /\bmedium\b/gi, weight: 'Medium' },
      { pattern: /\bblack\b/gi, weight: 'Black' },
      { pattern: /\bitalic\b/gi, weight: 'Italic' },
      { pattern: /\bhairline\b/gi, weight: 'Hairline' },
      { pattern: /\bthin\b/gi, weight: 'Thin' },
      { pattern: /\bextralight\b/gi, weight: 'ExtraLight' },
      { pattern: /\bsemibold\b/gi, weight: 'SemiBold' },
      { pattern: /\bextrabold\b/gi, weight: 'ExtraBold' }
    ];
    
    for (const {pattern, weight} of weightPatterns) {
      if (pattern.test(text)) {
        weights.push(weight);
      }
    }
    
    return weights.length > 0 ? weights : ['Regular'];
  }

  isValidFont(fontName) {
    if (!fontName || fontName.length < 2) return false;
    
    // Clean the font name first
    const cleanFont = fontName.trim();
    if (cleanFont.length < 2) return false;
    
    const lowerFont = cleanFont.toLowerCase();
    
    // Check against whitelist
    if (this.fontWhitelist.has(lowerFont)) {
      return true;
    }
    
    // Check for common font patterns
    const validPatterns = [
      /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/, // Proper capitalization
      /^[A-Za-z\s\-]+$/, // Only letters, spaces, hyphens
    ];
    
    const isValidPattern = validPatterns.some(pattern => pattern.test(cleanFont));
    const isNotGeneric = !this.isGenericTerm(lowerFont);
    const isNotTooLong = cleanFont.length <= 50; // Reasonable font name length
    const hasNoNewlines = !cleanFont.includes('\n'); // No multiline text
    
    return isValidPattern && isNotGeneric && isNotTooLong && hasNoNewlines;
  }

  isGenericTerm(fontName) {
    const genericTerms = [
      'sans', 'serif', 'sans-serif', 'monospace', 'system', 'cursive', 'fantasy',
      // Color format terms
      'rgb', 'hex', 'cmyk', 'pantone', 'hsl', 'hsb',
      // Document terms
      'brand', 'guidelines', 'document', 'version', 'quick', 'guide',
      // Common non-font words
      'color', 'palette', 'primary', 'secondary', 'accent', 'neutral',
      'typography', 'typeface', 'font', 'fonts', 'text', 'heading',
      'body', 'copy', 'content', 'title', 'subtitle', 'caption',
      'logo', 'icon', 'pattern', 'spacing', 'margin', 'padding',
      'size', 'weight', 'style', 'family', 'bold', 'italic', 'regular',
      'light', 'medium', 'black', 'thin', 'hairline', 'extrabold',
      'normal', 'oblique', 'condensed', 'expanded', 'small', 'large'
    ];
    return genericTerms.includes(fontName.toLowerCase());
  }

  determineFontUsage(usageType) {
    const type = usageType.toLowerCase();
    
    if (type.includes('headline') || type.includes('heading') || type.includes('title')) {
      return 'Headings';
    } else if (type.includes('body') || type.includes('paragraph') || type.includes('copy')) {
      return 'Body text';
    } else if (type.includes('data') || type.includes('number')) {
      return 'Data/numbers';
    } else if (type.includes('sub')) {
      return 'Sub-headings';
    } else if (type.includes('content')) {
      return 'Content headings';
    } else if (type.includes('source')) {
      return 'Source text';
    }
    
    return 'General usage';
  }

  determineWeightsFromUsage(usageType) {
    const type = usageType.toLowerCase();
    
    if (type.includes('bold') || type.includes('headline') || type.includes('title')) {
      return ['Bold'];
    } else if (type.includes('normal') || type.includes('regular') || type.includes('body')) {
      return ['Regular', 'Light'];
    } else if (type.includes('light')) {
      return ['Light'];
    } else if (type.includes('medium')) {
      return ['Medium'];
    }
    
    return ['Regular', 'Bold'];
  }

  addFontCandidates(fonts, fontCandidates, text, position) {
    for (const font of fonts) {
      const key = font.font.toLowerCase();
      
      if (!fontCandidates.has(key)) {
        fontCandidates.set(key, {
          ...font,
          occurrences: 1,
          positions: [position],
          contexts: [this.getContext(text, position, 100)]
        });
      } else {
        const existing = fontCandidates.get(key);
        existing.occurrences++;
        existing.positions.push(position);
        existing.contexts.push(this.getContext(text, position, 100));
        existing.confidence = Math.max(existing.confidence, font.confidence);
        
        // Merge weights
        existing.weights = [...new Set([...existing.weights, ...font.weights])];
      }
    }
  }

  extractFontsFromSections(text) {
    const sections = this.findTypographySections(text);
    const fonts = [];
    
    for (const section of sections) {
      const sectionFonts = this.extractFontsFromSection(section.content);
      for (const font of sectionFonts) {
        fonts.push({
          ...font,
          confidence: font.confidence * 1.2, // Boost confidence for section fonts
          usage: section.type === 'primary' ? 'Primary brand typography' : 
                 section.type === 'secondary' ? 'Secondary typography' : font.usage
        });
      }
    }
    
    return fonts;
  }

  findTypographySections(text) {
    const sections = [];
    const lines = text.split('\n');
    
    let currentSection = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      // Check for typography section headers
      if (this.isTypographySectionHeader(line)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          type: this.determineSectionType(line),
          content: lines[i],
          startIndex: i
        };
      } else if (currentSection && i - currentSection.startIndex < 10) {
        // Add context to current section
        currentSection.content += '\n' + lines[i];
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  isTypographySectionHeader(line) {
    const typographyKeywords = [
      'typography', 'typeface', 'font', 'primary typeface', 'secondary typeface',
      'headlines', 'body copy', 'data numbers', 'sub-headlines', 'font family'
    ];
    return typographyKeywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()));
  }

  determineSectionType(line) {
    if (line.includes('primary')) return 'primary';
    if (line.includes('secondary')) return 'secondary';
    return 'general';
  }

  extractFontsFromSection(sectionText) {
    const fonts = [];
    
    // Look for font names in section with very specific patterns
    const patterns = [
      // Font names followed by weight specifications (most reliable)
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:bold|regular|light|medium|black|italic|weight)/gi,
      // Font names in quotes (very reliable)
      /["']([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)["']/gi,
      // Font names after colons (reliable)
      /:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      // Font names in lists (comma-separated)
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)*/gi
    ];
    
    for (const pattern of patterns) {
      const matches = sectionText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const fontName = match.replace(/["']/g, '').trim();
          
          // Additional validation for section fonts
          if (this.isValidFont(fontName) && 
              !this.isColorRelated(fontName) && 
              !this.isGenericTerm(fontName.toLowerCase()) &&
              fontName.length <= 30 && // Reasonable font name length
              !fontName.includes(' ') || fontName.split(' ').length <= 3) { // Max 3 words
            
            fonts.push({
              font: fontName,
              weights: ['Regular', 'Bold'], // Default for section fonts
              rawText: match,
              confidence: 0.9 // Higher confidence for section fonts
            });
          }
        }
      }
    }
    
    return fonts;
  }

  mergeFontCandidates(newFonts, fontCandidates) {
    for (const font of newFonts) {
      const key = font.font.toLowerCase();
      
      if (fontCandidates.has(key)) {
        const existing = fontCandidates.get(key);
        existing.confidence = Math.max(existing.confidence, font.confidence);
        existing.weights = [...new Set([...existing.weights, ...font.weights])];
        if (font.usage && !existing.usage) {
          existing.usage = font.usage;
        }
      } else {
        fontCandidates.set(key, {...font, occurrences: 1, positions: [0], contexts: [font.rawText]});
      }
    }
  }

  categorizeFonts(fontCandidates, text) {
    const categorized = {
      primary: null,
      secondary: null,
      allFonts: []
    };
    
    // Sort by confidence and occurrences
    const sortedFonts = fontCandidates
      .filter(font => font.confidence > 0.5)
      .sort((a, b) => {
        const scoreA = a.confidence * a.occurrences;
        const scoreB = b.confidence * b.occurrences;
        return scoreB - scoreA;
      });
    
    if (sortedFonts.length > 0) {
      categorized.primary = this.createFontStructure(sortedFonts[0]);
      categorized.allFonts.push(categorized.primary);
    }
    
    if (sortedFonts.length > 1) {
      categorized.secondary = this.createFontStructure(sortedFonts[1]);
      categorized.allFonts.push(categorized.secondary);
    }
    
    // Add remaining fonts
    for (let i = 2; i < Math.min(sortedFonts.length, 5); i++) {
      categorized.allFonts.push(this.createFontStructure(sortedFonts[i]));
    }
    
    return categorized;
  }

  createFontStructure(fontData) {
    return {
      font: fontData.font,
      weights: fontData.weights,
      usage: fontData.usage || 'General usage',
      confidence: fontData.confidence,
      occurrences: fontData.occurrences
    };
  }

  calculateFontConfidence(fontName, context) {
    let confidence = 0.5;
    
    // Boost confidence for known fonts
    if (this.fontWhitelist.has(fontName.toLowerCase())) {
      confidence += 0.3;
    }
    
    // Boost for specific contexts
    if (context.toLowerCase().includes('primary')) confidence += 0.2;
    if (context.toLowerCase().includes('typeface')) confidence += 0.2;
    if (context.toLowerCase().includes('font')) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  getContext(text, position, length) {
    const start = Math.max(0, position - length);
    const end = Math.min(text.length, position + length);
    return text.substring(start, end);
  }

  /**
   * Fallback method to extract known font names from text
   */
  extractKnownFonts(text) {
    const fonts = [];
    
    // Look for specific known font names in the text
    const knownFonts = [
      'Omnes', 'Montserrat', 'Neighbor', 'Greatest Richmond',
      'Helvetica Neue', 'Helvetica', 'Arial', 'Roboto', 'Poppins',
      'Inter', 'Lato', 'Open Sans', 'Source Sans Pro', 'Nunito',
      'Chirp', 'Circular', 'SF Pro', 'SF Pro Display', 'Segoe UI',
      'Myriad Pro', 'Futura', 'Gill Sans', 'DIN', 'Avenir', 'Proxima Nova'
    ];
    
    for (const fontName of knownFonts) {
      const pattern = new RegExp(`\\b${fontName}\\b`, 'gi');
      const matches = text.match(pattern);
      
      if (matches && matches.length > 0) {
        fonts.push({
          font: fontName,
          weights: ['Regular', 'Bold'], // Default weights
          rawText: fontName,
          confidence: 0.8,
          occurrences: matches.length
        });
      }
    }
    
    return fonts;
  }
}
