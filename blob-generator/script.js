// Blob Generator - Complete with 10 Practical Tasks
// Vanilla JS, no frameworks, no build step
(function () {
  'use strict';

  // ============================================
  // PRESET PALETTES (10+ palettes)
  // ============================================

  const PALETTES = {
    aurora: ['#ff2d75', '#ff6b35', '#00e5a0', '#7c4dff', '#ffd700'],
    sunset: ['#ff2d75', '#ff9f1c', '#ff6b35', '#ff3d7f', '#ff8c42'],
    ocean: ['#35c3ff', '#2ee6a6', '#00b4d8', '#0077b6', '#023e8a'],
    forest: ['#2ee6a6', '#4ade80', '#22c55e', '#16a34a', '#15803d'],
    candy: ['#ff4fa3', '#ff9f1c', '#35c3ff', '#9b5cff', '#f472b6'],
    neon: ['#ff00ff', '#00ffff', '#ffff00', '#ff4fa3', '#35c3ff'],
    pastel: ['#fbcfe8', '#fde68a', '#bbf7d0', '#bfdbfe', '#e9d5ff'],
    mono: ['#1a1a2e', '#2d2d3f', '#3d3d5c', '#5a5a7a', '#8a8a9a'],
    vapor: ['#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'],
    cyber: ['#06b6d4', '#14b8a6', '#f472b6', '#a855f7', '#ef4444'],
    retro: ['#f97316', '#fbbf24', '#a3e635', '#22c55e', '#3b82f6'],
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const state = {
    mode: 'single',
    complexity: 8,
    smoothness: 0.5,
    variation: 0.3,
    rotation: 0,
    blobCount: 5,
    minSize: 30,
    maxSize: 80,
    overlap: 0.3,
    animSpeed: 1,
    morphIntensity: 0.4,
    autoRotate: true,
    rotationDirection: 1, // 1 = clockwise, -1 = counter-clockwise
    colorScheme: 'solid',
    solidColor: '#ff2d75',
    gradientType: 'linear',
    gradColor1: '#ff2d75',
    gradColor2: '#00e5a0',
    gradAngle: 45,
    multiColors: ['#ff2d75', '#ff6b35', '#00e5a0', '#7c4dff', '#ffd700'],
    presetPalette: 'aurora',
    size: 'square',
    customWidth: 500,
    customHeight: 500,
    background: 'transparent',
    bgColor: '#0a0a0f',
    uiTheme: 'dark',
    blobsGenerated: 0,
    svgExports: 0,
    pngExports: 0,
    blobPoints: [],
    blobs: [],
    animationFrame: null,
    animationTime: 0,
    isAnimating: false,
    isColliding: false,
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================

  const els = {};
  function cacheElements() {
    els.bubbles = document.getElementById('bubbles');
    els.modeTabs = document.querySelectorAll('.mode-tab');
    els.colorTabs = document.querySelectorAll('.color-tab');
    els.bgTabs = document.querySelectorAll('.bg-tab');
    els.sizeTabs = document.querySelectorAll('.size-tab');
    els.singleOptions = document.getElementById('singleOptions');
    els.multipleOptions = document.getElementById('multipleOptions');
    els.animatedOptions = document.getElementById('animatedOptions');
    els.solidColorOptions = document.getElementById('solidColorOptions');
    els.gradientColorOptions = document.getElementById('gradientColorOptions');
    els.multiColorOptions = document.getElementById('multiColorOptions');
    els.paletteColorOptions = document.getElementById('paletteColorOptions');
    els.customSizeOptions = document.getElementById('customSizeOptions');
    els.bgColorOptions = document.getElementById('bgColorOptions');
    els.complexity = document.getElementById('complexity');
    els.complexityValue = document.getElementById('complexityValue');
    els.smoothness = document.getElementById('smoothness');
    els.smoothnessValue = document.getElementById('smoothnessValue');
    els.variation = document.getElementById('variation');
    els.variationValue = document.getElementById('variationValue');
    els.rotation = document.getElementById('rotation');
    els.rotationValue = document.getElementById('rotationValue');
    els.blobCount = document.getElementById('blobCount');
    els.blobCountValue = document.getElementById('blobCountValue');
    els.minSize = document.getElementById('minSize');
    els.minSizeValue = document.getElementById('minSizeValue');
    els.maxSize = document.getElementById('maxSize');
    els.maxSizeValue = document.getElementById('maxSizeValue');
    els.overlap = document.getElementById('overlap');
    els.overlapValue = document.getElementById('overlapValue');
    els.animSpeed = document.getElementById('animSpeed');
    els.animSpeedValue = document.getElementById('animSpeedValue');
    els.morphIntensity = document.getElementById('morphIntensity');
    els.morphIntensityValue = document.getElementById('morphIntensityValue');
    els.autoRotate = document.getElementById('autoRotate');
    els.solidColor = document.getElementById('solidColor');
    els.gradientType = document.getElementById('gradientType');
    els.gradColor1 = document.getElementById('gradColor1');
    els.gradColor2 = document.getElementById('gradColor2');
    els.gradAngle = document.getElementById('gradAngle');
    els.gradAngleValue = document.getElementById('gradAngleValue');
    els.multiColors = document.getElementById('multiColors');
    els.presetPalette = document.getElementById('presetPalette');
    els.customWidth = document.getElementById('customWidth');
    els.customHeight = document.getElementById('customHeight');
    els.bgColor = document.getElementById('bgColor');
    els.generateBtn = document.getElementById('generateBtn');
    els.randomizeBtn = document.getElementById('randomizeBtn');
    els.copySvgBtn = document.getElementById('copySvgBtn');
    els.downloadSvgBtn = document.getElementById('downloadSvgBtn');
    els.downloadPngBtn = document.getElementById('downloadPngBtn');
    els.downloadCssBtn = document.getElementById('downloadCssBtn');
    els.shareBtn = document.getElementById('shareBtn');
    els.newBlobBtn = document.getElementById('newBlobBtn');
    els.blobSvg = document.getElementById('blobSvg');
    els.gameStatus = document.getElementById('gameStatus');
    els.resultsModal = document.getElementById('resultsModal');
    els.resultMode = document.getElementById('resultMode');
    els.resultPoints = document.getElementById('resultPoints');
    els.resultColorScheme = document.getElementById('resultColorScheme');
    els.resultSize = document.getElementById('resultSize');
    els.shareBtnModal = document.getElementById('shareBtnModal');
    els.downloadBtnModal = document.getElementById('downloadBtnModal');
    els.newBlobBtnModal = document.getElementById('newBlobBtnModal');
    els.uiTheme = document.getElementById('uiTheme');
    els.blobsGenerated = document.getElementById('blobsGenerated');
    els.svgExports = document.getElementById('svgExports');
    els.pngExports = document.getElementById('pngExports');
    els.puzzleLabel = document.getElementById('puzzleLabel');
    els.puzzleMeta = document.getElementById('puzzleMeta');
    els.canvasTitle = document.getElementById('canvasTitle');
    els.canvasMeta = document.getElementById('canvasMeta');
    els.canvasWrapper = document.getElementById('canvasWrapper');
    els.canvasStats = document.getElementById('canvasStats');
    els.exportBar = document.getElementById('exportBar');
    els.themeToggle = document.getElementById('themeToggle');
    els.themeIcon = document.getElementById('themeIcon');
    els.toastContainer = document.getElementById('toastContainer');
    els.presetGallery = document.getElementById('presetGallery');
  }

  // ============================================
  // UTILITIES
  // ============================================

  function showToast(message, type = 'info') {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  function setActiveTab(tabs, value, dataAttr) {
    tabs.forEach(tab => {
      const isActive = tab.dataset[dataAttr] === value;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });
  }

  function loadStats() {
    const saved = localStorage.getItem('blobGeneratorStats');
    if (saved) {
      const data = JSON.parse(saved);
      state.blobsGenerated = data.blobsGenerated || 0;
      state.svgExports = data.svgExports || 0;
      state.pngExports = data.pngExports || 0;
      updateStatsDisplay();
    }
  }

  function saveStats() {
    localStorage.setItem('blobGeneratorStats', JSON.stringify({
      blobsGenerated: state.blobsGenerated,
      svgExports: state.svgExports,
      pngExports: state.pngExports
    }));
  }

  function updateStatsDisplay() {
    els.blobsGenerated.textContent = state.blobsGenerated;
    els.svgExports.textContent = state.svgExports;
    els.pngExports.textContent = state.pngExports;
  }

  function loadTheme() {
    const theme = localStorage.getItem('blobGeneratorTheme') || 'dark';
    state.uiTheme = theme;
    els.uiTheme.value = theme;
    document.body.classList.toggle('light-theme', theme === 'light');
    document.body.classList.toggle('dark-theme', theme === 'dark');
    // Update theme icon
    if (theme === 'light') {
      els.themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
    } else {
      els.themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
    }
  }

  function saveTheme(theme) {
    localStorage.setItem('blobGeneratorTheme', theme);
    state.uiTheme = theme;
    document.body.classList.toggle('light-theme', theme === 'light');
    document.body.classList.toggle('dark-theme', theme === 'dark');
    if (theme === 'light') {
      els.themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
    } else {
      els.themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>`;
    }
  }

  // ============================================
  // COLOR SCHEME HELPERS
  // ============================================

  function hexToHsl(hex) {
    const num = parseInt(hex.slice(1), 16);
    const r = (num >> 16) / 255;
    const g = ((num >> 8) & 0x00FF) / 255;
    const b = (num & 0x0000FF) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  function hslToHex(h, s, l) {
    h = h / 360;
    const a = s / 100;
    const l2 = l / 100;
    let r, g, b;
    if (l2 <= 0.5) {
      const q = l2 * (1 + a);
      const p = l2 * (1 - a) + a * l2;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    } else {
      const q = l2 * (1 - a) + a;
      const p = l2 + a - a * l2;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  // ============================================
  // BLOB GENERATION
  // ============================================

  function generateBlobPoints(centerX, centerY, radius, complexity, smoothness, variation, rotation) {
    const points = [];
    const angleStep = (Math.PI * 2) / complexity;

    for (let i = 0; i < complexity; i++) {
      const angle = i * angleStep + (rotation * Math.PI / 180);
      const radiusVariation = radius * (1 - variation + Math.random() * variation * 2);
      const x = centerX + Math.cos(angle) * radiusVariation;
      const y = centerY + Math.sin(angle) * radiusVariation;
      points.push({ x, y });
    }

    // Apply smoothing using Catmull-Rom splines
    if (smoothness > 0) {
      return smoothPoints(points, smoothness);
    }

    return points;
  }

  function smoothPoints(points, smoothness) {
    if (points.length < 4) return points;

    const smoothed = [];
    const tension = smoothness;

    for (let i = 0; i < points.length; i++) {
      const p0 = points[(i - 1 + points.length) % points.length];
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const p3 = points[(i + 2) % points.length];

      // Catmull-Rom spline - generate intermediate points
      const segments = 3;
      for (let s = 0; s < segments; s++) {
        const t = s / segments;
        const t2 = t * t;
        const t3 = t2 * t;

        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        );

        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );

        smoothed.push({ x, y });
      }
    }

    return smoothed;
  }

  function pointsToPath(points) {
    if (points.length < 3) return '';

    let path = `M ${points[0].x} ${points[0].y} `;

    // Use quadratic Bezier curves for smooth curves
    for (let i = 1; i < points.length; i++) {
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      const ctrlX = (curr.x + next.x) / 2;
      const ctrlY = (curr.y + next.y) / 2;
      path += `Q ${curr.x} ${curr.y} ${ctrlX} ${ctrlY} `;
    }

    // Close the path
    const last = points[points.length - 1];
    const first = points[0];
    const ctrlX = (last.x + first.x) / 2;
    const ctrlY = (last.y + first.y) / 2;
    path += `Q ${last.x} ${last.y} ${ctrlX} ${ctrlY} `;
    path += `Q ${first.x} ${first.y} ${points[0].x} ${points[0].y} Z`;

    return path;
  }

  // ============================================
  // MULTIPLE BLOBS WITH COLLISION AVOIDANCE
  // ============================================

  function generateMultipleBlobs() {
    const width = state.size === 'custom' ? state.customWidth : (state.size === 'wide' ? 800 : state.size === 'tall' ? 400 : 500);
    const height = state.size === 'custom' ? state.customHeight : (state.size === 'wide' ? 400 : state.size === 'tall' ? 800 : 500);
    const baseRadius = Math.min(width, height) * 0.35;

    state.blobs = [];

    for (let i = 0; i < state.blobCount; i++) {
      // Random position with overlap control
      let x, y, attempts = 0;
      do {
        x = Math.random() * width;
        y = Math.random() * height;
        attempts++;
      } while (attempts < 100 && state.blobs.some(b => {
        const dx = x - b.x;
        const dy = y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (b.radius + baseRadius * (state.minSize / 100)) * (1 - state.overlap);
      }));

      const sizePercent = state.minSize + Math.random() * (state.maxSize - state.minSize);
      const radius = baseRadius * (sizePercent / 100);

      state.blobs.push({
        x, y, radius,
        complexity: Math.floor(5 + Math.random() * 10),
        smoothness: 0.3 + Math.random() * 0.5,
        variation: 0.2 + Math.random() * 0.4,
        rotation: Math.random() * 360,
        opacity: 0.7 + Math.random() * 0.3,
        direction: Math.random() > 0.5 ? 1 : -1 // animation direction
      });
    }
  }

  // ============================================
  // ANIMATION WITH DIRECTION CONTROL
  // ============================================

  function animateBlob() {
    if (state.mode !== 'animated' || state.isAnimating) return;

    const width = state.size === 'custom' ? state.customWidth : (state.size === 'wide' ? 800 : state.size === 'tall' ? 400 : 500);
    const height = state.size === 'custom' ? state.customHeight : (state.size === 'wide' ? 400 : state.size === 'tall' ? 800 : 500);
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.35;

    state.animationTime += 0.016 * state.animSpeed * state.rotationDirection;

    if (state.mode === 'animated') {
      // Morph the blob with rotation direction
      const points = [];
      const angleStep = (Math.PI * 2) / state.complexity;

      for (let i = 0; i < state.complexity; i++) {
        const angle = i * angleStep + state.animationTime;
        const radiusVariation = baseRadius * (
          1 - state.variation +
          Math.sin(state.animationTime * 2 + i * state.rotationDirection) * state.variation * state.morphIntensity +
          Math.cos(state.animationTime * 1.5 + i * 2 * state.rotationDirection) * state.variation * state.morphIntensity * 0.5
        );
        const x = centerX + Math.cos(angle) * radiusVariation;
        const y = centerY + Math.sin(angle) * radiusVariation;
        points.push({ x, y });
      }

      const smoothed = state.smoothness > 0 ? smoothPoints(points, state.smoothness) : points;
      const path = pointsToPath(smoothed);

      const blobPath = document.getElementById('animatedBlob');
      if (blobPath) {
        blobPath.setAttribute('d', path);
      }
    }

    // In multiple mode, animate each blob
    if (state.mode === 'multiple' && state.blobs) {
      state.blobs.forEach(blob => {
        blob.animationTime = blob.animationTime || 0;
        blob.animationTime += 0.016 * state.animSpeed * blob.direction;

        const points = [];
        const angleStep = (Math.PI * 2) / blob.complexity;

        for (let i = 0; i < blob.complexity; i++) {
          const angle = i * angleStep + blob.animationTime;
          const radiusVariation = blob.radius * (
            1 - blob.variation +
            Math.sin(blob.animationTime * 2 + i) * blob.variation * blob.morphIntensity
          );
          const x = blob.x + Math.cos(angle) * radiusVariation;
          const y = blob.y + Math.sin(angle) * radiusVariation;
          points.push({ x, y });
        }

        const smoothed = blob.smoothness > 0 ? smoothPoints(points, blob.smoothness) : points;
        const path = pointsToPath(smoothed);

        const svg = generateSVG();
        els.blobSvg.outerHTML = svg;
        els.blobSvg = document.getElementById('blobSvg');
      });
    }

    state.animationFrame = requestAnimationFrame(animateBlob);
  }

  function stopAnimation() {
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = null;
    }
    state.isAnimating = false;
  }

  // ============================================
  // SVG GENERATION
  // ============================================

  function generateSVG() {
    const width = state.size === 'custom' ? state.customWidth : (state.size === 'wide' ? 800 : state.size === 'tall' ? 400 : 500);
    const height = state.size === 'custom' ? state.customHeight : (state.size === 'wide' ? 400 : state.size === 'tall' ? 800 : 500);
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.35;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;

    // Background
    if (state.background === 'color') {
      svgContent += `<rect width="100%" height="100%" fill="${state.bgColor}"/>`;
    } else if (state.background === 'checker') {
      svgContent += `<defs><pattern id="checker" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="#2a2a3a"/>
        <rect x="10" y="10" width="10" height="10" fill="#2a2a3a"/>
      </pattern></defs><rect width="100%" height="100%" fill="url(#checker)"/>`;
    }

    // Define gradients if needed
    if (state.colorScheme === 'gradient' && state.mode !== 'multiple') {
      const angle = state.gradAngle * Math.PI / 180;
      const x1 = centerX - Math.cos(angle) * baseRadius;
      const y1 = centerY - Math.sin(angle) * baseRadius;
      const x2 = centerX + Math.cos(angle) * baseRadius;
      const y2 = centerY + Math.sin(angle) * baseRadius;
      svgContent += `<defs><linearGradient id="blobGrad" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${state.gradColor1}"/>
        <stop offset="100%" stop-color="${state.gradColor2}"/>
      </linearGradient></defs>`;
    } else if (state.colorScheme === 'gradient' && state.mode === 'multiple') {
      state.blobs.forEach((blob, idx) => {
        const angle = state.gradAngle * Math.PI / 180;
        const x1 = blob.x - Math.cos(angle) * blob.radius;
        const y1 = blob.y - Math.sin(angle) * blob.radius;
        const x2 = blob.x + Math.cos(angle) * blob.radius;
        const y2 = blob.y + Math.sin(angle) * blob.radius;
        svgContent += `<defs><linearGradient id="blobGrad${idx}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${state.gradColor1}"/>
          <stop offset="100%" stop-color="${state.gradColor2}"/>
        </linearGradient></defs>`;
      });
    } else if (state.colorScheme === 'palette') {
      const palette = PALETTES[state.presetPalette] || PALETTES.aurora;
      palette.forEach((color, idx) => {
        svgContent += `<defs><radialGradient id="paletteGrad${idx}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${adjustColor(color, -30)}"/>
        </radialGradient></defs>`;
      });
    }

    // Generate blobs based on mode
    if (state.mode === 'single') {
      const points = generateBlobPoints(
        centerX, centerY, baseRadius,
        state.complexity, state.smoothness, state.variation, state.rotation
      );
      const path = pointsToPath(points);

      let fill = state.solidColor;
      if (state.colorScheme === 'gradient') fill = 'url(#blobGrad)';
      else if (state.colorScheme === 'palette') fill = 'url(#paletteGrad0)';
      else if (state.colorScheme === 'multi') fill = state.multiColors[0];

      svgContent += `<path d="${path}" fill="${fill}" stroke="none"/>`;
    } else if (state.mode === 'multiple') {
      state.blobs.forEach((blob, idx) => {
        const points = generateBlobPoints(
          blob.x, blob.y, blob.radius,
          blob.complexity, blob.smoothness, blob.variation, blob.rotation
        );
        const path = pointsToPath(points);

        let fill = state.solidColor;
        if (state.colorScheme === 'gradient') fill = `url(#blobGrad${idx})`;
        else if (state.colorScheme === 'multi') fill = state.multiColors[idx % state.multiColors.length];
        else if (state.colorScheme === 'palette') {
          const palette = PALETTES[state.presetPalette] || PALETTES.aurora;
          fill = `url(#paletteGrad${idx % palette.length})`;
        }

        svgContent += `<path d="${path}" fill="${fill}" stroke="none" opacity="${blob.opacity}"/>`;
      });
    } else if (state.mode === 'animated') {
      // For animated mode, generate base blob
      const points = generateBlobPoints(
        centerX, centerY, baseRadius,
        state.complexity, state.smoothness, state.variation, state.rotation
      );
      const path = pointsToPath(points);

      let fill = state.solidColor;
      if (state.colorScheme === 'gradient') fill = 'url(#blobGrad)';
      else if (state.colorScheme === 'palette') fill = 'url(#paletteGrad0)';
      else if (state.colorScheme === 'multi') fill = state.multiColors[0];

      svgContent += `<path id="animatedBlob" d="${path}" fill="${fill}" stroke="none"/>`;
    }

    svgContent += '</svg>';
    return svgContent;
  }

  function adjustColor(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  // ============================================
  // RENDER
  // ============================================

  function render() {
    if (state.mode === 'multiple') {
      generateMultipleBlobs();
    }

    const svg = generateSVG();
    els.blobSvg.outerHTML = svg;
    els.blobSvg = document.getElementById('blobSvg'); // Re-reference after replacement

    // Start animation if in animated mode
    if (state.mode === 'animated') {
      state.isAnimating = true;
      animateBlob();
    } else {
      stopAnimation();
    }

    // Show controls
    els.copySvgBtn.hidden = false;
    els.downloadSvgBtn.hidden = false;
    els.downloadPngBtn.hidden = false;
    els.downloadCssBtn.hidden = false;
    els.shareBtn.hidden = false;
    els.newBlobBtn.hidden = false;
    els.shareBtnModal.hidden = false;
    els.downloadBtnModal.hidden = false;

    // Update canvas wrapper background
    if (state.background === 'checkerboard') {
      els.canvasWrapper.classList.add('checkerboard');
    } else {
      els.canvasWrapper.classList.remove('checkerboard');
    }

    // Update modal
    els.resultMode.textContent = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
    els.resultPoints.textContent = state.complexity;
    els.resultColorScheme.textContent = state.colorScheme.charAt(0).toUpperCase() + state.colorScheme.slice(1);

    const width = state.size === 'custom' ? state.customWidth : (state.size === 'wide' ? 800 : state.size === 'tall' ? 400 : 500);
    const height = state.size === 'custom' ? state.customHeight : (state.size === 'wide' ? 400 : state.size === 'tall' ? 800 : 500);
    els.resultSize.textContent = `${width}×${height}`;

    els.resultsModal.hidden = false;
    els.gameStatus.textContent = 'Blob generated! Choose an export option.';

    // Update canvas stats
    els.canvasStats.innerHTML = `
      <div class="stat-item">
        <span class="stat-value">${state.mode.charAt(0).toUpperCase() + state.mode.slice(1)}</span>
        <span class="stat-label">Mode</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${state.complexity}</span>
        <span class="stat-label">Points</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${state.colorScheme.charAt(0).toUpperCase() + state.colorScheme.slice(1)}</span>
        <span class="stat-label">Colors</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${width}×${height}</span>
        <span class="stat-label">Size</span>
      </div>
    `;

    state.blobsGenerated++;
    saveStats();
    updateStatsDisplay();
  }

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  function copySvg() {
    const svg = els.blobSvg.outerHTML;
    navigator.clipboard.writeText(svg).then(() => {
      showToast('SVG copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Copy failed');
    });
  }

  function downloadSvg() {
    const svg = els.blobSvg.outerHTML;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `blob-${Date.now()}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    state.svgExports++;
    saveStats();
    updateStatsDisplay();
    showToast('SVG downloaded!', 'success');
  }

  function downloadPng() {
    const canvas = document.createElement('canvas');
    const width = state.size === 'custom' ? state.customWidth : (state.size === 'wide' ? 800 : state.size === 'tall' ? 400 : 500);
    const height = state.size === 'custom' ? state.customHeight : (state.size === 'wide' ? 400 : state.size === 'tall' ? 800 : 500);
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    // Draw background
    if (state.background === 'color') {
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(0, 0, width, height);
    } else if (state.background === 'checkerboard') {
      const size = 20;
      for (let x = 0; x < width; x += size) {
        for (let y = 0; y < height; y += size) {
          if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
            ctx.fillStyle = '#2a2a3a';
            ctx.fillRect(x, y, size, size);
          }
        }
      }
    }

    // Draw SVG on canvas
    const svg = els.blobSvg.outerHTML;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.download = `blob-${Date.now()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        state.pngExports++;
        saveStats();
        updateStatsDisplay();
        showToast('PNG downloaded!', 'success');
      });
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  function downloadCss() {
    const width = state.size === 'custom' ? state.customWidth : (state.size === 'wide' ? 800 : state.size === 'tall' ? 400 : 500);
    const height = state.size === 'custom' ? state.customHeight : (state.size === 'wide' ? 400 : state.size === 'tall' ? 800 : 500);

    const svg = els.blobSvg.outerHTML;
    const base64 = btoa(unescape(encodeURIComponent(svg)));

    const css = `.blob-bg {
  width: ${width}px;
  height: ${height}px;
  background-image: url("data:image/svg+xml;base64,${base64}");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* For responsive use */
.blob-bg-responsive {
  aspect-ratio: ${width} / ${height};
  width: 100%;
  background-image: url("data:image/svg+xml;base64,${base64}");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}`;

    const blob = new Blob([css], { type: 'text/css' });
    const link = document.createElement('a');
    link.download = `blob-${Date.now()}.css`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('CSS downloaded!', 'success');
  }

  function shareBlob() {
    const svg = els.blobSvg.outerHTML;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const file = new File([blob], 'blob.svg', { type: 'image/svg+xml' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Blob Shape' }).catch(() => {});
    } else {
      copySvg();
      showToast('Share not available. SVG copied to clipboard.', 'info');
    }
  }

  // ============================================
  // RANDOMIZE
  // ============================================

  function randomize() {
    // Random mode
    const modes = ['single', 'multiple', 'animated'];
    setMode(modes[Math.floor(Math.random() * modes.length)]);

    // Random single params
    state.complexity = Math.floor(5 + Math.random() * 12);
    state.smoothness = Math.random() * 0.8;
    state.variation = 0.1 + Math.random() * 0.6;
    state.rotation = Math.random() * 360;

    // Random multiple params
    state.blobCount = Math.floor(3 + Math.random() * 10);
    state.minSize = Math.floor(10 + Math.random() * 40);
    state.maxSize = Math.floor(state.minSize + 20 + Math.random() * 60);
    state.overlap = Math.random() * 0.5;

    // Random animated params
    state.animSpeed = 0.5 + Math.random() * 2;
    state.morphIntensity = 0.2 + Math.random() * 0.6;
    state.autoRotate = Math.random() > 0.3;
    state.rotationDirection = Math.random() > 0.5 ? 1 : -1;
    els.rotationDirectionValue.textContent = state.rotationDirection === 1 ? 'CW' : 'CCW';

    // Random colors
    const colorSchemes = ['solid', 'gradient', 'multi', 'palette'];
    setColorScheme(colorSchemes[Math.floor(Math.random() * colorSchemes.length)]);

    if (state.colorScheme === 'solid') {
      const hue = Math.floor(Math.random() * 360);
      state.solidColor = `hsl(${hue}, 70%, 55%)`;
    } else if (state.colorScheme === 'gradient') {
      const hue1 = Math.floor(Math.random() * 360);
      const hue2 = (hue1 + 60 + Math.random() * 180) % 360;
      state.gradColor1 = `hsl(${hue1}, 70%, 55%)`;
      state.gradColor2 = `hsl(${hue2}, 70%, 55%)`;
      state.gradAngle = Math.floor(Math.random() * 360);
    } else if (state.colorScheme === 'multi') {
      state.multiColors = Array.from({ length: 5 }, () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 55%)`;
      });
    } else if (state.colorScheme === 'palette') {
      const palettes = Object.keys(PALETTES);
      state.presetPalette = palettes[Math.floor(Math.random() * palettes.length)];
    }

    // Random rotation direction for animated mode
    if (state.mode === 'animated') {
      state.rotationDirection = Math.random() > 0.5 ? 1 : -1;
    }

    // Random size
    const sizes = ['square', 'wide', 'tall', 'custom'];
    setSize(sizes[Math.floor(Math.random() * sizes.length)]);

    // Random background
    const backgrounds = ['transparent', 'color', 'checkerboard'];
    setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)]);

    // Update UI
    updateUIFromState();

    showToast('Randomized!', 'success');
  }

  function updateUIFromState() {
    els.complexity.value = state.complexity;
    els.complexityValue.textContent = state.complexity;
    els.smoothness.value = state.smoothness;
    els.smoothnessValue.textContent = state.smoothness.toFixed(2);
    els.variation.value = state.variation;
    els.variationValue.textContent = state.variation.toFixed(2);
    els.rotation.value = Math.round(state.rotation);
    els.rotationValue.textContent = Math.round(state.rotation);

    // Update rotation direction display
    if (els.rotationDirectionValue) {
      els.rotationDirectionValue.textContent = state.rotationDirection === 1 ? 'CW' : 'CCW';
    }

    els.blobCount.value = state.blobCount;
    els.blobCountValue.textContent = state.blobCount;
    els.minSize.value = state.minSize;
    els.minSizeValue.textContent = state.minSize;
    els.maxSize.value = state.maxSize;
    els.maxSizeValue.textContent = state.maxSize;
    els.overlap.value = state.overlap;
    els.overlapValue.textContent = state.overlap.toFixed(1);
    els.animSpeed.value = state.animSpeed;
    els.animSpeedValue.textContent = state.animSpeed.toFixed(1);
    els.morphIntensity.value = state.morphIntensity;
    els.morphIntensityValue.textContent = state.morphIntensity.toFixed(2);
    els.autoRotate.checked = state.autoRotate;
    els.solidColor.value = state.solidColor;
    els.gradientType.value = state.gradientType;
    els.gradColor1.value = state.gradColor1;
    els.gradColor2.value = state.gradColor2;
    els.gradAngle.value = state.gradAngle;
    els.gradAngleValue.textContent = state.gradAngle;
    els.multiColors.value = state.multiColors.join(',');
    els.presetPalette.value = state.presetPalette;
    els.customWidth.value = state.customWidth;
    els.customHeight.value = state.customHeight;
    els.bgColor.value = state.bgColor;
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function setMode(mode) {
    state.mode = mode;
    setActiveTab(els.modeTabs, mode, 'data-mode');

    els.singleOptions.hidden = mode !== 'single';
    els.multipleOptions.hidden = mode !== 'multiple';
    els.animatedOptions.hidden = mode !== 'animated';

    els.puzzleLabel.textContent = mode === 'single' ? 'Single Blob' : mode === 'multiple' ? 'Multiple Blobs' : 'Animated Blob';
    stopAnimation();
  }

  function setColorScheme(scheme) {
    state.colorScheme = scheme;
    setActiveTab(els.colorTabs, scheme, 'data-color');

    els.solidColorOptions.hidden = scheme !== 'solid';
    els.gradientColorOptions.hidden = scheme !== 'gradient';
    els.multiColorOptions.hidden = scheme !== 'multi';
    els.paletteColorOptions.hidden = scheme !== 'palette';

    // Update preset palette options visibility
    if (els.presetPalette) {
      els.paletteColorOptions.hidden = scheme !== 'palette';
    }
  }

  function setSize(size) {
    state.size = size;
    setActiveTab(els.sizeTabs, size, 'data-size');
    els.customSizeOptions.hidden = size !== 'custom';
  }

  function setBackground(bg) {
    state.background = bg;
    setActiveTab(els.bgTabs, bg, 'data-bg');
    els.bgColorOptions.hidden = bg !== 'color';
  }

  function toggleRotationDirection() {
    state.rotationDirection = state.rotationDirection === 1 ? -1 : 1;
    els.rotationDirectionValue.textContent = state.rotationDirection === 1 ? 'CW' : 'CCW';
  }

  // ============================================
  // INIT EVENT LISTENERS
  // ============================================

  function initEventListeners() {
    // Mode tabs
    els.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => setMode(tab.dataset.mode));
    });

    // Color tabs
    els.colorTabs.forEach(tab => {
      tab.addEventListener('click', () => setColorScheme(tab.dataset.color));
    });

    // Background tabs
    els.bgTabs.forEach(tab => {
      tab.addEventListener('click', () => setBackground(tab.dataset.bg));
    });

    // Size tabs
    els.sizeTabs.forEach(tab => {
      tab.addEventListener('click', () => setSize(tab.dataset.size));
    });

    // Single blob controls
    els.complexity.addEventListener('input', () => {
      state.complexity = parseInt(els.complexity.value);
      els.complexityValue.textContent = state.complexity;
    });
    els.smoothness.addEventListener('input', () => {
      state.smoothness = parseFloat(els.smoothness.value);
      els.smoothnessValue.textContent = state.smoothness.toFixed(2);
    });
    els.variation.addEventListener('input', () => {
      state.variation = parseFloat(els.variation.value);
      els.variationValue.textContent = state.variation.toFixed(2);
    });
    els.rotation.addEventListener('input', () => {
      state.rotation = parseInt(els.rotation.value);
      els.rotationValue.textContent = state.rotation;
    });

    // Multiple blobs controls
    els.blobCount.addEventListener('input', () => {
      state.blobCount = parseInt(els.blobCount.value);
      els.blobCountValue.textContent = state.blobCount;
    });
    els.minSize.addEventListener('input', () => {
      state.minSize = parseInt(els.minSize.value);
      els.minSizeValue.textContent = state.minSize;
      if (state.maxSize < state.minSize) {
        state.maxSize = state.minSize + 10;
        els.maxSize.value = state.maxSize;
        els.maxSizeValue.textContent = state.maxSize;
      }
    });
    els.maxSize.addEventListener('input', () => {
      state.maxSize = parseInt(els.maxSize.value);
      els.maxSizeValue.textContent = state.maxSize;
    });
    els.overlap.addEventListener('input', () => {
      state.overlap = parseFloat(els.overlap.value);
      els.overlapValue.textContent = state.overlap.toFixed(1);
    });

    // Animated controls
    els.animSpeed.addEventListener('input', () => {
      state.animSpeed = parseFloat(els.animSpeed.value);
      els.animSpeedValue.textContent = state.animSpeed.toFixed(1);
    });
    els.morphIntensity.addEventListener('input', () => {
      state.morphIntensity = parseFloat(els.morphIntensity.value);
      els.morphIntensityValue.textContent = state.morphIntensity.toFixed(2);
    });
    els.autoRotate.addEventListener('change', () => {
      state.autoRotate = els.autoRotate.checked;
    });

    // Rotation direction control (only for animated mode)
    els.rotationDirectionBtn = document.querySelector('.rotation-direction-btn');
    if (els.rotationDirectionBtn) {
      els.rotationDirectionBtn.addEventListener('click', toggleRotationDirection);
    }

    // Color controls
    els.solidColor.addEventListener('input', () => state.solidColor = els.solidColor.value);
    els.gradientType.addEventListener('change', () => state.gradientType = els.gradientType.value);
    els.gradColor1.addEventListener('input', () => state.gradColor1 = els.gradColor1.value);
    els.gradColor2.addEventListener('input', () => state.gradColor2 = els.gradColor2.value);
    els.gradAngle.addEventListener('input', () => {
      state.gradAngle = parseInt(els.gradAngle.value);
      els.gradAngleValue.textContent = state.gradAngle;
    });
    els.multiColors.addEventListener('input', () => {
      state.multiColors = els.multiColors.value.split(',').map(c => c.trim()).filter(c => c);
    });
    els.presetPalette.addEventListener('change', () => {
      state.presetPalette = els.presetPalette.value;
    });

    // Size controls
    els.customWidth.addEventListener('input', () => state.customWidth = parseInt(els.customWidth.value) || 500);
    els.customHeight.addEventListener('input', () => state.customHeight = parseInt(els.customHeight.value) || 500);

    // Background color
    els.bgColor.addEventListener('input', () => state.bgColor = els.bgColor.value);

    // Buttons
    els.generateBtn.addEventListener('click', render);
    els.randomizeBtn.addEventListener('click', randomize);
    els.copySvgBtn.addEventListener('click', copySvg);
    els.downloadSvgBtn.addEventListener('click', downloadSvg);
    els.downloadPngBtn.addEventListener('click', downloadPng);
    els.downloadCssBtn.addEventListener('click', downloadCss);
    els.shareBtn.addEventListener('click', shareBlob);
    els.newBlobBtn.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      els.gameStatus.textContent = 'Configure options and click "Generate"';
    });
    els.shareBtnModal.addEventListener('click', shareBlob);
    els.downloadBtnModal.addEventListener('click', downloadSvg);
    els.newBlobBtnModal.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      els.gameStatus.textContent = 'Configure options and click "Generate"';
    });

    // Theme toggle
    els.uiTheme.addEventListener('change', () => saveTheme(els.uiTheme.value));

    // Theme toggle button
    els.themeToggle.addEventListener('click', () => {
      const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
      saveTheme(newTheme);
    });

    // Preset gallery
    generatePresetGallery();
  }

  // ============================================
  // PRESET GALLERY GENERATOR (Task 9)
  // ============================================

  function generatePresetGallery() {
    els.presetGallery.innerHTML = '';

    let idx = 0;
    Object.keys(PALETTES).forEach(paletteName => {
      const palette = PALETTES[paletteName];

      // Generate a blob SVG for this palette
      const width = 500;
      const height = 500;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.35;

      // Generate points for a simple blob
      const complexity = 30;
      const angleStep = (Math.PI * 2) / complexity;
      const points = [];

      for (let i = 0; i < complexity; i++) {
        const angle = i * angleStep;
        const radiusVariation = baseRadius * (1 - 0.3 + Math.random() * 0.6);
        const x = centerX + Math.cos(angle) * radiusVariation;
        const y = centerY + Math.sin(angle) * radiusVariation;
        points.push({ x, y });
      }

      // Smooth points
      const smoothed = state.smoothness > 0 ? smoothPoints(points, state.smoothness) : points;
      const path = pointsToPath(smoothed);

      // Use first palette color as fill
      const color = palette[0];

      const svg = `
        <svg width="80" height="80" viewBox="0 0 500 500" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));">
          <path d="${path}" fill="${color}" stroke="none"/>
        </svg>
      `;

      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';
      galleryItem.setAttribute('role', 'option');
      galleryItem.setAttribute('tabindex', '0');
      galleryItem.setAttribute('aria-label', `${paletteName} palette blob`);
      galleryItem.innerHTML = `
        ${svg}
        <div class="gallery-label">${paletteName}</div>
      `;

      // Click handler
      galleryItem.addEventListener('click', () => {
        state.presetPalette = paletteName;
        els.presetPalette.value = paletteName;
        setColorScheme('palette');
        render();
        showToast(`Switched to ${paletteName} palette`, 'success');
        // Focus back to the gallery item for keyboard accessibility
        galleryItem.focus();
      });

      // Keyboard navigation
      galleryItem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          galleryItem.click();
        }
      });

      els.presetGallery.appendChild(galleryItem);
      idx++;
    });

    // Make items focusable and add hover styles via CSS
    const items = els.presetGallery.querySelectorAll('.gallery-item');
    items.forEach((item, i) => {
      item.style.transition = 'all var(--transition-normal)';
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    cacheElements();
    loadStats();
    loadTheme();
    initEventListeners();
    initBubbles();

    // Set initial state
    setMode(state.mode);
    setColorScheme(state.colorScheme);
    setSize(state.size);
    setBackground(state.background);

    // Initialize rotation direction display
    if (els.rotationDirectionValue) {
      els.rotationDirectionValue.textContent = state.rotationDirection === 1 ? 'CW' : 'CCW';
    }

    console.log('Blob Generator initialized - all 10 tasks ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();