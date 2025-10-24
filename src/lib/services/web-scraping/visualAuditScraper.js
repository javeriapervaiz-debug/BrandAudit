// @ts-nocheck
import puppeteer from 'puppeteer';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

export class VisualAuditScraper {
  constructor() {
    this.screenshotDir = 'screenshots';
    this.ensureScreenshotDir();
  }

  ensureScreenshotDir() {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async scrapeWithVisualAnnotations(url) {
    console.log(`🎯 Starting visual audit scraping for: ${url}`);
    
    const scrapedData = await this.enhancedScraping(url);
    const screenshotPath = await this.captureFullPageScreenshot(url);
    const elementPositions = await this.extractElementPositions(url);
    
    return {
      ...scrapedData,
      visualData: {
        screenshot: screenshotPath,
        elementPositions: elementPositions,
        viewport: scrapedData.viewport,
        timestamp: new Date().toISOString()
      }
    };
  }

  async captureFullPageScreenshot(url) {
    let browser = null;
    
    try {
      console.log(`📸 Capturing full page screenshot for: ${url}`);
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Handle file:// URLs differently
      if (url.startsWith('file://')) {
        console.log(`📁 Handling local file: ${url}`);
        let filePath = url;
        if (url.startsWith('file://') && !url.startsWith('file:///')) {
          filePath = url.replace('file://', 'file:///');
        }
        // For Windows paths, ensure proper formatting
        if (process.platform === 'win32' && filePath.includes('C:')) {
          filePath = filePath.replace('file:///C:', 'file:///C:');
        }
        
        console.log(`📁 Processed file path: ${filePath}`);
        await page.goto(filePath, { waitUntil: 'domcontentloaded', timeout: 15000 });
      } else {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      }
      
      // Wait for content to load
      await this.waitForContent(page);
      
      // Ensure page has content before taking screenshot
      const pageContent = await page.evaluate(() => {
        return {
          bodyHeight: document.body.scrollHeight,
          bodyWidth: document.body.scrollWidth,
          hasContent: document.body.innerHTML.length > 100
        };
      });
      
      console.log(`📏 Page dimensions: ${pageContent.bodyWidth}x${pageContent.bodyHeight}, has content: ${pageContent.hasContent}`);
      
      if (!pageContent.hasContent || pageContent.bodyHeight === 0) {
        throw new Error('Page has no content or zero height');
      }
      
      // Set a minimum viewport size if needed
      if (pageContent.bodyWidth < 800) {
        await page.setViewport({ width: 1200, height: 800 });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Capture full page screenshot
      const screenshotPath = path.join(this.screenshotDir, `${Date.now()}-audit.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        type: 'png'
      });
      
      console.log(`✅ Screenshot saved to: ${screenshotPath}`);
      return screenshotPath;
      
    } catch (error) {
      console.error('❌ Screenshot capture failed:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async enhancedScraping(url) {
    let browser = null;
    
    try {
      console.log(`🔍 Starting enhanced scraping for: ${url}`);
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Handle file:// URLs differently
      if (url.startsWith('file://')) {
        console.log(`📁 Handling local file: ${url}`);
        let filePath = url;
        if (url.startsWith('file://') && !url.startsWith('file:///')) {
          filePath = url.replace('file://', 'file:///');
        }
        // For Windows paths, ensure proper formatting
        if (process.platform === 'win32' && filePath.includes('C:')) {
          filePath = filePath.replace('file:///C:', 'file:///C:');
        }
        
        console.log(`📁 Processed file path: ${filePath}`);
        await page.goto(filePath, { waitUntil: 'domcontentloaded', timeout: 15000 });
      } else {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      }
      
      // Wait for content to load
      await this.waitForContent(page);
      
      // Extract comprehensive data
      const websiteData = await this.extractComprehensiveData(page, url);
      
      console.log(`✅ Enhanced scraping completed: ${websiteData.elements.length} elements, ${websiteData.colors.length} colors, ${websiteData.fonts.length} fonts`);
      return websiteData;
      
    } catch (error) {
      console.error('❌ Enhanced scraping failed:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async extractElementPositions(url) {
    let browser = null;
    
    try {
      console.log(`📍 Extracting element positions for: ${url}`);
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Handle file:// URLs differently
      if (url.startsWith('file://')) {
        console.log(`📁 Handling local file: ${url}`);
        let filePath = url;
        if (url.startsWith('file://') && !url.startsWith('file:///')) {
          filePath = url.replace('file://', 'file:///');
        }
        // For Windows paths, ensure proper formatting
        if (process.platform === 'win32' && filePath.includes('C:')) {
          filePath = filePath.replace('file:///C:', 'file:///C:');
        }
        
        console.log(`📁 Processed file path: ${filePath}`);
        await page.goto(filePath, { waitUntil: 'domcontentloaded', timeout: 15000 });
      } else {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      }
      
      // Wait for content to load
      await this.waitForContent(page);
      
      // Extract elements with their positions
      const elements = await page.evaluate(() => {
        const elements = [];
        
        // Get all relevant elements
        const selectors = [
          'h1, h2, h3, h4, h5, h6',
          'p, span, div[class*="text"]',
          'a, button',
          'img[src*="logo"], [class*="logo"]',
          'header, footer, nav',
          'div[class*="card"], section, article'
        ];
        
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 10 && rect.height > 10) { // Filter tiny elements
              elements.push({
                tag: el.tagName.toLowerCase(),
                text: el.textContent?.slice(0, 100) || '',
                classes: el.className || '',
                id: el.id || '',
                position: {
                  x: Math.round(rect.x),
                  y: Math.round(rect.y),
                  width: Math.round(rect.width),
                  height: Math.round(rect.height)
                },
                styles: {
                  color: getComputedStyle(el).color,
                  backgroundColor: getComputedStyle(el).backgroundColor,
                  fontSize: getComputedStyle(el).fontSize,
                  fontFamily: getComputedStyle(el).fontFamily,
                  fontWeight: getComputedStyle(el).fontWeight
                }
              });
            }
          });
        });
        
        return elements;
      });
      
      console.log(`✅ Extracted ${elements.length} element positions`);
      return elements;
      
    } catch (error) {
      console.error('❌ Element position extraction failed:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async waitForContent(page) {
    try {
      // Wait for basic content
      await page.waitForSelector('body', { timeout: 5000 });
      
      // Wait for any dynamic content using delay instead of waitForTimeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.warn('⚠️ Content waiting failed:', error.message);
    }
  }

  async extractComprehensiveData(page, url) {
    try {
      // Extract colors
      const colors = await page.evaluate(() => {
        const colorSet = new Set();
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
          const styles = getComputedStyle(el);
          if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
            colorSet.add(styles.color);
          }
          if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            colorSet.add(styles.backgroundColor);
          }
        });
        
        return Array.from(colorSet);
      });

      // Extract fonts
      const fonts = await page.evaluate(() => {
        const fontSet = new Set();
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
          const styles = getComputedStyle(el);
          if (styles.fontFamily) {
            fontSet.add(styles.fontFamily);
          }
        });
        
        return Array.from(fontSet);
      });

      // Extract elements
      const elements = await page.evaluate(() => {
        const elements = [];
        const selectors = [
          'h1, h2, h3, h4, h5, h6',
          'p, span, div',
          'a, button',
          'img',
          'header, footer, nav',
          'section, article'
        ];
        
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            elements.push({
              tag: el.tagName.toLowerCase(),
              text: el.textContent?.slice(0, 100) || '',
              classes: el.className || '',
              id: el.id || ''
            });
          });
        });
        
        return elements;
      });

      return {
        url,
        colors,
        fonts,
        elements,
        viewport: { width: 1920, height: 1080 },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Data extraction failed:', error);
      throw error;
    }
  }
}
