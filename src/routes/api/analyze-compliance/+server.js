import { json } from '@sveltejs/kit';
import { scrapedDataRepository } from '$lib/repositories/scrapedDataRepository.js';
import { BrandGuidelineRepository } from '$lib/repositories/brandGuidelineRepository.js';
import { complianceAnalyzer } from '$lib/services/audit/complianceAnalyzer.js';

// Create repository instance
const brandGuidelineRepository = new BrandGuidelineRepository();

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { webpageId, brandId } = await request.json();

    if (!webpageId || !brandId) {
      return json({ error: 'Webpage ID and Brand ID are required' }, { status: 400 });
    }

    console.log(`🔍 Starting compliance analysis for webpage ${webpageId} and brand ${brandId}`);

    // Get scraped webpage data
    const scrapedData = await scrapedDataRepository.findById(webpageId);
    if (!scrapedData) {
      return json({ error: 'Scraped webpage not found' }, { status: 404 });
    }

    // Get brand guidelines
    const brandGuidelines = await brandGuidelineRepository.findById(brandId);
    if (!brandGuidelines) {
      return json({ error: 'Brand guidelines not found' }, { status: 404 });
    }

    // Perform compliance analysis
    const complianceAnalysis = await complianceAnalyzer.analyzeCompliance(scrapedData, brandGuidelines);

    // Update scraped data with analysis results
    await scrapedDataRepository.updateById(webpageId, {
      complianceScore: complianceAnalysis.overallScore,
      issues: complianceAnalysis.issues,
      recommendations: complianceAnalysis.recommendations,
      status: 'analyzed'
    });

    // Store compliance issues
    if (complianceAnalysis.issues && complianceAnalysis.issues.length > 0) {
      for (const issue of complianceAnalysis.issues) {
        await scrapedDataRepository.createComplianceIssue({
          webpageId: webpageId,
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

    console.log(`✅ Compliance analysis completed - Score: ${(complianceAnalysis.overallScore * 100).toFixed(1)}%`);

    return json({
      success: true,
      data: {
        webpageId,
        brandId,
        analysis: complianceAnalysis,
        scrapedData: {
          url: scrapedData.url,
          domain: scrapedData.domain,
          scrapedAt: scrapedData.scrapedAt
        },
        brandGuidelines: {
          brandName: brandGuidelines.brandName,
          companyName: brandGuidelines.companyName
        }
      },
      message: 'Compliance analysis completed successfully'
    });

  } catch (error) {
    console.error('❌ Compliance analysis failed:', error);
    return json({ 
      error: 'Failed to analyze compliance', 
      details: error.message 
    }, { status: 500 });
  }
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  try {
    const webpageId = url.searchParams.get('webpageId');
    const brandId = url.searchParams.get('brandId');

    if (!webpageId) {
      return json({ error: 'Webpage ID is required' }, { status: 400 });
    }

    // Get scraped webpage data
    const scrapedData = await scrapedDataRepository.findById(webpageId);
    if (!scrapedData) {
      return json({ error: 'Scraped webpage not found' }, { status: 404 });
    }

    // Get compliance issues
    const issues = await scrapedDataRepository.getComplianceIssues(webpageId);

    // If brand ID is provided, get brand guidelines for context
    let brandGuidelines = null;
    if (brandId) {
      brandGuidelines = await brandGuidelineRepository.findById(brandId);
    }

    return json({
      success: true,
      data: {
        webpage: {
          id: scrapedData.id,
          url: scrapedData.url,
          domain: scrapedData.domain,
          complianceScore: scrapedData.complianceScore,
          status: scrapedData.status,
          scrapedAt: scrapedData.scrapedAt,
          analyzedAt: scrapedData.analyzedAt
        },
        issues,
        brandGuidelines: brandGuidelines ? {
          brandName: brandGuidelines.brandName,
          companyName: brandGuidelines.companyName
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Failed to get compliance data:', error);
    return json({ 
      error: 'Failed to retrieve compliance data', 
      details: error.message 
    }, { status: 500 });
  }
}
