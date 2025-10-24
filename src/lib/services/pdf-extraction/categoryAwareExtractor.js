// @ts-nocheck
/**
 * Category-Aware Extractor to Prevent Cross-Contamination
 * Ensures data goes into correct categories with strict boundaries
 */
export class CategoryAwareExtractor {
  constructor() {
    this.categoryBoundaries = this.defineCategoryBoundaries();
  }

  /**
   * Define strict boundaries for each category
   */
  defineCategoryBoundaries() {
    return {
      'colors': [
        'color', 'colour', 'hex', 'rgb', 'palette', 
        'primary color', 'secondary color', 'black', 'white',
        'blue', 'red', 'green', 'yellow', 'purple', 'orange',
        'background color', 'text color', 'accent color'
      ],
      'typography': [
        'font', 'typeface', 'typography', 'heading', 'body',
        'text', 'paragraph', 'letter', 'spacing', 'kerning',
        'line height', 'font size', 'font weight', 'font family',
        'heading font', 'body font', 'text font'
      ],
      'logo': [
        'logo', 'logotype', 'brandmark', 'icon', 'symbol',
        'clear space', 'minimum size', 'aspect ratio',
        'logo usage', 'logo don\'t', 'logo do', 'logo rules',
        'brand mark', 'wordmark'
      ],
      'spacing': [
        'spacing', 'whitespace', 'margin', 'padding',
        'grid', 'layout', 'alignment', 'clear space',
        'line spacing', 'letter spacing', 'word spacing'
      ]
    };
  }

  /**
   * Enforce category boundaries on extracted data
   */
  enforceCategoryBoundaries(extractedData) {
    console.log('🔒 Enforcing category boundaries...');
    
    const cleanedData = {
      'colors': this.cleanColorData(extractedData.colors || {}),
      'typography': this.cleanTypographyData(extractedData.typography || {}),
      'logo': this.cleanLogoData(extractedData.logo || {}),
      'spacing': this.cleanSpacingData(extractedData.spacing || {})
    };
    
    return cleanedData;
  }

  /**
   * Clean color data - remove non-color information
   */
  cleanColorData(colorData) {
    const allowedKeys = new Set([
      'primary', 'secondary', 'neutral', 'semantic', 'palette', 'usage_rules'
    ]);
    
    const cleaned = {};
    for (const [key, value] of Object.entries(colorData)) {
      if (allowedKeys.has(key)) {
        cleaned[key] = value;
      }
    }
    
    // Ensure palette is an array
    if (cleaned.palette && !Array.isArray(cleaned.palette)) {
      cleaned.palette = [];
    }
    
    return cleaned;
  }

  /**
   * Clean typography data - remove spacing that belongs to logo
   */
  cleanTypographyData(typographyData) {
    const cleaned = { ...typographyData };
    
    // Remove spacing information that belongs to logo
    if (cleaned.spacing) {
      const typographySpacing = {};
      for (const [key, value] of Object.entries(cleaned.spacing)) {
        const keyLower = key.toLowerCase();
        // Only keep typography-specific spacing
        if (keyLower.includes('letter') || 
            keyLower.includes('line') || 
            keyLower.includes('kerning') || 
            keyLower.includes('tracking') ||
            keyLower.includes('word spacing')) {
          typographySpacing[key] = value;
        }
      }
      cleaned.spacing = typographySpacing;
    }
    
    // Ensure fonts is an array
    if (cleaned.fonts && !Array.isArray(cleaned.fonts)) {
      cleaned.fonts = [];
    }
    
    return cleaned;
  }

  /**
   * Clean and validate logo data
   */
  cleanLogoData(logoData) {
    const cleaned = { ...logoData };
    
    // Ensure spacing rules are properly categorized
    if (cleaned.spacing) {
      const logoSpacing = {};
      for (const [key, value] of Object.entries(cleaned.spacing)) {
        const keyLower = key.toLowerCase();
        // Only keep logo-specific spacing
        if (keyLower.includes('clear space') || 
            keyLower.includes('minimum') || 
            keyLower.includes('padding') || 
            keyLower.includes('margin') ||
            keyLower.includes('logo spacing')) {
          logoSpacing[key] = value;
        }
      }
      cleaned.spacing = logoSpacing;
    }
    
    // Ensure rules is an array
    if (cleaned.rules && !Array.isArray(cleaned.rules)) {
      cleaned.rules = [];
    }
    
    return cleaned;
  }

  /**
   * Clean spacing data - remove logo-specific spacing
   */
  cleanSpacingData(spacingData) {
    const cleaned = { ...spacingData };
    
    // Remove logo-specific spacing
    if (cleaned.logo_spacing) {
      delete cleaned.logo_spacing;
    }
    
    // Keep only general spacing rules
    const generalSpacingKeys = [
      'grid', 'layout', 'alignment', 'general_spacing',
      'margin', 'padding', 'whitespace'
    ];
    
    const filteredSpacing = {};
    for (const [key, value] of Object.entries(cleaned)) {
      if (generalSpacingKeys.some(generalKey => key.toLowerCase().includes(generalKey))) {
        filteredSpacing[key] = value;
      }
    }
    
    return filteredSpacing;
  }

  /**
   * Validate that data belongs to the correct category
   */
  validateCategoryData(category, data) {
    const boundaries = this.categoryBoundaries[category];
    if (!boundaries) return false;
    
    // Check if data contains relevant keywords
    const dataString = JSON.stringify(data).toLowerCase();
    return boundaries.some(keyword => dataString.includes(keyword));
  }

  /**
   * Move misplaced data to correct categories
   */
  redistributeMisplacedData(extractedData) {
    console.log('🔄 Redistributing misplaced data...');
    
    const redistributed = { ...extractedData };
    
    // Check for spacing data in typography
    if (redistributed.typography && redistributed.typography.spacing) {
      const spacingData = redistributed.typography.spacing;
      
      // Move logo-specific spacing to logo
      if (redistributed.logo) {
        if (!redistributed.logo.spacing) {
          redistributed.logo.spacing = {};
        }
        
        for (const [key, value] of Object.entries(spacingData)) {
          if (key.toLowerCase().includes('clear space') || 
              key.toLowerCase().includes('minimum')) {
            redistributed.logo.spacing[key] = value;
            delete spacingData[key];
          }
        }
      }
      
      // Move general spacing to spacing category
      if (redistributed.spacing) {
        for (const [key, value] of Object.entries(spacingData)) {
          if (key.toLowerCase().includes('grid') || 
              key.toLowerCase().includes('layout')) {
            redistributed.spacing[key] = value;
            delete spacingData[key];
          }
        }
      }
    }
    
    return redistributed;
  }

  /**
   * Get category for a specific piece of data
   */
  getDataCategory(dataString) {
    const dataLower = dataString.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.categoryBoundaries)) {
      if (keywords.some(keyword => dataLower.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }
}
