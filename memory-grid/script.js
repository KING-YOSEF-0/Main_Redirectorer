// Memory Grid — KING_YOSEF_
// Retro Cyberpunk Neural Pattern Recall System

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

  // ===== Hash function for daily seed =====
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // ===== State =====
  const state = {
    gridSize: 3,
    mode: 'classic',
    displayTime: 3000,
    sequenceLength: 3,
    tileStyle: 'solid',
    isDaily: false,
    isRunning: false,
    isMemorizing: false,
    isRecalling: false,
    currentLevel: 1,
    pattern: [],
    playerPattern: [],
    sequenceStep: 0,
    sequencePattern: [],
    stats: JSON.parse(localStorage.getItem('memoryGridStats') || '{}'),
    highScores: JSON.parse(localStorage.getItem('memoryGridScores') || '{}'),
    rng: mulberry32(Date.now()),
    colors: [
      '#00ff88', '#00ccff', '#ffcc00', '#ff3366',
      '#aa44ff', '#ff6600', '#00ffcc', '#ffff00',
      '#ff0088', '#44ffff', '#88ff00', '#ff44aa',
      '#8800ff', '#00ff44', '#ff8800', '#4488ff'
    ],
    patterns: [
      'linear-gradient(45deg, transparent 48%, currentColor 50%, transparent 52%)',
      'linear-gradient(-45deg, transparent 48%, currentColor 50%, transparent 52%)',
      'repeating-linear-gradient(45deg, currentColor, currentColor 8px, transparent 8px, transparent 16px)',
      'repeating-linear-gradient(-45deg, currentColor, currentColor 8px, transparent 8px, transparent 16px)',
      'radial-gradient(circle at 30% 30%, currentColor 30%, transparent 40%)',
      'repeating-radial-gradient(circle at center, currentColor, currentColor 6px, transparent 6px, transparent 12px)',
      'linear-gradient(90deg, transparent 48%, currentColor 50%, transparent 52%)',
      'linear-gradient(0deg, transparent 48%, currentColor 50%, transparent 52%)',
    ],
    emojis: ['▲', '◆', '■', '●', '★', '◆', '▲', '■', '●', '★', '◆', '▲', '■', '●', '★', '◆'],
  };

  // ===== DOM Elements =====
  const els = {
    gridContainer: document.getElementById('gridContainer'),
    currentLevel: document.getElementById('currentLevel'),
    modeBadge: document.getElementById('modeBadge'),
    sizeBadge: document.getElementById('sizeBadge'),
    dailyBadge: document.getElementById('dailyBadge'),
    gameStatus: document.getElementById('gameStatus'),
    statusText: document.querySelector('.status-text'),
    statusFill: document.querySelector('.status-fill'),
    startBtn: document.getElementById('startBtn'),
    dailyBtn: document.getElementById('dailyBtn'),
    replayBtn: document.getElementById('replayBtn'),
    restartBtn: document.getElementById('restartBtn'),
    shareBtn: document.getElementById('shareBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    resultsModal: document.getElementById('resultsModal'),
    modalTitle: document.getElementById('modalTitle'),
    finalLevel: document.getElementById('finalLevel'),
    finalSize: document.getElementById('finalSize'),
    finalMode: document.getElementById('finalMode'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    dailyResult: document.getElementById('dailyResult'),
    dailyMessage: document.getElementById('dailyMessage'),
    sequenceDisplay: document.getElementById('sequenceDisplay'),
    seqStep: document.getElementById('seqStep'),
    seqProgress: document.getElementById('seqProgress'),
    bestClassic: document.getElementById('bestClassic'),
    bestSequence: document.getElementById('bestSequence'),
    bestChess: document.getElementById('bestChess'),
    currentStreak: document.getElementById('currentStreak'),
    bestStreak: document.getElementById('bestStreak'),
    dailyBest: document.getElementById('dailyBest'),
    gamesPlayed: document.getElementById('gamesPlayed'),
    leaderboard: document.getElementById('leaderboard'),
  };

  // ===== Initialize =====
  function init() {
    setupEventListeners();
    updateStatsDisplay();
    updateLeaderboard();
    setStatus('AWAITING INITIALIZATION...', 'idle');
  }

  function setupEventListeners() {
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
        els.sizeBadge.textContent = `${state.gridSize}×${state.gridSize}`;
      });
    });

    // Mode tabs
    document.querySelectorAll('.mode-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-tab').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        state.mode = btn.dataset.mode;
        els.modeBadge.textContent = state.mode.toUpperCase();
        updateModeFields();
      });
    });

    // Sliders
    const displayTimeInput = document.getElementById('displayTime');
    const displayTimeValue = document.getElementById('displayTimeValue');
    displayTimeInput.addEventListener('input', e => {
      state.displayTime = parseFloat(e.target.value) * 1000;
      displayTimeValue.textContent = parseFloat(e.target.value).toFixed(1) + 's';
    });

    const sequenceLengthInput = document.getElementById('sequenceLength');
    const seqLengthValue = document.getElementById('seqLengthValue');
    sequenceLengthInput.addEventListener('input', e => {
      state.sequenceLength = parseInt(e.target.value, 10);
      seqLengthValue.textContent = state.sequenceLength;
    });

    // Tile style
    document.getElementById('tileStyle').addEventListener('change', e => {
      state.tileStyle = e.target.value;
    });

    // Buttons
    els.startBtn.addEventListener('click', () => startGame(false));
    els.dailyBtn.addEventListener('click', () => startGame(true));
    els.replayBtn.addEventListener('click', replayPattern);
    els.restartBtn.addEventListener('click', () => startGame(state.isDaily));
    els.playAgainBtn.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      startGame(state.isDaily);
    });
    els.shareBtn.addEventListener('click', shareResult);

    // Keyboard support for grid
    document.addEventListener('keydown', handleKeydown);
  }

  function updateModeFields() {
    const isSequence = state.mode === 'sequence';
    document.getElementById('displayTimeField').hidden = isSequence;
    document.getElementById('sequenceLengthField').hidden = !isSequence;
  }

  function handleKeydown(e) {
    if (!state.isRecalling || !state.isRunning) return;
    const totalTiles = state.gridSize * state.gridSize;
    let index = -1;
    if (e.key >= '1' && e.key <= '9') {
      index = parseInt(e.key, 10) - 1;
    } else if (e.key === '0') {
      index = 9;
    } else if (e.key >= 'a' && e.key <= 'z') {
      index = e.key.charCodeAt(0) - 'a'.charCodeAt(0) + 9;
    } else if (e.key >= 'A' && e.key <= 'Z') {
      index = e.key.charCodeAt(0) - 'A'.charCodeAt(0) + 9;
    }
    if (index >= 0 && index < totalTiles) {
      handleTileClick(index);
    }
  }

  // ===== Game Logic =====
  function startGame(isDaily) {
    state.isDaily = isDaily;
    state.isRunning = true;
    state.currentLevel = 1;
    state.pattern = [];
    state.playerPattern = [];
    state.sequenceStep = 0;
    state.sequencePattern = [];

    els.startBtn.hidden = true;
    els.dailyBtn.hidden = true;
    els.replayBtn.hidden = true;
    els.restartBtn.hidden = false;
    els.resultsModal.hidden = true;
    els.sequenceDisplay.hidden = state.mode !== 'sequence';

    if (isDaily) {
      els.dailyBadge.hidden = false;
      const today = new Date().toISOString().split('T')[0];
      state.rng = mulberry32(hashString(today + state.mode + state.gridSize));
    } else {
      els.dailyBadge.hidden = true;
      state.rng = mulberry32(Date.now());
    }

    updateLevelDisplay();
    nextLevel();
  }

  function nextLevel() {
    state.playerPattern = [];
    state.sequenceStep = 0;

    if (state.mode === 'classic') {
      // Classic: add one more tile to pattern
      const totalTiles = state.gridSize * state.gridSize;
      let newTile;
      do {
        newTile = Math.floor(state.rng() * totalTiles);
      } while (state.pattern.includes(newTile));
      state.pattern.push(newTile);
    } else if (state.mode === 'sequence') {
      // Sequence: generate new sequence of increasing length
      const length = state.sequenceLength + state.currentLevel - 1;
      state.sequencePattern = [];
      for (let i = 0; i < length; i++) {
        const totalTiles = state.gridSize * state.gridSize;
        let tile;
        do {
          tile = Math.floor(state.rng() * totalTiles);
        } while (state.sequencePattern.includes(tile));
        state.sequencePattern.push(tile);
      }
      state.pattern = [...state.sequencePattern];
    } else if (state.mode === 'chess') {
      // Chess Knight: generate knight's tour pattern
      generateKnightPattern();
    }

    showPattern();
  }

  function generateKnightPattern() {
    const size = state.gridSize;
    const total = size * size;
    const moves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    // Start from random position
    let x = Math.floor(state.rng() * size);
    let y = Math.floor(state.rng() * size);
    const path = [y * size + x];
    const visited = new Set(path);

    // Try to build a path of length = level + 2
    const targetLength = Math.min(state.currentLevel + 2, total);
    let attempts = 0;

    while (path.length < targetLength && attempts < 1000) {
      const validMoves = moves
        .map(([dx, dy]) => [x + dx, y + dy])
        .filter(([nx, ny]) => nx >= 0 && nx < size && ny >= 0 && ny < size)
        .filter(([nx, ny]) => !visited.has(ny * size + nx));

      if (validMoves.length === 0) break;

      const [nx, ny] = validMoves[Math.floor(state.rng() * validMoves.length)];
      x = nx; y = ny;
      path.push(y * size + x);
      visited.add(y * size + x);
      attempts++;
    }

    state.pattern = path;
    state.sequencePattern = [...path];
  }

  function showPattern() {
    state.isMemorizing = true;
    state.isRecalling = false;

    if (state.mode === 'sequence') {
      setStatus('MEMORIZING SEQUENCE...', 'memorize');
      els.seqStep.textContent = `STEP 01 / ${state.pattern.length.toString().padStart(2, '0')}`;
      renderSequenceProgress(0);
      playSequenceStep(0);
    } else {
      setStatus('MEMORIZING PATTERN...', 'memorize');
      renderGrid(true);
      // Highlight pattern tiles
      setTimeout(() => {
        highlightPattern();
      }, 100);
    }
  }

  function playSequenceStep(step) {
    if (step >= state.pattern.length) {
      // Done showing sequence
      state.isMemorizing = false;
      state.isRecalling = true;
      setStatus('RECALL SEQUENCE', 'recall');
      renderGrid(false);
      return;
    }

    // Show current step
    renderGrid(true, state.pattern[step]);
    els.seqStep.textContent = `STEP ${(step + 1).toString().padStart(2, '0')} / ${state.pattern.length.toString().padStart(2, '0')}`;
    renderSequenceProgress(step);

    setTimeout(() => {
      playSequenceStep(step + 1);
    }, state.displayTime);
  }

  function highlightPattern() {
    const tiles = els.gridContainer.querySelectorAll('.grid-tile');
    state.pattern.forEach(idx => {
      if (tiles[idx]) {
        tiles[idx].classList.add('revealed');
      }
    });

    setTimeout(() => {
      tiles.forEach(t => t.classList.remove('revealed'));
      state.isMemorizing = false;
      state.isRecalling = true;
      setStatus('RECALL PATTERN', 'recall');
    }, state.displayTime);
  }

  function renderGrid(revealAll = false, highlightIndex = -1) {
    const container = els.gridContainer;
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'memory-grid';
    grid.dataset.size = state.gridSize;

    const totalTiles = state.gridSize * state.gridSize;

    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('button');
      tile.className = 'grid-tile';
      tile.dataset.index = i;
      tile.dataset.style = state.tileStyle;

      // Assign color/pattern/emoji
      const colorIdx = i % state.colors.length;
      tile.style.setProperty('--tile-color', state.colors[colorIdx]);
      tile.style.setProperty('--tile-pattern', state.patterns[colorIdx % state.patterns.length]);

      if (state.tileStyle === 'emoji') {
        tile.textContent = state.emojis[colorIdx];
      } else if (state.tileStyle === 'number') {
        tile.textContent = (i + 1).toString().padStart(2, '0');
      }

      // Determine if this tile should be revealed
      const isInPattern = state.pattern.includes(i);
      const isRevealed = revealAll && isInPattern;
      const isHighlight = highlightIndex === i;

      if (isRevealed || isHighlight) {
        tile.classList.add('revealed');
      }

      if (!state.isMemorizing && state.isRecalling) {
        tile.addEventListener('click', () => handleTileClick(i));
      }

      grid.appendChild(tile);
    }

    container.appendChild(grid);
  }

  function renderSequenceProgress(currentStep) {
    const container = els.seqProgress;
    container.innerHTML = '';

    state.pattern.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'seq-dot';
      if (i < currentStep) dot.classList.add('done');
      else if (i === currentStep) dot.classList.add('active');
      container.appendChild(dot);
    });
  }

  function handleTileClick(index) {
    if (!state.isRecalling) return;

    const tiles = els.gridContainer.querySelectorAll('.grid-tile');
    const expectedIndex = state.mode === 'sequence' || state.mode === 'chess'
      ? state.sequencePattern[state.sequenceStep]
      : state.pattern[state.sequenceStep];

    if (index === expectedIndex) {
      // Correct!
      state.playerPattern.push(index);
      state.sequenceStep++;

      tiles[index].classList.add('correct');

      // Update sequence progress if in sequence mode
      if (state.mode === 'sequence' || state.mode === 'chess') {
        const dots = els.seqProgress.querySelectorAll('.seq-dot');
        if (dots[state.sequenceStep - 1]) {
          dots[state.sequenceStep - 1].classList.add('done');
        }
        if (dots[state.sequenceStep]) {
          dots[state.sequenceStep].classList.add('active');
        }
        els.seqStep.textContent = `STEP ${(state.sequenceStep + 1).toString().padStart(2, '0')} / ${state.pattern.length.toString().padStart(2, '0')}`;
      }

      // Update status bar
      const progress = (state.sequenceStep / state.pattern.length) * 100;
      if (els.statusFill) {
        els.statusFill.style.width = `${progress}%`;
      }

      if (state.sequenceStep >= state.pattern.length) {
        // Level complete!
        levelComplete();
      }
    } else {
      // Wrong!
      tiles[index].classList.add('wrong');
      if (tiles[expectedIndex]) {
        tiles[expectedIndex].classList.add('missed');
      }
      // Mark the sequence dot as error
      if (state.mode === 'sequence' || state.mode === 'chess') {
        const dots = els.seqProgress.querySelectorAll('.seq-dot');
        if (dots[state.sequenceStep]) {
          dots[state.sequenceStep].classList.add('error');
        }
      }
      gameOver();
    }
  }

  function levelComplete() {
    state.isRecalling = false;
    setStatus('LEVEL CLEAR', 'success');

    // Update sequence progress dots
    const dots = els.seqProgress.querySelectorAll('.seq-dot');
    dots.forEach(d => d.classList.add('done'));

    if (els.statusFill) {
      els.statusFill.style.width = '100%';
    }

    setTimeout(() => {
      state.currentLevel++;
      updateLevelDisplay();
      nextLevel();
    }, 1200);
  }

  function gameOver() {
    state.isRunning = false;
    state.isRecalling = false;

    // Screen shake
    document.querySelector('.game-panel').classList.add('shake');
    setTimeout(() => document.querySelector('.game-panel').classList.remove('shake'), 400);

    const finalLevel = state.currentLevel - 1;
    const accuracy = state.playerPattern.length > 0
      ? Math.round((state.playerPattern.filter((v, i) => v === (state.mode === 'sequence' || state.mode === 'chess' ? state.sequencePattern[i] : state.pattern[i])).length / state.pattern.length) * 100)
      : 0;

    saveStats(finalLevel, accuracy);

    // Show results
    setTimeout(() => {
      els.modalTitle.textContent = state.isDaily ? 'DAILY CHALLENGE COMPLETE' : 'OPERATION TERMINATED';
      els.finalLevel.textContent = finalLevel.toString().padStart(2, '0');
      els.finalSize.textContent = `${state.gridSize}×${state.gridSize}`;
      els.finalMode.textContent = state.mode.toUpperCase();
      els.finalAccuracy.textContent = accuracy + '%';

      if (state.isDaily) {
        els.dailyResult.hidden = false;
        const dailyStats = state.stats.daily || {};
        const today = new Date().toISOString().split('T')[0];
        const key = `${state.mode}-${state.gridSize}-${today}`;
        const isNewBest = !dailyStats[key] || finalLevel > dailyStats[key].level;
        els.dailyMessage.textContent = isNewBest
          ? `>> NEW DAILY RECORD: LEVEL ${finalLevel} <<`
          : `TODAY'S BEST: LEVEL ${dailyStats[key]?.level || '—'}`;
      } else {
        els.dailyResult.hidden = true;
      }

      els.resultsModal.hidden = false;
      els.replayBtn.hidden = true;
      els.restartBtn.hidden = false;
      setStatus('OPERATION TERMINATED', 'error');
    }, 800);
  }

  function replayPattern() {
    if (!state.isRunning) return;
    state.isRecalling = false;

    if (state.mode === 'sequence') {
      playSequenceStep(0);
    } else {
      renderGrid(true);
      highlightPattern();
    }
  }

  function saveStats(level, accuracy) {
    const modeKey = state.mode;
    if (!state.stats[modeKey]) {
      state.stats[modeKey] = { best: 0, total: 0, count: 0, games: 0, streak: 0, bestStreak: 0 };
    }
    const s = state.stats[modeKey];
    s.games++;
    s.count += level;
    s.total += accuracy;
    s.best = Math.max(s.best, level);

    // Streak (level >= 5)
    if (level >= 5) {
      s.streak++;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
    } else {
      s.streak = 0;
    }

    // High scores
    if (!state.highScores[modeKey]) state.highScores[modeKey] = {};
    const sizeKey = `${state.gridSize}x${state.gridSize}`;
    if (!state.highScores[modeKey][sizeKey]) state.highScores[modeKey][sizeKey] = [];

    state.highScores[modeKey][sizeKey].push({
      level,
      accuracy,
      date: new Date().toISOString().split('T')[0],
    });
    state.highScores[modeKey][sizeKey].sort((a, b) => b.level - a.level || b.accuracy - a.accuracy);
    state.highScores[modeKey][sizeKey] = state.highScores[modeKey][sizeKey].slice(0, 10);

    // Daily challenge
    if (state.isDaily) {
      const today = new Date().toISOString().split('T')[0];
      const key = `${modeKey}-${state.gridSize}-${today}`;
      if (!state.stats.daily) state.stats.daily = {};
      if (!state.stats.daily[key] || level > state.stats.daily[key].level) {
        state.stats.daily[key] = { level, accuracy, date: today };
      }
    }

    localStorage.setItem('memoryGridStats', JSON.stringify(state.stats));
    localStorage.setItem('memoryGridScores', JSON.stringify(state.highScores));

    updateStatsDisplay();
    updateLeaderboard();
  }

  function updateStatsDisplay() {
    const modes = ['classic', 'sequence', 'chess'];
    modes.forEach(mode => {
      const s = state.stats[mode];
      const el = document.getElementById(`best${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
      if (s) el.textContent = s.best ? s.best.toString().padStart(2, '0') : '—';
      else el.textContent = '—';
    });

    els.currentStreak.textContent = (state.stats.classic?.streak || 0).toString().padStart(2, '0');
    els.bestStreak.textContent = (state.stats.classic?.bestStreak || 0).toString().padStart(2, '0');
    els.gamesPlayed.textContent = Object.values(state.stats).reduce((sum, s) => sum + (s.games || 0), 0);

    // Daily best
    const daily = state.stats.daily || {};
    const today = new Date().toISOString().split('T')[0];
    const todayKey = `${state.mode}-${state.gridSize}-${today}`;
    els.dailyBest.textContent = daily[todayKey]?.level ? daily[todayKey].level.toString().padStart(2, '0') : '—';
  }

  function updateLeaderboard() {
    const modeKey = state.mode;
    const sizeKey = `${state.gridSize}x${state.gridSize}`;
    const scores = state.highScores[modeKey]?.[sizeKey] || [];

    if (scores.length === 0) {
      els.leaderboard.innerHTML = '<div class="leaderboard-empty">>> NO RECORDS <<</div>';
      return;
    }

    els.leaderboard.innerHTML = scores.map((s, i) => `
      <div class="leaderboard-entry">
        <span class="rank">#${i+1}</span>
        <span class="score">LVL ${s.level.toString().padStart(2, '0')}</span>
        <span class="mode">${s.accuracy}% • ${s.date}</span>
      </div>
    `).join('');
  }

  function updateLevelDisplay() {
    els.currentLevel.textContent = state.currentLevel.toString().padStart(2, '0');
  }

  function setStatus(text, type) {
    if (els.statusText) {
      els.statusText.textContent = text;
    }
    els.gameStatus.className = 'game-status ' + type;
    if (els.statusFill && type !== 'memorize' && type !== 'recall') {
      els.statusFill.style.width = type === 'success' ? '100%' : '0%';
    }
  }

  function shareResult() {
    const level = els.finalLevel.textContent;
    const mode = state.mode.toUpperCase();
    const size = `${state.gridSize}×${state.gridSize}`;
    const accuracy = els.finalAccuracy.textContent;
    const text = `MEMORY GRID [${mode}, ${size}]\nLEVEL: ${level} | ACCURACY: ${accuracy}\n#KING_YOSEF_`;
    if (navigator.share) {
      navigator.share({ title: 'Memory Grid Result', text });
    } else {
      navigator.clipboard.writeText(text).then(() => showToast('COPIED TO CLIPBOARD'));
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
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ===== Init =====
  init();
})();