#!/usr/bin/env node

// Database setup script
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'brand_analyzer',
};

async function setupDatabase() {
  console.log('🚀 Setting up database...');
  
  // First, connect to postgres database to create the brand_analyzer database
  const adminPool = new Pool({
    ...dbConfig,
    database: 'postgres'
  });

  try {
    // Create database if it doesn't exist
    console.log('📋 Creating database...');
    await adminPool.query(`CREATE DATABASE ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' created successfully`);
  } catch (error) {
    if (error.code === '42P04') {
      console.log(`ℹ️  Database '${dbConfig.database}' already exists`);
    } else {
      console.error('❌ Error creating database:', error.message);
      throw error;
    }
  } finally {
    await adminPool.end();
  }

  // Now connect to the brand_analyzer database
  const pool = new Pool(dbConfig);

  try {
    // Read and execute migration
    console.log('📋 Running migrations...');
    const migrationSQL = readFileSync(join(__dirname, 'src', 'lib', 'database', 'migrations', '001_init.sql'), 'utf8');
    await pool.query(migrationSQL);
    console.log('✅ Migrations completed successfully');

    // Test connection
    console.log('🔍 Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log(`   Current time: ${result.rows[0].now}`);

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }

  console.log('🎉 Database setup completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm install');
  console.log('   2. Set up your .env file with database credentials');
  console.log('   3. Run: node src/lib/database/migrateGuidelines.js');
  console.log('   4. Start the application: npm run dev');
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().catch(console.error);
}

export { setupDatabase };
