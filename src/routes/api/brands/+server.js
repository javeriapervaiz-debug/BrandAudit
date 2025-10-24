import { json } from '@sveltejs/kit';
import { BrandGuidelineRepository } from '$lib/repositories/brandGuidelineRepository';

const guidelineRepo = new BrandGuidelineRepository();

// GET /api/brands - List all brand guidelines
export async function GET({ url }) {
	try {
		const searchParams = url.searchParams;
		const limit = parseInt(searchParams.get('limit') || '10');
		const offset = parseInt(searchParams.get('offset') || '0');
		const search = searchParams.get('search');

		let result;
		if (search) {
			result = await guidelineRepo.search(search);
		} else {
			result = await guidelineRepo.listPaginated(limit, offset);
		}

		return json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error('Error fetching brand guidelines:', error);
		return json({
			success: false,
			error: 'Failed to fetch brand guidelines',
		}, { status: 500 });
	}
}

// POST /api/brands - Create a new brand guideline
export async function POST({ request }) {
	try {
		const guidelineData = await request.json();

		// Validate required fields
		if (!guidelineData.brandName) {
			return json({
				success: false,
				error: 'Brand name is required',
			}, { status: 400 });
		}

		// Check if brand already exists
		const existingBrand = await guidelineRepo.findByBrandName(guidelineData.brandName);
		
		let guideline;
		if (existingBrand) {
			// Update existing brand
			guideline = await guidelineRepo.updateById(existingBrand.id, guidelineData);
		} else {
			// Create new brand
			guideline = await guidelineRepo.create(guidelineData);
		}

		return json({
			success: true,
			data: guideline,
		}, { status: 201 });
	} catch (error) {
		console.error('Error creating brand guideline:', error);
		return json({
			success: false,
			error: 'Failed to create brand guideline',
		}, { status: 500 });
	}
}
