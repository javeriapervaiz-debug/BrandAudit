/**
 * Universal Color Analyzer
 * Handles multiple brand guideline formats with fuzzy matching
 */

export class UniversalColorAnalyzer {
  constructor() {
    this.colorSimilarityThreshold = 0.15; // 15% difference tolerance
    this.brandColorCategories = ['primary', 'secondary', 'accent', 'neutral'];
  }

  analyzeColorsUniversal(scrapedColors, brandColors) {
    console.log('🎨 Starting universal color analysis...');
    
    // Step 1: Normalize all colors to consistent format
    const normalizedScraped = this.normalizeColorStructure(scrapedColors);
    const normalizedBrand = this.normalizeBrandColorStructure(brandColors);
    
    console.log('🎨 Normalized scraped colors:', normalizedScraped.allColors.size);
    console.log('🎨 Normalized brand colors:', normalizedBrand.allColors.size);
    
    // Step 2: Analyze by category with fuzzy matching
    const categoryScores = {};
    const issues = [];
    
    this.brandColorCategories.forEach(category => {
      const analysis = this.analyzeColorCategory(
        normalizedScraped, 
        normalizedBrand, 
        category
      );
      categoryScores[category] = analysis.score;
      issues.push(...analysis.issues);
    });
    
    // Step 3: Overall palette analysis
    const paletteAnalysis = this.analyzeColorPalette(normalizedScraped, normalizedBrand);
    
    const overallScore = this.calculateWeightedScore({...categoryScores, palette: paletteAnalysis.score});
    const confidence = this.calculateConfidence(normalizedScraped, normalizedBrand);
    
    console.log('🎨 Universal color analysis complete:', {
      score: overallScore,
      confidence: confidence,
      issues: issues.length
    });
    
    return {
      score: overallScore,
      details: categoryScores,
      issues: [...issues, ...paletteAnalysis.issues],
      confidence: confidence
    };
  }

  normalizeColorStructure(colors) {
    // Handle multiple possible color structure formats
    const normalized = {
      primary: [],
      secondary: [],
      accent: [],
      neutral: [],
      palette: [],
      allColors: new Set()
    };
    
    if (!colors) return normalized;
    
    // Extract from various common structures
    if (colors.primary) {
      normalized.primary = this.extractColorValues(colors.primary);
    }
    
    if (colors.secondary) {
      normalized.secondary = this.extractColorValues(colors.secondary);
    }
    
    if (colors.accent) {
      normalized.accent = this.extractColorValues(colors.accent);
    }
    
    if (colors.neutral) {
      normalized.neutral = this.extractColorValues(colors.neutral);
    }
    
    if (colors.palette && Array.isArray(colors.palette)) {
      normalized.palette = this.normalizeColorArray(colors.palette);
    }
    
    // Build comprehensive color set
    [
      ...normalized.primary,
      ...normalized.secondary,
      ...normalized.accent,
      ...normalized.neutral,
      ...normalized.palette
    ].forEach(color => normalized.allColors.add(color));
    
    return normalized;
  }

  normalizeBrandColorStructure(brandColors) {
    const normalized = {
      primary: [],
      secondary: [],
      accent: [],
      neutral: [],
      palette: [],
      allColors: new Set()
    };
    
    if (!brandColors) return normalized;
    
    // Handle different brand color structures
    if (brandColors.primary) {
      normalized.primary = this.extractColorValues(brandColors.primary);
    }
    
    if (brandColors.secondary) {
      normalized.secondary = this.extractColorValues(brandColors.secondary);
    }
    
    if (brandColors.accent) {
      normalized.accent = this.extractColorValues(brandColors.accent);
    }
    
    if (brandColors.neutral) {
      normalized.neutral = this.extractColorValues(brandColors.neutral);
    }
    
    if (brandColors.palette) {
      normalized.palette = this.normalizeColorArray(brandColors.palette);
    }
    
    // Build comprehensive color set
    [
      ...normalized.primary,
      ...normalized.secondary,
      ...normalized.accent,
      ...normalized.neutral,
      ...normalized.palette
    ].forEach(color => normalized.allColors.add(color));
    
    return normalized;
  }

  extractColorValues(colorData) {
    if (!colorData) return [];
    
    if (typeof colorData === 'string') {
      return [this.normalizeColorToHex(colorData)];
    }
    
    if (Array.isArray(colorData)) {
      return colorData.map(color => this.normalizeColorToHex(color)).filter(Boolean);
    }
    
    if (typeof colorData === 'object') {
      // Handle {hex: '#000000', name: 'Black'} format
      if (colorData.hex) {
        return [this.normalizeColorToHex(colorData.hex)];
      }
      // Handle nested objects
      return Object.values(colorData)
        .map(value => this.normalizeColorToHex(value))
        .filter(Boolean);
    }
    
    return [];
  }

  normalizeColorToHex(color) {
    if (!color) return null;
    
    // If it's already a hex, ensure proper format
    if (typeof color === 'string' && color.startsWith('#')) {
      // Handle 3-digit hex
      if (color.length === 4) {
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`.toUpperCase();
      }
      // Handle 6-digit hex
      if (color.length === 7) {
        return color.toUpperCase();
      }
    }
    
    // Handle RGB format
    if (typeof color === 'string' && color.startsWith('rgb')) {
      return this.rgbToHex(color);
    }
    
    return null;
  }

  rgbToHex(rgb) {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }
    return null;
  }

  normalizeColorArray(colors) {
    return colors
      .map(color => this.normalizeColorToHex(color))
      .filter(Boolean);
  }

  analyzeColorCategory(scraped, brand, category) {
    const brandColors = brand[category] || [];
    const scrapedColors = scraped[category] || [];
    
    if (brandColors.length === 0) {
      return { score: 0.5, issues: [] }; // Neutral if no brand colors defined
    }
    
    let totalSimilarity = 0;
    let brandColorsUsed = 0;
    const issues = [];
    
    brandColors.forEach(brandColor => {
      let bestMatch = 0;
      let matchingColor = null;
      
      // Find closest match in scraped colors
      scrapedColors.forEach(scrapedColor => {
        const similarity = this.colorSimilarity(brandColor, scrapedColor);
        if (similarity > bestMatch) {
          bestMatch = similarity;
          matchingColor = scrapedColor;
        }
      });
      
      // Also check in overall palette
      scraped.allColors.forEach(scrapedColor => {
        const similarity = this.colorSimilarity(brandColor, scrapedColor);
        if (similarity > bestMatch) {
          bestMatch = similarity;
          matchingColor = scrapedColor;
        }
      });
      
      totalSimilarity += bestMatch;
      
      if (bestMatch > 0.8) {
        brandColorsUsed++;
      } else if (bestMatch < 0.3) {
        issues.push({
          category: 'colors',
          type: `${category}_color_missing`,
          severity: category === 'primary' ? 'high' : 'medium',
          message: `${this.capitalize(category)} brand color ${brandColor} is not used`,
          suggestion: `Incorporate ${brandColor} as a ${category} color`
        });
      }
    });
    
    const similarityScore = totalSimilarity / brandColors.length;
    const coverageScore = brandColorsUsed / brandColors.length;
    const finalScore = (similarityScore * 0.7 + coverageScore * 0.3);
    
    return { score: finalScore, issues };
  }

  analyzeColorPalette(scraped, brand) {
    if (brand.palette.length === 0) {
      return { score: 0.5, issues: [] };
    }
    
    let totalScore = 0;
    let brandColorsUsed = 0;
    const issues = [];
    
    for (const brandColor of brand.palette) {
      let bestMatch = 0;
      
      for (const scrapedColor of scraped.allColors) {
        const similarity = this.colorSimilarity(brandColor, scrapedColor);
        bestMatch = Math.max(bestMatch, similarity);
      }
      
      totalScore += bestMatch;
      if (bestMatch > 0.8) brandColorsUsed++;
    }
    
    const coverageScore = brandColorsUsed / brand.palette.length;
    const similarityScore = totalScore / brand.palette.length;
    const finalScore = (coverageScore * 0.6 + similarityScore * 0.4);
    
    if (finalScore < 0.5) {
      issues.push({
        category: 'colors',
        type: 'brand_palette_underused',
        severity: 'medium',
        message: 'Brand color palette is not being fully utilized',
        suggestion: 'Use more colors from the official brand palette'
      });
    }
    
    return { score: finalScore, issues };
  }

  colorSimilarity(hex1, hex2) {
    if (!hex1 || !hex2) return 0;
    
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const rDiff = rgb1.r - rgb2.r;
    const gDiff = rgb1.g - rgb2.g;
    const bDiff = rgb1.b - rgb2.b;
    
    const distance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    return 1 - Math.min(distance / 441.67, 1); // Normalize to 0-1
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  calculateWeightedScore(scores) {
    const weights = {
      primary: 0.3,
      secondary: 0.25,
      accent: 0.2,
      neutral: 0.15,
      palette: 0.1
    };
    
    return Object.keys(weights).reduce((total, key) => {
      return total + (scores[key] * weights[key]);
    }, 0);
  }

  calculateConfidence(scraped, brand) {
    const scrapedCount = scraped.allColors.size;
    const brandCount = brand.allColors.size;
    
    if (brandCount === 0) return 0.5;
    
    const coverage = Math.min(scrapedCount / brandCount, 1);
    const quality = scrapedCount > 0 ? 0.8 : 0.2;
    
    return (coverage * 0.6 + quality * 0.4);
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
