// ASCII Art Generator - Main Script
(function() {
  'use strict';

  // ============================================
  // CHARACTER SETS
  // ============================================

  const CHARSETS = {
    standard: '@%#*+=-:. ',
    blocks: '█▓▒░ ',
    braille: '⣿⣷⣦⣤⣀ ',
    minimal: '#+-:. ',
    extended: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. '
  };

  const BANNER_FONTS = {
    standard: { chars: {}, height: 7 },
    big: { chars: {}, height: 10 },
    block: { chars: {}, height: 8 },
    lean: { chars: {}, height: 6 },
    shadow: { chars: {}, height: 7 },
    slant: { chars: {}, height: 8 },
    bubble: { chars: {}, height: 7 },
    digital: { chars: {}, height: 8 }
  };

  // Simple FIGlet-like fonts (subset for demo)
  const FIGLET_FONTS = {
    standard: {
      'A': ['  #  ', ' # # ', '#   #', '#####', '#   #', '#   #', '     '],
      'B': ['#### ', '#   #', '#   #', '#### ', '#   #', '#   #', '#### '],
      'C': [' ####', '#    ', '#    ', '#    ', '#    ', '#    ', ' ####'],
      'D': ['#### ', '#   #', '#   #', '#   #', '#   #', '#   #', '#### '],
      'E': ['#####', '#    ', '#    ', '#### ', '#    ', '#    ', '#####'],
      'F': ['#####', '#    ', '#    ', '#### ', '#    ', '#    ', '#    '],
      'G': [' ####', '#    ', '#    ', '#  ##', '#   #', '#   #', ' ####'],
      'H': ['#   #', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'],
      'I': ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '#####'],
      'J': ['#####', '  #  ', '  #  ', '  #  ', '# #  ', '# #  ', ' ##  '],
      'K': ['#   #', '#  # ', '# #  ', '##   ', '# #  ', '#  # ', '#   #'],
      'L': ['#    ', '#    ', '#    ', '#    ', '#    ', '#    ', '#####'],
      'M': ['#   #', '## ##', '# # #', '#   #', '#   #', '#   #', '#   #'],
      'N': ['#   #', '##  #', '# # #', '#  ##', '#   #', '#   #', '#   #'],
      'O': [' ####', '#   #', '#   #', '#   #', '#   #', '#   #', ' ####'],
      'P': ['#### ', '#   #', '#   #', '#### ', '#    ', '#    ', '#    '],
      'Q': [' ####', '#   #', '#   #', '#   #', '# # #', '#  # ', ' ####'],
      'R': ['#### ', '#   #', '#   #', '#### ', '# #  ', '#  # ', '#   #'],
      'S': [' ####', '#    ', '#    ', ' ####', '    #', '    #', '#### '],
      'T': ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '],
      'U': ['#   #', '#   #', '#   #', '#   #', '#   #', '#   #', ' ####'],
      'V': ['#   #', '#   #', '#   #', '#   #', '#   #', ' # # ', '  #  '],
      'W': ['#   #', '#   #', '#   #', '# # #', '# # #', '## ##', '#   #'],
      'X': ['#   #', '#   #', ' # # ', '  #  ', ' # # ', '#   #', '#   #'],
      'Y': ['#   #', '#   #', ' # # ', '  #  ', '  #  ', '  #  ', '  #  '],
      'Z': ['#####', '    #', '   # ', '  #  ', ' #   ', '#    ', '#####'],
      '0': [' ####', '#   #', '#  ##', '# # #', '##  #', '#   #', ' ####'],
      '1': ['  #  ', ' ##  ', '  #  ', '  #  ', '  #  ', '  #  ', '#####'],
      '2': [' ####', '#   #', '    #', '   # ', '  #  ', ' #   ', '#####'],
      '3': ['#####', '    #', '    #', ' ####', '    #', '    #', '#####'],
      '4': ['#  # ', '##  #', '# # #', '#  # ', '#####', '   # ', '   # '],
      '5': ['#####', '#    ', '#    ', '#### ', '    #', '    #', '#### '],
      '6': [' ####', '#    ', '#    ', '#### ', '#   #', '#   #', ' ####'],
      '7': ['#####', '    #', '   # ', '  #  ', ' #   ', '#    ', '#    '],
      '8': [' ####', '#   #', '#   #', ' ####', '#   #', '#   #', ' ####'],
      '9': [' ####', '#   #', '#   #', ' #####', '    #', '    #', ' ####'],
      '_': ['     ', '     ', '     ', '     ', '     ', '     ', '#####'],
      '-': ['     ', '     ', '     ', '#####', '     ', '     ', '     '],
      ' ': ['     ', '     ', '     ', '     ', '     ', '     ', '     ']
    }
  };

  // Fill missing chars with placeholder
  for (const font of Object.values(FIGLET_FONTS)) {
    for (let c = 32; c < 127; c++) {
      const ch = String.fromCharCode(c);
      if (!font[ch]) {
        font[ch] = font[' '] || ['     ', '     ', '     ', '     ', '     ', '     ', '     '];
      }
    }
  }

  const ANIMATIONS = {
    spinner: [
      '|', '/', '-', '\\'
    ],
    bouncing: [
      '  o\n',
      ' o \n',
      'o  \n',
      ' o \n'
    ],
    wave: [
      '~~~~~',
      '~~~~~',
      '~~~~~',
      '~~~~~'
    ],
    loading: [
      '[        ]',
      '[=       ]',
      '[==      ]',
      '[===     ]',
      '[====    ]',
      '[=====   ]',
      '[======  ]',
      '[======= ]',
      '[========]'
    ],
    pulse: [
      '  *  ',
      ' * * ',
      '*   *',
      ' * * ',
      '  *  '
    ],
    rotate: [
      '  ___  \n /   \\ \n|     |\n \\___/ ',
      '  ___  \n /   \\ \n|  @  |\n \\___/ ',
      '  ___  \n /   \\ \n|     |\n \\___/ '
    ],
    matrix: [
      '10101\n01010\n10101\n01010',
      '01010\n10101\n01010\n10101',
      '10101\n01010\n10101\n01010',
      '01010\n10101\n01010\n10101'
    ],
    fire: [
      '  ^  \n ^ ^ \n^ ^ ^',
      ' ^ ^ \n^ ^ ^\n ^ ^ ',
      '^ ^ ^\n ^ ^ \n  ^  ',
      ' ^ ^ \n^ ^ ^\n ^ ^ '
    ]
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const state = {
    mode: 'image',
    image: null,
    charset: 'standard',
    customCharset: '@#$%*+=-:.',
    colorMode: 'mono',
    customPalette: ['#ff4fa3', '#ff9f1c', '#2ee6a6', '#35c3ff', '#9b5cff', '#f5f5f7'],
    outputWidth: 120,
    aspectRatio: 0.5,
    invert: false,
    dithering: 'none',
    textInput: 'KING_YOSEF_',
    bannerFont: 'standard',
    animationType: 'spinner',
    animFrames: 16,
    uiTheme: 'dark',
    imagesConverted: 0,
    bannersCreated: 0,
    animationsMade: 0,
    currentAscii: '',
    currentFrames: []
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================

  const els = {};
  function cacheElements() {
    els.bubbles = document.getElementById('bubbles');
    els.modeTabs = document.querySelectorAll('.mode-tab[data-mode]');
    els.colorTabs = document.querySelectorAll('.color-tab');
    els.imageOptions = document.getElementById('imageOptions');
    els.textOptions = document.getElementById('textOptions');
    els.animationOptions = document.getElementById('animationOptions');
    els.customCharsetOptions = document.getElementById('customCharsetOptions');
    els.customPaletteOptions = document.getElementById('customPaletteOptions');
    els.charset = document.getElementById('charset');
    els.customCharset = document.getElementById('customCharset');
    els.outputWidth = document.getElementById('outputWidth');
    els.widthValue = document.getElementById('widthValue');
    els.aspectRatio = document.getElementById('aspectRatio');
    els.aspectValue = document.getElementById('aspectValue');
    els.invertToggle = document.getElementById('invertToggle');
    els.dithering = document.getElementById('dithering');
    els.generateBtn = document.getElementById('generateBtn');
    els.randomBtn = document.getElementById('randomBtn');
    els.imageUpload = document.getElementById('imageUpload');
    els.dropZone = document.getElementById('dropZone');
    els.textInput = document.getElementById('textInput');
    els.bannerFont = document.getElementById('bannerFont');
    els.animationType = document.getElementById('animationType');
    els.animFrames = document.getElementById('animFrames');
    els.framesValue = document.getElementById('framesValue');
    els.copyBtn = document.getElementById('copyBtn');
    els.downloadTxtBtn = document.getElementById('downloadTxtBtn');
    els.downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
    els.downloadGifBtn = document.getElementById('downloadGifBtn');
    els.shareBtn = document.getElementById('shareBtn');
    els.newAsciiBtn = document.getElementById('newAsciiBtn');
    els.asciiOutput = document.getElementById('asciiOutput');
    els.gameStatus = document.getElementById('gameStatus');
    els.resultsModal = document.getElementById('resultsModal');
    els.resultWidth = document.getElementById('resultWidth');
    els.resultHeight = document.getElementById('resultHeight');
    els.resultCharset = document.getElementById('resultCharset');
    els.resultColorMode = document.getElementById('resultColorMode');
    els.shareBtnModal = document.getElementById('shareBtnModal');
    els.downloadBtnModal = document.getElementById('downloadBtnModal');
    els.newAsciiBtnModal = document.getElementById('newAsciiBtnModal');
    els.uiTheme = document.getElementById('uiTheme');
    els.imagesConverted = document.getElementById('imagesConverted');
    els.bannersCreated = document.getElementById('bannersCreated');
    els.animationsMade = document.getElementById('animationsMade');
    els.puzzleLabel = document.getElementById('puzzleLabel');
    els.puzzleMeta = document.getElementById('puzzleMeta');
  }

  // ============================================
  // UTILITIES
  // ============================================

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

  function setActiveTab(tabs, value) {
    tabs.forEach(tab => {
      const isActive = tab.dataset.mode === value || tab.dataset.color === value;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });
  }

  function loadStats() {
    const saved = localStorage.getItem('asciiArtStats');
    if (saved) {
      const data = JSON.parse(saved);
      state.imagesConverted = data.imagesConverted || 0;
      state.bannersCreated = data.bannersCreated || 0;
      state.animationsMade = data.animationsMade || 0;
      updateStatsDisplay();
    }
  }

  function saveStats() {
    localStorage.setItem('asciiArtStats', JSON.stringify({
      imagesConverted: state.imagesConverted,
      bannersCreated: state.bannersCreated,
      animationsMade: state.animationsMade
    }));
  }

  function updateStatsDisplay() {
    els.imagesConverted.textContent = state.imagesConverted;
    els.bannersCreated.textContent = state.bannersCreated;
    els.animationsMade.textContent = state.animationsMade;
  }

  function loadTheme() {
    const theme = localStorage.getItem('asciiArtTheme') || 'dark';
    state.uiTheme = theme;
    els.uiTheme.value = theme;
    document.body.classList.toggle('light-theme', theme === 'light');
  }

  function saveTheme(theme) {
    localStorage.setItem('asciiArtTheme', theme);
    state.uiTheme = theme;
    document.body.classList.toggle('light-theme', theme === 'light');
  }

  // ============================================
  // IMAGE TO ASCII
  // ============================================

  function imageToAscii(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const targetWidth = state.outputWidth;
    const targetHeight = Math.round(targetWidth * state.aspectRatio * (img.height / img.width));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;

    const charset = state.customCharset || CHARSETS[state.charset];
    const chars = charset.split('');
    const charCount = chars.length;

    let ascii = '';
    const colorData = [];

    // Apply dithering if selected
    let processedData = data;
    if (state.dithering !== 'none') {
      processedData = applyDithering(data, targetWidth, targetHeight, state.dithering);
    }

    for (let y = 0; y < targetHeight; y++) {
      let line = '';
      const lineColors = [];
      for (let x = 0; x < targetWidth; x++) {
        const idx = (y * targetWidth + x) * 4;
        const r = processedData[idx];
        const g = processedData[idx + 1];
        const b = processedData[idx + 2];
        const a = processedData[idx + 3];

        if (a < 128) {
          line += ' ';
          lineColors.push(null);
          continue;
        }

        // Calculate luminance
        let luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        if (state.invert) luminance = 255 - luminance;

        const charIndex = Math.min(charCount - 1, Math.floor((luminance / 255) * charCount));
        const char = chars[charIndex];
        line += char;

        if (state.colorMode !== 'mono') {
          lineColors.push({ r, g, b });
        }
      }
      ascii += line + '\n';
      if (state.colorMode !== 'mono') colorData.push(lineColors);
    }

    return { ascii: ascii.trimEnd(), width: targetWidth, height: targetHeight, colorData };
  }

  function applyDithering(data, width, height, method) {
    const newData = new Uint8ClampedArray(data);

    if (method === 'floydsteinberg') {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const oldR = newData[idx];
          const oldG = newData[idx + 1];
          const oldB = newData[idx + 2];

          const newR = oldR > 127 ? 255 : 0;
          const newG = oldG > 127 ? 255 : 0;
          const newB = oldB > 127 ? 255 : 0;

          newData[idx] = newR;
          newData[idx + 1] = newG;
          newData[idx + 2] = newB;

          const errR = oldR - newR;
          const errG = oldG - newG;
          const errB = oldB - newB;

          // Floyd-Steinberg diffusion
          if (x + 1 < width) {
            const nIdx = (y * width + x + 1) * 4;
            newData[nIdx] = clamp(newData[nIdx] + errR * 7 / 16);
            newData[nIdx + 1] = clamp(newData[nIdx + 1] + errG * 7 / 16);
            newData[nIdx + 2] = clamp(newData[nIdx + 2] + errB * 7 / 16);
          }
          if (x > 0 && y + 1 < height) {
            const nIdx = ((y + 1) * width + x - 1) * 4;
            newData[nIdx] = clamp(newData[nIdx] + errR * 3 / 16);
            newData[nIdx + 1] = clamp(newData[nIdx + 1] + errG * 3 / 16);
            newData[nIdx + 2] = clamp(newData[nIdx + 2] + errB * 3 / 16);
          }
          if (y + 1 < height) {
            const nIdx = ((y + 1) * width + x) * 4;
            newData[nIdx] = clamp(newData[nIdx] + errR * 5 / 16);
            newData[nIdx + 1] = clamp(newData[nIdx + 1] + errG * 5 / 16);
            newData[nIdx + 2] = clamp(newData[nIdx + 2] + errB * 5 / 16);
          }
          if (x + 1 < width && y + 1 < height) {
            const nIdx = ((y + 1) * width + x + 1) * 4;
            newData[nIdx] = clamp(newData[nIdx] + errR * 1 / 16);
            newData[nIdx + 1] = clamp(newData[nIdx + 1] + errG * 1 / 16);
            newData[nIdx + 2] = clamp(newData[nIdx + 2] + errB * 1 / 16);
          }
        }
      }
    } else if (method === 'ordered') {
      // Bayer matrix 4x4
      const bayer = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
      ];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const threshold = (bayer[y % 4][x % 4] + 0.5) / 16 * 255;
          const lum = 0.299 * newData[idx] + 0.587 * newData[idx + 1] + 0.114 * newData[idx + 2];
          const val = lum > threshold ? 255 : 0;
          newData[idx] = newData[idx + 1] = newData[idx + 2] = val;
        }
      }
    } else if (method === 'atkinson') {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const oldR = newData[idx];
          const oldG = newData[idx + 1];
          const oldB = newData[idx + 2];

          const newR = oldR > 127 ? 255 : 0;
          const newG = oldG > 127 ? 255 : 0;
          const newB = oldB > 127 ? 255 : 0;

          newData[idx] = newR;
          newData[idx + 1] = newG;
          newData[idx + 2] = newB;

          const errR = (oldR - newR) / 8;
          const errG = (oldG - newG) / 8;
          const errB = (oldB - newB) / 8;

          const diffs = [
            [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]
          ];
          for (const [dx, dy] of diffs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = (ny * width + nx) * 4;
              newData[nIdx] = clamp(newData[nIdx] + errR);
              newData[nIdx + 1] = clamp(newData[nIdx + 1] + errG);
              newData[nIdx + 2] = clamp(newData[nIdx + 2] + errB);
            }
          }
        }
      }
    }

    return newData;
  }

  function clamp(val) {
    return Math.max(0, Math.min(255, Math.round(val)));
  }

  // ============================================
  // TEXT BANNER
  // ============================================

  function generateBanner() {
    const font = FIGLET_FONTS[state.bannerFont] || FIGLET_FONTS.standard;
    const text = state.textInput.toUpperCase();
    const height = font['A']?.length || 7;
    let lines = new Array(height).fill('');

    for (const char of text) {
      const charData = font[char] || font[' '];
      for (let i = 0; i < height; i++) {
        lines[i] += charData[i] + ' ';
      }
    }

    return lines.join('\n');
  }

  // ============================================
  // ANIMATIONS
  // ============================================

  function generateAnimation() {
    const frames = ANIMATIONS[state.animationType] || ANIMATIONS.spinner;
    const frameCount = Math.min(state.animFrames, frames.length * 4);
    const result = [];

    for (let i = 0; i < frameCount; i++) {
      result.push(frames[i % frames.length]);
    }

    return result;
  }

  // ============================================
  // COLOR RENDERING
  // ============================================

  function renderAsciiHtml(ascii, colorData) {
    if (state.colorMode === 'mono') {
      return `<pre class="ascii-output">${escapeHtml(ascii)}</pre>`;
    }

    const lines = ascii.split('\n');
    let html = '<pre class="ascii-output ansi">';

    if (state.colorMode === 'ansi') {
      // ANSI 16-color approximation
      for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        const colors = colorData[y] || [];
        let lineHtml = '';
        for (let x = 0; x < line.length; x++) {
          const char = line[x];
          const color = colors[x];
          if (color) {
            const ansiColor = rgbToAnsi(color.r, color.g, color.b);
            lineHtml += `<span style="color: ${ansiColor}">${escapeHtml(char)}</span>`;
          } else {
            lineHtml += escapeHtml(char);
          }
        }
        html += lineHtml + '\n';
      }
    } else if (state.colorMode === 'truecolor') {
      for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        const colors = colorData[y] || [];
        let lineHtml = '';
        for (let x = 0; x < line.length; x++) {
          const char = line[x];
          const color = colors[x];
          if (color) {
            lineHtml += `<span style="color: rgb(${color.r},${color.g},${color.b})">${escapeHtml(char)}</span>`;
          } else {
            lineHtml += escapeHtml(char);
          }
        }
        html += lineHtml + '\n';
      }
    } else if (state.colorMode === 'custom') {
      const palette = state.customPalette;
      for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        const colors = colorData[y] || [];
        let lineHtml = '';
        for (let x = 0; x < line.length; x++) {
          const char = line[x];
          const color = colors[x];
          if (color) {
            const idx = Math.floor((0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255 * palette.length);
            lineHtml += `<span style="color: ${palette[Math.min(idx, palette.length - 1)]}">${escapeHtml(char)}</span>`;
          } else {
            lineHtml += escapeHtml(char);
          }
        }
        html += lineHtml + '\n';
      }
    }

    html += '</pre>';
    return html;
  }

  function rgbToAnsi(r, g, b) {
    // Simple 16-color ANSI mapping
    const colors = [
      '#000000', '#800000', '#008000', '#808000',
      '#000080', '#800080', '#008080', '#c0c0c0',
      '#808080', '#ff0000', '#00ff00', '#ffff00',
      '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
    ];
    let minDist = Infinity, best = '#ffffff';
    for (const c of colors) {
      const cr = parseInt(c.slice(1, 3), 16);
      const cg = parseInt(c.slice(3, 5), 16);
      const cb = parseInt(c.slice(5, 7), 16);
      const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
      if (dist < minDist) { minDist = dist; best = c; }
    }
    return best;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  function downloadText(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function downloadHtml(filename, content) {
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>ASCII Art</title>
<style>body{background:#0f0f14;color:#f5f5f7;font-family:monospace;padding:2rem;}pre{font-size:0.7rem;line-height:1.1;}</style>
</head><body>${content}</body></html>`;
    downloadText(filename, html);
  }

  function generateGif(frames) {
    // Simple GIF generation using canvas (basic implementation)
    // For now, just download as text with frame separators
    const content = frames.join('\n\n---FRAME---\n\n');
    downloadText(`ascii-animation-${Date.now()}.txt`, content);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!');
    }).catch(() => {
      showToast('Copy failed');
    });
  }

  function shareAscii() {
    const text = state.currentAscii;
    if (navigator.share) {
      navigator.share({ title: 'ASCII Art', text }).catch(() => {});
    } else {
      copyToClipboard(text);
    }
  }

  // ============================================
  // MAIN GENERATION
  // ============================================

  function generate() {
    els.gameStatus.textContent = 'Generating...';

    setTimeout(() => {
      if (state.mode === 'image') {
        if (!state.image) {
          showToast('Please upload an image first');
          els.gameStatus.textContent = 'Select a mode and configure options, then click "Generate ASCII"';
          return;
        }
        const result = imageToAscii(state.image);
        state.currentAscii = result.ascii;
        els.asciiOutput.innerHTML = renderAsciiHtml(result.ascii, result.colorData);
        els.resultWidth.textContent = result.width;
        els.resultHeight.textContent = result.height;
        state.imagesConverted++;
        saveStats();
        updateStatsDisplay();
      } else if (state.mode === 'text') {
        const ascii = generateBanner();
        state.currentAscii = ascii;
        els.asciiOutput.innerHTML = `<pre class="ascii-output">${escapeHtml(ascii)}</pre>`;
        const lines = ascii.split('\n');
        els.resultWidth.textContent = Math.max(...lines.map(l => l.length));
        els.resultHeight.textContent = lines.length;
        state.bannersCreated++;
        saveStats();
        updateStatsDisplay();
      } else if (state.mode === 'animation') {
        const frames = generateAnimation();
        state.currentFrames = frames;
        state.currentAscii = frames.join('\n\n---FRAME---\n\n');
        // Show first frame
        els.asciiOutput.innerHTML = `<pre class="ascii-output animation-preview">${escapeHtml(frames[0])}</pre>`;
        els.resultWidth.textContent = Math.max(...frames[0].split('\n').map(l => l.length));
        els.resultHeight.textContent = frames[0].split('\n').length;
        els.resultCharset.textContent = 'Animation';
        state.animationsMade++;
        saveStats();
        updateStatsDisplay();

        // Animate preview
        let frameIdx = 0;
        const animate = () => {
          if (els.asciiOutput.querySelector('.animation-preview')) {
            els.asciiOutput.querySelector('.animation-preview').textContent = frames[frameIdx];
            frameIdx = (frameIdx + 1) % frames.length;
            requestAnimationFrame(() => setTimeout(animate, 100));
          }
        };
        animate();
      }

      els.resultCharset.textContent = state.charset === 'custom' ? 'Custom' : state.charset.charAt(0).toUpperCase() + state.charset.slice(1);
      els.resultColorMode.textContent = state.colorMode.charAt(0).toUpperCase() + state.colorMode.slice(1);

      // Show controls
      els.copyBtn.hidden = false;
      els.downloadTxtBtn.hidden = false;
      els.downloadHtmlBtn.hidden = false;
      els.downloadGifBtn.hidden = state.mode !== 'animation';
      els.shareBtn.hidden = false;
      els.newAsciiBtn.hidden = false;
      els.shareBtnModal.hidden = false;
      els.downloadBtnModal.hidden = false;

      els.resultsModal.hidden = false;
      els.gameStatus.textContent = 'ASCII generated! Choose an export option.';
    }, 100);
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function setMode(mode) {
    state.mode = mode;
    setActiveTab(els.modeTabs, mode);

    els.imageOptions.hidden = mode !== 'image';
    els.textOptions.hidden = mode !== 'text';
    els.animationOptions.hidden = mode !== 'animation';

    els.puzzleLabel.textContent = mode === 'image' ? 'Image to ASCII' : mode === 'text' ? 'Text Banner' : 'ASCII Animation';
  }

  function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.image = img;
        els.dropZone.classList.add('has-file');
        els.dropZone.innerHTML = `<p>${file.name}</p><p class="file-info">${img.width}×${img.height}px</p>`;
        showToast('Image loaded');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
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
      tab.addEventListener('click', () => {
        state.colorMode = tab.dataset.color;
        setActiveTab(els.colorTabs, state.colorMode);
        els.customPaletteOptions.hidden = state.colorMode !== 'custom';
      });
    });

    // Charset
    els.charset.addEventListener('change', () => {
      state.charset = els.charset.value;
      els.customCharsetOptions.hidden = state.charset !== 'custom';
    });

    els.customCharset.addEventListener('input', () => {
      state.customCharset = els.customCharset.value;
    });

    // Width
    els.outputWidth.addEventListener('input', () => {
      state.outputWidth = parseInt(els.outputWidth.value);
      els.widthValue.textContent = state.outputWidth;
    });

    // Aspect ratio
    els.aspectRatio.addEventListener('input', () => {
      state.aspectRatio = parseFloat(els.aspectRatio.value);
      els.aspectValue.textContent = state.aspectRatio.toFixed(2);
    });

    // Invert
    els.invertToggle.addEventListener('change', () => {
      state.invert = els.invertToggle.checked;
    });

    // Dithering
    els.dithering.addEventListener('change', () => {
      state.dithering = els.dithering.value;
    });

    // Custom palette
    els.customPalette.addEventListener('input', () => {
      state.customPalette = els.customPalette.value.split(',').map(c => c.trim()).filter(c => c);
    });

    // Text input
    els.textInput.addEventListener('input', () => {
      state.textInput = els.textInput.value;
    });

    // Banner font
    els.bannerFont.addEventListener('change', () => {
      state.bannerFont = els.bannerFont.value;
    });

    // Animation
    els.animationType.addEventListener('change', () => {
      state.animationType = els.animationType.value;
    });

    els.animFrames.addEventListener('input', () => {
      state.animFrames = parseInt(els.animFrames.value);
      els.framesValue.textContent = state.animFrames;
    });

    // Buttons
    els.generateBtn.addEventListener('click', generate);
    els.randomBtn.addEventListener('click', () => {
      // Generate random pattern
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
        ctx.fillRect(Math.random() * 200, Math.random() * 200, 10, 10);
      }
      const img = new Image();
      img.onload = () => {
        state.image = img;
        els.dropZone.classList.add('has-file');
        els.dropZone.innerHTML = `<p>Random Pattern</p><p class="file-info">200×200px</p>`;
        generate();
      };
      img.src = canvas.toDataURL();
    });

    els.copyBtn.addEventListener('click', () => copyToClipboard(state.currentAscii));
    els.downloadTxtBtn.addEventListener('click', () => downloadText(`ascii-${Date.now()}.txt`, state.currentAscii));
    els.downloadHtmlBtn.addEventListener('click', () => downloadHtml(`ascii-${Date.now()}.html`, els.asciiOutput.innerHTML));
    els.downloadGifBtn.addEventListener('click', () => generateGif(state.currentFrames));
    els.shareBtn.addEventListener('click', shareAscii);
    els.newAsciiBtn.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      els.asciiOutput.innerHTML = '';
      els.gameStatus.textContent = 'Select a mode and configure options, then click "Generate ASCII"';
    });
    els.shareBtnModal.addEventListener('click', shareAscii);
    els.downloadBtnModal.addEventListener('click', () => downloadText(`ascii-${Date.now()}.txt`, state.currentAscii));
    els.newAsciiBtnModal.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      els.asciiOutput.innerHTML = '';
      els.gameStatus.textContent = 'Select a mode and configure options, then click "Generate ASCII"';
    });

    // Image upload
    els.dropZone.addEventListener('click', () => els.imageUpload.click());
    els.imageUpload.addEventListener('change', (e) => {
      if (e.target.files[0]) handleImageUpload(e.target.files[0]);
    });

    // Drag and drop
    els.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.dropZone.style.borderColor = 'var(--accent-4)';
    });
    els.dropZone.addEventListener('dragleave', () => {
      els.dropZone.style.borderColor = 'var(--border)';
    });
    els.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      els.dropZone.style.borderColor = 'var(--border)';
      if (e.dataTransfer.files[0]) handleImageUpload(e.dataTransfer.files[0]);
    });

    // Theme
    els.uiTheme.addEventListener('change', () => saveTheme(els.uiTheme.value));
  }

  // ============================================
  // BUBBLE ANIMATION
  // ============================================

  function initBubbles() {
    const colors = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)'];
    const count = 25;

    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'float';
      bubble.style.setProperty('--c', colors[Math.floor(Math.random() * colors.length)]);
      bubble.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`);
      bubble.style.setProperty('--duration', `${15 + Math.random() * 20}s`);
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.width = bubble.style.height = `${10 + Math.random() * 40}px`;
      bubble.style.animationDelay = `${-Math.random() * 30}s`;
      els.bubbles.appendChild(bubble);
    }
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
    setActiveTab(els.colorTabs, state.colorMode);
    els.customCharsetOptions.hidden = state.charset !== 'custom';
    els.customPaletteOptions.hidden = state.colorMode !== 'custom';

    console.log('ASCII Art Generator initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();