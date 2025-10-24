// Specialized extractors for different brand guideline data types
import { 
  extractColorsWithContext, 
  extractTypographyWithContext, 
  extractLogoRulesWithContext,
  classifySection,
  normalizeKey,
  normalizeColorToHex
} from './brandSynonymMapper.js';

/**
 * Specialized color extractor with multiple pattern recognition
 */
export class ColorExtractor {
  constructor() {
    this.contextWindow = 300; // Increased context for better semantic understanding
  }

  extractFromText(text) {
    console.log('🎨 Extracting colors with specialized patterns...');
    
    const colors = extractColorsWithContext(text, this.contextWindow);
    const structured = this.structureColors(colors);
    
    console.log(`✅ Found ${structured.palette.length} colors`);
    return structured;
  }

  structureColors(rawColors) {
    const structured = {
      palette: [],
      primary: null,
      secondary: null,
      background: null,
      text: null,
      accent: null,
      rules: []
    };

    // Group colors by type
    const colorGroups = {
      primary: [],
      secondary: [],
      background: [],
      text: [],
      accent: [],
      general: []
    };

    rawColors.forEach(color => {
      const group = color.type || 'general';
      if (colorGroups[group]) {
        colorGroups[group].push(color);
      } else {
        colorGroups.general.push(color);
      }
    });

    // Assign to structured format
    if (colorGroups.primary.length > 0) {
      structured.primary = this.normalizeColorValue(colorGroups.primary[0].value);
    }
    if (colorGroups.secondary.length > 0) {
      structured.secondary = this.normalizeColorValue(colorGroups.secondary[0].value);
    }
    if (colorGroups.background.length > 0) {
      structured.background = this.normalizeColorValue(colorGroups.background[0].value);
    }
    if (colorGroups.text.length > 0) {
      structured.text = this.normalizeColorValue(colorGroups.text[0].value);
    }
    if (colorGroups.accent.length > 0) {
      structured.accent = this.normalizeColorValue(colorGroups.accent[0].value);
    }

    // Build palette from all colors
    const allColors = Object.values(colorGroups).flat();
    structured.palette = [...new Set(allColors.map(c => this.normalizeColorValue(c.value)))];

    // Extract color rules from context
    structured.rules = this.extractColorRules(rawColors);

    return structured;
  }

  normalizeColorValue(colorValue) {
    return normalizeColorToHex(colorValue);
  }

  extractColorRules(colors) {
    const rules = [];
    colors.forEach(color => {
      if (color.context) {
        // Look for usage rules in context
        const ruleMatch = color.context.match(/(?:use|apply|for)\s+([^.!?]+)/gi);
        if (ruleMatch && ruleMatch[0]) {
          rules.push(ruleMatch[0].trim());
        }
      }
    });
    return [...new Set(rules)];
  }
}

/**
 * Specialized typography extractor
 */
export class TypographyExtractor {
  constructor() {
    this.contextWindow = 300;
  }

  extractFromText(text) {
    console.log('🔤 Extracting typography with specialized patterns...');
    
    const typography = extractTypographyWithContext(text, this.contextWindow);
    const structured = this.structureTypography(typography, text);
    
    console.log(`✅ Found ${structured.fonts.length} fonts, ${structured.weights.length} weights`);
    return structured;
  }

  structureTypography(rawTypography, fullText) {
    const structured = {
      fonts: rawTypography.fonts,
      weights: rawTypography.weights,
      sizes: rawTypography.sizes,
      primaryFont: null,
      secondaryFont: null,
      rules: []
    };

    // Determine primary and secondary fonts from context
    const fontContexts = this.extractFontContexts(fullText);
    
    if (fontContexts.primary && rawTypography.fonts.includes(fontContexts.primary)) {
      structured.primaryFont = fontContexts.primary;
    } else if (rawTypography.fonts.length > 0) {
      structured.primaryFont = rawTypography.fonts[0];
    }

    if (fontContexts.secondary && rawTypography.fonts.includes(fontContexts.secondary)) {
      structured.secondaryFont = fontContexts.secondary;
    } else if (rawTypography.fonts.length > 1) {
      structured.secondaryFont = rawTypography.fonts[1];
    }

    // Extract typography rules
    structured.rules = this.extractTypographyRules(fullText);

    return structured;
  }

  extractFontContexts(text) {
    const contexts = { primary: null, secondary: null };
    
    // Look for primary font mentions
    const primaryMatch = text.match(/(?:primary|main|brand|core|key|signature)\s+(?:font|typeface):?\s*['"]?([A-Za-z0-9\s\-]+)['"]?/i);
    if (primaryMatch && primaryMatch[1]) {
      contexts.primary = primaryMatch[1].trim();
    }

    // Look for secondary font mentions
    const secondaryMatch = text.match(/(?:secondary|body|supporting|web|print)\s+(?:font|typeface):?\s*['"]?([A-Za-z0-9\s\-]+)['"]?/i);
    if (secondaryMatch && secondaryMatch[1]) {
      contexts.secondary = secondaryMatch[1].trim();
    }

    return contexts;
  }

  extractTypographyRules(text) {
    const rules = [];
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      if (/font|typeface|typography|weight|size/i.test(sentence)) {
        // Look for usage rules
        const ruleMatch = sentence.match(/(?:use|apply|for|in)\s+([^.!?]+)/gi);
        if (ruleMatch && ruleMatch[0]) {
          rules.push(ruleMatch[0].trim());
        }
      }
    });

    return [...new Set(rules)];
  }
}

/**
 * Specialized logo extractor
 */
export class LogoExtractor {
  constructor() {
    this.contextWindow = 300;
  }

  extractFromText(text) {
    console.log('🏷️ Extracting logo rules with specialized patterns...');
    
    const rules = extractLogoRulesWithContext(text, this.contextWindow);
    const structured = this.structureLogoRules(rules, text);
    
    console.log(`✅ Found ${structured.rules.length} logo rules`);
    return structured;
  }

  structureLogoRules(rawRules, fullText) {
    const structured = {
      rules: [],
      clearspace: null,
      minSize: null,
      forbidden: [],
      spacing: []
    };

    rawRules.forEach(rule => {
      if (rule.type === 'forbidden') {
        structured.forbidden.push(rule.rule);
      } else if (rule.type === 'spacing') {
        structured.spacing.push(rule.rule);
        if (!structured.clearspace) {
          structured.clearspace = rule.value;
        }
      } else if (rule.type === 'minSize') {
        structured.minSize = rule.value;
      }
      
      structured.rules.push(rule.rule);
    });

    // Extract additional logo rules from context
    const additionalRules = this.extractAdditionalLogoRules(fullText);
    structured.rules.push(...additionalRules);

    return structured;
  }

  extractAdditionalLogoRules(text) {
    const rules = [];
    const sentences = text.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      if (/logo|mark|symbol|wordmark/i.test(sentence)) {
        // Look for specific logo rules
        const rulePatterns = [
          /(?:always|must|should|never|do not|don't|avoid)\s+([^.!?]+)/gi,
          /(?:minimum|smallest|largest)\s+([^.!?]+)/gi,
          /(?:clear space|breathing room|white space)\s+([^.!?]+)/gi
        ];
        
        rulePatterns.forEach(pattern => {
          const matches = sentence.match(pattern);
          if (matches) {
            rules.push(...matches.filter(m => m).map(m => m.trim()));
          }
        });
      }
    });

    return [...new Set(rules)];
  }
}

/**
 * Specialized spacing extractor
 */
export class SpacingExtractor {
  constructor() {
    this.contextWindow = 200;
  }

  extractFromText(text) {
    console.log('📏 Extracting spacing rules...');
    
    const spacing = {
      rules: [],
      clearspace: null,
      margins: [],
      padding: [],
      grid: null
    };

    // Extract spacing rules
    const spacingPatterns = [
      /(?:clear space|breathing room|white space|minimum space)\s+(?:of\s*)?(\d+(?:\.\d+)?(?:px|em|rem|pt|%)?)/gi,
      /(?:margin|padding):\s*(\d+(?:\.\d+)?(?:px|em|rem|pt|%)?)/gi,
      /(?:grid|baseline|leading):\s*(\d+(?:\.\d+)?(?:px|em|rem|pt|%)?)/gi
    ];

    spacingPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const start = Math.max(0, match.index - this.contextWindow);
        const end = Math.min(text.length, match.index + match[0].length + this.contextWindow);
        const context = text.substring(start, end);
        
        if (pattern.source.includes('clear space')) {
          spacing.clearspace = match[1];
        } else if (pattern.source.includes('margin')) {
          spacing.margins.push(match[1]);
        } else if (pattern.source.includes('padding')) {
          spacing.padding.push(match[1]);
        } else if (pattern.source.includes('grid')) {
          spacing.grid = match[1];
        }
        
        if (context) {
          spacing.rules.push(context.trim());
        }
      }
    });

    console.log(`✅ Found ${spacing.rules.length} spacing rules`);
    return spacing;
  }
}

/**
 * Main specialized extraction coordinator
 */
export class SpecializedExtractionCoordinator {
  constructor() {
    this.colorExtractor = new ColorExtractor();
    this.typographyExtractor = new TypographyExtractor();
    this.logoExtractor = new LogoExtractor();
    this.spacingExtractor = new SpacingExtractor();
  }

  async extractFromSections(sections) {
    console.log('🔍 Running specialized extraction on sections...');
    
    let results = {
      colors: { palette: [], primary: null, secondary: null, background: null, text: null, accent: null, rules: [] },
      typography: { fonts: [], weights: [], sizes: [], primaryFont: null, secondaryFont: null, rules: [] },
      logo: { rules: [], clearspace: null, minSize: null, forbidden: [], spacing: [] },
      spacing: { rules: [], clearspace: null, margins: [], padding: [], grid: null }
    };

    // Process each section with appropriate extractor
    for (const [sectionName, sectionText] of Object.entries(sections)) {
      const sectionType = classifySection(sectionText);
      console.log(`📋 Processing ${sectionName} as ${sectionType}`);

      switch (sectionType) {
        case 'COLOR':
          const colors = this.colorExtractor.extractFromText(sectionText);
          this.mergeColorResults(results.colors, colors);
          break;
          
        case 'TYPOGRAPHY':
          const typography = this.typographyExtractor.extractFromText(sectionText);
          this.mergeTypographyResults(results.typography, typography);
          break;
          
        case 'LOGO':
          const logo = this.logoExtractor.extractFromText(sectionText);
          this.mergeLogoResults(results.logo, logo);
          break;
          
        case 'SPACING':
          const spacing = this.spacingExtractor.extractFromText(sectionText);
          this.mergeSpacingResults(results.spacing, spacing);
          break;
          
        default:
          // Try all extractors on general sections
          const generalColors = this.colorExtractor.extractFromText(sectionText);
          const generalTypography = this.typographyExtractor.extractFromText(sectionText);
          const generalLogo = this.logoExtractor.extractFromText(sectionText);
          const generalSpacing = this.spacingExtractor.extractFromText(sectionText);
          
          this.mergeColorResults(results.colors, generalColors);
          this.mergeTypographyResults(results.typography, generalTypography);
          this.mergeLogoResults(results.logo, generalLogo);
          this.mergeSpacingResults(results.spacing, generalSpacing);
      }
    }

    // Handle missing categories with general suggestions
    results = this.fillMissingCategories(results);
    
    return results;
  }

  /**
   * Fill missing categories with general suggestions
   */
  fillMissingCategories(results) {
    // If no colors found, add general color suggestions
    if (results.colors.palette.length === 0) {
      results.colors = {
        palette: ['#000000', '#FFFFFF', '#808080'],
        primary: '#000000',
        secondary: '#808080',
        background: '#FFFFFF',
        text: '#000000',
        accent: '#808080',
        rules: ['Use primary color for main elements', 'Use secondary color for accents', 'Ensure sufficient contrast']
      };
    }

    // If no typography found, add general font suggestions
    if (results.typography.fonts.length === 0) {
      results.typography = {
        fonts: ['Arial', 'Helvetica', 'sans-serif'],
        weights: ['Regular', 'Bold'],
        sizes: ['16px', '24px', '32px'],
        primaryFont: 'Arial',
        secondaryFont: 'Helvetica',
        rules: ['Use primary font for headings', 'Use secondary font for body text', 'Maintain consistent font hierarchy']
      };
    }

    // If no logo rules found, add general logo guidelines
    if (results.logo.rules.length === 0) {
      results.logo = {
        rules: ['Maintain clear space around logo', 'Do not distort or alter logo proportions', 'Use approved logo variations only'],
        clearspace: 'Minimum clear space equal to logo height',
        minSize: '24px minimum for digital use',
        forbidden: ['Do not distort logo', 'Do not change colors', 'Do not add effects'],
        spacing: ['Maintain clear space', 'Avoid busy backgrounds']
      };
    }

    // If no spacing found, add general spacing guidelines
    if (results.spacing.rules.length === 0) {
      results.spacing = {
        rules: ['Use consistent spacing throughout', 'Maintain visual hierarchy', 'Ensure adequate white space'],
        clearspace: 'Minimum 16px clear space',
        margins: ['24px', '32px'],
        padding: ['16px', '24px'],
        grid: '8px grid system'
      };
    }

    return results;
  }

  mergeColorResults(target, source) {
    if (source.palette) target.palette.push(...source.palette);
    if (source.primary) target.primary = source.primary;
    if (source.secondary) target.secondary = source.secondary;
    if (source.background) target.background = source.background;
    if (source.text) target.text = source.text;
    if (source.accent) target.accent = source.accent;
    if (source.rules) target.rules.push(...source.rules);
    
    // Deduplicate
    target.palette = [...new Set(target.palette)];
    target.rules = [...new Set(target.rules)];
  }

  mergeTypographyResults(target, source) {
    if (source.fonts) target.fonts.push(...source.fonts);
    if (source.weights) target.weights.push(...source.weights);
    if (source.sizes) target.sizes.push(...source.sizes);
    if (source.primaryFont) target.primaryFont = source.primaryFont;
    if (source.secondaryFont) target.secondaryFont = source.secondaryFont;
    if (source.rules) target.rules.push(...source.rules);
    
    // Deduplicate
    target.fonts = [...new Set(target.fonts)];
    target.weights = [...new Set(target.weights)];
    target.sizes = [...new Set(target.sizes)];
    target.rules = [...new Set(target.rules)];
  }

  mergeLogoResults(target, source) {
    if (source.rules) target.rules.push(...source.rules);
    if (source.clearspace) target.clearspace = source.clearspace;
    if (source.minSize) target.minSize = source.minSize;
    if (source.forbidden) target.forbidden.push(...source.forbidden);
    if (source.spacing) target.spacing.push(...source.spacing);
    
    // Deduplicate
    target.rules = [...new Set(target.rules)];
    target.forbidden = [...new Set(target.forbidden)];
    target.spacing = [...new Set(target.spacing)];
  }

  mergeSpacingResults(target, source) {
    if (source.rules) target.rules.push(...source.rules);
    if (source.clearspace) target.clearspace = source.clearspace;
    if (source.margins) target.margins.push(...source.margins);
    if (source.padding) target.padding.push(...source.padding);
    if (source.grid) target.grid = source.grid;
    
    // Deduplicate
    target.rules = [...new Set(target.rules)];
    target.margins = [...new Set(target.margins)];
    target.padding = [...new Set(target.padding)];
  }
}
