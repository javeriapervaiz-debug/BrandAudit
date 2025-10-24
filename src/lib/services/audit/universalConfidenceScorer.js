/**
 * Universal Confidence Scorer
 * Calculates confidence scores for audit analysis
 */

export class UniversalConfidenceScorer {
  calculateOverallConfidence(analysisResults) {
    const categoryWeights = {
      colors: 0.3,
      typography: 0.3,
      logo: 0.2,
      layout: 0.2
    };
    
    let totalConfidence = 0;
    let totalWeight = 0;
    
    Object.entries(categoryWeights).forEach(([category, weight]) => {
      const categoryAnalysis = analysisResults[category];
      if (categoryAnalysis && categoryAnalysis.confidence !== undefined) {
        totalConfidence += categoryAnalysis.confidence * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? totalConfidence / totalWeight : 0.5;
  }

  calculateCategoryConfidence(scrapedData, brandData, dataType) {
    const scrapedCount = this.countDataPoints(scrapedData, dataType);
    const brandCount = this.countDataPoints(brandData, dataType);
    
    if (brandCount === 0) return 0.5; // Neutral if no brand data
    
    const coverage = Math.min(scrapedCount / brandCount, 1);
    const quality = this.assessDataQuality(scrapedData, dataType);
    
    return (coverage * 0.6 + quality * 0.4);
  }

  countDataPoints(data, dataType) {
    if (!data) return 0;
    
    switch(dataType) {
      case 'colors':
        if (data.palette && Array.isArray(data.palette)) {
          return data.palette.length;
        }
        if (data.allColors && data.allColors.size) {
          return data.allColors.size;
        }
        return 0;
        
      case 'typography':
        if (data.allFonts && data.allFonts.size) {
          return data.allFonts.size;
        }
        if (data.fonts && Array.isArray(data.fonts)) {
          return data.fonts.length;
        }
        return 0;
        
      case 'logo':
        return data.found ? 1 : 0;
        
      case 'layout':
        if (data.components && Array.isArray(data.components)) {
          return data.components.length;
        }
        return 0;
        
      default:
        return 0;
    }
  }

  assessDataQuality(scrapedData, dataType) {
    if (!scrapedData) return 0.2;
    
    switch(dataType) {
      case 'colors':
        // Check if colors are properly formatted
        if (scrapedData.palette && Array.isArray(scrapedData.palette)) {
          const validColors = scrapedData.palette.filter(color => 
            typeof color === 'string' && (color.startsWith('#') || color.startsWith('rgb'))
          );
          return validColors.length / scrapedData.palette.length;
        }
        return 0.5;
        
      case 'typography':
        // Check if fonts are properly detected
        if (scrapedData.allFonts && scrapedData.allFonts.size > 0) {
          return 0.8;
        }
        if (scrapedData.fonts && Array.isArray(scrapedData.fonts) && scrapedData.fonts.length > 0) {
          return 0.7;
        }
        return 0.3;
        
      case 'logo':
        // Check logo detection confidence
        if (scrapedData.found && scrapedData.confidence) {
          return scrapedData.confidence;
        }
        return scrapedData.found ? 0.6 : 0.2;
        
      case 'layout':
        // Check component variety and structure
        if (scrapedData.components && Array.isArray(scrapedData.components)) {
          const componentTypes = new Set(scrapedData.components.map(c => c.type));
          return Math.min(componentTypes.size / 5, 1); // More types = better quality
        }
        return 0.3;
        
      default:
        return 0.5;
    }
  }

  calculateAnalysisReliability(analysisResults) {
    const reliabilityFactors = [];
    
    // Check if all major categories were analyzed
    const analyzedCategories = Object.keys(analysisResults).filter(category => 
      analysisResults[category] && analysisResults[category].score !== undefined
    );
    
    reliabilityFactors.push(analyzedCategories.length / 4); // 4 main categories
    
    // Check confidence scores
    const confidenceScores = analyzedCategories.map(category => 
      analysisResults[category].confidence || 0.5
    );
    
    if (confidenceScores.length > 0) {
      const avgConfidence = confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length;
      reliabilityFactors.push(avgConfidence);
    }
    
    // Check for sufficient data
    const hasEnoughData = analyzedCategories.some(category => {
      const analysis = analysisResults[category];
      return analysis && analysis.details && Object.keys(analysis.details).length > 0;
    });
    
    reliabilityFactors.push(hasEnoughData ? 1 : 0.5);
    
    return reliabilityFactors.reduce((sum, factor) => sum + factor, 0) / reliabilityFactors.length;
  }
}
