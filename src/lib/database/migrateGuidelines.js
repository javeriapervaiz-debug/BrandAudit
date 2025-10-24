// Script to migrate existing hardcoded guidelines to database
import { Pool } from 'pg';
import { githubBrandGuideline } from '../githubBrandGuideline.js';
import { bufferBrandGuideline } from '../bufferBrandGuideline.js';
import { appleBrandGuideline } from '../appleBrandGuideline.js';
import { mockBrandGuideline } from '../mockBrandGuideline.js';

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'brand_analyzer',
});

// Convert existing guidelines to database format
function convertGuidelineToDbFormat(guideline) {
  return {
    brand_name: guideline.metadata?.brandName || guideline.brandName,
    company_name: guideline.metadata?.brandName || guideline.brandName,
    industry: 'Technology', // Default industry
    colors: JSON.stringify(guideline.colors),
    typography: JSON.stringify(guideline.typography),
    logo: JSON.stringify(guideline.logo),
    ui: JSON.stringify(guideline.ui),
    spacing: JSON.stringify(guideline.spacing),
    layout: JSON.stringify(guideline.layout),
    imagery: JSON.stringify(guideline.imagery),
    tone: JSON.stringify(guideline.tone),
    accessibility: JSON.stringify(guideline.accessibility),
    global_rules: JSON.stringify(guideline.globalRules),
    metadata: JSON.stringify({
      version: guideline.metadata?.version || '1.0',
      lastUpdated: guideline.metadata?.lastUpdated || new Date().toISOString(),
      sourceUrl: guideline.metadata?.sourceUrl || '',
      brandGuidelineDoc: guideline.metadata?.brandGuidelineDoc || `${guideline.metadata?.brandName || guideline.brandName} Brand Guidelines`
    }),
    source_file: 'migrated_from_hardcoded',
    is_active: true
  };
}

async function migrateGuidelines() {
  console.log('🚀 Starting guideline migration...');

  const guidelines = [
    { name: 'GitHub', data: githubBrandGuideline },
    { name: 'Buffer', data: bufferBrandGuideline },
    { name: 'Apple', data: appleBrandGuideline },
    { name: 'Mock', data: mockBrandGuideline }
  ];

  for (const { name, data } of guidelines) {
    try {
      console.log(`📋 Migrating ${name} guidelines...`);
      
      const dbFormat = convertGuidelineToDbFormat(data);
      
      // Check if already exists
      const checkResult = await pool.query(
        'SELECT id FROM brand_guidelines WHERE brand_name = $1',
        [dbFormat.brand_name]
      );
      
      if (checkResult.rows.length > 0) {
        console.log(`⚠️  ${name} guidelines already exist, skipping...`);
        continue;
      }

      // Insert the guideline
      const insertQuery = `
        INSERT INTO brand_guidelines (
          brand_name, company_name, industry, colors, typography, logo, ui, 
          spacing, layout, imagery, tone, accessibility, global_rules, 
          metadata, source_file, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING id
      `;
      
      const values = [
        dbFormat.brand_name, dbFormat.company_name, dbFormat.industry,
        dbFormat.colors, dbFormat.typography, dbFormat.logo, dbFormat.ui,
        dbFormat.spacing, dbFormat.layout, dbFormat.imagery, dbFormat.tone,
        dbFormat.accessibility, dbFormat.global_rules, dbFormat.metadata,
        dbFormat.source_file, dbFormat.is_active
      ];
      
      const result = await pool.query(insertQuery, values);
      console.log(`✅ Successfully migrated ${name} guidelines (ID: ${result.rows[0].id})`);
      
    } catch (error) {
      console.error(`❌ Failed to migrate ${name} guidelines:`, error.message);
    }
  }

  console.log('🎉 Migration completed!');
  
  // Show statistics
  const statsResult = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active,
      COUNT(CASE WHEN updated_at > NOW() - INTERVAL '30 days' THEN 1 END) as recently_updated
    FROM brand_guidelines
  `);
  
  const stats = statsResult.rows[0];
  console.log('\n📊 Database Statistics:');
  console.log(`   Total guidelines: ${stats.total}`);
  console.log(`   Active guidelines: ${stats.active}`);
  console.log(`   Recently updated: ${stats.recently_updated}`);
  
  await pool.end();
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateGuidelines().catch(console.error);
}

export { migrateGuidelines };
