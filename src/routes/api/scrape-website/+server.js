import { json } from '@sveltejs/kit';
import { webScraper } from '$lib/services/web-scraping/webScraper.js';
import { scrapedDataRepository } from '$lib/repositories/scrapedDataRepository.js';
import { enhancedComplianceAnalyzer } from '$lib/services/audit/enhancedComplianceAnalyzer.js';
import { BrandGuidelineRepository } from '$lib/repositories/brandGuidelineRepository.js';

const brandGuidelineRepository = new BrandGuidelineRepository();

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { url, brandId, sessionId } = await request.json();

    if (!url) {
      return json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`🌐 Starting website scraping for: ${url}`);

    // Check if URL was recently scraped (disabled for testing)
    // const recentlyScraped = await scrapedDataRepository.isRecentlyScraped(url);
    // if (recentlyScraped) {
    //   console.log(`⚠️ URL ${url} was scraped recently, returning cached data`);
    //   const existingData = await scrapedDataRepository.findByUrl(url);
    //   return json({
    //     success: true,
    //     data: existingData,
    //     cached: true,
    //     message: 'Data retrieved from cache (scraped within last 24 hours)'
    //   });
    // }

    // Scrape the website
    const scrapedData = await webScraper.scrapeWebpage(url);
    
    // Add brand association if provided
    if (brandId) {
      scrapedData.brandId = brandId;
    }

    // Store scraped data
    const storedData = await scrapedDataRepository.create(scrapedData);

    // If brand ID is provided, analyze compliance
    let complianceAnalysis = null;
    if (brandId) {
      console.log(`🔍 Analyzing compliance for brand ${brandId}...`);
      
      // Get brand guidelines
      const brandGuidelines = await brandGuidelineRepository.findById(brandId);
      if (brandGuidelines) {
        complianceAnalysis = await enhancedComplianceAnalyzer.analyzeCompliance(scrapedData, brandGuidelines);
        
        // Update stored data with compliance analysis
        await scrapedDataRepository.updateById(storedData.id, {
          complianceScore: complianceAnalysis.overallScore,
          issues: complianceAnalysis.issues,
          recommendations: complianceAnalysis.recommendations,
          status: 'analyzed'
        });

        // Store compliance issues
        if (complianceAnalysis.issues && complianceAnalysis.issues.length > 0) {
          for (const issue of complianceAnalysis.issues) {
            await scrapedDataRepository.createComplianceIssue({
              webpageId: storedData.id,
              issueType: issue.type,
              severity: issue.severity,
              description: issue.description,
              element: issue.element,
              expectedValue: issue.expected,
              actualValue: issue.actual,
              recommendation: issue.recommendation
            });
          }
        }
      }
    }

    console.log(`✅ Website scraping completed for: ${url}`);

    return json({
      success: true,
      data: {
        ...storedData,
        complianceAnalysis
      },
      message: 'Website scraped successfully'
    });

  } catch (error) {
    console.error('❌ Website scraping failed:', error);
    return json({ 
      error: 'Failed to scrape website', 
      details: error.message 
    }, { status: 500 });
  }
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  try {
    const brandId = url.searchParams.get('brandId');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const status = url.searchParams.get('status');

    const options = {
      page,
      limit,
      brandId: brandId ? parseInt(brandId) : null,
      status
    };

    const result = await scrapedDataRepository.listPaginated(options);

    return json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('❌ Failed to get scraped websites:', error);
    return json({ 
      error: 'Failed to retrieve scraped websites', 
      details: error.message 
    }, { status: 500 });
  }
}
