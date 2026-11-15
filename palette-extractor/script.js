/*
  Color Palette Extractor - Professional Dark Theme
  All 10 tasks implemented with vanilla JS, Canvas API, color space conversions
  localStorage persistence, WCAG contrast checking, harmony generation
*/

'use strict';

// ============================================
// COLOR SPACE CONVERSIONS (manual implementations)
// ============================================

/** RGB values (0-255) */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return r;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  r = hue2rgb(p, q, h + 1 / 3);
  g = hue2rgb(p, q, h);
  b = hue2rgb(p, q, h - 1 / 3);

  return {
    r: Math.round(clamp(r) * 255),
    g: Math.round(clamp(g) * 255),
    b: Math.round(clamp(b) * 255),
  };
}

function clamp(val) {
  return Math.max(0, Math.min(1, val));
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x =>
    x.toString(16).padStart(2, '0')
  ).join('');
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/* Lab color space (CIE 1931) - D65 illuminant */
function rgbToLab(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // D65 reference white
  const xr = rNorm * 0.4124 + gNorm * 0.3576 + bNorm * 0.1805;
  const yr = rNorm * 0.2126 + gNorm * 0.7152 + bNorm * 0.0722;
  const zr = rNorm * 0.0193 + gNorm * 0.1192 + bNorm * 1.0105;

  // Reference white Xn = Yn = Zn = 1
  const xrRef = xr > 0.008856 ? Math.cbrt(xr) : (7.787 * xr + 16 / 116);
  const yrRef = yr > 0.008856 ? Math.cbrt(yr) : (7.787 * yr + 16 / 116);
  const zrRef = zr > 0.008856 ? Math.cbrt(zr) : (7.787 * zr + 16 / 116);

  const L = 116 * yrRef - 16;
  const a = 500 * (xrRef - yrRef);
  const bVal = 200 * (yrRef - zrRef);

  return { L: Math.round(L * 100) / 100, a: Math.round(a), b: Math.round(bVal) };
}

function labToRgb(L, a, bVal) {
  const yrRef = (L + 16) / 116;
  const xrRef = (a + 500 * yrRef) / 500;
  const zrRef = (yrRef - 200 / 200) / 200; // simplified

  // Check bounds for cube root
  const cbrtX = xrRef > 0.008856 ? Math.cbrt(xrRef) : (xrRef - 16 / 116) / 7.787;
  const cbrtY = yrRef > 0.008856 ? Math.cbrt(yrRef) : (yrRef - 16 / 116) / 7.787;
  const cbrtZ = zrRef > 0.008856 ? Math.cbrt(zrRef) : (zrRef - 16 / 116) / 7.787;

  const r =  3.240970 * cbrtX - 1.537383 * cbrtY - 0.498611 * cbrtZ;
  const g = -0.969254 * cbrtX + 1.875965 * cbrtY + 0.041555 * cbrtZ;
  const b =  0.055648 * cbrtX - 0.204043 * cbrtY + 1.057311 * cbrtZ;

  return {
    r: Math.round(clamp(r) * 255),
    g: Math.round(clamp(g) * 255),
    b: Math.round(clamp(b) * 255),
  };
}

/* OKLab color space - perceptually uniform */
function rgbToOkLab(r, g, b) {
  const rl = r / 255;
  const gl = g / 255;
  const bl = b / 255;

  // Lab transform matrix for D65
  const xl = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const yl = 0.2119034983 * rl + 0.6806995453 * gl + 0.1089067774 * bl;
  const zl = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  // WK = 1/9 for standard observer
  const ml = Math.cbrt(xl > 0.008856 ? xl : (7.787 * xl + 16 / 116) / 9);
  const mll = Math.cbrt(yl > 0.008856 ? yl : (7.787 * yl + 16 / 116) / 9);
  const mlb = Math.cbrt(zl > 0.008856 ? zl : (7.787 * zl + 16 / 116) / 9);

  // LMS to OKLab transform
  const L = 0.2104542553 * ml + 0.7936177850 * mll + 0.0969252128 * mlb;
  const a = 1.9779984951 * ml - 2.4285922050 * mll + 0.4505937099 * mlb;
  const b = 0.0259040371 * ml + 0.7827717662 * mll - 0.8086757660 * mlb;

  return {
    L: Math.round(L * 100) / 100,
    a: Math.round(a * 100) / 100,
    b: Math.round(b * 100) / 100,
  };
}

function okLabToRgb(L, a, b) {
  // OKLab to LMS
  const ml = (L + 0.3963377774 * a + 0.2158037573 * b) / 0.2104542553;
  const mll = (-0.1055613458 * a + 0.0551549340 * b + 0.9990489341 * ml);
  const mlb = (-0.0894842775 * a - 0.7688226882 * b + 1.1910709510 * ml);

  // LMS to Lab
  const xl =  0.7327817802 * ml - 0.4296129778 * mll + 0.0968312202 * mlb;
  const yl = -0.7031525375 * ml + 1.6975591631 * mll + 0.0060898331 * mlb;
  const zl = -0.0040672390 * ml + 0.0466830924 * mll + 0.9546154317 * mlb;

  // Lab to RGB
  const rl =  4.0616103503 * xl - 3.5397633129 * yl + 0.0580634654 * zl;
  const gl = -2.0996903870 * xl + 1.9484760887 * yl + 0.0414803231 * zl;
  const bl = -0.0760060037 * xl - 0.5412406378 * yl + 1.0550969587 * zl;

  return {
    r: Math.round(clamp(rl) * 255),
    g: Math.round(clamp(gl) * 255),
    b: Math.round(clamp(bl) * 255),
  };
}

/* OKLCH (polar form of OKLab) */
function okLabToOkLch(L, a, b) {
  const c = Math.sqrt(a * a + b * b);
  const h = Math.atan2(b, a) * 180 / Math.PI;
  return { L: L, C: c, H: h < 0 ? h + 360 : h };
}

function okLchToOkLab(L, C, H) {
  const hRad = H * Math.PI / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  return { L, a, b };
}

/* HSV conversion */
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;

  s = max === 0 ? 0 : (max - min) / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = ((g - b) / (max - min) + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / (max - min) + 2) / 6; break;
      case b: h = ((r - g) / (max - min) + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

/* XYZ conversion */
function rgbToXyz(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const x = rNorm * 0.4124 + gNorm * 0.3576 + bNorm * 0.1805;
  const y = rNorm * 0.2126 + gNorm * 0.7152 + bNorm * 0.0722;
  const z = rNorm * 0.0193 + gNorm * 0.1192 + bNorm * 1.0105;

  return { x: Math.round(x * 10000) / 10000, y: Math.round(y * 10000) / 10000, z: Math.round(z * 10000) / 10000 };
}

/* LCH from Lab */
function labToLch(L, a, b) {
  const c = Math.sqrt(a * a + b * b);
  const h = Math.atan2(b, a) * 180 / Math.PI;
  return { L: L, C: Math.round(c), H: h < 0 ? h + 360 : h };
}

// ============================================
// K-MEANS CLUSTERING
// ============================================

function kMeansExtract(colors, colorCount = 5, maxIterations = 10) {
  if (colors.length === 0) return [];

  // Initialize centroids randomly
  const centroids = [];
  const shuffled = [...colors].sort(() => Math.random() - 0.5);
  for (let i = 0; i < colorCount && i < shuffled.length; i++) {
    centroids.push({ r: shuffled[i].r, g: shuffled[i].g, b: shuffled[i].b });
  }

  // Iterate
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Assign each color to closest centroid
    const clusters = Array.from({ length: colorCount }, () => []);
    const distances = new Array(colors.length);

    for (let i = 0; i < colors.length; i++) {
      let minDist = Infinity;
      let closest = 0;
      for (let j = 0; j < centroids.length; j++) {
        const d = colorDistance(colors[i], centroids[j]);
        if (d < minDist) {
          minDist = d;
          closest = j;
        }
      }
      distances[i] = { cluster: closest, dist: minDist };
      clusters[closest].push(colors[i]);
    }

    // Recalculate centroids
    let changed = false;
    for (let j = 0; j < centroids.length; j++) {
      const clusterColors = clusters[j];
      if (clusterColors.length === 0) continue;

      let rSum = 0, gSum = 0, bSum = 0;
      for (const c of clusterColors) {
        rSum += c.r; gSum += c.g; bSum += c.b;
      }
      const newR = Math.round(rSum / clusterColors.length);
      const newG = Math.round(gSum / clusterColors.length);
      const newB = Math.round(bSum / clusterColors.length);

      if (newR !== centroids[j].r || newG !== centroids[j].g || newB !== centroids[j].b) {
        changed = true;
        centroids[j] = { r: newR, g: newG, b: newB };
      }
    }

    if (!changed) break;
  }

  // Count frequencies and return sorted
  const counts = new Map();
  colors.forEach(c => {
    const key = `${c.r},${c.g},${c.b}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  // Sort centroids by population
  const result = centroids.map((c, i) => {
    const key = `${c.r},${c.g},${c.b}`;
    const count = counts.get(key) || 0;
    return { r: c.r, g: c.g, b: c.b, count };
  });

  result.sort((a, b) => b.count - a.count);
  return result.slice(0, colorCount);
}

function colorDistance(c1, c2) {
  // CIE76 distance in Lab space for better perceptual accuracy
  const lab1 = rgbToLab(c1.r, c1.g, c1.b);
  const lab2 = rgbToLab(c2.r, c2.g, c2.b);
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/* Median Cut algorithm */
function medianCutExtract(colors, colorCount = 5) {
  if (colors.length === 0) return [];

  // Build color count map
  const colorCounts = new Map();
  colors.forEach(c => {
    const key = `${c.r},${c.g},${c.b}`;
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  });

  // Recursive box splitting
  function splitBox(box, depth = 0) {
    if (depth >= 6 || box.count <= 1) {
      return [box];
    }

    // Find the dominating axis (max range)
    const rangeR = box.maxR - box.minR;
    const rangeG = box.maxG - box.minG;
    const rangeB = box.maxB - box.minB;

    let boxes;
    if (rangeR >= rangeG && rangeR >= rangeB) {
      // Split on R
      const midR = (box.minR + box.maxR) / 2;
      const leftBox = { ...box, maxR: midR, count: 0 };
      const rightBox = { ...box, minR: midR, count: 0 };

      box.colors.forEach(c => {
        if (c.r <= midR) {
          leftBox.colors.push(c);
          leftBox.count++;
        } else {
          rightBox.colors.push(c);
          rightBox.count++;
        }
      });

      boxes = splitBox(leftBox, depth + 1).concat(splitBox(rightBox, depth + 1));
    } else if (rangeG >= rangeR && rangeG >= rangeB) {
      // Split on G
      const midG = (box.minG + box.maxG) / 2;
      const leftBox = { ...box, maxG: midG, count: 0 };
      const rightBox = { ...box, minG: midG, count: 0 };

      box.colors.forEach(c => {
        if (c.g <= midG) {
          leftBox.colors.push(c);
          leftBox.count++;
        } else {
          rightBox.colors.push(c);
          rightBox.count++;
        }
      });

      boxes = splitBox(leftBox, depth + 1).concat(splitBox(rightBox, depth + 1));
    } else {
      // Split on B
      const midB = (box.minB + box.maxB) / 2;
      const leftBox = { ...box, maxB: midB, count: 0 };
      const rightBox = { ...box, minB: midB, count: 0 };

      box.colors.forEach(c => {
        if (c.b <= midB) {
          leftBox.colors.push(c);
          leftBox.count++;
        } else {
          rightBox.colors.push(c);
          rightBox.count++;
        }
      });

      boxes = splitBox(leftBox, depth + 1).concat(splitBox(rightBox, depth + 1));
    }

    return boxes;
  }

  // Build initial box
  const allColors = [];
  colorCounts.forEach((count, key) => {
    const [r, g, b] = key.split(',').map(Number);
    allColors.push({ r, g, b });
  });

  const initialBox = {
    minR: Infinity, maxR: -Infinity,
    minG: Infinity, maxG: -Infinity,
    minB: Infinity, maxB: -Infinity,
    colors: allColors,
    count: allColors.length
  };

  allColors.forEach(c => {
    if (c.r < initialBox.minR) initialBox.minR = c.r;
    if (c.r > initialBox.maxR) initialBox.maxR = c.r;
    if (c.g < initialBox.minG) initialBox.minG = c.g;
    if (c.g > initialBox.maxG) initialBox.maxG = c.g;
    if (c.b < initialBox.minB) initialBox.minB = c.b;
    if (c.b > initialBox.maxB) initialBox.maxB = c.b;
  });

  const boxes = splitBox(initialBox);

  // Get representative color from each box
  const result = boxes.slice(0, colorCount).map(box => {
    const colors = box.colors;
    let rSum = 0, gSum = 0, bSum = 0;
    colors.forEach(c => {
      rSum += c.r; gSum += c.g; bSum += c.b;
    });
    const n = colors.length;
    return {
      r: Math.round(rSum / n),
      g: Math.round(gSum / n),
      b: Math.round(bSum / n),
      count: box.count
    };
  });

  result.sort((a, b) => b.count - a.count);
  return result;
}

/* Histogram-based extraction */
function histogramExtract(colors, colorCount = 5, bins = 64) {
  if (colors.length === 0) return [];

  // Quantize colors to grid
  const quantization = Math.cbrt(bins);
  const grid = new Map();

  colors.forEach(c => {
    const qr = Math.min(bins - 1, Math.floor(c.r * quantization));
    const qg = Math.min(bins - 1, Math.floor(c.g * quantization));
    const qb = Math.min(bins - 1, Math.floor(c.b * quantization));
    const key = `${qr},${qg},${qb}`;
    grid.set(key, (grid.get(key) || 0) + 1);
  });

  // Find top bins
  const entries = Array.from(grid.entries());
  entries.sort((a, b) => b[1] - a[1]);

  // Convert back to RGB and return
  const result = [];
  const seen = new Set();
  for (let i = 0; i < colorCount && i < entries.length; i++) {
    const [qr, qg, qb] = entries[i][0].split(',').map(Number);
    const centerR = ((qr + 0.5) / bins) * 255;
    const centerG = ((qg + 0.5) / bins) * 255;
    const centerB = ((qb + 0.5) / bins) * 255;

    const key = `${centerR},${centerG},${centerB}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ r: Math.round(centerR), g: Math.round(centerG), b: Math.round(centerB), count: entries[i][1] });
    }
  }

  return result;
}

// ============================================
// DOM ELEMENTS & STATE
// ============================================

const DOM = {
  // Task 1 - Extraction
  imageUpload: document.getElementById('imageUpload'),
  dropZone: document.getElementById('dropZone'),
  imageUrl: document.getElementById('imageUrl'),
  extractBtn: document.getElementById('extractBtn'),
  clearBtn: document.getElementById('clearBtn'),
  colorCount: document.getElementById('colorCount'),
  algoTabs: document.querySelectorAll('[data-algo]'),

  // Task 2 - Harmony
  harmonyBaseColor: document.getElementById('harmonyBaseColor'),
  harmonyBaseSwatch: document.getElementById('harmonyBaseSwatch'),
  harmonyCount: document.getElementById('harmonyCount'),
  harmonyTabs: document.querySelectorAll('[data-harmony]'),
  harmonyPalette: document.getElementById('harmonyPalette'),

  // Task 3 - Color Spaces
  csBaseColor: document.getElementById('csBaseColor'),
  csBaseSwatch: document.getElementById('csBaseSwatch'),
  colorspaceTabs: document.querySelectorAll('.colorspace-tab'),
  colorspacePanels: document.querySelectorAll('.colorspace-panel'),

  // Task 4 - Export CSS
  cssPrefix: document.getElementById('cssPrefix'),
  cssFormatTabs: document.querySelectorAll('[data-format]'),
  cssOutput: document.getElementById('cssOutput'),

  // Task 5 - Export JSON
  jsonFormatTabs: document.querySelectorAll('[data-json-format]'),
  jsonOutput: document.getElementById('jsonOutput'),

  // Task 6 - Share
  shareUrl: document.getElementById('shareUrl'),
  shareIncludeHarmony: document.getElementById('shareIncludeHarmony'),
  shareIncludeSpaces: document.getElementById('shareIncludeSpaces'),
  shareShorten: document.getElementById('shareShorten'),
  shareGenerateBtn: document.getElementById('shareGenerateBtn'),

  // Task 7 - Picker
  pickerCanvas: document.getElementById('pickerCanvas'),
  pickerCanvasWrapper: document.getElementById('pickerCanvasWrapper'),
  pickedColors: document.getElementById('pickedColors'),

  // Task 8 - Library
  libraryList: document.getElementById('libraryList'),
  librarySearch: document.getElementById('librarySearch'),
  saveCurrentBtn: document.getElementById('librarySaveCurrentBtn'),
  importBtn: document.getElementById('libraryImportBtn'),

  // Task 9 - Contrast
  contrastFg: document.getElementById('contrastFg'),
  contrastBg: document.getElementById('contrastBg'),
  contrastFgSwatch: document.getElementById('contrastFgSwatch'),
  contrastBgSwatch: document.getElementById('contrastBgSwatch'),
  contrastResult: document.getElementById('contrastResult'),

  // Task 10 - Random
  randomCount: document.getElementById('randomCount'),
  randomHueMin: document.getElementById('randomHueMin'),
  randomHueMax: document.getElementById('randomHueMax'),
  randomSatMin: document.getElementById('randomSatMin'),
  randomSatMax: document.getElementById('randomSatMax'),
  randomLightMin: document.getElementById('randomLightMin'),
  randomLightMax: document.getElementById('randomLightMax'),
  randomDistinct: document.getElementById('randomDistinct'),
  randomHarmony: document.getElementById('randomHarmony'),
  randomHarmonyType: document.getElementById('randomHarmonyType'),
  randomPalette: document.getElementById('randomPalette'),
  randomGenerateBtn: document.getElementById('randomGenerateBtn'),
  randomSeed: document.getElementById('randomSeed'),

  // Main panel
  mainCanvas: document.getElementById('mainCanvas'),
  mainCanvasWrapper: document.getElementById('mainCanvasWrapper'),
  mainPalette: document.getElementById('mainPalette'),
  mainColorspaceTabs: document.getElementById('mainColorspaceTabs'),
  exportCssBtn: document.getElementById('exportCssBtn'),
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  exportShareBtn: document.getElementById('exportShareBtn')
};

const state = {
  extractedColors: [],
  currentScheme: null,
  savedPalettes: loadFromStorage('savedPalettes', []),
  contrastHistory: loadFromStorage('contrastHistory', []),
  urlIdCounter: 0
};

// Load from localStorage
function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

// Save to localStorage
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

// ============================================
// TOAST HELPER
// ============================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      ${type === 'success' ? '<path d="M9 12l2 2 4-4m6.34-5.34l1.42 1.42M1 8l4 4m4-4L8 4m0 0l4 4M8 12l4 4m-4-4l-4 4m6 8l1.42-1.42M21 8l-4-4m0 0l-4 4m-6.64-5.64l-1.42-1.42"/>' : ''}
      ${type === 'error' ? '<path d="M10 9V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2m0 0h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1-.293.707H11.5a1 1 0 0 1-.707-.293l-5.414-5.414a1 1 0 0 1 .293-.707zM17 3H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2zm8 4h.01M3 11V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v4M13 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2z"/>' : ''}
      ${type === 'warning' ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>' : ''}
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(tabs, activeIndex = 0) {
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === activeIndex);
    tab.setAttribute('aria-selected', i === activeIndex);
  });
}

function attachTabHandlers(tabs, handler) {
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      handler(i);
    });
  });
}

// ============================================
// TASK 1: COLOR EXTRACTION FROM IMAGES
// ============================================

function setupImageUpload() {
  // Upload
  DOM.imageUpload.addEventListener('change', handleImageSelect);

  // Drop zone
  DOM.dropZone.addEventListener('click', () => DOM.imageUpload.click());
  DOM.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.dropZone.classList.add('drag-over');
  });
  DOM.dropZone.addEventListener('dragleave', () => {
    DOM.dropZone.classList.remove('drag-over');
  });
  DOM.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
      DOM.imageUpload.files = e.dataTransfer.files;
      handleImageSelect({ target: DOM.imageUpload });
    }
  });

  // URL
  DOM.imageUrl.addEventListener('change', () => {
    const url = DOM.imageUrl.value;
    if (url) loadImageFromUrl(url);
  });

  // Extract button
  DOM.extractBtn.addEventListener('click', extractColors);

  // Clear
  DOM.clearBtn.addEventListener('click', clearAll);
}

function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type and size
  const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp', 'image/avif'];
  if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpe?g|gif|webp|bmp|avif)$/i)) {
    showToast('Unsupported file type. Use PNG, JPG, GIF, WebP, BMP, or AVIF.', 'error');
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    showToast('File too large. Max 20MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.extractedColors = [];
      renderImage(img);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function loadImageFromUrl(url) {
  const img = new Image();
  img.onload = () => {
    state.extractedColors = [];
    renderImage(img);
  };
  img.onerror = () => showToast('Failed to load image from URL.', 'error');
  img.src = url;
}

function renderImage(img) {
  // Set canvas dimensions maintaining aspect ratio
  const maxWidth = 800;
  const maxHeight = 600;
  let width = img.width;
  let height = img.height;

  if (width > maxWidth) {
    height = (height / width) * maxWidth;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = (width / height) * maxHeight;
    height = maxHeight;
  }

  DOM.mainCanvas.width = width;
  DOM.mainCanvas.height = height;
  DOM.pickerCanvas.width = width;
  DOM.pickerCanvas.height = height;
  DOM.mainCanvasWrapper.style.width = `${width}px`;
  DOM.mainCanvasWrapper.style.height = `${height}px`;

  const ctx = DOM.mainCanvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Add click handler for picker
  setupCanvasPicker(ctx, width, height);

  // Show extraction controls
  document.getElementById('extractionStats').hidden = false;
  document.getElementById('mainPanel').hidden = false;
  DOM.extractBtn.disabled = false;
  showToast('Image loaded. Select extraction algorithm and click Extract.', 'info');
}

function setupCanvasPicker(ctx, width, height) {
  // Picker canvas event
  DOM.pickerCanvas.addEventListener('click', (e) => {
    const rect = DOM.pickerCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Get pixel data
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const r = pixelData[0];
    const g = pixelData[1];
    const b = pixelData[2];
    const a = pixelData[3];

    if (a >= 128) { // Mostly opaque
      const hex = rgbToHex(r, g, b);
      addPickedColor({ r, g, b, hex });
      showToast(`Picked color: ${hex}`, 'info');
    }
  });
}

function addPickedColor(color) {
  // Check if already picked
  const existing = Array.from(DOM.pickedColors.children).some(
    el => el.dataset.r === color.r && el.dataset.g === color.g && el.dataset.b === color.b
  );
  if (existing) return;

  const colorEl = document.createElement('div');
  colorEl.className = 'color-swatch color-swatch-tiny';
  colorEl.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
  colorEl.dataset.r = color.r;
  colorEl.dataset.g = color.g;
  colorEl.dataset.b = color.b;
  colorEl.dataset.hex = rgbToHex(color.r, color.g, color.b);
  colorEl.title = `RGB(${color.r}, ${color.g}, ${color.b})`;

  colorEl.addEventListener('click', () => {
    // Add to main palette
    addColorToPalette(color.r, color.g, color.b);
    // Show color info
    showColorInfo(color.r, color.g, color.b);
  });

  DOM.pickedColors.appendChild(colorEl);
  updateMainPalette();
}

function removePickedColor(el) {
  el.parentNode.removeChild(el);
  updateMainPalette();
}

function updateMainPalette() {
  const colors = [];
  DOM.pickedColors.querySelectorAll('.color-swatch-tiny').forEach(el => {
    colors.push({
      r: parseInt(el.dataset.r),
      g: parseInt(el.dataset.g),
      b: parseInt(el.dataset.b),
      hex: el.dataset.hex
    });
  });
  renderMainPalette(colors);
}

function extractColors() {
  if (!DOM.mainCanvas || DOM.mainCanvas.width === 0) {
    showToast('Please upload an image first.', 'error');
    return;
  }

  const colorCount = parseInt(DOM.colorCount.value) || 5;
  const algo = document.querySelector('[data-algo].active').dataset.algo;

  DOM.extractBtn.disabled = true;
  DOM.extractBtn.innerHTML = '<span class="spinner"></span> Extracting...';

  const ctx = DOM.mainCanvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, DOM.mainCanvas.width, DOM.mainCanvas.height);
  const pixels = imageData.data;

  // Sample pixels (avoid processing all for performance)
  const sampleSize = Math.min(50000, DOM.mainCanvas.width * DOM.mainCanvas.height);
  const pixelCount = DOM.mainCanvas.width * DOM.mainCanvas.height;
  const step = Math.floor(pixelCount / sampleSize);

  // Build colors array from sampled pixels
  const colors = [];
  const visited = new Set();

  for (let i = 0; i < pixelCount; i += step) {
    if (colors.length >= sampleSize) break;
    const idx = i * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    const a = pixels[idx + 3];

    if (a < 128) continue; // Skip transparent

    const key = `${r},${g},${b}`;
    if (!visited.has(key)) {
      visited.add(key);
      colors.push({ r, g, b });
    }
  }

  // Extract using selected algorithm
  let extracted;
  const startTime = performance.now();

  switch (algo) {
    case 'dominant':
      extracted = dominantColorSampling(colors, colorCount);
      break;
    case 'kmeans':
      extracted = kMeansExtract(colors, colorCount);
      break;
    case 'mediancut':
      extracted = medianCutExtract(colors, colorCount);
      break;
    case 'histogram':
      extracted = histogramExtract(colors, colorCount);
      break;
    default:
      extracted = dominantColorSampling(colors, colorCount);
  }

  const endTime = performance.now();

  // Store results
  state.extractedColors = extracted;

  // Update UI
  renderExtractionResults(extracted, endTime - startTime, colors.length);
  renderPaletteDisplay(extracted);
  renderMainPalette(extracted.map(c => ({ r: c.r, g: c.g, b: c.b, hex: rgbToHex(c.r, c.g, c.b) })));
  updateExtractionStats(extracted, endTime - startTime, colors.length);

  DOM.extractBtn.disabled = false;
  DOM.extractBtn.innerHTML = 'Extract Palette';
  showToast(`Extracted ${extracted.length} colors using ${algo} algorithm`, 'success');
}

function dominantColorSampling(colors, count) {
  if (colors.length === 0) return [];

  // Simple frequency-based approach
  const colorCounts = new Map();
  colors.forEach(c => {
    const key = `${c.r},${c.g},${c.b}`;
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  });

  // Sort by frequency
  const sorted = Array.from(colorCounts.entries())
    .map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      return { r, g, b, count };
    })
    .sort((a, b) => b.count - a.count);

  return sorted.slice(0, count);
}

function renderExtractionResults(colors, timeMs, totalPixels) {
  document.getElementById('statColors').textContent = colors.length;
  document.getElementById('statTime').textContent = `${Math.round(timeMs)}ms`;
  document.getElementById('statPixels').textContent = totalPixels.toLocaleString();
  document.getElementById('statAlgo').textContent =
    document.querySelector('[data-algo].active').dataset.algo.charAt(0).toUpperCase() +
    document.querySelector('[data-algo].active').dataset.algo.slice(1);
  document.getElementById('extractionStats').hidden = false;
}

function renderPaletteDisplay(colors) {
  const paletteContainer = document.getElementById('mainPalette');
  paletteContainer.innerHTML = '';

  if (colors.length === 0) {
    paletteContainer.innerHTML = '<p class="muted" style="color: var(--fg-subtle);">No colors extracted</p>';
    return;
  }

  colors.slice(0, 12).forEach((color, index) => {
    const colorBox = document.createElement('div');
    colorBox.className = 'color-swatch';
    colorBox.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    colorBox.dataset.r = color.r;
    colorBox.dataset.g = color.g;
    colorBox.dataset.b = color.b;
    colorBox.dataset.hex = color.hex || rgbToHex(color.r, color.g, color.b);
    colorBox.title = `rgb(${color.r}, ${color.g}, ${color.b})`;

    colorBox.addEventListener('click', () => selectColorForInfo(color.r, color.g, color.b));

    paletteContainer.appendChild(colorBox);
  });
}

function updateExtractionStats(colors, timeMs, totalPixels) {
  const algo = document.querySelector('[data-algo].active')?.dataset.algo || 'dominant';
  document.getElementById('statColors').textContent = colors.length;
  document.getElementById('statTime').textContent = `${Math.round(timeMs)}ms`;
  document.getElementById('statPixels').textContent = totalPixels.toLocaleString();
  document.getElementById('statAlgo').textContent =
    algo.charAt(0).toUpperCase() + algo.slice(1);
}

// ============================================
// TASK 2: COLOR HARMONY GENERATION
// ============================================

function setupHarmony() {
  // Base color picker
  DOM.harmonyBaseColor.addEventListener('input', () => {
    const rgb = hexToRgb(DOM.harmonyBaseColor.value);
    if (rgb) {
      DOM.harmonyBaseSwatch.style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      renderHarmonySchemes(rgb, parseInt(DOM.harmonyCount.value) || 5);
    }
  });

  DOM.harmonyBaseSwatch.addEventListener('click', () => {
    DOM.harmonyBaseColor.click();
  });

  // Harmony type tabs
  attachTabHandlers(DOM.harmonyTabs, (idx) => {
    const scheme = DOM.harmonyTabs[idx].dataset.harmony;
    renderHarmonySchemes(
      hexToRgb(DOM.harmonyBaseColor.value) || { r: 255, g: 107, b: 157 },
      parseInt(DOM.harmonyCount.value) || 5,
      scheme
    );
  });

  // Count input
  DOM.harmonyCount.addEventListener('input', () => {
    const rgb = hexToRgb(DOM.harmonyBaseColor.value);
    if (rgb) {
      renderHarmonySchemes(rgb, parseInt(DOM.harmonyCount.value) || 5);
    }
  });

  // "Use as Base" button
  document.getElementById('harmonyToExtractor').addEventListener('click', () => {
    const rgb = hexToRgb(DOM.harmonyBaseColor.value);
    if (rgb && state.extractedColors.length > 0) {
      const color = { r: rgb.r, g: rgb.g, b: rgb.b };
      // Add first extracted color's info or the harmony base
      addColorToPalette(color.r, color.g, color.b);
      showToast('Base color added to palette', 'success');
    }
  });

  // "Save to Library" button
  document.getElementById('harmonySaveBtn').addEventListener('click', () => {
    saveCurrentPaletteToLibrary('harmony', {
      colors: renderHarmonySchemeColors(),
      scheme: document.querySelector('.harmony-tab.active')?.dataset.harmony || 'complementary',
      baseColor: DOM.harmonyBaseColor.value
    });
  });
}

function renderHarmonySchemes(baseRgb, count = 5, scheme = 'complementary') {
  const container = DOM.harmonyPalette;
  container.innerHTML = '';

  const hsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const harmonyColors = getHarmonicColors(baseRgb, scheme, count);

  harmonyColors.forEach((c, i) => {
    const rgb = hslToRgb(c.h, c.s, c.l);
    const hex = rgbToHex(rg.r, rgb.g, rgb.b);

    const schemeEl = document.createElement('div');
    schemeEl.className = 'color-swatch color-swatch-small';
    schemeEl.style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    schemeEl.dataset.hex = hex;
    schemeEl.dataset.h = c.h;
    schemeEl.dataset.s = c.s;
    schemeEl.dataset.l = c.l;
    schemeEl.title = `${scheme} harmony • ${hex}`;

    schemeEl.addEventListener('click', () => {
      selectColorForPalette(rgb.r, rgb.g, rgb.b, hex);
    });

    container.appendChild(schemeEl);
  });
}

function getHarmonicColors(baseRgb, scheme, count) {
  const { h, s, l } = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const colors = [];

  switch (scheme) {
    case 'complementary':
      for (let i = 0; i < count; i++) {
        const hue = (h + 180 * i) % 360;
        colors.push({ h: hue, s: Math.max(20, s - i * 15), l: Math.max(30, l - i * 10) });
      }
      break;
    case 'triadic':
      for (let i = 0; i < count; i++) {
        const hue = (h + 120 * i) % 360;
        colors.push({ h: hue, s, l });
      }
      break;
    case 'analogous':
      for (let i = 0; i < count; i++) {
        const hue = (h - 30 + i * 30 + 360) % 360;
        colors.push({ h: hue, s: Math.max(30, s - i * 10), l: Math.max(30, l - i * 5) });
      }
      break;
    case 'monochromatic':
      for (let i = 0; i < count; i++) {
        const newS = Math.max(10, s * (0.7 - i * 0.15));
        const newL = Math.max(10, l * (0.85 - i * 0.1));
        colors.push({ h, s: newS, l: newL });
      }
      break;
    case 'square':
      for (let i = 0; i < count; i++) {
        const hue = (h + 90 * i) % 360;
        colors.push({ h: hue, s, l });
      }
      break;
    case 'split':
      // Split complementary: base + two colors ~90° from complement
      for (let i = 0; i < count; i++) {
        const hue = (h + 150 + i * 30) % 360;
        colors.push({ h: hue, s: Math.max(20, s - i * 15), l: Math.max(30, l - i * 10) });
      }
      break;
    default:
      for (let i = 0; i < count; i++) {
        const hue = (h + 360 * i / count) % 360;
        colors.push({ h: hue, s, l });
      }
  }

  // Convert HSL to RGB
  return colors.map(c => {
    const h = c.h / 360;
    const s = c.s / 100;
    const l = c.l / 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h * 12) % 12;
      const color = l - a * Math.max(0, Math.min(4, Math.min(k - 3, 9 - k), 1));
      return Math.round(color * 255);
    };
    return { r: f(0), g: f(8), b: f(4) };
  });
}

function selectColorForPalette(r, g, b, hex) {
  addColorToPalette(r, g, b, hex);
}

function addColorToPalette(r, g, b, hex) {
  const color = { r, g, b, hex: hex || rgbToHex(r, g, b) };

  // Check for duplicates
  const existing = state.extractedColors.find(
    c => c.r === r && c.g === g && c.b === b
  );
  if (existing) return;

  state.extractedColors.push(color);
  renderMainPalette([color]);
  showToast(`Added ${hex || rgbToHex(r, g, b)} to palette`, 'success');
}

function renderMainPalette(colors) {
  const container = document.getElementById('mainPalette');
  container.innerHTML = '';

  if (colors.length === 0) {
    container.innerHTML = '<p class="muted" style="color: var(--fg-subtle);">No colors in palette</p>';
    return;
  }

  colors.slice(0, 12).forEach((color, index) => {
    const colorEl = document.createElement('div');
    colorEl.className = 'color-swatch';
    colorEl.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    colorEl.dataset.r = color.r;
    colorEl.dataset.g = color.g;
    colorEl.dataset.b = color.b;
    colorEl.dataset.hex = color.hex || rgbToHex(color.r, color.g, color.b);
    colorEl.title = `rgb(${color.r}, ${color.g}, ${color.b})`;

    colorEl.addEventListener('click', () => {
      showColorInfo(color.r, color.g, color.b);
    });

    container.appendChild(colorEl);
  });
}

function renderHarmonySchemeColors() {
  const scheme = document.querySelector('.harmony-tab.active')?.dataset.harmony || 'complementary';
  const count = parseInt(DOM.harmonyCount.value) || 5;
  const rgb = hexToRgb(DOM.harmonyBaseColor.value) || { r: 255, g: 107, b: 157 };
  return getHarmonicColors(rgb, scheme, count).map(c => {
    const rgb = hslToRgb(c.h, c.s, c.l);
    return { r: rgb.r, g: rgb.g, b: rgb.b, hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
  });
}

// ============================================
// TASK 3: COLOR SPACE VIEWER
// ============================================

function setupColorSpaces() {
  // Base color change
  DOM.csBaseColor.addEventListener('input', updateColorSpaces);
  DOM.csBaseSwatch.addEventListener('click', () => DOM.csBaseColor.click());

  // Tab switching
  attachTabHandlers(DOM.colorspaceTabs, (idx) => {
    DOM.colorspacePanels.forEach(p => p.classList.remove('active'));
    DOM.colorspacePanels[idx].classList.add('active');
    switchTab(DOM.colorspaceTabs, idx);
  });

  // Initial update
  updateColorSpaces();
}

function updateColorSpaces() {
  const rgb = hexToRgb(DOM.csBaseColor.value) || { r: 255, g: 107, b: 157 };

  // RGB
  DOM.cs.r.value = rgb.r;
  DOM.cs.g.value = rgb.g;
  DOM.cs.b.value = rgb.b;

  // HSL
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  DOM.cs.h.value = hsl.h;
  DOM.cs.s.value = hsl.s;
  DOM.cs.l.value = hsl.l;

  // HSV
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  DOM.cs.hsv_h.value = hsv.h;
  DOM.cs.hsv_s.value = hsv.s;
  DOM.cs.hsv_v.value = hsv.v;

  // Lab
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  DOM.cs.lab_l.value = lab.L;
  DOM.cs.lab_a.value = lab.a;
  DOM.cs.lab_b.value = lab.b;

  // OKLab
  const oklab = rgbToOkLab(rgb.r, rgb.g, rgb.b);
  DOM.cs.oklab_l.value = oklab.L;
  DOM.cs.oklab_a.value = oklab.a;
  DOM.cs.oklab_b.value = oklab.b;

  // XYZ
  const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);
  DOM.cs.xyz_x.value = xyz.x;
  DOM.cs.xyz_y.value = xyz.y;
  DOM.cs.xyz_z.value = xyz.z;

  // LCH
  const lch = labToLch(lab.L, lab.a, lab.b);
  DOM.cs.lch_l.value = lch.L;
  DOM.cs.lch_c.value = lch.C;
  DOM.cs.lch_h.value = lch.H;

  // HEX
  DOM.cs.hex.value = rgbToHex(rgb.r, rgb.g, rgb.b);
  DOM.cs.hex8.value = '#' + rgbToHex(rgb.r, rgb.g, rgb.b).substring(1) + 'FF';
  DOM.cs.css_rgb.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  DOM.cs.css_hsl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

// ============================================
// TASK 4: EXPORT CSS VARIABLES
// ============================================

function setupExportCss() {
  DOM.cssFormatTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      DOM.cssFormatTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      generateCssOutput();
    });
  });

  DOM.cssSelector.addEventListener('input', generateCssOutput);
  DOM.cssPrefix.addEventListener('input', generateCssOutput);
  generateCssOutput();
}

function generateCssOutput() {
  const rgbColors = state.extractedColors.slice(0, 12);
  const prefix = DOM.cssPrefix.value.trim() || '--color';
  const format = document.querySelector('[data-format].active')?.dataset.format || 'root';
  const selector = DOM.cssSelector.value.trim() || '.palette';

  let cssOutput;

  switch (format) {
    case 'root':
      cssOutput = `:root {\n`;
      rgbColors.forEach((c, i) => {
        const varName = `${prefix}-${i + 1}`;
        cssOutput += `  ${varName}: rgb(${c.r}, ${c.g}, ${c.b});\n`;
      });
      cssOutput += `}\n`;
      break;
    case 'selector':
      cssOutput = `${selector} {\n`;
      rgbColors.forEach((c, i) => {
        const varName = `${prefix}-${i + 1}`;
        cssOutput += `  ${varName}: rgb(${c.r}, ${c.g}, ${c.b});\n`;
      });
      cssOutput += `}\n`;
      break;
    case 'tailwind':
      cssOutput = '';
      rgbColors.forEach((c, i) => {
        const varName = `${prefix}-${i + 1}`;
        cssOutput += `  ${varName}: \${rgb(${c.r}, ${c.g}, ${c.b})};\n`;
      });
      break;
  }

  DOM.cssOutput.value = cssOutput;
}

// ============================================
// TASK 5: EXPORT JSON
// ============================================

function setupExportJson() {
  DOM.jsonFormatTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      DOM.jsonFormatTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      generateJsonOutput();
    });
  });

  generateJsonOutput();
}

function generateJsonOutput() {
  const includeMeta = document.querySelector('[data-json-format].active')?.dataset.format !== 'minimal';
  const rgbColors = state.extractedColors.slice(0, 12);
  const now = new Date().toISOString();

  let jsonOutput;

  switch (document.querySelector('[data-json-format].active')?.dataset.format) {
    case 'full':
      jsonOutput = {
        name: 'Color Palette Extractor',
        created: now,
        colorCount: rgbColors.length,
        colors: rgbColors.map(c => ({
          r: c.r, g: c.g, b: c.b,
          hex: rgbToHex(c.r, c.g, c.b),
          hsl: rgbToHsl(c.r, c.g, c.b),
          lab: rgbToLab(c.r, c.g, c.b),
          oklab: rgbToOkLab(c.r, c.g, c.b)
        })),
        metadata: {
          app: 'Palette Extractor',
          version: '2.0.0',
          author: 'KING_YOSEF_'
        }
      };
      break;
    case 'minimal':
      jsonOutput = {
        colors: rgbColors.map(c => ({
          r: c.r, g: c.g, b: c.b,
          hex: rgbToHex(c.r, c.g, c.b)
        }))
      };
      break;
    case 'ase':
      // ASE format (Adobe Swatch Exchange simplified)
      constase = ['#000000', '#ffffff']; // placeholder black/white
      rgbColors.forEach(c => {
        constase.push(rgbToHex(c.r, c.g, c.b));
      });
      jsonOutput = {ase};
      break;
    case 'gpl':
      // GPL format (GIMP)
      letgpl = '#!/GPLEditor: 0.0\n';
      gpl += '# Date: ' + now + '\n';
      gpl += '# Named Color List\n';
      rgbColors.forEach((c, i) => {
        gpl += `\n# Color #${i + 1}:\n`;
        gpl += `srgb ${c.r} ${c.g} ${c.b}\n`;
      });
      gpl += '\nENDCOLORS\n';
      jsonOutput = { gpl };
      break;
  }

  DOM.jsonOutput.value = JSON.stringify(jsonOutput, null, 2);
}

// ============================================
// TASK 6: SHAREABLE URL
// ============================================

function setupShare() {
  DOM.shareGenerateBtn.addEventListener('click', generateShareUrl);
  DOM.shareCopyBtn.addEventListener('click', () => copyToClipboard(DOM.shareUrl));
  DOM.shareOpenBtn.addEventListener('click', () => openShareUrl());
}

function generateShareUrl() {
  const rgbColors = state.extractedColors.slice(0, 12);
  const includeHarmony = DOM.shareIncludeHarmony.checked;
  const includeSpaces = DOM.shareIncludeSpaces.checked;
  const shorten = DOM.shareShorten.checked;

  // Build palette data
  const paletteData = {
    colors: rgbColors.map(c => ({
      r: c.r, g: c.g, b: c.b,
      hex: rgbToHex(c.r, c.g, c.b)
    })),
    algorithm: document.querySelector('[data-algo].active')?.dataset.algo || 'dominant',
    colorCount: parseInt(DOM.colorCount.value) || 5,
    includeHarmony: includeHarmony,
    includeSpaces: includeSpaces
  };

  // Encode as base64
  const jsonStr = JSON.stringify(paletteData);
  let b64 = btoa(jsonStr);

  // Shorten if requested (just use first 20 chars + hash approach)
  if (shorten && b64.length > 20) {
    b64 = b64.substring(0, 20) + b64.substring(b64.length - 10);
  }

  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?palette=${b64}`;

  DOM.shareUrl.value = shareUrl;
  showToast('Share link generated', 'success');
}

function openShareUrl() {
  const url = DOM.shareUrl.value;
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Opening share link', 'info');
  }
}

// ============================================
// TASK 7: CANVAS COLOR PICKER
// ============================================

function setupPicker() {
  // Already set up in renderImage, but re-initialize
  DOM.pickerCanvas.addEventListener('click', (e) => {
    const rect = DOM.pickerCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pixelData = DOM.ctx.getImageData(x, y, 1, 1).data;
    const r = pixelData[0];
    const g = pixelData[1];
    const b = pixelData[2];
    const a = pixelData[3];

    if (a >= 128) {
      const hex = rgbToHex(r, g, b);
      addPickedColor({ r, g, b, hex });
      showToast(`Picked: ${hex}`, 'info');
    }
  });

  // Clear picks
  document.getElementById('pickerClearBtn').addEventListener('click', () => {
    DOM.pickedColors.innerHTML = '';
    showToast('Color picks cleared', 'info');
  });

  // Add to palette
  document.getElementById('pickerAddToPaletteBtn').addEventListener('click', () => {
    const swatches = DOM.pickedColors.querySelectorAll('.color-swatch-tiny');
    if (swatches.length > 0) {
      const first = swatches[0];
      addColorToPalette(
        parseInt(first.dataset.r),
        parseInt(first.dataset.g),
        parseInt(first.dataset.b),
        first.dataset.hex
      );
      DOM.pickedColors.innerHTML = '';
      showToast('Colors added to palette', 'success');
    }
  });
}

// ============================================
// TASK 8: PALETTE LIBRARY
// ============================================

function setupLibrary() {
  // Save current
  DOM.saveCurrentBtn.addEventListener('click', () => {
    showSaveModal('save');
  });

  // Import
  DOM.importBtn.addEventListener('click', () => {
    showSaveModal('import');
  });

  // Search filtering
  DOM.librarySearch.addEventListener('input', filterLibrary);

  // Initial render
  renderLibrary();
}

function renderLibrary() {
  const container = DOM.libraryList;
  container.innerHTML = '';

  if (state.savedPalettes.length === 0) {
    container.innerHTML = `
      <div style="color: var(--fg-subtle); padding: 2rem; text-align: center;">
        No saved palettes yet
      </div>`;
    document.getElementById('libraryCount').textContent = '0';
    return;
  }

  document.getElementById('libraryCount').textContent = state.savedPalettes.length;

  state.savedPalettes.slice(0, 15).forEach((palette, idx) => {
    const item = document.createElement('div');
    item.className = 'library-item';
    item.dataset.index = idx;

    // Thumbnail of colors
    const thumbnailColors = palette.colors.slice(0, 5).map(c => `
      <div class="color-swatch-tiny" style="background: ${c.hex}"></div>
    `).join('');

    item.innerHTML = `
      <div class="library-palette">${thumbnailColors}</div>
      <div class="library-meta">
        <div class="library-name">${palette.name || `Palette ${idx + 1}`}</div>
        <div class="library-meta-info">${palette.colors.length} colors • ${palette.scheme || 'extracted'}</div>
      </div>
      <div class="library-actions">
        <button class="btn btn-secondary btn-xs" data-action="load">Load</button>
        <button class="btn btn-secondary btn-xs" data-action="delete">Delete</button>
      </div>
    `;

    // Event listeners
    item.querySelector('[data-action="load"]').addEventListener('click', () => {
      loadPaletteFromLibrary(idx);
      hideSaveModal();
    });

    item.querySelector('[data-action="delete"]').addEventListener('click', () => {
      deletePaletteFromLibrary(idx);
    });

    container.appendChild(item);
  });
}

function filterLibrary() {
  const term = DOM.librarySearch.value.toLowerCase();
  const items = DOM.libraryList.querySelectorAll('.library-item');

  items.forEach(item => {
    const name = item.querySelector('.library-name').textContent.toLowerCase();
    const scheme = item.querySelector('.library-meta-info')?.textContent.toLowerCase();
    const match = name.includes(term) || scheme.includes(term);
    item.style.display = match ? 'flex' : 'none';
  });
}

function saveCurrentPaletteToLibrary(name, data) {
  const palette = {
    id: Date.now(),
    name: name || `Palette ${state.extractedColors.length} colors`,
    colors: state.extractedColors.map(c => ({
      r: c.r, g: c.g, b: c.b,
      hex: c.hex || rgbToHex(c.r, c.g, c.b)
    })),
    scheme: document.querySelector('.harmony-tab.active')?.dataset.harmony || 'extracted',
    baseColor: DOM.harmonyBaseColor.value,
    created: new Date().toISOString()
  };

  state.savedPalettes.unshift(palette);
  saveToStorage('savedPalettes', state.savedPalettes);
  renderLibrary();
  showToast(`Saved "${palette.name}" to library`, 'success');
}

function loadPaletteFromLibrary(index) {
  const palette = state.savedPalettes[index];
  if (!palette) return;

  // Add colors to extraction state
  palette.colors.forEach(c => {
    addColorToPalette(c.r, c.g, c.b, c.hex);
  });

  // Update main panel
  updateMainPalette();
  renderPaletteDisplay(state.extractedColors);

  showToast(`Loaded "${palette.name}"`, 'success');
}

function deletePaletteFromLibrary(index) {
  if (confirm('Delete this palette from library?')) {
    state.savedPalettes.splice(index, 1);
    saveToStorage('savedPalettes', state.savedPalettes);
    renderLibrary();
    showToast('Palette deleted', 'info');
  }
}

function showSaveModal(type = 'save') {
  const modal = type === 'save' ? document.getElementById('saveModal') : document.getElementById('importModal');
  modal.classList.add('visible');
  if (type === 'save') {
    document.getElementById('savePaletteName').value = '';
    document.getElementById('savePaletteTags').value = '';
  } else {
    document.getElementById('importData').value = '';
  }
}

function hideSaveModal() {
  ['saveModal', 'importModal', 'contrastSaveModal'].forEach(id => {
    document.getElementById(id).classList.remove('visible');
  });
}

function importPaletteFromData(data) {
  try {
    let parsed;
    try { parsed = JSON.parse(data); } catch { parsed = null; }

    if (parsed && parsed.colors) {
      // Full palette format
      parsed.colors.forEach(c => {
        addColorToPalette(c.r, c.g, c.b, c.hex);
      });
      showToast('Palette imported', 'success');
    } else if (parsed && parsed.url) {
      // Share URL format - decode
      showToast('URL import not yet supported in this version', 'info');
    } else {
      showToast('Could not parse imported data', 'error');
    }
  } catch (e) {
    showToast('Import error: ' + e.message, 'error');
  }
  hideSaveModal();
}

// ============================================
// TASK 9: WCAG CONTRAST CHECKER
// ============================================

function setupContrastChecker() {
  // Color inputs
  DOM.contrastFg.addEventListener('input', updateContrast);
  DOM.contrastBg.addEventListener('input', updateContrast);

  // Swatches
  DOM.contrastFgSwatch.addEventListener('click', () => DOM.contrastFg.click());
  DOM.contrastBgSwatch.addEventListener('click', () => DOM.contrastBg.click());

  // Swap colors
  document.getElementById('contrastSwapBtn').addEventListener('click', () => {
    const tempHex = DOM.contrastFg.value;
    DOM.contrastFg.value = DOM.contrastBg.value;
    DOM.contrastBg.value = tempHex;
    DOM.contrastFgSwatch.style.background = DOM.contrastBgSwatch.style.background;
    DOM.contrastBgSwatch.style.background = `rgb(${tempHex})`;
    updateContrast();
  });

  // Save pair
  document.getElementById('contrastSaveBtn').addEventListener('click', () => {
    showContrastSaveModal();
  });

  // Add palette colors to contrast testing
  document.getElementById('contrastPaletteColors').addEventListener('click', (e) => {
    const swatch = e.target.closest('.color-swatch-tiny');
    if (swatch) {
      const hex = swatch.style.background;
      const rgb = hexToRgb(hex);
      if (rgb) {
        // Set as foreground
        DOM.contrastFg.value = hex;
        DOM.contrastFgSwatch.style.background = hex;
        updateContrast();
      }
    }
  });

  // Initial update
  updateContrast();
}

function calculateContrast(fgR, fgG, fgB, bgR, bgG, bgB) {
  // Relative luminance calculation (WCAG 2.1)
  function luminance(r, g, b) {
    const [R, G, B] = [r, g, b].map(v => {
      const vn = v / 255;
      return vn <= 0.03928 ? vn / 12.92 : Math.pow((vn + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  const L1 = luminance(fgR, fgG, fgB);
  const L2 = luminance(bgR, bgG, bgB);
  const lightL = Math.max(L1, L2);
  const darkL = Math.min(L1, L2);

  // Contrast ratio
  const ratio = (lightL + 0.05) / (darkL + 0.05);

  // WCAG classification
  let rating = 'fail';
  let aa = '—';
  let aaA = '—';
  let aaLarge = '—';

  if (ratio >= 4.5) {
    rating = 'AA';
    aa = ratio.toFixed(2);
    if (ratio >= 7.0) {
      rating = 'AAA';
      aaA = ratio.toFixed(2);
      if (ratio >= 3.0 && document.documentElement.clientWidth < 768) {
        aaLarge = ratio.toFixed(2); // Large text at 3:1
      }
    }
  }

  return { ratio: ratio.toFixed(2), rating, aa, aaA, aaLarge };
}

function updateContrast() {
  const fgHex = DOM.contrastFg.value;
  const bgHex = DOM.contrastBg.value;

  const fgRgb = hexToRgb(fgHex) || { r: 255, g: 255, b: 255 };
  const bgRgb = hexToRgb(bgHex) || { r: 13, g: 13, b: 18 };

  const result = calculateContrast(fgRgb.r, fgRgb.g, fgRgb.b, bgRgb.r, bgRgb.g, bgRgb.b);

  // Update DOM
  document.getElementById('contrastRatio').textContent = result.ratio;
  document.getElementById('contrastRating').textContent = result.rating;

  document.getElementById('contrastAA').textContent = result.aa;
  document.getElementById('contrastAAA').textContent = result.aaA;
  document.getElementById('contrastAALarge').textContent = result.aaLarge;

  // Update rating class
  const ratingEl = document.getElementById('contrastRating');
  ratingEl.className = 'contrast-rating';
  if (result.rating === 'AAA') ratingEl.classList.add('aaa');
  else if (result.rating === 'AA') ratingEl.classList.add('aa');
  else if (result.rating === 'AA Large') ratingEl.classList.add('aa-large');
  else ratingEl.classList.add('fail');

  // Update background contrast ratio visual
  const bgStyle = `linear-gradient(135deg, ${fgHex}, ${bgHex})`;
  document.getElementById('contrastResult').style.background = bgStyle;

  // Show/hide large text note
  const aaLarge = document.getElementById('contrastAALarge');
  if (result.rating === 'AAA') {
    aaLarge.parentElement.style.display = 'block';
  } else {
    aaLarge.parentElement.style.display = 'none';
  }

  showToast(`Contrast: ${result.ratio} (${result.rating})`, 'info');
}

// ============================================
// TASK 10: RANDOM PALETTE GENERATOR
// ============================================

function setupRandomGenerator() {
  // Generate button
  DOM.randomGenerateBtn.addEventListener('click', generateRandomPalette);

  // Copy seed
  document.getElementById('randomCopySeedBtn').addEventListener('click', () => {
    copyToClipboard(document.getElementById('randomSeed'));
  });

  // Toggle constraints
  document.getElementById('randomDistinct').addEventListener('change', () => {
    DOM.randomHarmonyField.hidden = !DOM.randomDistinct.checked;
  });

  document.getElementById('randomHarmony').addEventListener('change', () => {
    DOM.randomHarmonyField.hidden = !DOM.randomHarmony.checked;
  });

  // Initial
  document.getElementById('randomCount').value = '6';
  generateRandomPalette();
}

function generateRandomPalette() {
  const count = parseInt(DOM.randomCount.value) || 6;
  const hueMin = parseInt(DOM.randomHueMin.value) || 0;
  const hueMax = parseInt(DOM.randomHueMax.value) || 360;
  const satMin = parseInt(DOM.randomSatMin.value) || 40;
  const satMax = parseInt(DOM.randomSatMax.value) || 100;
  const lightMin = parseInt(DOM.randomLightMin.value) || 30;
  const lightMax = parseInt(DOM.randomLightMax.value) || 80;
  const distinct = DOM.randomDistinct.checked;
  const harmony = DOM.randomHarmony.checked;

  let colors;

  if (harmony) {
    const harmonyType = DOM.randomHarmonyType.value;
    const baseHue = Math.floor(Math.random() * (hueMax - hueMin + 1)) + hueMin;
    colors = getHarmonicColorsFromHue(baseHue, harmonyType, count, satMin, satMax, lightMin, lightMax);
  } else {
    colors = generateRandomColors(count, hueMin, hueMax, satMin, satMax, lightMin, lightMax, distinct);
  }

  renderRandomPalette(colors);

  // Update seed display
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  document.getElementById('randomSeed').textContent = seed;
  state.randomSeed = seed;
}

function generateRandomColors(count, hueMin, hueMax, satMin, satMax, lightMin, lightMax, distinct) {
  const colors = [];
  const seen = new Set();

  for (let i = 0; i < count; i++) {
    let { r, g, b } = randomColorInRange(hueMin, hueMax, satMin, satMax, lightMin, lightMax);

    if (distinct) {
      const key = `${r},${g},${b}`;
      if (seen.has(key)) {
        i--; // retry
        continue;
      }
      seen.add(key);
    }

    const hex = rgbToHex(r, g, b);
    colors.push({ r, g, b, hex });

    // Skip if we've already generated enough unique colors
    if (colors.length >= count) break;
  }

  return colors;
}

function randomColorInRange(hueMin, hueMax, satMin, satMax, lightMin, lightMax) {
  // Generate HSL color in specified ranges, then convert to RGB
  const hue = Math.random() * (hueMax - hueMin) + hueMin;
  const saturation = Math.random() * (satMax - satMin) + satMin;
  const lightness = Math.random() * (lightMax - lightMin) + lightMin;

  const hsl = { h: hue, s: saturation, l: lightness };
  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);

  return { r: rgb.r, g: rgb.g, b: rgb.b };
}

function getHarmonicColorsFromHue(baseHue, type, count, satMin, satMax, lightMin, lightMax) {
  const colors = [];

  for (let i = 0; i < count; i++) {
    let hue = baseHue;

    switch (type) {
      case 'complementary':
        hue = (baseHue + 180) % 360;
        break;
      case 'triadic':
        hue = (baseHue + 120 * (i % 3)) % 360;
        break;
      case 'analogous':
        hue = (baseHue + (i - 1) * 30 + 360) % 360;
        break;
      case 'monochromatic':
        // Vary lightness/saturation, keep same hue
        const lightness = Math.max(lightMin, Math.min(lightMax, lightMin + (i * (lightMax - lightMin) / (count - 1 || 1))));
        const saturation = Math.max(satMin, Math.min(satMax, satMax - i * 15));
        colors.push({ h: hue, s: saturation, l: lightness });
        continue;
      case 'square':
        hue = (baseHue + 90 * i) % 360;
        break;
      default:
        hue = (baseHue + 180 * i) % 360;
    }

    const saturation = Math.max(satMin, Math.min(satMax, satMin + Math.random() * (satMax - satMin)));
    const lightness = Math.max(lightMin, Math.min(lightMax, lightMin + Math.random() * (lightMax - lightMin)));

    colors.push({ h: hue, s: saturation, l: lightness });
  }

  // Convert to RGB
  return colors.map(c => {
    const rgb = hslToRgb(c.h, c.s, c.l);
    return { r: rgb.r, g: rgb.g, b: rgb.b, hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
  });
}

function renderRandomPalette(colors) {
  const container = DOM.randomPalette;
  container.innerHTML = '';

  if (colors.length === 0) {
    container.innerHTML = '<p class="muted" style="color: var(--fg-subtle);">Generate a palette first</p>';
    return;
  }

  colors.slice(0, 12).forEach((color, index) => {
    const colorEl = document.createElement('div');
    colorEl.className = 'color-swatch color-swatch-tiny';
    colorEl.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    colorEl.title = `${color.hex} • RGB(${color.r}, ${color.g}, ${color.b})`;

    colorEl.addEventListener('click', () => {
      addColorToPalette(color.r, color.g, color.b, color.hex);
      updateMainPalette();
    });

    container.appendChild(colorEl);
  });
}

// ============================================
// UTILITY: Copy to clipboard
// ============================================

function copyToClipboard(element) {
  const text = element.value || element.textContent;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard', 'success');
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied to clipboard', 'success');
  });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  // Set up all task interfaces
  setupImageUpload();
  setupHarmony();
  setupColorSpaces();
  setupExportCss();
  setupExportJson();
  setupShare();
  setupPicker();
  setupLibrary();
  setupContrastChecker();
  setupRandomGenerator();

  // Initialize with welcome state
  document.getElementById('extractionStats').hidden = true;
  document.getElementById('mainPanel').hidden = true;

  // Set up main panel color space tabs
  DOM.mainColorspaceTabs.querySelectorAll('.colorspace-tab').forEach((tab, i) => {
    tab.addEventListener('click', () => {
      DOM.mainColorspaceTabs.querySelectorAll('.colorspace-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      DOM.mainColorspaceTabs.querySelectorAll('.colorspace-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`cs-${tab.dataset.mainSpace}`).classList.add('active');
    });
  });

  // Initial color space update
  updateColorSpaces();

  showToast('Palette Extractor v2.0 loaded — all 10 tasks ready', 'info');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}