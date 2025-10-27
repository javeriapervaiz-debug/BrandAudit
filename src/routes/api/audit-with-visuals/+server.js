import { json } from '@sveltejs/kit';
import { VisualAuditScraper } from '$lib/services/web-scraping/visualAuditScraper.js';
import { ScreenshotAnnotator } from '$lib/services/web-scraping/screenshotAnnotator.js';
import { FixedScreenshotAnnotator } from '$lib/services/web-scraping/fixedScreenshotAnnotator.js';
import { enhancedComplianceAnalyzer } from '$lib/services/audit/enhancedComplianceAnalyzer.js';
import { SolutionLLMProcessor } from '$lib/services/audit/solutionLLMProcessor.js';
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
      console.log(`❌ Brand guidelines not found for ID: ${brandId}`);
      
      // Try to get all guidelines to see what's available
      const allGuidelines = await brandRepo.findAll();
      console.log(`📊 Available guidelines in database:`, allGuidelines.map(g => ({ id: g.id, brandName: g.brandName })));
      
      return json({ 
        error: 'Brand guidelines not found',
        debug: {
          requestedId: brandId,
          availableGuidelines: allGuidelines.map(g => ({ id: g.id, brandName: g.brandName }))
        }
      }, { status: 404 });
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
    
    // Process recommendations with LLM for actionable solutions
    console.log(`🛠️ Processing recommendations with LLM...`);
    let enhancedRecommendations = auditResults.recommendations || [];
    try {
      const solutionProcessor = new SolutionLLMProcessor();
      const solutionResults = await solutionProcessor.processIssues(
        auditResults.issues || [],
        brandGuidelines,
        analysisData
      );
      
      // Merge LLM-generated solutions with existing recommendations
      if (solutionResults.solutions && solutionResults.solutions.length > 0) {
        enhancedRecommendations = [
          ...enhancedRecommendations,
          ...solutionResults.solutions
        ];
        console.log(`✅ Enhanced recommendations with ${solutionResults.solutions.length} actionable solutions`);
      }
    } catch (solutionError) {
      console.warn('⚠️ LLM solution processing failed, using default recommendations:', solutionError);
      // Continue with default recommendations if LLM fails
    }
    
    // Create targeted audit report with enhanced annotations
    let visualReport = null;
    if (scrapedData.visualData?.screenshot) {
      try {
        console.log(`🎯 Creating targeted visual audit report...`);
        const fixedAnnotator = new FixedScreenshotAnnotator();
        const annotatedScreenshot = await fixedAnnotator.createTargetedAnnotations(
          scrapedData.visualData.screenshot,
          auditResults,
          scrapedData.visualData.elementPositions
        );
        visualReport = {
          ...auditResults,
          visualData: {
            ...scrapedData.visualData,
            annotatedScreenshot
          }
        };
      } catch (annotationError) {
        console.warn('⚠️ Targeted annotation failed, falling back to standard annotation:', annotationError);
        // Fallback to standard annotation
        try {
          console.log(`🎨 Annotating screenshot with standard method...`);
          const annotatedScreenshot = await screenshotAnnotator.annotateScreenshot(
            scrapedData.visualData.screenshot,
            auditResults,
            scrapedData.visualData.elementPositions
          );
          visualReport = {
            ...auditResults,
            visualData: {
              ...scrapedData.visualData,
              annotatedScreenshot
            }
          };
        } catch (fallbackError) {
          console.warn('⚠️ Standard annotation also failed:', fallbackError);
          visualReport = {
            ...auditResults,
            visualData: scrapedData.visualData
          };
        }
      }
    } else {
      console.warn('⚠️ No screenshot available for annotation');
    }
    
    // Use visual report if available, otherwise use basic audit results
    const finalReport = visualReport || {
      ...auditResults,
      visualData: scrapedData.visualData
    };
    
    // Convert screenshots to base64 for frontend (if available)
    let screenshotDataUrl = null;
    let targetedScreenshotDataUrl = null;
    
    if (finalReport.visualData?.screenshot) {
      try {
        const screenshotBuffer = fs.readFileSync(finalReport.visualData.screenshot);
        screenshotDataUrl = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
      } catch (error) {
        console.warn('⚠️ Failed to convert screenshot to base64:', error);
      }
    }
    
    if (finalReport.visualData?.annotatedScreenshot) {
      try {
        const annotatedBuffer = fs.readFileSync(finalReport.visualData.annotatedScreenshot);
        targetedScreenshotDataUrl = `data:image/png;base64,${annotatedBuffer.toString('base64')}`;
      } catch (error) {
        console.warn('⚠️ Failed to convert targeted screenshot to base64:', error);
      }
    }
    
    // Attach element positions to specific issues
    const issuesWithPositions = (auditResults.issues || []).map((issue, index) => {
      const positions = finalReport.visualData?.elementPositions || [];
      // Only attach positions that might be relevant to this issue
      // For now, we'll use a subset - the first few elements per issue
      const startIndex = index * 3; // 3 elements per issue
      const endIndex = startIndex + 1; // Just 1 element per issue to avoid overflow
      const relevantPositions = positions.slice(startIndex, endIndex);
      
      return {
        ...issue,
        elementPositions: relevantPositions
      };
    });
    
    // Store scraped data with visual information
    const scrapedDataWithVisuals = {
      ...scrapedData,
      screenshot: screenshotDataUrl,
      annotatedScreenshot: targetedScreenshotDataUrl || screenshotDataUrl,
      elementPositions: finalReport.visualData?.elementPositions || [],
      viewport: finalReport.visualData?.viewport || { width: 1920, height: 1080 },
      timestamp: finalReport.visualData?.timestamp || new Date().toISOString()
    };
    
    // Save to database
    const savedData = await scrapedRepo.create(scrapedDataWithVisuals);
    
    // Clean up temporary files
    try {
      if (finalReport.visualData?.screenshot && fs.existsSync(finalReport.visualData.screenshot)) {
        fs.unlinkSync(finalReport.visualData.screenshot);
      }
      if (finalReport.visualData?.annotatedScreenshot && fs.existsSync(finalReport.visualData.annotatedScreenshot)) {
        fs.unlinkSync(finalReport.visualData.annotatedScreenshot);
      }
    } catch (cleanupError) {
      console.warn('⚠️ Cleanup failed:', cleanupError);
    }
    
    // Return comprehensive results
    const response = {
      // Spread audit results
      overallScore: auditResults.overallScore,
      categoryScores: auditResults.categoryScores,
      issues: issuesWithPositions, // Use issues with attached positions
      recommendations: enhancedRecommendations, // Use enhanced recommendations with LLM solutions
      summary: auditResults.summary,
      confidence: auditResults.confidence,
      detailedSummary: auditResults.detailedSummary,
      skippedCategories: auditResults.skippedCategories,
      // Add visual data
      visualData: {
        screenshot: screenshotDataUrl,
        targetedScreenshot: targetedScreenshotDataUrl,
        annotatedScreenshot: targetedScreenshotDataUrl || screenshotDataUrl, // For backward compatibility
        elementPositions: finalReport.visualData?.elementPositions || [],
        viewport: finalReport.visualData?.viewport || { width: 1920, height: 1080 },
        timestamp: finalReport.visualData?.timestamp || new Date().toISOString()
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
