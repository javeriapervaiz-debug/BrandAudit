// Brand Detection Service - Smart brand identification for audit phase
import { BrandGuidelineRepository } from '../../repositories/brandGuidelineRepository.js';

export class BrandDetectionService {
  constructor() {
    this.guidelineRepo = new BrandGuidelineRepository();
  }

  /**
   * Detect brand from URL and company name
   * @param {string} url - Website URL to analyze
   * @param {string} companyName - Optional company name hint
   * @returns {Promise<Object>} Detected brand information
   */
  async detectBrand(url, companyName = '') {
    try {
      console.log('🔍 Starting brand detection...');
      console.log(`   URL: ${url}`);
      console.log(`   Company hint: ${companyName}`);

      // Step 1: Extract domain and company info from URL
      const urlInfo = this.extractUrlInfo(url);
      console.log('✅ URL info extracted:', urlInfo);

      // Step 2: Get all available brands from database
      const allBrands = await this.guidelineRepo.listAll();
      console.log(`✅ Found ${allBrands.length} brands in database`);

      // Step 3: Score brands based on URL and company name
      const scoredBrands = this.scoreBrands(allBrands, urlInfo, companyName);
      console.log('✅ Brands scored and ranked');

      // Step 4: Return the best match
      const bestMatch = scoredBrands[0];
      
      if (bestMatch.score > 0.1) { // Lower threshold to allow more matches
        console.log(`🎯 Best match: ${bestMatch.brand.brandName} (score: ${bestMatch.score})`);
        return {
          success: true,
          brand: bestMatch.brand,
          confidence: bestMatch.score,
          detectionMethod: bestMatch.method,
          alternatives: scoredBrands.slice(1, 3).map(b => ({
            brandName: b.brand.brandName,
            confidence: b.score,
            method: b.method
          }))
        };
      } else {
        console.log('⚠️ No confident brand match found');
        return {
          success: false,
          error: 'No brand guidelines found for this website',
          suggestions: scoredBrands.slice(0, 3).map(b => ({
            brandName: b.brand.brandName,
            confidence: b.score,
            reason: b.reason
          }))
        };
      }

    } catch (error) {
      console.error('❌ Brand detection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract information from URL
   * @param {string} url - Website URL
   * @returns {Object} URL information
   */
  extractUrlInfo(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Extract domain parts
      const domainParts = hostname.split('.');
      const domain = domainParts[domainParts.length - 2] || hostname;
      const subdomain = domainParts.length > 2 ? domainParts[0] : null;
      
      // Common brand domain mappings
      const brandMappings = {
        'github.com': 'GitHub',
        'www.github.com': 'GitHub',
        'github.io': 'GitHub',
        'buffer.com': 'Buffer',
        'www.buffer.com': 'Buffer',
        'bufferapp.com': 'Buffer',
        'apple.com': 'Apple',
        'www.apple.com': 'Apple',
        'hbl.com': 'Habib Bank',
        'www.hbl.com': 'Habib Bank',
        'habibbank.com': 'Habib Bank',
        'www.habibbank.com': 'Habib Bank',
        'switcherstudio.com': 'Switcher',
        'www.switcherstudio.com': 'Switcher',
        'switcher.com': 'Switcher',
        'www.switcher.com': 'Switcher',
        'saasgamma.com': 'SaaSGamma',
        'www.saasgamma.com': 'SaaSGamma',
        'stripe.com': 'Stripe',
        'shopify.com': 'Shopify',
        'slack.com': 'Slack',
        'spotify.com': 'Spotify',
        'netflix.com': 'Netflix',
        'airbnb.com': 'Airbnb',
        'uber.com': 'Uber',
        'twitter.com': 'Twitter',
        'x.com': 'Twitter',
        'facebook.com': 'Facebook',
        'meta.com': 'Meta',
        'google.com': 'Google',
        'microsoft.com': 'Microsoft',
        'amazon.com': 'Amazon',
        'tesla.com': 'Tesla'
      };

      const suggestedBrand = brandMappings[hostname] || null;
      console.log(`🔍 URL Info: hostname=${hostname}, suggestedBrand=${suggestedBrand}`);
      
      return {
        hostname,
        domain,
        subdomain,
        suggestedBrand,
        path: urlObj.pathname,
        fullUrl: url
      };
    } catch (error) {
      return {
        hostname: url,
        domain: url,
        subdomain: null,
        suggestedBrand: null,
        path: '/',
        fullUrl: url
      };
    }
  }

  /**
   * Score brands based on URL and company name
   * @param {Array} brands - Available brands
   * @param {Object} urlInfo - URL information
   * @param {string} companyName - Company name hint
   * @returns {Array} Scored and ranked brands
   */
  scoreBrands(brands, urlInfo, companyName) {
    return brands.map(brand => {
      let score = 0;
      let method = '';
      let reason = '';

      // Method 1: Direct domain mapping
      if (urlInfo.suggestedBrand && 
          brand.brandName.toLowerCase() === urlInfo.suggestedBrand.toLowerCase()) {
        score += 0.9;
        method = 'domain_mapping';
        reason = `Domain ${urlInfo.hostname} maps to ${brand.brandName}`;
      }

      // Method 2: Company name exact match
      if (companyName && 
          brand.companyName && 
          brand.companyName.toLowerCase() === companyName.toLowerCase()) {
        score += 0.8;
        method = 'company_name_exact';
        reason = `Company name "${companyName}" matches exactly`;
      }

      // Method 3: Company name partial match
      if (companyName && 
          brand.companyName && 
          brand.companyName.toLowerCase().includes(companyName.toLowerCase())) {
        score += 0.6;
        method = 'company_name_partial';
        reason = `Company name "${companyName}" partially matches "${brand.companyName}"`;
      }

      // Method 4: Brand name partial match with company name
      if (companyName && 
          brand.brandName.toLowerCase().includes(companyName.toLowerCase())) {
        score += 0.5;
        method = 'brand_name_partial';
        reason = `Brand name "${brand.brandName}" contains "${companyName}"`;
      }

      // Method 5: Domain contains brand name
      if (urlInfo.domain.includes(brand.brandName.toLowerCase())) {
        score += 0.4;
        method = 'domain_contains_brand';
        reason = `Domain "${urlInfo.domain}" contains brand name "${brand.brandName}"`;
      }

      // Method 6: Brand name contains domain
      if (brand.brandName.toLowerCase().includes(urlInfo.domain)) {
        score += 0.3;
        method = 'brand_contains_domain';
        reason = `Brand name "${brand.brandName}" contains domain "${urlInfo.domain}"`;
      }

      // Method 7: Fuzzy string matching
      const fuzzyScore = this.calculateFuzzyMatch(
        companyName || urlInfo.domain, 
        brand.brandName
      );
      if (fuzzyScore > 0.3) { // Lower threshold for more matches
        score += fuzzyScore * 0.2;
        method = 'fuzzy_match';
        reason = `Fuzzy match between "${companyName || urlInfo.domain}" and "${brand.brandName}"`;
      }
      
      // Method 8: Always provide some score for any brand (fallback)
      if (score === 0) {
        score = 0.1;
        method = 'fallback';
        reason = `Available brand: ${brand.brandName}`;
      }

      return {
        brand,
        score: Math.min(score, 1.0), // Cap at 1.0
        method,
        reason
      };
    }).sort((a, b) => b.score - a.score); // Sort by score descending
  }

  /**
   * Calculate fuzzy string match score
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Match score (0-1)
   */
  calculateFuzzyMatch(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Exact match
    if (s1 === s2) return 1.0;
    
    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // Simple Levenshtein distance
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    return maxLength === 0 ? 0 : (maxLength - distance) / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Get brand suggestions for manual selection
   * @param {string} query - Search query
   * @returns {Promise<Array>} Brand suggestions
   */
  async getBrandSuggestions(query) {
    try {
      const allBrands = await this.guidelineRepo.listAll();
      
      return allBrands
        .map(brand => ({
          id: brand.id,
          brandName: brand.brandName,
          companyName: brand.companyName,
          industry: brand.industry,
          score: this.calculateFuzzyMatch(query, brand.brandName)
        }))
        .filter(brand => brand.score > 0.1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
        
    } catch (error) {
      console.error('Error getting brand suggestions:', error);
      return [];
    }
  }
}
