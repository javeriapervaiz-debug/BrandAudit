// @ts-nocheck
/**
 * Enhanced Spacing Extractor with Buffer-specific heuristics
 * Handles subtle spacing patterns and visual indicators
 */
export class EnhancedSpacingExtractor {
  constructor() {
    this.spacingPatterns = [
      // Direct spacing declarations
      { pattern: /(?:spacing|whitespace)[\s\S]{0,300}?(\d+(?:\.\d+)?)\s*(px|pt)/gi, type: 'general' },
      
      // Grid system patterns
      { pattern: /(\d+(?:\.\d+)?)\s*(?:pt|px)\s*(?:grid|system)/gi, type: 'grid' },
      { pattern: /grid\s*system[^.]*?(\d+(?:\.\d+)?)\s*(pt|px)/gi, type: 'grid' },
      
      // Base unit patterns
      { pattern: /base\s*unit[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi, type: 'base_unit' },
      { pattern: /unit[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi, type: 'base_unit' },
      
      // Gap patterns
      { pattern: /(?:section|content)\s*gap[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi, type: 'section_gap' },
      { pattern: /(?:component|element)\s*gap[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi, type: 'component_gap' },
      
      // Buffer-specific patterns
      { pattern: /x\s*x\s*x\s*x/g, type: 'buffer_whitespace' }, // The "x x x x" pattern
      { pattern: /clear space[^.]*?breath/gi, type: 'buffer_clearspace' },
    ];
  }

  /**
   * Extract spacing with enhanced context awareness
   */
  extractSpacingWithContext(text) {
    console.log('📏 Starting enhanced spacing extraction...');
    
    const spacingData = {
      grid: this.extractGridSystem(text),
      baseUnit: this.extractBaseUnit(text),
      sectionGap: this.extractSectionGap(text),
      componentGap: this.extractComponentGap(text),
      rules: this.extractSpacingRules(text)
    };

    // Apply Buffer-specific heuristics
    this.applyBufferSpecificSpacing(text, spacingData);
    
    console.log('📏 Final spacing extraction:', spacingData);
    return spacingData;
  }

  /**
   * Extract grid system information
   */
  extractGridSystem(text) {
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(pt|px)\s*grid/gi,
      /grid\s*system[^.]*?(\d+(?:\.\d+)?)\s*(pt|px)/gi,
      /8\s*pt\s*grid/gi  // Common grid size
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        const value = match[1] || '8'; // Default to 8 if not specified
        const unit = match[2] || 'pt';
        return `${value}${unit} grid`;
      }
    }

    return "8pt grid"; // Most common default
  }

  /**
   * Extract base unit information
   */
  extractBaseUnit(text) {
    const patterns = [
      /base\s*unit[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi,
      /unit[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi,
      /spacing[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        return `${match[1]}${match[2]}`;
      }
    }

    return "8px"; // Common default
  }

  /**
   * Extract section gap information
   */
  extractSectionGap(text) {
    const patterns = [
      /section\s*gap[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi,
      /content\s*gap[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi,
      /large\s*spacing[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        return `${match[1]}${match[2]}`;
      }
    }

    return "64px"; // Common default for sections
  }

  /**
   * Extract component gap information
   */
  extractComponentGap(text) {
    const patterns = [
      /component\s*gap[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi,
      /element\s*gap[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi,
      /medium\s*spacing[^.]*?(\d+(?:\.\d+)?)\s*(px|pt)/gi
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        return `${match[1]}${match[2]}`;
      }
    }

    return "24px"; // Common default for components
  }

  /**
   * Extract spacing rules and guidelines
   */
  extractSpacingRules(text) {
    const rules = [];
    const rulePatterns = [
      /(?:leave|provide)\s+space[^.]*?(?:logo|breath)/gi,
      /clear\s+space[^.]*?(?:required|necessary)/gi,
      /whitespace[^.]*?important/gi
    ];

    for (const pattern of rulePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        rules.push(...matches);
      }
    }

    return rules;
  }

  /**
   * Apply Buffer-specific spacing heuristics
   */
  applyBufferSpecificSpacing(text, spacingData) {
    // Buffer uses "x x x x" to indicate spacing - count occurrences
    const xPattern = /x\s*x\s*x\s*x/g;
    const xMatches = text.match(xPattern);
    
    if (xMatches && xMatches.length > 0) {
      spacingData.rules.push("Use consistent spacing as shown by 'x' markers");
    }

    // Look for Buffer's specific spacing mentions
    if (text.includes('clear space') && text.includes('breath')) {
      spacingData.rules.push("Maintain clear space around logo for breathing room");
    }

    // If no specific gaps found, use Buffer-appropriate defaults
    if (!spacingData.sectionGap || spacingData.sectionGap === "64px") {
      spacingData.sectionGap = "64px"; // Appropriate for brand guidelines
    }
    
    if (!spacingData.componentGap || spacingData.componentGap === "24px") {
      spacingData.componentGap = "24px"; // Appropriate for components
    }
  }

  /**
   * Extract all spacing patterns from text
   */
  extractAllSpacingPatterns(text) {
    const patterns = [];
    
    for (const { pattern, type } of this.spacingPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        patterns.push({
          value: match[0],
          type: type,
          position: match.index,
          groups: match.slice(1)
        });
      }
    }
    
    return patterns;
  }

  /**
   * Get context around a position
   */
  getContext(text, position, length = 100) {
    const start = Math.max(0, position - length);
    const end = Math.min(text.length, position + length);
    return text.substring(start, end);
  }
}
