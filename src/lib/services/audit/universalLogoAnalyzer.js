/**
 * Universal Logo Analyzer
 * Better rule checking and constraint validation
 */

export class UniversalLogoAnalyzer {
  constructor() {
    this.logoConfidenceThreshold = 0.6;
  }

  analyzeLogoUniversal(scrapedLogo, brandLogo) {
    console.log('🏷️ Starting universal logo analysis...');
    
    const issues = [];
    const strengths = [];
    
    // Presence analysis
    const presenceAnalysis = this.analyzeLogoPresence(scrapedLogo, brandLogo);
    issues.push(...presenceAnalysis.issues);
    if (presenceAnalysis.strength) strengths.push(presenceAnalysis.strength);
    
    // Size analysis
    const sizeAnalysis = this.analyzeLogoSize(scrapedLogo, brandLogo);
    issues.push(...sizeAnalysis.issues);
    
    // Placement analysis
    const placementAnalysis = this.analyzeLogoPlacement(scrapedLogo, brandLogo);
    issues.push(...placementAnalysis.issues);
    
    const score = this.calculateLogoScore(presenceAnalysis, sizeAnalysis, placementAnalysis);
    const confidence = scrapedLogo.confidence || 0.5;
    
    console.log('🏷️ Universal logo analysis complete:', {
      score: score,
      confidence: confidence,
      issues: issues.length
    });
    
    return {
      score,
      issues,
      strengths,
      confidence
    };
  }

  analyzeLogoPresence(scraped, brand) {
    const issues = [];
    let strength = null;
    
    if (!scraped.found) {
      issues.push({
        category: 'logo',
        type: 'logo_not_detected',
        severity: 'high',
        message: 'No logo detected on the webpage',
        suggestion: 'Add the official brand logo to the page'
      });
    } else {
      strength = 'Logo detected on page';
      
      if (scraped.confidence < this.logoConfidenceThreshold) {
        issues.push({
          category: 'logo',
          type: 'low_logo_confidence',
          severity: 'medium',
          message: 'Logo detection confidence is low',
          suggestion: 'Ensure logo is clear and properly sized'
        });
      }
    }
    
    return { issues, strength };
  }

  analyzeLogoSize(scraped, brand) {
    const issues = [];
    
    if (!scraped.found) return { issues };
    
    // Check minimum size requirements
    if (brand.minSize && scraped.width && scraped.height) {
      const minSize = this.parseSize(brand.minSize);
      const logoSize = Math.min(scraped.width, scraped.height);
      
      if (minSize && logoSize < minSize.value) {
        issues.push({
          category: 'logo',
          type: 'logo_too_small',
          severity: 'medium',
          message: `Logo size (${logoSize}px) is below minimum requirement (${minSize.value}${minSize.unit})`,
          suggestion: `Increase logo size to at least ${brand.minSize}`
        });
      }
    }
    
    // Check maximum size requirements
    if (brand.maxSize && scraped.width && scraped.height) {
      const maxSize = this.parseSize(brand.maxSize);
      const logoSize = Math.max(scraped.width, scraped.height);
      
      if (maxSize && logoSize > maxSize.value) {
        issues.push({
          category: 'logo',
          type: 'logo_too_large',
          severity: 'low',
          message: `Logo size (${logoSize}px) exceeds maximum requirement (${maxSize.value}${maxSize.unit})`,
          suggestion: `Reduce logo size to at most ${brand.maxSize}`
        });
      }
    }
    
    // Check aspect ratio
    if (brand.aspectRatio && scraped.width && scraped.height) {
      const actualRatio = (scraped.width / scraped.height).toFixed(2);
      if (!this.isAspectRatioSimilar(actualRatio, brand.aspectRatio)) {
        issues.push({
          category: 'logo',
          type: 'logo_distorted',
          severity: 'medium',
          message: `Logo aspect ratio (${actualRatio}) doesn't match brand requirement (${brand.aspectRatio})`,
          suggestion: 'Maintain correct logo aspect ratio'
        });
      }
    }
    
    return { issues };
  }

  analyzeLogoPlacement(scraped, brand) {
    const issues = [];
    
    if (!scraped.found) return { issues };
    
    // Check clear space requirements
    if (brand.clearSpace && scraped.clearspace) {
      const clearSpaceMatch = this.checkClearSpaceCompliance(scraped.clearspace, brand.clearSpace);
      if (!clearSpaceMatch) {
        issues.push({
          category: 'logo',
          type: 'clear_space_violation',
          severity: 'medium',
          message: 'Logo clear space requirements not met',
          suggestion: `Ensure ${brand.clearSpace} clear space around logo`
        });
      }
    }
    
    return { issues };
  }

  parseSize(sizeString) {
    if (!sizeString) return null;
    
    const match = sizeString.match(/(\d+)(px|pt|em|rem)/i);
    if (match) {
      return {
        value: parseInt(match[1]),
        unit: match[2].toLowerCase()
      };
    }
    
    return null;
  }

  isAspectRatioSimilar(ratio1, ratio2) {
    const [a1, b1] = ratio1.split(':').map(Number);
    const [a2, b2] = ratio2.split(':').map(Number);
    
    if (!a1 || !b1 || !a2 || !b2) return true; // Can't compare
    
    const computed1 = a1 / b1;
    const computed2 = a2 / b2;
    
    return Math.abs(computed1 - computed2) < 0.1; // 10% tolerance
  }

  checkClearSpaceCompliance(scrapedClearSpace, brandClearSpace) {
    // Simple check - in real implementation, you'd parse and compare actual measurements
    return scrapedClearSpace && brandClearSpace;
  }

  calculateLogoScore(presenceAnalysis, sizeAnalysis, placementAnalysis) {
    const weights = {
      presence: 0.5,
      size: 0.3,
      placement: 0.2
    };
    
    const presenceScore = presenceAnalysis.issues.length === 0 ? 1.0 : 0.3;
    const sizeScore = sizeAnalysis.issues.length === 0 ? 1.0 : 0.6;
    const placementScore = placementAnalysis.issues.length === 0 ? 1.0 : 0.7;
    
    return (presenceScore * weights.presence + 
            sizeScore * weights.size + 
            placementScore * weights.placement);
  }
}
