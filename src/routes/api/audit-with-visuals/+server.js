import { json } from '@sveltejs/kit';
import { VisualAuditScraper } from '$lib/services/web-scraping/visualAuditScraper.js';
import { ScreenshotAnnotator } from '$lib/services/web-scraping/screenshotAnnotator.js';
import { enhancedComplianceAnalyzer } from '$lib/services/audit/enhancedComplianceAnalyzer.js';
import { BrandGuidelineRepository } from '$lib/repositories/brandGuidelineRepository.js';
import { ScrapedDataRepository } from '$lib/repositories/scrapedDataRepository.js';
import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
  try {
    const { url, brandId } = await request.json();
    
    console.log(`🎯 Starting visual audit for: ${url} with brand: ${brandId}`);
    
    // Initialize services
    const visualScraper = new VisualAuditScraper();
    const screenshotAnnotator = new ScreenshotAnnotator();
    const brandRepo = new BrandGuidelineRepository();
    const scrapedRepo = new ScrapedDataRepository();
    
    // Get brand guidelines
    console.log(`📋 Fetching brand guidelines for ID: ${brandId}`);
    const brandGuidelines = await brandRepo.findById(brandId);
    
    if (!brandGuidelines) {
      return json({ error: 'Brand guidelines not found' }, { status: 404 });
    }
    
    // Scrape with visual data
    console.log(`🔍 Starting visual scraping...`);
    let scrapedData;
    try {
      scrapedData = await visualScraper.scrapeWithVisualAnnotations(url);
    } catch (visualError) {
      console.warn('⚠️ Visual scraping failed, falling back to standard scraping:', visualError);
      // Fallback to standard scraping
      const { enhancedWebScraper } = await import('$lib/services/web-scraping/enhancedWebScraper.js');
      const standardScraper = new enhancedWebScraper.EnhancedWebScraper();
      const standardData = await standardScraper.scrapeWebsite(url);
      
      // Create minimal visual data structure
      scrapedData = {
        ...standardData,
        visualData: {
          screenshot: null,
          elementPositions: [],
          viewport: { width: 1920, height: 1080 },
          timestamp: new Date().toISOString()
        }
      };
    }
    
    // Prepare data for analysis
    const analysisData = {
      url: scrapedData.url,
      colors: scrapedData.colors || [],
      fonts: scrapedData.fonts || [],
      elements: scrapedData.elements || [],
      typography: { primary: null, secondary: null, weights: [] },
      logo: { rules: [], spacing: null, sizing: null },
      layout: { grid: null, spacing: null },
      imagery: { style: null, tone: null },
      viewport: scrapedData.viewport,
      timestamp: scrapedData.timestamp
    };

    // Run audit analysis
    console.log(`🧠 Running compliance analysis...`);
    const auditResults = await enhancedComplianceAnalyzer.analyzeCompliance(
      analysisData, 
      brandGuidelines
    );
    
    // Annotate screenshot (if available)
    let annotatedScreenshot = null;
    if (scrapedData.visualData?.screenshot) {
      try {
        console.log(`🎨 Annotating screenshot...`);
        annotatedScreenshot = await screenshotAnnotator.annotateScreenshot(
          scrapedData.visualData.screenshot,
          auditResults,
          scrapedData.visualData.elementPositions
        );
      } catch (annotationError) {
        console.warn('⚠️ Screenshot annotation failed:', annotationError);
        // Continue without annotation
      }
    } else {
      console.warn('⚠️ No screenshot available for annotation');
    }
    
    // Convert screenshot to base64 for frontend (if available)
    let screenshotDataUrl = null;
    if (annotatedScreenshot && fs.existsSync(annotatedScreenshot)) {
      try {
        const screenshotBuffer = fs.readFileSync(annotatedScreenshot);
        const screenshotBase64 = screenshotBuffer.toString('base64');
        screenshotDataUrl = `data:image/png;base64,${screenshotBase64}`;
      } catch (screenshotError) {
        console.warn('⚠️ Failed to convert screenshot to base64:', screenshotError);
      }
    }
    
    // Store scraped data with visual information
    const scrapedDataWithVisuals = {
      ...scrapedData,
      screenshot: screenshotDataUrl,
      annotatedScreenshot: screenshotDataUrl,
      elementPositions: scrapedData.visualData?.elementPositions || [],
      viewport: scrapedData.visualData?.viewport || { width: 1920, height: 1080 },
      timestamp: scrapedData.visualData?.timestamp || new Date().toISOString()
    };
    
    // Save to database
    const savedData = await scrapedRepo.create(scrapedDataWithVisuals);
    
    // Clean up temporary files
    try {
      if (scrapedData.visualData?.screenshot && fs.existsSync(scrapedData.visualData.screenshot)) {
        fs.unlinkSync(scrapedData.visualData.screenshot);
      }
      if (annotatedScreenshot && fs.existsSync(annotatedScreenshot)) {
        fs.unlinkSync(annotatedScreenshot);
      }
    } catch (cleanupError) {
      console.warn('⚠️ Cleanup failed:', cleanupError);
    }
    
    // Return comprehensive results
    const response = {
      // Spread audit results
      overallScore: auditResults.overallScore,
      categoryScores: auditResults.categoryScores,
      issues: auditResults.issues,
      recommendations: auditResults.recommendations,
      summary: auditResults.summary,
      confidence: auditResults.confidence,
      detailedSummary: auditResults.detailedSummary,
      skippedCategories: auditResults.skippedCategories,
      // Add visual data
      visualData: {
        annotatedScreenshot: screenshotDataUrl,
        elementPositions: scrapedData.visualData?.elementPositions || [],
        viewport: scrapedData.visualData?.viewport || { width: 1920, height: 1080 },
        timestamp: scrapedData.visualData?.timestamp || new Date().toISOString()
      },
      interactive: true,
      scrapedDataId: savedData.id
    };
    
    console.log(`✅ Visual audit completed successfully`);
    console.log(`📊 Response structure:`, {
      hasOverallScore: !!response.overallScore,
      hasIssues: !!response.issues,
      hasVisualData: !!response.visualData,
      issuesCount: response.issues?.length || 0
    });
    
    return json(response);
    
  } catch (error) {
    console.error('❌ Visual audit failed:', error);
    return json({ 
      error: 'Visual audit failed', 
      details: error 
    }, { status: 500 });
  }
}
