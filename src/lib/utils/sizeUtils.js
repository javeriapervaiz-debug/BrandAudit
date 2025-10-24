// @ts-nocheck
/**
 * Size normalization utilities for typography auditing
 * Converts various units (rem, px, pt, em, %) to comparable pixel values
 */

/**
 * Parse size string to pixels with proper unit conversion
 * @param {string} sizeString - Size string like "2.5rem", "36px", "12pt"
 * @param {number} rootFontSize - Root font size in pixels (default 16px)
 * @returns {number|null} - Size in pixels or null if invalid
 */
export function parseSizeToPx(sizeString, rootFontSize = 16) {
  if (!sizeString || typeof sizeString !== 'string') return null;
  const s = sizeString.trim().toLowerCase();

  // Direct px
  const pxMatch = s.match(/^([\d.]+)px$/);
  if (pxMatch) return Number(pxMatch[1]);

  // rem (relative to root font size)
  const remMatch = s.match(/^([\d.]+)rem$/);
  if (remMatch) return Number(remMatch[1]) * rootFontSize;

  // em (relative to parent - assume root for simplicity)
  const emMatch = s.match(/^([\d.]+)em$/);
  if (emMatch) return Number(emMatch[1]) * rootFontSize;

  // points -> 1pt = 1.3333px (96px/72pt)
  const ptMatch = s.match(/^([\d.]+)pt$/);
  if (ptMatch) return Number(ptMatch[1]) * (96/72);

  // percent of root
  const pctMatch = s.match(/^([\d.]+)%$/);
  if (pctMatch) return (Number(pctMatch[1]) / 100) * rootFontSize;

  // fallback: plain number -> assume px
  const numMatch = s.match(/^([\d.]+)$/);
  if (numMatch) return Number(numMatch[1]);

  return null;
}

/**
 * Compare two sizes with tolerance
 * @param {number} expectedPx - Expected size in pixels
 * @param {number} foundPx - Found size in pixels
 * @param {object} opts - Options
 * @param {number} opts.tolerancePct - Tolerance percentage (default 12%)
 * @returns {object} - Comparison result
 */
export function compareSizes(expectedPx, foundPx, opts = { tolerancePct: 12 }) {
  if (expectedPx == null || foundPx == null) {
    return { 
      pass: false, 
      reason: 'missing value',
      expectedPx, 
      foundPx,
      differencePct: null
    };
  }

  const diff = Math.abs(foundPx - expectedPx);
  const differencePct = (diff / expectedPx) * 100;
  const pass = differencePct <= opts.tolerancePct;

  return {
    pass,
    differencePct: Math.round(differencePct * 100) / 100,
    expectedPx: Math.round(expectedPx * 100) / 100,
    foundPx: Math.round(foundPx * 100) / 100,
    diff: Math.round(diff * 100) / 100,
    tolerancePct: opts.tolerancePct
  };
}

/**
 * Check typography ratios for scale-based guidelines
 * @param {number[]} foundSizesPx - Array of found sizes in pixels
 * @param {number[]} expectedRatios - Array of expected ratios
 * @param {number} tolerancePct - Tolerance percentage
 * @returns {object} - Ratio check result
 */
export function checkHeadingRatios(foundSizesPx, expectedRatios, tolerancePct = 12) {
  if (foundSizesPx.length !== expectedRatios.length) {
    return { pass: false, reason: 'array length mismatch' };
  }

  const base = expectedRatios[0];
  const results = [];

  for (let i = 0; i < foundSizesPx.length; i++) {
    const expectedRatio = expectedRatios[i] / base;
    const foundRatio = foundSizesPx[i] / foundSizesPx[0];
    const differencePct = Math.abs(foundRatio - expectedRatio) / expectedRatio * 100;
    
    results.push({
      index: i,
      expectedRatio: Math.round(expectedRatio * 1000) / 1000,
      foundRatio: Math.round(foundRatio * 1000) / 1000,
      differencePct: Math.round(differencePct * 100) / 100,
      pass: differencePct <= tolerancePct
    });

    if (differencePct > tolerancePct) {
      return { 
        pass: false, 
        index: i, 
        differencePct: Math.round(differencePct * 100) / 100,
        expectedRatio: Math.round(expectedRatio * 1000) / 1000,
        foundRatio: Math.round(foundRatio * 1000) / 1000,
        results
      };
    }
  }

  return { pass: true, results };
}

/**
 * Normalize guideline sizes to pixels using page root
 * @param {object} guideline - Brand guideline object
 * @param {number} pageRootFontSize - Page's root font size
 * @returns {object} - Normalized guideline
 */
export function normalizeGuidelineSizes(guideline, pageRootFontSize = 16) {
  if (!guideline.typography) return guideline;

  const normalized = { ...guideline };
  
  if (normalized.typography.fonts) {
    normalized.typography.fonts = normalized.typography.fonts.map(font => {
      if (font.size) {
        const normalizedSize = parseSizeToPx(font.size, pageRootFontSize);
        return {
          ...font,
          sizePx: normalizedSize,
          originalSize: font.size
        };
      }
      return font;
    });
  }

  return normalized;
}

/**
 * Generate human-readable size comparison report
 * @param {object} comparison - Result from compareSizes
 * @param {string} element - Element name (e.g., "h1")
 * @param {string} originalExpected - Original expected value (e.g., "2.5rem")
 * @returns {object} - Human-readable report
 */
export function generateSizeReport(comparison, element, originalExpected) {
  const { pass, differencePct, expectedPx, foundPx, tolerancePct } = comparison;

  return {
    element,
    pass,
    severity: differencePct > 20 ? 'high' : differencePct > 10 ? 'medium' : 'low',
    message: pass 
      ? `${element} font size is within tolerance (±${tolerancePct}%)`
      : `${element} has incorrect font size`,
    details: {
      expected: `${originalExpected} (${expectedPx}px)`,
      found: `${foundPx}px`,
      difference: `${differencePct}%`,
      tolerance: `±${tolerancePct}%`
    },
    recommendation: pass 
      ? 'Font size is acceptable'
      : `Update ${element} font size to ${originalExpected} (currently ${foundPx}px, expected ${expectedPx}px)`
  };
}
