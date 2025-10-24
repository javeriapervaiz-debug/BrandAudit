import { eq, ilike, and, desc } from 'drizzle-orm';
import { db } from '../database';
import { brandGuidelines, type BrandGuideline, type NewBrandGuideline } from '../database/schema';

export class BrandGuidelineRepository {
  /**
   * Create a new brand guideline
   */
  async create(guidelineData: NewBrandGuideline): Promise<BrandGuideline> {
    const [guideline] = await db
      .insert(brandGuidelines)
      .values(guidelineData)
      .returning();
    
    return guideline;
  }

  /**
   * Find brand guideline by brand name (case-insensitive)
   */
  async findByBrandName(brandName: string): Promise<BrandGuideline | null> {
    const [guideline] = await db
      .select()
      .from(brandGuidelines)
      .where(
        and(
          ilike(brandGuidelines.brandName, brandName),
          eq(brandGuidelines.isActive, true)
        )
      )
      .limit(1);
    
    return guideline || null;
  }

  /**
   * Find brand guideline by ID
   */
  async findById(id: number): Promise<BrandGuideline | null> {
    const [guideline] = await db
      .select()
      .from(brandGuidelines)
      .where(
        and(
          eq(brandGuidelines.id, id),
          eq(brandGuidelines.isActive, true)
        )
      )
      .limit(1);
    
    return guideline || null;
  }

  /**
   * Update brand guideline by brand name
   */
  async update(brandName: string, guidelineData: Partial<BrandGuideline>): Promise<BrandGuideline | null> {
    guidelineData.updatedAt = new Date();
    
    const [updated] = await db
      .update(brandGuidelines)
      .set(guidelineData)
      .where(
        and(
          ilike(brandGuidelines.brandName, brandName),
          eq(brandGuidelines.isActive, true)
        )
      )
      .returning();
    
    return updated || null;
  }

  /**
   * Update brand guideline by ID
   */
  async updateById(id: number, guidelineData: Partial<BrandGuideline>): Promise<BrandGuideline | null> {
    guidelineData.updatedAt = new Date();
    
    const [updated] = await db
      .update(brandGuidelines)
      .set(guidelineData)
      .where(
        and(
          eq(brandGuidelines.id, id),
          eq(brandGuidelines.isActive, true)
        )
      )
      .returning();
    
    return updated || null;
  }

  /**
   * List all active brand guidelines
   */
  async listAll(): Promise<BrandGuideline[]> {
    return await db
      .select()
      .from(brandGuidelines)
      .where(eq(brandGuidelines.isActive, true))
      .orderBy(brandGuidelines.brandName);
  }

  /**
   * List brand guidelines with pagination
   */
  async listPaginated(limit: number = 10, offset: number = 0): Promise<{
    guidelines: BrandGuideline[];
    total: number;
  }> {
    const guidelines = await db
      .select()
      .from(brandGuidelines)
      .where(eq(brandGuidelines.isActive, true))
      .orderBy(brandGuidelines.brandName)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(brandGuidelines)
      .where(eq(brandGuidelines.isActive, true));

    return {
      guidelines,
      total: Number(count),
    };
  }

  /**
   * Search brand guidelines by name or company
   */
  async search(query: string): Promise<BrandGuideline[]> {
    return await db
      .select()
      .from(brandGuidelines)
      .where(
        and(
          eq(brandGuidelines.isActive, true),
          or(
            ilike(brandGuidelines.brandName, `%${query}%`),
            ilike(brandGuidelines.companyName, `%${query}%`)
          )
        )
      )
      .orderBy(brandGuidelines.brandName);
  }

  /**
   * Soft delete brand guideline (set isActive to false)
   */
  async delete(brandName: string): Promise<boolean> {
    const [deleted] = await db
      .update(brandGuidelines)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(ilike(brandGuidelines.brandName, brandName))
      .returning({ id: brandGuidelines.id });
    
    return !!deleted;
  }

  /**
   * Hard delete brand guideline
   */
  async hardDelete(brandName: string): Promise<boolean> {
    const [deleted] = await db
      .delete(brandGuidelines)
      .where(ilike(brandGuidelines.brandName, brandName))
      .returning({ id: brandGuidelines.id });
    
    return !!deleted;
  }

  /**
   * Check if brand guideline exists
   */
  async exists(brandName: string): Promise<boolean> {
    const [guideline] = await db
      .select({ id: brandGuidelines.id })
      .from(brandGuidelines)
      .where(
        and(
          ilike(brandGuidelines.brandName, brandName),
          eq(brandGuidelines.isActive, true)
        )
      )
      .limit(1);
    
    return !!guideline;
  }

  /**
   * Get brand guideline statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    recentlyUpdated: number;
  }> {
    const [totalResult] = await db
      .select({ count: sql`count(*)` })
      .from(brandGuidelines);

    const [activeResult] = await db
      .select({ count: sql`count(*)` })
      .from(brandGuidelines)
      .where(eq(brandGuidelines.isActive, true));

    const [inactiveResult] = await db
      .select({ count: sql`count(*)` })
      .from(brandGuidelines)
      .where(eq(brandGuidelines.isActive, false));

    const [recentlyUpdatedResult] = await db
      .select({ count: sql`count(*)` })
      .from(brandGuidelines)
      .where(
        and(
          eq(brandGuidelines.isActive, true),
          gte(brandGuidelines.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        )
      );

    return {
      total: Number(totalResult.count),
      active: Number(activeResult.count),
      inactive: Number(inactiveResult.count),
      recentlyUpdated: Number(recentlyUpdatedResult.count),
    };
  }
}

// Import missing functions
import { sql, or, gte } from 'drizzle-orm';
