import { pgTable, serial, text, varchar, jsonb, timestamp, integer, boolean, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Scraped Webpage Data Table
export const scrapedWebpages = pgTable('scraped_webpages', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 1000 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  
  // Brand association
  brandId: integer('brand_id'), // Reference to brand_guidelines table
  
  // Scraped data stored as JSONB for flexibility
  colors: jsonb('colors'),
  typography: jsonb('typography'),
  logo: jsonb('logo'),
  layout: jsonb('layout'),
  imagery: jsonb('imagery'),
  
  // Metadata
  metadata: jsonb('metadata'),
  
  // Analysis results
  complianceScore: real('compliance_score'), // 0-1 score
  issues: jsonb('issues'), // Array of compliance issues
  recommendations: jsonb('recommendations'), // Array of recommendations
  
  // Status
  status: varchar('status', { length: 50 }).default('scraped'), // scraped, analyzed, completed
  isActive: boolean('is_active').default(true),
  
  // Timestamps
  scrapedAt: timestamp('scraped_at').defaultNow(),
  analyzedAt: timestamp('analyzed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Compliance Issues Table
export const complianceIssues = pgTable('compliance_issues', {
  id: serial('id').primaryKey(),
  webpageId: integer('webpage_id').notNull(),
  issueType: varchar('issue_type', { length: 100 }).notNull(), // color, typography, logo, layout
  severity: varchar('severity', { length: 20 }).notNull(), // low, medium, high, critical
  description: text('description').notNull(),
  element: text('element'), // CSS selector or element description
  expectedValue: text('expected_value'),
  actualValue: text('actual_value'),
  recommendation: text('recommendation'),
  
  // Status
  isResolved: boolean('is_resolved').default(false),
  resolvedAt: timestamp('resolved_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Audit Sessions Table
export const auditSessions = pgTable('audit_sessions', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').notNull(),
  sessionName: varchar('session_name', { length: 255 }),
  description: text('description'),
  
  // Results
  totalWebpages: integer('total_webpages').default(0),
  compliantWebpages: integer('compliant_webpages').default(0),
  averageScore: real('average_score'),
  
  // Status
  status: varchar('status', { length: 50 }).default('active'), // active, completed, archived
  isActive: boolean('is_active').default(true),
  
  // Timestamps
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const scrapedWebpagesRelations = relations(scrapedWebpages, ({ many }) => ({
  issues: many(complianceIssues),
}));

export const complianceIssuesRelations = relations(complianceIssues, ({ one }) => ({
  webpage: one(scrapedWebpages, {
    fields: [complianceIssues.webpageId],
    references: [scrapedWebpages.id],
  }),
}));

export const auditSessionsRelations = relations(auditSessions, ({ many }) => ({
  webpages: many(scrapedWebpages),
}));
