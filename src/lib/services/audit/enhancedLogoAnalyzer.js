/**
 * Enhanced Logo Analysis System
 * Better rule checking and constraint validation
 */

export class EnhancedLogoAnalyzer {
  analyzeLogoCompliance(scrapedLogo, brandLogo) {
    console.log('🏷️ Starting enhanced logo analysis...');
    
    const scores = {
      presence: this.calculatePresenceScore(scrapedLogo),
      rules: this.calculateRulesScore(scrapedLogo, brandLogo),
      constraints: this.calculateConstraintsScore(scrapedLogo, brandLogo)
    };
    
    const overallScore = this.calculateWeightedLogoScore(scores);
    
    console.log('🏷️ Logo analysis scores:', scores);
    console.log('🏷️ Overall logo score:', overallScore);
    
    return {
      score: overallScore,
      details: scores,
      issues: this.generateLogoIssues(scrapedLogo, brandLogo, scores)
    };
  }

  calculatePresenceScore(scrapedLogo) {
    if (scrapedLogo.found) return 1.0;
    if (scrapedLogo.confidence > 0.5) return 0.7;
    return 0.3;
  }

  calculateRulesScore(scrapedLogo, brandLogo) {
    if (!brandLogo.rules || brandLogo.rules.length === 0) return 0.5;
    
    // Simple check - in real implementation, you'd analyze each rule
    return scrapedLogo.found ? 0.8 : 0.2;
  }

  calculateConstraintsScore(scrapedLogo, brandLogo) {
    if (!brandLogo.constraints || brandLogo.constraints.length === 0) return 0.5;
    
    // Check if basic constraints are followed
    let constraintScore = 0.5;
    
    if (scrapedLogo.found) {
      // Basic constraint checks
      if (scrapedLogo.width && scrapedLogo.height) {
        constraintScore += 0.2;
      }
      if (scrapedLogo.clearspace) {
        constraintScore += 0.3;
      }
    }
    
    return Math.min(constraintScore, 1.0);
  }

  calculateWeightedLogoScore(scores) {
    const weights = {
      presence: 0.5,
      rules: 0.3,
      constraints: 0.2
    };
    
    return Object.keys(weights).reduce((total, key) => {
      return total + (scores[key] * weights[key]);
    }, 0);
  }

  generateLogoIssues(scrapedLogo, brandLogo, scores) {
    const issues = [];
    
    if (!scrapedLogo.found) {
      issues.push({
        category: 'logo',
        type: 'logo_missing',
        severity: 'high',
        message: 'Brand logo is not present on the page',
        suggestion: 'Add the official brand logo to the page'
      });
    }
    
    if (scores.rules < 0.5) {
      issues.push({
        category: 'logo',
        type: 'logo_rules_violation',
        severity: 'medium',
        message: 'Logo usage rules may not be fully followed',
        suggestion: 'Review and apply all logo usage rules from brand guidelines'
      });
    }
    
    return issues;
  }
}
