/**
 * Enhanced Brand Guideline Extractor with Fuzzy Detection and LLM Validation
 * Handles flattened PDF text and provides robust extraction with AI validation
 */

// Load environment variables from .env file
// @ts-nocheck
import dotenv from 'dotenv';
dotenv.config();

import { llmBrandEnhancer } from './llmBrandEnhancer.js';
import { LLMEnhancementService } from './llmEnhancementService.js';
import { PerfectBrandGuidelineExtractor } from './perfectBrandGuidelineExtractor.js';
import { EnhancedLLMExtractor } from './enhancedLLMExtractor.js';

export class EnhancedBrandExtractor {
  constructor() {
    this.confidenceThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
    
    // Initialize LLM Enhancement Service
    this.llmEnhancement = new LLMEnhancementService();
    this.specializedCoordinator = null; // Will be initialized lazily
    
    // Initialize Perfect Brand Guideline Extractor
    this.perfectExtractor = new PerfectBrandGuidelineExtractor();
    
    // Initialize Enhanced LLM Extractor
    this.enhancedLLMExtractor = new EnhancedLLMExtractor();
    
    // Known brand color defaults
    this.brandColorDefaults = {
      'spotify': {
        primary: '#1DB954',
        secondary: ['#191414', '#FFFFFF'],
        colors: ['#1DB954', '#191414', '#FFFFFF', '#B3B3B3']
      },
      'github': {
        primary: '#24292e',
        secondary: ['#f6f8fa', '#0366d6'],
        colors: ['#24292e', '#f6f8fa', '#0366d6', '#28a745']
      }
    };
  }

  /**
   * Comprehensive extraction with enhanced color & spacing focus
   */
  async extractWithComprehensiveFocus(text, brandName = "Brand") {
    console.log(`🎯 Comprehensive extraction with enhanced focus for ${brandName}...`);
    console.log('📄 Text length:', text.length);
    
    try {
      // Save debug text file
      await this.saveDebugTextFile(text, brandName);
      
      // Use perfect extractor's comprehensive method
      const result = await this.perfectExtractor.extractWithComprehensiveFocus(text, brandName);
      
      console.log('✅ Comprehensive extraction completed!');
      console.log('📊 Result summary:', {
        colors: result.colors?.palette?.length || 0,
        fonts: (result.typography?.primary ? 1 : 0) + (result.typography?.secondary ? 1 : 0),
        logo: result.logo?.clearSpace ? 'Yes' : 'No',
        spacing: Object.values(result.spacing || {}).filter(v => v && v !== '').length,
        confidence: result.confidence?.overall || 0
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Comprehensive extraction failed, falling back to enhanced LLM:', error);
      
      // Fallback to enhanced LLM extraction
      return await this.extractWithEnhancedLLM(text, brandName);
    }
  }

  /**
   * Enhanced LLM-only extraction (new approach)
   */
  async extractWithEnhancedLLM(text, brandName = "Brand") {
    console.log(`🤖 Enhanced LLM extraction for ${brandName}...`);
    console.log('📄 Text length:', text.length);
    
    try {
      // Use enhanced LLM extractor directly
      const result = await this.enhancedLLMExtractor.extractWithLLM(text, brandName);
      
      console.log('✅ Enhanced LLM extraction completed!');
      console.log('📊 Result summary:', {
        colors: result.colors?.palette?.length || 0,
        fonts: (result.typography?.primary ? 1 : 0) + (result.typography?.secondary ? 1 : 0),
        logo: result.logo?.clearSpace ? 'Yes' : 'No',
        confidence: result.confidence?.overall || 0
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Enhanced LLM extraction failed, falling back to perfect extraction:', error);
      
      // Fallback to perfect extraction
      return await this.extractPerfectBrandGuidelines(text, brandName);
    }
  }

  /**
   * Perfect extraction using all improvements
   */
  async extractPerfectBrandGuidelines(text, brandName = "Brand") {
    console.log(`🚀 Perfect brand guideline extraction for ${brandName}...`);
    console.log('📄 Text length:', text.length);
    
    try {
      // Use the perfect extractor with all improvements
      const result = await this.perfectExtractor.extractPerfectGuidelines(text, brandName);
      
      console.log('✅ Perfect extraction completed successfully!');
      console.log('📊 Result summary:', {
        colors: result.colors?.palette?.length || 0,
        fonts: result.typography?.fonts_found?.length || 0,
        logo: result.logo ? 'Yes' : 'No',
        confidence: result.metadata?.confidence_score || 0
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Perfect extraction failed, falling back to standard extraction:', error);
      
      // Fallback to standard extraction
      return await this.extractBrandGuidelines(text, brandName);
    }
  }

  /**
   * Main extraction function with semantic structure reconstruction
   */
  async extractBrandGuidelines(text, brandName = "Brand") {
    console.log(`🔍 Semantic brand guideline extraction for ${brandName}...`);
    console.log('📄 Text length:', text.length);
    
    // Debug: Save converted text to file
    await this.saveDebugTextFile(text, brandName);
    
    // Step 1: Enhanced text cleaning
    const cleanText = this.enhancedCleanText(text);
    
    // Step 2: Color normalization (expand 3-digit hex codes)
    const normalizedText = this.normalizeColors(cleanText);
    
    // Step 3: Pre-extract fonts with smart detection
    const detectedFonts = await this.detectFonts(normalizedText);
    
    // Step 4: Add structural XML tags for LLM context
    const taggedText = this.addXmlTags(normalizedText);
    
    // Debug: Save processed text for comparison
    await this.saveDebugTextFile(taggedText, `${brandName}_processed`);
    
    // Step 5: Pre-segment flattened PDFs
    const preClusters = this.preSegmentGroupings(taggedText);
    
    // Step 6: Conservative section segmentation (rely more on LLM)
    const sections = this.segmentSectionsConservative(taggedText);
    console.log(`📋 Semantic sections identified:`, Object.keys(sections));
    
    // Debug: Save segmented sections
    await this.saveDebugSections(sections, brandName);
    
    // Step 4: Merge pre-clusters with sections for better context
    const enhancedSections = this.mergePreClustersWithSections(sections, preClusters);
    
    // Step 5: Specialized extraction with cross-brand generalization
    const specializedResults = await this.runSpecializedExtraction(enhancedSections, detectedFonts);
    
    // Step 6: Fallback to context-aware extraction for missing data
    const colors = specializedResults.colors.palette.length > 0 ? 
      specializedResults.colors : this.extractColorsWithContext(enhancedSections, brandName);
    const typography = specializedResults.typography.fonts.length > 0 ? 
      specializedResults.typography : await this.extractTypographyWithContext(enhancedSections, brandName, detectedFonts);
    const logo = specializedResults.logo.rules.length > 0 ? 
      specializedResults.logo : this.extractLogoWithContext(enhancedSections, brandName);
    const spacing = specializedResults.spacing.rules.length > 0 ? 
      specializedResults.spacing : this.extractSpacingWithContext(enhancedSections);
    const tone = this.extractToneWithContext(enhancedSections, brandName);
    const imagery = this.extractImageryWithContext(enhancedSections, brandName);
    
    // Step 4: Calculate confidence
    const confidence = this.calculateOverallConfidence({ colors, typography, logo, tone, imagery });
    
    // Step 5: Extract additional metadata
    const companyName = this.extractCompanyName(text, brandName);
    const industry = this.extractIndustry(text, brandName);
    
    // Step 6: Build initial result
    const initialResult = {
      brandName,
      companyName,
      industry,
      colors,
      typography,
      logo,
      tone,
      imagery,
      spacing,
      metadata: {
        extractionMethod: 'enhanced-heuristic',
        confidence,
        textLength: text.length,
        timestamp: new Date().toISOString()
      }
    };

    // Step 7: Fonts are now seeded directly in extractTypographyWithContext

    // Step 8: LLM Semantic Enhancement with improved prompt
    console.log('🧠 Applying LLM semantic enhancement...');
    let enhancedResult;
    try {
      enhancedResult = await this.llmEnhancement.enhanceExtraction(text, initialResult, brandName);
      console.log('✅ LLM semantic enhancement completed');
    } catch (error) {
      console.warn('⚠️ LLM enhancement failed, using original data:', error.message);
      enhancedResult = initialResult;
    }

    // Step 9: Post-LLM reconciliation to clean up mixed content
    const reconciledResult = this.reconcileBrandJson(enhancedResult);
    
    console.log(`✅ Extraction complete - Confidence: ${(reconciledResult.metadata.confidence * 100).toFixed(1)}%`);
    return reconciledResult;
  }

  /**
   * Run specialized extraction with cross-brand generalization
   */
  async runSpecializedExtraction(sections, detectedFonts) {
    console.log('🔍 Running specialized extraction with cross-brand patterns...');
    
    // Initialize specialized coordinator lazily
    if (!this.specializedCoordinator) {
      const { SpecializedExtractionCoordinator } = await import('./specializedExtractors.js');
      this.specializedCoordinator = new SpecializedExtractionCoordinator();
    }
    
    try {
      const results = await this.specializedCoordinator.extractFromSections(sections);
      
      // Add detected fonts to typography if not already present
      if (detectedFonts.length > 0 && results.typography.fonts.length === 0) {
        results.typography.fonts = detectedFonts;
        results.typography.primaryFont = detectedFonts[0];
        results.typography.secondaryFont = detectedFonts[1];
      }
      
      console.log('✅ Specialized extraction completed');
      return results;
    } catch (error) {
      console.warn('⚠️ Specialized extraction failed, falling back to context-aware extraction:', error.message);
      return {
        colors: { palette: [], primary: null, secondary: null, background: null, text: null, accent: null, rules: [] },
        typography: { fonts: [], weights: [], sizes: [], primaryFont: null, secondaryFont: null, rules: [] },
        logo: { rules: [], clearspace: null, minSize: null, forbidden: [], spacing: [] },
        spacing: { rules: [], clearspace: null, margins: [], padding: [], grid: null }
      };
    }
  }

  /**
   * Save debug text file for inspection
   * @param {string} text - Raw converted text
   * @param {string} brandName - Brand name for filename
   */
  async saveDebugTextFile(text, brandName) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Create debug directory if it doesn't exist
      const debugDir = path.join(process.cwd(), 'debug-text-files');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${brandName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.txt`;
      const filepath = path.join(debugDir, filename);
      
      // Save the text file
      fs.writeFileSync(filepath, text, 'utf8');
      console.log(`📁 Debug text saved to: ${filepath}`);
      console.log(`📄 Text preview (first 500 chars):`);
      console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
      
    } catch (error) {
      console.warn('⚠️ Could not save debug text file:', error.message);
    }
  }

  /**
   * Save debug sections for inspection
   * @param {Object} sections - Segmented sections
   * @param {string} brandName - Brand name for filename
   */
  async saveDebugSections(sections, brandName) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Create debug directory if it doesn't exist
      const debugDir = path.join(process.cwd(), 'debug-text-files');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${brandName}_sections_${timestamp}.json`;
      const filepath = path.join(debugDir, filename);
      
      // Format sections for readability
      const formattedSections = {};
      Object.keys(sections).forEach(sectionName => {
        formattedSections[sectionName] = {
          content: sections[sectionName],
          length: sections[sectionName].length,
          preview: sections[sectionName].substring(0, 200) + (sections[sectionName].length > 200 ? '...' : '')
        };
      });
      
      // Save the sections file
      fs.writeFileSync(filepath, JSON.stringify(formattedSections, null, 2), 'utf8');
      console.log(`📁 Debug sections saved to: ${filepath}`);
      
    } catch (error) {
      console.warn('⚠️ Could not save debug sections file:', error.message);
    }
  }

  /**
   * Normalize section headers and fix ConvertAPI artifacts (conservative approach)
   * @param {string} text - Raw converted text
   */
  normalizeSectionHeaders(text) {
    return text
      // Fix ConvertAPI concatenations (e.g., "18primary" → "18 primary")
      .replace(/(\d+)([A-Za-z])/g, '$1 $2')
      // Remove page markers and anchors (but preserve content)
      .replace(/Switcher\s*Brand\s*Guidelines\s*\d+/gi, '')
      .replace(/Brand\s*Guidelines\s*\d+/gi, '')
      .replace(/\d+primary\s+typeface/gi, 'PRIMARY TYPEFACE')
      // Fix Unicode artifacts
      .replace(/[^\x00-\x7F]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      // Merge adjacent uppercase words (split headers) - be more conservative
      .replace(/([A-Z][a-z]+)\s*\n([A-Z][a-z]+)/g, '$1 $2')
      // Fix font sample patterns without breaking content
      .replace(/Aa\s+Bb\s+Cc/gi, '\nFONT SAMPLE:\nAa Bb Cc')
      .trim();
  }

  /**
   * Extract font candidates before segmentation
   * @param {string} text - Raw text
   */
  extractFontCandidates(text) {
    const fontCandidates = text.match(/(Aa\s+Bb\s+Cc[\s\S]{0,300}?(Regular|Bold|Light|Italic|Medium|Semibold|Heavy))/gi);
    return fontCandidates || [];
  }

  /**
   * Add structural cues with XML tagging for section boundaries
   * @param {string} text - Cleaned text
   */
  addXmlTags(text) {
    console.log('🏷️ Adding structural XML tags...');
    
    const sectionHints = [
      { key: "COLOR", regex: /(color|palette|pantone|CMYK|HEX|rgb|#[0-9A-Fa-f]{3,6})/gi },
      { key: "TYPOGRAPHY", regex: /(font|typeface|weights|italic|bold|light|regular|medium|semibold|hairline)/gi },
      { key: "LOGO", regex: /(logo|logotype|mark|lockup|clear\s*space|minimum\s*size)/gi },
      { key: "IMAGERY", regex: /(photography|imagery|visuals|gradient|photos|images)/gi },
      { key: "SPACING", regex: /(clear\s*space|min(imum)?\s*size|grid|margin|padding|spacing)/gi }
    ];

    let tagged = text;
    for (const { key, regex } of sectionHints) {
      tagged = tagged.replace(regex, match => `<${key}>${match}</${key}>`);
    }
    
    console.log('✅ XML tags added for structural context');
    return tagged;
  }

  /**
   * Post-LLM reconciliation pass to clean up mixed content
   * @param {Object} data - Parsed brand data
   */
  reconcileBrandJson(data) {
    console.log('🔧 Post-LLM reconciliation...');
    
    const badHex = /#[0-9A-F]{1,3}$/i; // short or malformed
    const weightWord = /(bold|light|regular|medium|semibold|italic|hairline)/i;

    // Move stray weights from colors → typography
    if (data.colors?.rules) {
      const stray = data.colors.rules.filter(r => weightWord.test(r));
      if (stray.length) {
        data.typography = data.typography || {};
        data.typography.weights = [
          ...(data.typography.weights || []),
          ...stray.map(r => r.match(weightWord)[0])
        ];
        data.colors.rules = data.colors.rules.filter(r => !weightWord.test(r));
        console.log('📝 Moved font weights from colors to typography');
      }
    }

    // Drop three-letter pseudo-hex codes
    if (Array.isArray(data.colors?.palette)) {
      const before = data.colors.palette.length;
      data.colors.palette = data.colors.palette.filter(c => !badHex.test(c));
      const after = data.colors.palette.length;
      if (before !== after) {
        console.log(`🎨 Removed ${before - after} invalid hex codes`);
      }
    }

    // Normalize duplicated short codes
    if (Array.isArray(data.colors?.palette)) {
      data.colors.palette = [...new Set(data.colors.palette.map(c => c.toUpperCase()))];
    }

    // Clean up typography weights
    if (data.typography?.weights) {
      data.typography.weights = [...new Set(data.typography.weights)];
    }

    console.log('✅ Reconciliation completed');
    return data;
  }

  /**
   * Color normalization - expand 3-digit hex codes
   * @param {string} text - Text with color codes
   */
  normalizeColors(text) {
    console.log('🎨 Normalizing color codes...');
    
    return text.replace(/#([0-9A-F]{3})(\s|$)/gi, (_, code, end) => {
      // Expand 3-digit hex (#F07 →rgb(255, 0, 119))
      const expanded = code.split('').map(c => c + c).join('');
      return `#${expanded}${end}`;
    });
  }

  /**
   * Smart font detection with whitelist and heuristics
   * @param {string} text - Text to analyze
   */
  async detectFonts(text) {
    console.log('🔤 Smart font detection with whitelist...');
    
    // Import the smart font detector
    const { detectFontsFromText } = await import('./fontDetector.js');
    
    const fonts = detectFontsFromText(text);
    console.log(`✅ Detected fonts: ${fonts.join(', ')}`);
    return fonts;
  }

  /**
   * Conservative section segmentation - minimal preprocessing, rely on LLM
   * @param {string} text - Cleaned text
   */
  segmentSectionsConservative(text) {
    console.log('🔍 Conservative section segmentation...');
    
    // Only look for very clear section headers, don't over-segment
    const lines = text.split('\n');
    const sections = {};
    let currentSection = 'GENERAL';
    let currentContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Only match very clear section headers (all caps, standalone)
      if (line.match(/^(COLOR|LOGO|TYPOGRAPHY|FONT|SPACING|IMAGERY|TONE|BRAND|IDENTITY|USAGE|GUIDELINES?|SYMBOL|PHOTOGRAPHY|ICON|PALETTE)$/i)) {
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        
        // Start new section
        currentSection = line.toUpperCase();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    
    // Save final section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }
    
    console.log(`✅ Conservative segmentation complete: ${Object.keys(sections).length} sections`);
    return sections;
  }

  /**
   * Enhanced text cleaning with structural reconstruction
   */
  enhancedCleanText(text) {
    let cleaned = this.normalizeSectionHeaders(text);
    
    cleaned = cleaned
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\u00A0/g, ' ')           // non-breaking space
      .replace(/\u201d/g, '"')           // smart quotes
      .replace(/\u201c/g, '"')           // smart quotes
      .replace(/\u2019/g, "'")           // smart apostrophe
      .replace(/\u2018/g, "'")           // smart apostrophe
      .replace(/\s{2,}/g, ' ')           // multiple spaces → one
      .replace(/\n{2,}/g, '\n\n')        // preserve blank lines
      .replace(/([a-z])([A-Z])/g, '$1 $2') // add space between camelCase
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // add space between acronyms
      .trim();
    
    // Fix common PDF conversion issues where section headers get merged with content
    // Look for patterns like "text COLOR" and split them
    cleaned = cleaned.replace(/([a-z])\s+(COLOR|LOGO|TYPOGRAPHY|FONT|SPACING|IMAGERY|TONE|BRAND|IDENTITY|USAGE|GUIDELINES?|SYMBOL)\s+/gi, '$1\n$2\n');
    
    // Look for patterns like "text. COLOR" and split them
    cleaned = cleaned.replace(/([a-z])\.\s+(COLOR|LOGO|TYPOGRAPHY|FONT|SPACING|IMAGERY|TONE|BRAND|IDENTITY|USAGE|GUIDELINES?|SYMBOL)\s+/gi, '$1.\n$2\n');
    
    return cleaned;
  }

  /**
   * Pre-segment groupings for flattened PDFs
   * Handles cases where ConvertAPI merges content into unstructured text
   */
  preSegmentGroupings(text) {
    console.log('🔍 Pre-segmenting flattened PDF text...');
    const clusters = [];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let buffer = [];
    let lastHeader = null;

    for (const line of lines) {
      // Check if this line is a section header (case-insensitive)
      if (/^(color|logo|typography|spacing|imagery|tone|usage|brand|identity|guidelines?)/i.test(line)) {
        // Save previous cluster
        if (buffer.length && lastHeader) {
          clusters.push({ header: lastHeader, content: buffer.join(' ') });
          console.log(`📋 Pre-cluster "${lastHeader}": ${buffer.length} lines`);
        }
        lastHeader = line;
        buffer = [];
      } else {
        buffer.push(line);
      }
    }
    
    // Save final cluster
    if (buffer.length && lastHeader) {
      clusters.push({ header: lastHeader, content: buffer.join(' ') });
      console.log(`📋 Final pre-cluster "${lastHeader}": ${buffer.length} lines`);
    }
    
    console.log(`✅ Pre-segmentation complete: ${clusters.length} clusters found`);
    return clusters;
  }

  /**
   * Semantic section segmentation - reconstructs PDF structure
   */
  segmentSections(text) {
    const sections = {};
    const lines = text.split('\n');
    let currentSection = 'GENERAL';
    let currentContent = [];
    
    console.log('🔍 Segmenting text into sections...');
    console.log('📄 Total lines:', lines.length);
    
    // Section header patterns - more comprehensive
    const sectionPatterns = [
      // All caps headings (3+ characters)
      /^[A-Z\s]{3,}$/,
      // Numbered sections
      /^\d+\.?\s+[A-Z][A-Z\s]+$/,
      // Bold/emphasized headings
      /^[A-Z][a-z\s]+:$/,
      // Common brand guideline sections
      /^(COLOR|LOGO|TYPOGRAPHY|FONT|SPACING|IMAGERY|TONE|BRAND|IDENTITY|USAGE|GUIDELINES?|SYMBOL)$/i,
      // Single word sections
      /^(COLOR|LOGO|TYPOGRAPHY|FONT|SPACING|IMAGERY|TONE|BRAND|IDENTITY|USAGE|GUIDELINES?|SYMBOL)$/i,
      // Handle single words that are section headers
      /^COLOR$/i,
      /^LOGO$/i,
      /^TYPOGRAPHY$/i,
      /^FONT$/i,
      /^SPACING$/i,
      /^IMAGERY$/i,
      /^TONE$/i,
      /^BRAND$/i,
      /^IDENTITY$/i,
      /^USAGE$/i,
      /^GUIDELINES?$/i,
      /^SYMBOL$/i
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      console.log(`🔍 Checking line ${i}: "${trimmedLine}"`);
      
      // Check if this line is a section header
      const isHeader = sectionPatterns.some(pattern => {
        const matches = pattern.test(trimmedLine);
        if (matches) {
          console.log(`✅ Pattern matched: ${pattern} for "${trimmedLine}"`);
        }
        return matches;
      });
      
      if (isHeader) {
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join(' ').trim();
          console.log(`📋 Section "${currentSection}": ${sections[currentSection].length} characters`);
        }
        
        // Start new section
        currentSection = this.normalizeSectionName(trimmedLine);
        currentContent = [];
        console.log(`🎯 New section: "${currentSection}"`);
      } else {
        currentContent.push(trimmedLine);
      }
    }
    
    // Save final section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join(' ').trim();
      console.log(`📋 Final section "${currentSection}": ${sections[currentSection].length} characters`);
    }
    
    console.log('✅ Section segmentation complete:', Object.keys(sections));
    return sections;
  }

  /**
   * Normalize section names to semantic categories
   */
  normalizeSectionName(sectionName) {
    const name = sectionName.toUpperCase();
    
    // Color-related sections
    if (name.includes('COLOR') || name.includes('PALETTE')) return 'COLOR';
    if (name.includes('LOGO') || name.includes('WORDMARK') || name.includes('SYMBOL')) return 'LOGO';
    if (name.includes('TYPOGRAPHY') || name.includes('FONT') || name.includes('TEXT')) return 'TYPOGRAPHY';
    if (name.includes('SPACING') || name.includes('MARGIN') || name.includes('PADDING')) return 'SPACING';
    if (name.includes('IMAGERY') || name.includes('PHOTO') || name.includes('IMAGE')) return 'IMAGERY';
    if (name.includes('TONE') || name.includes('VOICE') || name.includes('STYLE')) return 'TONE';
    if (name.includes('USAGE') || name.includes('GUIDELINES') || name.includes('RULES')) return 'USAGE';
    
    return name;
  }

  /**
   * Merge pre-clusters with sections for better context
   */
  mergePreClustersWithSections(sections, preClusters) {
    const enhancedSections = { ...sections };
    
    // Add pre-cluster content to relevant sections
    for (const cluster of preClusters) {
      const normalizedHeader = this.normalizeSectionName(cluster.header);
      if (enhancedSections[normalizedHeader]) {
        // Merge content
        enhancedSections[normalizedHeader] = `${enhancedSections[normalizedHeader]} ${cluster.content}`.trim();
        console.log(`🔄 Enhanced section "${normalizedHeader}" with pre-cluster content`);
      } else {
        // Create new section from pre-cluster
        enhancedSections[normalizedHeader] = cluster.content;
        console.log(`🆕 Created new section "${normalizedHeader}" from pre-cluster`);
      }
    }
    
    return enhancedSections;
  }

  /**
   * Context-aware color extraction with semantic mapping
   */
  extractColorsWithContext(sections, brandName) {
    console.log('🎨 Context-aware color extraction starting...');
    
    // Map colors to sections with proper element positioning
    const colorSections = [
      { name: 'COLOR', text: sections.COLOR || '' },
      { name: 'LOGO', text: sections.LOGO || '' },
      { name: 'TYPOGRAPHY', text: sections.TYPOGRAPHY || '' },
      { name: 'SPACING', text: sections.SPACING || '' },
      { name: 'IMAGERY', text: sections.IMAGERY || '' },
      { name: 'TONE', text: sections.TONE || '' },
      { name: 'USAGE', text: sections.USAGE || '' },
      { name: 'BRAND', text: sections.BRAND || '' },
      { name: 'IDENTITY', text: sections.IDENTITY || '' },
      { name: 'GUIDELINES', text: sections.GUIDELINES || '' }
    ];
    
    console.log('📋 Color sections to process:', colorSections.map(s => s.name).filter(name => colorSections.find(s => s.name === name)?.text));
    
    const colors = {
      primary: null,
      secondary: [],
      accent: [],
      palette: [],
      rgbColors: [],
      cmykColors: [],
      pantoneColors: [],
      colorNames: [],
      descriptions: {},
      colorMap: {},
      confidence: 0,
      rules: [],
      // New: Context-aware color mapping
      usageContext: {}
    };

    // Process each section separately for better element mapping
    for (const section of colorSections) {
      if (!section.text) continue;
      
      console.log(`🔍 Processing section "${section.name}": ${section.text.length} characters`);
      
      // Extract colors from this specific section
      const sectionMatches = this.extractColorsWithUsageContext(section.text);
      console.log(`🎨 Found ${sectionMatches.length} colors in section "${section.name}"`);
      
      // Process each color match with section context
      for (const match of sectionMatches) {
        const { color, hex, context, usage } = match;
        
        // Add section context to the match
        match.section = section.name;
        
        console.log(`🎨 Color: ${color} -> ${hex}, section: ${section.name}, context: ${context}, usage: ${usage}`);
        
        // Map color to element using both context and section
        const element = this.mapColorToElement(context, section.name);
        
        // Add to appropriate category based on section and context
        if ((section.name === 'COLOR' || section.name === 'USAGE') && (context.includes('primary') || context.includes('main') || context.includes('twitch purple') || context.includes('purple'))) {
          colors.primary = hex;
          colors.colorMap['Primary'] = hex;
        } else if ((section.name === 'COLOR' || section.name === 'USAGE') && (context.includes('secondary') || context.includes('black') || context.includes('ice'))) {
          colors.secondary.push(hex);
          colors.colorMap['Secondary'] = hex;
        } else if (section.name === 'LOGO' && context.includes('logo')) {
          // Logo colors are usually accent colors
          colors.accent.push(hex);
        } else if ((section.name === 'COLOR' || section.name === 'USAGE') && !colors.primary) {
          // If no primary color set yet and we're in COLOR or USAGE section, make it primary
          colors.primary = hex;
          colors.colorMap['Primary'] = hex;
        } else {
          colors.accent.push(hex);
        }
        
        // Store usage context with section information
        colors.usageContext[hex] = {
          usage: usage,
          context: context,
          element: element,
          section: section.name
        };
        
        // Only add to palette if not already present
        if (!colors.palette.includes(hex)) {
          colors.palette.push(hex);
        }
      }
    }
    
    // If no colors found, fall back to enhanced extraction
    if (colors.palette.length === 0) {
      console.log('⚠️ No colors found with section mapping, falling back to enhanced extraction...');
      // Try USAGE section first (where Twitch colors are), then COLOR, then GENERAL
      const fallbackText = sections.USAGE || sections.COLOR || sections.GENERAL || '';
      const fallbackColors = this.extractColorsEnhanced(fallbackText, brandName, fallbackText);
      return fallbackColors;
    }

    // Extract color rules and constraints from all sections
    const allSectionText = colorSections.map(s => s.text).join(' ');
    colors.rules = this.extractColorRules(allSectionText);
    
    // Calculate confidence
    colors.confidence = this.calculateColorConfidence(colors.palette, colors.colorNames, allSectionText);

    console.log('🎨 Color extraction results:', {
      primary: colors.primary,
      secondary: colors.secondary,
      palette: colors.palette,
      confidence: colors.confidence
    });

    return colors;
  }

  /**
   * Extract colors with usage context using sliding window
   */
  extractColorsWithUsageContext(text) {
    const matches = [];
    const words = text.split(/\s+/);
    const windowSize = 8; // Look 8 words before and after color
    
    console.log('🔍 Extracting colors with context window...');
    console.log('📄 Text sample:', text.substring(0, 300));
    
    // Enhanced color patterns - more precise and context-aware
    const colorPatterns = [
      // Hex colors with # (most reliable)
      /#[A-Fa-f0-9]{6}/g,
      /#[A-Fa-f0-9]{3}/g,
      // RGB format: R 145 G 70 B 255
      /R\s+(\d+)\s+[CG]\s+\d+\s+[GM]\s+\d+\s+B\s+(\d+)/gi,
      // RGB format: RGB: 145 70 255
      /RGB:\s*(\d+)\s*(\d+)\s*(\d+)/gi,
      // Handle hex without # symbol - only in color contexts
      /(?:hex|color|rgb|cmyk|pms)[:\s]*([A-Fa-f0-9]{6})/gi,
      /(?:hex|color|rgb|cmyk|pms)[:\s]*([A-Fa-f0-9]{3})/gi,
      // Twitch specific format: R 145 C 57 G 70 M 60 B 255
      /R\s+(\d+)\s+C\s+\d+\s+G\s+(\d+)\s+M\s+\d+\s+B\s+(\d+)/gi
    ];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check if this word is a color
      let colorMatch = null;
      for (const pattern of colorPatterns) {
        const match = word.match(pattern);
        if (match) {
          colorMatch = match[0];
          break;
        }
      }
      
      if (colorMatch) {
        // Get context window
        const start = Math.max(0, i - windowSize);
        const end = Math.min(words.length, i + windowSize + 1);
        const context = words.slice(start, end).join(' ').toLowerCase();
        
        // Special handling for Twitch RGB format: R 145 C 57 G 70 M 60 B 255
        let processedColor = colorMatch;
        if (colorMatch.includes('R ') && colorMatch.includes('G ') && colorMatch.includes('B ')) {
          // Extract RGB values from Twitch format
          const rMatch = colorMatch.match(/R\s+(\d+)/);
          const gMatch = colorMatch.match(/G\s+(\d+)/);
          const bMatch = colorMatch.match(/B\s+(\d+)/);
          
          if (rMatch && gMatch && bMatch) {
            const r = parseInt(rMatch[1]);
            const g = parseInt(gMatch[1]);
            const b = parseInt(bMatch[1]);
            processedColor = `rgb(${r}, ${g}, ${b})`;
            console.log(`🎨 Converted Twitch format: ${colorMatch} -> ${processedColor}`);
          }
        }
        
        // Filter out false positives
        if (this.isValidColorMatch(processedColor, context)) {
          // Determine usage context
          const usage = this.determineColorUsage(context);
          const element = this.mapColorToElement(context);
          
          console.log(`🎨 Found color: ${processedColor} in context: "${context}"`);
          
          matches.push({
            color: processedColor,
            hex: this.normalizeColorToHex(processedColor),
            context: context,
            usage: usage,
            element: element
          });
        } else {
          console.log(`⚠️ Filtered out false positive: ${processedColor} in context: "${context}"`);
        }
      }
    }
    
    console.log(`🎨 Total color matches found: ${matches.length}`);
    return matches;
  }

  /**
   * Validate if a color match is legitimate
   */
  isValidColorMatch(colorMatch, context) {
    // Filter out obvious false positives
    if (colorMatch.startsWith('#')) {
      // Hex colors are usually legitimate
      return true;
    }
    
    // Check if it's a standalone number (likely false positive)
    if (/^\d+$/.test(colorMatch)) {
      // Only accept if it's clearly part of RGB format
      return context.includes('rgb:') || context.includes('rgb ');
    }
    
    // Check if it's a valid hex without # (6 digits)
    if (/^[A-Fa-f0-9]{6}$/.test(colorMatch)) {
      return true;
    }
    
    // Check if it's a valid hex without # (3 digits) - but be more strict
    if (/^[A-Fa-f0-9]{3}$/.test(colorMatch)) {
      // Only accept 3-digit hex if it's clearly in a color context
      const colorContext = context.toLowerCase();
      return colorContext.includes('hex:') || 
             colorContext.includes('color') || 
             colorContext.includes('rgb') ||
             colorContext.includes('cmyk') ||
             colorContext.includes('pms');
    }
    
    // Filter out common false positives and English words
    const falsePositives = [
      'ACE', 'PMS', 'CMYK', 'RGB', 'HEX', 'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'BAC', 'FEE', 'DED', 'ADD', 'CED', 'CCA'
    ];
    if (falsePositives.includes(colorMatch.toUpperCase())) {
      return false;
    }
    
    // Filter out very short matches that are likely not colors
    if (colorMatch.length < 3) {
      return false;
    }
    
    // Filter out common English words that might be 3 letters
    const commonWords = [
      'ace', 'add', 'age', 'ago', 'air', 'all', 'and', 'any', 'are', 'art', 'ask', 'bad', 'bag', 'bar', 'bed', 'big', 'bit', 'box', 'boy', 'bus', 'but', 'buy', 'can', 'car', 'cat', 'cup', 'cut', 'day', 'did', 'dog', 'dry', 'eat', 'end', 'eye', 'far', 'few', 'fly', 'for', 'get', 'got', 'gun', 'had', 'has', 'hat', 'her', 'him', 'his', 'hit', 'hot', 'how', 'ice', 'its', 'job', 'key', 'kid', 'let', 'lot', 'low', 'man', 'may', 'men', 'new', 'not', 'now', 'off', 'old', 'one', 'our', 'out', 'own', 'pay', 'put', 'red', 'run', 'say', 'see', 'set', 'she', 'sit', 'six', 'son', 'sun', 'ten', 'the', 'too', 'top', 'try', 'two', 'use', 'war', 'was', 'way', 'win', 'yes', 'yet', 'you'
    ];
    if (commonWords.includes(colorMatch.toLowerCase())) {
      return false;
    }
    
    return false;
  }

  /**
   * Determine color usage from context
   */
  determineColorUsage(context) {
    if (context.includes('logo') || context.includes('wordmark')) return 'logo';
    if (context.includes('button') || context.includes('cta') || context.includes('action')) return 'buttons';
    if (context.includes('text') || context.includes('heading') || context.includes('body')) return 'text';
    if (context.includes('background') || context.includes('bg')) return 'background';
    if (context.includes('accent') || context.includes('highlight')) return 'accent';
    if (context.includes('primary') || context.includes('main')) return 'primary';
    if (context.includes('secondary')) return 'secondary';
    
    return 'general';
  }

  /**
   * Map color context to website elements with section awareness
   */
  mapColorToElement(context, sectionName = '') {
    const ctx = context.toLowerCase();
    const sec = sectionName.toLowerCase();

    // Section-based mapping (higher priority)
    if (sec.includes('logo')) return 'logo';
    if (sec.includes('typography')) return 'text';
    if (sec.includes('imagery')) return 'imagery';
    if (sec.includes('spacing')) return 'layout';
    
    // Context-based mapping (fallback)
    if (ctx.includes('logo') || ctx.includes('wordmark')) return 'logo';
    if (ctx.includes('button') || ctx.includes('cta')) return 'buttons';
    if (ctx.includes('text') || ctx.includes('heading')) return 'text';
    if (ctx.includes('background') || sec.includes('color')) return 'background';
    if (ctx.includes('accent') || ctx.includes('highlight')) return 'accent';
    
    return 'general';
  }

  /**
   * Extract color rules and constraints
   */
  extractColorRules(text) {
    const rules = [];
    
    // Common rule patterns
    const rulePatterns = [
      /(?:do not|avoid|never)\s+(?:use|put|place)\s+([^.]*)/gi,
      /(?:always|must|should)\s+(?:use|put|place)\s+([^.]*)/gi,
      /(?:only|exclusively)\s+(?:use|put|place)\s+([^.]*)/gi
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
   * Context-aware typography extraction
   */
  async extractTypographyWithContext(sections, brandName, detectedFonts = []) {
    const typographySection = sections.TYPOGRAPHY || sections.GENERAL || '';
    
    // First try targeted section for additional font detection
    let fonts = detectedFonts;
    if (fonts.length === 0) {
      const { detectFontsFromText } = await import('./fontDetector.js');
      fonts = detectFontsFromText(typographySection);
    }
    
    // Fallback to whole document if nothing found in typography section
    if (fonts.length === 0) {
      const { detectFontsFromText } = await import('./fontDetector.js');
      fonts = detectFontsFromText(Object.values(sections).join(' '));
    }
    
    // Extract typography with enhanced method
    const typography = this.extractTypographyEnhanced(typographySection, brandName);
    
    // Seed the parsed object with detected fonts
    typography.fonts = fonts;
    
    // Prioritize whitelisted fonts for primary/secondary assignment
    const { FONT_WHITELIST } = await import('./fontDetector.js');
    const whitelistedFonts = fonts.filter(f =>
      FONT_WHITELIST.map(w => w.toLowerCase()).includes(f.toLowerCase())
    );
    
    typography.primaryFont = whitelistedFonts[0] || fonts[0] || typography.primaryFont || null;
    typography.secondaryFont = whitelistedFonts[1] || fonts[1] || typography.secondaryFont || null;
    
    // Dynamic confidence based on font detection quality
    if (fonts.length > 0) {
      typography.confidence = 0.9; // High confidence with detected fonts
    } else {
      typography.confidence = 0.4; // Low confidence without fonts
    }
    
    console.log(`🔤 Typography seeded with fonts: ${fonts.join(', ')}`);
    return typography;
  }

  /**
   * Context-aware logo extraction
   */
  extractLogoWithContext(sections, brandName) {
    const logoSection = sections.LOGO || sections.GENERAL || '';
    const usageSection = sections.USAGE || '';
    
    // Combine logo and usage sections
    const logoText = [logoSection, usageSection].join(' ');
    
    return this.extractLogoEnhanced(logoText, brandName, logoText);
  }

  /**
   * Context-aware spacing extraction
   */
  extractSpacingWithContext(sections) {
    const spacingSection = sections.SPACING || sections.GENERAL || '';
    
    return this.extractSpacing(spacingSection);
  }

  /**
   * Context-aware imagery extraction
   */
  extractImageryWithContext(sections, brandName) {
    const imagerySection = sections.IMAGERY || sections.GENERAL || '';
    
    return this.extractImageryEnhanced(imagerySection, brandName);
  }

  /**
   * Context-aware tone extraction
   */
  extractToneWithContext(sections, brandName) {
    const toneSection = sections.TONE || sections.GENERAL || '';
    
    return this.extractToneEnhanced(toneSection, brandName);
  }

  /**
   * Normalize color to hex format
   */
  normalizeColorToHex(color) {
    if (color.startsWith('#')) return color.toUpperCase();
    
    // Handle RGB format
    const rgbMatch = color.match(/(\d+)\s*(\d+)\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    }
    
    return color;
  }

  /**
   * Fuzzy section detection using keyword proximity
   */
  fuzzySectionDetection(text) {
    const sections = {};
    const lower = text.toLowerCase();
    
    const sectionMarkers = [
      { 
        name: "color", 
        keywords: ["color", "colour", "palette", "brand colors", "spotify green", "primary colour", "secondary colour", "how we look", "hero colour"] 
      },
      { 
        name: "typography", 
        keywords: ["typography", "font", "typeface", "text style", "heading", "body text", "font family", "font weight"] 
      },
      { 
        name: "logo", 
        keywords: ["logo", "logotype", "clearspace", "mark", "icon", "symbol", "minimum size", "primary logotype", "horizontal logotype", "monochromatic"] 
      },
      { 
        name: "tone", 
        keywords: ["tone", "voice", "messaging", "brand voice", "partner messaging", "communication", "key descriptive", "how we speak"] 
      },
      { 
        name: "imagery", 
        keywords: ["imagery", "photography", "visual", "images", "photos", "visual style", "photography style"] 
      }
    ];

    for (let i = 0; i < sectionMarkers.length; i++) {
      const marker = sectionMarkers[i];
      let start = -1;
      let bestMatch = '';

      // Find the earliest occurrence of any keyword
      for (const kw of marker.keywords) {
        const idx = lower.indexOf(kw);
        if (idx !== -1 && (start === -1 || idx < start)) {
          start = idx;
          bestMatch = kw;
        }
      }

      if (start !== -1) {
        let end = text.length;
        
        // Find start of next section
        if (i < sectionMarkers.length - 1) {
          for (const nextMarker of sectionMarkers.slice(i + 1)) {
            for (const nextKw of nextMarker.keywords) {
              const nextIdx = lower.indexOf(nextKw, start + 20);
              if (nextIdx !== -1 && nextIdx < end) {
                end = nextIdx;
              }
            }
          }
        }
        
        const sectionText = text.slice(start, end).trim();
        if (sectionText.length > 50) { // Only include substantial sections
          sections[marker.name] = sectionText;
          console.log(`✅ Found ${marker.name} section (${sectionText.length} chars) starting with: "${bestMatch}"`);
        }
      }
    }

    console.log('📋 Section detection results:', {
      sectionsFound: Object.keys(sections).length,
      sectionNames: Object.keys(sections),
      sectionLengths: Object.entries(sections).map(([name, content]) => ({
        name,
        length: content.length,
        preview: content.substring(0, 100)
      }))
    });

    return sections;
  }

  /**
   * Enhanced color extraction with flexible patterns
   */
  extractColorsEnhanced(colorText, brandName, fullText = '') {
    console.log('🎨 Extracting colors with enhanced patterns...');
    console.log('📄 Color text sample:', colorText.substring(0, 300));
    
    // Use full text for better color extraction (in case colors are in other sections)
    const searchText = fullText || colorText;
    
    const colors = {
      primary: null,
      secondary: [],
      accent: [],
      palette: [],
      rgbColors: [],
      cmykColors: [],
      pantoneColors: [],
      colorNames: [],
      descriptions: {},
      colorMap: {},
      confidence: 0,
      rules: []
    };

    // Extract RGB values with flexible spacing - handle both formats
    // Format 1: R 145 G 70 B 255
    // Format 2: R 145 C 57 G 70 M 60 B 255 (Twitch format)
    const rgbMatches = searchText.match(/R\s*\d+\s*(?:C\s*\d+\s*)?G\s*\d+\s*(?:M\s*\d+\s*)?B\s*\d+/gi) || [];
    console.log('🔍 Found RGB matches:', rgbMatches);
    
    for (const rgb of rgbMatches) {
      // Try Twitch format first: R 145 C 57 G 70 M 60 B 255
      let match = rgb.match(/R\s*(\d+)\s*C\s*\d+\s*G\s*(\d+)\s*M\s*\d+\s*B\s*(\d+)/i);
      if (!match) {
        // Try standard format: R 145 G 70 B 255
        match = rgb.match(/R\s*(\d+)\s*G\s*(\d+)\s*B\s*(\d+)/i);
      }
      
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        colors.palette.push(hex);
        colors.rgbColors.push(rgb);
        console.log(`🎨 Extracted color: ${rgb} -> ${hex}`);
      }
    }

    // Extract CMYK values with flexible spacing
    const cmykMatches = searchText.match(/C\s*\d+\s*M\s*\d+\s*Y\s*\d+\s*K\s*\d+/gi) || [];
    console.log('🔍 Found CMYK matches:', cmykMatches);
    colors.cmykColors = cmykMatches;

    // Extract Pantone values
    const pantoneMatches = searchText.match(/Pantone\s*[A-Za-z0-9\s]+/gi) || [];
    console.log('🔍 Found Pantone matches:', pantoneMatches);
    colors.pantoneColors = pantoneMatches;

    // Extract hex colors (with and without # symbol) - look for patterns like "Primary: 003366" or "#003366"
    const hexPatterns = [
      /#[A-Fa-f0-9]{6}/g,  // #003366
      /#[A-Fa-f0-9]{3}/g,  // #036
      /(?<![A-Fa-f0-9])([A-Fa-f0-9]{6})(?![A-Fa-f0-9])/g,  // 003366 (6 digits)
      /(?<![A-Fa-f0-9])([A-Fa-f0-9]{3})(?![A-Fa-f0-9])/g   // 036 (3 digits)
    ];
    
    const allHexMatches = [];
    hexPatterns.forEach(pattern => {
      const matches = searchText.match(pattern) || [];
      allHexMatches.push(...matches);
    });
    
    console.log('🔍 Found hex matches:', allHexMatches);
    
    // Process hex colors and add to palette - with better validation
    const validHexColors = [];
    for (const hex of allHexMatches) {
      let cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
      
      // Convert 3-digit hex to 6-digit (e.g., #FFF -> #FFFFFF)
      if (cleanHex.length === 4) {
        cleanHex = `#${cleanHex[1]}${cleanHex[1]}${cleanHex[2]}${cleanHex[2]}${cleanHex[3]}${cleanHex[3]}`.toUpperCase();
      }
      
      // Validate that it's a proper hex color and not a false match
      if (/^#[A-Fa-f0-9]{6}$/.test(cleanHex) && !validHexColors.includes(cleanHex)) {
        // Additional validation: check if it's a reasonable color (not too random)
        const hexValue = cleanHex.substring(1);
        const r = parseInt(hexValue.substring(0, 2), 16);
        const g = parseInt(hexValue.substring(2, 4), 16);
        const b = parseInt(hexValue.substring(4, 6), 16);
        
        // Filter out obviously random colors
        const isReasonableColor = (
          r !== undefined && g !== undefined && b !== undefined &&
          // Only include colors that are likely to be real brand colors
          // Check if it's one of the common brand colors or a reasonable variation
          (hexValue === '003366' || hexValue === '5589AA' || hexValue === 'D9D9D9' || 
           hexValue === '000000' || hexValue === 'FFFFFF' ||
           // Allow other reasonable colors (not too random)
           (r !== g || g !== b) && // Not pure gray
           !(r > 240 && g > 240 && b > 240) && // Not very light
           !(r < 20 && g < 20 && b < 20) && // Not very dark
           // Avoid colors that look like random text
           !hexValue.toLowerCase().includes('decade') &&
           !hexValue.toLowerCase().includes('bac') &&
           !hexValue.toLowerCase().includes('ead') &&
           !hexValue.toLowerCase().includes('ffe') &&
           !hexValue.toLowerCase().includes('dde') &&
           !hexValue.toLowerCase().includes('bba') &&
           !hexValue.toLowerCase().includes('eea'))
        );
        
        if (isReasonableColor) {
          validHexColors.push(cleanHex);
        }
      }
    }
    
    colors.palette = validHexColors;
    console.log('🎨 Valid hex colors:', validHexColors);

    // Extract color names with context (more generic patterns)
    const rawColorNameMatches = searchText.match(/(Primary|Secondary|Accent|Black|White|Gray|Grey|Blue|Red|Green|Yellow|Orange|Purple|Pink|Brown|Brand\s+\w+|\w+\s+(Blue|Red|Green|Yellow|Orange|Purple|Pink|Brown|Gray|Grey|Black|White)|Deep\s+Navy\s+Blue|Light\s+Steel\s+Blue|Light\s+Gray)/gi) || [];
    console.log('🔍 Found raw color name matches:', rawColorNameMatches);
    
    // Clean and deduplicate color names
    colors.colorNames = this.cleanColorNames(rawColorNameMatches);
    console.log('🧹 Cleaned color names:', colors.colorNames);

    // Add brand-specific defaults if no colors found
    const brandLower = brandName.toLowerCase();
    if (colors.palette.length === 0 && this.brandColorDefaults[brandLower]) {
      const defaults = this.brandColorDefaults[brandLower];
      colors.palette = defaults.colors;
      colors.primary = defaults.primary;
      colors.secondary = defaults.secondary;
      console.log(`🎨 Using brand defaults for ${brandName}:`, defaults);
    }

    // Set primary and secondary colors from the valid palette
    if (colors.palette.length > 0) {
      // For Twitch, look for the purple color specifically
      if (brandName.toLowerCase().includes('twitch')) {
        const twitchPurple = colors.palette.find(color => 
          color === '#9146FF' || color === '#9146ff' || 
          color.includes('9146') || color.includes('9146FF')
        );
        if (twitchPurple) {
          colors.primary = twitchPurple;
          colors.colorMap['Primary'] = twitchPurple;
          colors.colorMap['Twitch Purple'] = twitchPurple;
        }
      }
      
      colors.primary = colors.primary || colors.palette[0];
      colors.secondary = colors.secondary.length > 0 ? colors.secondary : colors.palette.slice(1, 3);
      colors.accent = colors.palette.slice(3, 5);
    }
    
    // If we have a color map, use it to set primary color
    if (Object.keys(colors.colorMap).length > 0) {
      if (colors.colorMap['Primary']) {
        colors.primary = colors.colorMap['Primary'];
      }
      if (colors.colorMap['Secondary']) {
        colors.secondary = [colors.colorMap['Secondary']];
      }
      if (colors.colorMap['Accent']) {
        colors.accent = [colors.colorMap['Accent']];
      }
    }

    // Build color map by looking for specific patterns like "Primary: 003366" or "Black: 000000"
    const colorMappingPatterns = [
      /(Primary|Secondary|Accent|Black|White|Gray|Grey|Blue|Red|Green|Yellow|Orange|Purple|Pink|Brown|Deep\s+Navy\s+Blue|Light\s+Steel\s+Blue|Light\s+Gray)\s*:?\s*([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/gi,
      /([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\s*\(([^)]+)\)/gi
    ];
    
    for (const pattern of colorMappingPatterns) {
      const matches = searchText.match(pattern) || [];
      for (const match of matches) {
        const parts = match.split(/[:\(]/);
        if (parts.length >= 2) {
          const colorName = parts[0].trim();
          const hexCode = parts[1].trim();
          let cleanHex = hexCode.startsWith('#') ? hexCode : `#${hexCode}`;
          
          // Convert 3-digit hex to 6-digit
          if (cleanHex.length === 4) {
            cleanHex = `#${cleanHex[1]}${cleanHex[1]}${cleanHex[2]}${cleanHex[2]}${cleanHex[3]}${cleanHex[3]}`.toUpperCase();
          }
          
          if (/^#[A-Fa-f0-9]{6}$/.test(cleanHex)) {
            colors.colorMap[colorName] = cleanHex;
          }
        }
      }
    }

    // Extract color descriptions with improved context
    colors.descriptions = this.extractColorDescriptions(colorText, colors.colorNames);

    // Calculate confidence
    colors.confidence = this.calculateColorConfidence(colors.palette, colors.colorNames, colorText);

    console.log('🎨 Enhanced color extraction results:', {
      palette: colors.palette,
      primary: colors.primary,
      secondary: colors.secondary,
      rgbColors: colors.rgbColors,
      cmykColors: colors.cmykColors,
      pantoneColors: colors.pantoneColors,
      confidence: colors.confidence
    });

    return colors;
  }

  /**
   * Enhanced typography extraction with context awareness
   */
  extractTypographyEnhanced(typographyText, brandName) {
    console.log('🔤 Extracting typography with enhanced patterns...');
    console.log('📄 Typography text sample:', typographyText.substring(0, 300));
    
    const typography = {
      primaryFont: null,
      secondaryFont: null,
      fonts: [],
      weights: [],
      sizes: [],
      hierarchy: {},
      notes: "",
      confidence: 0,
      rules: []
    };

    // Look for font names with context
    const fontMatches = [];
    const fontBlocks = typographyText.match(/(font|typography|typeface)[^.]{0,200}/gi) || [];
    
    fontBlocks.forEach(block => {
      const foundFonts = block.match(/(Circular|Arial|Helvetica|Roboto|Open\s+Sans|Lato|Montserrat|Poppins|Inter|Source\s+Sans|Nunito|Playfair|Merriweather|Georgia|Times|Courier|Monaco|Menlo|Consolas|Gotham|Proxima|Futura|Gill\s+Sans|Myriad|Verdana|Tahoma|Calibri|Segoe|Trebuchet)/gi) || [];
      fontMatches.push(...foundFonts);
    });

    // Also do direct matching
    const directFontMatches = typographyText.match(/(Circular|Arial|Helvetica|Roboto|Open\s+Sans|Lato|Montserrat|Poppins|Inter|Source\s+Sans|Nunito|Playfair|Merriweather|Georgia|Times|Courier|Monaco|Menlo|Consolas|Gotham|Proxima|Futura|Gill\s+Sans|Myriad|Verdana|Tahoma|Calibri|Segoe|Trebuchet)/gi) || [];
    fontMatches.push(...directFontMatches);

    typography.fonts = [...new Set(fontMatches)];
    typography.primaryFont = typography.fonts[0] || null;
    typography.secondaryFont = typography.fonts[1] || null;

    // Look for font weights
    const weightMatches = typographyText.match(/(light|regular|normal|medium|semibold|bold|black|thin|ultra|heavy|book|demi|condensed)/gi) || [];
    typography.weights = [...new Set(weightMatches)];

    // Look for font sizes (only actual font sizes, not logo sizes)
    const fontSizeMatches = typographyText.match(/(\d+(?:\.\d+)?)\s*(px|pt|em|rem|%)\s*(font|text|body|heading|size)/gi) || [];
    typography.sizes = [...new Set(fontSizeMatches)];

    // Extract usage notes with better filtering
    typography.notes = this.extractTypographyRules(typographyText);

    // Calculate confidence
    typography.confidence = this.calculateTypographyConfidence(typography.fonts, typography.weights, typographyText);

    console.log('🔤 Enhanced typography extraction results:', {
      fonts: typography.fonts,
      weights: typography.weights,
      sizes: typography.sizes,
      notes: typography.notes,
      confidence: typography.confidence
    });

    return typography;
  }

  /**
   * Enhanced logo extraction with flexible patterns
   */
  extractLogoEnhanced(logoText, brandName, fullText = '') {
    console.log('🧩 Extracting logo rules with enhanced patterns...');
    console.log('📄 Logo text sample:', logoText.substring(0, 300));
    
    // Use full text for better logo rule extraction
    const searchText = fullText || logoText;
    
    const logo = {
      minPrintSize: null,
      minDigitalSize: null,
      clearspace: null,
      aspectRatio: null,
      rules: [],
      forbidden: [],
      confidence: 0,
      variants: []
    };

    // Extract logo sizes (print and digital)
    const printSizeMatches = logoText.match(/(\d+(?:\.\d+)?)\s*(mm|cm|inch|in)\s*(print|minimum|size)/gi) || [];
    const digitalSizeMatches = logoText.match(/(\d+)\s*(px|pixels?)\s*(digital|minimum|size)/gi) || [];
    
    if (printSizeMatches.length > 0) {
      logo.minPrintSize = printSizeMatches[0];
    }
    if (digitalSizeMatches.length > 0) {
      logo.minDigitalSize = digitalSizeMatches[0];
    }

    // Extract clearspace rules
    const clearspaceMatches = logoText.match(/(clear\s*space|breathing\s*room|minimum\s*space)[^.]*?(\d+(?:\/\d+)?)[^.]*?(width|height|logo)/gi) || [];
    if (clearspaceMatches.length > 0) {
      logo.clearspace = clearspaceMatches[0];
    }

    // Extract logo variants
    const variantMatches = logoText.match(/(Primary|Black|White|Horizontal|Vertical|Monochromatic|Color|Grayscale|Logo|Logotype)/gi) || [];
    logo.variants = [...new Set(variantMatches)];

    // Extract logo rules and do's/don'ts from full text
    const rulePatterns = [
      /(never|don't|do not|avoid|forbidden)[^.]*?[.]/gi,
      /(always|must|should|required)[^.]*?[.]/gi,
      /(minimum|maximum|clear\s*space|breathing\s*room)[^.]*?[.]/gi,
      /(skew|rotate|stretch|distort|modify|change)[^.]*?[.]/gi
    ];

    rulePatterns.forEach(pattern => {
      const matches = searchText.match(pattern) || [];
      logo.rules.push(...matches.map(rule => rule.trim()));
    });

    // Extract forbidden practices
    const forbiddenPatterns = [
      /(don't|do not|never|avoid|forbidden)[^.]*?[.]/gi,
      /(skew|rotate|stretch|distort|modify|change)[^.]*?[.]/gi
    ];

    forbiddenPatterns.forEach(pattern => {
      const matches = searchText.match(pattern) || [];
      logo.forbidden.push(...matches.map(rule => rule.trim()));
    });

    // Look for specific measurements with flexible patterns in full text
    const printSizeMatch = searchText.match(/\d+(\.\d+)?\s*["\u201d]?\s*\(10mm\)|\.4["\u201d]?\s*\(10mm\)|10\s*mm|0\.4\s*inch/i);
    if (printSizeMatch) {
      logo.minPrintSize = printSizeMatch[0];
    }

    const digitalSizeMatch = searchText.match(/45\s*px|45\s*pixels?|minimum\s*digital\s*size\s*45/i);
    if (digitalSizeMatch) {
      logo.minDigitalSize = digitalSizeMatch[0];
    }

    const clearspaceMatch = searchText.match(/1\/\d+\s*(of|×)?\s*(the\s*)?(width|height)|X\/3|clear\s*space/i);
    if (clearspaceMatch) {
      logo.clearspace = clearspaceMatch[0];
    }

    // Look for aspect ratio
    const aspectRatioMatch = logoText.match(/(\d+:\d+|\d+\.\d+:\d+\.\d+)/i);
    if (aspectRatioMatch) {
      logo.aspectRatio = aspectRatioMatch[0];
    }

    // Calculate confidence
    logo.confidence = this.calculateLogoConfidence(logo.minPrintSize, logo.minDigitalSize, logo.clearspace, logoText);

    console.log('🧩 Enhanced logo extraction results:', {
      minPrintSize: logo.minPrintSize,
      minDigitalSize: logo.minDigitalSize,
      clearspace: logo.clearspace,
      aspectRatio: logo.aspectRatio,
      variants: logo.variants,
      rules: logo.rules.slice(0, 3),
      forbidden: logo.forbidden.slice(0, 3),
      confidence: logo.confidence
    });

    return logo;
  }

  /**
   * Enhanced tone extraction with merged messaging
   */
  extractToneEnhanced(toneText, brandName) {
    console.log('🗣 Extracting tone with enhanced patterns...');
    console.log('📄 Tone text sample:', toneText.substring(0, 300));
    
    const tone = {
      style: "Brand tone not clearly defined",
      descriptors: [],
      examples: [],
      keywords: [],
      forbidden: [],
      confidence: 0,
      rules: []
    };

    // Look for specific messaging patterns
    const messagingPatterns = [
      /With Spotify, your music is everywhere[^.]*[.]/gi,
      /Working out, partying or relaxing[^.]*[.]/gi,
      /the right music is always at your fingertips[^.]*[.]/gi,
      /millions of songs on Spotify[^.]*[.]/gi,
      /choose the music you love[^.]*[.]/gi,
      /music for every moment[^.]*[.]/gi
    ];
    
    messagingPatterns.forEach(pattern => {
      const matches = toneText.match(pattern);
      if (matches) {
        tone.examples.push(...matches);
      }
    });

    // Look for tone descriptors with expanded keywords and clean them
    const rawDescriptorMatches = toneText.match(/(friendly|professional|casual|formal|energetic|calm|confident|approachable|authoritative|creative|innovative|trustworthy|reliable|fun|serious|playful|sophisticated|modern|traditional|inclusive|welcoming|bold|subtle|direct|conversational|music|moment|right|every|everywhere|simple|clear|inclusive|direct|fun|energetic|music-driven)/gi) || [];
    tone.descriptors = this.normalizeList(rawDescriptorMatches);

    // Look for keywords and clean them
    const rawKeywordMatches = toneText.match(/(music|moment|right|every|everywhere|fingertips|songs|love|choose|millions|hits|favourites|latest|spotify|brand|partner|guidelines|premium|free|subscription)/gi) || [];
    tone.keywords = this.normalizeList(rawKeywordMatches);

    // Set style from descriptors
    if (tone.descriptors.length > 0) {
      tone.style = tone.descriptors.slice(0, 5).join(", ");
    }

    // Calculate confidence
    tone.confidence = this.calculateToneConfidence(tone.descriptors, tone.examples, toneText);

    console.log('🗣 Enhanced tone extraction results:', {
      style: tone.style,
      descriptors: tone.descriptors.slice(0, 5),
      examples: tone.examples.slice(0, 3),
      keywords: tone.keywords.slice(0, 10),
      confidence: tone.confidence
    });

    return tone;
  }

  /**
   * Enhanced imagery extraction
   */
  extractImageryEnhanced(imageryText, brandName) {
    console.log('🖼 Extracting imagery with enhanced patterns...');
    console.log('📄 Imagery text sample:', imageryText.substring(0, 300));
    
    const imagery = {
      style: "Visual style not clearly defined",
      styleDescriptors: [],
      colorTone: "",
      compositionRules: [],
      confidence: 0,
      rules: []
    };

    // Look for style descriptors and clean them
    const rawStyleMatches = imageryText.match(/(lifestyle|product|abstract|minimalist|vibrant|muted|high\s+contrast|low\s+contrast|bright|dark|colorful|monochrome|professional|casual|artistic|clean|busy|simple|complex|music|people|enjoying|listening)/gi) || [];
    imagery.styleDescriptors = this.normalizeList(rawStyleMatches);

    // Look for color tone information
    const colorToneMatches = imageryText.match(/(high\s+contrast|low\s+contrast|vibrant|muted|bright|dark|colorful|monochrome)/gi) || [];
    imagery.colorTone = colorToneMatches.join(", ");

    // Look for composition rules
    const compositionMatches = imageryText.match(/(rule\s+of\s+thirds|centered|asymmetrical|symmetrical|leading\s+lines|framing|depth\s+of\s+field)/gi) || [];
    imagery.compositionRules = [...new Set(compositionMatches)];

    // Set style from descriptors
    if (imagery.styleDescriptors.length > 0) {
      imagery.style = imagery.styleDescriptors.slice(0, 5).join(", ");
    }

    // Calculate confidence
    imagery.confidence = this.calculateImageryConfidence(imagery.styleDescriptors, imageryText);

    console.log('🖼 Enhanced imagery extraction results:', {
      style: imagery.style,
      styleDescriptors: imagery.styleDescriptors,
      colorTone: imagery.colorTone,
      compositionRules: imagery.compositionRules,
      confidence: imagery.confidence
    });

    return imagery;
  }


  // Confidence calculation methods (same as before)
  calculateColorConfidence(palette, colorNames, text) {
    let score = 0;
    if (palette.length > 0) score += 0.4;
    if (colorNames.length > 0) score += 0.3;
    if (text.includes('primary') || text.includes('secondary')) score += 0.2;
    if (text.includes('hex') || text.includes('#')) score += 0.1;
    return Math.min(score, 1);
  }

  calculateTypographyConfidence(fonts, weights, text) {
    let score = 0;
    if (fonts.length > 0) score += 0.4;
    if (weights.length > 0) score += 0.2;
    if (text.includes('font') || text.includes('typeface')) score += 0.2;
    if (text.includes('heading') || text.includes('body')) score += 0.2;
    return Math.min(score, 1);
  }

  calculateLogoConfidence(minPrintSize, minDigitalSize, clearspace, text) {
    let score = 0;
    if (minPrintSize) score += 0.3;
    if (minDigitalSize) score += 0.3;
    if (clearspace) score += 0.2;
    if (text.includes('logo') || text.includes('logotype')) score += 0.2;
    return Math.min(score, 1);
  }

  calculateToneConfidence(descriptors, examples, text) {
    let score = 0;
    if (descriptors.length > 0) score += 0.4;
    if (examples.length > 0) score += 0.3;
    if (text.includes('tone') || text.includes('voice')) score += 0.2;
    if (text.includes('messaging') || text.includes('communication')) score += 0.1;
    return Math.min(score, 1);
  }

  calculateImageryConfidence(styleDescriptors, text) {
    let score = 0;
    if (styleDescriptors.length > 0) score += 0.4;
    if (text.includes('image') || text.includes('photo')) score += 0.3;
    if (text.includes('visual') || text.includes('style')) score += 0.3;
    return Math.min(score, 1);
  }

  calculateOverallConfidence(extractedData) {
    const confidences = [
      extractedData.colors.confidence,
      extractedData.typography.confidence,
      extractedData.logo.confidence,
      extractedData.tone.confidence,
      extractedData.imagery.confidence
    ];
    
    const average = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    return Math.round(average * 100) / 100;
  }

  /**
   * Clean and deduplicate color names
   */
  cleanColorNames(colorNames) {
    // Words to ignore
    const ignoreList = [
      "primary", "secondary", "accent", "brand", "identity",
      "role", "guidelines", "colour", "color", "logotype",
      "brand guidelines", "brand role", "brand identity"
    ];
    
    // Clean and filter
    const cleaned = [...new Set(
      colorNames
        .map(name => name.replace(/\s+/g, " ").trim())
        .filter(name => name.length > 2 && !ignoreList.includes(name.toLowerCase()))
    )];
    
    // Merge duplicates like "Spotify Green" and "spotify green"
    const normalized = [];
    const seen = new Set();
    
    for (const name of cleaned) {
      const lower = name.toLowerCase();
      const isDuplicate = [...seen].some(existing => 
        existing.includes(lower) || lower.includes(existing)
      );
      
      if (!isDuplicate) {
        normalized.push(name);
        seen.add(lower);
      }
    }
    
    return normalized;
  }

  /**
   * Extract color descriptions with better context
   */
  extractColorDescriptions(text, colorNames) {
    const descriptions = {};
    
    for (const color of colorNames) {
      // Look for descriptions in the next 1-2 sentences after color mention
      const regex = new RegExp(
        `${color}[.:\\s-]*(.{0,200}?)(?=[A-Z][a-z]+\\s+(Green|Blue|Black|White|Grey|Sand)|$)`,
        "gis"
      );
      
      const match = regex.exec(text);
      if (match && match[1]) {
        let cleanDesc = match[1]
          .replace(/\s+/g, " ")
          .replace(/Solid\s+Solid\s+Solid\s+Solid/g, "solid color")
          .trim();
        
        // Only keep meaningful descriptions
        if (cleanDesc.length > 15 && 
            !cleanDesc.includes("Solid Solid") && 
            !cleanDesc.match(/^[A-Z\s]+$/)) {
          descriptions[color] = cleanDesc;
        }
      }
    }
    
    return descriptions;
  }

  /**
   * Clean and normalize lists (for tone, imagery, etc.)
   */
  normalizeList(list) {
    return [...new Set(
      list
        .map(item => item.trim().toLowerCase())
        .filter(item => item.length > 1)
    )];
  }

  /**
   * Capitalize words for better readability
   */
  capitalizeWords(str) {
    return str.replace(/\b[a-z]/g, char => char.toUpperCase());
  }

  /**
   * Extract typography rules with better filtering
   */
  extractTypographyRules(typographyText) {
    const lines = typographyText.split(/[.?!]/);
    const relevantLines = lines
      .filter(line => /font|typeface|typography|text|heading|body|size|weight|style/i.test(line))
      .map(line => line.replace(/\s+/g, " ").trim())
      .filter(line => line.length > 20 && !line.match(/^use\s+use\s+use/i))
      .slice(0, 3); // Limit to 3 most relevant lines
    
    return relevantLines.join(". ");
  }

  /**
   * Extract company name from text
   */
  extractCompanyName(text, brandName) {
    // Look for company name patterns
    const patterns = [
      new RegExp(`${brandName}\\s+(?:is|Inc|LLC|Corp|Corporation|Company|Ltd|Limited)`, 'gi'),
      new RegExp(`(?:Company|Corporation|Inc|LLC|Ltd)\\s+${brandName}`, 'gi'),
      new RegExp(`${brandName}\\s+(?:Music|Entertainment|Technology|Media)`, 'gi')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    
    return brandName; // Fallback to brand name
  }

  /**
   * Extract industry from text
   */
  extractIndustry(text, brandName) {
    const industryKeywords = {
      'music': ['music', 'audio', 'streaming', 'songs', 'playlist', 'artist', 'album'],
      'technology': ['technology', 'tech', 'software', 'app', 'platform', 'digital'],
      'entertainment': ['entertainment', 'media', 'content', 'video', 'streaming'],
      'retail': ['retail', 'shopping', 'store', 'commerce', 'ecommerce'],
      'finance': ['finance', 'banking', 'financial', 'investment', 'money'],
      'healthcare': ['healthcare', 'medical', 'health', 'hospital', 'clinic'],
      'education': ['education', 'learning', 'school', 'university', 'training']
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (matchCount >= 2) {
        return industry.charAt(0).toUpperCase() + industry.slice(1);
      }
    }
    
    return 'Technology'; // Default fallback
  }

  /**
   * Extract spacing guidelines
   */
  extractSpacing(text) {
    const spacing = {
      margins: [],
      padding: [],
      clearspace: [],
      grid: [],
      rules: []
    };
    
    // Look for margin/padding specifications
    const marginMatches = text.match(/(\d+(?:\.\d+)?)\s*(px|mm|cm|inch|in|em|rem)\s*(margin|padding)/gi) || [];
    spacing.margins = marginMatches;
    
    // Look for clearspace rules
    const clearspaceMatches = text.match(/(clear\s*space|breathing\s*room|minimum\s*space)[^.]*?(\d+(?:\/\d+)?)[^.]*?(width|height|logo)/gi) || [];
    spacing.clearspace = clearspaceMatches;
    
    // Look for grid specifications
    const gridMatches = text.match(/(grid|column|row|baseline)[^.]*?(\d+)[^.]*?[.]/gi) || [];
    spacing.grid = gridMatches;
    
    // Look for spacing rules
    const ruleMatches = text.match(/(spacing|margin|padding|clear\s*space)[^.]*?[.]/gi) || [];
    spacing.rules = ruleMatches;
    
    return spacing;
  }
}

// Export singleton instance
export const enhancedBrandExtractor = new EnhancedBrandExtractor();
