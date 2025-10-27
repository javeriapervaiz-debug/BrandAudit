// Temporary in-memory storage for scraped data (development without database)
// This replaces the database calls with in-memory storage

class InMemoryScrapedDataRepository {
  constructor() {
    // Use global storage to ensure all instances share the same data
    if (!global.__scrapedDataStorage) {
      global.__scrapedDataStorage = new Map();
      global.__scrapedDataNextId = 1;
    }
    
    this.scrapedData = global.__scrapedDataStorage;
    this.nextId = global.__scrapedDataNextId;
  }

  /**
   * Create a new scraped webpage record
   */
  async create(scrapedData) {
    const id = this.nextId++;
    global.__scrapedDataNextId = this.nextId;
    
    const record = {
      id,
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
      status: scrapedData.status || 'scraped',
      isActive: true,
      scrapedAt: new Date().toISOString(),
      analyzedAt: scrapedData.analyzedAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.scrapedData.set(id, record);
    console.log(`✅ Created scraped webpage record in memory for ${scrapedData.url} (ID: ${id})`);
    return record;
  }

  /**
   * Get scraped webpage by ID
   */
  async findById(id) {
    return this.scrapedData.get(id) || null;
  }

  /**
   * Get scraped webpage by URL
   */
  async findByUrl(url) {
    for (const record of this.scrapedData.values()) {
      if (record.url === url && record.isActive) {
        return record;
      }
    }
    return null;
  }

  /**
   * Update scraped webpage by ID
   */
  async updateById(id, updateData) {
    const record = this.scrapedData.get(id);
    if (!record) {
      return null;
    }

    const updatedRecord = {
      ...record,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.scrapedData.set(id, updatedRecord);
    console.log(`📝 Updated scraped webpage record in memory (ID: ${id})`);
    return updatedRecord;
  }

  /**
   * Check if URL was recently scraped
   */
  async isRecentlyScraped(url, hoursThreshold = 24) {
    const record = await this.findByUrl(url);
    if (!record) {
      return false;
    }

    const scrapedAt = new Date(record.scrapedAt);
    const now = new Date();
    const hoursDiff = (now - scrapedAt) / (1000 * 60 * 60);

    return hoursDiff < hoursThreshold;
  }

  /**
   * Create compliance issue
   */
  async createComplianceIssue(issueData) {
    // For now, just log the issue - in a real implementation, you'd store this
    console.log(`📋 Compliance issue created in memory:`, {
      webpageId: issueData.webpageId,
      issueType: issueData.issueType,
      severity: issueData.severity,
      description: issueData.description
    });
    
    return {
      id: Date.now(), // Simple ID generation
      ...issueData,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Get all scraped data
   */
  getAllScrapedData() {
    return Array.from(this.scrapedData.values()).filter(record => record.isActive);
  }

  /**
   * Clear all scraped data (for testing)
   */
  clear() {
    this.scrapedData.clear();
    this.nextId = 1;
    global.__scrapedDataNextId = 1;
  }

  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.warn('⚠️ Invalid URL format:', url);
      return url;
    }
  }

  /**
   * Get count of scraped data
   */
  async count() {
    return this.scrapedData.size;
  }

  /**
   * Get scraped data by brand ID
   */
  async findByBrandId(brandId) {
    const results = [];
    for (const record of this.scrapedData.values()) {
      if (record.brandId === brandId && record.isActive) {
        results.push(record);
      }
    }
    return results;
  }

  /**
   * Delete scraped data by ID (soft delete)
   */
  async deleteById(id) {
    const record = this.scrapedData.get(id);
    if (!record) {
      return false;
    }

    const updatedRecord = {
      ...record,
      isActive: false,
      updatedAt: new Date().toISOString()
    };

    this.scrapedData.set(id, updatedRecord);
    console.log(`🗑️ Soft deleted scraped webpage record in memory (ID: ${id})`);
    return true;
  }
}

// Export the class so it can be instantiated
export { InMemoryScrapedDataRepository as ScrapedDataRepository };
