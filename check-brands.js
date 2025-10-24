import { BrandGuidelineRepository } from './src/lib/repositories/brandGuidelineRepository.js';

async function checkBrands() {
  try {
    const repo = new BrandGuidelineRepository();
    const brands = await repo.listAll();
    
    console.log('📋 Available brands in database:');
    if (brands.length === 0) {
      console.log('  ❌ No brands found in database');
    } else {
      brands.forEach(brand => {
        console.log(`  - ${brand.brandName} (${brand.companyName})`);
      });
      console.log(`\nTotal: ${brands.length} brands`);
    }
  } catch (error) {
    console.error('❌ Error checking brands:', error.message);
  }
}

checkBrands();
