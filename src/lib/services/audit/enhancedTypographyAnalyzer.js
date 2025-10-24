/**
 * Enhanced Typography Analysis System
 * Uses fuzzy font matching and similarity scoring
 */

export class EnhancedTypographyAnalyzer {
  constructor() {
    this.fontSimilarityThreshold = 0.7;
  }

  analyzeTypographyCompliance(scrapedTypography, brandTypography) {
    console.log('🔤 Starting enhanced typography analysis...');
    
    // Step 1: Normalize both typography sets
    const normalizedScraped = this.normalizeScrapedTypography(scrapedTypography);
    const normalizedBrand = this.normalizeBrandTypography(brandTypography);
    
    console.log('🔤 Normalized scraped fonts:', normalizedScraped.primaryFont);
    console.log('🔤 Normalized brand fonts:', normalizedBrand.primaryFont);
    
    // Step 2: Calculate scores
    const scores = {
      primary: this.calculatePrimaryFontScore(normalizedScraped, normalizedBrand),
      secondary: this.calculateSecondaryFontScore(normalizedScraped, normalizedBrand),
      weights: this.calculateFontWeightScore(normalizedScraped, normalizedBrand),
      hierarchy: this.calculateHierarchyScore(normalizedScraped, normalizedBrand)
    };
    
    // Step 3: Calculate weighted overall score
    const overallScore = this.calculateWeightedTypographyScore(scores);
    
    console.log('🔤 Typography analysis scores:', scores);
    console.log('🔤 Overall typography score:', overallScore);
    
    return {
      score: overallScore,
      details: scores,
      issues: this.generateTypographyIssues(normalizedScraped, normalizedBrand, scores)
    };
  }

  normalizeScrapedTypography(scraped) {
    return {
      primaryFont: this.cleanFontName(scraped.primaryFont),
      secondaryFont: this.cleanFontName(scraped.secondaryFont),
      allFonts: (scraped.fonts || []).map(font => this.cleanFontName(font)),
      weights: scraped.weights || [],
      sizes: scraped.sizes || []
    };
  }

  normalizeBrandTypography(brand) {
    const normalized = {
      primaryFont: null,
      secondaryFont: null,
      allFonts: [],
      weights: [],
      usage: {}
    };
    
    // Extract from primary
    if (brand.primary && brand.primary.font) {
      normalized.primaryFont = this.cleanFontName(brand.primary.font);
      if (brand.primary.weights) {
        normalized.weights.push(...brand.primary.weights);
      }
    }
    
    // Extract from secondary
    if (brand.secondary && brand.secondary.font) {
      normalized.secondaryFont = this.cleanFontName(brand.secondary.font);
      if (brand.secondary.weights) {
        normalized.weights.push(...brand.secondary.weights);
      }
    }
    
    // Extract from allFonts
    if (brand.allFonts && Array.isArray(brand.allFonts)) {
      brand.allFonts.forEach(fontObj => {
        if (fontObj.font) {
          const cleanFont = this.cleanFontName(fontObj.font);
          normalized.allFonts.push(cleanFont);
          
          if (fontObj.weights) {
            normalized.weights.push(...fontObj.weights);
          }
          
          if (fontObj.usage) {
            normalized.usage[cleanFont] = fontObj.usage;
          }
        }
      });
    }
    
    // Remove duplicates
    normalized.allFonts = [...new Set(normalized.allFonts)];
    normalized.weights = [...new Set(normalized.weights)];
    
    // If no primary found, use first font from allFonts
    if (!normalized.primaryFont && normalized.allFonts.length > 0) {
      normalized.primaryFont = normalized.allFonts[0];
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

  calculatePrimaryFontScore(scraped, brand) {
    if (!brand.primaryFont) return 0.5;
    
    const scrapedPrimary = scraped.primaryFont || scraped.allFonts[0];
    if (!scrapedPrimary) return 0;
    
    const similarity = this.fontSimilarity(scrapedPrimary, brand.primaryFont);
    return similarity;
  }

  calculateSecondaryFontScore(scraped, brand) {
    if (!brand.secondaryFont) return 0.5;
    
    const scrapedSecondary = scraped.secondaryFont || 
                           scraped.allFonts.find(f => f !== scraped.primaryFont) || 
                           scraped.allFonts[1];
    
    if (!scrapedSecondary) return 0;
    
    const similarity = this.fontSimilarity(scrapedSecondary, brand.secondaryFont);
    return similarity;
  }

  calculateFontWeightScore(scraped, brand) {
    if (brand.weights.length === 0) return 0.5;
    
    const scrapedWeights = new Set(scraped.weights.map(w => w.toLowerCase()));
    const brandWeights = new Set(brand.weights.map(w => w.toLowerCase()));
    
    const matchingWeights = [...brandWeights].filter(weight => 
      scrapedWeights.has(weight)
    ).length;
    
    return brandWeights.size > 0 ? matchingWeights / brandWeights.size : 0.5;
  }

  calculateHierarchyScore(scraped, brand) {
    // Simple hierarchy check - more sophisticated version would analyze component usage
    if (scraped.allFonts.length >= 2 && brand.allFonts.length >= 2) {
      return 0.8;
    }
    
    if (scraped.allFonts.length >= 1 && brand.allFonts.length >= 1) {
      return 0.6;
    }
    
    return 0.3;
  }

  fontSimilarity(font1, font2) {
    if (!font1 || !font2) return 0;
    
    const f1 = font1.toLowerCase();
    const f2 = font2.toLowerCase();
    
    // Exact match
    if (f1 === f2) return 1.0;
    
    // Common font family matches
    const fontFamilies = {
      'helvetica': ['helvetica neue', 'arial', 'sans-serif'],
      'helvetica neue': ['helvetica', 'arial', 'sans-serif'],
      'arial': ['helvetica', 'helvetica neue', 'sans-serif'],
      'inter': ['system-ui', 'sans-serif'],
      'system-ui': ['inter', 'sans-serif'],
      'times': ['times new roman', 'serif'],
      'georgia': ['serif'],
      'poppins': ['sans-serif'],
      'roboto': ['sans-serif'],
      'open sans': ['sans-serif'],
      'lato': ['sans-serif'],
      'montserrat': ['sans-serif']
    };
    
    // Check if fonts are in the same family
    for (const [family, variants] of Object.entries(fontFamilies)) {
      if ((f1 === family || variants.includes(f1)) && 
          (f2 === family || variants.includes(f2))) {
        return 0.8;
      }
    }
    
    // Partial match
    if (f1.includes(f2) || f2.includes(f1)) {
      return 0.7;
    }
    
    // Check for common sans-serif fallbacks
    const sansSerifFonts = ['helvetica', 'helvetica neue', 'arial', 'inter', 'system-ui', 'poppins', 'roboto', 'open sans', 'lato', 'montserrat'];
    if (sansSerifFonts.includes(f1) && sansSerifFonts.includes(f2)) {
      return 0.6;
    }
    
    // No match
    return 0;
  }

  calculateWeightedTypographyScore(scores) {
    const weights = {
      primary: 0.4,
      secondary: 0.3,
      weights: 0.2,
      hierarchy: 0.1
    };
    
    return Object.keys(weights).reduce((total, key) => {
      return total + (scores[key] * weights[key]);
    }, 0);
  }

  generateTypographyIssues(scraped, brand, scores) {
    const issues = [];
    
    // Primary font issues
    if (scores.primary < 0.7 && brand.primaryFont) {
      issues.push({
        category: 'typography',
        type: 'primary_font_mismatch',
        severity: scores.primary < 0.3 ? 'high' : 'medium',
        message: `Primary font should be "${brand.primaryFont}" but using "${scraped.primaryFont}"`,
        suggestion: `Update primary font to use "${brand.primaryFont}"`
      });
    }
    
    // Secondary font issues
    if (scores.secondary < 0.6 && brand.secondaryFont) {
      issues.push({
        category: 'typography',
        type: 'secondary_font_mismatch',
        severity: 'medium',
        message: `Secondary font should be "${brand.secondaryFont}"`,
        suggestion: `Incorporate "${brand.secondaryFont}" as secondary font`
      });
    }
    
    // Font weight issues
    if (scores.weights < 0.5 && brand.weights.length > 0) {
      issues.push({
        category: 'typography',
        type: 'font_weights_missing',
        severity: 'low',
        message: 'Not using all recommended font weights',
        suggestion: `Use font weights: ${brand.weights.join(', ')}`
      });
    }
    
    return issues;
  }
}
