// @ts-nocheck
/**
 * Advanced Color Extractor with Context Awareness
 * Handles all color formats and provides proper categorization
 */
export class AdvancedColorExtractor {
  constructor() {
    this.colorContexts = {
      'primary': ['primary', 'main', 'brand', 'core'],
      'secondary': ['secondary', 'accent', 'supporting'],
      'neutral': ['black', 'white', 'gray', 'grey', 'neutral'],
      'semantic': ['success', 'error', 'warning', 'info', 'danger']
    };
  }

  /**
   * Extract colors with proper context and categorization
   */
  extractColorsWithContext(text) {
    console.log('🎨 Starting enhanced color extraction...');
    
    // Step 1: Extract ALL color values with positions
    const allColorMatches = this.findAllColorValues(text);
    console.log(`🎨 Found ${allColorMatches.length} raw color matches`);
    
    // Step 2: Group colors by context and proximity
    const groupedColors = this.groupColorsByContext(allColorMatches, text);
    
    // Step 3: Categorize colors based on naming patterns
    const categorized = this.categorizeColors(groupedColors);
    
    // Step 4: Build final structure
    const result = this.buildColorStructure(categorized);
    
    console.log('🎨 Final color extraction:', result);
    return result;
  }

  /**
   * Find all color values in various formats (enhanced)
   */
  findAllColorValues(text) {
    const colorPatterns = [
      // Hex codes in various formats
      { pattern: /#([A-Fa-f0-9]{6})\b/g, type: 'hex' },
      { pattern: /#([A-Fa-f0-9]{3})\b/g, type: 'hex_short' },
      { pattern: /\b([A-Fa-f0-9]{6})\b(?!\w)/g, type: 'hex_raw' },
      
      // Color names with hex codes (Buffer specific patterns)
      { pattern: /(\w+(?:\s+\w+)*)\s+#([A-Fa-f0-9]{6})/gi, type: 'named_hex' },
      { pattern: /#([A-Fa-f0-9]{6})\s+(\w+(?:\s+\w+)*)/gi, type: 'hex_named' },
      
      // Section headers with colors
      { pattern: /(Primary colors?|Secondary colors?)[\s\S]{1,200}?(#([A-Fa-f0-9]{6}))/gi, type: 'section_colors' },
      
      // RGB formats
      { pattern: /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, type: 'rgb' },
      { pattern: /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/g, type: 'rgba' },
      
      // Common color names
      { pattern: /\b(black|white|red|blue|green|yellow|purple|orange|pink|brown|gray|grey)\b/gi, type: 'color_name' }
    ];
    
    const matches = [];
    
    for (const { pattern, type } of colorPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const context = this.getContext(text, match.index, 100);
        matches.push({
          value: match[0],
          hex: this.extractHexFromMatch(match, type),
          name: this.extractColorName(match, type, context),
          type: type,
          position: match.index,
          context: context
        });
      }
    }
    
    return matches;
  }

  /**
   * Extract hex value from match based on type
   */
  extractHexFromMatch(match, type) {
    try {
      switch(type) {
        case 'hex':
          return match[1] ? `#${match[1].toUpperCase()}` : null;
        case 'hex_short':
          const short = match[1];
          return short && short.length === 3 ? `#${short[0]}${short[0]}${short[1]}${short[1]}${short[2]}${short[2]}`.toUpperCase() : null;
        case 'hex_raw':
          return match[1] ? `#${match[1].toUpperCase()}` : null;
        case 'named_hex':
          return match[2] ? `#${match[2].toUpperCase()}` : null;
        case 'hex_named':
          return match[1] ? `#${match[1].toUpperCase()}` : null;
        case 'section_colors':
          return match[3] ? `#${match[3].toUpperCase()}` : null;
        case 'rgb':
          const [r, g, b] = match.slice(1, 4);
          return (r && g && b) ? this.rgbToHex(parseInt(r), parseInt(g), parseInt(b)) : null;
        case 'rgba':
          const [r2, g2, b2] = match.slice(1, 4);
          return (r2 && g2 && b2) ? this.rgbToHex(parseInt(r2), parseInt(g2), parseInt(b2)) : null;
        default:
          return null;
      }
    } catch (error) {
      console.warn('⚠️ Error extracting hex from match:', error);
      return null;
    }
  }

  /**
   * Extract color name from match based on type and context
   */
  extractColorName(match, type, context) {
    switch(type) {
      case 'named_hex':
        return match[1].trim();
      case 'hex_named':
        return match[2].trim();
      case 'section_colors':
        return this.inferColorNameFromSection(match[1], context);
      case 'color_name':
        return match[1].trim();
      default:
        return this.inferColorNameFromContext(context, this.extractHexFromMatch(match, type));
    }
  }

  /**
   * Infer color name from section context
   */
  inferColorNameFromSection(sectionName, context) {
    const sectionLower = sectionName.toLowerCase();
    if (sectionLower.includes('primary')) return 'Primary Color';
    if (sectionLower.includes('secondary')) return 'Secondary Color';
    return 'Brand Color';
  }

  /**
   * Infer color name from context
   */
  inferColorNameFromContext(context, hex) {
    const contextLower = context.toLowerCase();
    
    // Direct color name mappings from context
    if (contextLower.includes('black') || hex === '#231F20') return 'Black';
    if (contextLower.includes('white') || hex === '#FFFFFF') return 'White';
    if (contextLower.includes('blue') || hex === '#2C4BFF') return 'Blue';
    if (contextLower.includes('yellow') || hex === '#FADE2A') return 'Yellow';
    if (contextLower.includes('red') || hex === '#E0364F') return 'Red';
    if (contextLower.includes('orange') || hex === '#FF702C') return 'Orange';
    if (contextLower.includes('green') || hex === '#87C221') return 'Green';
    if (contextLower.includes('teal') || hex === '#00C8CF') return 'Teal';
    if (contextLower.includes('purple') || hex === '#9C2BFF') return 'Purple';
    if (contextLower.includes('pink') || hex === '#D925AC') return 'Pink';
    if (contextLower.includes('gray') || hex === '#B8B8B8') return 'Gray';
    
    // Try to extract from nearby text
    const nameMatch = context.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:\s+color|$)/i);
    if (nameMatch) return nameMatch[1];
    
    return `Color ${hex}`;
  }

  /**
   * Group colors by context and proximity
   */
  groupColorsByContext(matches, text) {
    const groups = {
      primary: [],
      secondary: [],
      accent: [],
      neutral: [],
      uncategorized: []
    };

    for (const match of matches) {
      const context = match.context.toLowerCase();
      let categorized = false;

      // Check for primary colors context
      if (context.includes('primary color') || context.includes('primary colors')) {
        groups.primary.push(match);
        categorized = true;
      }
      
      // Check for secondary colors context
      if (context.includes('secondary color') || context.includes('secondary colors')) {
        groups.secondary.push(match);
        categorized = true;
      }

      // Check for neutral colors
      if (context.includes('black') || context.includes('white') || context.includes('gray')) {
        groups.neutral.push(match);
        categorized = true;
      }

      // Check by position in color sections
      if (!categorized) {
        const section = this.findColorSection(text, match.position);
        if (section.includes('primary')) {
          groups.primary.push(match);
        } else if (section.includes('secondary')) {
          groups.secondary.push(match);
        } else {
          groups.uncategorized.push(match);
        }
      }
    }

    return groups;
  }

  /**
   * Find color section for a position
   */
  findColorSection(text, position) {
    // Look backwards for section headers
    const start = Math.max(0, position - 500);
    const sectionText = text.substring(start, position);
    
    const sectionMatch = sectionText.match(/(primary colors?|secondary colors?|accent colors?|neutral)/i);
    return sectionMatch ? sectionMatch[1].toLowerCase() : '';
  }

  /**
   * Categorize colors based on naming patterns
   */
  categorizeColors(groupedColors) {
    const categorized = {
      primary: [],
      secondary: [],
      accent: [],
      neutral: []
    };

    // Process primary colors (first 1-2 colors from primary group)
    categorized.primary = groupedColors.primary.slice(0, 2).map(match => ({
      name: match.name,
      hex: match.hex,
      usage: 'Primary brand elements'
    }));

    // Process secondary colors
    categorized.secondary = groupedColors.secondary.slice(0, 3).map(match => ({
      name: match.name,
      hex: match.hex,
      usage: 'Secondary elements, products'
    }));

    // Process neutral colors
    categorized.neutral = groupedColors.neutral.map(match => ({
      name: match.name,
      hex: match.hex,
      usage: this.getNeutralUsage(match.name)
    }));

    // Handle uncategorized - assign based on color properties
    for (const match of groupedColors.uncategorized) {
      // Skip matches with null or invalid hex values
      if (!match.hex || match.hex === null) {
        continue;
      }
      
      if (this.isNeutralColor(match.hex)) {
        categorized.neutral.push({
          name: match.name,
          hex: match.hex,
          usage: this.getNeutralUsage(match.name)
        });
      } else if (categorized.primary.length < 2) {
        categorized.primary.push({
          name: match.name,
          hex: match.hex,
          usage: 'Primary brand color'
        });
      } else {
        categorized.accent.push({
          name: match.name,
          hex: match.hex,
          usage: 'Accent elements'
        });
      }
    }

    return categorized;
  }

  /**
   * Check if color is neutral
   */
  isNeutralColor(hex) {
    if (!hex || hex === null) return false;
    const neutralHexes = ['#000000', '#231F20', '#FFFFFF', '#B8B8B8', '#636363', '#3D3D3D'];
    return neutralHexes.includes(hex.toUpperCase());
  }

  /**
   * Get neutral color usage
   */
  getNeutralUsage(colorName) {
    const name = colorName.toLowerCase();
    if (name.includes('black')) return 'Headings, text';
    if (name.includes('white')) return 'Backgrounds';
    if (name.includes('gray')) return 'Secondary text, borders';
    return 'Neutral elements';
  }

  /**
   * Build final color structure
   */
  buildColorStructure(categorized) {
    const palette = [
      ...categorized.primary.map(c => c.hex).filter(hex => hex && hex !== null),
      ...categorized.secondary.map(c => c.hex).filter(hex => hex && hex !== null),
      ...categorized.accent.map(c => c.hex).filter(hex => hex && hex !== null),
      ...categorized.neutral.map(c => c.hex).filter(hex => hex && hex !== null)
    ];

    return {
      primary: categorized.primary[0] || null,
      secondary: categorized.secondary[0] || null,
      accent: categorized.accent[0] || null,
      neutral: categorized.neutral.filter(c => c.hex && c.hex !== null),
      palette: [...new Set(palette)] // Remove duplicates
    };
  }

  /**
   * Normalize all color values to 6-digit hex
   */
  normalizeColorValue(colorMatch) {
    const formatType = colorMatch.format;
    const groups = colorMatch.groups;
    
    switch (formatType) {
      case 'hex':
        return `#${groups[0].toUpperCase()}`;
        
      case 'hex_short':
        // Expand 3-digit to 6-digit hex
        const hexVal = groups[0];
        return `#${hexVal[0]}${hexVal[0]}${hexVal[1]}${hexVal[1]}${hexVal[2]}${hexVal[2]}`.toUpperCase();
        
      case 'hex_raw':
        return `#${groups[0].toUpperCase()}`;
        
      case 'rgb':
        const [r, g, b] = groups;
        return this.rgbToHex(parseInt(r), parseInt(g), parseInt(b));
        
      case 'rgba':
        const [r2, g2, b2] = groups;
        return this.rgbToHex(parseInt(r2), parseInt(g2), parseInt(b2));
        
      case 'named_hex':
      case 'simple_named_hex':
        return `#${groups[1].toUpperCase()}`;
        
      case 'color_name':
        return this.colorNameToHex(groups[0].toLowerCase());
        
      default:
        return colorMatch.value;
    }
  }

  /**
   * Convert RGB to hex
   */
  rgbToHex(r, g, b) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  }

  /**
   * Convert color names to hex
   */
  colorNameToHex(colorName) {
    const colorMap = {
      'black': '#000000',
      'white': '#FFFFFF',
      'red': '#FF0000',
      'blue': '#0000FF',
      'green': '#008000',
      'yellow': '#FFFF00',
      'purple': '#800080',
      'orange': '#FFA500',
      'pink': '#FFC0CB',
      'brown': '#A52A2A',
      'gray': '#808080',
      'grey': '#808080'
    };
    
    return colorMap[colorName] || `#${colorName}`;
  }

  /**
   * Determine color category based on context
   */
  determineColorCategory(colorValue, context) {
    const contextLower = context.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.colorContexts)) {
      if (keywords.some(keyword => contextLower.includes(keyword))) {
        return category;
      }
    }
    
    // Fallback categorization
    const colorUpper = colorValue.toUpperCase();
    if (['#000000', '#FFFFFF', '#333333', '#666666', '#999999'].includes(colorUpper)) {
      return 'neutral';
    }
    
    return 'palette'; // Default category
  }

  /**
   * Extract color usage from context
   */
  extractColorUsage(context) {
    const contextLower = context.toLowerCase();
    
    if (contextLower.includes('button')) return 'buttons';
    if (contextLower.includes('text')) return 'text';
    if (contextLower.includes('background')) return 'background';
    if (contextLower.includes('logo')) return 'logo';
    if (contextLower.includes('accent')) return 'accent';
    if (contextLower.includes('primary')) return 'primary';
    if (contextLower.includes('secondary')) return 'secondary';
    
    return 'general';
  }

  /**
   * Extract color usage rules and constraints
   */
  extractColorUsageRules(text) {
    const rules = [];
    
    const rulePatterns = [
      /(?:do not|don't|never|avoid)[^.]*color[^.]*\./gi,
      /(?:always|must|should)[^.]*color[^.]*\./gi,
      /use.*color.*on.*background/gi,
      /color.*pair/gi,
      /contrast.*ratio/gi,
      /accessibility.*color/gi
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

  /**
   * Get context around a position (alias for getContextWindow)
   */
  getContext(text, position, length) {
    return this.getContextWindow(text, position, length);
  }
}
