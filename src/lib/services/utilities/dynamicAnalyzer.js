// Dynamic Website Analyzer Service - JavaScript version
import { BrandGuidelineRepository } from '../../repositories/brandGuidelineRepository.js';
import { AnalysisRepository } from '../../repositories/analysisRepository.js';
import { MultiStrategyScraper } from '../web-scraping/multiStrategyScraper.js';

export class DynamicWebsiteAnalyzer {
  constructor() {
    this.guidelineRepo = new BrandGuidelineRepository();
    this.analysisRepo = new AnalysisRepository();
    this.scraper = new MultiStrategyScraper();
  }

  /**
   * Analyze website against brand guidelines
   * @param {string} url - Website URL to analyze
   * @param {string} brandName - Brand name to analyze against
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeWebsite(url, brandName) {
    try {
      // Validate inputs
      if (!url) {
        throw new Error('URL is required for analysis');
      }
      if (!brandName) {
        throw new Error('Brand name is required for analysis');
      }

      console.log(`🔍 Starting analysis for ${url} against ${brandName}...`);

      // Step 1: Get brand guidelines from database
      const guideline = await this.guidelineRepo.findByBrandName(brandName);
      if (!guideline) {
        throw new Error(`No brand guidelines found for "${brandName}". Available brands: Apple, Buffer, GitHub, Habib Bank, SaaSGamma, Switcher`);
      }

      console.log(`✅ Found brand guidelines for ${guideline.brandName}`);
      console.log('🎨 Brand colors loaded:', JSON.stringify(guideline.colors, null, 2));
      console.log('🔤 Brand typography loaded:', JSON.stringify(guideline.typography, null, 2));
      console.log('🏷️ Brand logo loaded:', JSON.stringify(guideline.logo, null, 2));

      // Step 2: Scrape website data using enhanced scraper
      const websiteData = await this.scraper.scrapeWebsite(url);
      console.log(`✅ Scraped website data: ${websiteData.elements.length} elements, ${websiteData.colors.length} colors`);

      // Step 3: Perform analysis
      const analysis = await this.performAnalysis(websiteData, guideline);
      console.log(`✅ Analysis complete: ${analysis.violations.length} violations found`);

      // Step 4: Store analysis results
      const analysisResult = await this.analysisRepo.create({
        brandGuidelineId: guideline.id,
        websiteUrl: url,
        violations: JSON.stringify(analysis.violations),
        correctElements: JSON.stringify(analysis.correctElements || []),
        score: analysis.score,
        totalViolations: analysis.violations.length,
        severityBreakdown: JSON.stringify(analysis.severityBreakdown || {}),
        analysisType: 'brand_audit',
        processingTime: analysis.processingTime || 0,
        elementsAnalyzed: analysis.elementsAnalyzed || 0
      });

      console.log(`✅ Analysis results stored with ID: ${analysisResult.id}`);

      return {
        success: true,
        brandName: guideline.brandName,
        websiteUrl: url,
        analysis: analysis,
        analysisId: analysisResult.id
      };

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Scrape website data
   * @param {string} url - Website URL
   * @returns {Promise<Object>} Scraped website data
   */
  // Old scrapeWebsite method removed - now using MultiStrategyScraper

  /**
   * Perform analysis against brand guidelines
   * @param {Object} websiteData - Scraped website data
   * @param {Object} guideline - Brand guidelines
   * @returns {Promise<Object>} Analysis result
   */
  async performAnalysis(websiteData, guideline) {
    const violations = [];
    const correctElements = [];

    // Parse guideline data
    const colors = typeof guideline.colors === 'string' ? JSON.parse(guideline.colors) : guideline.colors;
    const typography = typeof guideline.typography === 'string' ? JSON.parse(guideline.typography) : guideline.typography;
    const logo = typeof guideline.logo === 'string' ? JSON.parse(guideline.logo) : guideline.logo;
    const tone = typeof guideline.tone === 'string' ? JSON.parse(guideline.tone) : guideline.tone;

    // Analyze colors
    const colorViolations = this.analyzeColors(websiteData, colors);
    violations.push(...colorViolations);

    // Analyze typography
    const typographyViolations = this.analyzeTypography(websiteData, typography);
    violations.push(...typographyViolations);

    // Analyze logo
    const logoViolations = this.analyzeLogo(websiteData, logo);
    violations.push(...logoViolations);

    // Analyze tone of voice
    const toneViolations = this.analyzeToneOfVoice(websiteData, tone);
    violations.push(...toneViolations);

    // Calculate score
    const totalElements = websiteData.elements.length;
    const violationCount = violations.length;
    const score = Math.max(0, Math.round(((totalElements - violationCount) / totalElements) * 100));

    // Categorize violations by severity
    const severityBreakdown = {
      critical: violations.filter(v => v.severity === 'critical').length,
      high: violations.filter(v => v.severity === 'high').length,
      medium: violations.filter(v => v.severity === 'medium').length,
      low: violations.filter(v => v.severity === 'low').length
    };

    return {
      score,
      violations,
      correctElements,
      severityBreakdown,
      summary: {
        totalElements,
        violationCount,
        score,
        brandName: guideline.brandName
      }
    };
  }

  /**
   * Analyze colors against brand guidelines
   * @param {Object} websiteData - Website data
   * @param {Object} brandColors - Brand color guidelines
   * @returns {Array} Color violations
   */
  analyzeColors(websiteData, brandColors) {
    const violations = [];
    const foundColors = websiteData.colors || [];
    
    // Handle null or undefined brandColors
    if (!brandColors) {
      console.log('⚠️ No brand colors found in guidelines');
      return violations;
    }
    
    console.log('🎨 Brand colors loaded:', brandColors);
    
    // Get approved colors from brand guidelines
    const approvedColors = [];
    const approvedColorNames = [];
    
    // Extract colors from different sections
    if (brandColors.semantic) {
      Object.entries(brandColors.semantic).forEach(([name, color]) => {
        if (color && color.hex) {
          approvedColors.push(color.hex.toLowerCase());
          approvedColorNames.push(`${name}: ${color.hex}`);
        }
      });
    }
    if (brandColors.neutral) {
      Object.entries(brandColors.neutral).forEach(([name, color]) => {
        if (color && color.hex) {
          approvedColors.push(color.hex.toLowerCase());
          approvedColorNames.push(`${name}: ${color.hex}`);
        }
      });
    }
    if (brandColors.primary) {
      Object.entries(brandColors.primary).forEach(([name, color]) => {
        if (color && color.hex) {
          approvedColors.push(color.hex.toLowerCase());
          approvedColorNames.push(`${name}: ${color.hex}`);
        }
      });
    }

    console.log('✅ Approved colors:', approvedColors);
    console.log('📝 Approved color names:', approvedColorNames);

    // Clean and normalize found colors
    const cleanFoundColors = foundColors
      .filter(color => color && typeof color === 'string')
      .map(color => {
        // Remove CSS artifacts and normalize
        let cleanColor = color.replace(/[^#a-fA-F0-9]/g, '').toLowerCase();
        if (cleanColor.startsWith('#')) {
          return cleanColor;
        }
        // Convert rgba to hex if possible
        const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (rgbaMatch) {
          const r = parseInt(rgbaMatch[1]);
          const g = parseInt(rgbaMatch[2]);
          const b = parseInt(rgbaMatch[3]);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        return cleanColor;
      })
      .filter(color => color && color.length > 0);

    console.log('🔍 Clean found colors:', cleanFoundColors);

    // Check for forbidden colors
    const forbiddenColors = brandColors.forbidden || [];
    
    // Group similar violations to avoid duplicates
    const colorViolations = new Map();
    
    cleanFoundColors.forEach(color => {
      if (!color) return;
      
      const normalizedColor = color.toLowerCase();
      
      // Check if color is forbidden
      if (forbiddenColors.includes(normalizedColor)) {
        const key = `forbidden_${normalizedColor}`;
        if (!colorViolations.has(key)) {
          colorViolations.set(key, {
            elementType: 'color_usage',
            issueType: 'color',
            issue: 'Forbidden color detected',
            location: 'Global color usage',
            elementText: 'Forbidden color found in design',
            found: `Forbidden color: ${color}`,
            expected: `Use only approved brand colors: ${approvedColorNames.join(', ')}`,
            suggestion: `🚫 Remove ${color} and replace with an approved brand color from the palette.`,
            severity: 'high',
            impact: 'Brand consistency compromised',
            priority: 'Fix immediately',
            foundColors: [color],
            expectedColors: approvedColorNames
          });
        }
      }
      // Check if color is unapproved
      else if (!approvedColors.includes(normalizedColor)) {
        const key = `unapproved_${normalizedColor}`;
        if (!colorViolations.has(key)) {
          colorViolations.set(key, {
            elementType: 'color_usage',
            issueType: 'color',
            issue: 'Unapproved color detected',
            location: 'Global color usage',
            elementText: 'Color not in brand palette',
            found: `Unapproved color: ${color}`,
            expected: `Use only approved brand colors: ${approvedColorNames.join(', ')}`,
            suggestion: `🎨 Replace ${color} with an approved brand color from the palette.`,
            severity: 'medium',
            impact: 'Brand consistency affected',
            priority: 'Review and update',
            foundColors: [color],
            expectedColors: approvedColorNames
          });
        }
      }
    });

    // Convert map to array
    violations.push(...Array.from(colorViolations.values()));

    return violations;
  }

  /**
   * Analyze typography against brand guidelines
   * @param {Object} websiteData - Website data
   * @param {Object} brandTypography - Brand typography guidelines
   * @returns {Array} Typography violations
   */
  analyzeTypography(websiteData, brandTypography) {
    const violations = [];
    const elements = websiteData.elements || [];
    
    // Handle null or undefined brandTypography
    if (!brandTypography) {
      return violations;
    }

    // Get approved fonts
    const approvedFonts = [];
    if (brandTypography.fonts) {
      if (brandTypography.fonts.primary) approvedFonts.push(brandTypography.fonts.primary.toLowerCase());
      if (brandTypography.fonts.fallback) approvedFonts.push(brandTypography.fonts.fallback.toLowerCase());
      if (brandTypography.fonts.monospace) approvedFonts.push(brandTypography.fonts.monospace.toLowerCase());
    }

    // Check each element's typography
    elements.forEach(element => {
      const fontFamily = element.styles['font-family'];
      if (fontFamily) {
        const normalizedFont = fontFamily.toLowerCase();
        const isApproved = approvedFonts.some(approved => normalizedFont.includes(approved));
        
        if (!isApproved) {
          violations.push({
            elementType: 'typography',
            issueType: 'font',
            issue: 'Incorrect font family',
            location: `${element.type} element`,
            elementText: element.text.substring(0, 50) + (element.text.length > 50 ? '...' : ''),
            found: `Font: ${fontFamily}`,
            expected: `Approved fonts: ${approvedFonts.join(', ')}`,
            suggestion: `🔤 Change font from "${fontFamily}" to an approved brand font.`,
            severity: 'medium',
            impact: 'Typography consistency affected',
            priority: 'Update font family'
          });
        }
      }
    });

    return violations;
  }

  /**
   * Analyze logo usage against brand guidelines
   * @param {Object} websiteData - Website data
   * @param {Object} brandLogo - Brand logo guidelines
   * @returns {Array} Logo violations
   */
  analyzeLogo(websiteData, brandLogo) {
    const violations = [];
    const images = websiteData.images || [];
    
    // Handle null or undefined brandLogo
    if (!brandLogo) {
      console.log('⚠️ No brand logo guidelines found');
      return violations;
    }

    console.log('🏷️ Brand logo guidelines loaded:', brandLogo);

    // Get logo requirements from guidelines
    const logoRequirements = [];
    if (brandLogo.variants) {
      Object.entries(brandLogo.variants).forEach(([name, variant]) => {
        if (variant.description) {
          logoRequirements.push(`${name}: ${variant.description}`);
        }
      });
    }
    if (brandLogo.rules && brandLogo.rules.length > 0) {
      logoRequirements.push(...brandLogo.rules);
    }

    // Check for logo presence
    const hasLogo = images.some(img => 
      img.alt && img.alt.toLowerCase().includes('logo')
    );

    if (!hasLogo) {
      violations.push({
        elementType: 'logo',
        issueType: 'logo',
        issue: 'Logo not found',
        location: 'Website header/navigation',
        elementText: 'No logo detected',
        found: 'No logo found on website',
        expected: logoRequirements.length > 0 
          ? `Logo should be prominently displayed. Requirements: ${logoRequirements.join(', ')}`
          : 'Logo should be prominently displayed in the header or navigation area',
        suggestion: '🏷️ Add your brand logo to the website header or navigation area.',
        severity: 'high',
        impact: 'Brand recognition compromised',
        priority: 'Add logo immediately',
        expectedLogo: logoRequirements
      });
    }

    return violations;
  }

  /**
   * Analyze tone of voice against brand guidelines
   * @param {Object} websiteData - Website data
   * @param {Object} brandTone - Brand tone guidelines
   * @returns {Array} Tone violations
   */
  analyzeToneOfVoice(websiteData, brandTone) {
    const violations = [];
    const elements = websiteData.elements || [];

    // Handle null or undefined brandTone
    if (!brandTone) {
      return violations;
    }

    // Get tone guidelines
    const forbiddenWords = brandTone.forbidden || [];
    const toneStyle = brandTone.style || '';

    // Check text content for tone violations
    elements.forEach(element => {
      if (element.text) {
        const text = element.text.toLowerCase();
        
        // Check for forbidden words
        forbiddenWords.forEach(forbiddenWord => {
          if (text.includes(forbiddenWord.toLowerCase())) {
            violations.push({
              elementType: 'tone',
              issueType: 'tone',
              issue: 'Forbidden word detected',
              location: `${element.type} element`,
              elementText: element.text.substring(0, 100) + (element.text.length > 100 ? '...' : ''),
              found: `Forbidden word: "${forbiddenWord}"`,
              expected: 'Use approved brand language',
              suggestion: `📝 Replace "${forbiddenWord}" with brand-appropriate language.`,
              severity: 'medium',
              impact: 'Brand voice consistency affected',
              priority: 'Update content'
            });
          }
        });
      }
    });

    return violations;
  }
}
