import { chromium } from 'playwright';

export class PlaywrightScraper {
  async scrapeWebsite(url) {
    let browser = null;
    
    try {
      console.log(`🎭 Starting Playwright scraping for: ${url}`);
      
      // Launch browser with anti-detection measures
      browser = await chromium.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--disable-gpu'
        ]
      });
      
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        // Remove automation indicators
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      const page = await context.newPage();

      // Remove webdriver property
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        // Remove Chrome runtime
        window.chrome = { runtime: {} };
      });

      // Navigate to URL
      console.log(`📡 Navigating to ${url}...`);
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for content to load
      console.log(`⏳ Waiting for content to load...`);
      await this.waitForContent(page);

      // Extract data
      console.log(`🔍 Extracting comprehensive data...`);
      const websiteData = await this.extractComprehensiveData(page, url);
      
      console.log(`✅ Playwright scraping successful: ${websiteData.elements.length} elements, ${websiteData.colors.length} colors, ${websiteData.fonts.length} fonts`);
      return websiteData;
    } catch (error) {
      console.error(`❌ Playwright scraping failed for ${url}:`, error.message);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async waitForContent(page) {
    // Wait for various content indicators
    await Promise.race([
      page.waitForSelector('body', { timeout: 10000 }),
      page.waitForSelector('#root', { timeout: 10000 }),
      page.waitForSelector('.app', { timeout: 10000 }),
      page.waitForSelector('[data-reactroot]', { timeout: 10000 }),
      new Promise(resolve => setTimeout(resolve, 5000)) // Fallback timeout
    ]);

    // Wait for load state
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    // Additional wait for dynamic content
    await page.waitForTimeout(2000);
  }

  async extractComprehensiveData(page, url) {
    return await page.evaluate((currentUrl) => {
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
        if (el.styles.color && el.styles.color !== 'rgba(0, 0, 0, 0)' && el.styles.color !== 'transparent') {
          colorSet.add(el.styles.color);
        }
        if (el.styles.backgroundColor && el.styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && el.styles.backgroundColor !== 'transparent') {
          colorSet.add(el.styles.backgroundColor);
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
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      // Perform interactions for SPAs
      for (const interaction of interactions) {
        if (interaction === 'scroll') {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(1000);
        } else if (interaction === 'click') {
          // Click on common elements that might load more content
          const clickableElements = await page.$$('button, [role="button"], .btn, .button');
          if (clickableElements.length > 0) {
            await clickableElements[0].click();
            await page.waitForTimeout(1000);
          }
        }
      }

      return await this.extractComprehensiveData(page, url);
    } finally {
      await browser.close();
    }
  }
}
