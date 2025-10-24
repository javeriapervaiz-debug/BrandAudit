/**
 * Enhanced Compliance Analyzer V2
 * Integrates all enhanced analyzers with proper object handling and tolerance
 */

import { EnhancedColorAnalyzer } from './enhancedColorAnalyzer.js';
import { EnhancedTypographyAnalyzer } from './enhancedTypographyAnalyzer.js';
import { EnhancedLogoAnalyzer } from './enhancedLogoAnalyzer.js';

export class EnhancedComplianceAnalyzerV2 {
  constructor() {
    this.colorAnalyzer = new EnhancedColorAnalyzer();
    this.typographyAnalyzer = new EnhancedTypographyAnalyzer();
    this.logoAnalyzer = new EnhancedLogoAnalyzer();
  }

  async analyzeCompliance(scrapedData, brandGuidelines) {
    console.log('🔍 Starting enhanced compliance analysis V2...');
    
    // Analyze each category
    const colorAnalysis = this.colorAnalyzer.analyzeColorCompliance(
      scrapedData.colors, 
      brandGuidelines.colors
    );
    
    const typographyAnalysis = this.typographyAnalyzer.analyzeTypographyCompliance(
      scrapedData.typography,
      brandGuidelines.typography
    );
    
    const logoAnalysis = this.logoAnalyzer.analyzeLogoCompliance(
      scrapedData.logo,
      brandGuidelines.logo
    );
    
    // Calculate overall score
    const categoryScores = {
      colors: colorAnalysis.score,
      typography: typographyAnalysis.score,
      logo: logoAnalysis.score
    };
    
    const overallScore = this.calculateOverallScore(categoryScores);
    
    // Generate comprehensive report
    const analysisResult = {
      overallScore,
      categoryScores,
      details: {
        colors: colorAnalysis,
        typography: typographyAnalysis,
        logo: logoAnalysis
      },
      allIssues: [
        ...colorAnalysis.issues,
        ...typographyAnalysis.issues,
        ...logoAnalysis.issues
      ],
      recommendations: this.generateRecommendations(categoryScores)
    };
    
    console.log('✅ Enhanced compliance analysis V2 complete');
    console.log('📊 Overall score:', overallScore);
    
    return analysisResult;
  }

  calculateOverallScore(categoryScores) {
    const weights = {
      colors: 0.4,
      typography: 0.35,
      logo: 0.25
    };
    
    return Object.keys(weights).reduce((total, category) => {
      return total + (categoryScores[category] * weights[category]);
    }, 0);
  }

  generateRecommendations(categoryScores) {
    const recommendations = [];
    
    if (categoryScores.colors < 0.7) {
      recommendations.push({
        priority: categoryScores.colors < 0.4 ? 'high' : 'medium',
        category: 'colors',
        message: 'Improve color compliance by using more brand colors',
        action: 'Review and update color scheme to match brand palette'
      });
    }
    
    if (categoryScores.typography < 0.7) {
      recommendations.push({
        priority: categoryScores.typography < 0.4 ? 'high' : 'medium',
        category: 'typography',
        message: 'Improve typography compliance',
        action: 'Update fonts to match brand typography guidelines'
      });
    }
    
    if (categoryScores.logo < 0.6) {
      recommendations.push({
        priority: 'high',
        category: 'logo',
        message: 'Address logo compliance issues',
        action: 'Ensure brand logo is present and follows usage rules'
      });
    }
    
    return recommendations;
  }
}
