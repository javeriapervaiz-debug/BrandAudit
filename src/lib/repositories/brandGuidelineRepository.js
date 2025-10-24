import { eq, ilike, and, desc } from 'drizzle-orm';
import { db } from '../database/index.js';
import { brandGuidelines } from '../database/schema.js';

export class BrandGuidelineRepository {
  /**
   * Create a new brand guideline
   */
  async create(guidelineData) {
    const [guideline] = await db
      .insert(brandGuidelines)
      .values(guidelineData)
      .returning();
    
    return guideline;
  }

  /**
   * Check if brand guideline exists by brand name
   */
  async exists(brandName) {
    const guideline = await this.findByBrandName(brandName);
    return !!guideline;
  }

  /**
   * Find brand guideline by brand name (case-insensitive)
   */
  async findByBrandName(brandName) {
    try {
      // Use Drizzle ORM query (exact match first)
      const [guideline] = await db
        .select()
        .from(brandGuidelines)
        .where(
          and(
            eq(brandGuidelines.brandName, brandName),
            eq(brandGuidelines.isActive, true)
          )
        )
        .limit(1);
      
      if (guideline) {
        return guideline;
      }
      
      // If no exact match, try case-insensitive search
      const allGuidelines = await db
        .select()
        .from(brandGuidelines)
        .where(eq(brandGuidelines.isActive, true));
      
      const found = allGuidelines.find(g => 
        g.brandName && brandName && g.brandName.toLowerCase() === brandName.toLowerCase()
      );
      
      return found || null;
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
  }

  /**
   * Find brand guideline by ID
   */
  async findById(id) {
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
   * Find all brand guidelines
   */
  async findAll() {
    return await db
      .select()
      .from(brandGuidelines)
      .where(eq(brandGuidelines.isActive, true))
      .orderBy(desc(brandGuidelines.updatedAt));
  }

  /**
   * Get paginated brand guidelines
   */
  async listPaginated(limit = 10, offset = 0) {
    return await db
      .select()
      .from(brandGuidelines)
      .where(eq(brandGuidelines.isActive, true))
      .orderBy(desc(brandGuidelines.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Update brand guideline by ID
   */
  async updateById(id, updateData) {
    // Convert string timestamps to Date objects
    const processedData = { ...updateData };
    if (processedData.lastUpdated && typeof processedData.lastUpdated === 'string') {
      processedData.lastUpdated = new Date(processedData.lastUpdated);
    }
    if (processedData.updatedAt && typeof processedData.updatedAt === 'string') {
      processedData.updatedAt = new Date(processedData.updatedAt);
    }
    
    const [updated] = await db
      .update(brandGuidelines)
      .set({
        ...processedData,
        updatedAt: new Date()
      })
      .where(eq(brandGuidelines.id, id))
      .returning();
    
    return updated;
  }

  /**
   * Update brand guideline by brand name
   */
  async update(brandName, updateData) {
    const [updated] = await db
      .update(brandGuidelines)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          ilike(brandGuidelines.brandName, brandName),
          eq(brandGuidelines.isActive, true)
        )
      )
      .returning();
    
    return updated;
  }

  /**
   * Soft delete brand guideline by ID
   */
  async deleteById(id) {
    const [deleted] = await db
      .update(brandGuidelines)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .where(eq(brandGuidelines.id, id))
      .returning();
    
    return deleted;
  }

  /**
   * Soft delete brand guideline by brand name
   */
  async delete(brandName) {
    const [deleted] = await db
      .update(brandGuidelines)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          ilike(brandGuidelines.brandName, brandName),
          eq(brandGuidelines.isActive, true)
        )
      )
      .returning();
    
    return deleted;
  }

  /**
   * Search brand guidelines by company name or industry
   */
  async search(query) {
    return await db
      .select()
      .from(brandGuidelines)
      .where(
        and(
          eq(brandGuidelines.isActive, true),
          ilike(brandGuidelines.companyName, `%${query}%`)
        )
      )
      .orderBy(desc(brandGuidelines.updatedAt));
  }

  /**
   * Get brand guidelines by industry
   */
  async findByIndustry(industry) {
    return await db
      .select()
      .from(brandGuidelines)
      .where(
        and(
          eq(brandGuidelines.isActive, true),
          ilike(brandGuidelines.industry, industry)
        )
      )
      .orderBy(desc(brandGuidelines.updatedAt));
  }

  /**
   * Get brand guidelines count
   */
  async count() {
    const result = await db
      .select({ count: brandGuidelines.id })
      .from(brandGuidelines)
      .where(eq(brandGuidelines.isActive, true));
    
    return result.length;
  }

  /**
   * Get recent brand guidelines
   */
  async findRecent(limit = 10) {
    return await db
      .select()
      .from(brandGuidelines)
      .where(eq(brandGuidelines.isActive, true))
      .orderBy(desc(brandGuidelines.updatedAt))
      .limit(limit);
  }
}
