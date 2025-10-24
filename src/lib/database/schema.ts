import { pgTable, serial, text, varchar, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Brand Guidelines Table
export const brandGuidelines = pgTable('brand_guidelines', {
  id: serial('id').primaryKey(),
  brandName: varchar('brand_name', { length: 255 }).notNull().unique(),
  companyName: varchar('company_name', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  
  // Colors stored as JSONB for flexibility
  colors: jsonb('colors').$type<{
    semantic?: {
      primary?: { hex: string; rgb: string; name: string; usage: string };
      secondary?: { hex: string; rgb: string; name: string; usage: string };
      success?: { hex: string; rgb: string; name: string; usage: string };
      warning?: { hex: string; rgb: string; name: string; usage: string };
      danger?: { hex: string; rgb: string; name: string; usage: string };
    };
    neutral?: {
      white?: { hex: string; rgb: string; name: string; usage: string };
      gray100?: { hex: string; rgb: string; name: string; usage: string };
      gray200?: { hex: string; rgb: string; name: string; usage: string };
      gray300?: { hex: string; rgb: string; name: string; usage: string };
      gray500?: { hex: string; rgb: string; name: string; usage: string };
      gray900?: { hex: string; rgb: string; name: string; usage: string };
    };
    forbidden?: string[];
    accessibility?: {
      minContrastTextOnBackground?: number;
      minContrastUiElement?: number;
      colorBlindFriendly?: boolean;
    };
    allowedCombinations?: Array<{
      background: string;
      text: string;
      contrast: number;
    }>;
    rules?: string[];
  }>(),
  
  // Typography
  typography: jsonb('typography').$type<{
    fonts?: {
      primary?: string;
      fallback?: string;
      monospace?: string;
    };
    hierarchy?: {
      h1?: { size: string; weight: number; lineHeight: string; letterSpacing: string; color: string; usage: string };
      h2?: { size: string; weight: number; lineHeight: string; letterSpacing: string; color: string; usage: string };
      h3?: { size: string; weight: number; lineHeight: string; letterSpacing: string; color: string; usage: string };
      h4?: { size: string; weight: number; lineHeight: string; letterSpacing: string; color: string; usage: string };
      body?: { size: string; weight: number; lineHeight: string; letterSpacing: string; color: string; usage: string };
      small?: { size: string; weight: number; lineHeight: string; letterSpacing: string; color: string; usage: string };
      code?: { size: string; weight: number; lineHeight: string; letterSpacing: string; fontFamily: string; color: string; usage: string };
    };
    responsive?: {
      breakpoints?: { sm: string; md: string; lg: string; xl: string };
      scaleFactors?: { small: number; medium: number; large: number };
    };
    rules?: string[];
  }>(),
  
  // Logo guidelines
  logo: jsonb('logo').$type<{
    variants?: {
      mark?: string;
      wordmark?: string;
      inverted?: string;
    };
    minWidth?: string;
    maxWidth?: string;
    clearSpace?: string;
    aspectRatio?: number;
    backgroundUsage?: {
      onDark?: string;
      onLight?: string;
    };
    forbidden?: string[];
    rules?: string[];
  }>(),
  
  // UI Components
  ui: jsonb('ui').$type<{
    buttons?: {
      primary?: { bg: string; text: string; border: string; radius: string; padding: string; fontSize: string; fontWeight: string; usage: string };
      secondary?: { bg: string; text: string; border: string; radius: string; padding: string; fontSize: string; fontWeight: string; usage: string };
      success?: { bg: string; text: string; border: string; radius: string; padding: string; fontSize: string; fontWeight: string; usage: string };
      danger?: { bg: string; text: string; border: string; radius: string; padding: string; fontSize: string; fontWeight: string; usage: string };
      ghost?: { bg: string; text: string; border: string; radius: string; padding: string; fontSize: string; fontWeight: string; usage: string };
    };
    states?: {
      hover?: { darkenFactor: number; transition: string };
      active?: { darkenFactor: number; transform: string };
      disabled?: { opacity: number; cursor: string };
      focus?: { outline: string; outlineOffset: string };
    };
    rules?: string[];
  }>(),
  
  // Spacing & Layout
  spacing: jsonb('spacing').$type<{
    base?: number;
    multiples?: number[];
    container?: { padding: number };
    sectionVertical?: number;
    elementGap?: number;
    responsive?: {
      sm?: { container: number; sectionVertical: number };
      md?: { container: number; sectionVertical: number };
      lg?: { container: number; sectionVertical: number };
    };
    rules?: string[];
  }>(),
  
  // Layout patterns
  layout: jsonb('layout').$type<{
    maxWidth?: number;
    gutters?: { sm: number; md: number; lg: number };
    columns?: number;
    breakpoints?: { xs: number; sm: number; md: number; lg: number; xl: number };
    alignment?: { default: string; center: boolean };
    grid?: {
      containerPadding: number;
      columnGap: number;
      rowGap: number;
    };
    rules?: string[];
  }>(),
  
  // Imagery & Iconography
  imagery: jsonb('imagery').$type<{
    iconStyle?: {
      strokeWidth: number;
      fill: string;
      color: string;
      cornerRadius: number;
    };
    illustrationStyle?: {
      palette: string[];
      filter: string;
      overlayOpacity: number;
      lineWeight: number;
    };
    photography?: {
      allowed: string[];
      forbidden: string[];
      filters: string[];
    };
    rules?: string[];
  }>(),
  
  // Tone of Voice & Content
  tone: jsonb('tone').$type<{
    style?: string;
    keywords?: string[];
    forbidden?: string[];
    writingStyle?: {
      voice: string;
      tense: string;
      person: string;
      punctuation: string;
      sentenceLength: string;
    };
    examples?: {
      good: string[];
      bad: string[];
    };
    rules?: string[];
  }>(),
  
  // Accessibility
  accessibility: jsonb('accessibility').$type<{
    contrast?: {
      normalText: number;
      largeText: number;
      uiElements: number;
    };
    focus?: {
      outline: string;
      outlineOffset: string;
    };
    keyboard?: {
      tabOrder: string;
      skipLinks: boolean;
      escapeKey: string;
    };
    screenReader?: {
      altText: string;
      labels: string;
      headings: string;
    };
    rules?: string[];
  }>(),
  
  // Global Rules
  globalRules: jsonb('global_rules').$type<string[]>(),
  
  // Metadata
  metadata: jsonb('metadata').$type<{
    version?: string;
    lastUpdated?: string;
    sourceUrl?: string;
    brandGuidelineDoc?: string;
  }>(),
  
  sourceFile: varchar('source_file', { length: 255 }),
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
  
  // Analysis data
  violations: jsonb('violations').$type<Array<{
    elementType: string;
    issueType: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    found: any;
    expected: any;
    suggestion: string;
    affectedElements: number;
    examples: Array<any>;
    location: string;
    impact?: string;
    priority?: string;
  }>>(),
  
  correctElements: jsonb('correct_elements').$type<Array<{
    category: string;
    element: string;
    status: string;
    details: string;
    confidence: string;
  }>>(),
  
  // Summary metrics
  score: integer('score'),
  totalViolations: integer('total_violations'),
  severityBreakdown: jsonb('severity_breakdown').$type<{
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>(),
  
  // Analysis metadata
  analysisType: varchar('analysis_type', { length: 50 }),
  processingTime: integer('processing_time'), // in milliseconds
  elementsAnalyzed: integer('elements_analyzed'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relations
export const brandGuidelinesRelations = relations(brandGuidelines, ({ many }) => ({
  analyses: many(analysisResults),
}));

export const analysisResultsRelations = relations(analysisResults, ({ one }) => ({
  brandGuideline: one(brandGuidelines, {
    fields: [analysisResults.brandGuidelineId],
    references: [brandGuidelines.id],
  }),
}));

// Type exports
export type BrandGuideline = typeof brandGuidelines.$inferSelect;
export type NewBrandGuideline = typeof brandGuidelines.$inferInsert;
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type NewAnalysisResult = typeof analysisResults.$inferInsert;
