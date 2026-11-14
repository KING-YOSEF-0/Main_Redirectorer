const ColorPaletteExtractor = (() => {
  let imageData = null;
  let extractedColors = [];
  let originalImage = null;

  const elements = {};

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
  }

  function cacheElements() {
    elements.dropZone = document.getElementById('drop-zone');
    elements.imageFile = document.getElementById('image-file');
    elements.imagePreview = document.getElementById('image-preview');
    elements.previewImg = document.getElementById('preview-img');
    elements.btnRemoveImage = document.getElementById('btn-remove-image');
    elements.colorCount = document.getElementById('color-count');
    elements.colorCountValue = document.getElementById('color-count-value');
    elements.sortMode = document.getElementById('sort-mode');
    elements.quality = document.getElementById('quality');
    elements.optionTransparent = document.getElementById('option-include-transparent');
    elements.optionShowHex = document.getElementById('option-show-hex');
    elements.optionShowRgb = document.getElementById('option-show-rgb');
    elements.btnExtract = document.getElementById('btn-extract');
    elements.btnGenerateHarmony = document.getElementById('btn-generate-harmony');
    elements.paletteContainer = document.getElementById('palette-container');
    elements.emptyState = document.getElementById('empty-state');
    elements.paletteCount = document.getElementById('palette-count');
    elements.paletteTime = document.getElementById('palette-time');
    elements.paletteSwatches = document.getElementById('palette-swatches');
    elements.harmonyContainer = document.getElementById('harmony-container');
    elements.btnCopyAll = document.getElementById('btn-copy-all');
    elements.btnExportCss = document.getElementById('btn-export-css');
    elements.btnExportScss = document.getElementById('btn-export-scss');
    elements.btnExportTailwind = document.getElementById('btn-export-tailwind');
    elements.btnExportJson = document.getElementById('btn-export-json');
    elements.btnExportAse = document.getElementById('btn-export-ase');
    elements.btnExportPng = document.getElementById('btn-export-png');
  }

  function bindEvents() {
    // Drop zone events
    elements.dropZone.addEventListener('click', () => elements.imageFile.click());
    elements.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.dropZone.classList.add('dragover');
    });
    elements.dropZone.addEventListener('dragleave', () => elements.dropZone.classList.remove('dragover'));
    elements.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    elements.imageFile.addEventListener('change', (e) => {
      if (e.target.files.length) handleFile(e.target.files[0]);
      e.target.value = '';
    });

    elements.btnRemoveImage.addEventListener('click', removeImage);
    elements.colorCount.addEventListener('input', () => {
      elements.colorCountValue.textContent = elements.colorCount.value;
    });
    elements.btnExtract.addEventListener('click', extractPalette);
    elements.btnGenerateHarmony.addEventListener('click', generateHarmony);

    // Export buttons
    elements.btnCopyAll.addEventListener('click', copyAllHex);
    elements.btnExportCss.addEventListener('click', () => exportPalette('css'));
    elements.btnExportScss.addEventListener('click', () => exportPalette('scss'));
    elements.btnExportTailwind.addEventListener('click', () => exportPalette('tailwind'));
    elements.btnExportJson.addEventListener('click', () => exportPalette('json'));
    elements.btnExportAse.addEventListener('click', () => exportPalette('ase'));
    elements.btnExportPng.addEventListener('click', () => exportPalette('png'));

    // Sort mode change
    elements.sortMode.addEventListener('change', () => {
      if (extractedColors.length) {
        sortColors();
        renderPalette();
      }
    });
  }

  function startBubbles() {
    const container = document.getElementById('bubbles');
    const colors = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)'];

    function spawn() {
      const bubble = document.createElement('div');
      bubble.className = 'float';
      const size = Math.random() * 60 + 20;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const duration = Math.random() * 20 + 15;
      const dx = (Math.random() - 0.5) * 200;

      bubble.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        --c: ${color};
        --duration: ${duration}s;
        --dx: ${dx}px;
      `;
      container.appendChild(bubble);
      setTimeout(() => bubble.remove(), duration * 1000);
    }

    setInterval(spawn, 800);
    for (let i = 0; i < 8; i++) setTimeout(spawn, i * 200);
  }

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File too large (max 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        showPreview(img);
        elements.btnExtract.disabled = false;
        elements.btnGenerateHarmony.disabled = false;
        showToast('Image loaded');
      };
      img.onerror = () => showToast('Failed to load image');
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function showPreview(img) {
    elements.previewImg.src = img.src;
    elements.dropZone.hidden = true;
    elements.imagePreview.hidden = false;
    elements.emptyState.hidden = true;
    elements.paletteContainer.hidden = true;
  }

  function removeImage() {
    originalImage = null;
    imageData = null;
    extractedColors = [];
    elements.dropZone.hidden = false;
    elements.imagePreview.hidden = true;
    elements.paletteContainer.hidden = true;
    elements.emptyState.hidden = false;
    elements.btnExtract.disabled = true;
    elements.btnGenerateHarmony.disabled = true;
    elements.harmonyContainer.innerHTML = '';
  }

  function extractPalette() {
    if (!originalImage) return;

    const startTime = performance.now();
    const colorCount = parseInt(elements.colorCount.value);
    const quality = elements.quality.value;

    // Create canvas to extract pixel data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Scale based on quality
    let scale = 1;
    if (quality === 'fast') scale = 0.25;
    else if (quality === 'balanced') scale = 0.5;

    const maxDim = 200;
    let w = originalImage.width * scale;
    let h = originalImage.height * scale;
    if (w > maxDim || h > maxDim) {
      const factor = maxDim / Math.max(w, h);
      w *= factor;
      h *= factor;
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(originalImage, 0, 0, w, h);

    try {
      imageData = ctx.getImageData(0, 0, w, h);
    } catch (e) {
      showToast('Cannot extract colors (CORS issue). Try a local image.');
      return;
    }

    // Extract pixels
    const pixels = [];
    const data = imageData.data;
    const includeTransparent = elements.optionTransparent.checked;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (!includeTransparent && a < 128) continue;
      pixels.push([r, g, b]);
    }

    if (pixels.length === 0) {
      showToast('No opaque pixels found');
      return;
    }

    // K-means clustering
    extractedColors = kmeans(pixels, colorCount);
    sortColors();
    renderPalette();

    const elapsed = (performance.now() - startTime).toFixed(0);
    elements.paletteTime.textContent = `Extracted in ${elapsed}ms`;

    elements.paletteContainer.hidden = false;
    elements.emptyState.hidden = true;
    showToast(`Extracted ${extractedColors.length} colors`);
  }

  // K-means clustering implementation
  function kmeans(pixels, k) {
    // Initialize centroids using k-means++
    const centroids = [];
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);

    for (let i = 1; i < k; i++) {
      const distances = pixels.map(p => {
        let minDist = Infinity;
        for (const c of centroids) {
          const d = colorDistance(p, c);
          if (d < minDist) minDist = d;
        }
        return minDist * minDist;
      });

      const total = distances.reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;
      for (let j = 0; j < pixels.length; j++) {
        rand -= distances[j];
        if (rand <= 0) {
          centroids.push(pixels[j]);
          break;
        }
      }
    }

    // Iterate
    let assignments = new Array(pixels.length);
    let changed = true;
    let iterations = 0;
    const maxIterations = quality === 'fast' ? 5 : quality === 'balanced' ? 10 : 20;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      // Assign points to nearest centroid
      for (let i = 0; i < pixels.length; i++) {
        let minDist = Infinity;
        let bestIdx = 0;
        for (let j = 0; j < centroids.length; j++) {
          const d = colorDistance(pixels[i], centroids[j]);
          if (d < minDist) {
            minDist = d;
            bestIdx = j;
          }
        }
        if (assignments[i] !== bestIdx) {
          assignments[i] = bestIdx;
          changed = true;
        }
      }

      // Update centroids
      const newCentroids = Array(k).fill(null).map(() => [0, 0, 0]);
      const counts = Array(k).fill(0);

      for (let i = 0; i < pixels.length; i++) {
        const idx = assignments[i];
        newCentroids[idx][0] += pixels[i][0];
        newCentroids[idx][1] += pixels[i][1];
        newCentroids[idx][2] += pixels[i][2];
        counts[idx]++;
      }

      for (let j = 0; j < k; j++) {
        if (counts[j] > 0) {
          centroids[j][0] = Math.round(newCentroids[j][0] / counts[j]);
          centroids[j][1] = Math.round(newCentroids[j][1] / counts[j]);
          centroids[j][2] = Math.round(newCentroids[j][2] / counts[j]);
        }
      }
    }

    // Calculate percentages
    const counts = Array(k).fill(0);
    for (const idx of assignments) counts[idx]++;

    return centroids.map((color, i) => ({
      r: color[0], g: color[1], b: color[2],
      percent: (counts[i] / pixels.length * 100).toFixed(2)
    }));
  }

  function colorDistance(c1, c2) {
    // Euclidean distance in RGB space
    const dr = c1[0] - c2[0];
    const dg = c1[1] - c2[1];
    const db = c1[2] - c2[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function sortColors() {
    const mode = elements.sortMode.value;

    extractedColors.sort((a, b) => {
      switch (mode) {
        case 'frequency':
          return b.percent - a.percent;
        case 'luminance': {
          const lumA = 0.2126 * a.r + 0.7152 * a.g + 0.0722 * b.b;
          const lumB = 0.2126 * b.r + 0.7152 * b.g + 0.0722 * b.b;
          return lumA - lumB;
        }
        case 'hue': {
          const hueA = rgbToHue(a.r, a.g, a.b);
          const hueB = rgbToHue(b.r, b.g, b.b);
          return hueA - hueB;
        }
        case 'saturation': {
          const satA = rgbToSaturation(a.r, a.g, a.b);
          const satB = rgbToSaturation(b.r, b.g, b.b);
          return satB - satA;
        }
      }
      return 0;
    });
  }

  function rgbToHue(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
      if (max === r) h = (g - b) / (max - min);
      else if (max === g) h = 2 + (b - r) / (max - min);
      else h = 4 + (r - g) / (max - min);
      h *= 60;
      if (h < 0) h += 360;
    }
    return h;
  }

  function rgbToSaturation(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max === 0) return 0;
    return (max - min) / max;
  }

  function renderPalette() {
    elements.paletteCount.textContent = `${extractedColors.length} colors extracted`;
    elements.paletteSwatches.innerHTML = '';

    extractedColors.forEach((color, index) => {
      const hex = rgbToHex(color.r, color.g, color.b);
      const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;

      const swatch = document.createElement('div');
      swatch.className = 'swatch';
      swatch.dataset.index = index;
      swatch.innerHTML = `
        <div class="swatch-color" style="background: ${hex}"></div>
        <div class="swatch-info">
          <div class="swatch-index">#${index + 1}</div>
          ${elements.optionShowHex.checked ? `<div class="swatch-hex">${hex}</div>` : ''}
          ${elements.optionShowRgb.checked ? `<div class="swatch-rgb">${rgb}</div>` : ''}
          <div class="swatch-percent">${color.percent}%</div>
        </div>
      `;

      swatch.addEventListener('click', () => copyColor(hex, swatch));
      elements.paletteSwatches.appendChild(swatch);
    });
  }

  function copyColor(hex, swatch) {
    navigator.clipboard.writeText(hex).then(() => {
      swatch.classList.add('copied');
      setTimeout(() => swatch.classList.remove('copied'), 1500);
      showToast(`Copied ${hex}`);
    });
  }

  function copyAllHex() {
    const hexes = extractedColors.map(c => rgbToHex(c.r, c.g, c.b)).join('\n');
    navigator.clipboard.writeText(hexes).then(() => showToast('All hex values copied'));
  }

  function generateHarmony() {
    if (extractedColors.length === 0) return;

    // Use the dominant color as base
    const base = extractedColors[0];
    const baseHue = rgbToHue(base.r, base.g, base.b);

    const harmonies = {
      'Complementary': [baseHue, (baseHue + 180) % 360],
      'Triadic': [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360],
      'Analogous': [baseHue, (baseHue + 30) % 360, (baseHue - 30 + 360) % 360, (baseHue + 60) % 360, (baseHue - 60 + 360) % 360],
      'Split Complementary': [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360],
      'Tetradic': [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360],
      'Square': [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360],
      'Monochromatic': [
        baseHue,
        baseHue, baseHue, baseHue, baseHue
      ].map((h, i) => h)
    };

    // For monochromatic, vary saturation/lightness
    const monoColors = [
      hslToRgb(baseHue, 0.9, 0.2),
      hslToRgb(baseHue, 0.7, 0.4),
      hslToRgb(baseHue, 0.5, 0.6),
      hslToRgb(baseHue, 0.3, 0.8),
      hslToRgb(baseHue, 0.1, 0.95)
    ];

    elements.harmonyContainer.innerHTML = '';

    Object.entries(harmonies).forEach(([name, hues]) => {
      const group = document.createElement('div');
      group.className = 'harmony-group';
      let colors = hues.map(h => hslToRgb(h, 0.6, 0.5));

      if (name === 'Monochromatic') colors = monoColors;

      group.innerHTML = `
        <h4>${name}</h4>
        <div class="harmony-swatches">
          ${colors.map(([r, g, b]) => {
            const hex = rgbToHex(r, g, b);
            return `<div class="harmony-swatch" style="background: ${hex}" data-hex="${hex}" title="${hex}"></div>`;
          }).join('')}
        </div>
      `;

      group.querySelectorAll('.harmony-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => copyColor(swatch.dataset.hex, swatch));
      });

      elements.harmonyContainer.appendChild(group);
    });

    showToast('Harmonies generated');
  }

  function hslToRgb(h, s, l) {
    h /= 360;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function exportPalette(format) {
    if (extractedColors.length === 0) {
      showToast('No palette to export');
      return;
    }

    let content = '';
    let filename = '';
    let mime = 'text/plain';

    const colors = extractedColors.map(c => ({
      hex: rgbToHex(c.r, c.g, c.b),
      rgb: [c.r, c.g, c.b],
      percent: parseFloat(c.percent)
    }));

    switch (format) {
      case 'css':
        content = colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n');
        content = `:root {\n${content}\n}`;
        filename = 'palette.css';
        mime = 'text/css';
        break;

      case 'scss':
        content = '$palette: (\n' + colors.map((c, i) => `  "color-${i + 1}": ${c.hex}`).join(',\n') + '\n);';
        filename = 'palette.scss';
        mime = 'text/x-scss';
        break;

      case 'tailwind':
        content = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n';
        content += colors.map((c, i) => `        'color-${i + 1}': '${c.hex}',`).join('\n');
        content += '\n      }\n    }\n  }\n};';
        filename = 'tailwind.colors.js';
        mime = 'application/javascript';
        break;

      case 'json':
        content = JSON.stringify({
          extracted: new Date().toISOString(),
          colorCount: colors.length,
          colors: colors.map(c => ({ hex: c.hex, rgb: c.rgb, percentage: c.percent }))
        }, null, 2);
        filename = 'palette.json';
        mime = 'application/json';
        break;

      case 'ase':
        // Adobe Swatch Exchange format (simplified binary)
        content = generateASE(colors);
        filename = 'palette.ase';
        mime = 'application/octet-stream';
        break;

      case 'png':
        exportPNGSwatches(colors);
        return;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename}`);
  }

  function generateASE(colors) {
    // ASE file format (simplified - creates a basic valid ASE file)
    // This is a minimal implementation
    const buffer = new ArrayBuffer(1000);
    const view = new DataView(buffer);
    let offset = 0;

    // Signature "ASEF"
    view.setUint8(offset++, 0x41); // A
    view.setUint8(offset++, 0x53); // S
    view.setUint8(offset++, 0x45); // E
    view.setUint8(offset++, 0x46); // F

    // Version
    view.setUint16(offset, 1, false); offset += 2; // major
    view.setUint16(offset, 0, false); offset += 2; // minor

    // Number of blocks
    view.setUint32(offset, colors.length, false); offset += 4;

    colors.forEach((c, i) => {
      // Block type: 0x0001 = Color
      view.setUint16(offset, 0x0001, false); offset += 2;

      // Name length (null-terminated UTF-16)
      const name = `Color ${i + 1}`;
      const nameBytes = new TextEncoder().encode(name);
      view.setUint32(offset, (name.length + 1) * 2, false); offset += 4;

      // Name (UTF-16BE)
      for (let j = 0; j < name.length; j++) {
        view.setUint16(offset, name.charCodeAt(j), false); offset += 2;
      }
      view.setUint16(offset, 0, false); offset += 2; // null terminator

      // Color model: "RGB"
      view.setUint8(offset++, 0x52); // R
      view.setUint8(offset++, 0x47); // G
      view.setUint8(offset++, 0x42); // B

      // RGB values (4 bytes each, float32)
      view.setFloat32(offset, c.rgb[0] / 255, false); offset += 4;
      view.setFloat32(offset, c.rgb[1] / 255, false); offset += 4;
      view.setFloat32(offset, c.rgb[2] / 255, false); offset += 4;

      // Color type: 0 = global
      view.setUint16(offset, 0, false); offset += 2;
    });

    return new Uint8Array(buffer, 0, offset);
  }

  function exportPNGSwatches(colors) {
    const swatchSize = 100;
    const gap = 10;
    const cols = Math.min(5, colors.length);
    const rows = Math.ceil(colors.length / cols);
    const canvas = document.createElement('canvas');
    canvas.width = cols * swatchSize + (cols + 1) * gap;
    canvas.height = rows * (swatchSize + 30) + (rows + 1) * gap;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0f0f14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    colors.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = gap + col * (swatchSize + gap);
      const y = gap + row * (swatchSize + gap + 30);

      // Swatch
      ctx.fillStyle = c.hex;
      ctx.fillRect(x, y, swatchSize, swatchSize);

      // Label
      ctx.fillStyle = '#f5f5f7';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.hex, x + swatchSize / 2, y + swatchSize + 20);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${c.percent}%`, x + swatchSize / 2, y + swatchSize + 35);
    });

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'palette-swatches.png';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported palette-swatches.png');
    }, 'image/png');
  }

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();