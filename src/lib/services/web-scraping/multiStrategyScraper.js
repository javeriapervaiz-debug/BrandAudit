import { EnhancedWebScraper } from './enhancedWebScraper.js';
import { PlaywrightScraper } from './playwrightScraper.js';

export class MultiStrategyScraper {
  constructor() {
    this.strategies = [
      new EnhancedWebScraper(),
      new PlaywrightScraper(),
    ];
  }

  async scrapeWebsite(url) {
    const errors = [];
    
    console.log(`🚀 Starting multi-strategy scraping for: ${url}`);
    
    for (let i = 0; i < this.strategies.length; i++) {
      const strategy = this.strategies[i];
      
      try {
        console.log(`📋 Trying strategy ${i + 1}/${this.strategies.length}: ${strategy.constructor.name}`);
        
        let result;
        if (strategy.constructor.name === 'EnhancedWebScraper') {
          // Try normal scraping first
          result = await strategy.scrapeWebsite(url);
          
          // If we got minimal data, try SPA approach
          if (result.elements.length < 10) {
            console.log(`🔄 Minimal data detected, trying SPA approach...`);
            result = await strategy.scrapeSPA(url, ['scroll', 'click']);
          }
        } else {
          result = await strategy.scrapeWebsite(url);
        }
        
        if (result && result.elements && result.elements.length > 0) {
          console.log(`✅ Success with ${strategy.constructor.name}: ${result.elements.length} elements found`);
          return result;
        } else {
          throw new Error('No elements extracted');
        }
      } catch (error) {
        errors.push(`${strategy.constructor.name}: ${error.message}`);
        console.warn(`❌ Strategy ${strategy.constructor.name} failed:`, error.message);
      }
    }

    // If all strategies failed, try a basic fallback
    console.log(`🔄 All strategies failed, trying basic fallback...`);
    try {
      const fallbackResult = await this.basicFallback(url);
      if (fallbackResult && fallbackResult.elements && fallbackResult.elements.length > 0) {
        console.log(`✅ Fallback successful: ${fallbackResult.elements.length} elements found`);
        return fallbackResult;
      }
    } catch (fallbackError) {
      errors.push(`Basic Fallback: ${fallbackError.message}`);
    }

    throw new Error(`All scraping strategies failed for ${url}:\n${errors.join('\n')}`);
  }

  async basicFallback(url) {
    // Basic fetch fallback for simple sites
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      return this.parseHTML(html, url);
    } catch (error) {
      throw new Error(`Basic fallback failed: ${error.message}`);
    }
  }

  parseHTML(html, url) {
    // Simple HTML parsing without DOM library
    const elements = [];
    const colors = new Set();
    const fonts = new Set();
    
    // Extract basic text content
    const textMatches = html.match(/<[^>]*>([^<]+)<\/[^>]*>/g) || [];
    textMatches.forEach((match, index) => {
      const text = match.replace(/<[^>]*>/g, '').trim();
      if (text && text.length > 0 && text.length < 200) {
        elements.push({
          type: 'text',
          text: text,
          styles: {},
          attributes: {},
          index: index
        });
      }
    });

    // Extract colors from style attributes
    const colorMatches = html.match(/color:\s*([^;]+)/g) || [];
    colorMatches.forEach(match => {
      const color = match.replace('color:', '').trim();
      if (color && color !== 'transparent') {
        colors.add(color);
      }
    });

    // Extract fonts from style attributes
    const fontMatches = html.match(/font-family:\s*([^;]+)/g) || [];
    fontMatches.forEach(match => {
      const font = match.replace('font-family:', '').trim();
      if (font) {
        font.split(',').forEach(f => {
          const cleanFont = f.trim().replace(/['"]/g, '');
          if (cleanFont && cleanFont !== 'serif' && cleanFont !== 'sans-serif') {
            fonts.add(cleanFont);
          }
        });
      }
    });

    return {
      elements: elements.slice(0, 100),
      colors: Array.from(colors),
      fonts: Array.from(fonts),
      images: [],
      buttons: [],
      layout: {
        sections: [],
        navigation: null,
        footer: null,
      },
      metadata: {
        title: this.extractTitle(html),
        description: this.extractDescription(html),
        url: url,
      },
    };
  }

  extractTitle(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  extractDescription(html) {
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    return descMatch ? descMatch[1].trim() : '';
  }
}
