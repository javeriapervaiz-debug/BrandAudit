import { desc, eq, and, gte, sql } from 'drizzle-orm';
import { db } from '../database';
import { analysisResults, type AnalysisResult, type NewAnalysisResult } from '../database/schema';

export class AnalysisRepository {
  /**
   * Create a new analysis result
   */
  async create(analysisData: NewAnalysisResult): Promise<AnalysisResult> {
    const [analysis] = await db
      .insert(analysisResults)
      .values(analysisData)
      .returning();
    
    return analysis;
  }

  /**
   * Find analysis by ID
   */
  async findById(id: number): Promise<AnalysisResult | null> {
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
  async findByBrandGuideline(brandGuidelineId: number, limit: number = 50): Promise<AnalysisResult[]> {
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
  async findByWebsiteUrl(websiteUrl: string, limit: number = 50): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.websiteUrl, websiteUrl))
      .orderBy(desc(analysisResults.createdAt))
      .limit(limit);
  }

  /**
   * Get recent analyses
   */
  async getRecentAnalyses(limit: number = 10): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysisResults)
      .orderBy(desc(analysisResults.createdAt))
      .limit(limit);
  }

  /**
   * Get analyses with pagination
   */
  async getPaginated(limit: number = 20, offset: number = 0): Promise<{
    analyses: AnalysisResult[];
    total: number;
  }> {
    const analyses = await db
      .select()
      .from(analysisResults)
      .orderBy(desc(analysisResults.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(analysisResults);

    return {
      analyses,
      total: Number(count),
    };
  }

  /**
   * Get analyses by date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysisResults)
      .where(
        and(
          gte(analysisResults.createdAt, startDate),
          lte(analysisResults.createdAt, endDate)
        )
      )
      .orderBy(desc(analysisResults.createdAt));
  }

  /**
   * Get analyses by score range
   */
  async getByScoreRange(minScore: number, maxScore: number): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysisResults)
      .where(
        and(
          gte(analysisResults.score, minScore),
          lte(analysisResults.score, maxScore)
        )
      )
      .orderBy(desc(analysisResults.createdAt));
  }

  /**
   * Get analyses by severity
   */
  async getBySeverity(severity: 'critical' | 'high' | 'medium' | 'low'): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysisResults)
      .where(
        sql`JSON_EXTRACT(severity_breakdown, '$.${severity}') > 0`
      )
      .orderBy(desc(analysisResults.createdAt));
  }

  /**
   * Get analysis statistics
   */
  async getStats(): Promise<{
    total: number;
    averageScore: number;
    highSeverityCount: number;
    recentCount: number;
  }> {
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(analysisResults);

    const [avgScoreResult] = await db
      .select({ avg: sql`avg(score)` })
      .from(analysisResults)
      .where(sql`score IS NOT NULL`);

    const [highSeverityResult] = await db
      .select({ count: sql`count(*)` })
      .from(analysisResults)
      .where(
        sql`JSON_EXTRACT(severity_breakdown, '$.high') > 0 OR JSON_EXTRACT(severity_breakdown, '$.critical') > 0`
      );

    const [recentResult] = await db
      .select({ count: sql`count(*)` })
      .from(analysisResults)
      .where(
        gte(analysisResults.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
      );

    return {
      total: Number(totalResult.count),
      averageScore: Number(avgScoreResult.avg) || 0,
      highSeverityCount: Number(highSeverityResult.count),
      recentCount: Number(recentResult.count),
    };
  }

  /**
   * Get top performing websites (highest scores)
   */
  async getTopPerforming(limit: number = 10): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysisResults)
      .where(sql`score IS NOT NULL`)
      .orderBy(desc(analysisResults.score))
      .limit(limit);
  }

  /**
   * Get worst performing websites (lowest scores)
   */
  async getWorstPerforming(limit: number = 10): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysisResults)
      .where(sql`score IS NOT NULL`)
      .orderBy(analysisResults.score)
      .limit(limit);
  }

  /**
   * Delete analysis by ID
   */
  async deleteById(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(analysisResults)
      .where(eq(analysisResults.id, id))
      .returning({ id: analysisResults.id });
    
    return !!deleted;
  }

  /**
   * Delete analyses by brand guideline ID
   */
  async deleteByBrandGuideline(brandGuidelineId: number): Promise<number> {
    const result = await db
      .delete(analysisResults)
      .where(eq(analysisResults.brandGuidelineId, brandGuidelineId))
      .returning({ id: analysisResults.id });
    
    return result.length;
  }

  /**
   * Get analysis trends over time
   */
  async getTrends(days: number = 30): Promise<Array<{
    date: string;
    count: number;
    averageScore: number;
  }>> {
    const result = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        count: sql<number>`count(*)`,
        averageScore: sql<number>`avg(score)`
      })
      .from(analysisResults)
      .where(
        gte(analysisResults.createdAt, new Date(Date.now() - days * 24 * 60 * 60 * 1000))
      )
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    return result.map(row => ({
      date: row.date,
      count: row.count,
      averageScore: Number(row.averageScore) || 0,
    }));
  }
}

// Import missing functions
import { lte } from 'drizzle-orm';
