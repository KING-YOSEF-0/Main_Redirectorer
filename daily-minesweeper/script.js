const DailyMinesweeper = (() => {
  // Game state
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

  // Difficulties
  const DIFFICULTIES = {
    beginner: { width: 9, height: 9, mines: 10 },
    intermediate: { width: 16, height: 16, mines: 40 },
    expert: { width: 30, height: 16, mines: 99 }
  };

  // Stats
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

  const elements = {};

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    loadStats();
    updateDailyDate();
    newGame();
    renderBoard();
    updateStats();
    renderLeaderboard();
  }

  function cacheElements() {
    elements.diffTabs = document.querySelectorAll('.diff-tab');
    elements.customFields = document.getElementById('custom-fields');
    elements.customWidth = document.getElementById('custom-width');
    elements.customHeight = document.getElementById('custom-height');
    elements.customMines = document.getElementById('custom-mines');
    elements.modeRadios = document.querySelectorAll('input[name="mode"]');
    elements.dailyDate = document.getElementById('daily-date');
    elements.dailyHint = document.getElementById('daily-hint');
    elements.btnNewGame = document.getElementById('btn-new-game');
    elements.btnGiveUp = document.getElementById('btn-give-up');
    elements.faceBtn = document.getElementById('face-btn');
    elements.gameTimer = document.getElementById('game-timer');
    elements.gameMines = document.getElementById('game-mines');
    elements.board = document.getElementById('board');
    elements.gameStatus = document.getElementById('game-status');
    elements.lbTabs = document.querySelectorAll('.lb-tab');
    elements.leaderboard = document.getElementById('leaderboard');
    elements.btnShare = document.getElementById('btn-share');
    elements.sharePreview = document.getElementById('share-preview');
    elements.statStreak = document.getElementById('stat-streak');
    elements.statBestStreak = document.getElementById('stat-best-streak');
    elements.statWins = document.getElementById('stat-wins');
    elements.statWinrate = document.getElementById('stat-winrate');
  }

  function bindEvents() {
    // Difficulty tabs
    elements.diffTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        currentDifficulty = tab.dataset.diff;
        elements.diffTabs.forEach(t => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab);
        });
        elements.customFields.hidden = currentDifficulty !== 'custom';
        if (currentDifficulty !== 'custom') {
          applyDifficulty(currentDifficulty);
        }
        newGame();
      });
    });

    // Custom fields
    [elements.customWidth, elements.customHeight, elements.customMines].forEach(input => {
      input.addEventListener('change', () => {
        if (currentDifficulty === 'custom') newGame();
      });
    });

    // Mode radios
    elements.modeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        isDailyMode = radio.value === 'daily';
        updateDailyHint();
        newGame();
      });
    });

    // Game controls
    elements.btnNewGame.addEventListener('click', newGame);
    elements.btnGiveUp.addEventListener('click', giveUp);
    elements.faceBtn.addEventListener('click', newGame);

    // Leaderboard tabs
    elements.lbTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.lbTabs.forEach(t => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab);
        });
        renderLeaderboard(tab.dataset.lb);
      });
    });

    // Share
    elements.btnShare.addEventListener('click', shareResult);

    // Board events (delegated)
    elements.board.addEventListener('click', (e) => handleCellClick(e));
    elements.board.addEventListener('contextmenu', (e) => handleRightClick(e));

    // Touch events for mobile
    let touchStartTime = 0;
    let touchCell = null;

    elements.board.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      const cell = e.target.closest('.cell');
      if (cell) {
        touchCell = cell;
        cell.classList.add('touch-active');
      }
    }, { passive: true });

    elements.board.addEventListener('touchend', (e) => {
      if (touchCell) {
        touchCell.classList.remove('touch-active');
        const duration = Date.now() - touchStartTime;
        if (duration > 500) {
          // Long press = flag
          handleRightClick({ target: touchCell, preventDefault: () => {} });
        } else {
          // Tap = reveal
          handleCellClick({ target: touchCell, preventDefault: () => {} });
        }
        touchCell = null;
      }
    });

    // Prevent context menu on long press
    elements.board.addEventListener('contextmenu', (e) => {
      if (e.target.classList.contains('cell')) e.preventDefault();
    });
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

  function applyDifficulty(diff) {
    const d = DIFFICULTIES[diff];
    width = d.width;
    height = d.height;
    mineCount = d.mines;
  }

  function getDailySeed() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    return `daily-${dateStr}`;
  }

  function seededRandom(seed) {
    // Simple seeded PRNG (Mulberry32)
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

  function newGame() {
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Set dimensions
    if (currentDifficulty === 'custom') {
      width = parseInt(elements.customWidth.value) || 16;
      height = parseInt(elements.customHeight.value) || 16;
      mineCount = Math.min(parseInt(elements.customMines.value) || 40, width * height - 1);
    } else {
      applyDifficulty(currentDifficulty);
    }

    // Set PRNG
    if (isDailyMode) {
      dailySeed = getDailySeed();
      prng = seededRandom(hashString(dailySeed));
    } else {
      prng = Math.random;
    }

    // Reset state
    board = [];
    revealedCount = 0;
    flaggedCount = 0;
    gameState = 'ready';
    startTime = 0;
    elements.gameTimer.textContent = '000';
    elements.gameMines.textContent = String(mineCount).padStart(3, '0');
    elements.faceBtn.textContent = '😊';
    elements.faceBtn.className = 'face-btn';
    elements.gameStatus.textContent = isDailyMode ? "Today's Daily Challenge" : 'Click to start';
    elements.gameStatus.className = 'game-status';

    // Create empty board
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push({
          x, y,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        });
      }
      board.push(row);
    }

    renderBoard();
    updateDailyDate();
  }

  function placeMines(firstX, firstY) {
    const positions = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Don't place mine on first click or its neighbors
        if (Math.abs(x - firstX) <= 1 && Math.abs(y - firstY) <= 1) continue;
        positions.push({ x, y });
      }
    }

    // Shuffle and pick mines
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    const mines = positions.slice(0, mineCount);
    mines.forEach(pos => {
      board[pos.y][pos.x].isMine = true;
    });

    // Calculate neighbor counts
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (board[y][x].isMine) continue;
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && board[ny][nx].isMine) {
              count++;
            }
          }
        }
        board[y][x].neighborMines = count;
      }
    }
  }

  function renderBoard() {
    elements.board.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;
    elements.board.innerHTML = '';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = board[y][x];
        const el = document.createElement('div');
        el.className = 'cell';
        el.dataset.x = x;
        el.dataset.y = y;

        if (cell.isRevealed) {
          el.classList.add('revealed');
          if (cell.isMine) {
            el.classList.add('mine');
            el.textContent = '💣';
          } else if (cell.neighborMines > 0) {
            el.dataset.num = cell.neighborMines;
            el.textContent = cell.neighborMines;
          }
        } else if (cell.isFlagged) {
          el.classList.add('flagged');
          el.textContent = '🚩';
        }

        elements.board.appendChild(el);
      }
    }
  }

  function handleCellClick(e) {
    if (gameState !== 'playing' && gameState !== 'ready') return;

    const cellEl = e.target.closest('.cell');
    if (!cellEl) return;

    const x = parseInt(cellEl.dataset.x);
    const y = parseInt(cellEl.dataset.y);
    const cell = board[y][x];

    if (cell.isFlagged || cell.isRevealed) return;

    // First click - place mines
    if (gameState === 'ready') {
      placeMines(x, y);
      gameState = 'playing';
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);
      elements.faceBtn.textContent = '😮';
      elements.faceBtn.className = 'face-btn playing';
      elements.gameStatus.textContent = 'Playing...';
      elements.gameStatus.className = 'game-status playing';
    }

    revealCell(x, y);
    checkWin();
    renderBoard();
  }

  function handleRightClick(e) {
    e.preventDefault();
    if (gameState !== 'playing') return;

    const cellEl = e.target.closest('.cell');
    if (!cellEl) return;

    const x = parseInt(cellEl.dataset.x);
    const y = parseInt(cellEl.dataset.y);
    const cell = board[y][x];

    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    flaggedCount += cell.isFlagged ? 1 : -1;
    elements.gameMines.textContent = String(mineCount - flaggedCount).padStart(3, '0');
    renderBoard();
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
      // Auto-reveal neighbors
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          revealCell(x + dx, y + dy);
        }
      }
    }
  }

  function checkWin() {
    if (revealedCount === width * height - mineCount) {
      gameOver(true);
    }
  }

  function gameOver(won) {
    gameState = won ? 'won' : 'lost';

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    if (won) {
      elements.faceBtn.textContent = '😎';
      elements.faceBtn.className = 'face-btn win';
      elements.gameStatus.textContent = `🎉 You won in ${elapsed}s!`;
      elements.gameStatus.className = 'game-status win';

      // Reveal all mines as flags
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (board[y][x].isMine && !board[y][x].isFlagged) {
            board[y][x].isFlagged = true;
          }
        }
      }
      flaggedCount = mineCount;
      elements.gameMines.textContent = '000';

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
        // Add to daily leaderboard
        addToLeaderboard('daily', elapsed);
      } else {
        // Classic streak resets on loss, but we track separately
        addToLeaderboard(currentDifficulty, elapsed);
      }
      saveStats();
      updateStats();
      renderLeaderboard();
    } else {
      elements.faceBtn.textContent = '💀';
      elements.faceBtn.className = 'face-btn lose';
      elements.gameStatus.textContent = '💥 Game Over! Click 😊 to retry';
      elements.gameStatus.className = 'game-status lose';

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
        updateStats();
      }
    }

    renderBoard();
  }

  function giveUp() {
    if (gameState === 'playing') {
      gameOver(false);
    }
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    elements.gameTimer.textContent = String(Math.min(elapsed, 999)).padStart(3, '0');
  }

  function addToLeaderboard(difficulty, time) {
    const lb = stats.leaderboards[difficulty];
    const entry = {
      time,
      date: new Date().toISOString().split('T')[0],
      mode: isDailyMode ? 'daily' : 'classic'
    };
    lb.push(entry);
    lb.sort((a, b) => a.time - b.time);
    if (lb.length > 10) lb.pop();
  }

  function renderLeaderboard(difficulty = 'beginner') {
    const lb = stats.leaderboards[difficulty];
    let html = '<div class="lb-row header"><div>#</div><div>Time</div><div>Date</div><div>Mode</div></div>';

    if (lb.length === 0) {
      html += '<div class="lb-row empty">No times yet. Be the first!</div>';
    } else {
      lb.forEach((entry, i) => {
        const timeStr = String(entry.time).padStart(3, '0');
        html += `<div class="lb-row">
          <div class="lb-rank">${i + 1}</div>
          <div class="lb-time">${timeStr}s</div>
          <div class="lb-date">${entry.date}</div>
          <div style="text-align: right; color: var(--muted); font-size: 0.8rem;">${entry.mode}</div>
        </div>`;
      });
    }

    elements.leaderboard.innerHTML = html;
  }

  function updateStats() {
    elements.statStreak.textContent = stats.streak;
    elements.statBestStreak.textContent = stats.bestStreak;
    elements.statWins.textContent = stats.wins;
    elements.statWinrate.textContent = stats.games > 0 ? `${Math.round((stats.wins / stats.games) * 100)}%` : '0%';
  }

  function updateDailyDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.dailyDate.textContent = today.toLocaleDateString('en-US', options);
  }

  function updateDailyHint() {
    elements.dailyHint.textContent = isDailyMode
      ? 'Same board for everyone worldwide'
      : 'Random board each game';
  }

  function shareResult() {
    if (gameState !== 'won') {
      showToast('Complete a game first!');
      return;
    }

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const today = new Date().toISOString().split('T')[0];
    const diffName = currentDifficulty === 'custom' ? `Custom (${width}×${height}, ${mineCount})` :
      currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);

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

    const shareText = `Daily Minesweeper ${isDailyMode ? '📅' : '🎲'}
${diffName} • ${elapsed}s
${today}

${emojiGrid}
#DailyMinesweeper #KING_YOSEF_`;

    navigator.clipboard.writeText(shareText).then(() => {
      elements.sharePreview.textContent = shareText;
      elements.sharePreview.hidden = false;
      showToast('Result copied to clipboard!');
    });
  }

  function loadStats() {
    try {
      const saved = localStorage.getItem('daily-minesweeper-stats');
      if (saved) {
        stats = { ...stats, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load stats');
    }
  }

  function saveStats() {
    try {
      localStorage.setItem('daily-minesweeper-stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save stats');
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();