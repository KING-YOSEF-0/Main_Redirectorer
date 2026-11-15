// Quote Poster Studio - Comprehensive Script (All 10 Tasks)
// ============================================================================

// Strict mode and immediate invocation
(function () {
  'use strict';

  // ==========================================================================
  // DATA: 30+ Inspirational Quotes (Curated Collection)
  // ==========================================================================

  const QUOTE_LIBRARY = {
    motivation: [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { text: "Your limitation—it's only your imagination.", author: "Unknown" },
      { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
      { text: "Great things never come from comfort zones.", author: "Unknown" },
      { text: "Dream it. Wish it. Do it.", author: "Unknown" },
      { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
      { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
      { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" }
    ],
    wisdom: [
      { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
      { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
      { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
      { text: "Wisdom is the reward you get for a lifetime of listening when you'd have preferred to talk.", author: "Doug Larson" },
      { text: "The fool doth think he is wise, but the wise man knows himself to be a fool.", author: "William Shakespeare" },
      { text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", author: "Aristotle" },
      { text: "Wisdom begins in wonder.", author: "Socrates" },
      { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
      { text: "He who knows others is wise; he who knows himself is enlightened.", author: "Lao Tzu" },
      { text: "The only thing I know is that I know nothing.", author: "Socrates" }
    ],
    creativity: [
      { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
      { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
      { text: "Every artist was first an amateur.", author: "Ralph Waldo Emerson" },
      { text: "Creativity takes courage.", author: "Henri Matisse" },
      { text: "The worst enemy to creativity is self-doubt.", author: "Sylvia Plath" },
      { text: "Art is not what you see, but what you make others see.", author: "Edgar Degas" },
      { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
      { text: "Don't think. Thinking is the enemy of creativity.", author: "Ray Bradbury" },
      { text: "Creativity is contagious. Pass it on.", author: "Albert Einstein" },
      { text: "Everything you can imagine is real.", author: "Pablo Picasso" }
    ],
    life: [
      { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
      { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
      { text: "Life is really simple, but we insist on making it complicated.", author: "Confucius" },
      { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
      { text: "Life is a journey, not a destination.", author: "Ralph Waldo Emerson" },
      { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
      { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
      { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
      { text: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin" },
      { text: "Do not take life too seriously. You will not get out alive.", author: "Elbert Hubbard" }
    ],
    technology: [
      { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
      { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
      { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
      { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
      { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
      { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
      { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
      { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
      { text: "The most dangerous phrase in the language is: 'We've always done it this way.'", author: "Grace Hopper" },
      { text: "It's not a bug, it's an undocumented feature.", author: "Unknown" }
    ],
    humor: [
      { text: "I'm not lazy, I'm on energy saving mode.", author: "Unknown" },
      { text: "Why fall in love when you can fall asleep?", author: "Unknown" },
      { text: "My bed is a magical place where I suddenly remember everything I forgot to do.", author: "Unknown" },
      { text: "I don't need a hair stylist, my pillow gives me a new hairstyle every morning.", author: "Unknown" },
      { text: "Life is short. Smile while you still have teeth.", author: "Mallory Hopkins" },
      { text: "I'm not arguing, I'm just explaining why I'm right.", author: "Unknown" },
      { text: "If you think you are too small to make a difference, try sleeping with a mosquito.", author: "Dalai Lama" },
      { text: "Common sense is like deodorant. The people who need it most never use it.", author: "Unknown" },
      { text: "My wallet is like an onion. When I open it, it makes me cry.", author: "Unknown" },
      { text: "I'm not clumsy. The floor just hates me, the table and chairs are bullies, and the walls get in my way.", author: "Unknown" }
    ]
  };

  // Daily quotes subset (shown first on load)
  const DAILY_QUOTES = [
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" }
  ];

  // ==========================================================================
  // STATE MANAGEMENT - ALL 10 TASKS
  // ==========================================================================

  // Task 1: Quote Source state
  // Task 2: Custom text mode
  // Task 3: Font pairings
  // Task 4: Background styles
  // Task 5: Social Media dimensions
  // Task 6: Text effects
  // Task 7 & 8: Export
  // Task 9: Layout presets
  // Task 10: Color theme picker

  const state = {
    // Task 1 & 2: Quote Source
    source: 'daily', // daily, random, library, custom
    quoteText: '',
    quoteAuthor: '',

    // Task 3: Font Pairings (4 main + custom)
    fontPair: 'editorial', // editorial, modern, classic, bold, custom
    customQuoteFont: 'var(--font-display)',
    customAuthorFont: 'var(--font-mono)',

    // Task 4: Background Styles
    background: 'paper', // paper, solid, gradient, texture, image
    bgColor: '#fdfbf7',
    gradientType: 'linear',
    gradientColor1: '#ffeaa7',
    gradientColor2: '#fab1a0',
    bgImage: null,
    patternType: 'none',
    bgTextureOpacity: 15,

    // Task 5: Canvas Size
    size: 'instagram', // instagram, story, twitter, facebook, pinterest, linkedin, youtube, custom
    customWidth: 1080,
    customHeight: 1080,

    // Task 9: Layout Presets
    layout: 'centered', // centered, left, right, split, bubble, minimal
    vPos: 50, // vertical position %
    hPos: 50, // horizontal position %
    maxWidth: 85, // max width %

    // Task 6: Text Effects
    effects: {
      shadow: true,
      outline: false,
      glow: false,
      shadowIntensity: 40, // 0-100%
      shadowBlur: 8,
      shadowOffset: 4,
      outlineWidth: 2, // px
      outlineColor: '#000000',
      glowIntensity: 20, // px
      glowColor: '#ffd700'
    },

    // Task 10: Color Theme Picker
    palette: 'warm', // warm, cool, earth, mono, vintage, midnight, forest, rose
    textColor: '#2d2d2d',
    accentColor: '#c4a484',
    uiTheme: 'light', // light, dark

    // Statistics & Persistence
    postersCreated: 0,
    uniqueQuotesUsed: new Set(),
    fontUsage: {},
    exportedCount: 0
  };

  // ==========================================================================
  // DOM ELEMENTS - CACHED REFERENCES
  // ==========================================================================

  const els = {
    // Header/footer
    brandName: document.querySelector('.brand-name'),
    studioTagline: document.querySelector('.studio-tagline'),
    footerLink: document.querySelector('.footer-link'),

    // Task 1 & 2: Quote Source
    sourceTabs: document.querySelectorAll('.source-tab'),
    sourcePanels: document.querySelectorAll('.source-panel'),
    dailyPreview: document.getElementById('dailyQuotePreview'),
    refreshDailyBtn: document.getElementById('refreshDailyBtn'),
    randomPreview: document.getElementById('randomQuotePreview'),
    refreshRandomBtn: document.getElementById('refreshRandomBtn'),
    libraryCategory: document.getElementById('quoteCategory'),
    libraryQuotePreview: document.getElementById('libraryQuotePreview'),
    customQuoteText: document.getElementById('customQuoteText'),
    customQuoteAuthor: document.getElementById('customQuoteAuthor'),

    // Task 3: Typography
    fontTabs: document.querySelectorAll('.font-pair-card input'),
    fontScale: document.getElementById('fontScale'),
    fontScaleValue: document.getElementById('fontScaleValue'),
    lineHeight: document.getElementById('lineHeight'),
    lineHeightValue: document.getElementById('lineHeightValue'),

    // Task 4: Background
    bgTabs: document.querySelectorAll('.bg-tab'),
    bgPanels: document.querySelectorAll('.bg-panel'),
    paperStyle: document.getElementById('paperStyle'),
    colorSwatches: document.querySelectorAll('.color-swatch'),
    customSolidColor: document.getElementById('customSolidColor'),
    gradientPresets: document.querySelectorAll('.gradient-preset'),
    gradColor1: document.getElementById('gradColor1'),
    gradColor2: document.getElementById('gradColor2'),
    gradAngle: document.getElementById('gradAngle'),
    gradAngleValue: document.getElementById('gradAngleValue'),
    textureGrid: document.querySelectorAll('.texture-btn'),
    textureOpacity: document.getElementById('textureOpacity'),
    textureOpacityValue: document.getElementById('textureOpacityValue'),
    bgImageUpload: document.getElementById('bgImageUpload'),
    bgDropZone: document.getElementById('bgDropZone'),
    imageControls: document.getElementById('imageControls'),
    imageOverlay: document.getElementById('imageOverlay'),
    imageOverlayValue: document.getElementById('imageOverlayValue'),
    imageBlend: document.getElementById('imageBlend'),

    // Task 5: Canvas Size
    sizeCards: document.querySelectorAll('.size-card'),
    customSizeInputs: document.getElementById('customSizeInputs'),

    // Task 9: Layout Presets
    layoutCards: document.querySelectorAll('.layout-card'),
    vPosSlider: document.getElementById('vPos'),
    hPosSlider: document.getElementById('hPos'),
    maxWidthSlider: document.getElementById('maxWidth'),
    vPosValue: document.getElementById('vPosValue'),
    hPosValue: document.getElementById('hPosValue'),
    maxWidthValue: document.getElementById('maxWidthValue'),

    // Task 6: Text Effects
    shadowToggle: document.getElementById('shadowToggle'),
    outlineToggle: document.getElementById('outlineToggle'),
    glowToggle: document.getElementById('glowToggle'),
    shadowIntensity: document.getElementById('shadowIntensity'),
    shadowBlur: document.getElementById('shadowBlur'),
    shadowOffset: document.getElementById('shadowOffset'),
    shadowIntensityValue: document.getElementById('shadowIntensityValue'),
    shadowBlurValue: document.getElementById('shadowBlurValue'),
    shadowOffsetValue: document.getElementById('shadowOffsetValue'),
    outlineColor: document.getElementById('outlineColor'),
    outlineWidth: document.getElementById('outlineWidth'),
    outlineWidthValue: document.getElementById('outlineWidthValue'),
    glowToggle2: document.getElementById('glowToggle'),
    glowIntensity: document.getElementById('glowIntensity'),
    glowIntensityValue: document.getElementById('glowIntensityValue'),
    glowColor: document.getElementById('glowColor'),

    // Task 10: Color Theme Picker
    paletteCards: document.querySelectorAll('.palette-card'),
    textColorPicker: document.getElementById('textColor'),
    accentColorPicker: document.getElementById('accentColor'),

    // Actions
    generateBtn: document.getElementById('generateBtn'),
    randomizeBtn: document.getElementById('randomizeBtn'),

    // Export
    downloadPngBtn: document.getElementById('downloadPngBtn'),
    downloadJpgBtn: document.getElementById('downloadJpgBtn'),
    copyBtn: document.getElementById('copyBtn'),
    shareBtn: document.getElementById('shareBtn'),
    exportActions: document.getElementById('exportActions'),

    // Stats
    statPosters: document.getElementById('statPosters'),
    statQuotes: document.getElementById('statQuotes'),
    statFonts: document.getElementById('statFonts'),
    statPalettes: document.getElementById('statPalettes'),

    // Canvas
    posterCanvas: document.getElementById('posterCanvas'),
    canvasPlaceholder: document.getElementById('canvasPlaceholder'),

    // Modal
    resultsModal: document.getElementById('resultsModal'),
    modalTitle: document.getElementById('modalTitle'),

    // Theme
    uiTheme: document.getElementById('uiTheme')
  };

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };

    toast.innerHTML = `
      <span style="font-size: 1.25rem;">${icons[type] || icons.info}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function setActiveTab(tabs, clickedValue, isRadioGroup = false) {
    tabs.forEach(tab => {
      const isActive = isRadioGroup
        ? tab.dataset.value === clickedValue || tab.querySelector('input[value="' + clickedValue + '"]')
        : tab.dataset.source === clickedValue || tab.dataset.font === clickedValue ||
          tab.dataset.bg === clickedValue || tab.dataset.size === clickedValue ||
          tab.dataset.layout === clickedValue || tab.dataset.palette === clickedValue;

      if (isRadioGroup) {
        tab.classList.toggle('active', isActive);
        const input = tab.querySelector('input');
        if (input) input.checked = isActive;
      } else {
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
      }
    });
  }

  function getSeededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Format date for daily quote lookup
  function getTodayKey() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  }

  // ==========================================================================
  // QUOTE MANAGEMENT (Tasks 1 & 2)
  // ==========================================================================

  function loadQuotesFromLocalStorage() {
    const saved = localStorage.getItem('quotePosterQuotes');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        state.uniqueQuotesUsed = new Set(data.quotes || []);
        state.postersCreated = data.postersCreated || 0;
        showToast('Previous session restored');
      } catch (e) {
        console.error('Failed to load saved quotes:', e);
      }
    }
  }

  function saveQuotesToLocalStorage() {
    try {
      localStorage.setItem('quotePosterQuotes', JSON.stringify({
        quotes: Array.from(state.uniqueQuotesUsed),
        postersCreated: state.postersCreated
      }));
    } catch (e) {
      console.error('Failed to save quotes:', e);
    }
  }

  function getQuoteFromSource(source) {
    let quote;

    switch (source) {
      case 'daily':
        const todayKey = getTodayKey();
        const dailyIdx = Math.floor(getSeededRandom(parseInt(todayKey.replace('-', ''), 10)) * DAILY_QUOTES.length);
        quote = { text: DAILY_QUOTES[dailyIdx].text, author: DAILY_QUOTES[dailyIdx].author };
        break;

      case 'random':
        const allQuotes = Object.values(QUOTE_LIBRARY).flat();
        const randomIdx = Math.floor(getSeededRandom(Date.now()) * allQuotes.length);
        const randomQuote = allQuotes[randomIdx];
        quote = { text: randomQuote.text, author: randomQuote.author };
        break;

      case 'library':
        const category = els.libraryCategory.value;
        const libraryQuotes = QUOTE_LIBRARY[category] || QUOTE_LIBRARY.motivation;
        const libIdx = Math.floor(getSeededRandom(Date.now()) * libraryQuotes.length);
        const libQuote = libraryQuotes[libIdx];
        quote = { text: libQuote.text, author: libQuote.author };
        break;

      case 'custom':
        quote = {
          text: state.quoteText || els.customQuoteText.value || '«Your quote here»',
          author: state.quoteAuthor || els.customQuoteAuthor.value || '— You'
        };
        break;
    }

    return quote;
  }

  function renderQuotePreview(quote, source) {
    const previewMap = {
      daily: els.dailyPreview,
      random: els.randomPreview,
      library: els.libraryQuotePreview
    };

    const preview = previewMap[source] || els.dailyPreview;

    preview.innerHTML = `
      <div class="quote-preview" style="font-family: var(--font-display); font-style: italic; font-size: 1rem; line-height: 1.6; color: var(--fg);">
        <span style="font-size: 3rem; opacity: 0.3; position: absolute; top: -0.5rem; left: 0.5rem;">"</span>
        "${quote.text}"
        <div style="margin-top: 0.75rem; font-style: normal; font-family: var(--font-ui); font-size: 0.875em; color: var(--accent); text-align: right;">— ${quote.author}</div>
      </div>
    `;
  }

  function handleSourceChange(source) {
    state.source = source;
    setActiveTab(els.sourceTabs, source);

    // Show/hide panels
    els.sourcePanels.forEach(panel => panel.classList.remove('active'));
    const activePanel = document.getElementById(source + 'Panel');
    if (activePanel) activePanel.classList.add('active');

    // Load quote based on source
    if (source !== 'custom') {
      const quote = getQuoteFromSource(source);
      state.quoteText = quote.text;
      state.quoteAuthor = quote.author;

      // Update the appropriate preview
      renderQuotePreview(quote, source);
    } else {
      // Custom mode - just make sure text area has value
      if (!els.customQuoteText.value.trim()) {
        els.customQuoteText.value = state.quoteText || '';
      }
      if (!els.customQuoteAuthor.value.trim()) {
        els.customQuoteAuthor.value = state.quoteAuthor || '';
      }
    }

    // Update display
    updateQuoteDisplay();
  }

  function updateQuoteDisplay() {
    // Update the main quote display in the canvas area
    const displayText = state.quoteText || els.customQuoteText.value || '“Your quote here”';
    const displayAuthor = state.quoteAuthor || els.customQuoteAuthor.value || '— Creator';

    // Show in preview area if canvas not yet rendered
    if (els.dailyQuotePreview) {
      els.dailyQuotePreview.innerHTML = `
        <div class="quote-preview">
          <span style="font-size: 2rem; opacity: 0.3;">"</span>
          "${displayText}"
          <div style="margin-top: 0.5rem; font-style: normal; font-size: 0.75rem; color: var(--accent);">— ${displayAuthor}</div>
        </div>
      `;
    }
  }

  // ==========================================================================
  // FONT PAIRINGS (Task 3)
  // ==========================================================================

  const FONT_CONFIGS = {
    editorial: {
      quote: "'Cormorant Garamond', Georgia, serif",
      author: "'DM Sans', system-ui, sans-serif",
      label: 'Editorial'
    },
    modern: {
      quote: "'DM Sans', system-ui, sans-serif",
      author: "'Space Mono', ui-monospace, monospace",
      label: 'Modern'
    },
    classic: {
      quote: "'Space Mono', ui-monospace, monospace",
      author: "'Cormorant Garamond', Georgia, serif",
      label: 'Classic'
    },
    bold: {
      quote: "'Bebas Neue', system-ui, sans-serif",
      author: "'DM Sans', system-ui, sans-serif",
      label: 'Bold'
    },
    custom: {
      quote: 'var(--font-display)',
      author: 'var(--font-mono)',
      label: 'Custom'
    }
  };

  function setFontPair(font) {
    state.fontPair = font;
    setActiveTab(els.fontTabs, font, true); // radio group

    const config = FONT_CONFIGS[font] || FONT_CONFIGS.editorial;

    // Update custom font inputs
    els.customQuoteFont = config.quote;
    els.customAuthorFont = config.author;

    // Update select values if they exist
    if (els.quoteFontSelect) {
      els.quoteFontSelect.value = config.quote;
    }
    if (els.authorFontSelect) {
      els.authorFontSelect.value = config.author;
    }

    // Update display
    updateFontDisplay();
  }

  function updateFontDisplay() {
    const config = FONT_CONFIGS[state.fontPair] || FONT_CONFIGS.editorial;

    // Update the font size/line height controls display
    if (els.fontScaleValue) {
      els.fontScaleValue.textContent = `${Math.round(parseFloat(els.fontScale.value) || 100)}%`;
    }
    if (els.lineHeightValue) {
      els.lineHeightValue.textContent = `${parseFloat(els.lineHeight.value) || 1.4}`;
    }
  }

  // Apply font scaling to canvas rendering
  function getScaledFontSize(baseSize) {
    const scale = parseFloat(els.fontScale?.value || '100') / 100;
    return baseSize * scale;
  }

  function getLineHeightMultiplier() {
    return parseFloat(els.lineHeight?.value || '1.4');
  }

  // ==========================================================================
  // BACKGROUND STYLES (Task 4)
  // ==========================================================================

  function setBackground(background) {
    state.background = background;
    setActiveTab(els.bgTabs, background);

    // Show/hide panels
    els.bgPanels.forEach(panel => panel.classList.remove('active'));
    const activePanel = document.getElementById(background + 'Panel');
    if (activePanel) activePanel.classList.add('active');

    // Update UI
    updateBackgroundUI();
  }

  function updateBackgroundUI() {
    // Update color picker values based on current background
    if (els.bgColor) {
      els.bgColor.value = state.bgColor;
    }
    if (els.gradColor1) {
      els.gradColor1.value = state.gradientColor1;
    }
    if (els.gradColor2) {
      els.gradColor2.value = state.gradientColor2;
    }
    if (els.patternType) {
      els.patternType.value = state.patternType;
    }
    if (els.textureOpacity) {
      els.textureOpacity.value = state.bgTextureOpacity;
      if (els.textureOpacityValue) {
        els.textureOpacityValue.textContent = state.bgTextureOpacity + '%';
      }
    }
    if (els.imageOverlay) {
      els.imageOverlay.value = 30; // default
      if (els.imageOverlayValue) {
        els.imageOverlayValue.textContent = '30%';
      }
    }
  }

  function drawBackground(ctx, width, height) {
    switch (state.background) {
      case 'solid':
        ctx.fillStyle = state.bgColor;
        ctx.fillRect(0, 0, width, height);
        break;

      case 'gradient':
        let gradient;
        if (state.gradientType === 'linear') {
          gradient = ctx.createLinearGradient(0, 0, width, height);
        } else if (state.gradientType === 'radial') {
          gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        } else { // conic
          gradient = ctx.createConicGradient(0, width / 2, height / 2);
        }
        gradient.addColorStop(0, state.gradientColor1);
        gradient.addColorStop(1, state.gradientColor2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;

      case 'texture':
        // Draw texture pattern
        drawTexture(ctx, width, height);
        break;

      case 'image':
        if (state.bgImage) {
          const img = state.bgImage;
          const scale = Math.max(width / img.width, height / img.height);
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
          const x = (width - drawWidth) / 2;
          const y = (height - drawHeight) / 2;
          ctx.drawImage(img, x, y, drawWidth, drawHeight);

          // Overlay with color and opacity
          ctx.fillStyle = hexToRgba(state.bgColor, state.bgTextureOpacity / 100);
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.fillStyle = state.bgColor;
          ctx.fillRect(0, 0, width, height);
        }
        break;
    }
  }

  function drawTexture(ctx, width, height) {
    ctx.save();

    // Fill base color
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, width, height);

    // Apply texture based on type
    ctx.globalAlpha = state.bgTextureOpacity / 100;
    ctx.fillStyle = state.bgColor;

    switch (state.patternType) {
      case 'dots':
        const dotSpacing = Math.max(20, Math.min(width, height) / 15);
        for (let x = 0; x < width; x += dotSpacing) {
          for (let y = 0; y < height; y += dotSpacing) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;

      case 'lines':
        const lineSpacing = Math.max(15, Math.min(width, height) / 12);
        ctx.strokeStyle = hexToRgba(state.bgColor, 0.15);
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;

      case 'grid':
        const gridSpacing = Math.max(25, Math.min(width, height) / 10);
        ctx.strokeStyle = hexToRgba(state.bgColor, 0.1);
        ctx.lineWidth = 0.5;
        for (let x = 0; x < width; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;

      case 'waves':
        ctx.strokeStyle = hexToRgba(state.bgColor, 0.1);
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          for (let x = 0; x < width; x += 5) {
            const waveY = y + Math.sin(x * 0.02) * 10;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        }
        break;

      case 'none':
      default:
        // Just the base color
        break;
    }

    ctx.restore();
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function handleColorChange() {
    // Update state from color inputs
    if (els.bgColor) state.bgColor = els.bgColor.value;
    if (els.gradColor1) state.gradientColor1 = els.gradColor1.value;
    if (els.gradColor2) state.gradientColor2 = els.gradColor2.value;
    if (els.textureOpacity) state.bgTextureOpacity = parseInt(els.textureOpacity.value) || 15;
    if (els.textureOpacityValue) els.textureOpacityValue.textContent = state.bgTextureOpacity + '%';
    if (els.imageOverlay) state.bgTextureOpacity = parseInt(els.imageOverlay.value) || 15;
    if (els.imageOverlayValue) els.imageOverlayValue.textContent = state.bgTextureOpacity + '%';

    updateFontDisplay();
  }

  // ==========================================================================
  // CANVAS SIZE / SOCIAL MEDIA DIMENSIONS (Task 5)
  // ==========================================================================

  const SIZE_PRESETS = {
    instagram: { width: 1080, height: 1080, label: 'Instagram Post (1080×1080)' },
    story: { width: 1080, height: 1920, label: 'Instagram Story (1080×1920)' },
    twitter: { width: 1200, height: 675, label: 'Twitter / X Post (1200×675)' },
    facebook: { width: 1200, height: 630, label: 'Facebook Post (1200×630)' },
    pinterest: { width: 1000, height: 1500, label: 'Pinterest Pin (1000×1500)' },
    linkedin: { width: 1200, height: 627, label: 'LinkedIn Post (1200×627)' },
    youtube: { width: 1280, height: 720, label: 'YouTube Thumbnail (1280×720)' }
  };

  function setSize(size) {
    state.size = size;
    setActiveTab(els.sizeCards, size, true); // radio group

    if (size === 'custom') {
      els.customSizeInputs.hidden = false;
      els.customWidth.value = state.customWidth;
      els.customHeight.value = state.customHeight;
    } else {
      els.customSizeInputs.hidden = true;
      const preset = SIZE_PRESETS[size];
      if (preset) {
        state.customWidth = preset.width;
        state.customHeight = preset.height;
        if (els.customWidth) els.customWidth.value = preset.width;
        if (els.customHeight) els.customHeight.value = preset.height;
      }
    }

    updateFontDisplay();
  }

  function handleSizeInput() {
    if (state.size === 'custom') {
      const w = parseInt(els.customWidth.value) || 1080;
      const h = parseInt(els.customHeight.value) || 1080;
      state.customWidth = Math.max(400, Math.min(4000, w));
      state.customHeight = Math.max(400, Math.min(4000, h));
      if (els.customWidth) els.customWidth.value = state.customWidth;
      if (els.customHeight) els.customHeight.value = state.customHeight;
    }
    updateFontDisplay();
  }

  // ==========================================================================
  // LAYOUT PRESETS (Task 9)
  // ==========================================================================

  const LAYOUT_PRESETS = {
    centered: { vPos: 50, hPos: 50, maxWidth: 85, desc: 'Classic balanced layout' },
    left: { vPos: 50, hPos: 25, maxWidth: 70, desc: 'Editorial left-aligned' },
    right: { vPos: 50, hPos: 75, maxWidth: 70, desc: 'Asymmetric right-aligned' },
    split: { vPos: 50, hPos: 50, maxWidth: 85, desc: 'Quote on one side, author on other' },
    bubble: { vPos: 60, hPos: 50, maxWidth: 70, desc: 'Quote in speech bubble style' },
    minimal: { vPos: 40, hPos: 50, maxWidth: 90, desc: 'Clean, lots of white space' }
  };

  function setLayout(layout) {
    state.layout = layout;
    setActiveTab(els.layoutCards, layout, true); // radio group

    const preset = LAYOUT_PRESETS[layout] || LAYOUT_PRESETS.centered;
    state.vPos = preset.vPos;
    state.hPos = preset.hPos;
    state.maxWidth = preset.maxWidth;

    // Update sliders
    if (els.vPosSlider) els.vPosSlider.value = preset.vPos;
    if (els.hPosSlider) els.hPosSlider.value = preset.hPos;
    if (els.maxWidthSlider) els.maxWidthSlider.value = preset.maxWidth;

    if (els.vPosValue) els.vPosValue.textContent = preset.vPos + '%';
    if (els.hPosValue) els.hPosValue.textContent = preset.hPos + '%';
    if (els.maxWidthValue) els.maxWidthValue.textContent = preset.maxWidth + '%';
  }

  function handleLayoutInputs() {
    if (els.vPosSlider) {
      state.vPos = parseInt(els.vPosSlider.value) || 50;
      if (els.vPosValue) els.vPosValue.textContent = state.vPos + '%';
    }
    if (els.hPosSlider) {
      state.hPos = parseInt(els.hPosSlider.value) || 50;
      if (els.hPosValue) els.hPosValue.textContent = state.hPos + '%';
    }
    if (els.maxWidthSlider) {
      state.maxWidth = parseInt(els.maxWidthSlider.value) || 85;
      if (els.maxWidthValue) els.maxWidthValue.textContent = state.maxWidth + '%';
    }
  }

  // ==========================================================================
  // TEXT EFFECTS (Task 6)
  // ==========================================================================

  function updateEffectsDisplay() {
    // Update UI from state
    els.shadowToggle.checked = state.effects.shadow;
    els.outlineToggle.checked = state.effects.outline;
    els.glowToggle2.checked = state.effects.glow;

    // Update intensity sliders
    if (els.shadowIntensity) els.shadowIntensity.value = state.effects.shadowIntensity;
    if (els.shadowIntensityValue) els.shadowIntensityValue.textContent = state.effects.shadowIntensity + '%';
    if (els.shadowBlur) els.shadowBlur.value = state.effects.shadowBlur;
    if (els.shadowBlurValue) els.shadowBlurValue.textContent = state.effects.shadowBlur + 'px';
    if (els.shadowOffset) els.shadowOffset.value = state.effects.shadowOffset;
    if (els.shadowOffsetValue) els.shadowOffsetValue.textContent = state.effects.shadowOffset + 'px';

    if (els.outlineWidth) els.outlineWidth.value = state.effects.outlineWidth;
    if (els.outlineWidthValue) els.outlineWidthValue.textContent = state.effects.outlineWidth + 'px';
    if (els.outlineColor) els.outlineColor.value = state.effects.outlineColor;

    if (els.glowIntensity) els.glowIntensity.value = state.effects.glowIntensity;
    if (els.glowIntensityValue) els.glowIntensityValue.textContent = state.effects.glowIntensity + 'px';
    if (els.glowColor) els.glowColor.value = state.effects.glowColor;
  }

  function handleEffectsChange() {
    state.effects.shadow = els.shadowToggle ? els.shadowToggle.checked : true;
    state.effects.outline = els.outlineToggle ? els.outlineToggle.checked : false;
    state.effects.glow = els.glowToggle2 ? els.glowToggle2.checked : false;

    // Update intensity values from UI
    if (els.shadowIntensity) state.effects.shadowIntensity = parseInt(els.shadowIntensity.value) || 40;
    if (els.shadowIntensityValue) els.shadowIntensityValue.textContent = state.effects.shadowIntensity + '%';
    if (els.shadowBlur) state.effects.shadowBlur = parseInt(els.shadowBlur.value) || 8;
    if (els.shadowBlurValue) els.shadowBlurValue.textContent = state.effects.shadowBlur + 'px';
    if (els.shadowOffset) state.effects.shadowOffset = parseInt(els.shadowOffset.value) || 4;
    if (els.shadowOffsetValue) els.shadowOffsetValue.textContent = state.effects.shadowOffset + 'px';

    if (els.outlineWidth) state.effects.outlineWidth = parseFloat(els.outlineWidth.value) || 2;
    if (els.outlineWidthValue) els.outlineWidthValue.textContent = state.effects.outlineWidth + 'px';
    if (els.outlineColor) state.effects.outlineColor = els.outlineColor.value || '#000000';

    if (els.glowIntensity) state.effects.glowIntensity = parseInt(els.glowIntensity.value) || 20;
    if (els.glowIntensityValue) els.glowIntensityValue.textContent = state.effects.glowIntensity + 'px';
    if (els.glowColor) state.effects.glowColor = els.glowColor.value || '#ffd700';

    updateFontDisplay();
  }

  // ==========================================================================
  // COLOR THEME PICKER (Task 10)
  // ==========================================================================

  const PALETTE_CONFIGS = {
    warm: {
      bg: '#fdfbf7',
      accent: '#c4a484',
      text: '#2d2d2d',
      gradient1: '#ffeaa7',
      gradient2: '#fab1a0'
    },
    cool: {
      bg: '#e8f4fd',
      accent: '#5a9bd8',
      text: '#2d3436',
      gradient1: '#a29bfe',
      gradient2: '#fd79a8'
    },
    earth: {
      bg: '#f5f0e8',
      accent: '#8f7d5c',
      text: '#5c4d3a',
      gradient1: '#55efc4',
      gradient2: '#00b894'
    },
    mono: {
      bg: '#ffffff',
      accent: '#808080',
      text: '#2d2d2d',
      gradient1: '#e0e0e0',
      gradient2: '#666666'
    },
    vintage: {
      bg: '#fef9e7',
      accent: '#8b6914',
      text: '#5c4d3a',
      gradient1: '#f5e6a0',
      gradient2: '#d4a843'
    },
    midnight: {
      bg: '#1a1a2e',
      accent: '#e94560',
      text: '#f5f0e8',
      gradient1: '#636e72',
      gradient2: '#2d3436'
    },
    forest: {
      bg: '#e8f5e9',
      accent: '#4caf50',
      text: '#1b5e20',
      gradient1: '#a5d6a7',
      gradient2: '#66bb6a'
    },
    rose: {
      bg: '#fce4ec',
      accent: '#ec407a',
      text: '#880e4f',
      gradient1: '#f8bbd0',
      gradient2: '#e91e63'
    }
  };

  function setPalette(palette) {
    state.palette = palette;
    setActiveTab(els.paletteCards, palette, true); // radio group

    const config = PALETTE_CONFIGS[palette] || PALETTE_CONFIGS.warm;

    // Update state from palette
    if (els.textColorPicker) {
      els.textColorPicker.value = config.text;
      state.textColor = config.text;
    }
    if (els.accentColorPicker) {
      els.accentColorPicker.value = config.accent;
      state.accentColor = config.accent;
    }

    // Update CSS variables for the poster
    document.documentElement.style.setProperty('--accent', config.accent);
    document.documentElement.style.setProperty('--accent-2', config.gradient1);
    document.documentElement.style.setProperty('--accent-3', config.gradient2);

    updateFontDisplay();
  }

  function handlePaletteChange() {
    if (els.paletteCards) {
      // Find which palette is active
      const active = document.querySelector('.palette-card.active');
      if (active) {
        const palette = active.dataset.palette;
        if (palette) setPalette(palette);
      }
    }

    if (els.textColorPicker) {
      state.textColor = els.textColorPicker.value || '#2d2d2d';
      updateFontDisplay();
    }
    if (els.accentColorPicker) {
      state.accentColor = els.accentColorPicker.value || '#c4a484';
      updateFontDisplay();
    }
  }

  // ==========================================================================
  // CANVAS RENDERING
  // ==========================================================================

  function renderPoster() {
    const canvas = els.posterCanvas;
    const ctx = canvas.getContext('2d');

    // Get canvas size from state
    const size = state.size !== 'custom'
      ? SIZE_PRESETS[state.size] || SIZE_PRESETS.instagram
      : { width: state.customWidth, height: state.customHeight };

    const width = size.width;
    const height = size.height;

    // Set canvas resolution (2x for crisp rendering at any size)
    const dpr = window.devicePixelRatio || 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    drawBackground(ctx, width, height);

    // Draw text with all effects
    drawText(ctx, width, height);

    // Update UI
    updateExportUI(true);

    // Show results modal
    showResultsModal(width, height);

    // Record usage
    recordUsage();
  }

  function getContrastColor(backgroundType) {
    // Return appropriate text color based on background
    switch (backgroundType) {
      case 'solid':
        return hexToRgba(state.bgColor, 1) === 'rgba(253,251,247,1)' ? '#2d2d2d' : '#f5f5f7';
      case 'gradient':
        // Check which gradient color is lighter
        const c1 = parseInt(state.gradientColor1.slice(1, 3), 16) * 0.299 +
                   parseInt(state.gradientColor1.slice(3, 5), 16) * 0.587 +
                   parseInt(state.gradientColor1.slice(5, 7), 16) * 0.114;
        const c2 = parseInt(state.gradientColor2.slice(1, 3), 16) * 0.299 +
                   parseInt(state.gradientColor2.slice(3, 5), 16) * 0.587 +
                   parseInt(state.gradientColor2.slice(5, 7), 16) * 0.114;
        return (c1 + c2) / 2 > 128 ? '#2d2d2d' : '#f5f5f7';
      case 'texture':
        return '#2d2d2d';
      case 'image':
        return '#2d2d2d';
      default:
        return '#2d2d2d';
    }
  }

  function drawText(ctx, width, height) {
    const padding = Math.min(width, height) * 0.06;
    const maxWidth = width - padding * 2;
    const maxHeight = height - padding * 2;

    // Get font config
    const fontConfig = FONT_CONFIGS[state.fontPair];
    const quoteFont = state.fontPair === 'custom'
      ? (els.customQuoteFont || fontConfig.quote)
      : fontConfig.quote;
    const authorFont = state.fontPair === 'custom'
      ? (els.customAuthorFont || fontConfig.author)
      : fontConfig.author;

    // Calculate font sizes based on dimensions and scaling
    const baseQuoteSize = Math.min(width, height) * 0.055;
    const baseAuthorSize = baseQuoteSize * 0.35;

    const quoteSize = getScaledFontSize(baseQuoteSize) * (parseFloat(els.fontScale.value) / 100 || 1);
    const authorSize = getScaledFontSize(baseAuthorSize) * (parseFloat(els.fontScale.value) / 100 || 1);

    const lineHeight = baseQuoteSize * getLineHeightMultiplier() / baseQuoteSize;

    // Prepare text
    const displayText = state.quoteText || els.customQuoteText.value || '«Your quote here»';
    const displayAuthor = state.quoteAuthor || els.customQuoteAuthor.value || '— Creator';

    // Split quote into lines
    ctx.font = `${quoteSize}px ${quoteFont}`;
    const quoteLines = wrapText(ctx, displayText, maxWidth);

    // Author text
    const authorText = displayAuthor ? '— ' + displayAuthor : '';

    // Calculate total text height
    const quoteHeight = quoteLines.length * quoteSize * 1.4;
    const authorHeight = authorText ? authorSize * 1.5 : 0;
    const totalHeight = quoteHeight + authorHeight;

    // Determine layout position
    let startY, startX;
    const align = state.alignment || 'center';

    if (state.layout === 'centered') {
      startY = (height - totalHeight) / 2 + quoteSize;
      startX = width / 2;
    } else if (state.layout === 'left') {
      startY = (height - totalHeight) / 2 + quoteSize;
      startX = padding;
    } else if (state.layout === 'right') {
      startY = (height - totalHeight) / 2 + quoteSize;
      startX = width - padding;
    } else if (state.layout === 'split') {
      // Split layout: quote on left, author on right
      const splitWidth = width / 2;
      const qHeight = quoteLines.length * quoteSize * 1.4;
      const aHeight = authorText ? authorSize * 1.5 : 0;

      // Draw quote on left
      startY = (height - qHeight) / 2 + quoteSize;
      startX = width / 4; // left side

      // Draw author on right
      startY = (height - aHeight) / 2 + authorSize + (quoteSize * 0.2);
      startX = width * 3 / 4; // right side

      // Return early since we've already drawn
      drawTextEffects(ctx, displayText, startX, startY, quoteSize, quoteFont, true);
      if (authorText) {
        ctx.font = `${authorSize}px ${authorFont}`;
        ctx.fillStyle = getContrastColor(state.background);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(authorText, width - padding, height / 2);
      }
      return;
    } else if (state.layout === 'bubble') {
      // Bubble layout: rounded rectangle behind text
      startY = (height - totalHeight) / 2 + quoteSize;
      startX = width / 2;

      // Draw bubble background
      drawQuoteBubble(ctx, width, height, quoteLines, quoteSize, authorSize, authorText);
      // Then draw text on top
      drawTextOnTop(ctx, displayText, startX, startY, quoteSize, quoteFont, maxWidth);
      if (authorText) {
        drawAuthorOnTop(ctx, authorText, startX, startY, authorSize, authorFont);
      }
      return;
    } else if (state.layout === 'minimal') {
      startY = (height - totalHeight) / 2 + quoteSize * 1.2;
      startX = width / 2;
    } else {
      // Default centered
      startY = (height - totalHeight) / 2 + quoteSize;
      startX = width / 2;
    }

    // Draw text with effects
    drawTextEffects(ctx, displayText, startX, startY, quoteSize, quoteFont, true);

    // Draw author
    if (authorText) {
      const authorY = startY + quoteHeight + authorSize * 0.3;
      ctx.font = `${authorSize}px ${authorFont}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = getContrastColor(state.background);
      ctx.fillText(authorText, startX, authorY);
    }
  }

  function drawQuoteBubble(ctx, width, height, quoteLines, quoteSize, authorSize, authorText) {
    // Calculate bubble dimensions
    const lineHeight = quoteSize * 1.4;
    const bubbleWidth = Math.min(maxWidth + padding * 1.5, width * 0.7);
    const bubbleHeight = (quoteLines.length * lineHeight) + authorSize * 1.5 + padding * 2;

    // Create bubble path
    ctx.fillStyle = hexToRgba(state.bgColor, 0.8);
    ctx.strokeStyle = state.accentColor;
    ctx.lineWidth = 1;

    const radius = Math.min(20, bubbleHeight / 6);

    ctx.beginPath();
    // Bubble rect with rounded corners
    const x = (width - bubbleWidth) / 2;
    const y = (height - bubbleHeight) / 2 - quoteSize * 0.2;

    // Top-left curve
    ctx.moveTo(x + radius, y);
    // Top edge
    ctx.lineTo(x + bubbleWidth - radius, y);
    // Top-right curve
    ctx.arcTo(x + bubbleWidth, y, x + bubbleWidth, y + radius, radius);
    // Right edge
    ctx.lineTo(x + bubbleWidth, y + bubbleHeight - radius);
    // Bottom-right curve
    ctx.arcTo(x + bubbleWidth, y + bubbleHeight, x + bubbleWidth - radius, y + bubbleHeight, radius);
    // Bottom edge
    ctx.lineTo(x + radius, y + bubbleHeight);
    // Bottom-left curve
    ctx.arcTo(x, y + bubbleHeight, x, y + bubbleHeight - radius, radius);
    // Left edge
    ctx.lineTo(x, y + radius);
    // Top-left curve
    ctx.arcTo(x, y, x + radius, y, radius);
    // Close
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
  }

  function drawTextOnTop(ctx, text, startX, startY, fontSize, fontFamily, maxWidth) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const lines = wrapText(ctx, text, maxWidth);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    lines.forEach((line, i) => {
      const y = startY + i * fontSize * 1.4;
      ctx.fillText(line, startX, y);
    });
  }

  function drawAuthorOnTop(ctx, authorText, startX, startY, fontSize, fontFamily) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(authorText, startX, startY);
  }

  function drawTextEffects(ctx, text, x, y, fontSize, fontFamily, isQuote) {
    const textColor = getContrastColor(state.background);

    // Shadow
    if (state.effects.shadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = state.effects.shadowBlur || 8;
      ctx.shadowOffsetX = state.effects.shadowOffset || 4;
      ctx.shadowOffsetY = state.effects.shadowOffset || 4;
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    // Outline
    if (state.effects.outline) {
      ctx.save();
      ctx.strokeStyle = state.effects.outlineColor || '#000000';
      ctx.lineWidth = Math.max(1, fontSize * 0.05);
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.strokeText(text, x, y);
      ctx.restore();
    }

    // Glow
    if (state.effects.glow) {
      ctx.save();
      ctx.shadowColor = state.effects.glowColor || '#ffd700';
      ctx.shadowBlur = state.effects.glowIntensity || 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    // Main text
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillText(text, x, y);
  }

  // ==========================================================================
  // EXPORT FUNCTIONS (Tasks 7 & 8)
  // ==========================================================================

  function downloadImage(format) {
    const canvas = els.posterCanvas;
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const extension = format === 'png' ? 'png' : 'jpg';

    // For JPG, we need to composite over white background
    let dataURL;
    if (format === 'jpg') {
      // Create a temporary canvas with white background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      // Fill white background
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the poster content
      tempCtx.drawImage(canvas, 0, 0);

      dataURL = tempCanvas.toDataURL(mimeType, 0.95);
    } else {
      dataURL = canvas.toDataURL(mimeType, 1.0);
    }

    const link = document.createElement('a');
    link.download = `quote-poster-${Date.now()}.${extension}`;
    link.href = dataURL;
    link.click();

    showToast(`Downloaded as ${extension.toUpperCase()}`);
  }

  async function copyToClipboard() {
    try {
      const canvas = els.posterCanvas;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      showToast('Copied to clipboard!');
    } catch (e) {
      showToast('Copy failed. Try downloading instead.', 'error');
      console.error('Copy failed:', e);
    }
  }

  function sharePoster() {
    if (!navigator.share) {
      await copyToClipboard();
      showToast('Share not available. Image copied to clipboard.');
      return;
    }

    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'quote-poster.png', { type: 'image/png' });
      try {
        await navigator.share({ files: [file], title: 'My Quote Poster' });
        showToast('Shared successfully!');
      } catch (e) {
        if (e.name !== 'AbortError') showToast('Share cancelled');
      }
    }, 'image/png');
  }

  function generateShareUrl() {
    const data = {
      q: state.quoteText,
      a: state.quoteAuthor,
      f: state.fontPair,
      b: state.background,
      bc: state.bgColor,
      pt: state.patternType,
      s: state.size,
      cw: state.customWidth,
      ch: state.customHeight,
      al: state.alignment || 'center',
      sh: state.effects.shadow,
      ol: state.effects.outline,
      gl: state.effects.glow,
      la: state.layout,
      vp: state.vPos,
      hp: state.hPos,
      mw: state.maxWidth
    };

    return `${window.location.origin}${window.location.pathname}#${btoa(JSON.stringify(data))}`;
  }

  function loadFromUrlHash() {
    if (!window.location.hash) return;

    try {
      const data = JSON.parse(atob(window.location.hash.slice(1)));
      if (data.q) { state.quoteText = data.q; els.customQuoteText.value = data.q; }
      if (data.a) { state.quoteAuthor = data.a; els.customQuoteAuthor.value = data.a; }
      if (data.f) { setFontPair(data.f); }
      if (data.b) { setBackground(data.b); }
      if (data.bc) { state.bgColor = data.bc; if (els.bgColor) els.bgColor.value = data.bc; }
      if (data.gt) { state.gradientType = data.gt; if (els.gradientType) els.gradientType.value = data.gt; }
      if (data.gc1) { state.gradientColor1 = data.gc1; if (els.gradColor1) els.gradColor1.value = data.gc1; }
      if (data.gc2) { state.gradientColor2 = data.gc2; if (els.gradColor2) els.gradColor2.value = data.gc2; }
      if (data.pt) { state.patternType = data.pt; if (els.patternType) els.patternType.value = data.pt; }
      if (data.s) { setSize(data.s); }
      if (data.cw) { state.customWidth = data.cw; if (els.customWidth) els.customWidth.value = data.cw; }
      if (data.ch) { state.customHeight = data.ch; if (els.customHeight) els.customHeight.value = data.ch; }
      if (data.al) { setAlignment(data.al); }
      if (data.sh !== undefined) { state.effects.shadow = data.sh; if (els.shadowToggle) els.shadowToggle.checked = data.sh; }
      if (data.ol !== undefined) { state.effects.outline = data.ol; if (els.outlineToggle) els.outlineToggle.checked = data.ol; }
      if (data.gl !== undefined) { state.effects.glow = data.gl; if (els.glowToggle2) els.glowToggle2.checked = data.gl; }
      if (data.la) { setLayout(data.la); }
      if (data.vp !== undefined) { state.vPos = data.vp; if (els.vPosSlider) els.vPosSlider.value = data.vp; if (els.vPosValue) els.vPosValue.textContent = data.vp + '%'; }
      if (data.hp !== undefined) { state.hPos = data.hp; if (els.hPosSlider) els.hPosSlider.value = data.hp; if (els.hPosValue) els.hPosValue.textContent = data.hp + '%'; }
      if (data.mw !== undefined) { state.maxWidth = data.mw; if (els.maxWidthSlider) els.maxWidthSlider.value = data.mw; if (els.maxWidthValue) els.maxWidthValue.textContent = data.mw + '%'; }
    } catch (e) {
      console.error('Failed to load from URL hash:', e);
    }
  }

  // ==========================================================================
  // STATISTICS TRACKING
  // ==========================================================================

  function recordUsage() {
    state.postersCreated++;

    // Track unique quotes - create a key from quote + author
    const quoteKey = `${state.quoteText}|${state.quoteAuthor}`;
    state.uniqueQuotesUsed.add(quoteKey);

    // Track font usage
    state.fontUsage[state.fontPair] = (state.fontUsage[state.fontPair] || 0) + 1;

    // Track palette usage
    state.paletteUsage = state.paletteUsage || {};
    state.paletteUsage[state.palette] = (state.paletteUsage[state.palette] || 0) + 1;

    // Save to localStorage
    saveQuotesToLocalStorage();

    // Update stats display
    updateStatsDisplay();
  }

  function updateStatsDisplay() {
    if (els.statPosters) els.statPosters.textContent = state.postersCreated;
    if (els.statQuotes) els.statQuotes.textContent = state.uniqueQuotesUsed.size;

    // Favorite font
    const favorite = Object.entries(state.fontUsage).sort((a, b) => b[1] - a[1])[0];
    if (els.statFonts) {
      els.statFonts.textContent = favorite ? FONT_CONFIGS[favorite[0]]?.label || favorite[0] : '—';
    }

    // Top palette
    if (els.statPalettes) {
      const topPalette = Object.entries(state.paletteUsage || {}).sort((a, b) => b[1] - a[1])[0];
      els.statPalettes.textContent = topPalette ? topPalette[0] : '—';
    }
  }

  // Initialize stats from localStorage
  function initStats() {
    const savedQuotes = localStorage.getItem('quotePosterQuotes');
    if (savedQuotes) {
      try {
        const data = JSON.parse(savedQuotes);
        state.postersCreated = data.postersCreated || 0;
        state.uniqueQuotesUsed = new Set(data.quotes || []);
      } catch (e) {
        console.error('Failed to init stats:', e);
      }
    }
    updateStatsDisplay();
  }

  // ==========================================================================
  // THEME SWITCHING (light/dark)
  // ==========================================================================

  function loadThemePreference() {
    const saved = localStorage.getItem('quotePosterTheme');
    if (saved) {
      state.uiTheme = saved;
      if (els.uiTheme) els.uiTheme.value = saved;
    }
    applyTheme(state.uiTheme);
  }

  function applyTheme(theme) {
    state.uiTheme = theme;
    if (els.uiTheme) els.uiTheme.value = theme;
    document.body.classList.toggle('light-theme', theme === 'dark');
    localStorage.setItem('quotePosterTheme', theme);
  }

  // ==========================================================================
  // EVENT LISTENERS INITIALIZATION
  // ==========================================================================

  function initEventListeners() {
    // ==== Task 1 & 2: Quote Source ====
    els.sourceTabs.forEach(tab => {
      tab.addEventListener('click', () => handleSourceChange(tab.dataset.source));
    });

    // Daily quote refresh
    if (els.refreshDailyBtn) {
      els.refreshDailyBtn.addEventListener('click', () => {
        const quote = getQuoteFromSource('daily');
        renderQuotePreview(quote, 'daily');
        state.quoteText = quote.text;
        state.quoteAuthor = quote.author;
        updateQuoteDisplay();
        showToast('New daily quote loaded');
      });
    }

    // Random quote refresh
    if (els.refreshRandomBtn) {
      els.refreshRandomBtn.addEventListener('click', () => {
        const quote = getQuoteFromSource('random');
        renderQuotePreview(quote, 'random');
        state.quoteText = quote.text;
        state.quoteAuthor = quote.author;
        updateQuoteDisplay();
        showToast('New random quote generated');
      });
    }

    // Library category change
    if (els.libraryCategory) {
      els.libraryCategory.addEventListener('change', (e) => {
        const quote = getQuoteFromSource('library');
        renderQuotePreview(quote, 'library');
        state.quoteText = quote.text;
        state.quoteAuthor = quote.author;
        updateQuoteDisplay();
        setSource('custom'); // Switch to custom for editing
      });
    }

    // Custom quote inputs
    if (els.customQuoteText) {
      els.customQuoteText.addEventListener('input', () => {
        state.quoteText = els.customQuoteText.value;
        updateQuoteDisplay();
      });
    }
    if (els.customQuoteAuthor) {
      els.customQuoteAuthor.addEventListener('input', () => {
        state.quoteAuthor = els.customQuoteAuthor.value;
        updateQuoteDisplay();
      });
    }

    // ==== Task 3: Font Pairings ====
    els.fontTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const font = tab.dataset.font;
        if (font) setFontPair(font);
      });
    });

    // Font scale and line height
    if (els.fontScale) {
      els.fontScale.addEventListener('input', updateFontDisplay);
    }
    if (els.lineHeight) {
      els.lineHeight.addEventListener('input', updateFontDisplay);
    }

    // ==== Task 4: Background Styles ====
    els.bgTabs.forEach(tab => {
      tab.addEventListener('click', () => setBackground(tab.dataset.bg));
    });

    // Color swatches
    els.colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.dataset.color;
        if (color) {
          state.bgColor = color;
          if (els.bgColor) els.bgColor.value = color;
          updateFontDisplay();
        }
      });
    });

    // Custom solid color
    if (els.customSolidColor) {
      els.customSolidColor.addEventListener('change', (e) => {
        state.bgColor = e.target.value;
        if (els.bgColor) els.bgColor.value = e.target.value;
        updateFontDisplay();
      });
    }

    // Gradient presets
    els.gradientPresets.forEach(preset => {
      preset.addEventListener('click', () => {
        const gradient = preset.dataset.gradient;
        if (gradient) {
          // Update gradient colors based on preset
          const gradientMap = {
            dawn: ['#ffeaa7', '#fab1a0'],
            dusk: ['#a29bfe', '#fd79a8'],
            forest: ['#55efc4', '#00b894'],
            ocean: ['#74b9ff', '#0984e3'],
            ember: ['#ffeaa7', '#e17055'],
            midnight: ['#636e72', '#2d3436'],
            rose: ['#fab1a0', '#e84393'],
            gold: ['#fdcb6e', '#e17055']
          };

          const colors = gradientMap[gradient] || gradientMap.dawn;
          if (els.gradColor1) els.gradColor1.value = colors[0];
          if (els.gradColor2) els.gradColor2.value = colors[1];
          state.gradientColor1 = colors[0];
          state.gradientColor2 = colors[1];
          if (els.gradAngle) els.gradAngle.value = 135;
          if (els.gradAngleValue) els.gradAngleValue.textContent = '135°';

          // Mark active
          els.gradientPresets.forEach(p => p.classList.remove('active'));
          preset.classList.add('active');
          setActiveTab(els.gradientPresets, gradient);
        }
      });
    });

    // Gradient angle
    if (els.gradAngle) {
      els.gradAngle.addEventListener('input', (e) => {
        if (els.gradAngleValue) els.gradAngleValue.textContent = e.target.value + '°';
        state.gradAngle = parseInt(e.target.value) || 135;
        updateFontDisplay();
      });
    }

    // Texture buttons
    els.textureGrid.forEach(btn => {
      btn.addEventListener('click', () => {
        const texture = btn.dataset.texture;
        if (texture) {
          // Update active state
          els.textureGrid.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          state.patternType = texture || 'none';
          if (els.patternType) els.patternType.value = texture || 'none';

          // Update opacity
          if (els.textureOpacity) {
            els.textureOpacity.value = state.bgTextureOpacity || 15;
            if (els.textureOpacityValue) els.textureOpacityValue.textContent = (state.bgTextureOpacity || 15) + '%';
          }

          updateFontDisplay();
        }
      });
    });

    // Texture opacity
    if (els.textureOpacity) {
      els.textureOpacity.addEventListener('input', (e) => {
        state.bgTextureOpacity = parseInt(e.target.value) || 15;
        if (els.textureOpacityValue) els.textureOpacityValue.textContent = state.bgTextureOpacity + '%';
        updateFontDisplay();
      });
    }

    // Image upload
    if (els.bgImageUpload) {
      els.bgImageUpload.addEventListener('change', (e) => {
        if (e.target.files[0]) {
          const file = e.target.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e2) => {
              const img = new Image();
              img.onload = () => {
                state.bgImage = img;
                if (els.bgDropZone) {
                  els.bgDropZone.classList.add('has-image');
                  els.bgDropZone.innerHTML = `
                    <div style="font-size: 0.875rem; color: var(--fg);">
                      ${file.name}<br>
                      <span style="font-size: 0.75rem; color: var(--fg-light);"> ${img.width}×${img.height}px</span>
                    </div>
                  `;
                }
                showToast('Background image loaded');
                updateFontDisplay();
              };
              img.src = e2.target.result;
            };
            reader.readAsDataURL(file);
          } else {
            showToast('Please select a valid image file');
          }
        }
      });
    }

    // Drop zone
    if (els.bgDropZone) {
      els.bgDropZone.addEventListener('click', () => {
        if (els.bgImageUpload) els.bgImageUpload.click();
      });

      els.bgDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (els.bgDropZone) els.bgDropZone.classList.add('drag-over');
      });

      els.bgDropZone.addEventListener('dragleave', () => {
        if (els.bgDropZone) els.bgDropZone.classList.remove('drag-over');
      });

      els.bgDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (els.bgDropZone) els.bgDropZone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) {
          els.bgImageUpload.files = e.dataTransfer.files;
          if (els.bgImageUpload) els.bgImageUpload.dispatchEvent(new Event('change'));
        }
      });
    }

    // Image controls
    if (els.imageOverlay) {
      els.imageOverlay.addEventListener('input', (e) => {
        state.bgTextureOpacity = parseInt(e.target.value) || 30;
        if (els.imageOverlayValue) els.imageOverlayValue.textContent = state.bgTextureOpacity + '%';
        updateFontDisplay();
      });
    }
    if (els.imageBlend) {
      els.imageBlend.addEventListener('change', (e) => {
        state.imageBlendMode = e.target.value;
        updateFontDisplay();
      });
    }

    // ==== Task 5: Canvas Size ====
    els.sizeCards.forEach(card => {
      card.addEventListener('click', () => {
        const size = card.dataset.size;
        if (size) setSize(size);
      });
    });

    // Custom size inputs
    if (els.customWidth) {
      els.customWidth.addEventListener('input', handleSizeInput);
    }
    if (els.customHeight) {
      els.customHeight.addEventListener('input', handleSizeInput);
    }

    // ==== Task 9: Layout Presets ====
    els.layoutCards.forEach(card => {
      card.addEventListener('click', () => {
        const layout = card.dataset.layout;
        if (layout) setLayout(layout);
      });
    });

    // Layout sliders
    if (els.vPosSlider) {
      els.vPosSlider.addEventListener('input', (e) => {
        state.vPos = parseInt(e.target.value) || 50;
        if (els.vPosValue) els.vPosValue.textContent = state.vPos + '%';
        handleLayoutInputs();
        updateFontDisplay();
      });
    }
    if (els.hPosSlider) {
      els.hPosSlider.addEventListener('input', (e) => {
        state.hPos = parseInt(e.target.value) || 50;
        if (els.hPosValue) els.hPosValue.textContent = state.hPos + '%';
        handleLayoutInputs();
        updateFontDisplay();
      });
    }
    if (els.maxWidthSlider) {
      els.maxWidthSlider.addEventListener('input', (e) => {
        state.maxWidth = parseInt(e.target.value) || 85;
        if (els.maxWidthValue) els.maxWidthValue.textContent = state.maxWidth + '%';
        handleLayoutInputs();
        updateFontDisplay();
      });
    }

    // ==== Task 6: Text Effects ====
    if (els.shadowToggle) {
      els.shadowToggle.addEventListener('change', handleEffectsChange);
    }
    if (els.outlineToggle) {
      els.outlineToggle.addEventListener('change', handleEffectsChange);
    }
    if (els.glowToggle2) {
      els.glowToggle2.addEventListener('change', handleEffectsChange);
    }

    // Effect sliders and color pickers
    if (els.shadowIntensity) {
      els.shadowIntensity.addEventListener('input', (e) => {
        state.effects.shadowIntensity = parseInt(e.target.value) || 40;
        if (els.shadowIntensityValue) els.shadowIntensityValue.textContent = state.effects.shadowIntensity + '%';
        updateFontDisplay();
      });
    }
    if (els.shadowBlur) {
      els.shadowBlur.addEventListener('input', (e) => {
        state.effects.shadowBlur = parseInt(e.target.value) || 8;
        if (els.shadowBlurValue) els.shadowBlurValue.textContent = state.effects.shadowBlur + 'px';
        updateFontDisplay();
      });
    }
    if (els.shadowOffset) {
      els.shadowOffset.addEventListener('input', (e) => {
        state.effects.shadowOffset = parseInt(e.target.value) || 4;
        if (els.shadowOffsetValue) els.shadowOffsetValue.textContent = state.effects.shadowOffset + 'px';
        updateFontDisplay();
      });
    }
    if (els.outlineWidth) {
      els.outlineWidth.addEventListener('input', (e) => {
        state.effects.outlineWidth = parseFloat(e.target.value) || 2;
        if (els.outlineWidthValue) els.outlineWidthValue.textContent = state.effects.outlineWidth + 'px';
        updateFontDisplay();
      });
    }
    if (els.outlineColor) {
      els.outlineColor.addEventListener('change', (e) => {
        state.effects.outlineColor = e.target.value || '#000000';
        updateFontDisplay();
      });
    }
    if (els.glowIntensity) {
      els.glowIntensity.addEventListener('input', (e) => {
        state.effects.glowIntensity = parseInt(e.target.value) || 20;
        if (els.glowIntensityValue) els.glowIntensityValue.textContent = state.effects.glowIntensity + 'px';
        updateFontDisplay();
      });
    }
    if (els.glowColor) {
      els.glowColor.addEventListener('change', (e) => {
        state.effects.glowColor = e.target.value || '#ffd700';
        updateFontDisplay();
      });
    }

    // ==== Task 10: Color Theme Picker ====
    els.paletteCards.forEach(card => {
      card.addEventListener('click', () => {
        const palette = card.dataset.palette;
        if (palette) setPalette(palette);
      });
    });

    if (els.textColorPicker) {
      els.textColorPicker.addEventListener('change', handlePaletteChange);
    }
    if (els.accentColorPicker) {
      els.accentColorPicker.addEventListener('change', handlePaletteChange);
    }

    // ==== Actions ====
    if (els.generateBtn) {
      els.generateBtn.addEventListener('click', renderPoster);
    }

    if (els.randomizeBtn) {
      els.randomizeBtn.addEventListener('click', randomizeAll);
    }

    // Export buttons
    if (els.downloadPngBtn) {
      els.downloadPngBtn.addEventListener('click', () => downloadImage('png'));
    }
    if (els.downloadJpgBtn) {
      els.downloadJpgBtn.addEventListener('click', () => downloadImage('jpg'));
    }
    if (els.copyBtn) {
      els.copyBtn.addEventListener('click', copyToClipboard);
    }
    if (els.shareBtn) {
      els.shareBtn.addEventListener('click', sharePoster);
    }

    // ==== Theme ====
    if (els.uiTheme) {
      els.uiTheme.addEventListener('change', () => applyTheme(els.uiTheme.value));
    }

    // Load from URL hash
    window.addEventListener('hashchange', loadFromUrlHash);
  }

  function randomizeAll() {
    // Random source
    const sources = ['daily', 'random', 'library', 'custom'];
    setSource(sources[Math.floor(Math.random() * sources.length)]);

    // Random font
    const fonts = Object.keys(FONT_CONFIGS).filter(k => k !== 'custom');
    setFontPair(fonts[Math.floor(Math.random() * fonts.length)]);

    // Random background
    const backgrounds = ['solid', 'gradient', 'texture', 'image'];
    setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)]);

    // Random colors for gradient
    if (state.background === 'gradient') {
      const hues = [0, 30, 60, 120, 180, 210, 270, 300, 330];
      const h1 = hues[Math.floor(Math.random() * hues.length)];
      const h2 = hues[Math.floor(Math.random() * hues.length)];
      state.gradientColor1 = `hsl(${h1}, 80%, 55%)`;
      state.gradientColor2 = `hsl(${h2}, 80%, 55%)`;
      if (els.gradColor1) els.gradColor1.value = state.gradientColor1;
      if (els.gradColor2) els.gradColor2.value = state.gradientColor2;
    }

    // Random size
    const sizes = Object.keys(SIZE_PRESETS);
    setSize(sizes[Math.floor(Math.random() * sizes.length)]);

    // Random layout
    const layouts = Object.keys(LAYOUT_PRESETS);
    setLayout(layouts[Math.floor(Math.random() * layouts.length)]);

    // Random effects
    state.effects.shadow = Math.random() > 0.3;
    state.effects.outline = Math.random() > 0.7;
    state.effects.glow = Math.random() > 0.7;
    updateEffectsDisplay();

    // Random palette
    const palettes = Object.keys(PALETTE_CONFIGS);
    setPalette(palettes[Math.floor(Math.random() * palettes.length)]);

    showToast('Everything randomized!');
  }

  // ==========================================================================
  // RESULTS MODAL
  // ==========================================================================

  function showResultsModal(width, height) {
    if (!els.resultsModal) return;

    els.resultsModal.hidden = false;
    els.gameStatus.textContent = 'Poster generated! Choose an export option.';

    // Update modal stats
    if (els.resultDimensions) {
      els.resultDimensions.textContent = `${width}×${height}`;
    }
    if (els.resultQuoteLength) {
      els.resultQuoteLength.textContent = `${state.quoteText.length} chars`;
    }
    if (els.resultFontPair) {
      els.resultFontPair.textContent = FONT_CONFIGS[state.fontPair]?.label || state.fontPair;
    }
    const bgLabels = { solid: 'Solid', gradient: 'Gradient', texture: 'Texture', image: 'Image' };
    if (els.resultBgType) {
      els.resultBgType.textContent = bgLabels[state.background] || state.background;
    }
  }

  function closeResultsModal() {
    if (els.resultsModal) {
      els.resultsModal.hidden = true;
    }
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  function init() {
    // Cache elements (run after DOM is ready)
    cacheElements();

    // Initialize statistics
    initStats();

    // Load theme preference
    loadThemePreference();

    // Load from URL hash
    loadFromUrlHash();

    // Set initial state based on loaded data
    setSource(state.source);
    setFontPair(state.fontPair);
    setBackground(state.background);
    setSize(state.size);
    setLayout(state.layout);
    updateEffectsDisplay();
    setPalette(state.palette);

    // Initialize UI elements with current state
    if (els.customQuoteText) els.customQuoteText.value = state.quoteText || '';
    if (els.customQuoteAuthor) els.customQuoteAuthor.value = state.quoteAuthor || '';

    // Set up initial quote preview
    if (state.source === 'daily') {
      loadDailyQuote();
    } else if (state.source === 'random') {
      generateRandomQuote();
    }

    // Initialize event listeners
    initEventListeners();

    // Initial render (will show placeholder until config is complete)
    if (els.posterCanvas) {
      // Set initial canvas size
      const initSize = SIZE_PRESETS.instagram || { width: 1080, height: 1080 };
      els.posterCanvas.width = initSize.width * 2;
      els.posterCanvas.height = initSize.height * 2;
      els.posterCanvas.style.width = initSize.width + 'px';
      els.posterCanvas.style.height = initSize.height + 'px';
    }

    console.log('Quote Poster Studio initialized - all 10 tasks ready');
  }

  function cacheElements() {
    // Re-cache elements that might have been updated
    // This is called after DOM is ready
    const elementMap = {
      // Source tabs
      dailyQuotePreview: document.getElementById('dailyQuotePreview'),
      randomQuotePreview: document.getElementById('randomQuotePreview'),
      libraryQuotePreview: document.getElementById('libraryQuotePreview'),

      // Font controls
      fontScale: document.getElementById('fontScale'),
      fontScaleValue: document.getElementById('fontScaleValue'),
      lineHeight: document.getElementById('lineHeight'),
      lineHeightValue: document.getElementById('lineHeightValue'),

      // Background
      bgColor: document.getElementById('bgColor'),
      gradColor1: document.getElementById('gradColor1'),
      gradColor2: document.getElementById('gradColor2'),
      gradAngle: document.getElementById('gradAngle'),
      gradAngleValue: document.getElementById('gradAngleValue'),
      textureOpacity: document.getElementById('textureOpacity'),
      textureOpacityValue: document.getElementById('textureOpacityValue'),
      bgImageUpload: document.getElementById('bgImageUpload'),
      bgDropZone: document.getElementById('bgDropZone'),
      imageControls: document.getElementById('imageControls'),
      imageOverlay: document.getElementById('imageOverlay'),
      imageOverlayValue: document.getElementById('imageOverlayValue'),
      imageBlend: document.getElementById('imageBlend'),

      // Size
      customWidth: document.getElementById('customWidth'),
      customHeight: document.getElementById('customHeight'),

      // Layout
      vPosSlider: document.getElementById('vPos'),
      hPosSlider: document.getElementById('hPos'),
      maxWidthSlider: document.getElementById('maxWidth'),
      vPosValue: document.getElementById('vPosValue'),
      hPosValue: document.getElementById('hPosValue'),
      maxWidthValue: document.getElementById('maxWidthValue'),

      // Effects
      shadowToggle: document.getElementById('shadowToggle'),
      outlineToggle: document.getElementById('outlineToggle'),
      glowToggle: document.getElementById('glowToggle'),
      shadowIntensity: document.getElementById('shadowIntensity'),
      shadowBlur: document.getElementById('shadowBlur'),
      shadowOffset: document.getElementById('shadowOffset'),
      shadowIntensityValue: document.getElementById('shadowIntensityValue'),
      shadowBlurValue: document.getElementById('shadowBlurValue'),
      shadowOffsetValue: document.getElementById('shadowOffsetValue'),
      outlineColor: document.getElementById('outlineColor'),
      outlineWidth: document.getElementById('outlineWidth'),
      outlineWidthValue: document.getElementById('outlineWidthValue'),
      glowIntensity: document.getElementById('glowIntensity'),
      glowIntensityValue: document.getElementById('glowIntensityValue'),
      glowColor: document.getElementById('glowColor'),

      // Theme
      textColor: document.getElementById('textColor'),
      accentColor: document.getElementById('accentColor'),
      paletteCards: document.querySelectorAll('.palette-card'),
      uiTheme: document.getElementById('uiTheme'),

      // Actions
      generateBtn: document.getElementById('generateBtn'),
      randomizeBtn: document.getElementById('randomizeBtn'),
      downloadPngBtn: document.getElementById('downloadPngBtn'),
      downloadJpgBtn: document.getElementById('downloadJpgBtn'),
      copyBtn: document.getElementById('copyBtn'),
      shareBtn: document.getElementById('shareBtn'),
      exportActions: document.getElementById('exportActions'),

      // Stats
      statPosters: document.getElementById('statPosters'),
      statQuotes: document.getElementById('statQuotes'),
      statFonts: document.getElementById('statFonts'),
      statPalettes: document.getElementById('statPalettes'),

      // Canvas
      posterCanvas: document.getElementById('posterCanvas'),
      resultsModal: document.getElementById('resultsModal'),
      modalTitle: document.getElementById('modalTitle'),
      canvasPlaceholder: document.getElementById('canvasPlaceholder')
    };

    // Update the els object with cached elements
    Object.assign(els, elementMap);
  }

  // ==========================================================================
  // DAILY/RANDOM QUOTE HELPERS
  // ==========================================================================

  function loadDailyQuote() {
    const quote = getDailyQuote();
    state.quoteText = quote.text;
    state.quoteAuthor = quote.author;
    renderQuotePreview(quote, 'daily');
    updateQuoteDisplay();
  }

  function generateRandomQuote() {
    const quote = getRandomQuote();
    state.quoteText = quote.text;
    state.quoteAuthor = quote.author;
    renderQuotePreview(quote, 'random');
    updateQuoteDisplay();
  }

  function getRandomQuote() {
    const allQuotes = Object.values(QUOTE_LIBRARY).flat();
    const idx = Math.floor(Math.random() * allQuotes.length);
    return allQuotes[idx];
  }

  // Make functions globally accessible for HTML event handlers
  window.getDailyQuote = loadDailyQuote;
  window.generateRandomQuote = generateRandomQuote;
  window.randomizeAll = randomizeAll;
  window.downloadImage = downloadImage;
  window.copyToClipboard = copyToClipboard;
  window.sharePoster = sharePoster;

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();