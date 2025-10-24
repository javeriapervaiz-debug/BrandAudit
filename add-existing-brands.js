// Script to add existing hardcoded brands via API
import { githubBrandGuideline } from './src/lib/githubBrandGuideline.js';
import { bufferBrandGuideline } from './src/lib/bufferBrandGuideline.js';
import { appleBrandGuideline } from './src/lib/appleBrandGuideline.js';
import { mockBrandGuideline } from './src/lib/mockBrandGuideline.js';

const API_BASE = 'http://localhost:5173/api';

// Convert existing guidelines to API format
function convertToApiFormat(guideline) {
  return {
    brandName: guideline.metadata?.brandName || guideline.brandName,
    companyName: guideline.metadata?.brandName || guideline.brandName,
    industry: 'Technology',
    colors: guideline.colors,
    typography: guideline.typography,
    logo: guideline.logo,
    ui: guideline.ui,
    spacing: guideline.spacing,
    layout: guideline.layout,
    imagery: guideline.imagery,
    tone: guideline.tone,
    accessibility: guideline.accessibility,
    globalRules: guideline.globalRules,
    metadata: guideline.metadata,
    sourceFile: 'migrated_from_hardcoded'
  };
}

async function addBrand(guideline) {
  try {
    const response = await fetch(`${API_BASE}/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(convertToApiFormat(guideline))
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Successfully added ${guideline.metadata?.brandName || guideline.brandName}`);
      return result.data;
    } else {
      console.log(`⚠️  ${guideline.metadata?.brandName || guideline.brandName} already exists or error: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error adding ${guideline.metadata?.brandName || guideline.brandName}:`, error.message);
    return null;
  }
}

async function addAllBrands() {
  console.log('🚀 Adding existing brands via API...');
  
  const brands = [
    { name: 'GitHub', data: githubBrandGuideline },
    { name: 'Buffer', data: bufferBrandGuideline },
    { name: 'Apple', data: appleBrandGuideline },
    { name: 'Mock', data: mockBrandGuideline }
  ];
  
  for (const { name, data } of brands) {
    console.log(`📋 Adding ${name}...`);
    await addBrand(data);
  }
  
  console.log('🎉 Finished adding brands!');
  
  // List all brands
  try {
    const response = await fetch(`${API_BASE}/brands`);
    const result = await response.json();
    
    if (result.success) {
      console.log('\n📊 Current brands in database:');
      result.data.guidelines.forEach(brand => {
        console.log(`   - ${brand.brandName} (ID: ${brand.id})`);
      });
    }
  } catch (error) {
    console.error('Error fetching brands:', error.message);
  }
}

// Run the script
addAllBrands();

