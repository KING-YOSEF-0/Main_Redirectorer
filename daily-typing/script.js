const DailyTyping = (() => {
  // Quotes database - curated from literature, philosophy, tech
  const QUOTES = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Code is read much more often than it is written.", author: "Guido van Rossum" },
    { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
    { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
    { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
    { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
    { text: "Walking on water and developing software from a specification are easy if both are frozen.", author: "Edward V. Berard" },
    { text: "It's not a bug, it's an undocumented feature.", author: "Anonymous" },
    { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
    { text: "The best thing about a boolean is even if you are wrong, you are only off by a bit.", author: "Anonymous" },
    { text: "Code never lies, comments sometimes do.", author: "Ron Jeffries" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
    { text: "Software is a great combination between artistry and engineering.", author: "Bill Gates" },
    { text: "Debugging is twice as hard as writing the code in the first place.", author: "Brian Kernighan" },
    { text: "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.", author: "John Woods" },
    { text: "There are only two hard things in Computer Science: cache invalidation and naming things.", author: "Phil Karlton" },
    { text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie" },
    { text: "Good code is its own best documentation.", author: "Steve McConnell" },
    { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
    { text: "Simplicity is prerequisite for reliability.", author: "Edsger Dijkstra" },
    { text: "The most important property of a program is whether it accomplishes the intention of its user.", author: "C.A.R. Hoare" },
    { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
    { text: "In theory, theory and practice are the same. In practice, they're not.", author: "Yogi Berra" },
    { text: "Premature optimization is the root of all evil.", author: "Donald Knuth" },
    { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
    { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
    { text: "Technology is best when it brings people together.", author: "Matt Mullenweg" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates" },
    { text: "We are stuck with technology when what we really want is just stuff that works.", author: "Douglas Adams" },
    { text: "The internet is becoming the town square for the global village of tomorrow.", author: "Bill Gates" },
    { text: "Information is the resolution of uncertainty.", author: "Claude Shannon" },
    { text: "The purpose of computing is insight, not numbers.", author: "Richard Hamming" },
    { text: "Computer science is no more about computers than astronomy is about telescopes.", author: "Edsger Dijkstra" },
    { text: "A language that doesn't affect the way you think about programming is not worth knowing.", author: "Alan Perlis" },
    { text: "The most dangerous phrase in the language is: 'We've always done it this way.'", author: "Grace Hopper" },
    { text: "If you can't explain it simply, you don't understand it well enough.", author: "Albert Einstein" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.", author: "James Baldwin" },
    { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
    { text: "He who has a why to live can bear almost any how.", author: "Viktor Frankl" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "The unexamined life is not worth living.", author: "Socrates" },
    { text: "Man is not fully conditioned and determined but he determines himself whether he gives in to conditions or stands up to them.", author: "Viktor Frankl" }
  ];

  // Game state
  let currentQuote = '';
  let currentQuoteAuthor = '';
  let currentMode = 'daily';
  let testDuration = 30; // 0 = unlimited
  let startTime = 0;
  let timerInterval = null;
  let gameState = 'ready'; // ready, playing, done
  let typedChars = [];
  let wpmHistory = []; // { time, wpm }
  let errorMap = {}; // position -> count
  let options = {
    punctuation: true,
    numbers: true,
    caseSensitive: true
  };
  let dailySeed = '';

  // Stats from localStorage
  let stats = {
    streak: 0,
    bestStreak: 0,
    avgWpm: 0,
    bestWpm: 0,
    history: [],
    lastDailyDate: null
  };

  const elements = {};

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    loadStats();
    updateDailyQuoteInfo();
    updateStatsDisplay();
    renderHistory();
    newQuote();
  }

  function cacheElements() {
    // Input panel
    elements.modeRadios = document.querySelectorAll('input[name="mode"]');
    elements.customField = document.getElementById('custom-field');
    elements.customText = document.getElementById('custom-text');
    elements.optPunctuation = document.getElementById('opt-punctuation');
    elements.optNumbers = document.getElementById('opt-numbers');
    elements.optCase = document.getElementById('opt-case');
    elements.durationBtns = document.querySelectorAll('.duration-btn');
    elements.dailyQuoteInfo = document.getElementById('daily-quote-info');
    elements.btnStart = document.getElementById('btn-start');
    elements.btnReset = document.getElementById('btn-reset');
    elements.statStreak = document.getElementById('stat-streak');
    elements.statBestStreak = document.getElementById('stat-best-streak');
    elements.statAvgWpm = document.getElementById('stat-avg-wpm');
    elements.statBestWpm = document.getElementById('stat-best-wpm');

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

  function bindEvents() {
    // Mode change
    elements.modeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        currentMode = e.target.value;
        elements.customField.hidden = currentMode !== 'custom';
        elements.dailyQuoteInfo.hidden = currentMode !== 'daily';
        newQuote();
      });
    });

    // Options
    elements.optPunctuation.addEventListener('change', (e) => {
      options.punctuation = e.target.checked;
      if (currentMode === 'custom') newQuote();
    });
    elements.optNumbers.addEventListener('change', (e) => {
      options.numbers = e.target.checked;
      if (currentMode === 'custom') newQuote();
    });
    elements.optCase.addEventListener('change', (e) => {
      options.caseSensitive = e.target.checked;
      if (currentMode === 'custom') newQuote();
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

  function getDailySeed() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  function seededRandom(seed) {
    // Mulberry32 PRNG
    let t = seed;
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

  function newQuote() {
    if (currentMode === 'daily') {
      dailySeed = getDailySeed();
      const prng = seededRandom(hashString(dailySeed));
      const idx = Math.floor(prng() * QUOTES.length);
      const quote = QUOTES[idx];
      currentQuote = filterQuote(quote.text);
      currentQuoteAuthor = quote.author;
    } else if (currentMode === 'practice') {
      const idx = Math.floor(Math.random() * QUOTES.length);
      const quote = QUOTES[idx];
      currentQuote = filterQuote(quote.text);
      currentQuoteAuthor = quote.author;
    } else { // custom
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
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      elements.dailyQuoteInfo.innerHTML = `
        <strong>Today's Quote:</strong> "${currentQuote}"<br>
        <em>— ${currentQuoteAuthor}</em><br>
        <span style="color: var(--muted); font-size: 0.8rem;">${today.toLocaleDateString('en-US', options)} • Same for everyone worldwide</span>
      `;
      elements.dailyQuoteInfo.hidden = false;
    } else {
      elements.dailyQuoteInfo.hidden = true;
    }
  }

  function startTest() {
    if (gameState !== 'ready') return;
    if (!currentQuote || currentQuote === 'Type something to begin...') {
      showToast('Please enter some text first!');
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

    // Start timer
    timerInterval = setInterval(updateTimer, 100);
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
    elements.liveTime.textContent = formatTime(testDuration);
    elements.liveConsistency.textContent = '—';
    elements.progressFill.style.width = '0%';
    elements.progressPct.textContent = '0%';

    // Reset quote display
    renderQuoteDisplay();
  }

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

    updateQuoteDisplay(charIndex);
    updateLiveStats();
    updateProgress();

    // Check if test is complete
    if (charIndex >= currentQuote.length - 1) {
      finishTest();
    }
  }

  function handleBackspace() {
    if (gameState !== 'playing') return;
    const input = elements.quoteInput.value;
    if (input.length === 0) return;

    const charIndex = input.length; // The char that was just deleted
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
        span.classList.add(typedChars[i]?.correct ? 'correct' : 'incorrect');
      } else if (i === currentIndex) {
        span.classList.add('current');
      } else {
        span.classList.add('pending');
      }
    });
  }

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

  function updateLiveStats() {
    const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const typed = typedChars.filter(c => c !== null).length;
    const correct = typedChars.filter(c => c?.correct).length;
    const incorrect = typed - correct;

    const rawWpm = elapsed > 0 ? Math.round(typed / 5 / elapsed) : 0;
    const wpm = elapsed > 0 ? Math.round(correct / 5 / elapsed) : 0;
    const accuracy = typed > 0 ? Math.round((correct / typed) * 100) : 100;

    // Consistency: standard deviation of WPM over time
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

    // Update quote display to final state
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

    // Show results
    renderResults(wpm, rawWpm, accuracy, consistency, elapsed, correct, incorrect);
    renderErrorHeatmap();
    renderWpmChart();
    saveSession(wpm, rawWpm, accuracy, consistency, elapsed);
    updateStats(wpm, accuracy);
    renderHistory();
  }

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

  function renderErrorHeatmap() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:\'"()-_=+[]{}|\\/@#$%^&*~`<>'.split('');
    const keyRow = chars.slice(0, 16).map(c => `<div class="heatmap-cell empty">${c === ' ' ? '␣' : c}</div>`).join('');

    elements.errorHeatmap.innerHTML = `
      <div class="heatmap-key">${keyRow}</div>
      <div class="heatmap-key">${chars.slice(16, 32).map(c => `<div class="heatmap-cell empty">${c === ' ' ? '␣' : c}</div>`).join('')}</div>
      <div class="heatmap-key">${chars.slice(32, 48).map(c => `<div class="heatmap-cell empty">${c === ' ' ? '␣' : c}</div>`).join('')}</div>
      <div class="heatmap-key">${chars.slice(48).map(c => `<div class="heatmap-cell empty">${c === ' ' ? '␣' : c}</div>`).join('')}</div>
    `;

    // Now add error cells
    const container = elements.errorHeatmap;
    const allChars = chars;

    Object.entries(errorMap).forEach(([pos, count]) => {
      const char = currentQuote[pos];
      const charIndex = allChars.indexOf(char);
      if (charIndex >= 0) {
        const cells = container.querySelectorAll('.heatmap-cell');
        const cell = cells[charIndex];
        if (cell) {
          cell.classList.remove('empty');
          cell.classList.add(count > 2 ? 'incorrect' : 'correct');
          cell.title = `"${char}" - ${count} error${count > 1 ? 's' : ''}`;
        }
      }
    });
  }

  function renderWpmChart() {
    const canvas = elements.wpmChart;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 120 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 120;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Background
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    if (wpmHistory.length < 2) {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('Not enough data for chart', width / 2, height / 2);
      return;
    }

    // Find max WPM for scaling
    const maxWpm = Math.max(...wpmHistory.map(d => d.wpm), 1);

    // Draw line
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-3').trim();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
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

    // Fill area
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, accent + '40');
    gradient.addColorStop(1, accent + '00');
    ctx.fillStyle = gradient;
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'right';
    ctx.fillText(`${maxWpm} WPM`, padding - 5, padding + 10);
    ctx.fillText('0', padding - 5, height - padding + 4);
  }

  function saveSession(wpm, rawWpm, accuracy, consistency, elapsed) {
    const session = {
      date: new Date().toISOString(),
      mode: currentMode,
      duration: testDuration,
      quote: currentQuote.substring(0, 50) + (currentQuote.length > 50 ? '...' : ''),
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

    // Update average WPM
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
    stats.history.slice(0, 10).forEach(session => {
      const date = new Date(session.date);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const modeIcon = session.isDaily ? '📅' : session.mode === 'practice' ? '🎲' : '✏️';

      const wpmClass = session.wpm >= 60 ? 'success' : session.wpm >= 40 ? 'warning' : '';
      const accClass = session.accuracy >= 95 ? 'success' : session.accuracy >= 90 ? 'warning' : '';

      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="info">
          <span class="meta">${modeIcon} ${session.author} • ${dateStr} ${timeStr}</span>
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

  function shareResult() {
    const lastSession = stats.history[0];
    if (!lastSession) {
      showToast('Complete a test first!');
      return;
    }

    const shareText = `Daily Typing Quote ${lastSession.isDaily ? '📅' : '🎲'}
${lastSession.wpm} WPM • ${lastSession.rawWpm} Raw • ${lastSession.accuracy}% Acc • ${lastSession.consistency}% Consistency
"${lastSession.quote}" — ${lastSession.author}
${new Date(lastSession.date).toLocaleDateString()}
#DailyTypingQuote #KING_YOSEF_`;

    navigator.clipboard.writeText(shareText).then(() => {
      showToast('Result copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy. Try again.');
    });
  }

  function updateLiveTimeDisplay() {
    if (gameState === 'ready') {
      elements.liveTime.textContent = formatTime(testDuration);
    }
  }

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

  // Record WPM for chart every 500ms during test
  function recordWpm() {
    if (gameState !== 'playing') return;
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const correct = typedChars.filter(c => c?.correct).length;
    const wpm = elapsed > 0 ? Math.round(correct / 5 / elapsed) : 0;
    wpmHistory.push({ time: Date.now(), wpm });
  }
  setInterval(recordWpm, 500);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();