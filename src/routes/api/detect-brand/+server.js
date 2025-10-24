import { json } from '@sveltejs/kit';
import { BrandDetectionService } from '$lib/services/utilities/brandDetection.js';

const brandDetection = new BrandDetectionService();

// POST /api/detect-brand - Detect brand from URL and company name
export async function POST({ request }) {
  try {
    const { url, companyName } = await request.json();

    // Validate input
    if (!url) {
      return json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return json({
        success: false,
        error: 'Invalid URL format'
      }, { status: 400 });
    }

    // Detect brand
    const detectionResult = await brandDetection.detectBrand(url, companyName || '');

    return json(detectionResult);

  } catch (error) {
    console.error('Brand detection error:', error);
    return json({
      success: false,
      error: 'Failed to detect brand'
    }, { status: 500 });
  }
}

// GET /api/detect-brand/suggestions - Get brand suggestions
export async function GET({ url }) {
  try {
    const searchParams = url.searchParams;
    const query = searchParams.get('q') || '';

    if (!query) {
      return json({
        success: false,
        error: 'Query parameter "q" is required'
      }, { status: 400 });
    }

    const suggestions = await brandDetection.getBrandSuggestions(query);

    return json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Brand suggestions error:', error);
    return json({
      success: false,
      error: 'Failed to get brand suggestions'
    }, { status: 500 });
  }
}
