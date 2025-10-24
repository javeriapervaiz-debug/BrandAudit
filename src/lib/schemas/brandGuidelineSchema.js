/**
 * Structured Brand Guideline Schema
 * Defines the semantic structure for brand guidelines with contextual mapping
 */

export const BrandGuidelineSchema = {
  // Core brand information
  brand: {
    name: "string",
    industry: "string",
    description: "string",
    version: "string",
    lastUpdated: "string"
  },

  // Color guidelines with usage context
  colors: {
    primary: {
      hex: "string",
      rgb: "string",
      usage: ["buttons", "cta", "logo"],
      context: "primary brand color for main actions",
      rules: ["must be used for primary buttons", "avoid for text"]
    },
    secondary: [
      {
        hex: "string",
        rgb: "string", 
        usage: ["backgrounds", "accents"],
        context: "secondary brand color for supporting elements",
        rules: ["use for backgrounds", "can be used for accents"]
      }
    ],
    palette: [
      {
        name: "string",
        hex: "string",
        rgb: "string",
        usage: ["buttons", "text", "backgrounds", "accents"],
        context: "approved color usage",
        rules: ["specific usage rules"]
      }
    ],
    // Usage-specific color mapping
    usageContext: {
      buttons: ["#E50914"], // Netflix red for buttons
      text: ["#000000", "#FFFFFF", "#333333"], // Text colors
      backgrounds: ["#000000", "#FFFFFF", "#F5F5F5"], // Background colors
      accents: ["#B20710"] // Accent colors
    },
    // Color rules and constraints
    rules: [
      {
        type: "constraint", // "constraint", "requirement", "prohibition"
        element: "buttons",
        color: "#E50914",
        rule: "Primary buttons must use Netflix Red",
        severity: "high"
      }
    ]
  },

  // Typography guidelines with context
  typography: {
    primaryFont: {
      name: "string",
      family: "string",
      usage: ["headings", "body"],
      context: "main brand font",
      rules: ["use for headings", "avoid for body text"]
    },
    secondaryFont: {
      name: "string", 
      family: "string",
      usage: ["body", "captions"],
      context: "secondary font for body text",
      rules: ["use for body text", "maintain readability"]
    },
    // Font usage by element
    elementUsage: {
      headings: ["Netflix Sans Bold"],
      body: ["Netflix Sans Regular"],
      buttons: ["Netflix Sans Bold"],
      captions: ["Netflix Sans Light"]
    },
    // Typography rules
    rules: [
      {
        element: "headings",
        font: "Netflix Sans Bold",
        size: "24px+",
        rule: "All headings must use Netflix Sans Bold",
        severity: "high"
      }
    ]
  },

  // Logo guidelines with usage context
  logo: {
    primary: {
      color: "#E50914",
      background: "#000000",
      context: "main logo usage",
      rules: ["use red on black background", "maintain clearspace"]
    },
    variations: [
      {
        type: "white",
        color: "#FFFFFF",
        background: "#000000",
        context: "white logo on dark backgrounds",
        rules: ["use only on dark backgrounds", "maintain contrast"]
      }
    ],
    // Logo usage rules
    rules: [
      {
        element: "header",
        usage: "primary logo",
        color: "#E50914",
        background: "#000000",
        rule: "Header logo must be red on black",
        severity: "high"
      },
      {
        element: "footer",
        usage: "white logo",
        color: "#FFFFFF", 
        background: "#000000",
        rule: "Footer can use white logo on dark background",
        severity: "medium"
      }
    ],
    // Logo constraints
    constraints: [
      {
        type: "prohibition",
        rule: "Never use white logo on light backgrounds",
        severity: "high"
      }
    ]
  },

  // Spacing and layout guidelines
  spacing: {
    margins: {
      small: "8px",
      medium: "16px", 
      large: "32px",
      context: "standard margin sizes"
    },
    padding: {
      small: "8px",
      medium: "16px",
      large: "32px", 
      context: "standard padding sizes"
    },
    // Element-specific spacing
    elementSpacing: {
      buttons: "16px margin",
      text: "8px line-height",
      sections: "32px margin"
    }
  },

  // Imagery guidelines
  imagery: {
    style: "photographic",
    tone: "professional",
    quality: "high-resolution",
    context: "brand imagery requirements",
    rules: [
      {
        element: "hero",
        style: "photographic",
        tone: "professional",
        rule: "Hero images must be high-quality photography",
        severity: "medium"
      }
    ]
  },

  // Tone and voice guidelines
  tone: {
    voice: "professional",
    style: "conversational",
    context: "brand voice and tone",
    rules: [
      {
        element: "headings",
        tone: "bold",
        style: "direct",
        rule: "Headings should be bold and direct",
        severity: "medium"
      }
    ]
  },

  // Metadata
  metadata: {
    extractionMethod: "semantic-contextual",
    confidence: 0.85,
    timestamp: "2024-01-01T00:00:00Z",
    sections: ["COLOR", "LOGO", "TYPOGRAPHY", "SPACING"],
    semanticStructure: {
      hasColorContext: true,
      hasLogoRules: true,
      hasTypographyRules: true,
      hasSpacingRules: true
    }
  }
};

/**
 * Validation schema for brand guidelines
 */
export const BrandGuidelineValidation = {
  required: ["brand", "colors", "typography", "logo"],
  properties: {
    brand: {
      required: ["name"],
      properties: {
        name: { type: "string", minLength: 1 },
        industry: { type: "string" }
      }
    },
    colors: {
      required: ["primary"],
      properties: {
        primary: {
          required: ["hex", "usage"],
          properties: {
            hex: { type: "string", pattern: "^#[A-Fa-f0-9]{6}$" },
            usage: { type: "array", items: { type: "string" } }
          }
        }
      }
    }
  }
};

/**
 * Helper functions for schema validation and processing
 */
export class BrandGuidelineProcessor {
  /**
   * Validate brand guideline structure
   */
  static validate(guidelines) {
    const errors = [];
    
    // Check required fields
    if (!guidelines.brand?.name) {
      errors.push("Brand name is required");
    }
    
    if (!guidelines.colors?.primary?.hex) {
      errors.push("Primary color hex is required");
    }
    
    // Validate color hex format
    if (guidelines.colors?.primary?.hex && !/^#[A-Fa-f0-9]{6}$/.test(guidelines.colors.primary.hex)) {
      errors.push("Primary color must be valid hex format");
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Extract usage context for a specific element
   */
  static getUsageContext(guidelines, element) {
    const context = {
      colors: [],
      fonts: [],
      rules: []
    };
    
    // Get colors for this element
    if (guidelines.colors?.usageContext?.[element]) {
      context.colors = guidelines.colors.usageContext[element];
    }
    
    // Get fonts for this element
    if (guidelines.typography?.elementUsage?.[element]) {
      context.fonts = guidelines.typography.elementUsage[element];
    }
    
    // Get rules for this element
    if (guidelines.colors?.rules) {
      context.rules = guidelines.colors.rules.filter(rule => rule.element === element);
    }
    
    return context;
  }

  /**
   * Map brand guidelines to website elements
   */
  static mapToWebsiteElements(guidelines) {
    const mapping = {
      header: {
        colors: guidelines.colors?.usageContext?.buttons || [],
        fonts: guidelines.typography?.elementUsage?.headings || [],
        logo: guidelines.logo?.primary || null
      },
      buttons: {
        colors: guidelines.colors?.usageContext?.buttons || [],
        fonts: guidelines.typography?.elementUsage?.buttons || []
      },
      text: {
        colors: guidelines.colors?.usageContext?.text || [],
        fonts: guidelines.typography?.elementUsage?.body || []
      },
      backgrounds: {
        colors: guidelines.colors?.usageContext?.backgrounds || []
      }
    };
    
    return mapping;
  }
}
