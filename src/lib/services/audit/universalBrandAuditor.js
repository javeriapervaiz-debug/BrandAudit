/**
 * Universal Brand Auditor
 * Integrates all universal analyzers for comprehensive brand compliance analysis
 */

import { UniversalColorAnalyzer } from './universalColorAnalyzer.js';
import { UniversalFontAnalyzer } from './universalFontAnalyzer.js';
import { UniversalLogoAnalyzer } from './universalLogoAnalyzer.js';
import { UniversalLayoutAnalyzer } from './universalLayoutAnalyzer.js';
import { UniversalConfidenceScorer } from './universalConfidenceScorer.js';

export class UniversalBrandAuditor {
  constructor() {
    this.colorAnalyzer = new UniversalColorAnalyzer();
    this.fontAnalyzer = new UniversalFontAnalyzer();
    this.logoAnalyzer = new UniversalLogoAnalyzer();
    this.layoutAnalyzer = new UniversalLayoutAnalyzer();
    this.confidenceScorer = new UniversalConfidenceScorer();
  }

  async analyzeComplianceUniversal(scrapedData, brandGuidelines) {
    console.log('🔍 Starting universal brand compliance analysis...');
    
    // Run all analyses
    const colorAnalysis = this.colorAnalyzer.analyzeColorsUniversal(
      scrapedData.colors, 
      brandGuidelines.colors
    );
    
    const fontAnalysis = this.fontAnalyzer.analyzeFontsUniversal(
      scrapedData.typography,
      brandGuidelines.typography
    );
    
    const logoAnalysis = this.logoAnalyzer.analyzeLogoUniversal(
      scrapedData.logo,
      brandGuidelines.logo
    );
    
    const layoutAnalysis = this.layoutAnalyzer.analyzeLayoutUniversal(
      scrapedData.layout,
      brandGuidelines
    );
    
    // Calculate overall score
    const categoryScores = {
      colors: colorAnalysis.score,
      typography: fontAnalysis.score,
      logo: logoAnalysis.score,
      layout: layoutAnalysis.score
    };
    
    const overallScore = this.calculateUniversalScore(categoryScores);
    const overallConfidence = this.confidenceScorer.calculateOverallConfidence({
      colors: colorAnalysis,
      typography: fontAnalysis,
      logo: logoAnalysis,
      layout: layoutAnalysis
    });
    
    // Collect all issues
    const allIssues = [
      ...colorAnalysis.issues,
      ...fontAnalysis.issues,
      ...logoAnalysis.issues,
      ...layoutAnalysis.issues
    ];
    
    // Generate recommendations
    const recommendations = this.generateUniversalRecommendations(categoryScores, allIssues);
    
    const result = {
      overallScore,
      categoryScores,
      details: {
        colors: colorAnalysis,
        typography: fontAnalysis,
        logo: logoAnalysis,
        layout: layoutAnalysis
      },
      allIssues,
      recommendations,
      confidence: overallConfidence,
      summary: this.generateUniversalSummary(overallScore, categoryScores, allIssues)
    };
    
    console.log('✅ Universal brand compliance analysis complete:', {
      overallScore: (overallScore * 100).toFixed(1) + '%',
      confidence: (overallConfidence * 100).toFixed(1) + '%',
      issues: allIssues.length,
      recommendations: recommendations.length
    });
    
    return result;
  }

  calculateUniversalScore(categoryScores) {
    const weights = {
      colors: 0.3,
      typography: 0.3,
      logo: 0.25,
      layout: 0.15
    };
    
    return Object.keys(weights).reduce((total, category) => {
      return total + (categoryScores[category] * weights[category]);
    }, 0);
  }

  generateUniversalRecommendations(categoryScores, issues) {
    const recommendations = [];
    
    // Color recommendations
    if (categoryScores.colors < 0.7) {
      const colorIssues = issues.filter(issue => issue.category === 'colors');
      recommendations.push({
        priority: categoryScores.colors < 0.4 ? 'high' : 'medium',
        category: 'colors',
        message: 'Improve color compliance',
        action: this.getColorRecommendation(colorIssues),
        score: categoryScores.colors
      });
    }
    
    // Typography recommendations
    if (categoryScores.typography < 0.7) {
      const typographyIssues = issues.filter(issue => issue.category === 'typography');
      recommendations.push({
        priority: categoryScores.typography < 0.4 ? 'high' : 'medium',
        category: 'typography',
        message: 'Improve typography compliance',
        action: this.getTypographyRecommendation(typographyIssues),
        score: categoryScores.typography
      });
    }
    
    // Logo recommendations
    if (categoryScores.logo < 0.6) {
      const logoIssues = issues.filter(issue => issue.category === 'logo');
      recommendations.push({
        priority: 'high',
        category: 'logo',
        message: 'Address logo compliance issues',
        action: this.getLogoRecommendation(logoIssues),
        score: categoryScores.logo
      });
    }
    
    // Layout recommendations
    if (categoryScores.layout < 0.6) {
      const layoutIssues = issues.filter(issue => issue.category === 'layout');
      recommendations.push({
        priority: 'medium',
        category: 'layout',
        message: 'Improve layout consistency',
        action: this.getLayoutRecommendation(layoutIssues),
        score: categoryScores.layout
      });
    }
    
    return recommendations;
  }

  getColorRecommendation(colorIssues) {
    if (colorIssues.some(issue => issue.type.includes('primary'))) {
      return 'Use the primary brand color more prominently';
    }
    if (colorIssues.some(issue => issue.type.includes('palette'))) {
      return 'Incorporate more colors from the brand palette';
    }
    return 'Review and update color scheme to match brand guidelines';
  }

  getTypographyRecommendation(typographyIssues) {
    if (typographyIssues.some(issue => issue.type.includes('primary'))) {
      return 'Update primary font to match brand guidelines';
    }
    if (typographyIssues.some(issue => issue.type.includes('weights'))) {
      return 'Use the recommended font weights';
    }
    return 'Update typography to match brand guidelines';
  }

  getLogoRecommendation(logoIssues) {
    if (logoIssues.some(issue => issue.type.includes('not_detected'))) {
      return 'Add the official brand logo to the page';
    }
    if (logoIssues.some(issue => issue.type.includes('size'))) {
      return 'Adjust logo size to meet brand requirements';
    }
    return 'Ensure logo follows brand usage guidelines';
  }

  getLayoutRecommendation(layoutIssues) {
    if (layoutIssues.some(issue => issue.type.includes('spacing'))) {
      return 'Use consistent spacing throughout the design';
    }
    if (layoutIssues.some(issue => issue.type.includes('hierarchy'))) {
      return 'Maintain proper heading hierarchy';
    }
    return 'Improve layout consistency and structure';
  }

  generateUniversalSummary(overallScore, categoryScores, issues) {
    const scorePercentage = Math.round(overallScore * 100);
    
    let status = 'Excellent';
    if (scorePercentage < 60) status = 'Needs Improvement';
    else if (scorePercentage < 80) status = 'Good';
    
    const topIssues = issues
      .filter(issue => issue.severity === 'high')
      .slice(0, 3)
      .map(issue => issue.message);
    
    const strengths = this.identifyStrengths(categoryScores, issues);
    
    return {
      status,
      score: scorePercentage,
      topIssues,
      strengths,
      overallMessage: this.getOverallMessage(scorePercentage, topIssues.length)
    };
  }

  identifyStrengths(categoryScores, issues) {
    const strengths = [];
    
    if (categoryScores.colors >= 0.8) {
      strengths.push('Excellent color compliance');
    }
    if (categoryScores.typography >= 0.8) {
      strengths.push('Great typography usage');
    }
    if (categoryScores.logo >= 0.8) {
      strengths.push('Logo properly implemented');
    }
    if (categoryScores.layout >= 0.8) {
      strengths.push('Good layout structure');
    }
    
    return strengths;
  }

  getOverallMessage(scorePercentage, criticalIssues) {
    if (scorePercentage >= 80) {
      return 'Your website demonstrates strong brand compliance. Keep up the excellent work!';
    } else if (scorePercentage >= 60) {
      return 'Good brand compliance overall. Address the key issues to improve further.';
    } else if (criticalIssues === 0) {
      return 'Brand compliance needs improvement. Focus on the main recommendations.';
    } else {
      return 'Significant brand compliance issues detected. Priority attention required.';
    }
  }
}
