import { pgTable, serial, text, varchar, jsonb, timestamp, integer, boolean, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Brand Guidelines Table
export const brandGuidelines = pgTable('brand_guidelines', {
  id: serial('id').primaryKey(),
  brandName: varchar('brand_name', { length: 255 }).notNull().unique(),
  companyName: varchar('company_name', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  
  // Colors stored as JSONB for flexibility
  colors: jsonb('colors'),
  
  // Typography
  typography: jsonb('typography'),
  
  // Logo guidelines
  logo: jsonb('logo'),
  
  // UI components
  ui: jsonb('ui'),
  
  // Spacing guidelines
  spacing: jsonb('spacing'),
  
  // Layout guidelines
  layout: jsonb('layout'),
  
  // Imagery guidelines
  imagery: jsonb('imagery'),
  
  // Tone of voice
  tone: jsonb('tone'),
  
  // Global rules
  globalRules: jsonb('global_rules'),
  
  // Accessibility guidelines
  accessibility: jsonb('accessibility'),
  
  // Metadata
  metadata: jsonb('metadata'),
  
  // File info
  sourceFile: varchar('source_file', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Analysis Results Table
export const analysisResults = pgTable('analysis_results', {
  id: serial('id').primaryKey(),
  brandGuidelineId: integer('brand_guideline_id').references(() => brandGuidelines.id),
  websiteUrl: text('website_url').notNull(),
  websiteTitle: varchar('website_title', { length: 255 }),
  violations: jsonb('violations'),
  correctElements: jsonb('correct_elements'),
  score: integer('score'),
  totalViolations: integer('total_violations'),
  severityBreakdown: jsonb('severity_breakdown'),
  analysisType: varchar('analysis_type', { length: 50 }),
  processingTime: integer('processing_time'),
  elementsAnalyzed: integer('elements_analyzed'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Scraped Webpage Data Table
export const scrapedWebpages = pgTable('scraped_webpages', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 1000 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  
  // Brand association
  brandId: integer('brand_id').references(() => brandGuidelines.id),
  
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
  
  // Screenshot
  screenshot: text('screenshot'), // Base64 encoded screenshot
  
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
  webpageId: integer('webpage_id').notNull().references(() => scrapedWebpages.id),
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
  brandId: integer('brand_id').notNull().references(() => brandGuidelines.id),
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
export const brandGuidelinesRelations = relations(brandGuidelines, ({ many }) => ({
  analyses: many(analysisResults),
  scrapedWebpages: many(scrapedWebpages),
  auditSessions: many(auditSessions),
}));

export const analysisResultsRelations = relations(analysisResults, ({ one }) => ({
  brandGuideline: one(brandGuidelines, {
    fields: [analysisResults.brandGuidelineId],
    references: [brandGuidelines.id],
  }),
}));

export const scrapedWebpagesRelations = relations(scrapedWebpages, ({ one, many }) => ({
  brandGuideline: one(brandGuidelines, {
    fields: [scrapedWebpages.brandId],
    references: [brandGuidelines.id],
  }),
  issues: many(complianceIssues),
}));

export const complianceIssuesRelations = relations(complianceIssues, ({ one }) => ({
  webpage: one(scrapedWebpages, {
    fields: [complianceIssues.webpageId],
    references: [scrapedWebpages.id],
  }),
}));

export const auditSessionsRelations = relations(auditSessions, ({ one, many }) => ({
  brandGuideline: one(brandGuidelines, {
    fields: [auditSessions.brandId],
    references: [brandGuidelines.id],
  }),
  webpages: many(scrapedWebpages),
}));
