/**
 * Universal Font Analyzer
 * Handles multiple font formats with fuzzy matching and family recognition
 */

export class UniversalFontAnalyzer {
  constructor() {
    this.fontFamilies = this.buildFontFamilyGroups();
    this.fontWeightMapping = this.buildWeightMapping();
  }

  buildFontFamilyGroups() {
    return {
      'helvetica': ['helvetica neue', 'arial', 'sans-serif'],
      'helvetica neue': ['helvetica', 'arial', 'sans-serif'],
      'inter': ['system-ui', '-apple-system', 'blinkmacsystemfont', 'sans-serif'],
      'roboto': ['roboto flex', 'roboto condensed', 'sans-serif'],
      'georgia': ['times new roman', 'serif'],
      'monospace': ['courier new', 'monaco', 'consolas'],
      'poppins': ['sans-serif'],
      'lato': ['sans-serif'],
      'open sans': ['sans-serif'],
      'montserrat': ['sans-serif']
    };
  }

  buildWeightMapping() {
    return {
      '100': ['thin', 'hairline'],
      '200': ['extra-light', 'ultra-light'],
      '300': ['light'],
      '400': ['normal', 'regular'],
      '500': ['medium'],
      '600': ['semi-bold', 'demi-bold'],
      '700': ['bold'],
      '800': ['extra-bold', 'ultra-bold'],
      '900': ['black', 'heavy']
    };
  }

  analyzeFontsUniversal(scrapedFonts, brandFonts) {
    console.log('🔤 Starting universal font analysis...');
    
    const normalizedScraped = this.normalizeFontStructure(scrapedFonts);
    const normalizedBrand = this.normalizeFontStructure(brandFonts);
    
    console.log('🔤 Normalized scraped fonts:', normalizedScraped.allFonts.size);
    console.log('🔤 Normalized brand fonts:', normalizedBrand.allFonts.size);
    
    const analysis = {
      primary: this.analyzePrimaryFont(normalizedScraped, normalizedBrand),
      secondary: this.analyzeSecondaryFont(normalizedScraped, normalizedBrand),
      weights: this.analyzeFontWeights(normalizedScraped, normalizedBrand),
      hierarchy: this.analyzeFontHierarchy(normalizedScraped, normalizedBrand)
    };
    
    const issues = [
      ...analysis.primary.issues,
      ...analysis.secondary.issues,
      ...analysis.weights.issues,
      ...analysis.hierarchy.issues
    ];
    
    const score = this.calculateFontScore(analysis);
    const confidence = this.calculateFontConfidence(normalizedScraped, normalizedBrand);
    
    console.log('🔤 Universal font analysis complete:', {
      score: score,
      confidence: confidence,
      issues: issues.length
    });
    
    return {
      score,
      details: {
        primary: analysis.primary.score,
        secondary: analysis.secondary.score,
        weights: analysis.weights.score,
        hierarchy: analysis.hierarchy.score
      },
      issues,
      confidence
    };
  }

  normalizeFontStructure(fontData) {
    // Handle multiple possible font structure formats
    const normalized = {
      primary: null,
      secondary: null,
      allFonts: new Set(),
      weights: new Set(),
      sizes: [],
      usage: {}
    };
    
    if (!fontData) return normalized;
    
    // Extract from primary font
    if (fontData.primary) {
      if (typeof fontData.primary === 'string') {
        normalized.primary = this.cleanFontName(fontData.primary);
      } else if (fontData.primary.font) {
        normalized.primary = this.cleanFontName(fontData.primary.font);
        if (fontData.primary.weights) {
          fontData.primary.weights.forEach(weight => normalized.weights.add(weight.toLowerCase()));
        }
      }
    }
    
    // Extract from secondary font
    if (fontData.secondary) {
      if (typeof fontData.secondary === 'string') {
        normalized.secondary = this.cleanFontName(fontData.secondary);
      } else if (fontData.secondary.font) {
        normalized.secondary = this.cleanFontName(fontData.secondary.font);
        if (fontData.secondary.weights) {
          fontData.secondary.weights.forEach(weight => normalized.weights.add(weight.toLowerCase()));
        }
      }
    }
    
    // Extract from all fonts array
    if (fontData.allFonts && Array.isArray(fontData.allFonts)) {
      fontData.allFonts.forEach(fontObj => {
        if (typeof fontObj === 'string') {
          normalized.allFonts.add(this.cleanFontName(fontObj));
        } else if (fontObj.font) {
          const fontName = this.cleanFontName(fontObj.font);
          normalized.allFonts.add(fontName);
          
          if (fontObj.weights) {
            fontObj.weights.forEach(weight => normalized.weights.add(weight.toLowerCase()));
          }
          
          if (fontObj.usage) {
            normalized.usage[fontName] = fontObj.usage;
          }
        }
      });
    }
    
    // Extract from simple fonts array
    if (fontData.fonts && Array.isArray(fontData.fonts)) {
      fontData.fonts.forEach(font => {
        normalized.allFonts.add(this.cleanFontName(font));
      });
    }
    
    // Set primary if not already set
    if (!normalized.primary && normalized.allFonts.size > 0) {
      normalized.primary = Array.from(normalized.allFonts)[0];
    }
    
    return normalized;
  }

  cleanFontName(fontName) {
    if (!fontName) return null;
    
    return fontName
      .replace(/\s+(?:bold|regular|light|medium|black|italic|normal)$/gi, '')
      .replace(/["']/g, '')
      .trim()
      .toLowerCase();
  }

  analyzePrimaryFont(scraped, brand) {
    if (!brand.primary) {
      return { score: 0.5, issues: [] };
    }
    
    const scrapedPrimary = scraped.primary || Array.from(scraped.allFonts)[0];
    if (!scrapedPrimary) {
      return {
        score: 0,
        issues: [{
          category: 'typography',
          type: 'no_fonts_detected',
          severity: 'high',
          message: 'No fonts detected on the webpage',
          suggestion: 'Ensure text elements use web fonts'
        }]
      };
    }
    
    const similarity = this.fontSimilarity(scrapedPrimary, brand.primary);
    const issues = [];
    
    if (similarity < 0.7) {
      issues.push({
        category: 'typography',
        type: 'primary_font_mismatch',
        severity: similarity < 0.3 ? 'high' : 'medium',
        message: `Primary font should be similar to "${brand.primary}"`,
        suggestion: `Use "${brand.primary}" or a similar font family`
      });
    }
    
    return { score: similarity, issues };
  }

  analyzeSecondaryFont(scraped, brand) {
    if (!brand.secondary) {
      return { score: 0.5, issues: [] };
    }
    
    const scrapedSecondary = scraped.secondary || 
                             Array.from(scraped.allFonts).find(f => f !== scraped.primary) || 
                             Array.from(scraped.allFonts)[1];
    
    if (!scrapedSecondary) {
      return {
        score: 0.3,
        issues: [{
          category: 'typography',
          type: 'secondary_font_missing',
          severity: 'medium',
          message: 'Secondary font not detected',
          suggestion: `Use "${brand.secondary}" as secondary font`
        }]
      };
    }
    
    const similarity = this.fontSimilarity(scrapedSecondary, brand.secondary);
    const issues = [];
    
    if (similarity < 0.6) {
      issues.push({
        category: 'typography',
        type: 'secondary_font_mismatch',
        severity: 'medium',
        message: `Secondary font should be similar to "${brand.secondary}"`,
        suggestion: `Use "${brand.secondary}" or a similar font family`
      });
    }
    
    return { score: similarity, issues };
  }

  analyzeFontWeights(scraped, brand) {
    if (brand.weights.size === 0) {
      return { score: 0.5, issues: [] };
    }
    
    const scrapedWeights = new Set(scraped.weights);
    const brandWeights = new Set(brand.weights);
    
    const matchingWeights = [...brandWeights].filter(weight => 
      scrapedWeights.has(weight) || this.findWeightMatch(weight, scrapedWeights)
    ).length;
    
    const score = brandWeights.size > 0 ? matchingWeights / brandWeights.size : 0.5;
    
    const issues = [];
    if (score < 0.5) {
      issues.push({
        category: 'typography',
        type: 'font_weights_missing',
        severity: 'low',
        message: 'Not using all recommended font weights',
        suggestion: `Use font weights: ${Array.from(brandWeights).join(', ')}`
      });
    }
    
    return { score, issues };
  }

  analyzeFontHierarchy(scraped, brand) {
    // Simple hierarchy check - more sophisticated version would analyze component usage
    if (scraped.allFonts.size >= 2 && brand.allFonts.size >= 2) {
      return { score: 0.8, issues: [] };
    }
    
    if (scraped.allFonts.size >= 1 && brand.allFonts.size >= 1) {
      return { score: 0.6, issues: [] };
    }
    
    return { score: 0.3, issues: [] };
  }

  fontSimilarity(font1, font2) {
    if (!font1 || !font2) return 0;
    
    const f1 = font1.toLowerCase();
    const f2 = font2.toLowerCase();
    
    // Exact match
    if (f1 === f2) return 1.0;
    
    // Check font family groups
    for (const [family, variants] of Object.entries(this.fontFamilies)) {
      const inFamily1 = f1 === family || variants.includes(f1);
      const inFamily2 = f2 === family || variants.includes(f2);
      
      if (inFamily1 && inFamily2) return 0.8;
    }
    
    // Partial string match
    if (f1.includes(f2) || f2.includes(f1)) return 0.6;
    
    // Both are generic sans-serif
    if ((f1.includes('sans') && f2.includes('sans')) || 
        (f1.includes('system') && f2.includes('system'))) {
      return 0.5;
    }
    
    return 0.2; // Minimal similarity
  }

  findWeightMatch(brandWeight, scrapedWeights) {
    const weightNum = this.fontWeightMapping[brandWeight];
    if (!weightNum) return false;
    
    return [...scrapedWeights].some(scrapedWeight => {
      const scrapedNum = this.fontWeightMapping[scrapedWeight];
      return scrapedNum && Math.abs(weightNum - scrapedNum) <= 100;
    });
  }

  calculateFontScore(analysis) {
    const weights = {
      primary: 0.4,
      secondary: 0.3,
      weights: 0.2,
      hierarchy: 0.1
    };
    
    return Object.keys(weights).reduce((total, key) => {
      return total + (analysis[key].score * weights[key]);
    }, 0);
  }

  calculateFontConfidence(scraped, brand) {
    const scrapedCount = scraped.allFonts.size;
    const brandCount = brand.allFonts.size;
    
    if (brandCount === 0) return 0.5;
    
    const coverage = Math.min(scrapedCount / brandCount, 1);
    const quality = scrapedCount > 0 ? 0.8 : 0.2;
    
    return (coverage * 0.6 + quality * 0.4);
  }
}
