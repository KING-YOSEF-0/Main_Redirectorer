const CSSShapesGenerator = (() => {
  const state = {
    currentPreset: 'custom',
    currentClipPath: '',
    currentBackground: '',
    currentTransform: '',
    currentBorderRadius: '',
    currentBoxShadow: '',
    currentBorder: '',
  };

  const elements = {};

  // Preset shape definitions
  const PRESETS = {
    // Basic Geometric
    square: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
    rectangle: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', aspectRatio: '2/1' },
    circle: { clipPath: 'circle(50% at 50% 50%)', borderRadius: '50%' },
    ellipse: { clipPath: 'ellipse(50% 30% at 50% 50%)', borderRadius: '50%' },
    triangle: { clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' },
    'right-triangle': { clipPath: 'polygon(0 0, 100% 0, 0 100%)' },
    diamond: { clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' },
    parallelogram: { clipPath: 'polygon(25% 0, 100% 0, 75% 100%, 0 100%)' },
    trapezoid: { clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' },

    // Polygons
    pentagon: { clipPath: 'polygon(50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%)' },
    hexagon: { clipPath: 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)' },
    heptagon: { clipPath: 'polygon(50% 0, 90% 20%, 100% 65%, 75% 100%, 25% 100%, 0 65%, 10% 20%)' },
    octagon: { clipPath: 'polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)' },
    decagon: { clipPath: 'polygon(50% 0, 81% 10%, 95% 35%, 95% 65%, 81% 90%, 50% 100%, 19% 90%, 5% 65%, 5% 35%, 19% 10%)' },
    dodecagon: { clipPath: 'polygon(50% 0, 75% 7%, 93% 25%, 100% 50%, 93% 75%, 75% 93%, 50% 100%, 25% 93%, 7% 75%, 0 50%, 7% 25%, 25% 7%)' },

    // Stars & Bursts
    'star-5': { clipPath: 'polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' },
    'star-6': { clipPath: 'polygon(50% 0, 63% 28%, 95% 28%, 70% 50%, 82% 78%, 50% 62%, 18% 78%, 30% 50%, 5% 28%, 37% 28%)' },
    'star-8': { clipPath: 'polygon(50% 0, 62% 22%, 88% 22%, 72% 44%, 84% 66%, 50% 54%, 16% 66%, 28% 44%, 12% 22%, 38% 22%)' },
    'star-12': { clipPath: 'polygon(50% 0, 57% 17%, 75% 17%, 66% 36%, 77% 52%, 50% 44%, 23% 52%, 34% 36%, 25% 17%, 43% 17%)' },
    'burst-8': { clipPath: 'polygon(50% 0, 58% 25%, 85% 25%, 64% 45%, 75% 70%, 50% 55%, 25% 70%, 36% 45%, 15% 25%, 42% 25%)' },
    'burst-12': { clipPath: 'polygon(50% 0, 55% 20%, 72% 20%, 62% 38%, 70% 55%, 50% 48%, 30% 55%, 38% 38%, 28% 20%, 45% 20%)' },

    // Fun Shapes
    heart: { clipPath: 'path("M50 0C30 0 10 20 10 40C10 55 25 65 40 75C55 65 70 55 70 40C70 20 50 0 50 0Z")' },
    egg: { clipPath: 'path("M50 0C30 0 15 20 15 45C15 65 30 80 50 90C70 80 85 65 85 45C85 20 70 0 50 0Z")' },
    pill: { clipPath: 'ellipse(50% 50% at 50% 50%)', borderRadius: '100px / 50%' },
    pacman: { clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)', transform: 'rotate(-45deg)' },
    pie: { clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' },
    chevron: { clipPath: 'polygon(0 20%, 60% 20%, 60% 0, 100% 50%, 60% 100%, 60% 80%, 0 80%)' },
    arrow: { clipPath: 'polygon(0 35%, 50% 35%, 50% 0, 100% 50%, 50% 100%, 50% 65%, 0 65%)' },
    cross: { clipPath: 'polygon(35% 0, 65% 0, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0 65%, 0 35%, 35% 35%)' },
    frame: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', borderRadius: '0', border: '20px solid' },
    badge: { clipPath: 'polygon(50% 0, 100% 15%, 100% 85%, 50% 100%, 0 85%, 0 15%)' },

    // UI Shapes
    'speech-bubble': { clipPath: 'polygon(0 0, 100% 0, 100% 75%, 75% 75%, 50% 100%, 25% 75%, 0 75%)', borderRadius: '20px' },
    'thought-bubble': { clipPath: 'ellipse(50% 50% at 50% 50%)', borderRadius: '50%' },
    tooltip: { clipPath: 'polygon(0 0, 100% 0, 100% 80%, 55% 80%, 50% 100%, 45% 80%, 0 80%)', borderRadius: '8px' },
    tag: { clipPath: 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)', borderRadius: '0 8px 8px 0' },
    ribbon: { clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)' },
    bookmark: { clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' },
    'folder-tab': { clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0 100%)', borderRadius: '10px 10px 0 0' },
    'chat-bubble': { clipPath: 'polygon(0 0, 100% 0, 100% 80%, 85% 80%, 70% 100%, 60% 80%, 0 80%)', borderRadius: '15px' },

    // Complex
    gear: { clipPath: 'polygon(50% 5%, 55% 15%, 70% 5%, 65% 25%, 85% 20%, 70% 40%, 75% 55%, 55% 50%, 50% 70%, 45% 50%, 25% 55%, 30% 40%, 15% 20%, 35% 25%, 30% 5%, 45% 15%)' },
    flower: { clipPath: 'polygon(50% 0, 60% 20%, 80% 20%, 65% 35%, 70% 55%, 50% 45%, 30% 55%, 35% 35%, 20% 20%, 40% 20%)' },
    snowflake: { clipPath: 'polygon(50% 0, 55% 18%, 72% 20%, 60% 35%, 65% 52%, 50% 45%, 35% 52%, 40% 35%, 28% 20%, 45% 18%)' },
    infinity: { clipPath: 'path("M20 50C20 30 40 10 60 10C80 10 90 30 90 50C90 70 80 90 60 90C40 90 20 70 20 50ZM80 50C80 30 60 10 40 10C20 10 10 30 10 50C10 70 20 90 40 90C60 90 80 70 80 50Z")' },
    'yin-yang': { clipPath: 'path("M50 0A50 50 0 1 1 50 100A25 25 0 1 0 50 50A25 25 0 1 1 50 0Z")' },
  };

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    generateShape(); // Initial generation
  }

  function cacheElements() {
    elements.shapePreset = document.getElementById('shape-preset');
    elements.customBuilder = document.getElementById('custom-builder');
    elements.polygonSides = document.getElementById('polygon-sides');
    elements.polygonSidesValue = document.getElementById('polygon-sides-value');
    elements.polygonRoundness = document.getElementById('polygon-roundness');
    elements.polygonRoundnessValue = document.getElementById('polygon-roundness-value');
    elements.polygonRotation = document.getElementById('polygon-rotation');
    elements.polygonRotationValue = document.getElementById('polygon-rotation-value');
    elements.polygonStarRatio = document.getElementById('polygon-star-ratio');
    elements.polygonStarRatioValue = document.getElementById('polygon-star-ratio-value');
    elements.clipModeRadios = document.querySelectorAll('input[name="clip-mode"]');

    elements.shapeWidth = document.getElementById('shape-width');
    elements.shapeHeight = document.getElementById('shape-height');
    elements.shapeBgType = document.getElementById('shape-bg-type');
    elements.bgOptions = document.querySelectorAll('.bg-option');
    elements.shapeColor = document.getElementById('shape-color');

    // Gradient inputs
    elements.gradLinear1 = document.getElementById('grad-linear-1');
    elements.gradLinear2 = document.getElementById('grad-linear-2');
    elements.gradLinearAngle = document.getElementById('grad-linear-angle');
    elements.gradLinearStops = document.getElementById('grad-linear-stops');
    elements.gradRadial1 = document.getElementById('grad-radial-1');
    elements.gradRadial2 = document.getElementById('grad-radial-2');
    elements.gradRadialShape = document.getElementById('grad-radial-shape');
    elements.gradConic1 = document.getElementById('grad-conic-1');
    elements.gradConic2 = document.getElementById('grad-conic-2');
    elements.gradConic3 = document.getElementById('grad-conic-3');
    elements.gradConicFrom = document.getElementById('grad-conic-from');
    elements.stripeColor1 = document.getElementById('stripe-color1');
    elements.stripeColor2 = document.getElementById('stripe-color2');
    elements.stripeAngle = document.getElementById('stripe-angle');
    elements.stripeWidth = document.getElementById('stripe-width');
    elements.checkColor1 = document.getElementById('check-color1');
    elements.checkColor2 = document.getElementById('check-color2');
    elements.checkSize = document.getElementById('check-size');
    elements.dotColor = document.getElementById('dot-color');
    elements.dotBg = document.getElementById('dot-bg');
    elements.dotSize = document.getElementById('dot-size');
    elements.dotSpacing = document.getElementById('dot-spacing');

    elements.shapeBorder = document.getElementById('shape-border');
    elements.shapeBorderColor = document.getElementById('shape-border-color');
    elements.shapeBorderStyle = document.getElementById('shape-border-style');
    elements.shadowX = document.getElementById('shadow-x');
    elements.shadowY = document.getElementById('shadow-y');
    elements.shadowBlur = document.getElementById('shadow-blur');
    elements.shadowSpread = document.getElementById('shadow-spread');
    elements.shadowColor = document.getElementById('shadow-color');
    elements.transformRotate = document.getElementById('transform-rotate');
    elements.transformScaleX = document.getElementById('transform-scale-x');
    elements.transformScaleY = document.getElementById('transform-scale-y');
    elements.transformSkewX = document.getElementById('transform-skew-x');
    elements.transformSkewY = document.getElementById('transform-skew-y');

    elements.shapePreview = document.getElementById('shape-preview');
    elements.cssCode = document.getElementById('css-code');
    elements.btnGenerate = document.getElementById('btn-generate');
    elements.btnRandom = document.getElementById('btn-random-shape');
    elements.btnCopyCss = document.getElementById('btn-copy-css');
    elements.btnDownloadCss = document.getElementById('btn-download-css');
    elements.btnDownloadHtml = document.getElementById('btn-download-html');
    elements.btnShare = document.getElementById('btn-share-shape');
    elements.quickCopyBtns = document.querySelectorAll('.quick-copy-btn');
  }

  function bindEvents() {
    elements.shapePreset.addEventListener('change', onPresetChange);
    elements.polygonSides.addEventListener('input', () => {
      elements.polygonSidesValue.textContent = elements.polygonSides.value;
      generateShape();
    });
    elements.polygonRoundness.addEventListener('input', () => {
      elements.polygonRoundnessValue.textContent = elements.polygonRoundness.value + '%';
      generateShape();
    });
    elements.polygonRotation.addEventListener('input', () => {
      elements.polygonRotationValue.textContent = elements.polygonRotation.value + '°';
      generateShape();
    });
    elements.polygonStarRatio.addEventListener('input', () => {
      elements.polygonStarRatioValue.textContent = elements.polygonStarRatio.value + '%';
      generateShape();
    });
    elements.clipModeRadios.forEach(r => r.addEventListener('change', generateShape));

    elements.shapeWidth.addEventListener('input', generateShape);
    elements.shapeHeight.addEventListener('input', generateShape);
    elements.shapeBgType.addEventListener('change', onBgTypeChange);

    // Color/gradient inputs
    const colorInputs = [
      elements.shapeColor, elements.gradLinear1, elements.gradLinear2,
      elements.gradRadial1, elements.gradRadial2, elements.gradConic1,
      elements.gradConic2, elements.gradConic3, elements.stripeColor1,
      elements.stripeColor2, elements.checkColor1, elements.checkColor2,
      elements.dotColor, elements.dotBg, elements.shapeBorderColor,
      elements.shadowColor
    ];
    colorInputs.forEach(input => {
      if (input) input.addEventListener('input', generateShape);
    });

    elements.gradLinearAngle.addEventListener('input', generateShape);
    elements.gradLinearStops.addEventListener('input', generateShape);
    elements.gradRadialShape.addEventListener('change', generateShape);
    elements.gradConicFrom.addEventListener('input', generateShape);
    elements.stripeAngle.addEventListener('input', generateShape);
    elements.stripeWidth.addEventListener('input', generateShape);
    elements.checkSize.addEventListener('input', generateShape);
    elements.dotSize.addEventListener('input', generateShape);
    elements.dotSpacing.addEventListener('input', generateShape);

    elements.shapeBorder.addEventListener('input', generateShape);
    elements.shapeBorderStyle.addEventListener('change', generateShape);
    elements.shadowX.addEventListener('input', generateShape);
    elements.shadowY.addEventListener('input', generateShape);
    elements.shadowBlur.addEventListener('input', generateShape);
    elements.shadowSpread.addEventListener('input', generateShape);
    elements.transformRotate.addEventListener('input', generateShape);
    elements.transformScaleX.addEventListener('input', generateShape);
    elements.transformScaleY.addEventListener('input', generateShape);
    elements.transformSkewX.addEventListener('input', generateShape);
    elements.transformSkewY.addEventListener('input', generateShape);

    elements.btnGenerate.addEventListener('click', generateShape);
    elements.btnRandom.addEventListener('click', randomShape);
    elements.btnCopyCss.addEventListener('click', copyFullCss);
    elements.btnDownloadCss.addEventListener('click', downloadCss);
    elements.btnDownloadHtml.addEventListener('click', downloadHtml);
    elements.btnShare.addEventListener('click', shareShape);

    elements.quickCopyBtns.forEach(btn => {
      btn.addEventListener('click', () => quickCopy(btn.dataset.copy));
    });
  }

  function onPresetChange() {
    const preset = elements.shapePreset.value;
    state.currentPreset = preset;
    elements.customBuilder.hidden = preset !== 'custom';
    generateShape();
  }

  function onBgTypeChange() {
    const type = elements.shapeBgType.value;
    elements.bgOptions.forEach(opt => {
      opt.hidden = opt.dataset.bg !== type;
    });
    generateShape();
  }

  function generateShape() {
    // Build clip-path
    buildClipPath();

    // Build background
    buildBackground();

    // Build transform
    buildTransform();

    // Build border-radius
    buildBorderRadius();

    // Build box-shadow
    buildBoxShadow();

    // Build border
    buildBorder();

    // Apply to preview
    applyPreview();

    // Update CSS output
    updateCssOutput();
  }

  function buildClipPath() {
    if (state.currentPreset !== 'custom' && PRESETS[state.currentPreset]) {
      const preset = PRESETS[state.currentPreset];
      state.currentClipPath = preset.clipPath;
      // Apply preset-specific transform if any
      if (preset.transform && !elements.transformRotate.value) {
        elements.transformRotate.value = extractRotation(preset.transform);
        buildTransform();
      }
      if (preset.borderRadius) {
        state.currentBorderRadius = preset.borderRadius;
      }
      if (preset.aspectRatio) {
        const [w, h] = preset.aspectRatio.split('/').map(Number);
        elements.shapeWidth.value = 200;
        elements.shapeHeight.value = Math.round(200 * h / w);
      }
    } else {
      // Custom polygon builder
      const sides = parseInt(elements.polygonSides.value) || 5;
      const roundness = parseInt(elements.polygonRoundness.value) || 0;
      const rotation = parseInt(elements.polygonRotation.value) || 0;
      const starRatio = parseInt(elements.polygonStarRatio.value) / 100;
      const usePath = document.querySelector('input[name="clip-mode"]:checked').value === 'path';

      if (usePath) {
        state.currentClipPath = generatePolygonPath(sides, rotation, starRatio, roundness);
      } else {
        state.currentClipPath = generatePolygonClipPath(sides, rotation, starRatio);
        if (roundness > 0) {
          state.currentBorderRadius = roundness + '%';
        }
      }
    }
  }

  function generatePolygonClipPath(sides, rotation, starRatio) {
    const points = [];
    const centerX = 50, centerY = 50;
    const outerRadius = 50;
    const innerRadius = outerRadius * starRatio;

    for (let i = 0; i < sides * (starRatio > 0 ? 2 : 1); i++) {
      const angle = (i * Math.PI * 2) / (sides * (starRatio > 0 ? 2 : 1)) - Math.PI / 2 + (rotation * Math.PI / 180);
      const radius = (i % 2 === 1 && starRatio > 0) ? innerRadius : outerRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
    }

    return `polygon(${points.join(', ')})`;
  }

  function generatePolygonPath(sides, rotation, starRatio, roundness) {
    // Generate SVG path for more complex shapes with rounded corners
    const points = [];
    const centerX = 50, centerY = 50;
    const outerRadius = 50;
    const innerRadius = outerRadius * starRatio;
    const totalPoints = sides * (starRatio > 0 ? 2 : 1);

    for (let i = 0; i < totalPoints; i++) {
      const angle = (i * Math.PI * 2) / totalPoints - Math.PI / 2 + (rotation * Math.PI / 180);
      const radius = (i % 2 === 1 && starRatio > 0) ? innerRadius : outerRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push({ x, y });
    }

    if (roundness > 0) {
      // Generate path with rounded corners using quadratic curves
      const r = roundness / 100 * 10; // scale roundness
      let path = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i <= points.length; i++) {
        const curr = points[i % points.length];
        const next = points[(i + 1) % points.length];
        const prev = points[(i - 1 + points.length) % points.length];

        // Calculate control points for rounded corner
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;
        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (len1 > 0 && len2 > 0) {
          const ux1 = dx1 / len1, uy1 = dy1 / len1;
          const ux2 = dx2 / len2, uy2 = dy2 / len2;

          const cx1 = curr.x - ux1 * r;
          const cy1 = curr.y - uy1 * r;
          const cx2 = curr.x + ux2 * r;
          const cy2 = curr.y + uy2 * r;

          path += ` Q${cx1.toFixed(1)} ${cy1.toFixed(1)} ${cx2.toFixed(1)} ${cy2.toFixed(1)}`;
        }
      }
      path += ' Z';
      return `path("${path}")`;
    } else {
      // Sharp corners - simple polygon path
      let path = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
      }
      path += ' Z';
      return `path("${path}")`;
    }
  }

  function extractRotation(transform) {
    const match = transform.match(/rotate\(([^)]+)\)/);
    if (match) {
      return parseFloat(match[1]);
    }
    return 0;
  }

  function buildBackground() {
    const type = elements.shapeBgType.value;

    switch (type) {
      case 'solid':
        state.currentBackground = elements.shapeColor.value;
        break;

      case 'gradient-linear': {
        const angle = elements.gradLinearAngle.value || 90;
        const stops = elements.gradLinearStops.value.split(',').map(s => s.trim()).filter(s => s);
        const c1 = elements.gradLinear1.value;
        const c2 = elements.gradLinear2.value;

        if (stops.length >= 2 && stops.every(s => !isNaN(s))) {
          // Custom stops
          state.currentBackground = `linear-gradient(${angle}deg, ${c1} ${stops[0]}%, ${c2} ${stops[1]}%)`;
          if (stops[2]) state.currentBackground += `, ${c2} ${stops[2]}%`;
        } else {
          state.currentBackground = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
        }
        break;
      }

      case 'gradient-radial': {
        const shape = elements.gradRadialShape.value;
        const c1 = elements.gradRadial1.value;
        const c2 = elements.gradRadial2.value;
        state.currentBackground = `radial-gradient(${shape} at center, ${c1}, ${c2})`;
        break;
      }

      case 'gradient-conic': {
        const from = elements.gradConicFrom.value || 0;
        const c1 = elements.gradConic1.value;
        const c2 = elements.gradConic2.value;
        const c3 = elements.gradConic3.value;
        state.currentBackground = `conic-gradient(from ${from}deg, ${c1}, ${c2}, ${c3})`;
        break;
      }

      case 'pattern-stripes': {
        const angle = elements.stripeAngle.value || 45;
        const width = elements.stripeWidth.value || 10;
        const c1 = elements.stripeColor1.value;
        const c2 = elements.stripeColor2.value;
        state.currentBackground = `repeating-linear-gradient(${angle}deg, ${c1}, ${c1} ${width}px, ${c2} ${width}px, ${c2} ${width * 2}px)`;
        break;
      }

      case 'pattern-checkerboard': {
        const size = elements.checkSize.value || 20;
        const c1 = elements.checkColor1.value;
        const c2 = elements.checkColor2.value;
        state.currentBackground = `
          repeating-conic-gradient(${c1} 0 25%, ${c2} 0 50%) 0 0 / ${size}px ${size}px,
          repeating-conic-gradient(${c1} 0 25%, ${c2} 0 50%) ${size/2}px ${size/2}px / ${size}px ${size}px
        `.replace(/\s+/g, ' ').trim();
        break;
      }

      case 'pattern-dots': {
        const dotSize = elements.dotSize.value || 8;
        const spacing = elements.dotSpacing.value || 24;
        const dotC = elements.dotColor.value;
        const bgC = elements.dotBg.value;
        const radius = dotSize / 2;
        state.currentBackground = `
          radial-gradient(circle ${radius}px, ${dotC} 99%, transparent 100%) 0 0 / ${spacing}px ${spacing}px,
          ${bgC}
        `.replace(/\s+/g, ' ').trim();
        break;
      }

      default:
        state.currentBackground = elements.shapeColor.value;
    }
  }

  function buildTransform() {
    const transforms = [];
    const rotate = elements.transformRotate.value;
    const scaleX = elements.transformScaleX.value;
    const scaleY = elements.transformScaleY.value;
    const skewX = elements.transformSkewX.value;
    const skewY = elements.transformSkewY.value;

    if (rotate !== '0') transforms.push(`rotate(${rotate}deg)`);
    if (scaleX !== '1' || scaleY !== '1') transforms.push(`scale(${scaleX}, ${scaleY})`);
    if (skewX !== '0') transforms.push(`skewX(${skewX}deg)`);
    if (skewY !== '0') transforms.push(`skewY(${skewY}deg)`);

    state.currentTransform = transforms.join(' ') || 'none';
  }

  function buildBorderRadius() {
    // Already set by preset or custom roundness
    if (!state.currentBorderRadius) {
      state.currentBorderRadius = '0';
    }
  }

  function buildBoxShadow() {
    const x = parseInt(elements.shadowX.value) || 0;
    const y = parseInt(elements.shadowY.value) || 0;
    const blur = parseInt(elements.shadowBlur.value) || 0;
    const spread = parseInt(elements.shadowSpread.value) || 0;
    const color = elements.shadowColor.value;

    if (x === 0 && y === 0 && blur === 0 && spread === 0) {
      state.currentBoxShadow = 'none';
    } else {
      state.currentBoxShadow = `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    }
  }

  function buildBorder() {
    const width = parseInt(elements.shapeBorder.value) || 0;
    const color = elements.shapeBorderColor.value;
    const style = elements.shapeBorderStyle.value;

    if (width === 0) {
      state.currentBorder = 'none';
    } else {
      state.currentBorder = `${width}px ${style} ${color}`;
    }
  }

  function applyPreview() {
    const preview = elements.shapePreview;
    const width = elements.shapeWidth.value + 'px';
    const height = elements.shapeHeight.value + 'px';

    preview.style.width = width;
    preview.style.height = height;
    preview.style.clipPath = state.currentClipPath;
    preview.style.background = state.currentBackground;
    preview.style.transform = state.currentTransform;
    preview.style.borderRadius = state.currentBorderRadius;
    preview.style.boxShadow = state.currentBoxShadow;
    preview.style.border = state.currentBorder;
  }

  function updateCssOutput() {
    const className = '.custom-shape';
    let css = `${className} {\n`;
    css += `  width: ${elements.shapeWidth.value}px;\n`;
    css += `  height: ${elements.shapeHeight.value}px;\n`;
    if (state.currentClipPath) css += `  clip-path: ${state.currentClipPath};\n`;
    if (state.currentBackground) css += `  background: ${state.currentBackground};\n`;
    if (state.currentTransform !== 'none') css += `  transform: ${state.currentTransform};\n`;
    if (state.currentBorderRadius !== '0') css += `  border-radius: ${state.currentBorderRadius};\n`;
    if (state.currentBoxShadow !== 'none') css += `  box-shadow: ${state.currentBoxShadow};\n`;
    if (state.currentBorder !== 'none') css += `  border: ${state.currentBorder};\n`;
    css += '}';

    elements.cssCode.textContent = css;
    hljs.highlightElement(elements.cssCode);
  }

  function randomShape() {
    const presets = Object.keys(PRESETS).filter(k => k !== 'custom');
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    elements.shapePreset.value = randomPreset;
    state.currentPreset = randomPreset;
    elements.customBuilder.hidden = true;

    // Random colors
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 180 + Math.floor(Math.random() * 60) - 30) % 360;
    elements.shapeColor.value = `hsl(${hue1}, 70%, 55%)`;
    elements.gradLinear1.value = `hsl(${hue1}, 70%, 55%)`;
    elements.gradLinear2.value = `hsl(${hue2}, 70%, 55%)`;
    elements.gradRadial1.value = `hsl(${hue1}, 70%, 55%)`;
    elements.gradRadial2.value = `hsl(${hue2}, 70%, 55%)`;

    // Random size
    elements.shapeWidth.value = Math.floor(Math.random() * 200) + 100;
    elements.shapeHeight.value = Math.floor(Math.random() * 200) + 100;

    // Random transform
    elements.transformRotate.value = Math.floor(Math.random() * 90) - 45;
    elements.transformScaleX.value = (Math.random() * 0.5 + 0.8).toFixed(1);
    elements.transformScaleY.value = (Math.random() * 0.5 + 0.8).toFixed(1);

    generateShape();
    showToast('Random shape generated!');
  }

  function copyFullCss() {
    navigator.clipboard.writeText(elements.cssCode.textContent).then(() => {
      showToast('Full CSS copied!');
    });
  }

  function quickCopy(type) {
    let text = '';
    switch (type) {
      case 'clip-path':
        text = state.currentClipPath ? `clip-path: ${state.currentClipPath};` : '/* No clip-path */';
        break;
      case 'background':
        text = state.currentBackground ? `background: ${state.currentBackground};` : '/* No background */';
        break;
      case 'transform':
        text = state.currentTransform !== 'none' ? `transform: ${state.currentTransform};` : '/* No transform */';
        break;
      case 'border-radius':
        text = state.currentBorderRadius !== '0' ? `border-radius: ${state.currentBorderRadius};` : '/* No border-radius */';
        break;
      case 'box-shadow':
        text = state.currentBoxShadow !== 'none' ? `box-shadow: ${state.currentBoxShadow};` : '/* No box-shadow */';
        break;
      case 'full':
        text = elements.cssCode.textContent;
        break;
    }

    navigator.clipboard.writeText(text).then(() => {
      showToast(`${type} copied!`);
      // Visual feedback
      const btn = document.querySelector(`.quick-copy-btn[data-copy="${type}"]`);
      if (btn) {
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1500);
      }
    });
  }

  function downloadCss() {
    const css = `/* CSS Shape Generated by KING_YOSEF_ CSS Shapes Generator */
/* https://king-yosef-0.github.io/Main_Redirectorer/css-shapes-generator/ */

${elements.cssCode.textContent}
`;
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shape.css';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded shape.css');
  }

  function downloadHtml() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CSS Shape Demo</title>
<style>
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f14;
  margin: 0;
  font-family: system-ui, sans-serif;
}

${elements.cssCode.textContent}

.shape-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.shape-label {
  color: #9aa0a6;
  font-size: 0.9rem;
}
</style>
</head>
<body>
<div class="shape-container">
  <div class="custom-shape"></div>
  <div class="shape-label">Generated by <a href="https://king-yosef-0.github.io/Main_Redirectorer/css-shapes-generator/" style="color:#35c3ff">CSS Shapes Generator</a></div>
</div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shape-demo.html';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded shape-demo.html');
  }

  function shareShape() {
    // Create shareable URL with parameters
    const params = new URLSearchParams();
    params.set('preset', state.currentPreset);
    if (state.currentPreset === 'custom') {
      params.set('sides', elements.polygonSides.value);
      params.set('roundness', elements.polygonRoundness.value);
      params.set('rotation', elements.polygonRotation.value);
      params.set('star', elements.polygonStarRatio.value);
      params.set('mode', document.querySelector('input[name="clip-mode"]:checked').value);
    }
    params.set('w', elements.shapeWidth.value);
    params.set('h', elements.shapeHeight.value);
    params.set('bg', elements.shapeBgType.value);
    params.set('color', elements.shapeColor.value.replace('#', ''));
    params.set('border', elements.shapeBorder.value);
    params.set('borderColor', elements.shapeBorderColor.value.replace('#', ''));
    params.set('borderStyle', elements.shapeBorderStyle.value);
    params.set('shadow', `${elements.shadowX.value},${elements.shadowY.value},${elements.shadowBlur.value},${elements.shadowSpread.value},${elements.shadowColor.value.replace('#', '')}`);
    params.set('transform', `${elements.transformRotate.value},${elements.transformScaleX.value},${elements.transformScaleY.value},${elements.transformSkewX.value},${elements.transformSkewY.value}`);

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Share link copied!');
    }).catch(() => {
      prompt('Copy this link:', shareUrl);
    });
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

  // Check for share URL parameters on load
  function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('preset')) {
      const preset = params.get('preset');
      if (PRESETS[preset] || preset === 'custom') {
        elements.shapePreset.value = preset;
        state.currentPreset = preset;
        elements.customBuilder.hidden = preset !== 'custom';
      }
    }
    if (params.has('sides')) elements.polygonSides.value = params.get('sides');
    if (params.has('roundness')) elements.polygonRoundness.value = params.get('roundness');
    if (params.has('rotation')) elements.polygonRotation.value = params.get('rotation');
    if (params.has('star')) elements.polygonStarRatio.value = params.get('star');
    if (params.has('w')) elements.shapeWidth.value = params.get('w');
    if (params.has('h')) elements.shapeHeight.value = params.get('h');
    if (params.has('bg')) elements.shapeBgType.value = params.get('bg');
    if (params.has('color')) elements.shapeColor.value = '#' + params.get('color');
    if (params.has('border')) elements.shapeBorder.value = params.get('border');
    if (params.has('borderColor')) elements.shapeBorderColor.value = '#' + params.get('borderColor');
    if (params.has('borderStyle')) elements.shapeBorderStyle.value = params.get('borderStyle');

    onPresetChange();
    onBgTypeChange();
    generateShape();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadFromUrl();
      init();
    });
  } else {
    loadFromUrl();
    init();
  }
})();