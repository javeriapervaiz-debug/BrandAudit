import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'brand_analyzer',
    ssl: false, // Disable SSL for local development
  },
  verbose: true,
  strict: true,
});
