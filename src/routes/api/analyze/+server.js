import { json } from '@sveltejs/kit';
import { DynamicWebsiteAnalyzer } from '$lib/services/utilities/dynamicAnalyzer.js';
import { BrandDetectionService } from '$lib/services/utilities/brandDetection.js';

const analyzer = new DynamicWebsiteAnalyzer();
const brandDetection = new BrandDetectionService();

// POST /api/analyze - Analyze website against brand guidelines
export async function POST({ request }) {
	try {
		const { url, brandName, companyName } = await request.json();

		// Validate required fields
		if (!url) {
			return json({
				success: false,
				error: 'URL is required',
			}, { status: 400 });
		}

		// Validate URL format
		try {
			new URL(url);
		} catch {
			return json({
				success: false,
				error: 'Invalid URL format',
			}, { status: 400 });
		}

		let detectedBrand = brandName;

		// If no brandName provided, try to detect it
		if (!brandName) {
			console.log('🔍 No brand specified, attempting auto-detection...');
			const detectionResult = await brandDetection.detectBrand(url, companyName || '');
			
			if (detectionResult.success) {
				detectedBrand = detectionResult.brand.brandName;
				console.log(`✅ Auto-detected brand: ${detectedBrand} (confidence: ${detectionResult.confidence})`);
			} else {
				// If no confident match, use the first suggestion
				if (detectionResult.suggestions && detectionResult.suggestions.length > 0) {
					detectedBrand = detectionResult.suggestions[0].brandName;
					console.log(`⚠️ Using suggested brand: ${detectedBrand} (confidence: ${detectionResult.suggestions[0].confidence})`);
				} else {
					return json({
						success: false,
						error: 'No brand guidelines found for this website. Available brands: Apple, Buffer, GitHub, Habib Bank, SaaSGamma, Switcher',
						suggestions: detectionResult.suggestions || []
					}, { status: 404 });
				}
			}
		}

		// Validate that we have a brand name
		if (!detectedBrand) {
			return json({
				success: false,
				error: 'Brand name is required for analysis'
			}, { status: 400 });
		}

		// Perform analysis
		const result = await analyzer.analyzeWebsite(url, detectedBrand);

		return json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error('Analysis failed:', error);
		console.error('Error details:', error.stack);
		
		// Handle specific error types
		if (error.message.includes('No brand guidelines found')) {
			return json({
				success: false,
				error: error.message,
			}, { status: 404 });
		}

		return json({
			success: false,
			error: `Analysis failed: ${error.message || 'Unknown error'}`,
		}, { status: 500 });
	}
}
