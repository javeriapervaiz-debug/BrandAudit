import { json } from '@sveltejs/kit';
import { enhancedBrandExtractor } from '$lib/services/pdf-extraction/enhancedBrandExtractor.js';

export async function POST({ request }) {
  try {
    const { text, companyName, usePerfectExtractor } = await request.json();

    if (!text) {
      return json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('🔍 Server-side brand guideline extraction started...');
    console.log(`📄 Text length: ${text.length}`);
    console.log(`🏢 Company: ${companyName || 'Unknown'}`);
    console.log(`🚀 Use Perfect Extractor: ${usePerfectExtractor || false}`);

    let guidelines;
    
    if (usePerfectExtractor) {
      // Use the comprehensive extractor with enhanced color & spacing focus
      guidelines = await enhancedBrandExtractor.extractWithComprehensiveFocus(text, companyName);
    } else {
      // Use the standard enhanced brand guideline extractor
      guidelines = await enhancedBrandExtractor.extractBrandGuidelines(text, companyName);
    }

    console.log('✅ Brand guidelines extracted successfully:', {
      colors: guidelines.colors?.palette?.length || 0,
      fonts: (guidelines.typography?.primary ? 1 : 0) + (guidelines.typography?.secondary ? 1 : 0),
      hasLogo: !!guidelines.logo?.clearSpace || !!guidelines.logo?.minSize,
      spacing: Object.values(guidelines.spacing || {}).filter(v => v && v !== '').length,
      confidence: guidelines.confidence?.overall || 0,
      method: guidelines.metadata?.extraction_method || 'comprehensive-enhanced'
    });

    return json(guidelines);
  } catch (error) {
    console.error('❌ Brand guideline extraction failed:', error);
    return json({ 
      error: 'Failed to extract brand guidelines',
      details: error.message 
    }, { status: 500 });
  }
}
