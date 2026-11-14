// Number Puzzle — KING_YOSEF_
// 2048, Threes, Fibonacci, and custom variants. Daily challenge included.

(() => {
  'use strict';

  // ===== Seeded PRNG (Mulberry32) =====
  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ===== Variant Rules =====
  const VARIANTS = {
    '2048': {
      name: '2048',
      startTiles: [2, 2],
      spawnValues: [2, 4],
      spawnWeights: [0.9, 0.1],
      canMerge: (a, b) => a === b,
      mergeResult: (a, b) => a + b,
      targetTile: 2048,
      tileColors: {}
    },
    'threes': {
      name: 'Threes',
      startTiles: [1, 2, 3],
      spawnValues: [1, 2, 3],
      spawnWeights: [0.45, 0.45, 0.1],
      canMerge: (a, b) => {
        if (a === 1 && b === 2) return true;
        if (a === 2 && b === 1) return true;
        if (a >= 3 && b >= 3 && a === b) return true;
        return false;
      },
      mergeResult: (a, b) => {
        if ((a === 1 && b === 2) || (a === 2 && b === 1)) return 3;
        return a + b;
      },
      targetTile: 6144,
      tileColors: {
        1: '#e6e6e6', 2: '#ffcc00', 3: '#ff6600',
        6: '#cc3300', 12: '#990000', 24: '#660000',
        48: '#cc0066', 96: '#99004d', 192: '#660033',
        384: '#cc00cc', 768: '#990099', 1536: '#660066',
        3072: '#6600cc', 6144: '#330099'
      }
    },
    'fibonacci': {
      name: 'Fibonacci',
      startTiles: [1, 1, 2],
      spawnValues: [1, 2],
      spawnWeights: [0.7, 0.3],
      canMerge: (a, b) => {
        const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765];
        const ia = fib.indexOf(a);
        const ib = fib.indexOf(b);
        return Math.abs(ia - ib) === 1;
      },
      mergeResult: (a, b) => {
        const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765];
        const ia = fib.indexOf(a);
        const ib = fib.indexOf(b);
        return fib[Math.max(ia, ib) + 1] || a + b;
      },
      targetTile: 6765,
      tileColors: {}
    },
    'powers3': {
      name: 'Powers of 3',
      startTiles: [3, 3],
      spawnValues: [3, 9],
      spawnWeights: [0.9, 0.1],
      canMerge: (a, b) => a === b,
      mergeResult: (a, b) => a + b,
      targetTile: 6561,
      tileColors: {}
    },
    'powers5': {
      name: 'Powers of 5',
      startTiles: [5, 5],
      spawnValues: [5, 25],
      spawnWeights: [0.9, 0.1],
      canMerge: (a, b) => a === b,
      mergeResult: (a, b) => a + b,
      targetTile: 15625,
      tileColors: {}
    },
    'primes': {
      name: 'Primes',
      startTiles: [2, 3],
      spawnValues: [2, 3, 5, 7, 11],
      spawnWeights: [0.3, 0.25, 0.2, 0.15, 0.1],
      canMerge: (a, b) => a === b,
      mergeResult: (a, b) => {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
        const idx = primes.indexOf(a);
        return primes[idx + 1] || a + b;
      },
      targetTile: 97,
      tileColors: {}
    }
  };

  // ===== State =====
  const state = {
    variant: '2048',
    gridSize: 4,
    grid: [],
    score: 0,
    bestScore: 0,
    bestTile: 0,
    moves: 0,
    startTime: null,
    isPlaying: false,
    isDaily: false,
    hasWon: false,
    history: [],
    rng: mulberry32(Date.now()),
    stats: JSON.parse(localStorage.getItem('numberPuzzleStats') || '{}'),
    leaderboard: JSON.parse(localStorage.getItem('numberPuzzleLeaderboard') || '{}'),
    touchStartX: 0,
    touchStartY: 0,
  };

  // ===== DOM Elements =====
  const els = {
    gridContainer: document.getElementById('gridContainer'),
    currentScore: document.getElementById('currentScore'),
    bestScoreDisplay: document.getElementById('bestScoreDisplay'),
    variantBadge: document.getElementById('variantBadge'),
    dailyBadge: document.getElementById('dailyBadge'),
    gameStatus: document.getElementById('gameStatus'),
    newBtn: document.getElementById('newBtn'),
    undoBtn: document.getElementById('undoBtn'),
    dailyBtn: document.getElementById('dailyBtn'),
    dailyDate: document.getElementById('dailyDate'),
    shareBtn: document.getElementById('shareBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    resultsModal: document.getElementById('resultsModal'),
    winModal: document.getElementById('winModal'),
    modalTitle: document.getElementById('modalTitle'),
    finalScore: document.getElementById('finalScore'),
    finalBestTile: document.getElementById('finalBestTile'),
    finalMoves: document.getElementById('finalMoves'),
    finalTime: document.getElementById('finalTime'),
    dailyResult: document.getElementById('dailyResult'),
    dailyMessage: document.getElementById('dailyMessage'),
    shareBtnModal: document.getElementById('shareBtnModal'),
    playAgainBtnModal: document.getElementById('playAgainBtnModal'),
    continueBtn: document.getElementById('continueBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    bestTile: document.getElementById('bestTile'),
    bestScore: document.getElementById('bestScore'),
    gamesPlayed: document.getElementById('gamesPlayed'),
    winRate: document.getElementById('winRate'),
    dailyWins: document.getElementById('dailyWins'),
    currentStreak: document.getElementById('currentStreak'),
    leaderboard: document.getElementById('leaderboard'),
    themeSelect: document.getElementById('themeSelect'),
    customMergeField: document.getElementById('customMergeField'),
    customMerge: document.getElementById('customMerge'),
  };

  // ===== Initialize =====
  function init() {
    setupEventListeners();
    loadStats();
    updateStatsDisplay();
    updateLeaderboard();
    updateTheme();
    newGame();
    updateDailyDate();
  }

  function setupEventListeners() {
    // Variant tabs
    document.querySelectorAll('.mode-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-tab').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        state.variant = btn.dataset.variant;
        els.customMergeField.hidden = state.variant !== 'custom';
        els.variantBadge.textContent = VARIANTS[state.variant].name;
        newGame();
      });
    });

    // Size tabs
    document.querySelectorAll('.size-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-tab').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        state.gridSize = parseInt(btn.dataset.size, 10);
        newGame();
      });
    });

    // Custom merge rule
    els.customMerge.addEventListener('change', () => {
      const customVariant = 'custom';
      VARIANTS[customVariant] = {
        name: 'Custom',
        ...VARIANTS[els.customMerge.value],
        targetTile: VARIANTS[els.customMerge.value].targetTile
      };
      state.variant = customVariant;
      els.variantBadge.textContent = 'Custom';
      newGame();
    });

    // Theme
    els.themeSelect.addEventListener('change', () => {
      document.body.dataset.theme = els.themeSelect.value;
      updateTheme();
    });

    // Buttons
    els.newBtn.addEventListener('click', () => newGame(false));
    els.undoBtn.addEventListener('click', undoMove);
    els.dailyBtn.addEventListener('click', () => newGame(true));
    els.shareBtn.addEventListener('click', shareResult);
    els.playAgainBtn.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      newGame(state.isDaily);
    });
    els.shareBtnModal.addEventListener('click', shareResult);
    els.playAgainBtnModal.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      newGame(state.isDaily);
    });
    els.continueBtn.addEventListener('click', () => {
      els.winModal.hidden = true;
      state.hasWon = true;
    });
    els.newGameBtn.addEventListener('click', () => {
      els.winModal.hidden = true;
      newGame(state.isDaily);
    });

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    // Touch
    els.gridContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    els.gridContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Prevent scrolling on grid
    els.gridContainer.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  }

  function updateTheme() {
    document.body.dataset.theme = els.themeSelect.value;
  }

  function updateDailyDate() {
    const today = new Date();
    els.dailyDate.textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // ===== Game Logic =====
  function newGame(isDaily = false) {
    state.isDaily = isDaily;
    state.isPlaying = true;
    state.hasWon = false;
    state.grid = createEmptyGrid();
    state.score = 0;
    state.bestTile = 0;
    state.moves = 0;
    state.startTime = Date.now();
    state.history = [];

    if (isDaily) {
      const today = new Date().toISOString().split('T')[0];
      state.rng = mulberry32(hashString(today + state.variant + state.gridSize));
      els.dailyBadge.hidden = false;
    } else {
      state.rng = mulberry32(Date.now());
      els.dailyBadge.hidden = true;
    }

    // Add initial tiles
    addRandomTile();
    addRandomTile();

    updateDisplay();
    els.gameStatus.textContent = isDaily ? 'Daily Challenge - Make your moves!' : 'Use arrow keys or swipe to move tiles';
    els.gameStatus.className = 'game-status active';
    els.shareBtn.hidden = true;
    els.playAgainBtn.hidden = true;
    els.resultsModal.hidden = true;
    els.winModal.hidden = true;
  }

  function createEmptyGrid() {
    const grid = [];
    for (let i = 0; i < state.gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < state.gridSize; j++) {
        grid[i][j] = 0;
      }
    }
    return grid;
  }

  function cloneGrid(grid) {
    return grid.map(row => [...row]);
  }

  function addRandomTile() {
    const empty = [];
    for (let i = 0; i < state.gridSize; i++) {
      for (let j = 0; j < state.gridSize; j++) {
        if (state.grid[i][j] === 0) empty.push({ x: i, y: j });
      }
    }
    if (empty.length === 0) return false;

    const variant = VARIANTS[state.variant];
    const { spawnValues, spawnWeights } = variant;
    let rand = state.rng();
    let cumulative = 0;
    let value = spawnValues[0];
    for (let i = 0; i < spawnValues.length; i++) {
      cumulative += spawnWeights[i];
      if (rand <= cumulative) {
        value = spawnValues[i];
        break;
      }
    }

    const pos = empty[Math.floor(state.rng() * empty.length)];
    state.grid[pos.x][pos.y] = value;
    return true;
  }

  function move(direction) {
    if (!state.isPlaying) return false;

    const variant = VARIANTS[state.variant];
    const oldGrid = cloneGrid(state.grid);
    let moved = false;
    let merged = false;
    let newBestTile = state.bestTile;

    const processLine = (line) => {
      // Filter non-zero
      const tiles = line.filter(v => v !== 0);
      const result = [];
      let i = 0;

      while (i < tiles.length) {
        if (i + 1 < tiles.length && variant.canMerge(tiles[i], tiles[i + 1])) {
          const mergedValue = variant.mergeResult(tiles[i], tiles[i + 1]);
          result.push(mergedValue);
          state.score += mergedValue;
          newBestTile = Math.max(newBestTile, mergedValue);
          i += 2;
          merged = true;
        } else {
          result.push(tiles[i]);
          i++;
        }
      }

      // Pad with zeros
      while (result.length < line.length) result.push(0);
      return result;
    };

    // Process based on direction
    if (direction === 'up') {
      for (let j = 0; j < state.gridSize; j++) {
        const line = [];
        for (let i = 0; i < state.gridSize; i++) line.push(state.grid[i][j]);
        const result = processLine(line);
        for (let i = 0; i < state.gridSize; i++) state.grid[i][j] = result[i];
      }
    } else if (direction === 'down') {
      for (let j = 0; j < state.gridSize; j++) {
        const line = [];
        for (let i = state.gridSize - 1; i >= 0; i--) line.push(state.grid[i][j]);
        const result = processLine(line);
        for (let i = 0; i < state.gridSize; i++) state.grid[state.gridSize - 1 - i][j] = result[i];
      }
    } else if (direction === 'left') {
      for (let i = 0; i < state.gridSize; i++) {
        const line = [...state.grid[i]];
        const result = processLine(line);
        state.grid[i] = result;
      }
    } else if (direction === 'right') {
      for (let i = 0; i < state.gridSize; i++) {
        const line = [...state.grid[i]].reverse();
        const result = processLine(line);
        state.grid[i] = result.reverse();
      }
    }

    // Check if grid changed
    for (let i = 0; i < state.gridSize; i++) {
      for (let j = 0; j < state.gridSize; j++) {
        if (state.grid[i][j] !== oldGrid[i][j]) {
          moved = true;
          break;
        }
      }
      if (moved) break;
    }

    if (moved) {
      state.moves++;
      state.bestTile = newBestTile;
      state.history.push({ grid: oldGrid, score: state.score - (merged ? 0 : 0), bestTile: state.bestTile, moves: state.moves - 1 });
      if (state.history.length > 10) state.history.shift();

      addRandomTile();
      updateDisplay();

      // Check win
      if (!state.hasWon && state.bestTile >= variant.targetTile) {
        state.hasWon = true;
        showWinModal();
      }

      // Check game over
      if (!canMove()) {
        gameOver();
      }
    }

    return moved;
  }

  function canMove() {
    // Check for empty cells
    for (let i = 0; i < state.gridSize; i++) {
      for (let j = 0; j < state.gridSize; j++) {
        if (state.grid[i][j] === 0) return true;
      }
    }

    // Check for possible merges
    const variant = VARIANTS[state.variant];
    for (let i = 0; i < state.gridSize; i++) {
      for (let j = 0; j < state.gridSize; j++) {
        const val = state.grid[i][j];
        if (i > 0 && variant.canMerge(val, state.grid[i - 1][j])) return true;
        if (i < state.gridSize - 1 && variant.canMerge(val, state.grid[i + 1][j])) return true;
        if (j > 0 && variant.canMerge(val, state.grid[i][j - 1])) return true;
        if (j < state.gridSize - 1 && variant.canMerge(val, state.grid[i][j + 1])) return true;
      }
    }
    return false;
  }

  function undoMove() {
    if (state.history.length === 0 || !state.isPlaying) return;

    const last = state.history.pop();
    state.grid = last.grid;
    state.score = last.score;
    state.bestTile = last.bestTile;
    state.moves = last.moves;
    state.hasWon = false;
    updateDisplay();
    els.gameStatus.textContent = 'Move undone';
    els.gameStatus.className = 'game-status active';
  }

  function handleKeydown(e) {
    if (!state.isPlaying) return;

    const keyMap = {
      'ArrowUp': 'up', 'KeyW': 'up',
      'ArrowDown': 'down', 'KeyS': 'down',
      'ArrowLeft': 'left', 'KeyA': 'left',
      'ArrowRight': 'right', 'KeyD': 'right',
    };

    if (keyMap[e.code]) {
      e.preventDefault();
      move(keyMap[e.code]);
    }
    if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      undoMove();
    }
  }

  function handleTouchStart(e) {
    state.touchStartX = e.changedTouches[0].clientX;
    state.touchStartY = e.changedTouches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (!state.isPlaying) return;

    const dx = e.changedTouches[0].clientX - state.touchStartX;
    const dy = e.changedTouches[0].clientY - state.touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 30) return; // Too short

    if (absDx > absDy) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
  }

  function updateDisplay() {
    renderGrid();
    els.currentScore.textContent = state.score;
    els.bestScoreDisplay.textContent = state.bestScore;
  }

  function renderGrid() {
    const container = els.gridContainer;
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'game-grid';
    grid.dataset.size = state.gridSize;

    for (let i = 0; i < state.gridSize; i++) {
      for (let j = 0; j < state.gridSize; j++) {
        const tile = document.createElement('div');
        tile.className = 'grid-tile';
        const value = state.grid[i][j];

        if (value === 0) {
          tile.classList.add('empty');
          tile.textContent = '';
        } else {
          tile.dataset.value = value;
          tile.textContent = formatNumber(value);

          // Apply custom colors for Threes
          const variant = VARIANTS[state.variant];
          if (variant.tileColors[value]) {
            tile.style.background = variant.tileColors[value];
            tile.style.color = value <= 3 ? '#333' : '#fff';
          }
        }

        grid.appendChild(tile);
      }
    }

    container.appendChild(grid);
  }

  function formatNumber(num) {
    if (num >= 10000) return (num / 1000).toFixed(1) + 'k';
    if (num >= 1000) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return num.toString();
  }

  function showWinModal() {
    els.winModal.hidden = false;
    els.gameStatus.textContent = `You reached ${VARIANTS[state.variant].targetTile}! 🎉`;
    els.gameStatus.className = 'game-status win';
  }

  function gameOver() {
    state.isPlaying = false;
    const timeTaken = Math.round((Date.now() - state.startTime) / 1000);
    const won = state.hasWon;

    // Update stats
    saveStats(won, timeTaken);

    // Show game over modal
    els.modalTitle.textContent = won ? 'You Won!' : 'Game Over!';
    els.finalScore.textContent = state.score;
    els.finalBestTile.textContent = state.bestTile;
    els.finalMoves.textContent = state.moves;
    els.finalTime.textContent = formatTime(timeTaken);

    if (state.isDaily) {
      els.dailyResult.hidden = false;
      const dailyStats = state.stats.daily || {};
      const today = new Date().toISOString().split('T')[0];
      const key = `${state.variant}-${state.gridSize}-${today}`;
      const isNewBest = !dailyStats[key] || state.score > dailyStats[key].score;
      els.dailyMessage.textContent = isNewBest
        ? `🎉 New daily best! Score: ${state.score}`
        : `Today's best: ${dailyStats[key]?.score || '—'}`;
    } else {
      els.dailyResult.hidden = true;
    }

    els.resultsModal.hidden = false;
    els.shareBtn.hidden = false;
    els.playAgainBtn.hidden = false;
    els.gameStatus.textContent = won ? 'Congratulations! You won!' : 'No more moves. Game over!';
    els.gameStatus.className = won ? 'game-status win' : 'game-status over';
  }

  function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  function saveStats(won, time) {
    const variantKey = `${state.variant}-${state.gridSize}`;

    if (!state.stats[variantKey]) {
      state.stats[variantKey] = {
        bestScore: 0,
        bestTile: 0,
        gamesPlayed: 0,
        wins: 0,
        totalScore: 0,
        dailyWins: 0,
        streak: 0,
        bestStreak: 0,
        lastDailyDate: null
      };
    }

    const s = state.stats[variantKey];
    s.gamesPlayed++;
    s.totalScore += state.score;
    s.bestScore = Math.max(s.bestScore, state.score);
    s.bestTile = Math.max(s.bestTile, state.bestTile);
    if (won) s.wins++;

    state.bestScore = Math.max(state.bestScore, state.score);

    // Daily challenge
    if (state.isDaily) {
      const today = new Date().toISOString().split('T')[0];
      const key = `${state.variant}-${state.gridSize}-${today}`;

      if (!state.stats.daily) state.stats.daily = {};
      if (!state.stats.daily[key] || state.score > state.stats.daily[key].score) {
        state.stats.daily[key] = { score: state.score, bestTile: state.bestTile, date: today, won };
        if (won) s.dailyWins++;
      }

      // Streak
      if (won) {
        if (s.lastDailyDate) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (s.lastDailyDate === yesterday) {
            s.streak++;
          } else if (s.lastDailyDate !== today) {
            s.streak = 1;
          }
        } else {
          s.streak = 1;
        }
        s.bestStreak = Math.max(s.bestStreak, s.streak);
      } else {
        s.streak = 0;
      }
      s.lastDailyDate = today;
    }

    // Leaderboard
    if (!state.leaderboard[variantKey]) state.leaderboard[variantKey] = [];

    state.leaderboard[variantKey].push({
      score: state.score,
      bestTile: state.bestTile,
      moves: state.moves,
      time,
      date: new Date().toISOString().split('T')[0],
      won
    });
    state.leaderboard[variantKey].sort((a, b) => b.score - a.score || a.moves - b.moves);
    state.leaderboard[variantKey] = state.leaderboard[variantKey].slice(0, 10);

    localStorage.setItem('numberPuzzleStats', JSON.stringify(state.stats));
    localStorage.setItem('numberPuzzleLeaderboard', JSON.stringify(state.leaderboard));

    updateStatsDisplay();
    updateLeaderboard();
  }

  function loadStats() {
    // Already loaded in state init
  }

  function updateStatsDisplay() {
    const variantKey = `${state.variant}-${state.gridSize}`;
    const s = state.stats[variantKey] || { bestTile: 0, bestScore: 0, gamesPlayed: 0, wins: 0, dailyWins: 0, streak: 0 };

    els.bestTile.textContent = s.bestTile || 0;
    els.bestScore.textContent = s.bestScore || 0;
    els.gamesPlayed.textContent = s.gamesPlayed || 0;
    els.winRate.textContent = s.gamesPlayed ? Math.round((s.wins / s.gamesPlayed) * 100) + '%' : '0%';
    els.dailyWins.textContent = s.dailyWins || 0;
    els.currentStreak.textContent = s.streak || 0;
  }

  function updateLeaderboard() {
    const variantKey = `${state.variant}-${state.gridSize}`;
    const scores = state.leaderboard[variantKey] || [];

    if (scores.length === 0) {
      els.leaderboard.innerHTML = '<div style="color:var(--muted);text-align:center;padding:1rem;">No scores yet</div>';
      return;
    }

    els.leaderboard.innerHTML = scores.map((s, i) => `
      <div class="leaderboard-entry">
        <span class="rank">#${i+1}</span>
        <span class="score">${s.score} (${s.bestTile})</span>
        <span class="mode">${s.moves} moves • ${s.time}s • ${s.date}</span>
      </div>
    `).join('');
  }

  function shareResult() {
    const variant = VARIANTS[state.variant].name;
    const size = `${state.gridSize}×${state.gridSize}`;
    const text = `🔢 Number Puzzle (${variant}, ${size})
Score: ${state.score} | Best Tile: ${state.bestTile}
Moves: ${state.moves} | Time: ${formatTime(Math.round((Date.now() - state.startTime) / 1000))}
${state.isDaily ? '📅 Daily Challenge' : ''}
#KING_YOSEF_`;

    if (navigator.share) {
      navigator.share({ title: 'Number Puzzle Result', text });
    } else {
      navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
    }
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
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
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ===== Init =====
  init();
})();