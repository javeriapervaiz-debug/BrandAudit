// @ts-nocheck
import puppeteer from 'puppeteer';

export class EnhancedWebScraper {
  constructor() {
    this.browser = null;
  }

  async scrapeWebsite(url) {
    let browser = null;
    
    try {
      console.log(`🌐 Starting enhanced scraping for: ${url}`);
      
      // Launch browser with anti-detection measures
      browser = await this.launchBrowser();
      const page = await browser.newPage();
      
      // Set up page to avoid detection
      await this.setupPage(page);
      
      // Handle file:// URLs differently
      if (url.startsWith('file://')) {
        console.log(`📁 Handling local file: ${url}`);
        // For local files, ensure we have the correct file:/// format
        let filePath = url;
        if (url.startsWith('file://') && !url.startsWith('file:///')) {
          filePath = url.replace('file://', 'file:///');
        }
        console.log(`📁 Converted file path: ${filePath}`);
        
        // Navigate to local file
        await page.goto(filePath, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
      } else {
        // Navigate to URL with proper waiting
        console.log(`📡 Navigating to ${url}...`);
        await page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
      }

      // Wait for content to load
      console.log(`⏳ Waiting for content to load...`);
      await this.waitForContent(page);

      // Capture screenshot
      console.log(`📸 Capturing screenshot...`);
      const screenshot = await page.screenshot({ 
        type: 'png', 
        fullPage: true,
        encoding: 'base64'
      });
      
      // Extract data using multiple strategies
      console.log(`🔍 Extracting comprehensive data...`);
      const websiteData = await this.extractComprehensiveData(page, url);
      
      // Add screenshot to the data
      websiteData.screenshot = `data:image/png;base64,${screenshot}`;
      
      console.log(`✅ Successfully scraped: ${websiteData.elements.length} elements, ${websiteData.colors.length} colors, ${websiteData.fonts.length} fonts`);
      return websiteData;
    } catch (error) {
      console.error(`❌ Enhanced scraping failed for ${url}:`, error.message);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async launchBrowser() {
    return await puppeteer.launch({
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
        '--disable-gpu',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
    });
  }

  async setupPage(page) {
    // Avoid detection as bot
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Remove webdriver property
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // Remove Chrome runtime
    await page.evaluateOnNewDocument(() => {
      window.chrome = { runtime: {} };
    });

    // Override permissions
    await page.evaluateOnNewDocument(() => {
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });
  }

  async waitForContent(page) {
    // Wait for various content indicators
    try {
      await Promise.race([
        page.waitForSelector('body', { timeout: 10000 }),
        page.waitForSelector('#root', { timeout: 10000 }),
        page.waitForSelector('.app', { timeout: 10000 }),
        page.waitForSelector('[data-reactroot]', { timeout: 10000 }),
        new Promise(resolve => setTimeout(resolve, 5000)) // Fallback timeout
      ]);
    } catch (error) {
      console.log('⚠️ Content loading timeout, proceeding with extraction...');
    }

    // Wait for network to be idle (skip for local files)
    try {
      await page.waitForNetworkIdle({ idleTime: 1000, timeout: 5000 });
    } catch (error) {
      console.log('⚠️ Network idle timeout, continuing...');
    }

    // Additional wait for dynamic content
    try {
      await page.evaluate(async () => {
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(undefined);
          } else {
            window.addEventListener('load', () => resolve(undefined));
          }
        });
      });
    } catch (error) {
      console.log('⚠️ Document ready timeout, continuing...');
    }

    // Wait a bit more for any lazy-loaded content
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async extractComprehensiveData(page, url) {
    return await page.evaluate((currentUrl) => {
      // Helper function for component data extraction
      function extractComponentData(document) {
        const components = {
          headings: [],
          paragraphs: [],
          buttons: [],
          links: [],
          navigation: [],
          forms: [],
          cards: [],
          sections: []
        };

        // Extract headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
          const styles = window.getComputedStyle(heading);
          components.headings.push({
            tag: heading.tagName.toLowerCase(),
            text: heading.textContent?.trim(),
            styles: {
              color: styles.color,
              fontSize: styles.fontSize,
              fontFamily: styles.fontFamily,
              fontWeight: styles.fontWeight,
              margin: styles.margin,
              padding: styles.padding
            }
          });
        });

        // Extract paragraphs
        const paragraphs = document.querySelectorAll('p');
        paragraphs.forEach(p => {
          const styles = window.getComputedStyle(p);
          components.paragraphs.push({
            text: p.textContent?.trim(),
            styles: {
              color: styles.color,
              fontSize: styles.fontSize,
              fontFamily: styles.fontFamily,
              fontWeight: styles.fontWeight,
              lineHeight: styles.lineHeight,
              margin: styles.margin,
              padding: styles.padding
            }
          });
        });

        // Extract buttons
        const buttons = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
        buttons.forEach(btn => {
          const styles = window.getComputedStyle(btn);
          components.buttons.push({
            text: btn.textContent?.trim() || btn.value,
            styles: {
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              fontSize: styles.fontSize,
              fontFamily: styles.fontFamily,
              fontWeight: styles.fontWeight,
              padding: styles.padding,
              borderRadius: styles.borderRadius,
              border: styles.border
            }
          });
        });

        // Extract links
        const links = document.querySelectorAll('a');
        links.forEach(link => {
          const styles = window.getComputedStyle(link);
          components.links.push({
            text: link.textContent?.trim(),
            href: link.href,
            styles: {
              color: styles.color,
              fontSize: styles.fontSize,
              fontFamily: styles.fontFamily,
              textDecoration: styles.textDecoration
            }
          });
        });

        return components;
      }

      // Enhanced element extraction
      const elements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const text = el.textContent?.trim();
          return text && text.length > 0 && 
                 !['script', 'style', 'meta', 'link', 'noscript'].includes(el.tagName.toLowerCase()) &&
                 el.offsetParent !== null; // Only visible elements
        })
        .map((el, index) => {
          const styles = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          
          return {
            type: el.tagName.toLowerCase(),
            text: el.textContent?.trim() || '',
            styles: {
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              fontFamily: styles.fontFamily,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              lineHeight: styles.lineHeight,
              textAlign: styles.textAlign,
              display: styles.display,
              position: styles.position,
              margin: styles.margin,
              padding: styles.padding,
            },
            attributes: Array.from(el.attributes).reduce((acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {}),
            position: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            },
            isVisible: rect.width > 0 && rect.height > 0,
            index,
          };
        })
        .filter(el => el.isVisible && el.text.length > 0);

      // Extract colors from all elements
      const colorSet = new Set();
      elements.forEach(el => {
        // Text colors
        if (el.styles.color && el.styles.color !== 'rgba(0, 0, 0, 0)' && el.styles.color !== 'transparent') {
          colorSet.add(el.styles.color);
        }
        // Background colors
        if (el.styles.backgroundColor && el.styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && el.styles.backgroundColor !== 'transparent') {
          colorSet.add(el.styles.backgroundColor);
        }
        // Border colors
        if (el.styles.borderColor && el.styles.borderColor !== 'rgba(0, 0, 0, 0)' && el.styles.borderColor !== 'transparent') {
          colorSet.add(el.styles.borderColor);
        }
        // Box shadow colors (extract from box-shadow)
        if (el.styles.boxShadow && el.styles.boxShadow !== 'none') {
          const shadowColors = el.styles.boxShadow.match(/rgba?\([^)]+\)/g);
          if (shadowColors) {
            shadowColors.forEach(color => colorSet.add(color));
          }
        }
      });

      // Also extract colors from CSS stylesheets
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach(sheet => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            Array.from(rules).forEach(rule => {
              if (rule.style) {
                // Extract color properties
                const colorProps = ['color', 'background-color', 'border-color', 'box-shadow'];
                colorProps.forEach(prop => {
                  const value = rule.style.getPropertyValue(prop);
                  if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent' && value !== 'none') {
                    // Extract rgba/rgb values from the property
                    const colorMatches = value.match(/rgba?\([^)]+\)/g);
                    if (colorMatches) {
                      colorMatches.forEach(color => colorSet.add(color));
                    }
                    // Also add hex colors
                    const hexMatches = value.match(/#[0-9a-fA-F]{3,6}/g);
                    if (hexMatches) {
                      hexMatches.forEach(color => colorSet.add(color));
                    }
                  }
                });
              }
            });
          }
        } catch (e) {
          // Skip cross-origin stylesheets
        }
      });

      // Extract fonts
      const fontSet = new Set();
      elements.forEach(el => {
        if (el.styles.fontFamily) {
          el.styles.fontFamily.split(',').forEach(font => {
            const cleanFont = font.trim().replace(/['"]/g, '');
            if (cleanFont && cleanFont !== 'serif' && cleanFont !== 'sans-serif' && cleanFont !== 'monospace') {
              fontSet.add(cleanFont);
            }
          });
        }
      });

      // Extract images with classification
      const images = Array.from(document.querySelectorAll('img'))
        .map(img => {
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy') || '';
          const alt = img.alt || '';
          let type = 'image';
          
          // Classify images
          if (alt.toLowerCase().includes('logo') || 
              src.toLowerCase().includes('logo') ||
              img.closest('header') || 
              img.closest('.logo') ||
              img.closest('[class*="logo"]')) {
            type = 'logo';
          } else if (img.width <= 48 && img.height <= 48) {
            type = 'icon';
          }
          
          return { src, alt, type, width: img.width, height: img.height };
        })
        .filter(img => img.src);

      // Extract layout information
      const sections = Array.from(document.querySelectorAll('section, [class*="section"], [class*="hero"], [class*="banner"], main, article, aside'))
        .map(section => {
          const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
          return {
            type: section.tagName.toLowerCase(),
            className: section.className,
            text: heading?.textContent?.trim() || section.textContent?.trim().substring(0, 100) || '',
            position: section.getBoundingClientRect(),
          };
        });

      // Extract navigation
      const navElements = Array.from(document.querySelectorAll('nav, [role="navigation"], header, [class*="nav"], [class*="menu"]'));
      const navigation = navElements.map(nav => ({
        html: nav.outerHTML.substring(0, 500), // First 500 chars
        links: Array.from(nav.querySelectorAll('a')).map(a => ({
          text: a.textContent?.trim(),
          href: a.href,
        })),
      }));

      // Extract component-specific data for detailed analysis
      const components = extractComponentData(document);
      
      // Extract buttons and CTAs
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"], a[class*="btn"], a[class*="button"]'))
        .map(btn => {
          const styles = window.getComputedStyle(btn);
          return {
            text: btn.textContent?.trim() || btn.value || '',
            type: btn.tagName.toLowerCase(),
            styles: {
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              fontFamily: styles.fontFamily,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              padding: styles.padding,
              borderRadius: styles.borderRadius,
            },
            className: btn.className,
          };
        })
        .filter(btn => btn.text);

      return {
        elements: elements.slice(0, 300), // Limit for performance
        colors: Array.from(colorSet),
        fonts: Array.from(fontSet),
        images: images.slice(0, 50),
        buttons: buttons.slice(0, 20),
        components, // Add component-specific data
        layout: {
          sections: sections.map(s => s.text),
          navigation: navigation[0] || null,
          footer: document.querySelector('footer')?.outerHTML?.substring(0, 500) || null,
        },
        metadata: {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          url: currentUrl,
        },
      };
    }, url);
  }

  // Method for single-page applications with interactions
  async scrapeSPA(url, interactions = []) {
    const browser = await this.launchBrowser();
    const page = await browser.newPage();
    
    try {
      await this.setupPage(page);
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Perform interactions for SPAs
      for (const interaction of interactions) {
        if (interaction === 'scroll') {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else if (interaction === 'click') {
          // Click on common elements that might load more content
          const clickableElements = await page.$$('button, [role="button"], .btn, .button');
          if (clickableElements.length > 0) {
            await clickableElements[0].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      return await this.extractComprehensiveData(page, url);
    } finally {
      await browser.close();
    }
  }

  /**
   * Extract component-specific data for detailed analysis
   * @param {Document} document
   */
  extractComponentData(document) {
    const components = {
      headings: [],
      paragraphs: [],
      buttons: [],
      links: [],
      navigation: [],
      forms: [],
      cards: [],
      sections: []
    };

    // Extract headings (h1-h6) with their styles
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
      const headings = Array.from(document.querySelectorAll(tag));
      headings.forEach(heading => {
        const styles = window.getComputedStyle(heading);
        components.headings.push({
          tag,
          text: heading.textContent?.trim().substring(0, 100) || '',
          styles: {
            color: styles.color,
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            lineHeight: styles.lineHeight,
            margin: styles.margin,
            padding: styles.padding
          },
          className: heading.className,
          id: heading.id
        });
      });
    });

    // Extract paragraphs with styles
    const paragraphs = Array.from(document.querySelectorAll('p'));
    paragraphs.forEach(p => {
      const styles = window.getComputedStyle(p);
      components.paragraphs.push({
        text: p.textContent?.trim().substring(0, 200) || '',
        styles: {
          color: styles.color,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          lineHeight: styles.lineHeight,
          margin: styles.margin,
          padding: styles.padding
        },
        className: p.className
      });
    });

    // Extract buttons with detailed styles
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'));
    buttons.forEach(btn => {
      const styles = window.getComputedStyle(btn);
      components.buttons.push({
        text: btn.textContent?.trim() || btn.value || '',
        type: btn.tagName.toLowerCase(),
        styles: {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          padding: styles.padding,
          borderRadius: styles.borderRadius,
          border: styles.border,
          boxShadow: styles.boxShadow
        },
        className: btn.className
      });
    });

    // Extract links with styles
    const links = Array.from(document.querySelectorAll('a'));
    links.forEach(link => {
      const styles = window.getComputedStyle(link);
      components.links.push({
        text: link.textContent?.trim() || '',
        href: link.href,
        styles: {
          color: styles.color,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          textDecoration: styles.textDecoration
        },
        className: link.className
      });
    });

    // Extract navigation elements
    const navElements = Array.from(document.querySelectorAll('nav, [role="navigation"], header'));
    navElements.forEach(nav => {
      const styles = window.getComputedStyle(nav);
      components.navigation.push({
        type: nav.tagName.toLowerCase(),
        text: nav.textContent?.trim().substring(0, 100) || '',
        styles: {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          padding: styles.padding,
          margin: styles.margin
        },
        className: nav.className
      });
    });

    // Extract form elements
    const forms = Array.from(document.querySelectorAll('form'));
    forms.forEach(form => {
      const styles = window.getComputedStyle(form);
      components.forms.push({
        text: form.textContent?.trim().substring(0, 100) || '',
        styles: {
          backgroundColor: styles.backgroundColor,
          padding: styles.padding,
          margin: styles.margin,
          border: styles.border
        },
        className: form.className
      });
    });

    // Extract card-like components
    const cards = Array.from(document.querySelectorAll('[class*="card"], [class*="tile"], [class*="item"]'));
    cards.forEach(card => {
      const styles = window.getComputedStyle(card);
      components.cards.push({
        text: card.textContent?.trim().substring(0, 100) || '',
        styles: {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          padding: styles.padding,
          margin: styles.margin,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow
        },
        className: card.className
      });
    });

    // Extract sections with styles
    const sections = Array.from(document.querySelectorAll('section, main, article, aside, header, footer'));
    sections.forEach(section => {
      const styles = window.getComputedStyle(section);
      components.sections.push({
        type: section.tagName.toLowerCase(),
        text: section.textContent?.trim().substring(0, 100) || '',
        styles: {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          padding: styles.padding,
          margin: styles.margin
        },
        className: section.className
      });
    });

    return components;
  }
}
