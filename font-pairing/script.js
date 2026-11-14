const FontPairingTool = (() => {
  let fontsData = [];
  let currentHeadingFont = '';
  let currentBodyFont = '';
  let currentTheme = 'dark';

  const elements = {};

  // Google Fonts API key - using a demo key or fallback to static data
  // In production, you'd use a real API key
  const GOOGLE_FONTS_URL = 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyB5W5vpLqQpJxK5fJqJqJqJqJqJqJqJqJq';
  // Fallback static font data for offline/demo use
  const FALLBACK_FONTS = [
    { family: 'Inter', category: 'sans-serif', variants: ['300','400','500','600','700','800','900'], subsets: ['latin','cyrillic','greek'], popularity: 1 },
    { family: 'Roboto', category: 'sans-serif', variants: ['300','400','500','700','900'], subsets: ['latin','cyrillic','greek'], popularity: 2 },
    { family: 'Open Sans', category: 'sans-serif', variants: ['300','400','500','600','700','800'], subsets: ['latin','cyrillic','greek'], popularity: 3 },
    { family: 'Lato', category: 'sans-serif', variants: ['300','400','700','900'], subsets: ['latin'], popularity: 4 },
    { family: 'Montserrat', category: 'sans-serif', variants: ['300','400','500','600','700','800','900'], subsets: ['latin'], popularity: 5 },
    { family: 'Source Sans Pro', category: 'sans-serif', variants: ['300','400','600','700','900'], subsets: ['latin'], popularity: 6 },
    { family: 'Oswald', category: 'sans-serif', variants: ['300','400','500','600','700'], subsets: ['latin'], popularity: 7 },
    { family: 'Raleway', category: 'sans-serif', variants: ['300','400','500','600','700','800','900'], subsets: ['latin'], popularity: 8 },
    { family: 'Poppins', category: 'sans-serif', variants: ['300','400','500','600','700','800','900'], subsets: ['latin'], popularity: 9 },
    { family: 'Nunito', category: 'sans-serif', variants: ['300','400','500','600','700','800','900'], subsets: ['latin'], popularity: 10 },
    { family: 'Merriweather', category: 'serif', variants: ['300','400','700','900'], subsets: ['latin'], popularity: 1 },
    { family: 'Playfair Display', category: 'serif', variants: ['400','500','600','700','800','900'], subsets: ['latin'], popularity: 2 },
    { family: 'Roboto Slab', category: 'serif', variants: ['300','400','500','700','900'], subsets: ['latin'], popularity: 3 },
    { family: 'Lora', category: 'serif', variants: ['400','500','600','700'], subsets: ['latin','cyrillic'], popularity: 4 },
    { family: 'Crimson Text', category: 'serif', variants: ['400','600','700'], subsets: ['latin'], popularity: 5 },
    { family: 'Libre Baskerville', category: 'serif', variants: ['400','700'], subsets: ['latin'], popularity: 6 },
    { family: 'PT Serif', category: 'serif', variants: ['400','700'], subsets: ['latin','cyrillic'], popularity: 7 },
    { family: 'Arvo', category: 'serif', variants: ['400','700'], subsets: ['latin'], popularity: 8 },
    { family: 'JetBrains Mono', category: 'monospace', variants: ['300','400','500','600','700','800'], subsets: ['latin'], popularity: 1 },
    { family: 'Fira Code', category: 'monospace', variants: ['300','400','500','600','700'], subsets: ['latin'], popularity: 2 },
    { family: 'Source Code Pro', category: 'monospace', variants: ['300','400','500','600','700','900'], subsets: ['latin'], popularity: 3 },
    { family: 'IBM Plex Mono', category: 'monospace', variants: ['300','400','500','600','700'], subsets: ['latin'], popularity: 4 },
    { family: 'Space Mono', category: 'monospace', variants: ['400','700'], subsets: ['latin'], popularity: 5 },
    { family: 'Fredoka', category: 'display', variants: ['400','500','600','700'], subsets: ['latin'], popularity: 1 },
    { family: 'Bebas Neue', category: 'display', variants: ['400'], subsets: ['latin'], popularity: 2 },
    { family: 'Anton', category: 'display', variants: ['400'], subsets: ['latin'], popularity: 3 },
    { family: 'Oswald', category: 'display', variants: ['300','400','500','600','700'], subsets: ['latin'], popularity: 4 },
    { family: 'Permanent Marker', category: 'handwriting', variants: ['400'], subsets: ['latin'], popularity: 1 },
    { family: 'Patrick Hand', category: 'handwriting', variants: ['400'], subsets: ['latin'], popularity: 2 },
    { family: 'Caveat', category: 'handwriting', variants: ['400','500','600','700'], subsets: ['latin','cyrillic'], popularity: 3 },
    { family: 'Comic Neue', category: 'handwriting', variants: ['300','400','700'], subsets: ['latin'], popularity: 4 },
    { family: 'Kalam', category: 'handwriting', variants: ['300','400','700'], subsets: ['latin','devanagari'], popularity: 5 },
  ];

  // Predefined good pairings
  const PREDEFINED_PAIRS = [
    { heading: 'Playfair Display', body: 'Source Sans Pro', strategy: 'contrast' },
    { heading: 'Merriweather', body: 'Open Sans', strategy: 'contrast' },
    { heading: 'Montserrat', body: 'Merriweather', strategy: 'contrast' },
    { heading: 'Oswald', body: 'Lora', strategy: 'contrast' },
    { heading: 'Roboto Slab', body: 'Roboto', strategy: 'harmony' },
    { heading: 'Lora', body: 'Lato', strategy: 'contrast' },
    { heading: 'Bebas Neue', body: 'Montserrat', strategy: 'contrast' },
    { heading: 'Anton', body: 'Open Sans', strategy: 'contrast' },
    { heading: 'Poppins', body: 'Nunito', strategy: 'complementary' },
    { heading: 'Fredoka', body: 'Inter', strategy: 'contrast' },
    { heading: 'Crimson Text', body: 'Source Sans Pro', strategy: 'contrast' },
    { heading: 'Libre Baskerville', body: 'Montserrat', strategy: 'contrast' },
  ];

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    loadFonts();
  }

  function cacheElements() {
    elements.headingFont = document.getElementById('heading-font');
    elements.bodyFont = document.getElementById('body-font');
    elements.headingWeight = document.getElementById('heading-weight');
    elements.bodyWeight = document.getElementById('body-weight');
    elements.filterCategory = document.getElementById('filter-category');
    elements.filterPopularity = document.getElementById('filter-popularity');
    elements.filterLanguage = document.getElementById('filter-language');
    elements.previewText = document.getElementById('preview-text');
    elements.previewHeading = document.getElementById('preview-heading');
    elements.previewBody = document.getElementById('preview-body');
    elements.headingSize = document.getElementById('heading-size');
    elements.headingSizeValue = document.getElementById('heading-size-value');
    elements.bodySize = document.getElementById('body-size');
    elements.bodySizeValue = document.getElementById('body-size-value');
    elements.lineHeight = document.getElementById('line-height');
    elements.lineHeightValue = document.getElementById('line-height-value');
    elements.letterSpacing = document.getElementById('letter-spacing');
    elements.letterSpacingValue = document.getElementById('letter-spacing-value');
    elements.themeBtns = document.querySelectorAll('.theme-btn');
    elements.btnGeneratePair = document.getElementById('btn-generate-pair');
    elements.btnRandomPair = document.getElementById('btn-random-pair');
    elements.btnSwapFonts = document.getElementById('btn-swap-fonts');
    elements.btnCopyCss = document.getElementById('btn-copy-css');
    elements.btnCopyTailwind = document.getElementById('btn-copy-tailwind');
    elements.btnExportFonts = document.getElementById('btn-export-fonts');
    elements.alternatives = document.getElementById('alternatives');
  }

  function bindEvents() {
    elements.headingFont.addEventListener('change', () => {
      currentHeadingFont = elements.headingFont.value;
      loadFont(currentHeadingFont, 'heading');
      updatePreview();
      showAlternatives();
    });

    elements.bodyFont.addEventListener('change', () => {
      currentBodyFont = elements.bodyFont.value;
      loadFont(currentBodyFont, 'body');
      updatePreview();
      showAlternatives();
    });

    elements.headingWeight.addEventListener('change', updatePreview);
    elements.bodyWeight.addEventListener('change', updatePreview);

    elements.filterCategory.addEventListener('change', populateFontDropdowns);
    elements.filterPopularity.addEventListener('change', populateFontDropdowns);
    elements.filterLanguage.addEventListener('change', populateFontDropdowns);

    elements.previewText.addEventListener('input', updatePreview);

    elements.headingSize.addEventListener('input', () => {
      elements.headingSizeValue.textContent = elements.headingSize.value + 'px';
      updatePreview();
    });
    elements.bodySize.addEventListener('input', () => {
      elements.bodySizeValue.textContent = elements.bodySize.value + 'px';
      updatePreview();
    });
    elements.lineHeight.addEventListener('input', () => {
      elements.lineHeightValue.textContent = elements.lineHeight.value;
      updatePreview();
    });
    elements.letterSpacing.addEventListener('input', () => {
      elements.letterSpacingValue.textContent = elements.letterSpacing.value + 'em';
      updatePreview();
    });

    elements.themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTheme = btn.dataset.theme;
        applyTheme(currentTheme);
      });
    });

    elements.btnGeneratePair.addEventListener('click', generatePair);
    elements.btnRandomPair.addEventListener('click', randomPair);
    elements.btnSwapFonts.addEventListener('click', swapFonts);
    elements.btnCopyCss.addEventListener('click', copyCss);
    elements.btnCopyTailwind.addEventListener('click', copyTailwind);
    elements.btnExportFonts.addEventListener('click', exportFontFace);
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

  async function loadFonts() {
    try {
      // Try to fetch from Google Fonts API
      const response = await fetch(GOOGLE_FONTS_URL);
      if (response.ok) {
        const data = await response.json();
        fontsData = data.items.map(font => ({
          family: font.family,
          category: font.category,
          variants: font.variants,
          subsets: font.subsets,
          popularity: font.popularity || 999
        }));
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      // Use fallback data
      fontsData = FALLBACK_FONTS;
    }
    populateFontDropdowns();
    // Set default fonts
    elements.headingFont.value = 'Fredoka';
    elements.bodyFont.value = 'Inter';
    currentHeadingFont = 'Fredoka';
    currentBodyFont = 'Inter';
    loadFont('Fredoka', 'heading');
    loadFont('Inter', 'body');
    updatePreview();
    showAlternatives();
  }

  function populateFontDropdowns() {
    const category = elements.filterCategory.value;
    const popularity = elements.filterPopularity.value;
    const language = elements.filterLanguage.value;

    let filtered = fontsData.filter(font => {
      if (category && font.category !== category) return false;
      if (popularity === 'trending' && font.popularity > 5) return false;
      if (popularity === 'popular' && font.popularity > 20) return false;
      if (language && !font.subsets.includes(language)) return false;
      return true;
    });

    // Sort by popularity
    filtered.sort((a, b) => a.popularity - b.popularity);

    const headingFont = elements.headingFont.value;
    const bodyFont = elements.bodyFont.value;

    [elements.headingFont, elements.bodyFont].forEach(select => {
      const currentValue = select.value;
      select.innerHTML = '<option value="">Select a font...</option>';
      filtered.forEach(font => {
        const option = document.createElement('option');
        option.value = font.family;
        option.textContent = `${font.family} (${font.category})`;
        select.appendChild(option);
      });
      if (filtered.some(f => f.family === currentValue)) {
        select.value = currentValue;
      }
    });
  }

  function loadFont(fontFamily, type) {
    const font = fontsData.find(f => f.family === fontFamily);
    if (!font) return;

    const weightSelect = type === 'heading' ? elements.headingWeight : elements.bodyWeight;
    const availableWeights = font.variants.filter(v => !v.includes('italic')).sort((a, b) => parseInt(a) - parseInt(b));

    // Update weight options
    weightSelect.innerHTML = '';
    availableWeights.forEach(w => {
      const option = document.createElement('option');
      option.value = w;
      option.textContent = `${getWeightName(w)} (${w})`;
      weightSelect.appendChild(option);
    });

    // Set default weight
    if (type === 'heading') {
      if (availableWeights.includes('600')) weightSelect.value = '600';
      else if (availableWeights.includes('700')) weightSelect.value = '700';
      else weightSelect.value = availableWeights[availableWeights.length - 1];
    } else {
      if (availableWeights.includes('400')) weightSelect.value = '400';
      else weightSelect.value = availableWeights[0];
    }

    // Load font via FontFace API
    const weight = weightSelect.value;
    const fontFace = new FontFace(fontFamily, `url(https://fonts.gstatic.com/s/${fontFamily.toLowerCase().replace(/\s+/g, '')}/v1/${fontFamily.replace(/\s+/g, '')}-${weight}.woff2)`, {
      weight: weight,
      style: 'normal'
    });

    fontFace.load().then(loadedFace => {
      document.fonts.add(loadedFace);
      updatePreview();
    }).catch(() => {
      // Fallback: use Google Fonts CSS
      loadFontViaCSS(fontFamily, weight);
    });
  }

  function loadFontViaCSS(fontFamily, weight) {
    const linkId = `font-${fontFamily.replace(/\s+/g, '-')}-${weight}`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${weight}&display=swap`;
    document.head.appendChild(link);
  }

  function getWeightName(weight) {
    const names = {
      '100': 'Thin', '200': 'ExtraLight', '300': 'Light',
      '400': 'Regular', '500': 'Medium', '600': 'SemiBold',
      '700': 'Bold', '800': 'ExtraBold', '900': 'Black'
    };
    return names[weight] || weight;
  }

  function updatePreview() {
    const headingFont = elements.headingFont.value;
    const bodyFont = elements.bodyFont.value;
    const headingWeight = elements.headingWeight.value;
    const bodyWeight = elements.bodyWeight.value;
    const headingSize = elements.headingSize.value;
    const bodySize = elements.bodySize.value;
    const lineHeight = elements.lineHeight.value;
    const letterSpacing = elements.letterSpacing.value;

    if (headingFont) {
      elements.previewHeading.style.fontFamily = `"${headingFont}", sans-serif`;
      elements.previewHeading.style.fontWeight = headingWeight;
      elements.previewHeading.style.fontSize = headingSize + 'px';
      elements.previewHeading.style.lineHeight = lineHeight;
      elements.previewHeading.style.letterSpacing = letterSpacing + 'em';
    }

    if (bodyFont) {
      elements.previewBody.style.fontFamily = `"${bodyFont}", sans-serif`;
      elements.previewBody.style.fontWeight = bodyWeight;
      elements.previewBody.style.fontSize = bodySize + 'px';
      elements.previewBody.style.lineHeight = lineHeight;
      elements.previewBody.style.letterSpacing = letterSpacing + 'em';
    }

    // Update UI elements
    const uiElements = document.querySelectorAll('.ui-button, .ui-input, .ui-checkbox');
    uiElements.forEach(el => {
      el.style.fontFamily = `"${bodyFont}", sans-serif`;
      el.style.fontSize = bodySize + 'px';
    });
  }

  function applyTheme(theme) {
    const preview = document.getElementById('font-preview');
    switch (theme) {
      case 'dark':
        preview.style.background = '#0f0f14';
        preview.style.color = '#f5f5f7';
        document.querySelector('.preview-body').style.color = '#9aa0a6';
        document.querySelector('.ui-button.secondary').style.borderColor = '#2d2d3f';
        document.querySelector('.ui-button.secondary').style.color = '#f5f5f7';
        document.querySelector('.ui-input').style.background = '#1a1a24';
        document.querySelector('.ui-input').style.borderColor = '#2d2d3f';
        break;
      case 'light':
        preview.style.background = '#f5f5f7';
        preview.style.color = '#0f0f14';
        document.querySelector('.preview-body').style.color = '#666';
        document.querySelector('.ui-button.secondary').style.borderColor = '#ddd';
        document.querySelector('.ui-button.secondary').style.color = '#0f0f14';
        document.querySelector('.ui-input').style.background = '#fff';
        document.querySelector('.ui-input').style.borderColor = '#ddd';
        break;
      case 'sepia':
        preview.style.background = '#f4ecd8';
        preview.style.color = '#3c2e2e';
        document.querySelector('.preview-body').style.color = '#5a4a4a';
        document.querySelector('.ui-button.secondary').style.borderColor = '#d4c4b0';
        document.querySelector('.ui-button.secondary').style.color = '#3c2e2e';
        document.querySelector('.ui-input').style.background = '#fdf6ec';
        document.querySelector('.ui-input').style.borderColor = '#d4c4b0';
        break;
      case 'high-contrast':
        preview.style.background = '#000';
        preview.style.color = '#ff0';
        document.querySelector('.preview-body').style.color = '#ff0';
        document.querySelector('.ui-button.primary').style.background = '#ff0';
        document.querySelector('.ui-button.primary').style.color = '#000';
        document.querySelector('.ui-button.secondary').style.borderColor = '#ff0';
        document.querySelector('.ui-button.secondary').style.color = '#ff0';
        document.querySelector('.ui-input').style.background = '#000';
        document.querySelector('.ui-input').style.borderColor = '#ff0';
        document.querySelector('.ui-input').style.color = '#ff0';
        break;
    }
  }

  function generatePair() {
    const strategy = document.querySelector('input[name="strategy"]:checked').value;
    const filtered = getFilteredFonts();

    if (filtered.length < 2) {
      showToast('Not enough fonts for pairing');
      return;
    }

    let headingFont, bodyFont;

    switch (strategy) {
      case 'contrast':
        // Serif heading + Sans body, or vice versa
        const serifs = filtered.filter(f => f.category === 'serif');
        const sans = filtered.filter(f => f.category === 'sans-serif');
        if (serifs.length && sans.length) {
          headingFont = serifs[Math.floor(Math.random() * Math.min(3, serifs.length))].family;
          bodyFont = sans[Math.floor(Math.random() * Math.min(3, sans.length))].family;
        } else {
          headingFont = filtered[0].family;
          bodyFont = filtered[1].family;
        }
        break;
      case 'harmony':
        // Same family if available, or same category
        const families = [...new Set(filtered.map(f => f.family))];
        if (families.length >= 1) {
          const family = families[Math.floor(Math.random() * families.length)];
          const variants = filtered.filter(f => f.family === family);
          if (variants.length >= 2) {
            headingFont = variants[0].family;
            bodyFont = variants[1].family;
          } else {
            headingFont = family;
            bodyFont = filtered.find(f => f.family !== family)?.family || filtered[1].family;
          }
        }
        break;
      case 'complementary':
        // Different weights of compatible fonts
        headingFont = filtered[0].family;
        bodyFont = filtered[1].family;
        break;
      case 'random':
      default:
        headingFont = filtered[Math.floor(Math.random() * filtered.length)].family;
        bodyFont = filtered[Math.floor(Math.random() * filtered.length)].family;
        while (bodyFont === headingFont && filtered.length > 1) {
          bodyFont = filtered[Math.floor(Math.random() * filtered.length)].family;
        }
        break;
    }

    if (headingFont && bodyFont) {
      elements.headingFont.value = headingFont;
      elements.bodyFont.value = bodyFont;
      currentHeadingFont = headingFont;
      currentBodyFont = bodyFont;
      loadFont(headingFont, 'heading');
      loadFont(bodyFont, 'body');
      updatePreview();
      showAlternatives();
      showToast(`Generated ${strategy} pairing`);
    }
  }

  function randomPair() {
    const filtered = getFilteredFonts();
    if (filtered.length < 2) return;

    const headingFont = filtered[Math.floor(Math.random() * filtered.length)].family;
    let bodyFont = filtered[Math.floor(Math.random() * filtered.length)].family;
    while (bodyFont === headingFont && filtered.length > 1) {
      bodyFont = filtered[Math.floor(Math.random() * filtered.length)].family;
    }

    elements.headingFont.value = headingFont;
    elements.bodyFont.value = bodyFont;
    currentHeadingFont = headingFont;
    currentBodyFont = bodyFont;
    loadFont(headingFont, 'heading');
    loadFont(bodyFont, 'body');
    updatePreview();
    showAlternatives();
    showToast('Random pair generated');
  }

  function swapFonts() {
    const temp = elements.headingFont.value;
    elements.headingFont.value = elements.bodyFont.value;
    elements.bodyFont.value = temp;

    const tempWeight = elements.headingWeight.value;
    elements.headingWeight.value = elements.bodyWeight.value;
    elements.bodyWeight.value = tempWeight;

    currentHeadingFont = elements.headingFont.value;
    currentBodyFont = elements.bodyFont.value;

    loadFont(currentHeadingFont, 'heading');
    loadFont(currentBodyFont, 'body');
    updatePreview();
    showAlternatives();
    showToast('Fonts swapped');
  }

  function getFilteredFonts() {
    const category = elements.filterCategory.value;
    const popularity = elements.filterPopularity.value;
    const language = elements.filterLanguage.value;

    return fontsData.filter(font => {
      if (category && font.category !== category) return false;
      if (popularity === 'trending' && font.popularity > 5) return false;
      if (popularity === 'popular' && font.popularity > 20) return false;
      if (language && !font.subsets.includes(language)) return false;
      return true;
    });
  }

  function showAlternatives() {
    const headingFont = elements.headingFont.value;
    const bodyFont = elements.bodyFont.value;

    if (!headingFont || !bodyFont) {
      elements.alternatives.innerHTML = '';
      return;
    }

    // Find predefined pairs that match
    const matches = PREDEFINED_PAIRS.filter(p =>
      p.heading === headingFont || p.body === bodyFont
    );

    // Also suggest fonts from same category
    const headingFontData = fontsData.find(f => f.family === headingFont);
    const bodyFontData = fontsData.find(f => f.family === bodyFont);

    const suggestions = new Set();

    if (headingFontData) {
      fontsData.filter(f => f.category === headingFontData.category && f.family !== headingFont)
        .slice(0, 3).forEach(f => suggestions.add(f.family));
    }
    if (bodyFontData) {
      fontsData.filter(f => f.category === bodyFontData.category && f.family !== bodyFont)
        .slice(0, 3).forEach(f => suggestions.add(f.family));
    }

    matches.forEach(p => {
      if (p.heading !== headingFont) suggestions.add(p.heading);
      if (p.body !== bodyFont) suggestions.add(p.body);
    });

    elements.alternatives.innerHTML = '';
    Array.from(suggestions).slice(0, 6).forEach(fontName => {
      const font = fontsData.find(f => f.family === fontName);
      if (!font) return;

      const card = document.createElement('div');
      card.className = 'alternative-card';
      card.innerHTML = `
        <div class="alternative-name" style="font-family: '${fontName}', sans-serif;">${fontName}</div>
        <div class="alternative-category">${font.category}</div>
        <div class="alternative-preview" style="font-family: '${fontName}', sans-serif;">The quick brown fox</div>
      `;
      card.addEventListener('click', () => {
        // Replace the font that's more similar
        if (font.category === headingFontData?.category) {
          elements.headingFont.value = fontName;
          currentHeadingFont = fontName;
          loadFont(fontName, 'heading');
        } else {
          elements.bodyFont.value = fontName;
          currentBodyFont = fontName;
          loadFont(fontName, 'body');
        }
        updatePreview();
        showAlternatives();
        showToast(`Applied ${fontName}`);
      });
      elements.alternatives.appendChild(card);
    });
  }

  function copyCss() {
    const headingFont = elements.headingFont.value;
    const bodyFont = elements.bodyFont.value;
    const headingWeight = elements.headingWeight.value;
    const bodyWeight = elements.bodyWeight.value;

    if (!headingFont || !bodyFont) {
      showToast('Select both fonts first');
      return;
    }

    const css = `/* Font Pairing by KING_YOSEF_ */
/* https://king-yosef-0.github.io/Main_Redirectorer/font-pairing/ */

@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(headingFont)}:wght@${headingWeight}&family=${encodeURIComponent(bodyFont)}:wght@${bodyWeight}&display=swap');

:root {
  --font-heading: "${headingFont}", sans-serif;
  --font-body: "${bodyFont}", sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: ${headingWeight};
}

body, p, span, div, a, button, input, textarea {
  font-family: var(--font-body);
  font-weight: ${bodyWeight};
  line-height: ${elements.lineHeight.value};
  letter-spacing: ${elements.letterSpacing.value}em;
}`;

    navigator.clipboard.writeText(css).then(() => showToast('CSS copied!'));
  }

  function copyTailwind() {
    const headingFont = elements.headingFont.value;
    const bodyFont = elements.bodyFont.value;

    if (!headingFont || !bodyFont) {
      showToast('Select both fonts first');
      return;
    }

    const config = `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        heading: ['${headingFont}', 'sans-serif'],
        body: ['${bodyFont}', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`;

    navigator.clipboard.writeText(config).then(() => showToast('Tailwind config copied!'));
  }

  function exportFontFace() {
    const headingFont = elements.headingFont.value;
    const bodyFont = elements.bodyFont.value;
    const headingWeight = elements.headingWeight.value;
    const bodyWeight = elements.bodyWeight.value;

    if (!headingFont || !bodyFont) {
      showToast('Select both fonts first');
      return;
    }

    const fonts = [
      { family: headingFont, weight: headingWeight },
      { family: bodyFont, weight: bodyWeight }
    ];

    let css = `/* @font-face declarations for self-hosting */
/* Download the font files from Google Fonts and host them locally */
/* Generated by KING_YOSEF_ Font Pairing Tool */

`;

    fonts.forEach(font => {
      css += `@font-face {
  font-family: '${font.family}';
  font-weight: ${font.weight};
  font-style: normal;
  font-display: swap;
  src: url('./fonts/${font.family.replace(/\s+/g, '-')}-${font.weight}.woff2') format('woff2');
}

`;
    });

    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'font-face.css';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded font-face.css');
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