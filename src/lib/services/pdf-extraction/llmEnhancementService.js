// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

/**
 * LLM Enhancement Service for Brand Guideline Extraction
 * Acts as a semantic enhancer and validator for rule-based parsing
 */
export class LLMEnhancementService {
  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!this.apiKey) {
      throw new Error('Google AI API key not found');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.2, // Low temperature for consistent results
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4000
      }
    });
  }

  /**
   * Enhance extracted brand guidelines with multi-pass semantic understanding
   * @param {string} rawText - Original PDF text
   * @param {Object} parsedData - Rule-based extraction results
   * @param {string} brandName - Brand name for context
   */
  async enhanceExtraction(rawText, parsedData, brandName = 'Unknown') {
    console.log('🧠 LLM Enhancement Service - Starting multi-pass semantic enhancement...');
    
    // Validate input parameters
    if (!parsedData) {
      console.warn('⚠️ No parsed data provided, skipping LLM enhancement');
      return null;
    }
    
    try {
      // Pass 1: Structure classification
      console.log('📋 Pass 1: Structure classification...');
      const structureOutline = await this.classifyStructure(rawText, brandName);
      
      // Check if structure classification was successful
      if (!structureOutline || !structureOutline.sections || structureOutline.sections.length === 0) {
        console.warn('⚠️ Structure classification failed or returned empty sections, using fallback');
        return parsedData;
      }
      
      // Pass 2: Detailed extraction with structure context
      console.log('📝 Pass 2: Detailed extraction...');
      const enhancedData = await this.extractWithStructure(rawText, parsedData, brandName, structureOutline);
      
      // Validate and clean the enhanced data
      const validatedData = this.validateEnhancedData(enhancedData, parsedData);
      
      // Post-process validation and auto-fix (brand-aware, with fallbacks)
      const finalData = this.postProcessValidation(validatedData, parsedData, brandName);
      
      console.log('✅ Multi-pass LLM enhancement completed successfully');
      return finalData;
      
    } catch (error) {
      console.error('❌ LLM enhancement failed:', error.message);
      console.log('🔄 Falling back to original parsed data...');
      return parsedData;
    }
  }

  /**
   * Pass 1: Classify structure and create outline
   * @param {string} rawText - Original text
   * @param {string} brandName - Brand name
   */
  async classifyStructure(rawText, brandName) {
    const structurePrompt = `
You are analyzing brand guideline text that may have lost structure during PDF conversion.

Your task is to identify the main sections and classify them. Look for:
- Typography sections (fonts, weights, usage)
- Color sections (hex codes, color names, palettes)
- Logo sections (rules, clearspace, usage)
- Brand voice sections (tone, personality, voice)
- Imagery sections (photography, visual style)

For each section you find, provide:
1. Section name
2. Category classification
3. Brief summary
4. Key elements found

Output format:
{
  "sections": [
    {
      "name": "Brand Typography",
      "category": "Typography", 
      "summary": "Contains font families Omnes, Montserrat, Neighbor with weights and usage",
      "keyElements": ["Omnes", "Montserrat", "Neighbor", "Regular", "Bold", "Medium"]
    }
  ]
}

Be conservative - only identify clear sections. If content is mixed, note it in the summary.

Text to analyze:
${rawText.substring(0, 2000)}...
`;

    let response = '';
    
    try {
      const result = await this.model.generateContent(structurePrompt);
      
      if (!result?.response) {
        throw new Error('No response from LLM');
      }
      
      if (typeof result.response.text !== 'function') {
        throw new Error('Invalid response format from LLM');
      }
      
      response = result.response.text();
      
      if (typeof response !== 'string') {
        throw new Error('LLM response is not a string');
      }
      
      // Clean up markdown formatting if present
      let cleanResponse = response;
      if (response.includes('```json')) {
        cleanResponse = response.replace(/```json\s*/, '').replace(/\s*```\s*$/, '');
      } else if (response.includes('```')) {
        cleanResponse = response.replace(/```\s*/, '').replace(/\s*```\s*$/, '');
      }
      
      cleanResponse = cleanResponse.trim();
      
      // Try to extract JSON from the response
      let jsonToParse = cleanResponse;
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonToParse = jsonMatch[0];
      }
      
      // Try to parse JSON response
      const parsed = JSON.parse(jsonToParse);
      
      // Validate the structure
      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        console.warn('⚠️ Invalid structure classification response format');
        return { sections: [] };
      }
      
      return parsed;
    } catch (error) {
      console.warn('⚠️ Structure classification failed:', error.message);
      console.warn('📄 Raw response:', response ? response.substring(0, 200) : 'No response received');
      return { sections: [] };
    }
  }

  /**
   * Pass 2: Extract with structure context
   * @param {string} rawText - Original text
   * @param {Object} parsedData - Rule-based results
   * @param {string} brandName - Brand name
   * @param {Object} structureOutline - Structure from Pass 1
   */
  async extractWithStructure(rawText, parsedData, brandName, structureOutline) {
    const extractionPrompt = this.buildEnhancedExtractionPrompt(brandName, structureOutline, parsedData);
    const input = this.formatInput(rawText, parsedData);
    
    console.log('📝 LLM prompt length:', extractionPrompt.length);
    console.log('📝 LLM input length:', input.length);
    
    // Use format-enforcing prompt with retry logic
    const result = await this.generateWithRetry([extractionPrompt, input]);
    
    console.log('📄 LLM response length:', result ? result.length : 'undefined');
    console.log('📄 LLM response preview:', result && typeof result === 'string' ? result.substring(0, 200) : 'undefined');
    
    // If result is already parsed JSON, return it directly
    if (typeof result === 'object' && result !== null) {
      return result;
    }
    
    // Otherwise, parse the string response
    return this.parseLLMResponse(result);
  }

  /**
   * Generate content with retry logic for JSON parsing failures
   */
  async generateWithRetry(prompt, maxRetries = 2) {
    // Handle array of prompts by concatenating them
    let fullPrompt = Array.isArray(prompt) ? prompt.join('\n\n') : prompt;
    
    // Truncate if too long for safety
    if (fullPrompt.length > 28000) {
      console.warn("⚠️ Prompt too long, truncating for safety...");
      fullPrompt = fullPrompt.slice(0, 28000);
    }
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Use correct Google AI format
        const result = await this.model.generateContent(fullPrompt);
        
        // Safe response extraction
        if (!result?.response || typeof result.response.text !== 'function') {
          throw new Error('Empty response from LLM');
        }
        
        const response = result.response.text();
        
        // Check if response is empty
        if (!response || response.trim().length === 0) {
          throw new Error('Empty response from LLM');
        }
        
        // Try to parse as JSON to validate format (with markdown cleanup)
        let cleanResponse = response;
        
        // Clean up markdown code blocks more thoroughly
        if (response.includes('```json')) {
          // Remove ```json at the start and ``` at the end
          cleanResponse = response.replace(/```json\s*/, '').replace(/\s*```\s*$/, '');
        } else if (response.includes('```')) {
          // Remove any ``` code blocks
          cleanResponse = response.replace(/```\s*/, '').replace(/\s*```\s*$/, '');
        }
        
        // Additional cleanup for common LLM formatting issues
        cleanResponse = cleanResponse.trim();
        
        // Try to extract JSON from the response
        let jsonToParse = cleanResponse;
        
        // Look for JSON object in the response
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonToParse = jsonMatch[0];
        }
        
        // Try to parse the JSON
        try {
          const parsed = JSON.parse(jsonToParse);
          return parsed;
        } catch (parseError) {
          console.log('📊 JSON parsing failed, attempting to fix malformed JSON...');
          console.log('📊 Parse error:', parseError.message);
          console.log('📊 JSON preview:', jsonToParse && typeof jsonToParse === 'string' ? jsonToParse.substring(0, 200) : 'No JSON to preview');
          
          // Try to fix common JSON issues
          let fixedJson = jsonToParse;
          
          // Fix trailing commas
          fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');
          
          // Fix missing commas between array elements
          fixedJson = fixedJson.replace(/"\s*\n\s*"/g, '",\n"');
          
          // Fix missing commas between object properties
          fixedJson = fixedJson.replace(/"\s*\n\s*"/g, '",\n"');
          
          // Try to find the first complete JSON object
          const lines = cleanResponse.split('\n');
          let jsonStart = -1;
          let jsonEnd = -1;
          let braceCount = 0;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('{') && jsonStart === -1) {
              jsonStart = i;
            }
            if (jsonStart !== -1) {
              braceCount += (line.match(/\{/g) || []).length;
              braceCount -= (line.match(/\}/g) || []).length;
              if (braceCount === 0 && jsonStart !== -1) {
                jsonEnd = i;
                break;
              }
            }
          }
          
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonLines = lines.slice(jsonStart, jsonEnd + 1);
            jsonToParse = jsonLines.join('\n');
            try {
              return JSON.parse(jsonToParse);
            } catch (finalError) {
              console.log('📊 Final JSON parsing failed, using fallback structure');
              return {
                brandName: "Unknown Brand",
                colors: [],
                typography: [],
                logo: { rules: [] },
                spacing: {},
                tone: { style: "Not specified" },
                imagery: { style: "Not specified" }
              };
            }
          } else {
            console.log('📊 No valid JSON found, using fallback structure');
            return {
              brandName: "Unknown Brand", 
              colors: [],
              typography: [],
              logo: { rules: [] },
              spacing: {},
              tone: { style: "Not specified" },
              imagery: { style: "Not specified" }
            };
          }
        }
        
        return cleanResponse;
      } catch (error) {
        console.warn(`⚠️ LLM attempt ${attempt + 1} failed:`, error.message);
        console.warn(`📊 Error details:`, {
          errorType: error.constructor.name,
          errorMessage: error.message,
          promptLength: Array.isArray(prompt) ? prompt[0]?.length || 0 : prompt.length,
          inputLength: Array.isArray(prompt) ? prompt[1]?.length || 0 : 0,
          totalLength: fullPrompt.length
        });
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Retry with format enforcement prompt
        const prev = typeof cleanResponse === 'string' && cleanResponse.trim().length > 0 ? cleanResponse : '';
        const formatEnforcementPrompt = `
Return ONLY valid JSON. Fix any JSON errors if present.
If previous content is malformed, correct it to match this schema exactly.
Schema:
{
  "brandName": "string",
  "colors": [{ "name": "string", "hex": "#RRGGBB", "usage": "string", "context": "string", "constraints": "string" }],
  "typography": [{ "font": "string", "weights": ["Regular"], "usage": "string" }],
  "logo": { "rules": ["string"], "constraints": ["string"], "sizing": { "minPrintSize": "string", "minDigitalSize": "string", "clearspace": "string" } },
  "spacing": { "margins": "string", "padding": "string", "lineHeight": "string" },
  "imagery": { "style": "string", "tone": "string", "constraints": "string" },
  "avoid": ["string"],
  "confidence": { "overall": 0.5 }
}

Previous content (may be invalid JSON):
${prev}
`;
        
        // Reconstruct the full prompt for retry
        fullPrompt = formatEnforcementPrompt;
        
        // Add delay between retries (Gemini rate limits easily)
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  /**
   * Build enhanced extraction prompt with structure context
   * @param {string} brandName
   * @param {Object} structureOutline
   */
  buildEnhancedExtractionPrompt(brandName, structureOutline, parsedData) {
    return `
You are analyzing brand guideline text with the following structure context:
${JSON.stringify(structureOutline, null, 2)}

CRITICAL SEPARATION RULES:
- If a phrase mentions "HEX", "RGB", or "CMYK", treat it as COLOR
- If it mentions "Bold", "Light", "Italic", or "weights", treat it as TYPOGRAPHY  
- If both appear in same paragraph, split the paragraph into two logical parts
- Never include color codes in typography objects
- Never include font weights in color palettes

EXAMPLE OF PROPER SEPARATION:
Input: "HEX #ED5623 Switcher Orange Regular, Medium, Semibold"
Correct Output:
- Colors: ["#ED5623"] with name "Switcher Orange"
- Typography: ["Regular", "Medium", "Semibold"] as weights

Extract structured brand information into JSON, ensuring:
- Typography and colors are properly separated
- Font families (e.g., Omnes, Montserrat, Neighbor) are captured correctly
- Font weights and styles are assigned to typography, not colors
- Color hex codes are properly formatted
- Convert PMS/Pantone codes to hex values (e.g., PMS 186 → #CC0000)
- If you see "Target Red" or similar color names, look for associated PMS codes and convert them

FONT VALIDATION:
We detected these font candidates in the document: ${parsedData?.typography?.fonts?.join(', ') || 'None detected'}
Please validate that these are actual font families in the guideline, add missing weights and specify usage (primary/secondary/display/body).
Only include fonts that are clearly mentioned in the text. Do not hallucinate font names.

TYPOGRAPHY EXTRACTION RULES:
- Look for font names like "Helvetica", "Arial", "Times New Roman", "Futura", etc.
- Look for font weights like "Regular", "Bold", "Light", "Medium", "Semibold", "Heavy"
- Look for font sizes like "12pt", "14px", "16px", "18pt", etc.
- If you see "Target" or "Expect More. Pay Less." these might be custom fonts
- If no specific fonts are mentioned, look for general typography guidelines
- Always include at least one typography entry, even if it's generic

Output format:
{
  "brandName": "${brandName}",
  "logo": {
    "rules": ["Use red logo on black background", "Minimum clear space = width of letter T"],
    "clearspace": "width of letter T",
    "background": "black"
  },
  "typography": [
    {
      "font": "Omnes",
      "weights": ["Regular", "Medium", "Semibold"],
      "usage": "Primary headings"
    },
    {
      "font": "Montserrat", 
      "weights": ["Light", "Regular", "Medium"],
      "usage": "Body copy"
    }
  ],
  "colors": [
    {
      "name": "Switcher Orange",
      "hex": "#ED5623",
      "usage": "Primary"
    }
  ],
  "imagery": ["Candid", "Upbeat", "User-focused"],
  "voice": ["Direct", "Confident", "Encouraging"]
}

CRITICAL: Do not mix typography and colors. If "Bold" appears near hex codes, assign "Bold" to typography weights, not color names.
`;
  }

  /**
   * Post-process validation and auto-fix
   * @param {Object} data - Enhanced data
   */
  postProcessValidation(data, parsedData, brandName) {
    // Brand-aware color name aliases
    const BRAND_COLOR_ALIASES = {
      Target: { '#CC0000': 'Target Red' }
      // Add more brands/colors here as needed
    };

    function normalizeColorName(name, hex, brandKey) {
      const trimmedName = (name || '').trim();
      const isGeneric = /^colou?r$/i.test(trimmedName) || trimmedName.length === 0;
      if (brandKey && BRAND_COLOR_ALIASES[brandKey]?.[hex]) {
        return BRAND_COLOR_ALIASES[brandKey][hex];
      }
      if (isGeneric) {
        return hex || 'Unnamed';
      }
      return trimmedName;
    }
    // Auto-fix misplaced content
    if (data.colors) {
      const misplacedTypography = [];
      data.colors = data.colors.filter(color => {
        if (/bold|light|italic|regular|medium|semibold|heavy/i.test(color.name)) {
          misplacedTypography.push({
            font: "Unknown (misplaced)",
            weights: [color.name],
            usage: "Auto-corrected from colors"
          });
          return false;
        }
        return true;
      });
      
      if (misplacedTypography.length > 0) {
        if (!data.typography) data.typography = [];
        data.typography.push(...misplacedTypography);
      }
      
      // Convert PMS codes to hex values
      data.colors = data.colors.map(color => {
        if (color.hex && color.hex.includes('PMS')) {
          const pmsCode = color.hex.replace('#PMS', '').trim();
          const hexValue = this.convertPMSToHex(pmsCode);
          return { ...color, hex: hexValue };
        }
        return color;
      });
      
      // Normalize color names (avoid generic "Color" and map brand aliases)
      data.colors = data.colors.map(c => ({
        ...c,
        name: normalizeColorName(c.name, c.hex, brandName || data.brandName || parsedData?.brandName)
      }));

      // Deduplicate colors by hex value
      const seenHexes = new Set();
      data.colors = data.colors.filter(color => {
        if (seenHexes.has(color.hex)) {
          return false;
        }
        seenHexes.add(color.hex);
        return true;
      });
    }
    
    // Deduplicate typography by font name
    if (data.typography && Array.isArray(data.typography)) {
      const seenFonts = new Set();
      data.typography = data.typography.filter(font => {
        if (seenFonts.has(font.font)) {
          return false;
        }
        seenFonts.add(font.font);
        return true;
      });
    }

    // Typography fallback: seed from detected/parsed fonts if empty
    const seedFonts = Array.isArray(parsedData?.typography?.fonts) && parsedData.typography.fonts.length
      ? parsedData.typography.fonts
      : [];
    const seedWeights = Array.isArray(parsedData?.typography?.weights) && parsedData.typography.weights.length
      ? parsedData.typography.weights
      : ['Regular', 'Bold'];

    if (!Array.isArray(data.typography) || data.typography.length === 0) {
      const defaultFonts = seedFonts.length ? seedFonts : ['Helvetica', 'Arial'];
      const uniqueFonts = [...new Set(defaultFonts)]
        .filter(f => typeof f === 'string' && f.trim().length > 0);
      data.typography = uniqueFonts.map((font, idx) => ({
        font,
        weights: seedWeights,
        usage: idx === 0 ? 'primary' : 'secondary'
      }));
    }
    
    return data;
  }
  
  /**
   * Convert PMS code to hex value
   */
  convertPMSToHex(pmsCode) {
    const pmsMapping = {
      '186': '#CC0000', // Target Red
      '376': '#1DB954', // Spotify Green
      '814': '#9146FF', // Twitch Purple
      '656': '#00D4AA', // Twitch Teal
      '3005': '#003366', // Common blue
      '485': '#FF0000', // Common red
      '286': '#0033A0', // Common blue
      '355': '#00A651', // Common green
      '200': '#C8102E', // Common red
      '300': '#003DA5', // Common blue
      '347': '#00B04F', // Common green
      '199': '#E4002B'  // Common red
    };
    
    return pmsMapping[pmsCode] || `#PMS${pmsCode}`;
  }

  /**
   * Build the enhancement prompt for the LLM
   * @param {string} brandName
   */
  buildEnhancementPrompt(brandName) {
    return `
You are a brand guideline extraction assistant specializing in semantic understanding and context resolution.

TASK: Enhance and validate brand guideline data extracted from PDF text.

INPUT FORMAT:
1. Raw brand guideline text (from PDF conversion)
2. Preliminary extracted JSON (may be incomplete, incorrect, or missing context)

YOUR ROLE:
- **Refinement**: Fix errors, complete missing data, correct format issues
- **Context Resolution**: Determine WHERE each rule applies (logo, buttons, text, background, etc.)
- **Entity Expansion**: Extract related but missed items (font weights, color variations, usage rules)
- **Validation**: Identify contradictions and ensure logical consistency
- **Semantic Understanding**: Add meaning and relationships between brand rules

CRITICAL EXTRACTION REQUIREMENTS:
1. **FONT DETECTION**: Look for specific font names like "Roobert", "Helvetica", "Arial" - NOT generic terms like "Sans Serif"
2. **TONE/VOICE**: Extract brand voice information like "Twitch Voice", "Brand Voice", "Tone of Voice"
3. **COLOR CODES**: Extract hex codes (#RRGGBB), RGB values, PMS codes with proper formatting
4. **LOGO RULES**: Extract specific logo usage rules, spacing requirements, forbidden practices

OUTPUT FORMAT (return ONLY valid JSON):
{
  "brandName": "${brandName}",
  "colors": [
    {
      "name": "Primary Red",
      "hex": "#E50914",
      "context": "logo, buttons, primary elements",
      "usage": "main brand color for logos and call-to-action buttons",
      "constraints": "avoid using for text, use on dark backgrounds"
    }
  ],
  "typography": [
    {
      "font": "Netflix Sans",
      "weights": ["Bold", "Regular", "Light"],
      "usage": "headings and body text",
      "context": "all text elements",
      "constraints": "never use serif fonts, maintain consistent hierarchy"
    }
  ],
  "logo": {
    "rules": [
      "Use red logo on black background",
      "Minimum clear space = width of letter T",
      "Never rotate or distort the logo"
    ],
    "constraints": [
      "Avoid using white logo except for video watermark",
      "Do not use on busy backgrounds",
      "Do not add shadows or gradients"
    ],
    "sizing": {
      "minPrintSize": "0.5 inches",
      "minDigitalSize": "24px",
      "clearspace": "width of letter T"
    }
  },
  "spacing": {
    "margins": "consistent spacing between elements",
    "padding": "adequate white space around content",
    "lineHeight": "1.4 for body text, 1.2 for headings"
  },
  "imagery": {
    "style": "cinematic, high-quality, professional",
    "tone": "dramatic, engaging, premium",
    "constraints": "avoid stock photos, use original content"
  },
  "voice": {
    "name": "Twitch Voice",
    "style": "mischievous, purposeful, iterative, revolutionary",
    "tone": "casual, neutral, firm, emotional, encouraging, celebratory",
    "descriptors": ["fun", "supportive", "authentic", "community-focused"],
    "examples": ["You're already one of us", "Let's make moments together"],
    "constraints": "avoid corporate speak, maintain gaming community voice"
  },
  "avoid": [
    "Do not rotate logo",
    "Do not use on busy backgrounds", 
    "Do not alter shadows or gradients",
    "Do not use unauthorized colors"
  ],
  "confidence": {
    "overall": 0.85,
    "colors": 0.9,
    "typography": 0.8,
    "logo": 0.85
  }
}

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no explanations or markdown
2. Ensure all hex colors are properly formatted (#RRGGBB)
3. Include context and usage information for each element
4. Add confidence scores (0-1) for each category
5. Preserve all original data while enhancing and correcting it
6. Focus on semantic understanding and practical usage rules
`;
  }

  /**
   * Format input for the LLM
   * @param {string} rawText
   * @param {Object} parsedData
   */
  formatInput(rawText, parsedData) {
    // Smart summarization to prioritize important sections while staying within token limits
    const maxTextLength = 3000; // Reduced for better LLM performance
    let processedText = rawText;
    
    if (rawText.length > maxTextLength) {
      console.log('📝 Text too long, applying smart summarization...');
      
      // Look for important sections to prioritize
      const importantSections = [
        'COLOR', 'COLORS', 'PALETTE',
        'TYPOGRAPHY', 'FONTS', 'FONT', 'ROOBERT',
        'LOGO', 'LOGO USAGE', 'LOGO RULES',
        'SPACING', 'CLEARSPACE',
        'VOICE', 'TONE', 'TWITCH VOICE', 'BRAND VOICE'
      ];
      
      // Extract key sections with context
      const extractedSections = [];
      
      for (const section of importantSections) {
        const regex = new RegExp(`(${section}[\\s\\S]{0,500})`, 'gi');
        const matches = rawText.match(regex);
        if (matches) {
          extractedSections.push(...matches);
        }
      }
      
      // Also look for specific patterns we know are important
      const specificPatterns = [
        /Roobert[\\s\\S]{0,200}/gi,
        /Twitch Voice[\\s\\S]{0,300}/gi,
        /#[0-9A-Fa-f]{6}[\\s\\S]{0,100}/gi,
        /RGB[\\s\\S]{0,200}/gi,
        /PMS[\\s\\S]{0,200}/gi
      ];
      
      for (const pattern of specificPatterns) {
        const matches = rawText.match(pattern);
        if (matches) {
          extractedSections.push(...matches);
        }
      }
      
      // Combine and deduplicate sections
      const uniqueSections = [...new Set(extractedSections)];
      
      if (uniqueSections.length > 0) {
        // Join sections and truncate if still too long
        let combinedText = uniqueSections.join('\n\n');
        if (combinedText.length > maxTextLength) {
          combinedText = combinedText.substring(0, maxTextLength) + '\n\n[... additional content truncated ...]';
        }
        processedText = combinedText;
      } else {
        // Fallback to smart truncation
        processedText = rawText.substring(0, maxTextLength) + '\n\n[... text truncated for token limits ...]';
      }
    }
    
    return `
RAW BRAND GUIDELINE TEXT (SUMMARIZED):
${processedText}

PRELIMINARY EXTRACTED DATA:
${parsedData ? JSON.stringify(parsedData, null, 2) : 'No preliminary data available'}

Please enhance this data with semantic understanding, context resolution, and missing information.
Focus on extracting:
- Specific font names (like "Roobert" not generic "Sans Serif")
- Brand voice/tone information (like "Twitch Voice")
- Color codes and names
- Logo rules and spacing requirements
`;
  }

  /**
   * Parse LLM response and extract JSON
   * @param {string} response
   */
  parseLLMResponse(response) {
    try {
      // Handle non-string responses
      if (typeof response !== 'string') {
        console.warn('⚠️ parseLLMResponse received non-string response:', typeof response);
        return response; // Return as-is if it's already an object
      }
      
      // Clean up markdown formatting if present
      let cleanResponse = response;
      if (response.includes('```json')) {
        cleanResponse = response.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (response.includes('```')) {
        cleanResponse = response.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Try to extract JSON from the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      
      // If no JSON found, try parsing the entire response
      return JSON.parse(cleanResponse);
      
    } catch (error) {
      console.error('❌ Failed to parse LLM response as JSON:', error.message);
      console.log('📄 Raw response:', response ? response.substring(0, 500) : 'No response received');
      throw new Error('Invalid JSON response from LLM');
    }
  }

  /**
   * Validate and clean enhanced data
   * @param {Object} enhancedData
   * @param {Object} originalData
   */
  validateEnhancedData(enhancedData, originalData) {
    console.log('🔍 Validating enhanced data...');
    
    // Ensure required fields exist
    if (!enhancedData.brand) enhancedData.brand = originalData.companyName || 'Unknown';
    if (!enhancedData.colors) enhancedData.colors = [];
    if (!enhancedData.typography) enhancedData.typography = [];
    if (!enhancedData.logo) enhancedData.logo = { rules: [], constraints: [] };
    if (!enhancedData.avoid) enhancedData.avoid = [];
    if (!enhancedData.confidence) enhancedData.confidence = { overall: 0.5 };

    // Ensure metadata structure is compatible with existing LLM enhancer
    if (!enhancedData.metadata) {
      enhancedData.metadata = {
        extractionMethod: 'llm-enhanced',
        confidence: enhancedData.confidence?.overall || 0.5,
        textLength: originalData.metadata?.textLength || 0,
        timestamp: new Date().toISOString()
      };
    } else {
      // Update existing metadata
      enhancedData.metadata.extractionMethod = 'llm-enhanced';
      enhancedData.metadata.confidence = enhancedData.confidence?.overall || enhancedData.metadata.confidence || 0.5;
    }

    // Validate colors - handle both array and object formats
    if (Array.isArray(enhancedData.colors)) {
      enhancedData.colors = enhancedData.colors.map(color => ({
        name: color.name || 'Unnamed Color',
        hex: this.normalizeHexColor(color.hex),
        context: color.context || 'general',
        usage: color.usage || 'general use',
        constraints: color.constraints || ''
      }));
    } else if (enhancedData.colors && typeof enhancedData.colors === 'object') {
      // Convert object format to array format
      const colorArray = [];
      if (enhancedData.colors.palette && Array.isArray(enhancedData.colors.palette)) {
        colorArray.push(...enhancedData.colors.palette.map(hex => ({
          name: 'Color',
          hex: this.normalizeHexColor(hex),
          context: 'general',
          usage: 'general use',
          constraints: ''
        })));
      }
      if (enhancedData.colors.primary) {
        colorArray.push({
          name: 'Primary',
          hex: this.normalizeHexColor(enhancedData.colors.primary),
          context: 'primary',
          usage: 'primary',
          constraints: ''
        });
      }
      if (enhancedData.colors.secondary) {
        const secondaryColors = Array.isArray(enhancedData.colors.secondary) ? 
          enhancedData.colors.secondary : [enhancedData.colors.secondary];
        colorArray.push(...secondaryColors.map(hex => ({
          name: 'Secondary',
          hex: this.normalizeHexColor(hex),
          context: 'secondary',
          usage: 'secondary',
          constraints: ''
        })));
      }
      enhancedData.colors = colorArray;
    } else {
      enhancedData.colors = [];
    }

    // Validate typography - handle both array and object formats
    if (Array.isArray(enhancedData.typography)) {
      enhancedData.typography = enhancedData.typography.map(typography => ({
        font: typography.font || 'Unknown Font',
        weights: Array.isArray(typography.weights) ? typography.weights : [typography.weights || 'Regular'],
        usage: typography.usage || 'general text',
        context: typography.context || 'all text',
        constraints: typography.constraints || ''
      }));
    } else if (enhancedData.typography && typeof enhancedData.typography === 'object') {
      // Convert object format to array format
      const typographyArray = [];
      if (enhancedData.typography.fonts && Array.isArray(enhancedData.typography.fonts)) {
        typographyArray.push(...enhancedData.typography.fonts.map(font => ({
          font: font,
          weights: enhancedData.typography.weights || ['Regular'],
          usage: 'general text',
          context: 'all text',
          constraints: ''
        })));
      }
      if (enhancedData.typography.primaryFont) {
        typographyArray.push({
          font: enhancedData.typography.primaryFont,
          weights: enhancedData.typography.weights || ['Regular'],
          usage: 'primary',
          context: 'headings',
          constraints: ''
        });
      }
      if (enhancedData.typography.secondaryFont) {
        typographyArray.push({
          font: enhancedData.typography.secondaryFont,
          weights: enhancedData.typography.weights || ['Regular'],
          usage: 'secondary',
          context: 'body text',
          constraints: ''
        });
      }
      enhancedData.typography = typographyArray;
    } else {
      enhancedData.typography = [];
    }

    // Ensure logo rules are arrays
    if (!Array.isArray(enhancedData.logo.rules)) {
      enhancedData.logo.rules = [];
    }
    if (!Array.isArray(enhancedData.logo.constraints)) {
      enhancedData.logo.constraints = [];
    }

    // Validate confidence scores
    Object.keys(enhancedData.confidence).forEach(key => {
      if (enhancedData.confidence[key] < 0) enhancedData.confidence[key] = 0;
      if (enhancedData.confidence[key] > 1) enhancedData.confidence[key] = 1;
    });

    console.log('✅ Enhanced data validation completed');
    return enhancedData;
  }

  /**
   * Normalize hex color format
   * @param {string} hex
   */
  normalizeHexColor(hex) {
    if (!hex) return '#000000';
    
    // Remove any whitespace
    hex = hex.trim();
    
    // Add # if missing
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    
    // Ensure uppercase
    hex = hex.toUpperCase();
    
    // Validate hex format
    if (!/^#[0-9A-F]{6}$/.test(hex)) {
      console.warn(`⚠️ Invalid hex color: ${hex}, using fallback`);
      return '#000000';
    }
    
    return hex;
  }

  /**
   * Calculate enhancement metrics
   * @param {Object} originalData
   * @param {Object} enhancedData
   */
  calculateEnhancementMetrics(originalData, enhancedData) {
    const metrics = {
      colorsAdded: enhancedData.colors.length - (originalData.colors?.palette?.length || 0),
      typographyEnhanced: enhancedData.typography.length - (originalData.typography?.fonts?.length || 0),
      logoRulesAdded: enhancedData.logo.rules.length + enhancedData.logo.constraints.length,
      overallConfidence: enhancedData.confidence?.overall || 0.5,
      improvements: []
    };

    // Track specific improvements
    if (enhancedData.colors.length > (originalData.colors?.palette?.length || 0)) {
      metrics.improvements.push('Enhanced color extraction');
    }
    if (enhancedData.typography.length > 0) {
      metrics.improvements.push('Added typography details');
    }
    if (enhancedData.logo.rules.length > 0) {
      metrics.improvements.push('Extracted logo rules');
    }

    return metrics;
  }
}
