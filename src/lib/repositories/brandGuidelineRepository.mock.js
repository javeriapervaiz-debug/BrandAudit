// Temporary in-memory storage for development without database
// This replaces the database calls with in-memory storage

class InMemoryBrandGuidelineRepository {
  constructor() {
    // Use global storage to ensure all instances share the same data
    if (!global.__brandGuidelinesStorage) {
      global.__brandGuidelinesStorage = new Map();
      global.__brandGuidelinesNextId = 1;
    }
    
    this.guidelines = global.__brandGuidelinesStorage;
    this.nextId = global.__brandGuidelinesNextId;
  }

  /**
   * Create a new brand guideline
   */
  async create(guidelineData) {
    const id = this.nextId++;
    global.__brandGuidelinesNextId = this.nextId;
    
    const guideline = {
      id,
      ...guidelineData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    this.guidelines.set(id, guideline);
    console.log(`📝 Created guideline in memory: ${guideline.brandName || guideline.companyName} (ID: ${id})`);
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
      for (const guideline of this.guidelines.values()) {
        if (guideline.isActive && guideline.brandName && 
            guideline.brandName.toLowerCase() === brandName.toLowerCase()) {
          return guideline;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ In-memory query error:', error);
      throw error;
    }
  }

  /**
   * Find brand guideline by ID
   */
  async findById(id) {
    const guideline = this.guidelines.get(id);
    return guideline && guideline.isActive ? guideline : null;
  }

  /**
   * Find all brand guidelines
   */
  async findAll() {
    return Array.from(this.guidelines.values())
      .filter(g => g.isActive)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Get paginated brand guidelines
   */
  async listPaginated(limit = 10, offset = 0) {
    const all = await this.findAll();
    return all.slice(offset, offset + limit);
  }

  /**
   * Update brand guideline by ID
   */
  async updateById(id, updateData) {
    const guideline = this.guidelines.get(id);
    if (!guideline || !guideline.isActive) {
      return null;
    }

    const updated = {
      ...guideline,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.guidelines.set(id, updated);
    return updated;
  }

  /**
   * Update brand guideline by brand name
   */
  async update(brandName, updateData) {
    const guideline = await this.findByBrandName(brandName);
    if (!guideline) {
      return null;
    }

    return await this.updateById(guideline.id, updateData);
  }

  /**
   * Soft delete brand guideline by ID
   */
  async deleteById(id) {
    return await this.updateById(id, { isActive: false });
  }

  /**
   * Soft delete brand guideline by brand name
   */
  async delete(brandName) {
    const guideline = await this.findByBrandName(brandName);
    if (!guideline) {
      return null;
    }
    return await this.deleteById(guideline.id);
  }

  /**
   * Search brand guidelines by company name or industry
   */
  async search(query) {
    return Array.from(this.guidelines.values())
      .filter(g => g.isActive && 
        (g.companyName?.toLowerCase().includes(query.toLowerCase()) ||
         g.industry?.toLowerCase().includes(query.toLowerCase())))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Get brand guidelines by industry
   */
  async findByIndustry(industry) {
    return Array.from(this.guidelines.values())
      .filter(g => g.isActive && g.industry?.toLowerCase() === industry.toLowerCase())
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Get brand guidelines count
   */
  async count() {
    return Array.from(this.guidelines.values()).filter(g => g.isActive).length;
  }

  /**
   * Get recent brand guidelines
   */
  async findRecent(limit = 10) {
    return (await this.findAll()).slice(0, limit);
  }

  /**
   * Get all stored guidelines (for debugging)
   */
  getAllGuidelines() {
    return Array.from(this.guidelines.values());
  }

  /**
   * Clear all guidelines (for testing)
   */
  clear() {
    this.guidelines.clear();
    this.nextId = 1;
    global.__brandGuidelinesNextId = 1;
  }
}

// Export the class so it can be instantiated
export { InMemoryBrandGuidelineRepository as BrandGuidelineRepository };
