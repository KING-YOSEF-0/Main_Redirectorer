// Color Palette Extractor - Extract and analyze colors from images
// Features: Upload images, extract dominant colors using various algorithms, generate harmony schemes
// Uses Canvas API for image processing, provides color theory insights

(() => {
  'use strict';

  // ============================================
  // SEEDED PRNG for consistent sampling
  // ============================================
  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ============================================
  // COLOR ALGORITHMS
  // ============================================
  function dominantColor(canvas, colorCount) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const colorMap = {};
    const visited = new Set();
    const samples = Math.min(10000, pixels.length / 4);

    // Sample pixels randomly
    for (let i = 0; i < samples; i++) {
      const idx = Math.floor(Math.random() * (pixels.length / 4)) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const key = `${r},${g},${b}`;
      if (!visited.has(key)) {
        visited.add(key);
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
    }

    // Sort by frequency
    const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
    const colors = [];
    const step = Math.max(1, Math.floor(sorted.length / colorCount));

    for (let i = 0; i < colorCount && i * step < sorted.length; i++) {
      const [rgb, count] = sorted[i * step];
      colors.push({ r: parseInt(rgb.split(',')[0]), g: parseInt(rgb.split(',')[1]), b: parseInt(rgb.split(',')[2]), count });
    }

    // If we don't have enough colors, add more from sorted list
    let colorIndex = 1;
    while (colors.length < colorCount && colorIndex < sorted.length) {
      const [rgb, count] = sorted[colorIndex];
      const [r, g, b] = rgb.split(',').map(Number);
      // Check if this color is close to existing ones (simple check)
      const isClose = colors.some(c => {
        const diff = Math.sqrt(Math.sqrt(r - c.r) ** 2 + Math.sqrt(g - c.g) ** 2 + Math.sqrt(b - c.b) ** 2);
        return diff < 20;
      });
      if (!isClose) {
        colors.push({ r, g, b, count });
      }
      colorIndex++;
    }

    return colors.slice(0, colorCount);
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b); const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) h = s = 0;
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function rgbToLab(r, g, b) {
    // Simplified Lab conversion
    const x = 0.4124 * r + 0.3576 * g + 0.1805 * b;
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const z = 0.0193 * r + 0.1192 * g + 1.0105 * b;
    const fx = x > 0.008856 ? Math.pow(x, 1/3) : 7.787 * x + 16/116;
    const fy = y > 0.008856 ? Math.pow(y, 1/3) : 7.787 * y + 16/116;
    const fz = z > 0.008856 ? Math.pow(z, 1/3) : 7.787 * z + 16/116;
    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const bVal = 200 * (fy - fz);
    return { L, a: a, b: bVal };
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function getHarmonicColors(baseColor, scheme = 'complementary', count = 3) {
    const { h, s, l } = rgbToHsl(baseColor.r, baseColor.g, baseColor.b);
    const colors = [];

    switch (scheme) {
      case 'complementary':
        for (let i = 0; i < count; i++) {
          const hue = (h + 180 * i) % 360;
          colors.push({ h: hue, s, l });
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
          const hue = (h - 30 + i * 30) % 360;
          colors.push({ h: hue, s: Math.max(30, s), l: Math.max(30, l) });
        }
        break;
      case 'monochromatic':
        for (let i = 0; i < count; i++) {
          const newS = s * (0.5 + i * 0.1);
          const newL = l * (0.8 - i * 0.1);
          colors.push({ h, s: Math.min(100, newS), l: Math.min(100, newL) });
        }
        break;
      case 'square':
        for (let i = 0; i < count; i++) {
          const hue = (h + 90 * i) % 360;
          colors.push({ h: hue, s, l });
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
      const h = c.h / 360; const s = c.s / 100; const l = c.l / 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => {
        const k = (n + h * 12) % 12;
        const color = l - a * Math.max(0, Math.min(4, Math.min(k - 3, 9 - k), 1));
        return Math.round(color * 255);
      };
      return { r: f(0), g: f(8), b: f(4) };
    });
  }

  function calculateColorSimilarity(color1, color2) {
    const lab1 = rgbToLab(color1.r, color1.g, color1.b);
    const lab2 = rgbToLab(color2.r, color2.g, color2.b);
    const deltaL = lab1.L - lab2.L;
    const deltaA = lab1.a - lab2.a;
    const deltaB = lab1.b - lab2.b;
    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
  }

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  let state = {
    image: null,
    canvas: null,
    colors: [],
    extractedColors: [],
    selectedScheme: null,
    harmonyScheme: null,
    colorSpace: 'hsl',
    colorCount: 5,
    source: null,
    file: null,
    webcam: null,
    stats: loadStats(),
    gameStatus: 'idle' // idle, extracting, viewing, sharing
  };

  function loadStats() {
    try {
      const saved = localStorage.getItem('paletteExtractorStats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      imagesProcessed: 0,
      avgColorsPerImage: 0,
      dominantThemes: [],
      recentPalettes: []
    };
  }

  function saveStats() {
    localStorage.setItem('paletteExtractorStats', JSON.stringify(state.stats));
  }

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const els = {
    imageUpload: document.getElementById('imageUpload'),
    dropZone: document.getElementById('dropZone'),
    imageUrl: document.getElementById('imageUrl'),
    captureBtn: document.getElementById('captureBtn'),
    webcam: document.getElementById('webcam'),
    switchCameraBtn: document.getElementById('switchCameraBtn'),
    newBtn: document.getElementById('newBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    sampleMultipleBtn: document.getElementById('sampleMultipleBtn'),
    playAgainBtnModal: document.getElementById('playAgainBtnModal'),
    shareBtnModal: document.getElementById('shareBtnModal'),
    extractBtn: document.getElementById('extractBtn'),
    clearBtn: document.getElementById('clearBtn'),
    colorCount: document.getElementById('colorCount'),
    colorSpace: document.getElementById('colorSpace'),
    displayTheme: document.getElementById('displayTheme'),
    previewArea: document.querySelector('.preview-area'),
    paletteDisplay: document.getElementById('paletteDisplay'),
    colorInfoPanel: document.getElementById('colorInfoPanel'),
    puzzleLabel: document.getElementById('puzzleLabel'),
    puzzleMeta: document.getElementById('puzzleMeta'),
    modalTitle: document.getElementById('modalTitle'),
    resultColorCount: document.getElementById('resultColorCount'),
    resultImageSize: document.getElementById('resultImageSize'),
    resultTheme: document.getElementById('resultTheme'),
    resultSimilarity: document.getElementById('resultSimilarity'),
    dailyResult: document.getElementById('dailyResult'),
    dailyMessage: document.getElementById('dailyMessage'),
    resultsModal: document.getElementById('resultsModal'),
    gameCompleteModal: document.getElementById('gameCompleteModal'),
    shareBtnModal: document.getElementById('shareBtnModal'),
    playAgainBtnModal: document.getElementById('playAgainBtnModal'),
    finalScore: document.getElementById('finalScore'),
    finalAvgDist: document.getElementById('finalAvgDist'),
    finalRounds: document.getElementById('finalRounds'),
    finalCountries: document.getElementById('finalCountries'),
    finalDailyResult: document.getElementById('finalDailyResult'),
    finalDailyMessage: document.getElementById('finalDailyMessage'),
    shareFinalBtn: document.getElementById('shareFinalBtn'),
    playAgainFinalBtn: document.getElementById('playAgainFinalBtn'),
    recentPalettes: document.getElementById('recentPalettes'),
    harmonySchemes: document.getElementById('harmonySchemes'),
    harmonySection: document.getElementById('harmonicSection')
  };

  // ============================================
  // EVENT HANDLERS
  // ============================================
  els.imageUpload.addEventListener('change', handleImageUpload);
  els.dropZone.addEventListener('click', () => els.imageUpload.click());
  els.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    els.dropZone.style.borderColor = 'var(--accent-4)';
  });
  els.dropZone.addEventListener('dragleave', () => {
    els.dropZone.style.borderColor = '';
  });
  els.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    els.dropZone.style.borderColor = '';
    const files = e.dataTransfer.files;
    if (files.length > 0) els.imageUpload.files = files;
  });

  els.extractBtn.addEventListener('click', extractPalette);
  els.clearBtn.addEventListener('click', clearImage);

  // Mode tabs
  document.querySelectorAll('[data-source]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-source]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('[id$="Options"]').forEach(el => el.hidden = true);
      document.getElementById(btn.dataset.source + 'Options').hidden = false;
      state.source = btn.dataset.source;
      els.webcam.style.display = btn.dataset.source === 'camera' ? 'block' : 'none';
    });
  });

  document.querySelectorAll('[data-sample]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sample]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ============================================
  // IMAGE HANDLING
  // ============================================
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    state.file = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.image = img;
        renderImageToCanvas();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderImageToCanvas() {
    if (!state.image) return;
    if (!state.canvas) {
      state.canvas = document.createElement('canvas');
      state.canvas.width = 800;
      state.canvas.height = 600;
    }
    const ctx = state.canvas.getContext('2d');
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    ctx.drawImage(state.image, 0, 0, state.canvas.width, state.canvas.height);
    els.previewArea.innerHTML = '';
    els.previewArea.appendChild(state.canvas);
    els.previewArea.classList.add('has-image');
  }

  function clearImage() {
    state.image = null;
    state.file = null;
    if (state.canvas) {
      const ctx = state.canvas.getContext('2d');
      ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    }
    els.previewArea.innerHTML = `
      <div class="preview-placeholder">
        <h3>Image Preview Area</h3>
        <p>Upload an image to generate color palettes</p>
      </div>
    `;
    els.previewArea.classList.remove('has-image');
    els.paletteDisplay.hidden = true;
    els.colorInfoPanel.hidden = true;
    els.puzzleMeta.textContent = 'Ready to extract';
  }

  async function extractPalette() {
    if (!state.canvas) return;
    els.extractBtn.disabled = true;
    els.extractBtn.innerHTML = '<span class="loading"></span> Extracting...';

    try {
      state.puzzleMeta.textContent = 'Extracting colors...';
      state.extractedColors = dominantColor(state.canvas, parseInt(els.colorCount.value));
      state.colors = state.extractedColors;

      // Update stats
      state.stats.imagesProcessed++;
      const totalColors = state.extractedColors.reduce((sum, c) => sum + c.count, 0);
      state.stats.avgColorsPerImage = ((state.stats.avgColorsPerImage * (state.stats.imagesProcessed - 1) + state.extractedColors.length) / state.stats.imagesProcessed);

      renderPaletteDisplay();
      updateStatsDisplay();

      // Update recent palettes
      state.stats.recentPalettes.unshift({
        colors: state.extractedColors,
        count: state.extractedColors.length,
        timestamp: Date.now()
      });
      if (state.stats.recentPalettes.length > 10) state.stats.recentPalettes = state.stats.recentPalettes.slice(0, 10);
      renderRecentPalettes();

      state.gameStatus = 'viewing';
      els.puzzleMeta.textContent = `${state.extractedColors.length} colors extracted`;

      // Show dominant theme
      const themes = calculateDominantThemes(state.extractedColors);
      document.getElementById('resultTheme').textContent = themes[0] || 'Neutral';
      document.getElementById('dailyMessage').textContent = `Dominant theme: ${themes[0] || 'Neutral'}`;
      els.dailyResult.hidden = false;

    } catch (e) {
      showToast('Error extracting palette:' + e.message);
    } finally {
      els.extractBtn.disabled = false;
      els.extractBtn.innerHTML = 'Extract Palette';
    }
  }

  function calculateDominantThemes(colors) {
    const themes = [];
    const totalCount = colors.reduce((sum, c) => sum + c.count, 0);

    colors.forEach(c => {
      const ratio = c.count / totalCount * 100;
      if (ratio > 20) themes.push(`${calculateColorTemperature(c.r, c.g, c.b)} ${Math.round(ratio)}%`);
      else if (ratio > 10) themes.push(`${calculateColorTemperature(c.r, c.g, c.b)} ${Math.round(ratio)}%`);
    });

    if (themes.length === 0) themes.push('Neutral mixed tones');
    return themes;
  }

  function calculateColorTemperature(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) return 'Neutral';

    const delta = max - min;
    let temp = 'Warm';

    if (r === max && g < b) temp = 'Warm Orange';
    else if (r === max && g >= b) temp = 'Warm Yellow';
    else if (g === max) temp = 'Cool Green';
    else if (b === max) temp = 'Cool Blue';

    return temp;
  }

  function renderPaletteDisplay() {
    const paletteContainer = document.getElementById('paletteDisplay');
    paletteContainer.innerHTML = '';

    state.colors.forEach((color, index) => {
      const colorBox = document.createElement('div');
      colorBox.className = 'palette-box';
      colorBox.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
      colorBox.dataset.index = index;
      colorBox.dataset.value = `${Math.round((color.count / Math.max(...state.colors.map(c => c.count)) * 100))}%`;
      colorBox.title = `rgb(${color.r}, ${color.g}, ${color.b}) - ${color.count} samples`;

      colorBox.addEventListener('click', () => selectColor(color, colorBox));

      paletteContainer.appendChild(colorBox);
    });

    // Generate harmony schemes using the first color
    if (state.colors.length > 0) {
      const baseColor = state.colors[0];
      const harmonyContainer = document.getElementById('harmonySchemes');
      harmonyContainer.innerHTML = '';

      ['complementary', 'triadic', 'analogous', 'monochromatic'].forEach(scheme => {
        const schemeColors = getHarmonicColors(baseColor, scheme, 3);
        const schemeBox = document.createElement('div');
        schemeBox.className = 'harmony-scheme';
        schemeBox.title = scheme.charAt(0).toUpperCase() + scheme.slice(1) + ' harmony';
        schemeBox.style.background = `linear-gradient(to right, ${schemeColors.map(c => `rgb(${c.r},${c.g},${c.b})`).join(', ')}`;

        schemeBox.addEventListener('click', () => selectHarmonyScheme(scheme, schemeColors));
        harmonyContainer.appendChild(schemeBox);
      });
    }

    els.paletteDisplay.hidden = false;
    els.paletteInfo.hidden = true;
  }

  function selectColor(color, element) {
    // Update color info panel
    const infoPanel = document.getElementById('colorInfoPanel');
    infoPanel.hidden = false;
    infoPanel.innerHTML = `
      <div class="color-info-row">
        <div class="color-swatch" style="background-color: rgb(${color.r},${color.g},${color.b})"></div>
        <div class="color-details">
          <strong>RGB(${color.r}, ${color.g}, ${color.b})</strong><br>
          <span class="mono">Hex: ${rgbToHex(color.r, color.g, color.b)}</span><br>
          <span class="mono">HSL: ${JSON.stringify(rgbToHsl(color.r, color.g, color.b))}</span><br>
          <span class="mono">Samples: ${color.count}</span>
        </div>
      </div>
    `;

    // Update harmony schemes selection
    document.querySelectorAll('.harmony-scheme').forEach(box => {
      box.classList.remove('selected');
    });

    state.colors.forEach((c, idx) => {
      const boxes = document.querySelectorAll('.palette-box');
      if (boxes[idx]) {
        boxes[idx].classList.toggle('selected', idx === state.colors.indexOf(color));
      }
    });
  }

  function selectHarmonyScheme(scheme, colors) {
    state.harmonyScheme = {
      scheme,
      colors,
      baseColor: state.colors[0]
    };

    document.querySelectorAll('.harmony-scheme').forEach((box, idx) => {
      box.classList.toggle('selected', idx === ['complementary', 'triadic', 'analogous', 'monochromatic'].indexOf(scheme));
    });

    renderHarmonyPalette();
  }

  function renderHarmonyPalette() {
    if (!state.harmonyScheme) return;

    const paletteContainer = document.getElementById('paletteSchemeList');
    paletteContainer.innerHTML = '';

    state.harmonyScheme.colors.forEach((color, index) => {
      const schemeBox = document.createElement('div');
      schemeBox.className = 'palette-scheme-box';
      schemeBox.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
      schemeBox.title = `rgb(${color.r}, ${color.g}, ${color.b})`;
      schemeBox.dataset.index = index;

      schemeBox.addEventListener('click', () => selectColor(color, schemeBox));
      paletteContainer.appendChild(schemeBox);
    });

    els.paletteInfo.hidden = false;
  }

  function updateStatsDisplay() {
    document.getElementById('imagesProcessed').textContent = state.stats.imagesProcessed;
    document.getElementById('avgColors').textContent = Math.round(state.stats.avgColorsPerImage) || '—';
    document.getElementById('dominantThemes').textContent = state.stats.dominantThemes.join(', ') || '—';
  }

  function renderRecentPalettes() {
    const container = document.getElementById('recentPalettes');
    container.innerHTML = state.stats.recentPalettes.map(palette => {
      const colors = palette.colors;
      return `
        <div class="leaderboard-entry">
          <span class="score">${palette.count} colors</span>
          <span class="mode">${colors.map(c => rgbToHex(c.r, c.g, c.b)).join(', ')}</span>
        </div>
      `;
    }).join('') || '<div class="leaderboard-entry"><span>No recent palettes</span></div>';
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function showError(msg) {
    showToast('Error: ' + msg);
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    updateStatsDisplay();
    renderRecentPalettes();

    // Set up mode tabs
    document.querySelector('[data-source="upload"]').click();

    // Set up sample tabs
    document.querySelector('[data-sample="dominant"]').click();

    // Show welcome message
    els.puzzleLabel.textContent = 'Color Palette Extractor';
    els.puzzleMeta.textContent = 'Upload an image to extract colors';

    // Add sample image for demonstration
    setTimeout(() => {
      const sampleImg = new Image();
      sampleImg.onload = () => {
        state.image = sampleImg;
        renderImageToCanvas();
        showToast('Welcome! Upload an image or use the sample above to get started.');
      };
      sampleImg.src = 'https://images.unsplash.com/photo-1500x600?auto=format&fit=crop&w=800&q=80';
    }, 1000);
  }

  init();
})();