import { json } from '@sveltejs/kit';
import { BrandGuidelineRepository } from '$lib/repositories/brandGuidelineRepository.js';

const guidelineRepo = new BrandGuidelineRepository();

// GET /api/memory-storage - Check what's stored in memory
export async function GET({ url }) {
  try {
    const searchParams = url.searchParams;
    const action = searchParams.get('action') || 'list';
    const brandName = searchParams.get('brandName');
    const id = searchParams.get('id');

    console.log(`🔍 Memory storage check - Action: ${action}`);

    switch (action) {
      case 'list':
        // List all guidelines in database
        const allGuidelines = await guidelineRepo.findAll();
        const activeGuidelines = allGuidelines;
        
        return json({
          success: true,
          data: {
            total: allGuidelines.length,
            active: activeGuidelines.length,
            guidelines: activeGuidelines.map(g => ({
              id: g.id,
              brandName: g.brandName,
              companyName: g.companyName,
              createdAt: g.createdAt,
              updatedAt: g.updatedAt,
              hasColors: Object.keys(g.colors || {}).length > 0,
              hasTypography: Object.keys(g.typography || {}).length > 0,
              hasLogo: Object.keys(g.logo || {}).length > 0
            }))
          }
        });

      case 'get':
        // Get specific guideline by ID or brand name
        let guideline = null;
        
        if (id) {
          guideline = await guidelineRepo.findById(parseInt(id));
        } else if (brandName) {
          guideline = await guidelineRepo.findByBrandName(brandName);
        }

        if (!guideline) {
          return json({
            success: false,
            error: 'Brand guideline not found in memory'
          }, { status: 404 });
        }

        return json({
          success: true,
          data: guideline
        });

      case 'count':
        // Get count of guidelines
        const count = await guidelineRepo.count();
        return json({
          success: true,
          data: { count }
        });

      case 'clear':
        // Note: Clear operation is not supported in PostgreSQL
        return json({
          success: false,
          error: 'Clear operation is not supported in PostgreSQL. Use database management tools instead.'
        }, { status: 400 });

      default:
        return json({
          success: false,
          error: 'Invalid action. Use: list, get, count, or clear'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Memory storage check error:', error);
    return json({
      success: false,
      error: 'Failed to check memory storage'
    }, { status: 500 });
  }
}

// POST /api/memory-storage - Add or update guideline in memory
export async function POST({ request }) {
  try {
    const guidelineData = await request.json();
    
    if (!guidelineData.brandName && !guidelineData.companyName) {
      return json({
        success: false,
        error: 'Brand name or company name is required'
      }, { status: 400 });
    }

    const brandName = guidelineData.brandName || guidelineData.companyName;
    
    // Check if guideline already exists
    const existingGuideline = await guidelineRepo.findByBrandName(brandName);
    
    let result;
    if (existingGuideline) {
      // Update existing guideline
      result = await guidelineRepo.updateById(existingGuideline.id, guidelineData);
      console.log(`📝 Updated guideline in memory: ${brandName}`);
    } else {
      // Create new guideline
      result = await guidelineRepo.create(guidelineData);
      console.log(`📝 Created guideline in memory: ${brandName}`);
    }

    return json({
      success: true,
      data: result,
      message: existingGuideline ? 'Guideline updated' : 'Guideline created'
    });

  } catch (error) {
    console.error('❌ Memory storage update error:', error);
    return json({
      success: false,
      error: 'Failed to update memory storage'
    }, { status: 500 });
  }
}

