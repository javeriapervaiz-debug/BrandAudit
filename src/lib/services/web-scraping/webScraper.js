import { MultiStrategyScraper } from './multiStrategyScraper.js';
import { EnhancedWebScraper } from './enhancedWebScraper.js';

export class WebScraper {
  constructor() {
    this.multiStrategyScraper = new MultiStrategyScraper();
    this.enhancedScraper = new EnhancedWebScraper();
  }

  /**
   * Close browser instance
   */
  async close() {
    // Enhanced scraper handles its own browser cleanup
    console.log('🧹 WebScraper cleanup completed');
  }

  /**
   * Scrape a webpage and extract brand elements
   */
  async scrapeWebpage(url, options = {}) {
    try {
      console.log(`🌐 Starting enhanced scraping for: ${url}`);
      
      // Try multi-strategy scraper first (most robust)
      let scrapedData;
      try {
        scrapedData = await this.multiStrategyScraper.scrapeWebsite(url);
        console.log(`✅ Multi-strategy scraper succeeded`);
      } catch (error) {
        console.warn(`⚠️ Multi-strategy scraper failed, trying enhanced scraper: ${error.message}`);
        scrapedData = await this.enhancedScraper.scrapeWebsite(url);
        console.log(`✅ Enhanced scraper succeeded`);
      }

      // Convert the enhanced scraper format to our expected format
      const convertedData = this.convertToBrandFormat(scrapedData, url);
      
      console.log(`✅ Successfully scraped ${url}`);
      return convertedData;

    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error);
      throw error;
    }
  }

  /**
   * Convert enhanced scraper data to brand format
   */
  convertToBrandFormat(scrapedData, url) {
    console.log('🔄 Converting enhanced scraper data to brand format...');
    
    // Extract colors from the enhanced data
    const colors = {
      palette: scrapedData.colors || [],
      primary: scrapedData.colors?.[0] || null,
      secondary: scrapedData.colors?.slice(1, 3) || [],
      accent: scrapedData.colors?.slice(3, 5) || [],
      rgbColors: [],
      cmykColors: [],
      pantoneColors: [],
      colorNames: [],
      descriptions: {},
      colorMap: {},
      confidence: 0.8,
      rules: []
    };

    // Extract typography
    const typography = {
      primaryFont: scrapedData.fonts?.[0] || null,
      secondaryFont: scrapedData.fonts?.[1] || null,
      fonts: scrapedData.fonts || [],
      weights: [],
      sizes: [],
      hierarchy: {},
      notes: '',
      confidence: 0.7,
      rules: []
    };

    // Extract logo information
    const logoImages = scrapedData.images?.filter(img => img.type === 'logo') || [];
    const logo = {
      found: logoImages.length > 0,
      src: logoImages[0]?.src || null,
      alt: logoImages[0]?.alt || null,
      width: logoImages[0]?.width || null,
      height: logoImages[0]?.height || null,
      minPrintSize: null,
      minDigitalSize: null,
      clearspace: null,
      aspectRatio: logoImages[0] ? (logoImages[0].width / logoImages[0].height) : null,
      rules: [],
      forbidden: [],
      confidence: logoImages.length > 0 ? 0.9 : 0,
      variants: []
    };

    // Extract layout information
    const layout = {
      gridSystem: null,
      maxWidth: null,
      breakpoints: [],
      spacing: [],
      sections: scrapedData.layout?.sections || [],
      navigation: scrapedData.layout?.navigation || null,
      footer: scrapedData.layout?.footer || null,
      confidence: 0.6
    };

    // Extract imagery
    const imagery = {
      images: scrapedData.images || [],
      imageCount: scrapedData.images?.length || 0,
      averageSize: null,
      aspectRatios: [],
      altTextUsage: scrapedData.images?.filter(img => img.alt).length || 0,
      confidence: 0.7
    };

    // Extract component-specific data for detailed analysis
    const components = scrapedData.components || {
      headings: [],
      paragraphs: [],
      buttons: [],
      links: [],
      navigation: [],
      forms: [],
      cards: [],
      sections: []
    };

    return {
      url,
      title: scrapedData.metadata?.title || '',
      description: scrapedData.metadata?.description || '',
      favicon: '',
      colors,
      typography,
      logo,
      layout,
      imagery,
      components, // Add component-specific data
      screenshot: scrapedData.screenshot || null, // Pass through screenshot
      metadata: {
        scrapedAt: new Date().toISOString(),
        engine: 'enhanced',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        viewport: { width: 1920, height: 1080 },
        timestamp: Date.now(),
        elementsCount: scrapedData.elements?.length || 0
      }
    };
  }

  /**
   * Capture screenshot of the current page
   */
  async captureScreenshot() {
    try {
      // This would need to be implemented in the enhanced scraper
      // For now, return null as the enhanced scraper handles its own browser
      console.log('📸 Screenshot capture not implemented in current scraper');
      return null;
    } catch (error) {
      console.warn('⚠️ Screenshot capture failed:', error.message);
      return null;
    }
  }
}

// Export singleton instance
export const webScraper = new WebScraper();