const DailyTyping = (() => {
  // ============================================================
  // QUOTES DATABASE - Categorized, 30+ curated quotes
  // ============================================================
  const QUOTES = [
    // Literature
    { text: "It was the best of times, it was the worst of times.", author: "Charles Dickens", category: "literature" },
    { text: "All happy families are alike; each unhappy family is unhappy in its own way.", author: "Leo Tolstoy", category: "literature" },
    { text: "Call me Ishmael.", author: "Herman Melville", category: "literature" },
    { text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", author: "Jane Austen", category: "literature" },
    { text: "Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice.", author: "Gabriel García Márquez", category: "literature" },
    { text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", author: "Albert Camus", category: "literature" },
    { text: "We accept the love we think we deserve.", author: "Stephen Chbosky", category: "literature" },
    { text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou", category: "literature" },

    // Philosophy
    { text: "The unexamined life is not worth living.", author: "Socrates", category: "philosophy" },
    { text: "He who has a why to live can bear almost any how.", author: "Viktor Frankl", category: "philosophy" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "philosophy" },
    { text: "Man is condemned to be free.", author: "Jean-Paul Sartre", category: "philosophy" },
    { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", category: "philosophy" },
    { text: "Life can only be understood backwards; but it must be lived forwards.", author: "Søren Kierkegaard", category: "philosophy" },
    { text: "He who fights with monsters should look to it that he himself does not become a monster.", author: "Friedrich Nietzsche", category: "philosophy" },
    { text: "The mind is everything. What you think you become.", author: "Buddha", category: "philosophy" },

    // Technology
    { text: "Code is read much more often than it is written.", author: "Guido van Rossum", category: "technology" },
    { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", category: "technology" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "technology" },
    { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson", category: "technology" },
    { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs", category: "technology" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "technology" },
    { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman", category: "technology" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck", category: "technology" },

    // Science
    { text: "Information is the resolution of uncertainty.", author: "Claude Shannon", category: "science" },
    { text: "The purpose of computing is insight, not numbers.", author: "Richard Hamming", category: "science" },
    { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke", category: "science" },
    { text: "Computer science is no more about computers than astronomy is about telescopes.", author: "Edsger Dijkstra", category: "science" },
    { text: "The most incomprehensible thing about the universe is that it is comprehensible.", author: "Albert Einstein", category: "science" },
    { text: "Science is what we understand well enough to explain to a computer. Art is everything else we do.", author: "Donald Knuth", category: "science" },
    { text: "In theory, theory and practice are the same. In practice, they are not.", author: "Yogi Berra", category: "science" },
    { text: "Premature optimization is the root of all evil.", author: "Donald Knuth", category: "science" },

    // Wisdom & Life
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "wisdom" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "wisdom" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "wisdom" },
    { text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.", author: "James Baldwin", category: "wisdom" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford", category: "wisdom" },
    { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson", category: "wisdom" },
    { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde", category: "wisdom" },
    { text: "If you can't explain it simply, you don't understand it well enough.", author: "Albert Einstein", category: "wisdom" },
  ];

  // ============================================================
  // STATE
  // ============================================================
  let currentQuote = '';
  let currentQuoteAuthor = '';
  let currentMode = 'daily';
  let currentCategory = 'all';
  let testDuration = 30;
  let startTime = 0;
  let timerInterval = null;
  let gameState = 'ready';
  let typedChars = [];
  let wpmHistory = [];
  let errorMap = {};
  let options = {
    punctuation: true,
    numbers: true,
    caseSensitive: true
  };
  let settings = {
    showErrors: true,
    sound: true,
    autoSave: true,
    fontSize: 18
  };
  let dailySeed = '';

  let stats = {
    streak: 0,
    bestStreak: 0,
    avgWpm: 0,
    bestWpm: 0,
    history: [],
    lastDailyDate: null
  };

  const elements = {};

  // ============================================================
  // MULBERRY32 SEEDED PRNG
  // ============================================================
  function mulberry32(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function getDailySeed() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // ============================================================
  // QUOTE FILTERING
  // ============================================================
  function filterQuote(text) {
    let result = text;
    if (!options.punctuation) {
      result = result.replace(/[^\w\s]/g, '');
    }
    if (!options.numbers) {
      result = result.replace(/\d/g, '');
    }
    return result;
  }

  function getQuotesByCategory(category) {
    if (category === 'all') return QUOTES;
    return QUOTES.filter(q => q.category === category);
  }

  // ============================================================
  // ELEMENT CACHING
  // ============================================================
  function cacheElements() {
    // Input panel
    elements.modeRadios = document.querySelectorAll('input[name="mode"]');
    elements.categoryFilter = document.getElementById('category-filter');
    elements.customField = document.getElementById('custom-field');
    elements.customText = document.getElementById('custom-text');
    elements.optPunctuation = document.getElementById('opt-punctuation');
    elements.optNumbers = document.getElementById('opt-numbers');
    elements.optCase = document.getElementById('opt-case');
    elements.durationBtns = document.querySelectorAll('.duration-btn');
    elements.fontSizeSlider = document.getElementById('font-size-slider');
    elements.fontSizeValue = document.getElementById('font-size-value');
    elements.dailyQuoteInfo = document.getElementById('daily-quote-info');
    elements.btnStart = document.getElementById('btn-start');
    elements.btnReset = document.getElementById('btn-reset');
    elements.statStreak = document.getElementById('stat-streak');
    elements.statBestStreak = document.getElementById('stat-best-streak');
    elements.statAvgWpm = document.getElementById('stat-avg-wpm');
    elements.statBestWpm = document.getElementById('stat-best-wpm');

    // Settings
    elements.settingShowErrors = document.getElementById('setting-show-errors');
    elements.settingSound = document.getElementById('setting-sound');
    elements.settingAutosave = document.getElementById('setting-autosave');

    // Test panel
    elements.liveWpm = document.getElementById('live-wpm');
    elements.liveRaw = document.getElementById('live-raw');
    elements.liveAcc = document.getElementById('live-acc');
    elements.liveTime = document.getElementById('live-time');
    elements.liveConsistency = document.getElementById('live-consistency');
    elements.quoteText = document.getElementById('quote-text');
    elements.quoteInput = document.getElementById('quote-input');
    elements.progressFill = document.getElementById('progress-fill');
    elements.progressPct = document.getElementById('progress-pct');
    elements.gameStatus = document.getElementById('game-status');
    elements.resultsPanel = document.getElementById('results-panel');
    elements.resultsSummary = document.getElementById('results-summary');
    elements.errorHeatmap = document.getElementById('error-heatmap');
    elements.wpmChart = document.getElementById('wpm-chart');
    elements.btnShare = document.getElementById('btn-share');
    elements.btnRetry = document.getElementById('btn-retry');
    elements.historyList = document.getElementById('history-list');
  }

  // ============================================================
  // EVENT BINDING
  // ============================================================
  function bindEvents() {
    // Mode change
    elements.modeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        currentMode = e.target.value;
        elements.customField.hidden = currentMode !== 'custom';
        elements.dailyQuoteInfo.hidden = currentMode !== 'daily';
        elements.categoryFilter.disabled = currentMode !== 'practice';
        newQuote();
      });
    });

    // Category filter
    elements.categoryFilter.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      if (currentMode === 'practice') newQuote();
    });

    // Options
    elements.optPunctuation.addEventListener('change', (e) => {
      options.punctuation = e.target.checked;
      if (currentMode !== 'daily') newQuote();
    });
    elements.optNumbers.addEventListener('change', (e) => {
      options.numbers = e.target.checked;
      if (currentMode !== 'daily') newQuote();
    });
    elements.optCase.addEventListener('change', (e) => {
      options.caseSensitive = e.target.checked;
      if (currentMode !== 'daily') newQuote();
    });

    // Duration buttons
    elements.durationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.durationBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        testDuration = parseInt(btn.dataset.time);
        updateLiveTimeDisplay();
      });
    });

    // Font size
    elements.fontSizeSlider.addEventListener('input', (e) => {
      settings.fontSize = parseInt(e.target.value);
      elements.fontSizeValue.textContent = `${settings.fontSize}px`;
      document.documentElement.style.setProperty('--quote-font-size', `${settings.fontSize}px`);
      applyFontSize();
    });

    // Settings
    elements.settingShowErrors.addEventListener('change', (e) => {
      settings.showErrors = e.target.checked;
      saveSettings();
    });
    elements.settingSound.addEventListener('change', (e) => {
      settings.sound = e.target.checked;
      saveSettings();
    });
    elements.settingAutosave.addEventListener('change', (e) => {
      settings.autoSave = e.target.checked;
      saveSettings();
    });

    // Custom text
    elements.customText.addEventListener('input', () => {
      if (currentMode === 'custom') newQuote();
    });

    // Game controls
    elements.btnStart.addEventListener('click', startTest);
    elements.btnReset.addEventListener('click', resetTest);
    elements.btnShare.addEventListener('click', shareResult);
    elements.btnRetry.addEventListener('click', () => {
      elements.resultsPanel.hidden = true;
      elements.btnStart.disabled = false;
      elements.btnReset.disabled = true;
      newQuote();
    });

    // Typing input
    elements.quoteInput.addEventListener('input', handleTyping);
    elements.quoteInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') handleBackspace();
    });

    // Prevent paste
    elements.quoteInput.addEventListener('paste', (e) => e.preventDefault());
  }

  // ============================================================
  // FONT SIZE APPLICATION
  // ============================================================
  function applyFontSize() {
    const size = `${settings.fontSize}px`;
    elements.quoteText.style.fontSize = size;
    elements.quoteInput.style.fontSize = size;
    elements.quoteText.style.lineHeight = '1.85';
    elements.quoteInput.style.lineHeight = '1.85';
  }

  // ============================================================
  // SOUND EFFECTS (Web Audio API)
  // ============================================================
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playSound(freq, type = 'sine', duration = 0.08, volume = 0.05) {
    if (!settings.sound) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playKeySound(correct) {
    if (correct) playSound(880, 'sine', 0.06, 0.03);
    else playSound(220, 'square', 0.1, 0.04);
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================
  function init() {
    cacheElements();
    bindEvents();
    loadStats();
    loadSettings();
    applyFontSize();
    updateDailyQuoteInfo();
    updateStatsDisplay();
    renderHistory();
    newQuote();
  }

  // ============================================================
  // QUOTE GENERATION
  // ============================================================
  function newQuote() {
    if (currentMode === 'daily') {
      dailySeed = getDailySeed();
      const prng = mulberry32(hashString(dailySeed));
      const allQuotes = QUOTES;
      const idx = Math.floor(prng() * allQuotes.length);
      const quote = allQuotes[idx];
      currentQuote = filterQuote(quote.text);
      currentQuoteAuthor = quote.author;
    } else if (currentMode === 'practice') {
      const filtered = getQuotesByCategory(currentCategory);
      const idx = Math.floor(Math.random() * filtered.length);
      const quote = filtered[idx];
      currentQuote = filterQuote(quote.text);
      currentQuoteAuthor = quote.author;
    } else {
      currentQuote = elements.customText.value.trim() || 'Type something to begin...';
      currentQuoteAuthor = 'Custom';
    }

    renderQuoteDisplay();
    updateDailyQuoteInfo();
  }

  function renderQuoteDisplay() {
    elements.quoteText.innerHTML = '';
    for (let i = 0; i < currentQuote.length; i++) {
      const span = document.createElement('span');
      span.className = 'char pending';
      span.textContent = currentQuote[i] === ' ' ? ' ' : currentQuote[i];
      span.dataset.index = i;
      elements.quoteText.appendChild(span);
    }
    typedChars = new Array(currentQuote.length).fill(null);
    errorMap = {};
    wpmHistory = [];
  }

  function updateDailyQuoteInfo() {
    if (currentMode === 'daily') {
      const today = new Date();
      const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      elements.dailyQuoteInfo.innerHTML = `
        <strong>Today's Quote</strong><br>
        <em>"${currentQuote}"</em><br>
        <span>— ${currentQuoteAuthor}</span><br>
        <span class="muted">${today.toLocaleDateString('en-US', dateOpts)} • Same for everyone worldwide</span>
      `;
      elements.dailyQuoteInfo.hidden = false;
    } else {
      elements.dailyQuoteInfo.hidden = true;
    }
  }

  // ============================================================
  // TEST CONTROL
  // ============================================================
  function startTest() {
    if (gameState !== 'ready') return;
    if (!currentQuote || currentQuote === 'Type something to begin...') {
      showToast('Please enter some text first!', 'error');
      return;
    }

    gameState = 'playing';
    startTime = Date.now();
    typedChars = new Array(currentQuote.length).fill(null);
    errorMap = {};
    wpmHistory = [];

    elements.quoteInput.disabled = false;
    elements.quoteInput.value = '';
    elements.quoteInput.focus();
    elements.btnStart.disabled = true;
    elements.btnReset.disabled = false;
    elements.gameStatus.textContent = 'Typing...';
    elements.gameStatus.className = 'game-status playing';

    timerInterval = setInterval(updateTimer, 50);
    updateTimer();
  }

  function resetTest() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    gameState = 'ready';
    typedChars = [];
    wpmHistory = [];
    errorMap = {};

    elements.quoteInput.disabled = true;
    elements.quoteInput.value = '';
    elements.btnStart.disabled = false;
    elements.btnReset.disabled = true;
    elements.gameStatus.textContent = 'Click "Start Test" to begin';
    elements.gameStatus.className = 'game-status';
    elements.resultsPanel.hidden = true;

    // Reset live stats
    elements.liveWpm.textContent = '0';
    elements.liveRaw.textContent = '0';
    elements.liveAcc.textContent = '100%';
    elements.liveAcc.className = 'live-value success';
    elements.liveTime.textContent = formatTime(testDuration);
    elements.liveConsistency.textContent = '—';
    elements.progressFill.style.width = '0%';
    elements.progressPct.textContent = '0%';

    renderQuoteDisplay();
  }

  // ============================================================
  // TYPING HANDLING
  // ============================================================
  function handleTyping(e) {
    if (gameState !== 'playing') return;

    const input = e.target.value;
    const charIndex = input.length - 1;

    if (charIndex < 0) return;

    const expectedChar = currentQuote[charIndex];
    const typedChar = input[charIndex];
    const isCorrect = options.caseSensitive
      ? typedChar === expectedChar
      : typedChar.toLowerCase() === expectedChar.toLowerCase();

    typedChars[charIndex] = { char: typedChar, correct: isCorrect };

    if (!isCorrect) {
      errorMap[charIndex] = (errorMap[charIndex] || 0) + 1;
    }

    playKeySound(isCorrect);
    updateQuoteDisplay(charIndex);
    updateLiveStats();
    updateProgress();

    if (charIndex >= currentQuote.length - 1) {
      finishTest();
    }
  }

  function handleBackspace() {
    if (gameState !== 'playing') return;
    const input = elements.quoteInput.value;
    if (input.length === 0) return;

    const charIndex = input.length;
    typedChars[charIndex] = null;
    updateQuoteDisplay(charIndex - 1);
    updateLiveStats();
    updateProgress();
  }

  function updateQuoteDisplay(currentIndex) {
    const spans = elements.quoteText.querySelectorAll('.char');
    spans.forEach((span, i) => {
      span.className = 'char';
      if (i < currentIndex) {
        if (settings.showErrors) {
          span.classList.add(typedChars[i]?.correct ? 'correct' : 'incorrect');
        } else {
          span.classList.add('correct');
        }
      } else if (i === currentIndex) {
        span.classList.add('current');
      } else {
        span.classList.add('pending');
      }
    });
  }

  // ============================================================
  // TIMER & STATS
  // ============================================================
  function updateTimer() {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = testDuration > 0 ? Math.max(0, testDuration - elapsed) : elapsed;
    elements.liveTime.textContent = formatTime(remaining);

    if (testDuration > 0 && elapsed >= testDuration) {
      finishTest();
    }
  }

  function formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function updateLiveTimeDisplay() {
    if (gameState === 'ready') {
      elements.liveTime.textContent = formatTime(testDuration);
    }
  }

  function updateLiveStats() {
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const typed = typedChars.filter(c => c !== null).length;
    const correct = typedChars.filter(c => c?.correct).length;
    const incorrect = typed - correct;

    const rawWpm = elapsed > 0 ? Math.round(typed / 5 / elapsed) : 0;
    const wpm = elapsed > 0 ? Math.round(correct / 5 / elapsed) : 0;
    const accuracy = typed > 0 ? Math.round((correct / typed) * 100) : 100;

    // Consistency
    let consistency = '—';
    if (wpmHistory.length > 3) {
      const mean = wpmHistory.reduce((a, b) => a + b.wpm, 0) / wpmHistory.length;
      const variance = wpmHistory.reduce((a, b) => a + Math.pow(b.wpm - mean, 2), 0) / wpmHistory.length;
      const stdDev = Math.sqrt(variance);
      consistency = `${Math.round((1 - Math.min(stdDev / Math.max(mean, 1), 1)) * 100)}%`;
    }

    elements.liveWpm.textContent = wpm;
    elements.liveRaw.textContent = rawWpm;
    elements.liveAcc.textContent = `${accuracy}%`;
    elements.liveAcc.className = 'live-value';
    if (accuracy < 90) elements.liveAcc.classList.add('danger');
    else if (accuracy < 95) elements.liveAcc.classList.add('warning');
    else elements.liveAcc.classList.add('success');
    elements.liveConsistency.textContent = consistency;
  }

  function updateProgress() {
    const typed = typedChars.filter(c => c !== null).length;
    const pct = currentQuote.length > 0 ? Math.round((typed / currentQuote.length) * 100) : 0;
    elements.progressFill.style.width = `${pct}%`;
    elements.progressPct.textContent = `${pct}%`;
  }

  // ============================================================
  // FINISH TEST
  // ============================================================
  function finishTest() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    gameState = 'done';

    const elapsed = (Date.now() - startTime) / 1000;
    const elapsedMinutes = elapsed / 60;
    const typed = typedChars.filter(c => c !== null).length;
    const correct = typedChars.filter(c => c?.correct).length;
    const incorrect = typed - correct;
    const wpm = elapsedMinutes > 0 ? Math.round(correct / 5 / elapsedMinutes) : 0;
    const rawWpm = elapsedMinutes > 0 ? Math.round(typed / 5 / elapsedMinutes) : 0;
    const accuracy = typed > 0 ? Math.round((correct / typed) * 100) : 100;

    // Consistency
    let consistency = 0;
    if (wpmHistory.length > 3) {
      const mean = wpmHistory.reduce((a, b) => a + b.wpm, 0) / wpmHistory.length;
      const variance = wpmHistory.reduce((a, b) => a + Math.pow(b.wpm - mean, 2), 0) / wpmHistory.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.round((1 - Math.min(stdDev / Math.max(mean, 1), 1)) * 100);
    }

    // Final quote display
    const spans = elements.quoteText.querySelectorAll('.char');
    spans.forEach((span, i) => {
      span.className = 'char';
      if (typedChars[i]) {
        span.classList.add(typedChars[i].correct ? 'correct' : 'incorrect');
      } else {
        span.classList.add('pending');
      }
    });

    elements.quoteInput.disabled = true;
    elements.gameStatus.textContent = 'Test Complete!';
    elements.gameStatus.className = 'game-status done';
    elements.resultsPanel.hidden = false;
    elements.btnRetry.focus();

    renderResults(wpm, rawWpm, accuracy, consistency, elapsed, correct, incorrect);
    renderErrorHeatmap();
    renderWpmChart();
    if (settings.autoSave) saveSession(wpm, rawWpm, accuracy, consistency, elapsed);
    updateStats(wpm, accuracy);
    renderHistory();
  }

  // ============================================================
  // RESULTS RENDERING
  // ============================================================
  function renderResults(wpm, rawWpm, accuracy, consistency, elapsed, correct, incorrect) {
    const wpmClass = wpm >= 60 ? 'success' : wpm >= 40 ? 'warning' : 'danger';
    const accClass = accuracy >= 95 ? 'success' : accuracy >= 90 ? 'warning' : 'danger';
    const consClass = consistency >= 80 ? 'success' : consistency >= 60 ? 'warning' : 'danger';

    elements.resultsSummary.innerHTML = `
      <div class="summary-card">
        <div class="label">WPM</div>
        <div class="value ${wpmClass}">${wpm}</div>
      </div>
      <div class="summary-card">
        <div class="label">Raw WPM</div>
        <div class="value">${rawWpm}</div>
      </div>
      <div class="summary-card">
        <div class="label">Accuracy</div>
        <div class="value ${accClass}">${accuracy}%</div>
      </div>
      <div class="summary-card">
        <div class="label">Consistency</div>
        <div class="value ${consClass}">${consistency}%</div>
      </div>
      <div class="summary-card">
        <div class="label">Time</div>
        <div class="value">${formatTime(elapsed)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Correct / Total</div>
        <div class="value">${correct} / ${correct + incorrect}</div>
      </div>
    `;
  }

  // ============================================================
  // ERROR HEATMAP
  // ============================================================
  function renderErrorHeatmap() {
    const allChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:\'"()-_=+[]{}|\\/@#$%^&*~`<> '.split('');

    let html = '';
    for (let row = 0; row < 4; row++) {
      html += '<div class="heatmap-row">';
      for (let col = 0; col < 16; col++) {
        const idx = row * 16 + col;
        const char = allChars[idx] || '';
        const displayChar = char === ' ' ? '␣' : char;
        html += `<div class="heatmap-cell empty" title="No errors">${displayChar}</div>`;
      }
      html += '</div>';
    }

    elements.errorHeatmap.innerHTML = html;

    // Apply error data
    Object.entries(errorMap).forEach(([pos, count]) => {
      const char = currentQuote[pos];
      const charIndex = allChars.indexOf(char);
      if (charIndex >= 0) {
        const row = Math.floor(charIndex / 16);
        const col = charIndex % 16;
        const rows = elements.errorHeatmap.querySelectorAll('.heatmap-row');
        if (rows[row]) {
          const cell = rows[row].children[col];
          if (cell) {
            cell.classList.remove('empty');
            if (count >= 5) cell.classList.add('critical');
            else if (count >= 3) cell.classList.add('high');
            else if (count >= 2) cell.classList.add('med');
            else cell.classList.add('low');
            cell.title = `"${char}" - ${count} error${count > 1 ? 's' : ''}`;
          }
        }
      }
    });
  }

  // ============================================================
  // WPM CHART (Canvas)
  // ============================================================
  function renderWpmChart() {
    const canvas = elements.wpmChart;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 140 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 140;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Background
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--paper-dark').trim();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Grid
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
    ctx.strokeStyle = borderColor + '33';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const x = padding + (chartWidth / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    if (wpmHistory.length < 2) {
      const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
      ctx.fillStyle = mutedColor;
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('Not enough data for chart', width / 2, height / 2);
      return;
    }

    // Find max WPM
    const maxWpm = Math.max(...wpmHistory.map(d => d.wpm), 10);

    // Draw area fill
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-sage').trim();
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, accentColor + '40');
    gradient.addColorStop(1, accentColor + '00');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    wpmHistory.forEach((point, i) => {
      const x = padding + (i / (wpmHistory.length - 1)) * chartWidth;
      const y = padding + chartHeight - (point.wpm / maxWpm) * chartHeight;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width - padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    wpmHistory.forEach((point, i) => {
      const x = padding + (i / (wpmHistory.length - 1)) * chartWidth;
      const y = padding + chartHeight - (point.wpm / maxWpm) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = accentColor;
    wpmHistory.forEach((point, i) => {
      const x = padding + (i / (wpmHistory.length - 1)) * chartWidth;
      const y = padding + chartHeight - (point.wpm / maxWpm) * chartHeight;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
    ctx.fillStyle = mutedColor;
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'right';
    ctx.fillText(`${maxWpm} WPM`, padding - 5, padding + 10);
    ctx.fillText('0', padding - 5, height - padding + 4);
    ctx.textAlign = 'center';
    ctx.fillText('Time →', width / 2, height - 5);
  }

  // ============================================================
  // SESSION STORAGE
  // ============================================================
  function saveSession(wpm, rawWpm, accuracy, consistency, elapsed) {
    const session = {
      date: new Date().toISOString(),
      mode: currentMode,
      category: currentCategory,
      duration: testDuration,
      quote: currentQuote.substring(0, 60) + (currentQuote.length > 60 ? '...' : ''),
      author: currentQuoteAuthor,
      wpm,
      rawWpm,
      accuracy,
      consistency,
      elapsed: Math.round(elapsed),
      isDaily: currentMode === 'daily'
    };

    stats.history.unshift(session);
    if (stats.history.length > 50) stats.history.pop();
    saveStats();
  }

  function updateStats(wpm, accuracy) {
    if (currentMode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      if (stats.lastDailyDate !== today) {
        stats.lastDailyDate = today;
        stats.streak++;
        if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
      }
    }

    const completedSessions = stats.history.filter(s => s.wpm > 0);
    if (completedSessions.length > 0) {
      stats.avgWpm = Math.round(completedSessions.reduce((a, b) => a + b.wpm, 0) / completedSessions.length);
    }
    if (wpm > stats.bestWpm) stats.bestWpm = wpm;

    saveStats();
    updateStatsDisplay();
  }

  function updateStatsDisplay() {
    elements.statStreak.textContent = stats.streak;
    elements.statBestStreak.textContent = stats.bestStreak;
    elements.statAvgWpm.textContent = stats.avgWpm;
    elements.statBestWpm.textContent = stats.bestWpm;
  }

  function renderHistory() {
    elements.historyList.innerHTML = '';
    stats.history.slice(0, 15).forEach(session => {
      const date = new Date(session.date);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const modeIcon = session.isDaily ? '📅' : session.mode === 'practice' ? '🎲' : '✏️';
      const modeClass = session.isDaily ? 'daily' : session.mode === 'practice' ? 'practice' : 'custom';

      const wpmClass = session.wpm >= 60 ? 'success' : session.wpm >= 40 ? 'warning' : '';
      const accClass = session.accuracy >= 95 ? 'success' : session.accuracy >= 90 ? 'warning' : '';

      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="info">
          <span class="meta"><span class="mode-badge ${modeClass}">${modeIcon} ${session.mode.charAt(0).toUpperCase() + session.mode.slice(1)}</span> ${session.author} • ${dateStr} ${timeStr}</span>
          <span class="quote-preview">"${session.quote}"</span>
        </div>
        <div class="stats">
          <span class="wpm ${wpmClass}">${session.wpm} WPM</span>
          <span class="acc ${accClass}">${session.accuracy}% acc</span>
          <span class="time">${session.elapsed}s</span>
        </div>
      `;
      elements.historyList.appendChild(item);
    });
  }

  // ============================================================
  // SHARE RESULT
  // ============================================================
  function shareResult() {
    const lastSession = stats.history[0];
    if (!lastSession) {
      showToast('Complete a test first!', 'error');
      return;
    }

    const shareText = `Daily Typing Quote ${lastSession.isDaily ? '📅' : lastSession.mode === 'practice' ? '🎲' : '✏️'}
${lastSession.wpm} WPM • ${lastSession.rawWpm} Raw • ${lastSession.accuracy}% Acc • ${lastSession.consistency}% Consistency
"${lastSession.quote}" — ${lastSession.author}
${new Date(lastSession.date).toLocaleDateString()}
#DailyTypingQuote #KING_YOSEF_`;

    navigator.clipboard.writeText(shareText).then(() => {
      showToast('Result copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy. Try again.', 'error');
    });
  }

  // ============================================================
  // LOCALSTORAGE
  // ============================================================
  function loadStats() {
    try {
      const saved = localStorage.getItem('daily-typing-stats');
      if (saved) {
        stats = { ...stats, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load typing stats');
    }
  }

  function saveStats() {
    try {
      localStorage.setItem('daily-typing-stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save typing stats');
    }
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem('daily-typing-settings');
      if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
        // Apply to UI
        elements.settingShowErrors.checked = settings.showErrors;
        elements.settingSound.checked = settings.sound;
        elements.settingAutosave.checked = settings.autoSave;
        elements.fontSizeSlider.value = settings.fontSize;
        elements.fontSizeValue.textContent = `${settings.fontSize}px`;
      }
    } catch (e) {
      console.warn('Failed to load settings');
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem('daily-typing-settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings');
    }
  }

  // ============================================================
  // TOAST
  // ============================================================
  function showToast(message, type = 'info') {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // ============================================================
  // WPM RECORDING (for chart)
  // ============================================================
  function recordWpm() {
    if (gameState !== 'playing') return;
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const correct = typedChars.filter(c => c?.correct).length;
    const wpm = elapsed > 0 ? Math.round(correct / 5 / elapsed) : 0;
    wpmHistory.push({ time: Date.now(), wpm });
  }
  setInterval(recordWpm, 500);

  // ============================================================
  // AUDIO CONTEXT RESUME (for user gesture)
  // ============================================================
  document.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }, { once: true });

  // ============================================================
  // START
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();