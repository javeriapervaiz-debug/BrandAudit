// Setup database tables
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'brand_analyzer',
});

async function setupTables() {
  console.log('🚀 Setting up database tables...');
  
  try {
    // Read migration SQL
    const migrationSQL = readFileSync(join(__dirname, 'src', 'lib', 'database', 'migrations', '001_init.sql'), 'utf8');
    
    // Execute migration
    await pool.query(migrationSQL);
    console.log('✅ Database tables created successfully!');
    
    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up tables:', error.message);
  } finally {
    await pool.end();
  }
}

setupTables();
