// Test script for visual audit functionality
import { VisualAuditScraper } from './src/lib/services/web-scraping/visualAuditScraper.js';

async function testVisualAudit() {
  console.log('🧪 Testing Visual Audit System...');
  
  const scraper = new VisualAuditScraper();
  
  try {
    // Test with a simple HTML file
    const testUrl = 'file:///C:/Users/BiM/Desktop/twitch_mock.html';
    console.log(`🔍 Testing with URL: ${testUrl}`);
    
    const result = await scraper.scrapeWithVisualAnnotations(testUrl);
    console.log('✅ Visual audit test completed successfully!');
    console.log('📊 Results:', {
      url: result.url,
      colors: result.colors?.length || 0,
      fonts: result.fonts?.length || 0,
      elements: result.elements?.length || 0,
      hasVisualData: !!result.visualData,
      hasScreenshot: !!result.visualData?.screenshot,
      elementPositions: result.visualData?.elementPositions?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Visual audit test failed:', error.message);
    console.log('🔧 This is expected if the HTML file has issues, but the system should handle it gracefully');
  }
}

testVisualAudit();
