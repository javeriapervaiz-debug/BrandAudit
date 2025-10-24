// GitHub Brand Guidelines - Comprehensive schema for LLM audit analysis
export const githubBrandGuideline = {
  metadata: {
    brandName: "GitHub",
    version: "2025",
    lastUpdated: "2025-03-10",
    sourceUrl: "https://brand.github.com/GitHub-BrandGuidelines-2025.pdf",
    brandGuidelineDoc: "GitHub Brand Guidelines 2025"
  },

  colors: {
    semantic: {
      primary: { 
        hex: "#24292e", 
        rgb: "rgb(36,41,46)", 
        name: "GitHub Dark",
        usage: "Main text, primary backgrounds, headers" 
      },
      secondary: { 
        hex: "#0366d6", 
        rgb: "rgb(3,102,214)", 
        name: "GitHub Blue",
        usage: "Links, primary buttons, accent elements" 
      },
      success: { 
        hex: "#28a745", 
        rgb: "rgb(40,167,69)", 
        name: "GitHub Green",
        usage: "Success states, positive indicators" 
      },
      warning: { 
        hex: "#ffd33d", 
        rgb: "rgb(255,211,61)", 
        name: "GitHub Yellow",
        usage: "Warnings, attention-grabbing elements" 
      },
      danger: { 
        hex: "#d73a49", 
        rgb: "rgb(215,58,73)", 
        name: "GitHub Red",
        usage: "Errors, delete actions, critical alerts" 
      }
    },
    neutral: {
      white: { 
        hex: "#ffffff", 
        rgb: "rgb(255,255,255)", 
        name: "White",
        usage: "Backgrounds, light UI surfaces" 
      },
      gray100: { 
        hex: "#f6f8fa", 
        rgb: "rgb(246,248,250)", 
        name: "Gray 100",
        usage: "Light backgrounds, subtle borders" 
      },
      gray200: { 
        hex: "#e1e4e8", 
        rgb: "rgb(225,228,232)", 
        name: "Gray 200",
        usage: "Borders, dividers, subtle backgrounds" 
      },
      gray300: { 
        hex: "#d1d5da", 
        rgb: "rgb(209,213,218)", 
        name: "Gray 300",
        usage: "Disabled text, subtle borders" 
      },
      gray500: { 
        hex: "#6a737d", 
        rgb: "rgb(106,115,125)", 
        name: "Gray 500",
        usage: "Muted text, secondary information" 
      },
      gray900: { 
        hex: "#24292e", 
        rgb: "rgb(36,41,46)", 
        name: "Gray 900",
        usage: "Dark text, primary content" 
      }
    },
    forbidden: ["#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4"],
    accessibility: {
      minContrastTextOnBackground: 4.5,
      minContrastUiElement: 3.0,
      colorBlindFriendly: true
    },
    allowedCombinations: [
      { background: "#ffffff", text: "#24292e", contrast: 16.0 },
      { background: "#24292e", text: "#ffffff", contrast: 16.0 },
      { background: "#f6f8fa", text: "#24292e", contrast: 12.6 },
      { background: "#0366d6", text: "#ffffff", contrast: 4.5 }
    ],
    rules: [
      "Primary (#24292e) must be used for main text and headers",
      "Secondary (#0366d6) for links and primary buttons only",
      "Success (#28a745) for positive states and confirmations",
      "Warning (#ffd33d) for attention-grabbing elements",
      "Danger (#d73a49) for errors and destructive actions",
      "Neutral grays for borders, backgrounds, and muted text",
      "Never use forbidden colors in any UI elements",
      "All text must pass at least 4.5:1 contrast against its background",
      "UI elements must pass at least 3.0:1 contrast ratio"
    ]
  },

  typography: {
    fonts: {
      primary: "SF Pro Text",
      fallback: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      monospace: "SF Mono, Monaco, 'Cascadia Code', 'Roboto Mono', monospace"
    },
    hierarchy: {
      h1: { 
        size: "2rem", 
        weight: "600", 
        lineHeight: "1.25", 
        letterSpacing: "0", 
        color: "#24292e",
        usage: "Main page titles, hero headings"
      },
      h2: { 
        size: "1.5rem", 
        weight: "600", 
        lineHeight: "1.25", 
        letterSpacing: "0", 
        color: "#24292e",
        usage: "Section headings, major headings"
      },
      h3: { 
        size: "1.25rem", 
        weight: "600", 
        lineHeight: "1.25", 
        letterSpacing: "0", 
        color: "#24292e",
        usage: "Subsection headings, card titles"
      },
      h4: { 
        size: "1rem", 
        weight: "600", 
        lineHeight: "1.25", 
        letterSpacing: "0", 
        color: "#24292e",
        usage: "Small headings, labels"
      },
      body: { 
        size: "1rem", 
        weight: "400", 
        lineHeight: "1.5", 
        letterSpacing: "0", 
        color: "#24292e",
        usage: "Body text, descriptions, main content"
      },
      small: { 
        size: "0.875rem", 
        weight: "400", 
        lineHeight: "1.5", 
        letterSpacing: "0", 
        color: "#6a737d",
        usage: "Captions, metadata, secondary text"
      },
      code: { 
        size: "0.875rem", 
        weight: "400", 
        lineHeight: "1.45", 
        letterSpacing: "0", 
        fontFamily: "SF Mono, Monaco, monospace", 
        color: "#24292e",
        usage: "Code snippets, technical text"
      }
    },
    responsive: {
      breakpoints: { sm: "576px", md: "768px", lg: "992px", xl: "1200px" },
      scaleFactors: { small: 0.875, medium: 1, large: 1.125 }
    },
    rules: [
      "Use primary font only; fallback fonts only when unavailable",
      "Never use serif or decorative fonts",
      "Maintain consistent hierarchy across breakpoints",
      "Always use monospace for code / technical text",
      "Headings must use weight 600, body text weight 400",
      "Line height must be 1.25 for headings, 1.5 for body text"
    ]
  },

  logo: {
    variants: {
      mark: "/assets/github-mark.svg",
      wordmark: "/assets/github-wordmark.svg",
      inverted: "/assets/github-invert.svg"
    },
    minWidth: "32px",
    maxWidth: "120px",
    clearSpace: "8px",
    aspectRatio: 1,
    backgroundUsage: {
      onDark: "inverted logo",
      onLight: "standard logo"
    },
    forbidden: ["recolor", "distort", "rotate", "add effects", "overlay", "shadow"],
    rules: [
      "Logo must maintain a clear space of 8px on all sides",
      "Never stretch, distort, recolor, or rotate the logo",
      "Use correct logo variant depending on background contrast",
      "Do not overlay text or other elements on the logo",
      "Maintain aspect ratio at all times"
    ]
  },

  ui: {
    buttons: {
      primary: { 
        bg: "#0366d6", 
        text: "#ffffff", 
        border: "1px solid #0366d6", 
        radius: "6px", 
        padding: "8px 16px", 
        fontSize: "1rem", 
        fontWeight: "500",
        usage: "Main actions, primary CTAs"
      },
      secondary: { 
        bg: "#ffffff", 
        text: "#24292e", 
        border: "1px solid #d1d5da", 
        radius: "6px", 
        padding: "8px 16px", 
        fontSize: "1rem", 
        fontWeight: "500",
        usage: "Secondary actions, cancel buttons"
      },
      success: { 
        bg: "#28a745", 
        text: "#ffffff", 
        border: "1px solid #28a745", 
        radius: "6px", 
        padding: "8px 16px", 
        fontSize: "1rem", 
        fontWeight: "500",
        usage: "Confirm actions, positive CTAs"
      },
      danger: { 
        bg: "#d73a49", 
        text: "#ffffff", 
        border: "1px solid #d73a49", 
        radius: "6px", 
        padding: "8px 16px", 
        fontSize: "1rem", 
        fontWeight: "500",
        usage: "Delete actions, destructive CTAs"
      },
      ghost: {
        bg: "transparent",
        text: "#0366d6",
        border: "1px solid transparent",
        radius: "6px",
        padding: "8px 16px",
        fontSize: "1rem",
        fontWeight: "500",
        usage: "Subtle actions, text-only buttons"
      }
    },
    states: {
      hover: {
        darkenFactor: 0.1,
        transition: "all 0.2s ease"
      },
      active: {
        darkenFactor: 0.2,
        transform: "translateY(1px)"
      },
      disabled: {
        opacity: 0.5,
        cursor: "not-allowed"
      },
      focus: {
        outline: "2px solid #0366d6",
        outlineOffset: "2px"
      }
    },
    rules: [
      "Primary buttons use GitHub blue background",
      "Secondary buttons use white background with gray border",
      "Success buttons use GitHub green background",
      "Danger buttons use GitHub red background",
      "Ghost buttons are transparent with colored text",
      "All buttons must have hover and focus states",
      "Disabled buttons must be clearly indicated"
    ]
  },

  spacing: {
    base: 4,
    multiples: [4, 8, 12, 16, 24, 32, 48, 64],
    container: { padding: 16 },
    sectionVertical: 32,
    elementGap: 8,
    responsive: {
      sm: { container: 12, sectionVertical: 24 },
      md: { container: 16, sectionVertical: 32 },
      lg: { container: 24, sectionVertical: 48 }
    },
    rules: [
      "All spacing must be a multiple of 4px",
      "Sections have 32px top & bottom padding",
      "Containers use 16px padding horizontally",
      "Element gaps should be 8px minimum",
      "Maintain consistent spacing across breakpoints"
    ]
  },

  layout: {
    maxWidth: 1280,
    gutters: { sm: 16, md: 24, lg: 32 },
    columns: 12,
    breakpoints: { xs: 0, sm: 544, md: 768, lg: 1012, xl: 1280 },
    alignment: { default: "left", center: true },
    grid: {
      containerPadding: 16,
      columnGap: 24,
      rowGap: 32
    },
    rules: [
      "Content width limited to 1280px maximum",
      "Use consistent gutter sizes per breakpoint",
      "Maintain 12-column grid system",
      "Left-align text by default, center when appropriate"
    ]
  },

  imagery: {
    iconStyle: {
      strokeWidth: 2,
      fill: "none",
      color: "#24292e",
      cornerRadius: 2
    },
    illustrationStyle: {
      palette: ["#0366d6", "#24292e", "#6a737d"],
      filter: "none",
      overlayOpacity: 0.2,
      lineWeight: 2
    },
    photography: {
      allowed: ["clean", "minimal", "developer-focused"],
      forbidden: ["overly artistic", "blurry", "low contrast"],
      filters: ["none", "subtle desaturation"]
    },
    rules: [
      "Icons should use stroke style with 2px weight",
      "Illustrations should follow brand color palette",
      "Avoid photographic styles that clash with UI",
      "Maintain consistent visual weight across icons",
      "Use subtle effects only, avoid heavy filters"
    ]
  },

  tone: {
    style: "developer-focused, helpful, concise, professional",
    keywords: ["open source", "repository", "code", "collaborative", "issues", "pull request", "commit", "merge"],
    forbidden: ["epic", "amazing", "super cool", "literally", "incredible", "revolutionary", "game-changing"],
    writingStyle: {
      voice: "active",
      tense: "present",
      person: "second",
      punctuation: "oxford comma",
      sentenceLength: "short to medium"
    },
    examples: {
      good: [
        "Create a new repository",
        "Open a pull request",
        "Review the changes",
        "Merge the branch"
      ],
      bad: [
        "Create an amazing new repository",
        "Open an incredible pull request",
        "Review the epic changes",
        "Merge the revolutionary branch"
      ]
    },
    rules: [
      "Use clear, direct language targeted at developers",
      "Avoid marketing fluff or hype words",
      "Write in active voice with present tense",
      "Keep sentences concise and actionable",
      "Use technical terms accurately"
    ]
  },

  accessibility: {
    contrast: {
      normalText: 4.5,
      largeText: 3.0,
      uiElements: 3.0
    },
    focus: {
      outline: "2px solid #0366d6",
      outlineOffset: "2px"
    },
    keyboard: {
      tabOrder: "logical",
      skipLinks: true,
      escapeKey: "close modals"
    },
    screenReader: {
      altText: "descriptive",
      labels: "required",
      headings: "hierarchical"
    },
    rules: [
      "All text must meet WCAG AA contrast requirements",
      "Focus states must be clearly visible",
      "Interactive elements must be keyboard accessible",
      "Images must have descriptive alt text",
      "Form elements must have proper labels"
    ]
  },

  globalRules: [
    "Do not recolor or distort logos",
    "Do not use forbidden colors or fonts",
    "All text must pass accessibility contrast rules",
    "Always prefer brand tokens over arbitrary values",
    "Maintain consistent spacing using 4px grid",
    "Use appropriate button styles for action context",
    "Follow typography hierarchy strictly",
    "Ensure all interactive elements have proper states"
  ]
};