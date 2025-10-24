// Cross-brand learning heuristics and synonym mapping
export const BRAND_SYNONYM_MAP = {
  // Color variations
  "primary color": "primary",
  "main hue": "primary", 
  "core palette": "primary",
  "brand color": "primary",
  "main color": "primary",
  "key color": "primary",
  "signature color": "primary",
  "hero color": "primary",
  
  "secondary color": "secondary",
  "accent color": "secondary",
  "supporting color": "secondary",
  "complementary color": "secondary",
  
  "background color": "background",
  "text color": "text",
  "body color": "text",
  "heading color": "text",
  
  // Typography variations
  "brand font": "primaryFont",
  "main typeface": "primaryFont",
  "display typeface": "primaryFont",
  "headline font": "primaryFont",
  "primary font": "primaryFont",
  "core font": "primaryFont",
  "signature font": "primaryFont",
  
  "secondary font": "secondaryFont",
  "body font": "secondaryFont",
  "body typeface": "secondaryFont",
  "text font": "secondaryFont",
  "supporting font": "secondaryFont",
  "web font": "secondaryFont",
  "print font": "secondaryFont",
  
  // Logo rule variations
  "do not distort": "forbidden",
  "never distort": "forbidden",
  "don't distort": "forbidden",
  "avoid distorting": "forbidden",
  "no distortion": "forbidden",
  
  "clear space": "spacing",
  "breathing room": "spacing",
  "minimum space": "spacing",
  "safe area": "spacing",
  "exclusion zone": "spacing",
  "white space": "spacing",
  
  "minimum size": "minSize",
  "smallest size": "minSize",
  "smallest use": "minSize",
  "minimum use": "minSize",
  
  // Weight variations
  "font weight": "weight",
  "type weight": "weight",
  "text weight": "weight",
  "font style": "style",
  "type style": "style",
  "text style": "style"
};

// Section classification keywords
export const SECTION_CLASSIFIERS = {
  COLOR: [
    "color", "palette", "hex", "rgb", "cmyk", "pantone", "hue", "shade", 
    "tint", "primary", "secondary", "accent", "background", "foreground"
  ],
  TYPOGRAPHY: [
    "font", "typeface", "typography", "weight", "italic", "bold", "light",
    "regular", "medium", "semibold", "heavy", "thin", "hairline", "text",
    "heading", "body", "display", "caption", "label"
  ],
  LOGO: [
    "logo", "mark", "symbol", "wordmark", "logotype", "clearspace", 
    "breathing room", "minimum size", "distort", "alter", "modify",
    "proportions", "aspect ratio", "lockup", "horizontal", "vertical"
  ],
  SPACING: [
    "spacing", "margin", "padding", "grid", "layout", "clear space",
    "white space", "breathing room", "exclusion zone", "safe area",
    "minimum space", "gutter", "baseline", "leading", "tracking"
  ],
  IMAGERY: [
    "photo", "photography", "imagery", "visual", "tone", "style", 
    "illustration", "graphic", "icon", "pattern", "texture", "mood",
    "aesthetic", "look", "feel", "vibe", "atmosphere"
  ]
};

// Color format patterns with context
export const COLOR_PATTERNS = [
  // HEX patterns
  { regex: /#([A-Fa-f0-9]{3,6})\b/g, format: 'hex' },
  { regex: /HEX\s*#?([A-Fa-f0-9]{3,6})\b/gi, format: 'hex' },
  
  // RGB patterns (more flexible)
  { regex: /RGB\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi, format: 'rgb' },
  { regex: /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, format: 'rgb' },
  { regex: /RGB\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, format: 'rgb' }, // Case sensitive version
  
  // RGBA patterns
  { regex: /RGBA\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/gi, format: 'rgba' },
  { regex: /rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/g, format: 'rgba' },
  
  // CMYK patterns
  { regex: /CMYK\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi, format: 'cmyk' },
  { regex: /cmyk\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, format: 'cmyk' },
  
  // Pantone patterns
  { regex: /PMS\s*(\d+[A-Z]?)\b/gi, format: 'pantone' },
  { regex: /Pantone\s*(\d+[A-Z]?)\b/gi, format: 'pantone' }
];

// PMS to HEX conversion mapping (common brand colors)
export const PMS_TO_HEX_MAPPING = {
  '376': '#1DB954', // Spotify Green
  '814': '#9146FF', // Twitch Purple
  '656': '#00D4AA', // Twitch Teal
  '186': '#CC0000', // Target Red
  '3005': '#003366', // Common blue
  '485': '#FF0000', // Common red
  '286': '#0033A0', // Common blue
  '355': '#00A651', // Common green
  '200': '#C8102E', // Common red
  '300': '#003DA5', // Common blue
  '347': '#00B04F', // Common green
  '199': '#E4002B', // Common red
  '286': '#003DA5', // Common blue
  '355': '#00A651', // Common green
  '200': '#C8102E', // Common red
  '300': '#003DA5', // Common blue
  '347': '#00B04F', // Common green
  '199': '#E4002B'  // Common red
};

// Typography patterns
export const TYPOGRAPHY_PATTERNS = [
  // Font family patterns (more flexible)
  { regex: /font\s+family:\s*['"]([^'"]+)['"]/gi, type: 'fontFamily' },
  { regex: /typeface:\s*['"]?([A-Za-z0-9\s\-]+)['"]?/gi, type: 'fontFamily' },
  { regex: /font:\s*['"]?([A-Za-z0-9\s\-]+)['"]?/gi, type: 'fontFamily' },
  { regex: /we use\s+([A-Za-z0-9\s\-]+)\s+for/gi, type: 'fontFamily' },
  { regex: /([A-Za-z0-9\s\-]+)\s+is our\s+(?:primary|main|brand|core|key|signature)\s+(?:font|typeface)/gi, type: 'fontFamily' },
  { regex: /([A-Za-z0-9\s\-]+)\s+is used for/gi, type: 'fontFamily' },
  
  // Weight patterns
  { regex: /font-weight:\s*(\d+|normal|bold|light|medium|semibold|heavy|thin|hairline)/gi, type: 'weight' },
  { regex: /weight:\s*(\d+|normal|bold|light|medium|semibold|heavy|thin|hairline)/gi, type: 'weight' },
  { regex: /weights:\s*([^.!?]+)/gi, type: 'weight' },
  { regex: /available weights:\s*([^.!?]+)/gi, type: 'weight' },
  { regex: /(?:light|regular|medium|bold|heavy|thin|hairline|semibold|black|extra-bold|ultra-bold)/gi, type: 'weight' },
  { regex: /(?:100|200|300|400|500|600|700|800|900)/g, type: 'weight' },
  
  // Size patterns
  { regex: /font-size:\s*(\d+(?:\.\d+)?(?:px|em|rem|pt|%)?)/gi, type: 'size' },
  { regex: /size:\s*(\d+(?:\.\d+)?(?:px|em|rem|pt|%)?)/gi, type: 'size' }
];

// Logo rule patterns
export const LOGO_RULE_PATTERNS = [
  // Forbidden actions
  { regex: /(?:do not|never|don't|avoid)\s+(?:distort|alter|modify|change|resize|recolor|outline|rotate|skew|stretch|squash)/gi, type: 'forbidden' },
  { regex: /(?:never|don't|avoid)\s+(?:use|place|put)\s+(?:the\s+)?logo\s+(?:on|in|with)/gi, type: 'forbidden' },
  
  // Spacing requirements
  { regex: /(?:always|must|should)\s+(?:leave|maintain|preserve|keep)\s+(?:clear space|breathing room|white space|minimum space)/gi, type: 'spacing' },
  { regex: /(?:clear space|breathing room|white space)\s+(?:of\s+)?(?:at least\s+)?(\d+(?:\.\d+)?(?:px|em|rem|pt|%)?)/gi, type: 'spacing' },
  { regex: /(?:minimum|smallest)\s+(?:size|clear space|space)\s*(?:of\s*)?(\d+(?:\.\d+)?(?:px|em|rem|pt|%)?)/gi, type: 'minSize' },
  
  // Usage guidelines
  { regex: /(?:use|apply|for)\s+(?:digital|print|web|mobile|desktop)/gi, type: 'usage' },
  { regex: /(?:preferred|recommended)\s+(?:for|in)/gi, type: 'usage' },
  
  // Color requirements
  { regex: /(?:use|apply)\s+(?:only|only use)\s+(?:black|white|color|colors)/gi, type: 'color' },
  { regex: /(?:never|don't|avoid)\s+(?:use|apply)\s+(?:color|colors)/gi, type: 'color' }
];

/**
 * Normalize extracted keys using synonym mapping
 */
export function normalizeKey(key) {
  const lowerKey = key.toLowerCase().trim();
  return BRAND_SYNONYM_MAP[lowerKey] || key;
}

/**
 * Convert PMS code to hex value
 */
export function convertPMSToHex(pmsCode) {
  const cleanCode = pmsCode.replace(/PMS\s*/i, '').trim();
  return PMS_TO_HEX_MAPPING[cleanCode] || `#PMS${cleanCode}`;
}

/**
 * Normalize color value to hex format
 */
export function normalizeColorToHex(colorValue) {
  if (!colorValue) return null;
  
  // If it's already a hex code, return it
  if (colorValue.startsWith('#')) {
    return colorValue.toUpperCase();
  }
  
  // If it's a PMS code, convert it
  if (colorValue.toUpperCase().includes('PMS')) {
    return convertPMSToHex(colorValue);
  }
  
  // If it's RGB, convert to hex
  const rgbMatch = colorValue.match(/RGB\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  }
  
  return colorValue;
}

/**
 * Classify text chunk into section type
 */
export function classifySection(text) {
  const lowerText = text.toLowerCase();
  
  for (const [sectionType, keywords] of Object.entries(SECTION_CLASSIFIERS)) {
    const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matchCount >= 2) { // Require at least 2 keyword matches
      return sectionType;
    }
  }
  
  return 'GENERAL';
}

/**
 * Extract colors with context window
 */
export function extractColorsWithContext(text, contextWindow = 200) {
  const colors = [];
  
  for (const pattern of COLOR_PATTERNS) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      const start = Math.max(0, match.index - contextWindow);
      const end = Math.min(text.length, match.index + match[0].length + contextWindow);
      const context = text.substring(start, end);
      
      // Extract color name from context
      const nameMatch = context.match(/(?:color|hue|shade|tint)\s+(?:is|:)?\s*['"]?([A-Za-z0-9\s\-]+)['"]?/i);
      const colorName = nameMatch ? nameMatch[1].trim() : null;
      
      // Determine color type from context
      let colorType = 'general';
      if (/primary|main|core|brand|key|signature|hero/i.test(context)) {
        colorType = 'primary';
      } else if (/secondary|accent|supporting|complementary/i.test(context)) {
        colorType = 'secondary';
      } else if (/background|bg/i.test(context)) {
        colorType = 'background';
      } else if (/text|body|heading/i.test(context)) {
        colorType = 'text';
      }
      
      colors.push({
        value: match[0],
        format: pattern.format,
        name: colorName,
        type: colorType,
        context: context.trim(),
        hex: normalizeColorToHex(match[0])
      });
    }
  }
  
  return colors;
}

/**
 * Extract typography with context window
 */
export function extractTypographyWithContext(text, contextWindow = 200) {
  const typography = {
    fonts: [],
    weights: [],
    sizes: []
  };
  
  for (const pattern of TYPOGRAPHY_PATTERNS) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      const start = Math.max(0, match.index - contextWindow);
      const end = Math.min(text.length, match.index + match[0].length + contextWindow);
      const context = text.substring(start, end);
      
      if (pattern.type === 'fontFamily') {
        const fontName = match[1].trim();
        if (fontName && !typography.fonts.includes(fontName)) {
          typography.fonts.push(fontName);
        }
      } else if (pattern.type === 'weight') {
        const weight = match[1].trim();
        if (weight && !typography.weights.includes(weight)) {
          typography.weights.push(weight);
        }
      } else if (pattern.type === 'size') {
        const size = match[1].trim();
        if (size && !typography.sizes.includes(size)) {
          typography.sizes.push(size);
        }
      }
    }
  }
  
  return typography;
}

/**
 * Extract logo rules with context window
 */
export function extractLogoRulesWithContext(text, contextWindow = 200) {
  const rules = [];
  
  for (const pattern of LOGO_RULE_PATTERNS) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      const start = Math.max(0, match.index - contextWindow);
      const end = Math.min(text.length, match.index + match[0].length + contextWindow);
      const context = text.substring(start, end);
      
      rules.push({
        type: pattern.type,
        rule: match[0].trim(),
        context: context.trim(),
        value: match[1] || null
      });
    }
  }
  
  return rules;
}
