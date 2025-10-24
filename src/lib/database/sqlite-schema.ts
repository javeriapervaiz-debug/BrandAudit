import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Brand Guidelines Table for SQLite
export const brandGuidelines = sqliteTable('brand_guidelines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  brandName: text('brand_name').notNull().unique(),
  companyName: text('company_name'),
  industry: text('industry'),
  
  // Store as JSON strings in SQLite
  colors: text('colors', { mode: 'json' }).$type<{
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
  
  typography: text('typography', { mode: 'json' }).$type<{
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
  
  logo: text('logo', { mode: 'json' }).$type<{
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
  
  ui: text('ui', { mode: 'json' }).$type<{
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
  
  spacing: text('spacing', { mode: 'json' }).$type<{
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
  
  layout: text('layout', { mode: 'json' }).$type<{
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
  
  imagery: text('imagery', { mode: 'json' }).$type<{
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
  
  tone: text('tone', { mode: 'json' }).$type<{
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
  
  accessibility: text('accessibility', { mode: 'json' }).$type<{
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
  
  globalRules: text('global_rules', { mode: 'json' }).$type<string[]>(),
  
  metadata: text('metadata', { mode: 'json' }).$type<{
    version?: string;
    lastUpdated?: string;
    sourceUrl?: string;
    brandGuidelineDoc?: string;
  }>(),
  
  sourceFile: text('source_file'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Analysis Results Table for SQLite
export const analysisResults = sqliteTable('analysis_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  brandGuidelineId: integer('brand_guideline_id').references(() => brandGuidelines.id),
  websiteUrl: text('website_url').notNull(),
  websiteTitle: text('website_title'),
  
  violations: text('violations', { mode: 'json' }).$type<Array<{
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
  
  correctElements: text('correct_elements', { mode: 'json' }).$type<Array<{
    category: string;
    element: string;
    status: string;
    details: string;
    confidence: string;
  }>>(),
  
  score: integer('score'),
  totalViolations: integer('total_violations'),
  severityBreakdown: text('severity_breakdown', { mode: 'json' }).$type<{
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>(),
  
  analysisType: text('analysis_type'),
  processingTime: integer('processing_time'),
  elementsAnalyzed: integer('elements_analyzed'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
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

