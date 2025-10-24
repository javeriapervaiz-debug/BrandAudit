// Font detection with whitelist and smart heuristics
export const FONT_WHITELIST = [
  // Google Fonts (most common)
  "Roboto", "Open Sans", "Montserrat", "Lato", "Inter", "Poppins", "Nunito", 
  "Merriweather", "Source Sans Pro", "Playfair Display", "Raleway", "Ubuntu",
  "Oswald", "PT Sans", "PT Serif", "Droid Sans", "Droid Serif", "Crimson Text",
  
  // System fonts
  "Helvetica", "Arial", "Georgia", "Times New Roman", "Verdana", "Tahoma", 
  "Calibri", "Segoe UI", "Trebuchet MS", "Comic Sans MS", "Impact",
  
  // Popular display fonts
  "Gotham", "Futura", "Proxima Nova", "Circular", "Roobert", "Neue Helvetica",
  "Avenir", "Univers", "Akzidenz Grotesk", "Trade Gothic", "Franklin Gothic",
  
  // Brand-specific fonts (from Switcher example)
  "Omnes", "Neighbor", "Greatest Richmond",
  
  // Additional common fonts
  "Baskerville", "Garamond", "Palatino", "Book Antiqua", "Century Gothic",
  "Lucida Console", "Courier New", "Monaco", "Consolas", "Menlo"
];

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({length: m+1}, (_,i) => Array(n+1).fill(0));
  for (let i=0;i<=m;i++) d[i][0]=i;
  for (let j=0;j<=n;j++) d[0][j]=j;
  for (let i=1;i<=m;i++){
    for (let j=1;j<=n;j++){
      const cost = a[i-1].toLowerCase() === b[j-1].toLowerCase() ? 0 : 1;
      d[i][j] = Math.min(
        d[i-1][j] + 1,
        d[i][j-1] + 1,
        d[i-1][j-1] + cost
      );
    }
  }
  return d[m][n];
}

/**
 * Normalize token by removing special characters
 */
function normalizeToken(tok) {
  return tok.replace(/[^A-Za-z0-9\s\-]/g, '').trim();
}

/**
 * Check if token is likely a font name
 */
function isLikelyFontToken(tok) {
  if (!tok) return false;
  if (tok.length < 3) return false;
  // avoid pure digits or typical stopwords
  if (/^\d+$/.test(tok)) return false;
  const lower = tok.toLowerCase();
  const stopwords = [
    'the','and','font','family','sample','brand','primary','secondary',
    'typeface','type','this','that','with','from','for','are','is','was',
    'will','can','should','must','may','might','could','would','have',
    'has','had','been','being','be','do','does','did','done','get','got',
    'make','made','take','took','come','came','go','went','see','saw',
    'know','knew','think','thought','say','said','tell','told','give','gave',
    'find','found','look','looked','use','used','work','worked','call','called',
    'try','tried','ask','asked','need','needed','feel','felt','become','became',
    'leave','left','put','put','mean','meant','keep','kept','let','let',
    'begin','began','seem','seemed','help','helped','show','showed','hear',
    'heard','play','played','run','ran','move','moved','live','lived','believe',
    'believed','hold','held','bring','brought','happen','happened','write',
    'wrote','sit','sat','stand','stood','lose','lost','pay','paid','meet',
    'met','include','included','continue','continued','set','set','learn',
    'learned','change','changed','lead','led','understand','understood',
    'watch','watched','follow','followed','stop','stopped','create','created',
    'speak','spoke','read','read','allow','allowed','add','added','spend',
    'spent','grow','grew','open','opened','walk','walked','win','won',
    'offer','offered','remember','remembered','love','loved','consider',
    'considered','appear','appeared','buy','bought','wait','waited','serve',
    'served','die','died','send','sent','expect','expected','build','built',
    'stay','stayed','fall','fell','cut','cut','reach','reached','kill','killed',
    'remain','remained','suggest','suggested','raise','raised','pass','passed',
    'sell','sold','require','required','report','reported','decide','decided',
    'pull','pulled','consist','consisted','consistently','consistent','consistency'
  ];
  if (stopwords.includes(lower)) return false;
  return true;
}

/**
 * Exact match against whitelist
 */
function exactWhitelistMatch(candidate, whitelist = FONT_WHITELIST) {
  const c = candidate.trim().toLowerCase();
  for (const f of whitelist) {
    if (f.toLowerCase() === c) return f;
  }
  return null;
}

/**
 * Fuzzy match against whitelist
 */
function fuzzyWhitelistMatch(candidate, whitelist = FONT_WHITELIST, maxDistance = 2) {
  let best = null;
  let bestDist = Infinity;
  const cand = candidate.toLowerCase();
  for (const f of whitelist) {
    const dist = levenshtein(cand, f.toLowerCase());
    if (dist < bestDist) {
      bestDist = dist;
      best = f;
    }
  }
  if (bestDist <= maxDistance) return best;
  return null;
}

/**
 * Extract font name candidates from text using smart heuristics
 */
export function detectFontsFromText(text, whitelist = FONT_WHITELIST) {
  if (!text) return [];

  const candidates = new Set();

  // 1) Lines that look like type samples: "Omnes Aa Bb Cc Dd"
  const sampleRegex = /([A-Z][A-Za-z0-9\-\s]{2,40})\s+(?:Aa\s+Bb|AaBb|0123|0123456789)/g;
  let m;
  while ((m = sampleRegex.exec(text)) !== null) {
    const token = normalizeToken(m[1]);
    if (isLikelyFontToken(token)) candidates.add(token);
  }

  // 2) Sentences that include typography keywords
  const typKeywords = /(typeface|typeface:|font|primary typeface|secondary typeface|selected|comes in|comes from|is the primary typeface|is the typeface|we use)/i;
  const sentences = text.split(/[\r\n]+|[.?!]\s+/);
  for (const s of sentences) {
    // Skip sentences that are clearly descriptive, not font declarations
    if (/consistent use|icon system|brand typeface|color palette/i.test(s)) continue;
    
    if (typKeywords.test(s)) {
      // Capture Title Case runs up to 4 tokens
      const titleRun = s.match(/\b([A-Z][a-z0-9\-]+(?:\s+[A-Z][a-z0-9\-]+){0,3})\b/g);
      if (titleRun) {
        for (const run of titleRun) {
          const tok = normalizeToken(run);
          if (isLikelyFontToken(tok)) candidates.add(tok);
        }
      }
      // Also capture "typeface X" patterns
      const afterMatch = s.match(/(?:typeface|font)\s+(?:is|:)?\s*([A-Z][A-Za-z0-9\-\s]{2,40})/i);
      if (afterMatch && afterMatch[1]) candidates.add(normalizeToken(afterMatch[1]));
    }
  }

  // 3) Direct whitelist exact matches in the text
  for (const f of whitelist) {
    const re = new RegExp(`\\b${f.replace(/\s+/g,'\\s+')}\\b`, 'i');
    if (re.test(text)) candidates.add(f);
  }

  // 4) Filter candidates and match against whitelist
  const detected = [];
  for (const c of candidates) {
    const exact = exactWhitelistMatch(c, whitelist);
    if (exact) {
      detected.push({ name: exact, method: 'exact' });
      continue;
    }
    const fuzzy = fuzzyWhitelistMatch(c, whitelist, 2); // allow small typos
    if (fuzzy) {
      detected.push({ name: fuzzy, method: 'fuzzy', raw: c });
      continue;
    }
    // if candidate is multi-word (likely a font name), keep as unknown but plausible
    if (c.split(/\s+/).length <= 3 && c.length >= 4) {
      detected.push({ name: c, method: 'candidate', raw: c });
    }
  }

  // Deduplicate preserving whitelist canonical names first
  const seen = new Set();
  const final = [];
  for (const item of detected) {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) {
      final.push(item);
      seen.add(key);
    }
  }

  // 5) Final filtering: drop non-font terms
  const BAD_FONT_TERMS = [
    'typeface','font','system','color','use','consistent','weight',
    'italic','regular','medium','light','black','bold','thin','extra','hairline',
    'semibold','heavy','book','condensed','extended','outline','shadow',
    'icon','palette','primary','secondary','display','body','heading',
    'sample','guidelines','typography','text','copy','headline'
  ];

  const filtered = final.filter(item => {
    const lower = item.name.toLowerCase();
    // Filter out bad terms and inappropriate lengths
    const hasBadTerm = BAD_FONT_TERMS.some(bad => lower.includes(bad));
    const validLength = item.name.length >= 3 && item.name.length <= 30;
    const hasCapital = /[A-Z]/.test(item.name);
    const notAllLowercase = !/^[a-z\s]+$/.test(item.name);
    
    // Exclude brand names that are not fonts
    const isBrandName = lower === 'switcher' || lower === 'apple' || lower === 'microsoft' || lower === 'google';
    
    // Exclude prepositional phrases
    const isPrepositionalPhrase = /^(for|with|in|on|at|to|from|by)\s+/.test(lower);
    
    return !hasBadTerm && validLength && hasCapital && notAllLowercase && !isBrandName && !isPrepositionalPhrase;
  });

  // Prefer whitelist fonts first
  const prioritized = [
    ...filtered.filter(f => whitelist.map(w => w.toLowerCase()).includes(f.name.toLowerCase())),
    ...filtered.filter(f => !whitelist.map(w => w.toLowerCase()).includes(f.name.toLowerCase()))
  ];

  // Return clean list
  return prioritized.map(i => i.name);
}
