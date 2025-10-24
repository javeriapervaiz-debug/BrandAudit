/**
 * Universal Layout Analyzer
 * Analyzes spacing, hierarchy, and grid systems
 */

export class UniversalLayoutAnalyzer {
  analyzeLayoutUniversal(scrapedLayout, brandGuidelines) {
    console.log('📐 Starting universal layout analysis...');
    
    const issues = [];
    
    // Component spacing analysis
    const spacingIssues = this.analyzeComponentSpacing(scrapedLayout?.components || []);
    issues.push(...spacingIssues);
    
    // Visual hierarchy analysis
    const hierarchyIssues = this.analyzeVisualHierarchy(scrapedLayout?.components || []);
    issues.push(...hierarchyIssues);
    
    // Grid system analysis
    const gridIssues = this.analyzeGridSystem(scrapedLayout, brandGuidelines?.spacing);
    issues.push(...gridIssues);
    
    const score = this.calculateLayoutScore(issues);
    const strengths = this.identifyLayoutStrengths(scrapedLayout);
    
    console.log('📐 Universal layout analysis complete:', {
      score: score,
      issues: issues.length,
      strengths: strengths.length
    });
    
    return {
      score,
      issues,
      strengths
    };
  }

  analyzeComponentSpacing(components) {
    const issues = [];
    if (!components || !Array.isArray(components)) return issues;
    
    const spacingGroups = this.groupComponentsBySpacing(components);
    
    // Check for inconsistent spacing
    Object.entries(spacingGroups).forEach(([componentType, spacings]) => {
      const uniqueSpacings = [...new Set(spacings)];
      if (uniqueSpacings.length > 3) { // More than 3 different spacings
        issues.push({
          category: 'layout',
          type: 'inconsistent_spacing',
          severity: 'low',
          message: `Inconsistent spacing detected for ${componentType}`,
          suggestion: 'Use consistent spacing values for similar components'
        });
      }
    });
    
    return issues;
  }

  analyzeVisualHierarchy(components) {
    const issues = [];
    const headings = components.filter(c => c.type === 'heading');
    
    // Check heading hierarchy
    const headingLevels = headings.map(h => h.level).filter(Boolean);
    if (headingLevels.length > 0) {
      const maxLevel = Math.max(...headingLevels);
      const minLevel = Math.min(...headingLevels);
      
      // Check if hierarchy jumps levels (e.g., H1 directly to H3)
      const expectedLevels = Array.from({length: maxLevel - minLevel + 1}, (_, i) => minLevel + i);
      const missingLevels = expectedLevels.filter(level => !headingLevels.includes(level));
      
      if (missingLevels.length > 0) {
        issues.push({
          category: 'layout',
          type: 'heading_hierarchy_gap',
          severity: 'low',
          message: `Missing heading levels: H${missingLevels.join(', H')}`,
          suggestion: 'Maintain consistent heading hierarchy without skipping levels'
        });
      }
    }
    
    return issues;
  }

  analyzeGridSystem(scrapedLayout, brandSpacing) {
    const issues = [];
    
    if (!brandSpacing) return issues;
    
    // Check if brand has specific grid requirements
    if (brandSpacing.grid) {
      issues.push({
        category: 'layout',
        type: 'grid_system_guidance',
        severity: 'low',
        message: `Brand guidelines specify ${brandSpacing.grid} grid system`,
        suggestion: 'Consider implementing the recommended grid system'
      });
    }
    
    if (brandSpacing.baseUnit) {
      issues.push({
        category: 'layout',
        type: 'base_unit_guidance',
        severity: 'low',
        message: `Brand guidelines recommend ${brandSpacing.baseUnit} base unit`,
        suggestion: 'Consider using the recommended base unit for spacing'
      });
    }
    
    return issues;
  }

  groupComponentsBySpacing(components) {
    const groups = {};
    
    components.forEach(component => {
      const type = component.type || 'unknown';
      if (!groups[type]) groups[type] = [];
      
      // Extract spacing information from component styles
      if (component.styles) {
        const spacing = this.extractSpacingFromStyles(component.styles);
        if (spacing) {
          groups[type].push(spacing);
        }
      }
    });
    
    return groups;
  }

  extractSpacingFromStyles(styles) {
    // Extract margin and padding values
    const spacingValues = [];
    
    if (styles.margin) spacingValues.push(styles.margin);
    if (styles.padding) spacingValues.push(styles.padding);
    if (styles.marginTop) spacingValues.push(styles.marginTop);
    if (styles.marginBottom) spacingValues.push(styles.marginBottom);
    if (styles.paddingTop) spacingValues.push(styles.paddingTop);
    if (styles.paddingBottom) spacingValues.push(styles.paddingBottom);
    
    return spacingValues.length > 0 ? spacingValues.join(', ') : null;
  }

  calculateLayoutScore(issues) {
    // Base score starts at 0.8 (good layout)
    let score = 0.8;
    
    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 0.3;
          break;
        case 'medium':
          score -= 0.2;
          break;
        case 'low':
          score -= 0.1;
          break;
      }
    });
    
    return Math.max(score, 0.1); // Minimum score of 0.1
  }

  identifyLayoutStrengths(scrapedLayout) {
    const strengths = [];
    
    if (!scrapedLayout) return strengths;
    
    // Check for good component variety
    if (scrapedLayout.components && scrapedLayout.components.length > 5) {
      strengths.push('Good variety of components detected');
    }
    
    // Check for heading hierarchy
    const headings = scrapedLayout.components?.filter(c => c.type === 'heading') || [];
    if (headings.length > 2) {
      strengths.push('Multiple heading levels detected');
    }
    
    // Check for interactive elements
    const interactiveElements = scrapedLayout.components?.filter(c => 
      c.type === 'button' || c.type === 'link'
    ) || [];
    if (interactiveElements.length > 0) {
      strengths.push('Interactive elements detected');
    }
    
    return strengths;
  }
}
