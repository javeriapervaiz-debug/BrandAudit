// Mock Brand Guideline for SaaSGamma - A fictional SaaS company
export const mockBrandGuideline = {
  brandName: "SaaSGamma",
  version: "1.0",
  lastUpdated: "2024-01-15",
  
  colors: {
    primary: {
      hex: "#3B82F6",
      rgb: "rgb(59, 130, 246)",
      name: "Primary Blue",
      usage: "Primary buttons, main headings, key CTAs, logo primary color"
    },
    secondary: {
      hex: "#10B981", 
      rgb: "rgb(16, 185, 129)",
      name: "Success Green",
      usage: "Success states, secondary buttons, positive indicators"
    },
    accent: {
      hex: "#F59E0B",
      rgb: "rgb(245, 158, 11)", 
      name: "Warning Amber",
      usage: "Warnings, highlights, attention-grabbing elements"
    },
    neutral: {
      light: {
        hex: "#F3F4F6",
        rgb: "rgb(243, 244, 246)",
        name: "Light Gray",
        usage: "Backgrounds, subtle borders"
      },
      medium: {
        hex: "#9CA3AF",
        rgb: "rgb(156, 163, 175)",
        name: "Medium Gray", 
        usage: "Secondary text, disabled states"
      },
      dark: {
        hex: "#1F2937",
        rgb: "rgb(31, 41, 55)",
        name: "Dark Gray",
        usage: "Body text, headings"
      }
    },
    forbidden: {
      red: "#EF4444",
      purple: "#8B5CF6",
      pink: "#EC4899"
    },
    rules: [
      "Primary blue (#3B82F6) must be used for all primary buttons and main headings",
      "Secondary green (#10B981) for success states and secondary buttons only",
      "Accent amber (#F59E0B) for warnings and highlights only",
      "Never use red, purple, or pink colors as they conflict with brand identity",
      "Use neutral grays for text hierarchy and subtle UI elements"
    ]
  },

  typography: {
    primaryFont: "Inter",
    fallbackFont: "system-ui, -apple-system, sans-serif",
    hierarchy: {
      h1: { 
        size: "2.5rem", 
        weight: "700", 
        lineHeight: "1.2",
        color: "#3B82F6",
        usage: "Main page titles, hero headings"
      },
      h2: { 
        size: "2rem", 
        weight: "600", 
        lineHeight: "1.3",
        color: "#1F2937",
        usage: "Section headings"
      },
      h3: { 
        size: "1.5rem", 
        weight: "600", 
        lineHeight: "1.4",
        color: "#1F2937",
        usage: "Subsection headings"
      },
      body: { 
        size: "1rem", 
        weight: "400", 
        lineHeight: "1.6",
        color: "#1F2937",
        usage: "Body text, paragraphs"
      },
      button: { 
        size: "1rem", 
        weight: "500", 
        lineHeight: "1.5",
        usage: "Button text"
      },
      small: {
        size: "0.875rem",
        weight: "400",
        lineHeight: "1.5", 
        color: "#9CA3AF",
        usage: "Small text, captions"
      }
    },
    rules: [
      "Inter must be used for all text elements",
      "Fallback to system-ui only if Inter is not available",
      "Never use Arial, Times New Roman, or Comic Sans",
      "Maintain consistent font weights as specified in hierarchy",
      "Use proper line heights for readability"
    ]
  },

  logo: {
    primaryUrl: "/logo-primary-blue.svg",
    minWidth: "120px",
    maxWidth: "200px",
    clearSpace: "24px",
    aspectRatio: "5:1",
    allowedVariations: ["primary-blue", "white", "dark"],
    forbiddenModifications: ["stretch", "distort", "recolor", "rotate", "add-effects"],
    rules: [
      "Logo must always be at least 120px wide and maximum 200px wide",
      "Maintain 24px minimum clear space around the logo on all sides",
      "Never stretch, distort, or recolor the logo",
      "Use primary blue version (#3B82F6) on light backgrounds",
      "Use white version on dark backgrounds",
      "Maintain proper aspect ratio of 5:1"
    ]
  },

  spacing: {
    unit: "8px",
    sectionPadding: "64px",
    containerPadding: "32px",
    elementSpacing: "16px",
    rules: [
      "Use multiples of 8px for all spacing (8px, 16px, 24px, 32px, 64px)",
      "Sections should have 64px vertical padding",
      "Containers should have 32px horizontal padding",
      "Elements within containers should have 16px spacing",
      "Maintain consistent spacing throughout the site"
    ]
  },

  toneOfVoice: {
    description: "Professional yet approachable. Clear, confident, and helpful. Avoid jargon and be concise.",
    keywords: ["innovative", "secure", "reliable", "easy-to-use", "powerful", "efficient"],
    forbiddenWords: ["awesome", "epic", "insane", "literally", "bestest", "super cool", "blow your mind"],
    writingStyle: {
      sentenceLength: "Keep sentences under 20 words when possible",
      formality: "Professional but not corporate-speak",
      personality: "Confident and helpful, not arrogant or overly casual"
    },
    rules: [
      "Use professional language appropriate for business users",
      "Be clear and concise, avoid unnecessary words",
      "Never use slang, excessive exclamation marks, or unprofessional language",
      "Focus on benefits and value, not just features",
      "Use active voice and present tense"
    ]
  },

  buttons: {
    primary: {
      backgroundColor: "#3B82F6",
      textColor: "#FFFFFF",
      borderRadius: "8px",
      padding: "12px 24px",
      fontSize: "1rem",
      fontWeight: "500"
    },
    secondary: {
      backgroundColor: "#10B981", 
      textColor: "#FFFFFF",
      borderRadius: "8px",
      padding: "12px 24px",
      fontSize: "1rem",
      fontWeight: "500"
    },
    outline: {
      backgroundColor: "transparent",
      textColor: "#3B82F6",
      borderColor: "#3B82F6",
      borderWidth: "2px",
      borderRadius: "8px",
      padding: "10px 22px"
    },
    rules: [
      "Primary buttons must use primary blue (#3B82F6) background",
      "Secondary buttons must use success green (#10B981) background", 
      "All buttons must have 8px border radius",
      "Button text must be white on colored backgrounds",
      "Maintain consistent padding and font sizes"
    ]
  },

  layout: {
    maxWidth: "1200px",
    containerPadding: "32px",
    gridColumns: 12,
    breakpoints: {
      mobile: "768px",
      tablet: "1024px", 
      desktop: "1200px"
    },
    rules: [
      "Maximum content width should be 1200px",
      "Use 32px container padding on all sides",
      "Implement responsive design for all breakpoints",
      "Maintain consistent grid system"
    ]
  }
};
