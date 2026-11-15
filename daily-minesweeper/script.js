/* ==========================================================================
   DAILY MINEFIELD — TACTICAL MINEFIELD OPERATIONS
   ========================================================================== */

const MinefieldOps = (() => {
  // ============================================================
  // GAME STATE
  // ============================================================
  let board = [];
  let width = 9;
  let height = 9;
  let mineCount = 10;
  let revealedCount = 0;
  let flaggedCount = 0;
  let gameState = 'ready'; // ready, playing, won, lost
  let startTime = 0;
  let timerInterval = null;
  let isDailyMode = true;
  let currentDifficulty = 'beginner';
  let dailySeed = '';
  let prng = Math.random;
  let currentTheme = 'classic';

  // Difficulty presets
  const DIFFICULTIES = {
    beginner: { width: 9, height: 9, mines: 10 },
    intermediate: { width: 16, height: 16, mines: 40 },
    expert: { width: 30, height: 16, mines: 99 }
  };

  // Persistent stats
  let stats = {
    streak: 0,
    bestStreak: 0,
    wins: 0,
    games: 0,
    dailyWins: [],
    leaderboards: {
      beginner: [],
      intermediate: [],
      expert: [],
      daily: []
    }
  };

  // DOM Elements
  const el = {};

  // ============================================================
  // INITIALIZATION
  // ============================================================
  function init() {
    cacheElements();
    bindEvents();
    loadStats();
    applyTheme(currentTheme);
    updateSystemTime();
    setInterval(updateSystemTime, 1000);
    updateMissionDate();
    newMission();
    renderField();
    updateIntel();
    renderLeaderboard();
  }

  function cacheElements() {
    // Config
    el.diffSelect = document.getElementById('difficulty-select');
    el.customFields = document.getElementById('custom-fields');
    el.customWidth = document.getElementById('custom-width');
    el.customHeight = document.getElementById('custom-height');
    el.customMines = document.getElementById('custom-mines');
    el.modeRadios = document.querySelectorAll('input[name="mode"]');
    el.missionDate = document.getElementById('mission-date');
    el.modeHint = document.getElementById('mode-hint');
    el.themeSelect = document.getElementById('theme-select');
    el.themeIndicator = document.getElementById('theme-indicator');
    el.btnNewMission = document.getElementById('btn-new-mission');
    el.btnAbort = document.getElementById('btn-abort');

    // HUD
    el.hudMines = document.getElementById('hud-mines');
    el.hudTime = document.getElementById('hud-time');
    el.commandBtn = document.getElementById('command-btn');
    el.cmdFace = document.getElementById('cmd-face');
    el.minefield = document.getElementById('minefield');
    el.statusDisplay = document.getElementById('status-display');
    el.statusText = document.querySelector('.status-text');

    // Leaderboard
    el.lbTabs = document.querySelectorAll('.lb-tab');
    el.leaderboard = document.getElementById('leaderboard');

    // Transmission
    el.btnTransmit = document.getElementById('btn-transmit');
    el.transmissionLog = document.getElementById('transmission-log');

    // Intel
    el.intelStreak = document.getElementById('intel-streak');
    el.intelBestStreak = document.getElementById('intel-best-streak');
    el.intelWins = document.getElementById('intel-wins');
    el.intelWinrate = document.getElementById('intel-winrate');

    // System
    el.sysTime = document.getElementById('sys-time');
  }

  function bindEvents() {
    // Difficulty select
    el.diffSelect.addEventListener('change', () => {
      currentDifficulty = el.diffSelect.value;
      el.customFields.hidden = currentDifficulty !== 'custom';
      if (currentDifficulty !== 'custom') applyDifficulty(currentDifficulty);
      newMission();
    });

    // Custom fields
    [el.customWidth, el.customHeight, el.customMines].forEach(input => {
      input.addEventListener('change', () => {
        if (currentDifficulty === 'custom') newMission();
      });
    });

    // Mode radios
    el.modeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        isDailyMode = radio.value === 'daily';
        updateModeHint();
        newMission();
      });
    });

    // Theme select
    el.themeSelect.addEventListener('change', () => {
      currentTheme = el.themeSelect.value;
      applyTheme(currentTheme);
    });

    // Game controls
    el.btnNewMission.addEventListener('click', newMission);
    el.btnAbort.addEventListener('click', abortMission);
    el.commandBtn.addEventListener('click', newMission);

    // Leaderboard tabs
    el.lbTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        el.lbTabs.forEach(t => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab);
        });
        renderLeaderboard(tab.dataset.lb);
      });
    });

    // Transmit
    el.btnTransmit.addEventListener('click', transmitReport);

    // Field events (delegated)
    el.minefield.addEventListener('click', e => handleCellClick(e));
    el.minefield.addEventListener('contextmenu', e => handleRightClick(e));

    // Touch events for mobile flagging
    let touchStartTime = 0;
    let touchCell = null;
    let touchMoved = false;

    el.minefield.addEventListener('touchstart', e => {
      touchStartTime = Date.now();
      touchMoved = false;
      const cell = e.target.closest('.minefield-cell');
      if (cell) {
        touchCell = cell;
        cell.classList.add('touch-active');
      }
    }, { passive: true });

    el.minefield.addEventListener('touchmove', () => {
      touchMoved = true;
      if (touchCell) touchCell.classList.remove('touch-active');
      touchCell = null;
    }, { passive: true });

    el.minefield.addEventListener('touchend', e => {
      if (touchCell && !touchMoved) {
        touchCell.classList.remove('touch-active');
        const duration = Date.now() - touchStartTime;
        if (duration > 500) {
          // Long press = flag
          handleRightClick({ target: touchCell, preventDefault: () => {} });
        } else {
          // Tap = reveal
          handleCellClick({ target: touchCell, preventDefault: () => {} });
        }
      }
      touchCell = null;
    });

    // Prevent context menu on cells
    el.minefield.addEventListener('contextmenu', e => {
      if (e.target.classList.contains('minefield-cell')) e.preventDefault();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      switch (e.key.toLowerCase()) {
        case 'r':
        case 'n':
          e.preventDefault(); newMission(); break;
        case 't':
          e.preventDefault(); transmitReport(); break;
        case 'escape':
          e.preventDefault(); abortMission(); break;
        case ' ':
          if (gameState === 'playing') {
            e.preventDefault(); handleChord(e);
          }
          break;
      }
    });
  }

  // ============================================================
  // THEME SYSTEM (Task 9)
  // ============================================================
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    const labels = { classic: 'CLASSIC', dark: 'STEALTH', retro: 'RETRO', 'high-contrast': 'HI-VIS' };
    el.themeIndicator.textContent = labels[theme] || 'CLASSIC';
    el.themeSelect.value = theme;
  }

  // ============================================================
  // TIME & DATE
  // ============================================================
  function updateSystemTime() {
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const timeStr = utc.toTimeString().slice(0, 8);
    el.sysTime.textContent = `${timeStr} ZULU`;
  }

  function updateMissionDate() {
    const today = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const dateStr = today.toLocaleDateString('en-US', options).toUpperCase();
    el.missionDate.textContent = dateStr;
  }

  // ============================================================
  // DIFFICULTY & MODE
  // ============================================================
  function applyDifficulty(diff) {
    const d = DIFFICULTIES[diff];
    width = d.width;
    height = d.height;
    mineCount = d.mines;
  }

  function updateModeHint() {
    el.modeHint.textContent = isDailyMode
      ? 'IDENTICAL BOARD FOR ALL OPERATORS'
      : 'RANDOMIZED BOARD EACH DEPLOYMENT';
  }

  // ============================================================
  // PRNG — MULBERRY32 (Task 2)
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
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    return `minefield-op-${dateStr}`;
  }

  // ============================================================
  // MISSION LIFECYCLE
  // ============================================================
  function newMission() {
    // Stop timer
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

    // Set dimensions
    if (currentDifficulty === 'custom') {
      width = Math.max(5, Math.min(50, parseInt(el.customWidth.value) || 16));
      height = Math.max(5, Math.min(30, parseInt(el.customHeight.value) || 16));
      mineCount = Math.max(1, Math.min(500, Math.min(parseInt(el.customMines.value) || 40, width * height - 1)));
    } else {
      applyDifficulty(currentDifficulty);
    }

    // Set PRNG
    if (isDailyMode) {
      dailySeed = getDailySeed();
      prng = mulberry32(hashString(dailySeed));
    } else {
      prng = Math.random;
    }

    // Reset state
    board = [];
    revealedCount = 0;
    flaggedCount = 0;
    gameState = 'ready';
    startTime = 0;

    // HUD reset
    el.hudTime.textContent = '000';
    el.hudMines.textContent = String(mineCount).padStart(3, '0');
    el.cmdFace.textContent = '◆';
    el.commandBtn.className = 'command-btn';
    el.statusText.textContent = isDailyMode ? 'DAILY OP — AWAITING DEPLOYMENT' : 'FREE PLAY — AWAITING DEPLOYMENT';
    el.statusDisplay.className = 'status-display';

    // Create empty board
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push({ x, y, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 });
      }
      board.push(row);
    }

    renderField();
    updateMissionDate();
  }

  function abortMission() {
    if (gameState === 'playing') {
      gameOver(false, true);
    }
  }

  function placeMines(firstX, firstY) {
    const positions = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Safe zone: first click + neighbors
        if (Math.abs(x - firstX) <= 1 && Math.abs(y - firstY) <= 1) continue;
        positions.push({ x, y });
      }
    }

    // Fisher-Yates shuffle with seeded PRNG
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    const mines = positions.slice(0, mineCount);
    mines.forEach(pos => { board[pos.y][pos.x].isMine = true; });

    // Calculate neighbor counts
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (board[y][x].isMine) continue;
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && board[ny][nx].isMine) count++;
          }
        }
        board[y][x].neighborMines = count;
      }
    }
  }

  // ============================================================
  // RENDERING
  // ============================================================
  function renderField() {
    el.minefield.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;
    el.minefield.innerHTML = '';

    const fragment = document.createDocumentFragment();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = board[y][x];
        const cellEl = document.createElement('div');
        cellEl.className = 'minefield-cell';
        cellEl.dataset.x = x;
        cellEl.dataset.y = y;

        if (cell.isRevealed) {
          cellEl.classList.add('revealed');
          if (cell.isMine) {
            cellEl.classList.add('mine');
            cellEl.textContent = '◆';
          } else if (cell.neighborMines > 0) {
            cellEl.dataset.num = cell.neighborMines;
            cellEl.textContent = cell.neighborMines;
          }
        } else if (cell.isFlagged) {
          cellEl.classList.add('flagged');
          cellEl.textContent = '▲';
        }

        fragment.appendChild(cellEl);
      }
    }

    el.minefield.appendChild(fragment);
  }

  // ============================================================
  // INPUT HANDLING
  // ============================================================
  function handleCellClick(e) {
    if (gameState !== 'playing' && gameState !== 'ready') return;

    const cellEl = e.target.closest('.minefield-cell');
    if (!cellEl) return;

    const x = parseInt(cellEl.dataset.x);
    const y = parseInt(cellEl.dataset.y);
    const cell = board[y][x];

    if (cell.isFlagged || cell.isRevealed) return;

    // First click — place mines
    if (gameState === 'ready') {
      placeMines(x, y);
      gameState = 'playing';
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);
      el.cmdFace.textContent = '◈';
      el.commandBtn.className = 'command-btn playing';
      el.statusText.textContent = 'SCANNING SECTOR...';
      el.statusDisplay.className = 'status-display playing';
    }

    revealCell(x, y);
    checkVictory();
    renderField();
  }

  function handleRightClick(e) {
    e.preventDefault();
    if (gameState !== 'playing') return;

    const cellEl = e.target.closest('.minefield-cell');
    if (!cellEl) return;

    const x = parseInt(cellEl.dataset.x);
    const y = parseInt(cellEl.dataset.y);
    const cell = board[y][x];

    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    flaggedCount += cell.isFlagged ? 1 : -1;
    el.hudMines.textContent = String(mineCount - flaggedCount).padStart(3, '0');
    renderField();
  }

  function handleChord(e) {
    // Chord clear: reveal all neighbors if flagged count matches number
    const cellEl = document.querySelector('.minefield-cell:hover');
    if (!cellEl) return;

    const x = parseInt(cellEl.dataset.x);
    const y = parseInt(cellEl.dataset.y);
    const cell = board[y][x];

    if (!cell.isRevealed || cell.neighborMines === 0) return;

    // Count flags around
    let flagCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && board[ny][nx].isFlagged) flagCount++;
      }
    }

    if (flagCount === cell.neighborMines) {
      // Reveal all unflagged neighbors
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height && !board[ny][nx].isFlagged) {
            revealCell(nx, ny);
          }
        }
      }
      checkVictory();
      renderField();
    }
  }

  function revealCell(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const cell = board[y][x];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    revealedCount++;

    if (cell.isMine) {
      gameOver(false);
      return;
    }

    if (cell.neighborMines === 0) {
      // Flood fill
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          revealCell(x + dx, y + dy);
        }
      }
    }
  }

  function checkVictory() {
    if (revealedCount === width * height - mineCount) {
      gameOver(true);
    }
  }

  function gameOver(won, aborted = false) {
    gameState = won ? 'won' : 'lost';

    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    if (won) {
      el.cmdFace.textContent = '✦';
      el.commandBtn.className = 'command-btn win';
      el.statusText.textContent = `SECTOR CLEARED — ${elapsed}s`;
      el.statusDisplay.className = 'status-display win';

      // Auto-flag all mines
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (board[y][x].isMine && !board[y][x].isFlagged) board[y][x].isFlagged = true;
        }
      }
      flaggedCount = mineCount;
      el.hudMines.textContent = '000';

      // Update stats
      stats.games++;
      stats.wins++;

      if (isDailyMode) {
        const today = new Date().toISOString().split('T')[0];
        if (!stats.dailyWins.includes(today)) {
          stats.dailyWins.push(today);
          stats.streak++;
          if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
        }
        addToLeaderboard('daily', elapsed);
      } else {
        addToLeaderboard(currentDifficulty, elapsed);
      }

      saveStats();
      updateIntel();
      renderLeaderboard();
      showToast('MISSION ACCOMPLISHED', 'success');
    } else {
      el.cmdFace.textContent = '✗';
      el.commandBtn.className = 'command-btn lose';
      el.statusText.textContent = aborted ? 'MISSION ABORTED' : 'CONTACT DETONATED — SECTOR LOST';
      el.statusDisplay.className = 'status-display lose';

      // Reveal all mines
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (board[y][x].isMine) board[y][x].isRevealed = true;
        }
      }

      // Reset streak on loss in classic mode
      if (!isDailyMode) {
        stats.games++;
        stats.streak = 0;
        saveStats();
        updateIntel();
      }
      showToast(aborted ? 'MISSION ABORTED' : 'SECTOR LOST', 'error');
    }

    renderField();
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    el.hudTime.textContent = String(Math.min(elapsed, 999)).padStart(3, '0');
  }

  // ============================================================
  // LEADERBOARDS (Task 6)
  // ============================================================
  function addToLeaderboard(difficulty, time) {
    const lb = stats.leaderboards[difficulty];
    const entry = { time, date: new Date().toISOString().split('T')[0], mode: isDailyMode ? 'DAILY' : 'CLASSIC' };
    lb.push(entry);
    lb.sort((a, b) => a.time - b.time);
    if (lb.length > 10) lb.pop();
  }

  function renderLeaderboard(difficulty = 'beginner') {
    const lb = stats.leaderboards[difficulty];
    let html = '<div class="lb-row header"><div>#</div><div>TIME</div><div>DATE</div><div>MODE</div></div>';

    if (lb.length === 0) {
      html += '<div class="lb-row empty">NO RECORDS — BE THE FIRST</div>';
    } else {
      lb.forEach((entry, i) => {
        const timeStr = String(entry.time).padStart(3, '0');
        html += `<div class="lb-row">
          <div class="lb-rank">${i + 1}</div>
          <div class="lb-time">${timeStr}s</div>
          <div class="lb-date">${entry.date}</div>
          <div class="lb-mode">${entry.mode}</div>
        </div>`;
      });
    }

    el.leaderboard.innerHTML = html;
  }

  // ============================================================
  // STATISTICS DASHBOARD (Task 8)
  // ============================================================
  function updateIntel() {
    el.intelStreak.textContent = stats.streak;
    el.intelBestStreak.textContent = stats.bestStreak;
    el.intelWins.textContent = stats.wins;
    el.intelWinrate.textContent = stats.games > 0 ? `${Math.round((stats.wins / stats.games) * 100)}%` : '0%';
  }

  // ============================================================
  // STREAK TRACKING (Task 5) — localStorage
  // ============================================================
  function loadStats() {
    try {
      const saved = localStorage.getItem('minefield-ops-stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        stats = { ...stats, ...parsed };
        // Ensure leaderboards exist
        stats.leaderboards = stats.leaderboards || { beginner: [], intermediate: [], expert: [], daily: [] };
        stats.dailyWins = stats.dailyWins || [];
      }
    } catch (e) {
      console.warn('[INTEL] Failed to load stats:', e);
    }
  }

  function saveStats() {
    try {
      localStorage.setItem('minefield-ops-stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('[INTEL] Failed to save stats:', e);
    }
  }

  // ============================================================
  // CUSTOM BOARD GENERATOR (Task 7)
  // ============================================================
  // Handled by custom difficulty fields in newMission()

  // ============================================================
  // TRANSMISSION / SHARE (Task 10)
  // ============================================================
  function transmitReport() {
    if (gameState !== 'won') {
      showToast('COMPLETE MISSION FIRST', 'error');
      return;
    }

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const today = new Date().toISOString().split('T')[0];
    const diffName = currentDifficulty === 'custom'
      ? `CUSTOM (${width}×${height}, ${mineCount})`
      : currentDifficulty.toUpperCase();

    // Generate emoji grid
    let emojiGrid = '';
    for (let y = 0; y < height; y++) {
      let row = '';
      for (let x = 0; x < width; x++) {
        const cell = board[y][x];
        if (cell.isMine) row += '💣';
        else if (cell.neighborMines > 0) row += '🟦';
        else row += '⬜';
      }
      emojiGrid += row + '\n';
    }

    const modeTag = isDailyMode ? 'DAILY OP' : 'FREE PLAY';
    const transmission = `[MINEFIELD-OPS TRANSMISSION]
${modeTag} | ${diffName} | ${elapsed}s
DATE: ${today}
SEED: ${isDailyMode ? dailySeed : 'RANDOM'}

${emojiGrid}
OPERATOR: KING_YOSEF_
STREAK: ${stats.streak} | WIN RATE: ${stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0}%

/// END TRANSMISSION ///`;

    navigator.clipboard.writeText(transmission).then(() => {
      el.transmissionLog.textContent = transmission;
      el.transmissionLog.hidden = false;
      showToast('TRANSMISSION COPIED TO CLIPBOARD', 'success');
    }).catch(() => {
      // Fallback
      el.transmissionLog.textContent = transmission;
      el.transmissionLog.hidden = false;
      showToast('TRANSMISSION READY — COPY MANUALLY', 'error');
    });
  }

  // ============================================================
  // TOAST NOTIFICATIONS
  // ============================================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Force reflow for animation
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================================
  // BOOT
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();