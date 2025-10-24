import { desc, eq, and, gte, sql } from 'drizzle-orm';
import { db } from '../database/index.js';
import { analysisResults } from '../database/schema.js';

export class AnalysisRepository {
  /**
   * Create a new analysis result
   */
  async create(analysisData) {
    const [analysis] = await db
      .insert(analysisResults)
      .values(analysisData)
      .returning();
    
    return analysis;
  }

  /**
   * Find analysis by ID
   */
  async findById(id) {
    const [analysis] = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.id, id))
      .limit(1);
    
    return analysis || null;
  }

  /**
   * Find analyses by brand guideline ID
   */
  async findByBrandGuideline(brandGuidelineId, limit = 50) {
    return await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.brandGuidelineId, brandGuidelineId))
      .orderBy(desc(analysisResults.createdAt))
      .limit(limit);
  }

  /**
   * Find analyses by website URL
   */
  async findByWebsiteUrl(websiteUrl, limit = 50) {
    return await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.websiteUrl, websiteUrl))
      .orderBy(desc(analysisResults.createdAt))
      .limit(limit);
  }

  /**
   * Find all analyses
   */
  async findAll(limit = 100) {
    return await db
      .select()
      .from(analysisResults)
      .orderBy(desc(analysisResults.createdAt))
      .limit(limit);
  }

  /**
   * Find recent analyses
   */
  async findRecent(limit = 20) {
    return await db
      .select()
      .from(analysisResults)
      .orderBy(desc(analysisResults.createdAt))
      .limit(limit);
  }

  /**
   * Find analyses by date range
   */
  async findByDateRange(startDate, endDate, limit = 100) {
    return await db
      .select()
      .from(analysisResults)
      .where(
        and(
          gte(analysisResults.createdAt, startDate),
          gte(endDate, analysisResults.createdAt)
        )
      )
      .orderBy(desc(analysisResults.createdAt))
      .limit(limit);
  }

  /**
   * Find analyses with high severity violations
   */
  async findHighSeverity(limit = 50) {
    return await db
      .select()
      .from(analysisResults)
      .where(
        sql`JSON_EXTRACT(analysis, '$.violations') IS NOT NULL 
            AND JSON_LENGTH(JSON_EXTRACT(analysis, '$.violations')) > 0
            AND JSON_SEARCH(JSON_EXTRACT(analysis, '$.violations'), 'one', 'high', NULL, '$[*].severity') IS NOT NULL`
      )
      .orderBy(desc(analysisResults.createdAt))
      .limit(limit);
  }

  /**
   * Get analysis statistics
   */
  async getStatistics() {
    const total = await db
      .select({ count: analysisResults.id })
      .from(analysisResults);

    const recent = await db
      .select({ count: analysisResults.id })
      .from(analysisResults)
      .where(
        gte(analysisResults.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      );

    return {
      total: total.length,
      recent: recent.length,
      lastWeek: recent.length
    };
  }

  /**
   * Update analysis by ID
   */
  async updateById(id, updateData) {
    const [updated] = await db
      .update(analysisResults)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .where(eq(analysisResults.id, id))
      .returning();
    
    return updated;
  }

  /**
   * Delete analysis by ID
   */
  async deleteById(id) {
    const [deleted] = await db
      .delete(analysisResults)
      .where(eq(analysisResults.id, id))
      .returning();
    
    return deleted;
  }

  /**
   * Get analysis count by brand
   */
  async getCountByBrand(brandGuidelineId) {
    const result = await db
      .select({ count: analysisResults.id })
      .from(analysisResults)
      .where(eq(analysisResults.brandGuidelineId, brandGuidelineId));
    
    return result.length;
  }

  /**
   * Get analysis count by website
   */
  async getCountByWebsite(websiteUrl) {
    const result = await db
      .select({ count: analysisResults.id })
      .from(analysisResults)
      .where(eq(analysisResults.websiteUrl, websiteUrl));
    
    return result.length;
  }

  /**
   * Search analyses by website URL or brand name
   */
  async search(query, limit = 50) {
    return await db
      .select()
      .from(analysisResults)
      .where(
        sql`website_url LIKE ${'%' + query + '%'} 
            OR JSON_EXTRACT(analysis, '$.brandName') LIKE ${'%' + query + '%'}`
      )
      .orderBy(desc(analysisResults.createdAt))
      .limit(limit);
  }
}
