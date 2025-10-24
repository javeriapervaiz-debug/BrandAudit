// @ts-nocheck
/**
 * Enhanced Text Preprocessor for Brand Guideline Extraction
 * Handles ConvertAPI artifacts and improves text structure
 */
export class EnhancedTextPreprocessor {
  constructor() {
    this.sectionHeaders = [
      'colors', 'typography', 'fonts', 'logo', 'spacing', 
      'whitespace', 'brand', 'guidelines', 'primary', 'secondary',
      'color', 'font', 'logo usage', 'brand guidelines'
    ];
    
    this.fontWhitelist = this.loadGoogleFontsList();
  }

  loadGoogleFontsList() {
    return new Set([
      'poppins', 'roboto', 'inter', 'helvetica', 'arial', 'circular',
      'sf pro', 'segoe ui', 'open sans', 'lato', 'montserrat', 
      'futura', 'gill sans', 'myriad pro', 'din', 'avenir',
      'source sans pro', 'nunito', 'oswald', 'roboto condensed',
      'ubuntu', 'merriweather', 'playfair display', 'pt sans', 'noto sans',
      'tahoma', 'verdana', 'georgia', 'times new roman', 'courier new',
      'impact', 'trebuchet ms', 'comic sans ms', 'proxima nova'
    ]);
  }

  /**
   * Main preprocessing pipeline
   */
  deepCleanText(rawText) {
    console.log('🧹 Starting enhanced text preprocessing...');
    
    // Stage 1: Basic cleaning
    let text = this.removeConvertAPIArtifacts(rawText);
    
    // Stage 2: Structure detection
    text = this.enhanceSectionDetection(text);
    
    // Stage 3: Semantic grouping
    text = this.groupRelatedContent(text);
    
    console.log('✅ Enhanced text preprocessing completed');
    return text;
  }

  /**
   * Remove ConvertAPI-specific artifacts and noise
   */
  removeConvertAPIArtifacts(text) {
    console.log('🧹 Removing ConvertAPI artifacts...');
    
    // Remove common artifacts
    const artifacts = [
      /ï»¿/g,  // BOM marker
      /===+/g,  // Separator lines
      /\x00/g,  // Null bytes
      /â\x80¢/g, // Special characters
      /\uf0b7/g, // Bullet artifacts
      /\u2022/g, // Bullet points
      /\u2013/g, // En dash
      /\u2014/g, // Em dash
      /\u2018/g, // Left single quote
      /\u2019/g, // Right single quote
      /\u201c/g, // Left double quote
      /\u201d/g, // Right double quote
    ];
    
    for (const pattern of artifacts) {
      text = text.replace(pattern, '');
    }
    
    // Fix encoding issues
    try {
      text = text.encode('utf-8', 'ignore').decode('utf-8');
    } catch (e) {
      // Handle encoding issues gracefully
      text = text.replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII characters
    }
    
    // Normalize whitespace but preserve meaningful line breaks
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n\s*\n/g, '\n\n');
    
    return text.trim();
  }

  /**
   * Detect and mark sections for better parsing
   */
  enhanceSectionDetection(text) {
    console.log('🔍 Enhancing section detection...');
    
    const lines = text.split('\n');
    const enhancedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineClean = line.trim().toLowerCase();
      
      // Detect section headers
      if (this.isSectionHeader(line, lineClean)) {
        enhancedLines.push(`@@SECTION:${line.trim()}@@`);
        continue;
      }
      
      // Detect color sections
      if (this.isColorLine(line, lineClean)) {
        enhancedLines.push(`@@COLOR_LINE:${line.trim()}@@`);
        continue;
      }
      
      // Detect font sections
      if (this.isFontLine(line, lineClean)) {
        enhancedLines.push(`@@FONT_LINE:${line.trim()}@@`);
        continue;
      }
      
      // Detect logo sections
      if (this.isLogoLine(line, lineClean)) {
        enhancedLines.push(`@@LOGO_LINE:${line.trim()}@@`);
        continue;
      }
      
      enhancedLines.push(line);
    }
    
    return enhancedLines.join('\n');
  }

  isSectionHeader(line, lineClean) {
    // Check if line is likely a section header
    if (lineClean.length > 50) return false;
    
    // Check for section header keywords
    const hasSectionKeyword = this.sectionHeaders.some(header => 
      lineClean.includes(header)
    );
    
    // Check for common header patterns
    const isAllCaps = lineClean === lineClean.toUpperCase() && lineClean.length > 3;
    const isNumbered = /^\d+\.?\s+/.test(lineClean);
    const hasColon = lineClean.endsWith(':');
    
    return hasSectionKeyword && (isAllCaps || isNumbered || hasColon);
  }

  isColorLine(line, lineClean) {
    const colorIndicators = [
      /#[0-9A-Fa-f]{3,6}/,
      /rgb\(/,
      /primary color/i,
      /secondary color/i,
      /black.*#/i,
      /white.*#/i,
      /blue.*#/i,
      /red.*#/i,
      /green.*#/i,
      /yellow.*#/i,
      /purple.*#/i,
      /orange.*#/i
    ];
    
    return colorIndicators.some(pattern => pattern.test(line));
  }

  isFontLine(line, lineClean) {
    const fontIndicators = [
      /font.*family/i,
      /typeface/i,
      /heading.*font/i,
      /body.*text.*font/i,
      /poppins/i,
      /roboto/i,
      /helvetica/i,
      /arial/i,
      /inter/i,
      /montserrat/i
    ];
    
    return fontIndicators.some(pattern => pattern.test(line));
  }

  isLogoLine(line, lineClean) {
    const logoIndicators = [
      /logo/i,
      /logotype/i,
      /brandmark/i,
      /clear space/i,
      /minimum size/i,
      /logo usage/i,
      /logo do/i,
      /logo don/i
    ];
    
    return logoIndicators.some(pattern => pattern.test(line));
  }

  /**
   * Group related content together for context preservation
   */
  groupRelatedContent(text) {
    console.log('🔗 Grouping related content...');
    
    const sections = text.split('@@SECTION:');
    const groupedSections = [];
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      if (section.startsWith('@@')) {
        // This is a marked section, process its content
        const lines = section.split('\n');
        const groupedLines = [];
        let currentGroup = [];
        
        for (const line of lines) {
          if (line.startsWith('@@') && currentGroup.length > 0) {
            // End current group
            groupedLines.push(currentGroup.join(' || '));
            currentGroup = [line];
          } else {
            currentGroup.push(line);
          }
        }
        
        if (currentGroup.length > 0) {
          groupedLines.push(currentGroup.join(' || '));
        }
        
        groupedSections.push(groupedLines.join('\n'));
      } else {
        groupedSections.push(section);
      }
    }
    
    return groupedSections.join('\n');
  }

  /**
   * Get context window around a position
   */
  getContextWindow(text, position, windowSize = 200) {
    const start = Math.max(0, position - windowSize);
    const end = Math.min(text.length, position + windowSize);
    return text.substring(start, end);
  }

  /**
   * Check if font name is in whitelist
   */
  isFontInWhitelist(fontName) {
    const fontLower = fontName.toLowerCase();
    return Array.from(this.fontWhitelist).some(font => 
      fontLower.includes(font) || font.includes(fontLower)
    );
  }
}
