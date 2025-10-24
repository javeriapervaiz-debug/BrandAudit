import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './sqlite-schema';

// Create SQLite database file
const sqlite = new Database('./brand_analyzer.db');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export types
export type DbClient = typeof db;
export * from './sqlite-schema';

