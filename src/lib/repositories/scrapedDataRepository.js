import { db } from '../database/index.js';
import { scrapedWebpages, complianceIssues, auditSessions } from '../database/schema.js';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export class ScrapedDataRepository {
  /**
   * Create a new scraped webpage record
   */
  async create(scrapedData) {
    try {
      const result = await db.insert(scrapedWebpages).values({
        url: scrapedData.url,
        domain: this.extractDomain(scrapedData.url),
        brandId: scrapedData.brandId || null,
        colors: scrapedData.colors || null,
        typography: scrapedData.typography || null,
        logo: scrapedData.logo || null,
        layout: scrapedData.layout || null,
        imagery: scrapedData.imagery || null,
        metadata: scrapedData.metadata || null,
        complianceScore: scrapedData.complianceScore || null,
        issues: scrapedData.issues || null,
        recommendations: scrapedData.recommendations || null,
        screenshot: scrapedData.screenshot || null,
        status: scrapedData.status || 'scraped'
      }).returning();

      console.log(`✅ Created scraped webpage record for ${scrapedData.url}`);
      return result[0];
    } catch (error) {
      console.error('❌ Error creating scraped webpage record:', error);
      throw error;
    }
  }

  /**
   * Get scraped webpage by ID
   */
  async findById(id) {
    try {
      const result = await db
        .select()
        .from(scrapedWebpages)
        .where(eq(scrapedWebpages.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('❌ Error finding scraped webpage by ID:', error);
      throw error;
    }
  }

  /**
   * Get scraped webpage by URL
   */
  async findByUrl(url) {
    try {
      const result = await db
        .select()
        .from(scrapedWebpages)
        .where(eq(scrapedWebpages.url, url))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('❌ Error finding scraped webpage by URL:', error);
      throw error;
    }
  }

  /**
   * Get all scraped webpages for a brand
   */
  async findByBrandId(brandId) {
    try {
      const result = await db
        .select()
        .from(scrapedWebpages)
        .where(and(
          eq(scrapedWebpages.brandId, brandId),
          eq(scrapedWebpages.isActive, true)
        ))
        .orderBy(desc(scrapedWebpages.scrapedAt));

      return result;
    } catch (error) {
      console.error('❌ Error finding scraped webpages by brand ID:', error);
      throw error;
    }
  }

  /**
   * Update scraped webpage
   */
  async updateById(id, updateData) {
    try {
      const result = await db
        .update(scrapedWebpages)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(scrapedWebpages.id, id))
        .returning();

      console.log(`✅ Updated scraped webpage record ${id}`);
      return result[0];
    } catch (error) {
      console.error('❌ Error updating scraped webpage:', error);
      throw error;
    }
  }

  /**
   * Delete scraped webpage (soft delete)
   */
  async deleteById(id) {
    try {
      const result = await db
        .update(scrapedWebpages)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(scrapedWebpages.id, id))
        .returning();

      console.log(`✅ Deleted scraped webpage record ${id}`);
      return result[0];
    } catch (error) {
      console.error('❌ Error deleting scraped webpage:', error);
      throw error;
    }
  }

  /**
   * List scraped webpages with pagination
   */
  async listPaginated(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        brandId = null,
        status = null,
        orderBy = 'scrapedAt',
        orderDirection = 'desc'
      } = options;

      const offset = (page - 1) * limit;
      
      let whereConditions = [eq(scrapedWebpages.isActive, true)];
      
      if (brandId) {
        whereConditions.push(eq(scrapedWebpages.brandId, brandId));
      }
      
      if (status) {
        whereConditions.push(eq(scrapedWebpages.status, status));
      }

      const orderColumn = scrapedWebpages[orderBy] || scrapedWebpages.scrapedAt;
      const orderFn = orderDirection === 'asc' ? asc : desc;

      const result = await db
        .select()
        .from(scrapedWebpages)
        .where(and(...whereConditions))
        .orderBy(orderFn(orderColumn))
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: sql`count(*)` })
        .from(scrapedWebpages)
        .where(and(...whereConditions));

      const total = parseInt(totalResult[0].count);

      return {
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error listing paginated scraped webpages:', error);
      throw error;
    }
  }

  /**
   * Create compliance issue
   */
  async createComplianceIssue(issueData) {
    try {
      const result = await db.insert(complianceIssues).values({
        webpageId: issueData.webpageId,
        issueType: issueData.issueType,
        severity: issueData.severity,
        description: issueData.description,
        element: issueData.element || null,
        expectedValue: issueData.expectedValue || null,
        actualValue: issueData.actualValue || null,
        recommendation: issueData.recommendation || null
      }).returning();

      console.log(`✅ Created compliance issue for webpage ${issueData.webpageId}`);
      return result[0];
    } catch (error) {
      console.error('❌ Error creating compliance issue:', error);
      throw error;
    }
  }

  /**
   * Get compliance issues for a webpage
   */
  async getComplianceIssues(webpageId) {
    try {
      const result = await db
        .select()
        .from(complianceIssues)
        .where(eq(complianceIssues.webpageId, webpageId))
        .orderBy(desc(complianceIssues.createdAt));

      return result;
    } catch (error) {
      console.error('❌ Error getting compliance issues:', error);
      throw error;
    }
  }

  /**
   * Create audit session
   */
  async createAuditSession(sessionData) {
    try {
      const result = await db.insert(auditSessions).values({
        brandId: sessionData.brandId,
        sessionName: sessionData.sessionName || `Audit ${new Date().toISOString().split('T')[0]}`,
        description: sessionData.description || null,
        status: sessionData.status || 'active'
      }).returning();

      console.log(`✅ Created audit session for brand ${sessionData.brandId}`);
      return result[0];
    } catch (error) {
      console.error('❌ Error creating audit session:', error);
      throw error;
    }
  }

  /**
   * Get audit session by ID
   */
  async getAuditSession(sessionId) {
    try {
      const result = await db
        .select()
        .from(auditSessions)
        .where(eq(auditSessions.id, sessionId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('❌ Error getting audit session:', error);
      throw error;
    }
  }

  /**
   * Get all audit sessions for a brand
   */
  async getAuditSessionsByBrand(brandId) {
    try {
      const result = await db
        .select()
        .from(auditSessions)
        .where(and(
          eq(auditSessions.brandId, brandId),
          eq(auditSessions.isActive, true)
        ))
        .orderBy(desc(auditSessions.startedAt));

      return result;
    } catch (error) {
      console.error('❌ Error getting audit sessions by brand:', error);
      throw error;
    }
  }

  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.warn('⚠️ Could not extract domain from URL:', url);
      return null;
    }
  }

  /**
   * Check if URL has been scraped recently (within last 24 hours)
   */
  async isRecentlyScraped(url) {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await db
        .select()
        .from(scrapedWebpages)
        .where(and(
          eq(scrapedWebpages.url, url),
          sql`${scrapedWebpages.scrapedAt} > ${oneDayAgo.toISOString()}`
        ))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('❌ Error checking if URL was recently scraped:', error);
      return false;
    }
  }
}

// Export singleton instance
export const scrapedDataRepository = new ScrapedDataRepository();
