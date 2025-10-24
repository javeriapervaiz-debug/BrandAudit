// @ts-nocheck
/**
 * Font loading and verification utilities
 * Helps ensure brand fonts are loaded before auditing
 */

/**
 * Check if a font is loaded in the browser
 * @param {string} fontFamily - Font family name (e.g., "Roobert")
 * @param {string} fontWeight - Font weight (e.g., "400", "bold")
 * @param {string} fontStyle - Font style (e.g., "normal", "italic")
 * @returns {boolean} - Whether font is loaded
 */
export function isFontLoaded(fontFamily, fontWeight = "400", fontStyle = "normal") {
  if (typeof document === 'undefined') return false;
  
  try {
    const fontString = `${fontWeight} ${fontStyle} 12px "${fontFamily}"`;
    return document.fonts.check(fontString);
  } catch (e) {
    return false;
  }
}

/**
 * Check if multiple fonts are loaded
 * @param {Array} fonts - Array of font objects with family, weight, style
 * @returns {object} - Font loading status
 */
export function checkFontsLoaded(fonts) {
  const results = {};
  let allLoaded = true;

  fonts.forEach(font => {
    const loaded = isFontLoaded(font.family, font.weight, font.style);
    results[font.family] = {
      loaded,
      weight: font.weight,
      style: font.style
    };
    if (!loaded) allLoaded = false;
  });

  return {
    allLoaded,
    results,
    missingFonts: Object.keys(results).filter(family => !results[family].loaded)
  };
}

/**
 * Wait for fonts to load with timeout
 * @param {Array} fonts - Array of font objects
 * @param {number} timeout - Timeout in milliseconds (default 5000)
 * @returns {Promise<boolean>} - Whether fonts loaded within timeout
 */
export function waitForFonts(fonts, timeout = 5000) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }

    const startTime = Date.now();
    
    const checkFonts = () => {
      const fontStatus = checkFontsLoaded(fonts);
      
      if (fontStatus.allLoaded) {
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        resolve(false);
        return;
      }
      
      setTimeout(checkFonts, 100);
    };
    
    checkFonts();
  });
}

/**
 * Get page root font size
 * @returns {number} - Root font size in pixels
 */
export function getPageRootFontSize() {
  if (typeof document === 'undefined') return 16;
  
  try {
    const html = document.documentElement;
    const computedStyle = window.getComputedStyle(html);
    const fontSize = computedStyle.fontSize;
    return parseFloat(fontSize);
  } catch (e) {
    return 16; // fallback
  }
}

/**
 * Get computed font size for an element
 * @param {Element} element - DOM element
 * @returns {number} - Computed font size in pixels
 */
export function getComputedFontSize(element) {
  if (!element) return null;
  
  try {
    const computedStyle = window.getComputedStyle(element);
    const fontSize = computedStyle.fontSize;
    return parseFloat(fontSize);
  } catch (e) {
    return null;
  }
}

/**
 * Get computed font family for an element
 * @param {Element} element - DOM element
 * @returns {string} - Computed font family
 */
export function getComputedFontFamily(element) {
  if (!element) return null;
  
  try {
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.fontFamily;
  } catch (e) {
    return null;
  }
}

/**
 * Get computed font weight for an element
 * @param {Element} element - DOM element
 * @returns {string} - Computed font weight
 */
export function getComputedFontWeight(element) {
  if (!element) return null;
  
  try {
    const computedStyle = window.getComputedStyle(element);
    return computedStyle.fontWeight;
  } catch (e) {
    return null;
  }
}

/**
 * Check if element is using brand font
 * @param {Element} element - DOM element
 * @param {string} brandFont - Brand font family name
 * @returns {boolean} - Whether element uses brand font
 */
export function isUsingBrandFont(element, brandFont) {
  const fontFamily = getComputedFontFamily(element);
  if (!fontFamily) return false;
  
  return fontFamily.toLowerCase().includes(brandFont.toLowerCase());
}
