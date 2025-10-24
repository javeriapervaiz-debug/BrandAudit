/**
 * Enhanced Color Analysis System
 * Handles color objects properly and uses tolerance-based matching
 */

export class EnhancedColorAnalyzer {
  constructor() {
    this.colorTolerance = 0.15; // 15% color difference tolerance
  }

  analyzeColorCompliance(scrapedColors, brandColors) {
    console.log('🎨 Starting enhanced color analysis...');
    
    // Step 1: Normalize both color sets properly
    const normalizedScraped = this.normalizeScrapedColors(scrapedColors);
    const normalizedBrand = this.normalizeBrandColors(brandColors);
    
    console.log('🎨 Normalized scraped colors:', normalizedScraped.palette.length);
    console.log('🎨 Normalized brand colors:', normalizedBrand.palette.length);
    
    // Step 2: Calculate scores for each color category
    const scores = {
      primary: this.calculatePrimaryColorScore(normalizedScraped, normalizedBrand),
      secondary: this.calculateSecondaryColorScore(normalizedScraped, normalizedBrand),
      palette: this.calculatePaletteScore(normalizedScraped, normalizedBrand),
      usage: this.calculateColorUsageScore(normalizedScraped, normalizedBrand)
    };
    
    // Step 3: Calculate weighted overall score
    const overallScore = this.calculateWeightedColorScore(scores);
    
    console.log('🎨 Color analysis scores:', scores);
    console.log('🎨 Overall color score:', overallScore);
    
    return {
      score: overallScore,
      details: scores,
      issues: this.generateColorIssues(normalizedScraped, normalizedBrand, scores)
    };
  }

  normalizeScrapedColors(scrapedColors) {
    const normalized = {
      primary: this.extractPrimaryColor(scrapedColors),
      secondary: this.extractSecondaryColors(scrapedColors),
      palette: this.normalizeColorArray(scrapedColors.palette || []),
      allColors: this.normalizeColorArray(scrapedColors.palette || [])
    };
    
    // Add any additional color categories
    if (scrapedColors.accent) {
      normalized.accent = this.normalizeColorArray(
        Array.isArray(scrapedColors.accent) ? scrapedColors.accent : [scrapedColors.accent]
      );
    }
    
    return normalized;
  }

  normalizeBrandColors(brandColors) {
    const normalized = {
      primary: null,
      secondary: [],
      palette: [],
      allColors: []
    };
    
    // Handle different brand color structures
    if (brandColors.primary) {
      normalized.primary = this.extractHexFromColorObject(brandColors.primary);
    }
    
    if (brandColors.secondary) {
      if (Array.isArray(brandColors.secondary)) {
        normalized.secondary = brandColors.secondary.map(color => 
          this.extractHexFromColorObject(color)
        ).filter(Boolean);
      } else {
        normalized.secondary = [this.extractHexFromColorObject(brandColors.secondary)];
      }
    }
    
    // Extract from palette
    if (brandColors.palette) {
      normalized.palette = this.normalizeColorArray(brandColors.palette);
    }
    
    // Extract from neutral array
    if (brandColors.neutral && Array.isArray(brandColors.neutral)) {
      const neutralColors = brandColors.neutral.map(color => 
        this.extractHexFromColorObject(color)
      ).filter(Boolean);
      normalized.palette.push(...neutralColors);
    }
    
    // Remove duplicates and create allColors
    normalized.palette = [...new Set(normalized.palette)];
    normalized.allColors = [
      normalized.primary,
      ...normalized.secondary,
      ...normalized.palette
    ].filter(Boolean);
    
    return normalized;
  }

  extractHexFromColorObject(colorObj) {
    if (!colorObj) return null;
    
    // Handle string colors
    if (typeof colorObj === 'string') {
      return this.normalizeColorToHex(colorObj);
    }
    
    // Handle object colors
    if (typeof colorObj === 'object') {
      if (colorObj.hex) {
        return this.normalizeColorToHex(colorObj.hex);
      }
      // Try to extract from any string property
      for (const key in colorObj) {
        if (typeof colorObj[key] === 'string' && colorObj[key].startsWith('#')) {
          return this.normalizeColorToHex(colorObj[key]);
        }
      }
    }
    
    return null;
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

  extractPrimaryColor(scrapedColors) {
    if (scrapedColors.primary) {
      return this.normalizeColorToHex(scrapedColors.primary);
    }
    
    // Fallback: use the most dominant color from palette
    if (scrapedColors.palette && scrapedColors.palette.length > 0) {
      return this.normalizeColorToHex(scrapedColors.palette[0]);
    }
    
    return null;
  }

  extractSecondaryColors(scrapedColors) {
    if (scrapedColors.secondary) {
      if (Array.isArray(scrapedColors.secondary)) {
        return scrapedColors.secondary.map(color => this.normalizeColorToHex(color)).filter(Boolean);
      }
      return [this.normalizeColorToHex(scrapedColors.secondary)];
    }
    
    // Fallback: use next colors from palette
    if (scrapedColors.palette && scrapedColors.palette.length > 1) {
      return scrapedColors.palette.slice(1, 3).map(color => this.normalizeColorToHex(color)).filter(Boolean);
    }
    
    return [];
  }

  calculatePrimaryColorScore(scraped, brand) {
    if (!brand.primary || !scraped.primary) return 0.5; // Neutral score if no primary defined
    
    const distance = this.colorDistance(scraped.primary, brand.primary);
    const similarity = 1 - Math.min(distance / this.colorTolerance, 1);
    
    return similarity;
  }

  calculateSecondaryColorScore(scraped, brand) {
    if (brand.secondary.length === 0 || scraped.secondary.length === 0) return 0.5;
    
    let totalScore = 0;
    let matches = 0;
    
    for (const brandColor of brand.secondary) {
      let bestMatch = 0;
      
      for (const scrapedColor of scraped.secondary) {
        const distance = this.colorDistance(scrapedColor, brandColor);
        const similarity = 1 - Math.min(distance / this.colorTolerance, 1);
        bestMatch = Math.max(bestMatch, similarity);
      }
      
      totalScore += bestMatch;
      if (bestMatch > 0.7) matches++;
    }
    
    const coverageScore = matches / brand.secondary.length;
    const similarityScore = totalScore / brand.secondary.length;
    
    return (coverageScore + similarityScore) / 2;
  }

  calculatePaletteScore(scraped, brand) {
    if (brand.palette.length === 0) return 0.5;
    
    let totalScore = 0;
    let brandColorsUsed = 0;
    
    for (const brandColor of brand.palette) {
      let bestMatch = 0;
      
      for (const scrapedColor of scraped.allColors) {
        const distance = this.colorDistance(scrapedColor, brandColor);
        const similarity = 1 - Math.min(distance / this.colorTolerance, 1);
        bestMatch = Math.max(bestMatch, similarity);
      }
      
      totalScore += bestMatch;
      if (bestMatch > 0.8) brandColorsUsed++;
    }
    
    const coverageScore = brandColorsUsed / brand.palette.length;
    const similarityScore = totalScore / brand.palette.length;
    
    return (coverageScore * 0.6 + similarityScore * 0.4);
  }

  calculateColorUsageScore(scraped, brand) {
    // Analyze if colors are used in appropriate contexts
    let usageScore = 0.5; // Default neutral score
    
    // Check if brand colors are actually being used
    const brandColorsInUse = brand.allColors.filter(brandColor => 
      scraped.allColors.some(scrapedColor => 
        this.colorDistance(scrapedColor, brandColor) < this.colorTolerance
      )
    ).length;
    
    const brandColorUsageRatio = brand.allColors.length > 0 ? 
      brandColorsInUse / brand.allColors.length : 0.5;
    
    // Check if non-brand colors are minimal (penalize excessive non-brand colors)
    const nonBrandColors = scraped.allColors.filter(scrapedColor => 
      !brand.allColors.some(brandColor => 
        this.colorDistance(scrapedColor, brandColor) < this.colorTolerance
      )
    ).length;
    
    const nonBrandColorRatio = scraped.allColors.length > 0 ? 
      nonBrandColors / scraped.allColors.length : 0;
    
    usageScore = (brandColorUsageRatio + (1 - nonBrandColorRatio)) / 2;
    
    return usageScore;
  }

  colorDistance(hex1, hex2) {
    if (!hex1 || !hex2) return 1;
    
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const rDiff = rgb1.r - rgb2.r;
    const gDiff = rgb1.g - rgb2.g;
    const bDiff = rgb1.b - rgb2.b;
    
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff) / 441.67; // Normalize to 0-1
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  calculateWeightedColorScore(scores) {
    const weights = {
      primary: 0.3,
      secondary: 0.25,
      palette: 0.3,
      usage: 0.15
    };
    
    return Object.keys(weights).reduce((total, key) => {
      return total + (scores[key] * weights[key]);
    }, 0);
  }

  generateColorIssues(scraped, brand, scores) {
    const issues = [];
    
    // Primary color issues
    if (scores.primary < 0.7) {
      if (brand.primary) {
        issues.push({
          category: 'colors',
          type: 'primary_color_mismatch',
          severity: scores.primary < 0.3 ? 'high' : 'medium',
          message: `Primary color should be ${brand.primary} but found ${scraped.primary || 'different colors'}`,
          suggestion: `Update primary color to use ${brand.primary}`
        });
      }
    }
    
    // Secondary color issues
    if (scores.secondary < 0.6) {
      issues.push({
        category: 'colors',
        type: 'secondary_colors_missing',
        severity: 'medium',
        message: 'Brand secondary colors are not being used sufficiently',
        suggestion: 'Incorporate more secondary brand colors into the design'
      });
    }
    
    // Palette usage issues
    if (scores.palette < 0.5) {
      issues.push({
        category: 'colors',
        type: 'brand_palette_underused',
        severity: 'medium',
        message: 'Brand color palette is not being fully utilized',
        suggestion: 'Use more colors from the official brand palette'
      });
    }
    
    return issues;
  }
}
