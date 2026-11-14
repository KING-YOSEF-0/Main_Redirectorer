const ColorConverter = (() => {
  const state = {
    color: { r: 255, g: 79, b: 163, a: 1 },
    palette: [],
  };

  const elements = {};

  // CSS Named colors (subset)
  const NAMED_COLORS = {
    aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4',
    azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000',
    blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
    burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e',
    coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c',
    cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00', darkorchid: '#9932cc',
    darkred: '#8b0000', darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1', darkviolet: '#9400d3',
    deeppink: '#ff1493', deepskyblue: '#00bfff', dimgray: '#696969', dimgrey: '#696969',
    dodgerblue: '#1e90ff', firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22',
    fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff', gold: '#ffd700',
    goldenrod: '#daa520', gray: '#808080', green: '#008000', greenyellow: '#adff2f',
    grey: '#808080', honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c',
    indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa',
    lavenderblush: '#fff0f5', lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6',
    lightcoral: '#f08080', lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
    lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1', lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa', lightskyblue: '#87cefa', lightslategray: '#778899', lightslategrey: '#778899',
    lightsteelblue: '#b0c4de', lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32',
    linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000', mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db', mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc', mediumvioletred: '#c71585',
    midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1', moccasin: '#ffe4b5',
    navajowhite: '#ffdead', navy: '#000080', oldlace: '#fdf5e6', olive: '#808000',
    olivedrab: '#6b8e23', orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6',
    palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee', palevioletred: '#db7093',
    papayawhip: '#ffefd5', peachpuff: '#ffdab9', peru: '#cd853f', pink: '#ffc0cb',
    plum: '#dda0dd', powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399',
    red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1', saddlebrown: '#8b4513',
    salmon: '#fa8072', sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee',
    sienna: '#a0522d', silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd',
    slategray: '#708090', slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f',
    steelblue: '#4682b4', tan: '#d2b48c', teal: '#008080', thistle: '#d8bfd8',
    tomato: '#ff6347', turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3',
    white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00', yellowgreen: '#9acd32',
  };

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    updatePreview();
    convert(); // Initial conversion
  }

  function cacheElements() {
    elements.colorInput = document.getElementById('color-input');
    elements.colorFormat = document.getElementById('color-format');
    elements.colorPreview = document.getElementById('color-preview');
    elements.validationStatus = document.getElementById('validation-status');
    elements.btnConvert = document.getElementById('btn-convert');
    elements.btnRandom = document.getElementById('btn-random-color');
    elements.btnPick = document.getElementById('btn-pick-color');
    elements.conversionsOutput = document.getElementById('conversions-output');
    elements.paletteType = document.getElementById('palette-type');
    elements.paletteCount = document.getElementById('palette-count');
    elements.btnPalette = document.getElementById('btn-generate-palette');
    elements.paletteOutput = document.getElementById('palette-output');
    elements.contrastBg = document.getElementById('contrast-bg');
    elements.contrastFg = document.getElementById('contrast-fg');
    elements.btnContrast = document.getElementById('btn-check-contrast');
    elements.contrastResult = document.getElementById('contrast-result');
    elements.formatModal = document.getElementById('format-modal');
    elements.formatModalClose = document.getElementById('format-modal-close');

    // Export buttons
    elements.btnExportCss = document.getElementById('btn-export-css');
    elements.btnExportScss = document.getElementById('btn-export-scss');
    elements.btnExportTailwind = document.getElementById('btn-export-tailwind');
    elements.btnExportJson = document.getElementById('btn-export-json');
    elements.btnExportAse = document.getElementById('btn-export-ase');
  }

  function bindEvents() {
    elements.colorInput.addEventListener('input', () => {
      validateColor();
      updatePreview();
    });
    elements.btnConvert.addEventListener('click', convert);
    elements.btnRandom.addEventListener('click', randomColor);
    elements.btnPick.addEventListener('click', pickColor);
    elements.btnPalette.addEventListener('click', generatePalette);
    elements.btnContrast.addEventListener('click', checkContrast);

    elements.btnExportCss.addEventListener('click', () => exportPalette('css'));
    elements.btnExportScss.addEventListener('click', () => exportPalette('scss'));
    elements.btnExportTailwind.addEventListener('click', () => exportPalette('tailwind'));
    elements.btnExportJson.addEventListener('click', () => exportPalette('json'));
    elements.btnExportAse.addEventListener('click', () => exportPalette('ase'));

    elements.formatModalClose.addEventListener('click', () => elements.formatModal.hidden = true);
    elements.formatModal.addEventListener('click', (e) => {
      if (e.target === elements.formatModal) elements.formatModal.hidden = true;
    });
    document.getElementById('btn-format-help').addEventListener('click', () => {
      elements.formatModal.hidden = false;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') elements.formatModal.hidden = true;
    });
  }

  function validateColor() {
    const input = elements.colorInput.value.trim();
    if (!input) {
      hideValidation();
      return;
    }
    const parsed = parseColor(input);
    if (parsed) {
      showValidation('valid', '✓ Valid color');
    } else {
      showValidation('invalid', '✗ Invalid color format');
    }
  }

  function showValidation(type, message) {
    elements.validationStatus.hidden = false;
    elements.validationStatus.className = `validation-status ${type}`;
    elements.validationStatus.textContent = message;
  }

  function hideValidation() {
    elements.validationStatus.hidden = true;
  }

  function parseColor(input) {
    const str = input.trim().toLowerCase();

    // Named color
    if (NAMED_COLORS[str]) {
      return parseHex(NAMED_COLORS[str]);
    }

    // HEX
    const hexMatch = str.match(/^#?([0-9a-f]{3,8})$/i);
    if (hexMatch) {
      return parseHex('#' + hexMatch[1]);
    }

    // RGB/RGBA
    const rgbMatch = str.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
    if (rgbMatch) {
      const r = parseFloat(rgbMatch[1]);
      const g = parseFloat(rgbMatch[2]);
      const b = parseFloat(rgbMatch[3]);
      const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
      // Check if percentages
      if (str.includes('%')) {
        return { r: r * 2.55, g: g * 2.55, b: b * 2.55, a };
      }
      return { r, g, b, a };
    }

    // HSL/HSLA
    const hslMatch = str.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i);
    if (hslMatch) {
      const h = parseFloat(hslMatch[1]);
      const s = parseFloat(hslMatch[2]) / 100;
      const l = parseFloat(hslMatch[3]) / 100;
      const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;
      return hslToRgb(h, s, l, a);
    }

    // HSV
    const hsvMatch = str.match(/^hsv\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i);
    if (hsvMatch) {
      const h = parseFloat(hsvMatch[1]);
      const s = parseFloat(hsvMatch[2]) / 100;
      const v = parseFloat(hsvMatch[3]) / 100;
      return hsvToRgb(h, s, v);
    }

    // CMYK
    const cmykMatch = str.match(/^cmyk\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i);
    if (cmykMatch) {
      const c = parseFloat(cmykMatch[1]) / 100;
      const m = parseFloat(cmykMatch[2]) / 100;
      const y = parseFloat(cmykMatch[3]) / 100;
      const k = parseFloat(cmykMatch[4]) / 100;
      return cmykToRgb(c, m, y, k);
    }

    // LAB
    const labMatch = str.match(/^lab\(\s*([\d.]+)\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)$/i);
    if (labMatch) {
      const L = parseFloat(labMatch[1]);
      const a = parseFloat(labMatch[2]);
      const b = parseFloat(labMatch[3]);
      return labToRgb(L, a, b);
    }

    // OKLCH
    const oklchMatch = str.match(/^oklch\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i);
    if (oklchMatch) {
      const L = parseFloat(oklchMatch[1]);
      const C = parseFloat(oklchMatch[2]);
      const h = parseFloat(oklchMatch[3]);
      return oklchToRgb(L, C, h);
    }

    return null;
  }

  function parseHex(hex) {
    let clean = hex.replace('#', '');
    let a = 1;

    if (clean.length === 3 || clean.length === 4) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length === 8) {
      a = parseInt(clean.slice(6, 8), 16) / 255;
      clean = clean.slice(0, 6);
    }

    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b, a };
  }

  function updatePreview() {
    const parsed = parseColor(elements.colorInput.value);
    if (parsed) {
      state.color = parsed;
      const cssColor = `rgba(${Math.round(parsed.r)}, ${Math.round(parsed.g)}, ${Math.round(parsed.b)}, ${parsed.a})`;
      elements.colorPreview.style.setProperty('--preview-color', cssColor);
    }
  }

  function convert() {
    const parsed = parseColor(elements.colorInput.value);
    if (!parsed) return;

    state.color = parsed;
    const format = elements.colorFormat.value;
    const conversions = getAllConversions(parsed);
    renderConversions(conversions, format);
  }

  function getAllConversions(c) {
    const rgb = { r: c.r, g: c.g, b: c.b };
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
    const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
    const named = findNamedColor(rgb.r, rgb.g, rgb.b);

    return {
      hex: rgbToHex(rgb.r, rgb.g, rgb.b, c.a),
      hex8: rgbToHex(rgb.r, rgb.g, rgb.b, c.a, true),
      rgb: `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`,
      rgba: `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${c.a.toFixed(2)})`,
      rgbPct: `rgb(${pct(rgb.r)}%, ${pct(rgb.g)}%, ${pct(rgb.b)}%)`,
      hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`,
      hsla: `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%, ${c.a.toFixed(2)})`,
      hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s * 100)}%, ${Math.round(hsv.v * 100)}%)`,
      cmyk: `cmyk(${Math.round(cmyk.c * 100)}, ${Math.round(cmyk.m * 100)}, ${Math.round(cmyk.y * 100)}, ${Math.round(cmyk.k * 100)})`,
      lab: `lab(${lab.L.toFixed(1)}, ${lab.a.toFixed(1)}, ${lab.b.toFixed(1)})`,
      oklch: `oklch(${oklch.L.toFixed(3)} ${oklch.C.toFixed(3)} ${Math.round(oklch.h)})`,
      named: named || 'No exact match',
    };
  }

  function pct(val) {
    return Math.round((val / 255) * 100);
  }

  function renderConversions(conversions, format) {
    const showAll = format === 'all';
    const order = [
      { key: 'hex', label: 'HEX', short: true },
      { key: 'hex8', label: 'HEX (8-digit)', short: true },
      { key: 'rgb', label: 'RGB', short: true },
      { key: 'rgba', label: 'RGBA' },
      { key: 'rgbPct', label: 'RGB %' },
      { key: 'hsl', label: 'HSL', short: true },
      { key: 'hsla', label: 'HSLA' },
      { key: 'hsv', label: 'HSV' },
      { key: 'cmyk', label: 'CMYK' },
      { key: 'lab', label: 'CIE LAB' },
      { key: 'oklch', label: 'OKLCH' },
      { key: 'named', label: 'CSS Named' },
    ];

    let html = '<div class="conversion-grid">';
    for (const item of order) {
      if (!showAll && format !== item.key) continue;
      const value = conversions[item.key];
      const swatchColor = item.key === 'named' ? getColorSwatch() : `rgba(${Math.round(state.color.r)}, ${Math.round(state.color.g)}, ${Math.round(state.color.b)}, ${state.color.a})`;

      html += `
        <div class="conversion-card" data-format="${item.key}">
          <div class="conversion-header">
            <span class="conversion-label">${item.label}</span>
            <button class="conversion-copy" data-value="${escapeHtml(value)}">Copy</button>
          </div>
          <div class="conversion-value" title="${escapeHtml(value)}">${escapeHtml(value)}</div>
          <div class="conversion-swatch" style="background: ${swatchColor};"></div>
        </div>
      `;
    }
    html += '</div>';

    elements.conversionsOutput.innerHTML = html;

    // Add copy handlers
    elements.conversionsOutput.querySelectorAll('.conversion-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.value).then(() => {
          btn.textContent = 'Copied!';
          btn.parentElement.parentElement.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.parentElement.parentElement.classList.remove('copied');
          }, 1500);
        });
      });
    });
  }

  function getColorSwatch() {
    return `rgba(${Math.round(state.color.r)}, ${Math.round(state.color.g)}, ${Math.round(state.color.b)}, ${state.color.a})`;
  }

  // ========== COLOR SPACE CONVERSIONS ==========

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
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
      h *= 60;
    }
    return { h, s, l };
  }

  function hslToRgb(h, s, l, a = 1) {
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
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    let h;
    if (max === min) h = 0;
    else if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    return { h, s, v };
  }

  function hsvToRgb(h, s, v, a = 1) {
    h /= 60;
    const i = Math.floor(h);
    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
  }

  function rgbToCmyk(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 1 };
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);
    return { c, m, y, k };
  }

  function cmykToRgb(c, m, y, k, a = 1) {
    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a };
  }

  function rgbToLab(r, g, b) {
    // sRGB to XYZ
    const toLinear = c => {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    let R = toLinear(r), G = toLinear(g), B = toLinear(b);

    // XYZ (D65)
    const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
    const Y = R * 0.2126729 + G * 0.7151522 + B * 0.0721750;
    const Z = R * 0.0193339 + G * 0.1191920 + B * 0.9503041;

    // XYZ to LAB
    const fx = X / 0.95047, fy = Y / 1.00000, fz = Z / 1.08883;
    const f = t => t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t + 16/116);

    const L = 116 * f(fy) - 16;
    const a = 500 * (f(fx) - f(fy));
    const b = 200 * (f(fy) - f(fz));
    return { L, a, b };
  }

  function labToRgb(L, a, b) {
    const fy = (L + 16) / 116;
    const fx = fy + a / 500;
    const fz = fy - b / 200;

    const fInv = t => t > 0.206893 ? t * t * t : (t - 16/116) / 7.787;

    const X = 0.95047 * fInv(fx);
    const Y = 1.00000 * fInv(fy);
    const Z = 1.08883 * fInv(fz);

    const R = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314;
    const G = X * -0.9692660 + Y * 1.8760108 + Z * 0.0415560;
    const B = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252;

    const toSRGB = c => {
      c = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055;
      return Math.round(Math.max(0, Math.min(255, c * 255)));
    };

    return { r: toSRGB(R), g: toSRGB(G), b: toSRGB(B), a: 1 };
  }

  function rgbToOklch(r, g, b) {
    // sRGB to linear
    const toLinear = c => {
      c /= 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    let R = toLinear(r), G = toLinear(g), B = toLinear(b);

    // Linear sRGB to LMS
    const L_ = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
    const M_ = 0.2119034982 * R + 0.6806995451 * G + 0.1073969567 * B;
    const S_ = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;

    // LMS to OKLAB
    const L = 0.2104542553 * L_ + 0.7936177850 * M_ - 0.0040720468 * S_;
    const a = 1.9779984951 * L_ - 2.4285922050 * M_ + 0.4505937099 * S_;
    const b = 0.0259040371 * L_ + 0.7827717662 * M_ - 0.8086757660 * S_;

    // OKLAB to OKLCH
    const C = Math.sqrt(a * a + b * b);
    const h = Math.atan2(b, a) * 180 / Math.PI;
    return { L, C, h: h < 0 ? h + 360 : h };
  }

  function oklchToRgb(L, C, h) {
    const hRad = h * Math.PI / 180;
    const a = C * Math.cos(hRad);
    const b_ = C * Math.sin(hRad);

    // OKLAB to LMS
    const L_ = L + 0.3963377774 * a + 0.2158037573 * b_;
    const M_ = L - 0.1055613458 * a - 0.0638541728 * b_;
    const S_ = L - 0.0894841775 * a - 1.2914855480 * b_;

    // LMS to linear sRGB
    const R = 4.0767416621 * L_ - 3.3077115913 * M_ + 0.2309699292 * S_;
    const G = -1.2684380046 * L_ + 2.6097574011 * M_ - 0.3413193965 * S_;
    const B = -0.0041960863 * L_ - 0.7034186147 * M_ + 1.7076147010 * S_;

    const toSRGB = c => {
      c = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055;
      return Math.round(Math.max(0, Math.min(255, c * 255)));
    };

    return { r: toSRGB(R), g: toSRGB(G), b: toSRGB(B), a: 1 };
  }

  function rgbToHex(r, g, b, a = 1, includeAlpha = false) {
    const toHex = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
    let hex = '#' + toHex(r) + toHex(g) + toHex(b);
    if (includeAlpha && a < 1) {
      hex += toHex(a * 255);
    }
    return hex.toUpperCase();
  }

  function findNamedColor(r, g, b) {
    let minDist = Infinity;
    let closest = null;
    for (const [name, hex] of Object.entries(NAMED_COLORS)) {
      const parsed = parseHex(hex);
      const dist = Math.pow(parsed.r - r, 2) + Math.pow(parsed.g - g, 2) + Math.pow(parsed.b - b, 2);
      if (dist < minDist) {
        minDist = dist;
        closest = name;
      }
    }
    return minDist < 100 ? closest : null;
  }

  // ========== PALETTE GENERATION ==========

  function generatePalette() {
    const type = elements.paletteType.value;
    const count = parseInt(elements.paletteCount.value) || 5;
    const baseHsl = rgbToHsl(state.color.r, state.color.g, state.color.b);
    state.palette = [];

    switch (type) {
      case 'complementary':
        state.palette.push(hslToRgb(baseHsl.h, baseHsl.s, baseHsl.l));
        state.palette.push(hslToRgb((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l));
        break;
      case 'split-complementary':
        state.palette.push(hslToRgb(baseHsl.h, baseHsl.s, baseHsl.l));
        state.palette.push(hslToRgb((baseHsl.h + 150) % 360, baseHsl.s, baseHsl.l));
        state.palette.push(hslToRgb((baseHsl.h + 210) % 360, baseHsl.s, baseHsl.l));
        break;
      case 'triadic':
        for (let i = 0; i < 3; i++) {
          state.palette.push(hslToRgb((baseHsl.h + i * 120) % 360, baseHsl.s, baseHsl.l));
        }
        break;
      case 'tetradic':
        for (let i = 0; i < 4; i++) {
          state.palette.push(hslToRgb((baseHsl.h + i * 90) % 360, baseHsl.s, baseHsl.l));
        }
        break;
      case 'analogous':
        for (let i = 0; i < count; i++) {
          const offset = (i - Math.floor(count / 2)) * 30;
          state.palette.push(hslToRgb((baseHsl.h + offset + 360) % 360, baseHsl.s, baseHsl.l));
        }
        break;
      case 'monochromatic':
        for (let i = 0; i < count; i++) {
          const l = Math.max(0.1, Math.min(0.9, baseHsl.l + (i - Math.floor(count / 2)) * 0.15));
          const s = Math.max(0.1, Math.min(1, baseHsl.s + (i - Math.floor(count / 2)) * 0.1));
          state.palette.push(hslToRgb(baseHsl.h, s, l));
        }
        break;
      case 'square':
        for (let i = 0; i < 4; i++) {
          state.palette.push(hslToRgb((baseHsl.h + i * 90) % 360, baseHsl.s, baseHsl.l));
        }
        break;
    }

    renderPalette();
    showToast(`Generated ${type} palette`);
  }

  function renderPalette() {
    if (state.palette.length === 0) return;

    let html = '<div class="palette-container">';
    html += '<h3 style="margin-bottom:1rem;color:var(--fg)">Generated Palette</h3>';
    html += '<div class="palette-row">';

    state.palette.forEach((c, i) => {
      const hex = rgbToHex(c.r, c.g, c.b);
      const hsl = rgbToHsl(c.r, c.g, c.b);
      html += `
        <div class="palette-color" data-index="${i}">
          <div class="palette-swatch" style="background: ${hex}"></div>
          <div class="palette-hex">${hex}</div>
          <div class="palette-format">HSL: ${Math.round(hsl.h)}, ${Math.round(hsl.s*100)}%, ${Math.round(hsl.l*100)}%</div>
        </div>
      `;
    });

    html += '</div>';
    html += '<div class="palette-actions">';
    html += '<button class="btn" id="palette-copy-all">Copy All HEX</button>';
    html += '<button class="btn" id="palette-export-css">Export CSS</button>';
    html += '<button class="btn" id="palette-export-json">Export JSON</button>';
    html += '</div></div>';

    elements.paletteOutput.innerHTML = html;

    document.getElementById('palette-copy-all').addEventListener('click', () => {
      const hexes = state.palette.map(c => rgbToHex(c.r, c.g, c.b)).join('\n');
      navigator.clipboard.writeText(hexes).then(() => showToast('Copied all HEX values'));
    });
    document.getElementById('palette-export-css').addEventListener('click', () => exportPalette('css'));
    document.getElementById('palette-export-json').addEventListener('click', () => exportPalette('json'));

    // Click to set as main color
    elements.paletteOutput.querySelectorAll('.palette-color').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.index);
        const c = state.palette[idx];
        elements.colorInput.value = rgbToHex(c.r, c.g, c.b);
        convert();
      });
    });
  }

  // ========== CONTRAST CHECKER ==========

  function checkContrast() {
    const bg = parseColor(elements.contrastBg.value);
    const fg = parseColor(elements.contrastFg.value);
    if (!bg || !fg) {
      showToast('Invalid color(s)');
      return;
    }

    const ratio = getContrastRatio(bg, fg);
    const aaNormal = ratio >= 4.5;
    const aaLarge = ratio >= 3;
    const aaaNormal = ratio >= 7;
    const aaaLarge = ratio >= 4.5;

    elements.contrastResult.innerHTML = `
      <div class="contrast-ratio">${ratio.toFixed(2)}:1</div>
      <div class="contrast-grade">
        <div class="grade-item ${aaNormal ? 'pass' : 'fail'}">
          <span class="grade-label">WCAG AA Normal</span>
          <span class="grade-value">${aaNormal ? '✓ Pass' : '✗ Fail'}</span>
        </div>
        <div class="grade-item ${aaLarge ? 'pass' : 'fail'}">
          <span class="grade-label">WCAG AA Large</span>
          <span class="grade-value">${aaLarge ? '✓ Pass' : '✗ Fail'}</span>
        </div>
        <div class="grade-item ${aaaNormal ? 'pass' : 'fail'}">
          <span class="grade-label">WCAG AAA Normal</span>
          <span class="grade-value">${aaaNormal ? '✓ Pass' : '✗ Fail'}</span>
        </div>
        <div class="grade-item ${aaaLarge ? 'pass' : 'fail'}">
          <span class="grade-label">WCAG AAA Large</span>
          <span class="grade-value">${aaaLarge ? '✓ Pass' : '✗ Fail'}</span>
        </div>
      </div>
    `;
  }

  function getContrastRatio(c1, c2) {
    const l1 = getLuminance(c1);
    const l2 = getLuminance(c2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function getLuminance(c) {
    const toLinear = v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(c.r) + 0.7152 * toLinear(c.g) + 0.0722 * toLinear(c.b);
  }

  // ========== EXPORT ==========

  function exportPalette(format) {
    const colors = state.palette.length > 0 ? state.palette : [state.color];
    let content, filename, mime;

    switch (format) {
      case 'css':
        content = generateCss(colors);
        filename = 'colors.css';
        mime = 'text/css';
        break;
      case 'scss':
        content = generateScss(colors);
        filename = 'colors.scss';
        mime = 'text/plain';
        break;
      case 'tailwind':
        content = generateTailwind(colors);
        filename = 'tailwind.colors.js';
        mime = 'application/javascript';
        break;
      case 'json':
        content = generateJson(colors);
        filename = 'colors.json';
        mime = 'application/json';
        break;
      case 'ase':
        content = generateAse(colors);
        filename = 'colors.ase';
        mime = 'application/octet-stream';
        break;
    }

    downloadBlob(content, filename, mime);
    showToast(`Exported as ${format.toUpperCase()}`);
  }

  function generateCss(colors) {
    let css = ':root {\n';
    colors.forEach((c, i) => {
      const hex = rgbToHex(c.r, c.g, c.b);
      const name = `color-${i + 1}`;
      css += `  --${name}: ${hex};\n`;
      css += `  --${name}-rgb: ${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)};\n`;
    });
    css += '}\n';
    return css;
  }

  function generateScss(colors) {
    let scss = '$colors: (\n';
    colors.forEach((c, i) => {
      const hex = rgbToHex(c.r, c.g, c.b);
      scss += `  'color-${i + 1}': ${hex},\n`;
    });
    scss += ');\n';
    return scss;
  }

  function generateTailwind(colors) {
    let js = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n';
    colors.forEach((c, i) => {
      const hex = rgbToHex(c.r, c.g, c.b);
      js += `        'color-${i + 1}': '${hex}',\n`;
    });
    js += '      }\n    }\n  }\n};\n';
    return js;
  }

  function generateJson(colors) {
    const data = colors.map((c, i) => ({
      name: `color-${i + 1}`,
      hex: rgbToHex(c.r, c.g, c.b),
      rgb: { r: Math.round(c.r), g: Math.round(c.g), b: Math.round(c.b) },
      hsl: rgbToHsl(c.r, c.g, c.b),
    }));
    return JSON.stringify(data, null, 2);
  }

  function generateAse(colors) {
    // Simplified ASE format (Adobe Swatch Exchange)
    // This is a minimal implementation
    const buffer = [];
    const writeUint16 = n => { buffer.push(n & 0xFF, (n >> 8) & 0xFF); };
    const writeUint32 = n => { buffer.push(n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF); };
    const writeFloat32 = f => {
      const view = new DataView(new ArrayBuffer(4));
      view.setFloat32(0, f, true);
      buffer.push(...new Uint8Array(view.buffer));
    };
    const writeString = s => {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(s);
      writeUint32(bytes.length);
      buffer.push(...bytes);
      // Null terminator
      buffer.push(0);
    };

    // ASE header
    buffer.push(...new TextEncoder().encode('ASEF'));
    writeUint16(1); // Major version
    writeUint16(0); // Minor version
    writeUint32(colors.length); // Number of blocks

    colors.forEach((c, i) => {
      // Block type: Color (1)
      writeUint16(1);
      // Name
      writeString(`Color ${i + 1}`);
      // Color model: RGB (RGB )
      buffer.push(...new TextEncoder().encode('RGB '));
      // Color data (3 floats)
      writeFloat32(c.r / 255);
      writeFloat32(c.g / 255);
      writeFloat32(c.b / 255);
      // Color type: Global (0)
      writeUint16(0);
    });

    return new Uint8Array(buffer);
  }

  // ========== UTILITIES ==========

  function randomColor() {
    const h = Math.random() * 360;
    const s = 0.5 + Math.random() * 0.5;
    const l = 0.3 + Math.random() * 0.4;
    const rgb = hslToRgb(h, s, l);
    elements.colorInput.value = rgbToHex(rgb.r, rgb.g, rgb.b);
    convert();
    showToast('Random color generated');
  }

  function pickColor() {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = rgbToHex(state.color.r, state.color.g, state.color.b);
    input.addEventListener('change', () => {
      elements.colorInput.value = input.value;
      convert();
    });
    input.click();
  }

  function downloadBlob(content, filename, mime) {
    const blob = typeof content === 'string' ? new Blob([content], { type: mime }) : new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": ''' })[c]);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();