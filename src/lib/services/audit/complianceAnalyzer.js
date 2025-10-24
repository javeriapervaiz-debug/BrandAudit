import { scrapedDataRepository } from '../../repositories/scrapedDataRepository.js';

export class ComplianceAnalyzer {
  constructor() {
    this.tolerance = {
      color: 0.1, // 10% tolerance for color matching
      fontSize: 0.05, // 5% tolerance for font size
      spacing: 0.1 // 10% tolerance for spacing
    };
  }

  /**
   * Analyze compliance between scraped webpage data and brand guidelines
   */
  async analyzeCompliance(scrapedData, brandGuidelines) {
    console.log('🔍 Analyzing compliance between scraped data and brand guidelines...');
    
    const analysis = {
      overallScore: 0,
      categoryScores: {
        colors: 0,
        typography: 0,
        logo: 0,
        layout: 0,
        imagery: 0
      },
      issues: [],
      recommendations: [],
      confidence: 0
    };

    // Analyze each category
    analysis.categoryScores.colors = await this.analyzeColorCompliance(scrapedData.colors, brandGuidelines.colors);
    analysis.categoryScores.typography = await this.analyzeTypographyCompliance(scrapedData.typography, brandGuidelines.typography);
    analysis.categoryScores.logo = await this.analyzeLogoCompliance(scrapedData.logo, brandGuidelines.logo);
    analysis.categoryScores.layout = await this.analyzeLayoutCompliance(scrapedData.layout, brandGuidelines.spacing);
    analysis.categoryScores.imagery = await this.analyzeImageryCompliance(scrapedData.imagery, brandGuidelines.imagery);

    // Calculate overall score
    const scores = Object.values(analysis.categoryScores);
    analysis.overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    // Calculate confidence
    analysis.confidence = this.calculateConfidence(scrapedData, brandGuidelines);

    console.log(`✅ Compliance analysis complete - Overall Score: ${(analysis.overallScore * 100).toFixed(1)}%`);
    return analysis;
  }

  /**
   * Analyze color compliance
   */
  async analyzeColorCompliance(scrapedColors, brandColors) {
    if (!scrapedColors || !brandColors) return 0;

    let score = 0;
    let checks = 0;

    // Check primary color usage
    if (brandColors.primary && scrapedColors.primary) {
      const primaryMatch = this.compareColors(brandColors.primary, scrapedColors.primary);
      score += primaryMatch ? 1 : 0;
      checks++;

      if (!primaryMatch) {
        this.addIssue('color', 'high', 
          `Primary color mismatch. Expected: ${brandColors.primary}, Found: ${scrapedColors.primary}`,
          'Use the correct primary color from brand guidelines',
          brandColors.primary,
          scrapedColors.primary
        );
      }
    }

    // Check color palette compliance
    if (brandColors.palette && scrapedColors.palette) {
      const paletteCompliance = this.checkColorPaletteCompliance(brandColors.palette, scrapedColors.palette);
      score += paletteCompliance;
      checks++;

      if (paletteCompliance < 0.5) {
        this.addIssue('color', 'medium',
          'Color palette not following brand guidelines',
          'Use only approved colors from the brand palette',
          brandColors.palette.join(', '),
          scrapedColors.palette.join(', ')
        );
      }
    }

    // Check for unauthorized colors
    if (brandColors.palette && scrapedColors.palette) {
      const unauthorizedColors = this.findUnauthorizedColors(brandColors.palette, scrapedColors.palette);
      if (unauthorizedColors.length > 0) {
        this.addIssue('color', 'medium',
          `Unauthorized colors detected: ${unauthorizedColors.join(', ')}`,
          'Remove unauthorized colors and use only brand-approved colors',
          brandColors.palette.join(', '),
          unauthorizedColors.join(', ')
        );
      }
    }

    return checks > 0 ? score / checks : 0;
  }

  /**
   * Analyze typography compliance
   */
  async analyzeTypographyCompliance(scrapedTypography, brandTypography) {
    if (!scrapedTypography || !brandTypography) return 0;

    let score = 0;
    let checks = 0;

    // Check primary font
    if (brandTypography.primaryFont && scrapedTypography.primaryFont) {
      const fontMatch = this.compareFonts(brandTypography.primaryFont, scrapedTypography.primaryFont);
      score += fontMatch ? 1 : 0;
      checks++;

      if (!fontMatch) {
        this.addIssue('typography', 'high',
          `Primary font mismatch. Expected: ${brandTypography.primaryFont}, Found: ${scrapedTypography.primaryFont}`,
          'Use the correct primary font from brand guidelines',
          brandTypography.primaryFont,
          scrapedTypography.primaryFont
        );
      }
    }

    // Check font hierarchy
    if (brandTypography.hierarchy && scrapedTypography.hierarchy) {
      const hierarchyCompliance = this.checkFontHierarchyCompliance(brandTypography.hierarchy, scrapedTypography.hierarchy);
      score += hierarchyCompliance;
      checks++;
    }

    // Check font weights
    if (brandTypography.weights && scrapedTypography.fontWeights) {
      const weightCompliance = this.checkFontWeightCompliance(brandTypography.weights, scrapedTypography.fontWeights);
      score += weightCompliance;
      checks++;
    }

    return checks > 0 ? score / checks : 0;
  }

  /**
   * Analyze logo compliance
   */
  async analyzeLogoCompliance(scrapedLogo, brandLogo) {
    if (!scrapedLogo || !brandLogo) return 0;

    let score = 0;
    let checks = 0;

    // Check if logo is present
    if (scrapedLogo.found) {
      score += 1;
      checks++;

      // Check logo sizing (if guidelines specify)
      if (brandLogo.minDigitalSize && scrapedLogo.width) {
        const sizeCompliance = this.checkLogoSizeCompliance(brandLogo.minDigitalSize, scrapedLogo.width);
        score += sizeCompliance;
        checks++;

        if (sizeCompliance < 0.5) {
          this.addIssue('logo', 'medium',
            `Logo size below minimum requirement. Expected: ${brandLogo.minDigitalSize}, Found: ${scrapedLogo.width}px`,
            'Increase logo size to meet brand guidelines',
            brandLogo.minDigitalSize,
            `${scrapedLogo.width}px`
          );
        }
      }

      // Check logo positioning
      if (scrapedLogo.position) {
        const positionCompliance = this.checkLogoPositionCompliance(scrapedLogo.position);
        score += positionCompliance;
        checks++;
      }
    } else {
      this.addIssue('logo', 'high',
        'Logo not found on webpage',
        'Add the brand logo to the webpage',
        'Brand logo should be present',
        'No logo detected'
      );
    }

    return checks > 0 ? score / checks : 0;
  }

  /**
   * Analyze layout compliance
   */
  async analyzeLayoutCompliance(scrapedLayout, brandSpacing) {
    if (!scrapedLayout || !brandSpacing) return 0;

    let score = 0;
    let checks = 0;

    // Check spacing consistency
    if (brandSpacing.rules && scrapedLayout.spacing) {
      const spacingCompliance = this.checkSpacingCompliance(brandSpacing.rules, scrapedLayout.spacing);
      score += spacingCompliance;
      checks++;
    }

    // Check max width compliance
    if (brandSpacing.maxWidth && scrapedLayout.maxWidth) {
      const widthCompliance = this.checkMaxWidthCompliance(brandSpacing.maxWidth, scrapedLayout.maxWidth);
      score += widthCompliance;
      checks++;
    }

    return checks > 0 ? score / checks : 0.5; // Default to 0.5 if no specific checks
  }

  /**
   * Analyze imagery compliance
   */
  async analyzeImageryCompliance(scrapedImagery, brandImagery) {
    if (!scrapedImagery || !brandImagery) return 0;

    let score = 0;
    let checks = 0;

    // Check image quality
    if (scrapedImagery.averageSize) {
      const qualityScore = this.checkImageQuality(scrapedImagery.averageSize);
      score += qualityScore;
      checks++;
    }

    // Check alt text usage
    if (scrapedImagery.altTexts) {
      const altTextScore = this.checkAltTextUsage(scrapedImagery.altTexts, scrapedImagery.imageCount);
      score += altTextScore;
      checks++;
    }

    return checks > 0 ? score / checks : 0.5; // Default to 0.5 if no specific checks
  }

  /**
   * Compare two colors for similarity
   */
  compareColors(color1, color2) {
    if (!color1 || !color2) return false;
    
    // Convert to RGB for comparison
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return false;

    // Calculate color distance
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );

    // Consider colors similar if distance is less than 30 (out of 441 max)
    return distance < 30;
  }

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Compare fonts for similarity
   */
  compareFonts(font1, font2) {
    if (!font1 || !font2) return false;
    
    // Normalize font names
    const normalize = (font) => font.toLowerCase().replace(/['"]/g, '').trim();
    
    return normalize(font1) === normalize(font2);
  }

  /**
   * Check color palette compliance
   */
  checkColorPaletteCompliance(brandPalette, scrapedPalette) {
    if (!brandPalette || !scrapedPalette) return 0;

    let matches = 0;
    for (const brandColor of brandPalette) {
      for (const scrapedColor of scrapedPalette) {
        if (this.compareColors(brandColor, scrapedColor)) {
          matches++;
          break;
        }
      }
    }

    return matches / brandPalette.length;
  }

  /**
   * Find unauthorized colors
   */
  findUnauthorizedColors(brandPalette, scrapedPalette) {
    if (!brandPalette || !scrapedPalette) return [];

    const unauthorized = [];
    for (const scrapedColor of scrapedPalette) {
      let isAuthorized = false;
      for (const brandColor of brandPalette) {
        if (this.compareColors(brandColor, scrapedColor)) {
          isAuthorized = true;
          break;
        }
      }
      if (!isAuthorized) {
        unauthorized.push(scrapedColor);
      }
    }

    return unauthorized;
  }

  /**
   * Check font hierarchy compliance
   */
  checkFontHierarchyCompliance(brandHierarchy, scrapedHierarchy) {
    // This would need more sophisticated logic based on specific hierarchy rules
    return 0.5; // Placeholder
  }

  /**
   * Check font weight compliance
   */
  checkFontWeightCompliance(brandWeights, scrapedWeights) {
    if (!brandWeights || !scrapedWeights) return 0;

    let matches = 0;
    for (const brandWeight of brandWeights) {
      if (scrapedWeights.includes(brandWeight)) {
        matches++;
      }
    }

    return matches / brandWeights.length;
  }

  /**
   * Check logo size compliance
   */
  checkLogoSizeCompliance(minSize, actualSize) {
    const minSizeNum = parseInt(minSize.replace(/\D/g, ''));
    return actualSize >= minSizeNum ? 1 : actualSize / minSizeNum;
  }

  /**
   * Check logo position compliance
   */
  checkLogoPositionCompliance(position) {
    // Check if logo is in header/top area
    return position.top < 200 ? 1 : 0.5;
  }

  /**
   * Check spacing compliance
   */
  checkSpacingCompliance(brandRules, scrapedSpacing) {
    // This would need more sophisticated logic based on specific spacing rules
    return 0.5; // Placeholder
  }

  /**
   * Check max width compliance
   */
  checkMaxWidthCompliance(brandMaxWidth, actualMaxWidth) {
    // This would need more sophisticated logic
    return 0.5; // Placeholder
  }

  /**
   * Check image quality
   */
  checkImageQuality(averageSize) {
    // Consider images good quality if average size is above 10000 pixels
    return averageSize > 10000 ? 1 : averageSize / 10000;
  }

  /**
   * Check alt text usage
   */
  checkAltTextUsage(altTexts, imageCount) {
    if (imageCount === 0) return 1;
    return altTexts.length / imageCount;
  }

  /**
   * Add compliance issue
   */
  addIssue(type, severity, description, recommendation, expected, actual) {
    this.issues = this.issues || [];
    this.issues.push({
      type,
      severity,
      description,
      recommendation,
      expected,
      actual,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.categoryScores.colors < 0.7) {
      recommendations.push({
        category: 'colors',
        priority: 'high',
        message: 'Improve color compliance by using brand-approved colors consistently'
      });
    }

    if (analysis.categoryScores.typography < 0.7) {
      recommendations.push({
        category: 'typography',
        priority: 'high',
        message: 'Update typography to match brand guidelines'
      });
    }

    if (analysis.categoryScores.logo < 0.7) {
      recommendations.push({
        category: 'logo',
        priority: 'high',
        message: 'Ensure logo is properly displayed and sized according to guidelines'
      });
    }

    return recommendations;
  }

  /**
   * Calculate analysis confidence
   */
  calculateConfidence(scrapedData, brandGuidelines) {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on data completeness
    if (scrapedData.colors && scrapedData.colors.palette?.length > 0) confidence += 0.1;
    if (scrapedData.typography && scrapedData.typography.fonts?.length > 0) confidence += 0.1;
    if (scrapedData.logo && scrapedData.logo.found) confidence += 0.1;
    if (scrapedData.layout) confidence += 0.1;
    if (scrapedData.imagery && scrapedData.imagery.imageCount > 0) confidence += 0.1;

    return Math.min(confidence, 1);
  }
}

// Export singleton instance
export const complianceAnalyzer = new ComplianceAnalyzer();
