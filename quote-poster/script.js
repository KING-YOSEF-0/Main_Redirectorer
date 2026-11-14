// Quote Poster Generator - Main Script
(function() {
  'use strict';

  // ============================================
  // DATA & CONFIGURATION
  // ============================================

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
    ]
  };

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

  const SIZE_PRESETS = {
    instagram: { width: 1080, height: 1080, label: "Instagram Post (1080×1080)" },
    story: { width: 1080, height: 1920, label: "Instagram Story (1080×1920)" },
    twitter: { width: 1200, height: 675, label: "Twitter Post (1200×675)" },
    linkedin: { width: 1200, height: 627, label: "LinkedIn Post (1200×627)" },
    facebook: { width: 1200, height: 630, label: "Facebook Post (1200×630)" },
    pinterest: { width: 1000, height: 1500, label: "Pinterest Pin (1000×1500)" }
  };

  const FONT_PAIRS = {
    playfair: { quote: "'Playfair Display', serif", author: "'JetBrains Mono', monospace", label: "Playfair + Mono" },
    georgia: { quote: "'Georgia', serif", author: "'Helvetica', sans-serif", label: "Georgia + Helvetica" },
    merriweather: { quote: "'Merriweather', serif", author: "'Arial', sans-serif", label: "Merriweather + Sans" },
    custom: { quote: "'Playfair Display', serif", author: "'JetBrains Mono', monospace", label: "Custom" }
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const state = {
    source: 'custom',
    quoteText: '',
    quoteAuthor: '',
    fontPair: 'playfair',
    customQuoteFont: "'Playfair Display', serif",
    customAuthorFont: "'JetBrains Mono', monospace",
    background: 'solid',
    bgColor: '#1a1a2e',
    gradientType: 'linear',
    gradientColor1: '#ff4fa3',
    gradientColor2: '#35c3ff',
    bgImage: null,
    bgOpacity: 0.3,
    patternType: 'dots',
    size: 'instagram',
    customWidth: 1080,
    customHeight: 1080,
    alignment: 'center',
    effects: { shadow: true, outline: false, glow: false },
    uiTheme: 'dark',
    postersCreated: 0,
    uniqueQuotes: new Set(),
    fontUsage: {}
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================

  const els = {};
  function cacheElements() {
    els.bubbles = document.getElementById('bubbles');
    els.modeTabs = document.querySelectorAll('.mode-tab[data-source]');
    els.fontTabs = document.querySelectorAll('.font-tab');
    els.bgTabs = document.querySelectorAll('.bg-tab');
    els.sizeTabs = document.querySelectorAll('.size-tab');
    els.alignTabs = document.querySelectorAll('.align-tab');
    els.quoteText = document.getElementById('quoteText');
    els.quoteAuthor = document.getElementById('quoteAuthor');
    els.customOptions = document.getElementById('customOptions');
    els.dailyOptions = document.getElementById('dailyOptions');
    els.randomOptions = document.getElementById('randomOptions');
    els.libraryOptions = document.getElementById('libraryOptions');
    els.customFontOptions = document.getElementById('customFontOptions');
    els.solidOptions = document.getElementById('solidOptions');
    els.gradientOptions = document.getElementById('gradientOptions');
    els.imageOptions = document.getElementById('imageOptions');
    els.patternOptions = document.getElementById('patternOptions');
    els.customSizeOptions = document.getElementById('customSizeOptions');
    els.quoteFontSelect = document.getElementById('quoteFontSelect');
    els.authorFontSelect = document.getElementById('authorFontSelect');
    els.bgColor = document.getElementById('bgColor');
    els.gradientType = document.getElementById('gradientType');
    els.gradientColor1 = document.getElementById('gradientColor1');
    els.gradientColor2 = document.getElementById('gradientColor2');
    els.bgImageUpload = document.getElementById('bgImageUpload');
    els.bgDropZone = document.getElementById('bgDropZone');
    els.bgOpacity = document.getElementById('bgOpacity');
    els.patternType = document.getElementById('patternType');
    els.customWidth = document.getElementById('customWidth');
    els.customHeight = document.getElementById('customHeight');
    els.shadowToggle = document.getElementById('shadowToggle');
    els.outlineToggle = document.getElementById('outlineToggle');
    els.glowToggle = document.getElementById('glowToggle');
    els.generateBtn = document.getElementById('generateBtn');
    els.randomizeBtn = document.getElementById('randomizeBtn');
    els.downloadPngBtn = document.getElementById('downloadPngBtn');
    els.downloadJpgBtn = document.getElementById('downloadJpgBtn');
    els.copyBtn = document.getElementById('copyBtn');
    els.shareBtn = document.getElementById('shareBtn');
    els.newPosterBtn = document.getElementById('newPosterBtn');
    els.loadDailyBtn = document.getElementById('loadDailyBtn');
    els.randomBtn = document.getElementById('randomBtn');
    els.quoteCategory = document.getElementById('quoteCategory');
    els.uiTheme = document.getElementById('uiTheme');
    els.posterCanvas = document.getElementById('posterCanvas');
    els.posterContainer = document.getElementById('posterContainer');
    els.gameStatus = document.getElementById('gameStatus');
    els.resultsModal = document.getElementById('resultsModal');
    els.resultDimensions = document.getElementById('resultDimensions');
    els.resultQuoteLength = document.getElementById('resultQuoteLength');
    els.resultFontPair = document.getElementById('resultFontPair');
    els.resultBgType = document.getElementById('resultBgType');
    els.shareBtnModal = document.getElementById('shareBtnModal');
    els.downloadBtnModal = document.getElementById('downloadBtnModal');
    els.newPosterBtnModal = document.getElementById('newPosterBtnModal');
    els.dailyQuoteDisplay = document.getElementById('dailyQuoteDisplay');
    els.randomQuoteDisplay = document.getElementById('randomQuoteDisplay');
    els.postersCreated = document.getElementById('postersCreated');
    els.uniqueQuotes = document.getElementById('uniqueQuotes');
    els.favoriteFont = document.getElementById('favoriteFont');
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
      const isActive = tab.dataset.source === value || tab.dataset.font === value || tab.dataset.bg === value || tab.dataset.size === value || tab.dataset.align === value;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });
  }

  function getSeededRandom(date = new Date()) {
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function getDailyQuote() {
    const idx = Math.floor(getSeededRandom() * DAILY_QUOTES.length);
    return DAILY_QUOTES[idx];
  }

  function getRandomQuote() {
    const allQuotes = Object.values(QUOTE_LIBRARY).flat();
    const idx = Math.floor(Math.random() * allQuotes.length);
    return allQuotes[idx];
  }

  function getQuoteFromLibrary(category) {
    const quotes = category === 'all' ? Object.values(QUOTE_LIBRARY).flat() : QUOTE_LIBRARY[category] || [];
    if (quotes.length === 0) return null;
    const idx = Math.floor(Math.random() * quotes.length);
    return quotes[idx];
  }

  function loadStats() {
    const saved = localStorage.getItem('quotePosterStats');
    if (saved) {
      const data = JSON.parse(saved);
      state.postersCreated = data.postersCreated || 0;
      state.uniqueQuotes = new Set(data.uniqueQuotes || []);
      state.fontUsage = data.fontUsage || {};
      updateStatsDisplay();
    }
  }

  function saveStats() {
    localStorage.setItem('quotePosterStats', JSON.stringify({
      postersCreated: state.postersCreated,
      uniqueQuotes: Array.from(state.uniqueQuotes),
      fontUsage: state.fontUsage
    }));
  }

  function updateStatsDisplay() {
    els.postersCreated.textContent = state.postersCreated;
    els.uniqueQuotes.textContent = state.uniqueQuotes.size;
    const favorite = Object.entries(state.fontUsage).sort((a, b) => b[1] - a[1])[0];
    els.favoriteFont.textContent = favorite ? FONT_PAIRS[favorite[0]]?.label || favorite[0] : '—';
  }

  function recordUsage() {
    state.postersCreated++;
    const quoteKey = `${state.quoteText}|${state.quoteAuthor}`;
    state.uniqueQuotes.add(quoteKey);
    state.fontUsage[state.fontPair] = (state.fontUsage[state.fontPair] || 0) + 1;
    saveStats();
    updateStatsDisplay();
  }

  function loadTheme() {
    const theme = localStorage.getItem('quotePosterTheme') || 'dark';
    state.uiTheme = theme;
    els.uiTheme.value = theme;
    document.body.classList.toggle('light-theme', theme === 'light');
  }

  function saveTheme(theme) {
    localStorage.setItem('quotePosterTheme', theme);
    state.uiTheme = theme;
    document.body.classList.toggle('light-theme', theme === 'light');
  }

  // ============================================
  // BACKGROUND PATTERNS
  // ============================================

  function drawPattern(ctx, width, height, type) {
    ctx.save();
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, width, height);

    const patternColor = hexToRgba(state.bgColor, 0.1);
    ctx.strokeStyle = patternColor;
    ctx.lineWidth = 1;

    switch (type) {
      case 'dots':
        const dotSpacing = 40;
        for (let x = 0; x < width; x += dotSpacing) {
          for (let y = 0; y < height; y += dotSpacing) {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case 'lines':
        const lineSpacing = 30;
        for (let x = 0; x < width; x += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        break;
      case 'grid':
        const gridSpacing = 50;
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
        for (let y = 0; y < height; y += 60) {
          ctx.beginPath();
          for (let x = 0; x < width; x += 5) {
            const waveY = y + Math.sin(x * 0.02) * 15;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        }
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

  // ============================================
  // CANVAS RENDERING
  // ============================================

  function renderPoster() {
    const canvas = els.posterCanvas;
    const ctx = canvas.getContext('2d');

    const size = SIZE_PRESETS[state.size] || { width: state.customWidth, height: state.customHeight };
    const width = size.width;
    const height = size.height;

    // Set canvas resolution (2x for crisp rendering)
    const dpr = 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw background
    drawBackground(ctx, width, height);

    // Draw text
    drawText(ctx, width, height);

    // Show download buttons
    els.downloadPngBtn.hidden = false;
    els.downloadJpgBtn.hidden = false;
    els.copyBtn.hidden = false;
    els.shareBtn.hidden = false;
    els.newPosterBtn.hidden = false;
    els.shareBtnModal.hidden = false;
    els.downloadBtnModal.hidden = false;

    // Update modal results
    els.resultDimensions.textContent = `${width}×${height}`;
    els.resultQuoteLength.textContent = `${state.quoteText.length} chars`;
    els.resultFontPair.textContent = FONT_PAIRS[state.fontPair].label;
    const bgLabels = { solid: 'Solid', gradient: 'Gradient', image: 'Image', pattern: 'Pattern' };
    els.resultBgType.textContent = bgLabels[state.background] || state.background;

    // Show modal
    els.resultsModal.hidden = false;
    els.gameStatus.textContent = 'Poster generated! Choose an export option.';

    recordUsage();
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
          gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        } else { // conic
          gradient = ctx.createConicGradient(0, width/2, height/2);
        }
        gradient.addColorStop(0, state.gradientColor1);
        gradient.addColorStop(1, state.gradientColor2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;

      case 'image':
        if (state.bgImage) {
          // Draw image covering the canvas
          const img = state.bgImage;
          const scale = Math.max(width / img.width, height / img.height);
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
          const x = (width - drawWidth) / 2;
          const y = (height - drawHeight) / 2;
          ctx.drawImage(img, x, y, drawWidth, drawHeight);

          // Overlay with color
          ctx.fillStyle = hexToRgba(state.bgColor, state.bgOpacity);
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.fillStyle = state.bgColor;
          ctx.fillRect(0, 0, width, height);
        }
        break;

      case 'pattern':
        drawPattern(ctx, width, height, state.patternType);
        break;
    }
  }

  function drawText(ctx, width, height) {
    const fontPair = state.fontPair === 'custom'
      ? { quote: state.customQuoteFont, author: state.customAuthorFont }
      : FONT_PAIRS[state.fontPair];

    const padding = Math.min(width, height) * 0.08;
    const maxWidth = width - padding * 2;
    const maxHeight = height - padding * 2;

    // Calculate font sizes
    const quoteFontSize = Math.min(width, height) * 0.065;
    const authorFontSize = quoteFontSize * 0.4;

    // Prepare text lines
    ctx.font = `${quoteFontSize}px ${fontPair.quote}`;
    const quoteLines = wrapText(ctx, state.quoteText, maxWidth);
    const authorText = state.quoteAuthor ? `— ${state.quoteAuthor}` : '';

    // Calculate total text height
    const lineHeight = quoteFontSize * 1.4;
    const quoteHeight = quoteLines.length * lineHeight;
    const authorHeight = authorText ? authorFontSize * 1.5 : 0;
    const totalHeight = quoteHeight + authorHeight;

    // Starting Y position (centered vertically)
    let startY = (height - totalHeight) / 2 + quoteFontSize;

    // Alignment
    const align = state.alignment;
    let textAlign = 'center';
    let startX = width / 2;
    if (align === 'left') { textAlign = 'left'; startX = padding; }
    if (align === 'right') { textAlign = 'right'; startX = width - padding; }

    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';

    // Draw quote text with effects
    quoteLines.forEach((line, i) => {
      const y = startY + i * lineHeight;
      drawTextWithEffects(ctx, line, startX, y, quoteFontSize, fontPair.quote, true);
    });

    // Draw author
    if (authorText) {
      ctx.font = `${authorFontSize}px ${fontPair.author}`;
      const authorY = startY + quoteHeight + authorFontSize * 0.5;
      drawTextWithEffects(ctx, authorText, startX, authorY, authorFontSize, fontPair.author, false);
    }
  }

  function drawTextWithEffects(ctx, text, x, y, fontSize, fontFamily, isQuote) {
    const textColor = getContrastColor(state.background === 'solid' ? state.bgColor :
      state.background === 'gradient' ? state.gradientColor1 :
      state.background === 'image' ? state.bgColor : state.bgColor);

    // Shadow
    if (state.effects.shadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    // Outline
    if (state.effects.outline) {
      ctx.save();
      ctx.strokeStyle = isQuote ? '#000000' : 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = Math.max(2, fontSize * 0.06);
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.strokeText(text, x, y);
      ctx.restore();
    }

    // Glow
    if (state.effects.glow) {
      ctx.save();
      ctx.shadowColor = textColor;
      ctx.shadowBlur = 20;
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

  function getContrastColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a2e' : '#f5f5f7';
  }

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  function downloadImage(format) {
    const canvas = els.posterCanvas;
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const extension = format === 'png' ? 'png' : 'jpg';

    const link = document.createElement('a');
    link.download = `quote-poster-${Date.now()}.${extension}`;
    link.href = canvas.toDataURL(mimeType, format === 'jpg' ? 0.95 : 1.0);
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
      showToast('Copy failed. Try downloading instead.');
      console.error('Copy failed:', e);
    }
  }

  function sharePoster() {
    const canvas = els.posterCanvas;
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'quote-poster.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'My Quote Poster' });
          showToast('Shared successfully!');
        } catch (e) {
          if (e.name !== 'AbortError') showToast('Share cancelled');
        }
      } else {
        // Fallback: copy image to clipboard
        await copyToClipboard();
        showToast('Share not available. Image copied to clipboard.');
      }
    }, 'image/png');
  }

  function generateShareUrl() {
    const data = {
      q: state.quoteText,
      a: state.quoteAuthor,
      f: state.fontPair,
      fq: state.customQuoteFont,
      fa: state.customAuthorFont,
      b: state.background,
      bc: state.bgColor,
      gt: state.gradientType,
      gc1: state.gradientColor1,
      gc2: state.gradientColor2,
      bo: state.bgOpacity,
      pt: state.patternType,
      s: state.size,
      cw: state.customWidth,
      ch: state.customHeight,
      al: state.alignment,
      sh: state.effects.shadow,
      ol: state.effects.outline,
      gl: state.effects.glow
    };
    return `${window.location.origin}${window.location.pathname}#${btoa(JSON.stringify(data))}`;
  }

  function loadFromUrl() {
    if (!window.location.hash) return;
    try {
      const data = JSON.parse(atob(window.location.hash.slice(1)));
      if (data.q) { state.quoteText = data.q; els.quoteText.value = data.q; }
      if (data.a) { state.quoteAuthor = data.a; els.quoteAuthor.value = data.a; }
      if (data.f) { setFontPair(data.f); }
      if (data.fq) { state.customQuoteFont = data.fq; els.quoteFontSelect.value = data.fq; }
      if (data.fa) { state.customAuthorFont = data.fa; els.authorFontSelect.value = data.fa; }
      if (data.b) { setBackground(data.b); }
      if (data.bc) { state.bgColor = data.bc; els.bgColor.value = data.bc; }
      if (data.gt) { state.gradientType = data.gt; els.gradientType.value = data.gt; }
      if (data.gc1) { state.gradientColor1 = data.gc1; els.gradientColor1.value = data.gc1; }
      if (data.gc2) { state.gradientColor2 = data.gc2; els.gradientColor2.value = data.gc2; }
      if (data.bo !== undefined) { state.bgOpacity = data.bo; els.bgOpacity.value = data.bo; }
      if (data.pt) { state.patternType = data.pt; els.patternType.value = data.pt; }
      if (data.s) { setSize(data.s); }
      if (data.cw) { state.customWidth = data.cw; els.customWidth.value = data.cw; }
      if (data.ch) { state.customHeight = data.ch; els.customHeight.value = data.ch; }
      if (data.al) { setAlignment(data.al); }
      if (data.sh !== undefined) { state.effects.shadow = data.sh; els.shadowToggle.checked = data.sh; }
      if (data.ol !== undefined) { state.effects.outline = data.ol; els.outlineToggle.checked = data.ol; }
      if (data.gl !== undefined) { state.effects.glow = data.gl; els.glowToggle.checked = data.gl; }
    } catch (e) {
      console.error('Failed to load from URL:', e);
    }
  }

  // ============================================
  // UI HANDLERS
  // ============================================

  function setSource(source) {
    state.source = source;
    setActiveTab(els.modeTabs, source);

    els.customOptions.hidden = source !== 'custom';
    els.dailyOptions.hidden = source !== 'daily';
    els.randomOptions.hidden = source !== 'random';
    els.libraryOptions.hidden = source !== 'library';

    if (source === 'daily') {
      loadDailyQuote();
    } else if (source === 'random') {
      generateRandomQuote();
    }
  }

  function loadDailyQuote() {
    const quote = getDailyQuote();
    state.quoteText = quote.text;
    state.quoteAuthor = quote.author;
    els.dailyQuoteDisplay.innerHTML = `
      <div class="quote-display">
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-author">— ${quote.author}</div>
      </div>
    `;
  }

  function generateRandomQuote() {
    const quote = getRandomQuote();
    state.quoteText = quote.text;
    state.quoteAuthor = quote.author;
    els.randomQuoteDisplay.innerHTML = `
      <div class="quote-display">
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-author">— ${quote.author}</div>
      </div>
    `;
  }

  function handleLibraryChange() {
    const category = els.quoteCategory.value;
    const quote = getQuoteFromLibrary(category);
    if (quote) {
      state.quoteText = quote.text;
      state.quoteAuthor = quote.author;
      // Show in custom options for editing
      setSource('custom');
      els.quoteText.value = quote.text;
      els.quoteAuthor.value = quote.author;
    }
  }

  function setFontPair(font) {
    state.fontPair = font;
    setActiveTab(els.fontTabs, font);
    els.customFontOptions.hidden = font !== 'custom';
  }

  function setBackground(bg) {
    state.background = bg;
    setActiveTab(els.bgTabs, bg);

    els.solidOptions.hidden = bg !== 'solid';
    els.gradientOptions.hidden = bg !== 'gradient';
    els.imageOptions.hidden = bg !== 'image';
    els.patternOptions.hidden = bg !== 'pattern';
  }

  function setSize(size) {
    state.size = size;
    setActiveTab(els.sizeTabs, size);
    els.customSizeOptions.hidden = size !== 'custom';
  }

  function setAlignment(align) {
    state.alignment = align;
    setActiveTab(els.alignTabs, align);
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
        state.bgImage = img;
        els.bgDropZone.classList.add('has-file');
        els.bgDropZone.innerHTML = `<p>${file.name}</p><p class="file-info">${img.width}×${img.height}px</p>`;
        showToast('Background image loaded');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function randomize() {
    // Random source
    const sources = ['custom', 'daily', 'random', 'library'];
    setSource(sources[Math.floor(Math.random() * sources.length)]);

    // Random font
    const fonts = Object.keys(FONT_PAIRS);
    setFontPair(fonts[Math.floor(Math.random() * fonts.length)]);

    // Random background
    const backgrounds = ['solid', 'gradient', 'pattern'];
    setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)]);

    // Random colors
    const hues = [0, 30, 60, 120, 180, 210, 270, 300, 330];
    const h1 = hues[Math.floor(Math.random() * hues.length)];
    const h2 = hues[Math.floor(Math.random() * hues.length)];
    state.bgColor = `hsl(${h1}, 70%, 20%)`;
    state.gradientColor1 = `hsl(${h1}, 80%, 55%)`;
    state.gradientColor2 = `hsl(${h2}, 80%, 55%)`;
    els.bgColor.value = state.bgColor;
    els.gradientColor1.value = state.gradientColor1;
    els.gradientColor2.value = state.gradientColor2;

    // Random size
    const sizes = Object.keys(SIZE_PRESETS);
    setSize(sizes[Math.floor(Math.random() * sizes.length)]);

    // Random alignment
    const alignments = ['center', 'left', 'right'];
    setAlignment(alignments[Math.floor(Math.random() * alignments.length)]);

    // Random effects
    state.effects.shadow = Math.random() > 0.3;
    state.effects.outline = Math.random() > 0.7;
    state.effects.glow = Math.random() > 0.7;
    els.shadowToggle.checked = state.effects.shadow;
    els.outlineToggle.checked = state.effects.outline;
    els.glowToggle.checked = state.effects.glow;

    showToast('Randomized!');
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  function initEventListeners() {
    // Source tabs
    els.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => setSource(tab.dataset.source));
    });

    // Font tabs
    els.fontTabs.forEach(tab => {
      tab.addEventListener('click', () => setFontPair(tab.dataset.font));
    });

    // Background tabs
    els.bgTabs.forEach(tab => {
      tab.addEventListener('click', () => setBackground(tab.dataset.bg));
    });

    // Size tabs
    els.sizeTabs.forEach(tab => {
      tab.addEventListener('click', () => setSize(tab.dataset.size));
    });

    // Alignment tabs
    els.alignTabs.forEach(tab => {
      tab.addEventListener('click', () => setAlignment(tab.dataset.align));
    });

    // Custom quote inputs
    els.quoteText.addEventListener('input', () => state.quoteText = els.quoteText.value);
    els.quoteAuthor.addEventListener('input', () => state.quoteAuthor = els.quoteAuthor.value);

    // Custom font selects
    els.quoteFontSelect.addEventListener('change', () => state.customQuoteFont = els.quoteFontSelect.value);
    els.authorFontSelect.addEventListener('change', () => state.customAuthorFont = els.authorFontSelect.value);

    // Color inputs
    els.bgColor.addEventListener('input', () => state.bgColor = els.bgColor.value);
    els.gradientType.addEventListener('change', () => state.gradientType = els.gradientType.value);
    els.gradientColor1.addEventListener('input', () => state.gradientColor1 = els.gradientColor1.value);
    els.gradientColor2.addEventListener('input', () => state.gradientColor2 = els.gradientColor2.value);
    els.bgOpacity.addEventListener('input', () => state.bgOpacity = parseFloat(els.bgOpacity.value));

    // Pattern
    els.patternType.addEventListener('change', () => state.patternType = els.patternType.value);

    // Custom size
    els.customWidth.addEventListener('input', () => state.customWidth = parseInt(els.customWidth.value) || 1080);
    els.customHeight.addEventListener('input', () => state.customHeight = parseInt(els.customHeight.value) || 1080);

    // Effects
    els.shadowToggle.addEventListener('change', () => state.effects.shadow = els.shadowToggle.checked);
    els.outlineToggle.addEventListener('change', () => state.effects.outline = els.outlineToggle.checked);
    els.glowToggle.addEventListener('change', () => state.effects.glow = els.glowToggle.checked);

    // Buttons
    els.generateBtn.addEventListener('click', renderPoster);
    els.randomizeBtn.addEventListener('click', randomize);
    els.downloadPngBtn.addEventListener('click', () => downloadImage('png'));
    els.downloadJpgBtn.addEventListener('click', () => downloadImage('jpg'));
    els.copyBtn.addEventListener('click', copyToClipboard);
    els.shareBtn.addEventListener('click', sharePoster);
    els.newPosterBtn.addEventListener('click', () => els.resultsModal.hidden = true);
    els.shareBtnModal.addEventListener('click', sharePoster);
    els.downloadBtnModal.addEventListener('click', () => downloadImage('png'));
    els.newPosterBtnModal.addEventListener('click', () => els.resultsModal.hidden = true);

    // Daily/Random/Library
    els.loadDailyBtn.addEventListener('click', loadDailyQuote);
    els.randomBtn.addEventListener('click', generateRandomQuote);
    els.quoteCategory.addEventListener('change', handleLibraryChange);

    // Image upload
    els.bgDropZone.addEventListener('click', () => els.bgImageUpload.click());
    els.bgImageUpload.addEventListener('change', (e) => {
      if (e.target.files[0]) handleImageUpload(e.target.files[0]);
    });

    // Drag and drop
    els.bgDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.bgDropZone.style.borderColor = 'var(--accent-4)';
    });
    els.bgDropZone.addEventListener('dragleave', () => {
      els.bgDropZone.style.borderColor = 'var(--border)';
    });
    els.bgDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      els.bgDropZone.style.borderColor = 'var(--border)';
      if (e.dataTransfer.files[0]) handleImageUpload(e.dataTransfer.files[0]);
    });

    // Theme
    els.uiTheme.addEventListener('change', () => saveTheme(els.uiTheme.value));

    // Load from URL
    window.addEventListener('hashchange', loadFromUrl);
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
    loadFromUrl();
    initEventListeners();
    initBubbles();

    // Set initial state
    setSource(state.source);
    setFontPair(state.fontPair);
    setBackground(state.background);
    setSize(state.size);
    setAlignment(state.alignment);

    // Load daily quote by default
    loadDailyQuote();

    // Check if we have a quote from URL or custom
    if (state.quoteText) {
      els.quoteText.value = state.quoteText;
    }
    if (state.quoteAuthor) {
      els.quoteAuthor.value = state.quoteAuthor;
    }

    console.log('Quote Poster Generator initialized');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();