import { json } from '@sveltejs/kit';
import { BrandGuidelineRepository } from '$lib/repositories/brandGuidelineRepository';

const guidelineRepo = new BrandGuidelineRepository();

// GET /api/brands/[brandName] - Get specific brand guideline
export async function GET({ params }) {
	try {
		const { brandName } = params;
		const guideline = await guidelineRepo.findByBrandName(brandName);

		if (!guideline) {
			return json({
				success: false,
				error: 'Brand guideline not found',
			}, { status: 404 });
		}

		return json({
			success: true,
			data: guideline,
		});
	} catch (error) {
		console.error('Error fetching brand guideline:', error);
		return json({
			success: false,
			error: 'Failed to fetch brand guideline',
		}, { status: 500 });
	}
}

// PUT /api/brands/[brandName] - Update brand guideline
export async function PUT({ params, request }) {
	try {
		const { brandName } = params;
		const updateData = await request.json();

		// Remove id and timestamps from update data
		delete updateData.id;
		delete updateData.createdAt;
		delete updateData.updatedAt;

		const updatedGuideline = await guidelineRepo.update(brandName, updateData);

		if (!updatedGuideline) {
			return json({
				success: false,
				error: 'Brand guideline not found',
			}, { status: 404 });
		}

		return json({
			success: true,
			data: updatedGuideline,
		});
	} catch (error) {
		console.error('Error updating brand guideline:', error);
		return json({
			success: false,
			error: 'Failed to update brand guideline',
		}, { status: 500 });
	}
}

// DELETE /api/brands/[brandName] - Delete brand guideline
export async function DELETE({ params }) {
	try {
		const { brandName } = params;
		const deleted = await guidelineRepo.delete(brandName);

		if (!deleted) {
			return json({
				success: false,
				error: 'Brand guideline not found',
			}, { status: 404 });
		}

		return json({
			success: true,
			message: 'Brand guideline deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting brand guideline:', error);
		return json({
			success: false,
			error: 'Failed to delete brand guideline',
		}, { status: 500 });
	}
}
