// Number Puzzle — KING_YOSEF_
// 2048, Threes, Fibonacci, Powers of 3/5, Primes + Grid sizes, Undo, Themes, Stats, Leaderboards

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

  // ===== Hash for Daily Challenge =====
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // ===== Prime Numbers Generator =====
  function generatePrimes(limit) {
    const sieve = new Array(limit + 1).fill(true);
    sieve[0] = sieve[1] = false;
    for (let i = 2; i * i <= limit; i++) {
      if (sieve[i]) {
        for (let j = i * i; j <= limit; j += i) sieve[j] = false;
      }
    }
    return sieve.map((isPrime, i) => isPrime ? i : null).filter(x => x !== null);
  }

  const PRIMES = generatePrimes(1000);
  const PRIME_SET = new Set(PRIMES);

  // ===== Fibonacci Sequence =====
  function generateFibonacci(limit) {
    const fib = [1, 1];
    while (fib[fib.length - 1] + fib[fib.length - 2] <= limit) {
      fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
    }
    return fib;
  }

  const FIBONACCI = generateFibonacci(100000);
  const FIB_SET = new Set(FIBONACCI);

  // ===== Variant Definitions =====
  const VARIANTS = {
    '2048': {
      name: '2048',
      startTiles: [2, 2],
      spawnValues: [2, 4],
      spawnWeights: [0.9, 0.1],
      canMerge: (a, b) => a === b,
      mergeResult: (a, b) => a + b,
      targetTile: 2048,
      description: 'Classic 2048 — merge same numbers'
    },
    'threes': {
      name: 'Threes',
      startTiles: [1, 2, 3],
      spawnValues: [1, 2, 3],
      spawnWeights: [0.45, 0.45, 0.1],
      canMerge: (a, b) => {
        if (a === 1 && b === 2) return true;
        if (a === 2 && b === 1) return true;
        return a >= 3 && b >= 3 && a === b;
      },
      mergeResult: (a, b) => {
        if ((a === 1 && b === 2) || (a === 2 && b === 1)) return 3;
        return a + b;
      },
      targetTile: 6144,
      description: 'Threes! — 1+2=3, then merge 3+3=6, etc.'
    },
    'fibonacci': {
      name: 'Fibonacci',
      startTiles: [1, 1, 2],
      spawnValues: [1, 2],
      spawnWeights: [0.7, 0.3],
      canMerge: (a, b) => {
        const ia = FIBONACCI.indexOf(a);
        const ib = FIBONACCI.indexOf(b);
        return ia !== -1 && ib !== -1 && Math.abs(ia - ib) === 1;
      },
      mergeResult: (a, b) => {
        const ia = FIBONACCI.indexOf(a);
        const ib = FIBONACCI.indexOf(b);
        const maxIdx = Math.max(ia, ib);
        return FIBONACCI[maxIdx + 1] || a + b;
      },
      targetTile: 6765,
      description: 'Fibonacci — merge adjacent sequence numbers'
    },
    'powers3': {
      name: 'Powers of 3',
      startTiles: [3, 3],
      spawnValues: [3, 9],
      spawnWeights: [0.9, 0.1],
      canMerge: (a, b) => a === b,
      mergeResult: (a, b) => a + b,
      targetTile: 6561,
      description: 'Powers of 3 — 3, 9, 27, 81... reach 3⁸'
    },
    'powers5': {
      name: 'Powers of 5',
      startTiles: [5, 5],
      spawnValues: [5, 25],
      spawnWeights: [0.9, 0.1],
      canMerge: (a, b) => a === b,
      mergeResult: (a, b) => a + b,
      targetTile: 15625,
      description: 'Powers of 5 — 5, 25, 125, 625... reach 5⁶'
    },
    'primes': {
      name: 'Primes',
      startTiles: [2, 3],
      spawnValues: [2, 3, 5, 7, 11],
      spawnWeights: [0.3, 0.25, 0.2, 0.15, 0.1],
      canMerge: (a, b) => a === b,
      mergeResult: (a, b) => {
        const idx = PRIMES.indexOf(a);
        return PRIMES[idx + 1] || a + b;
      },
      targetTile: 997,
      description: 'Prime Numbers — merge to next prime'
    }
  };

  // ===== Tile Color Schemes per Variant =====
  const TILE_COLORS = {
    '2048': {
      0: { bg: 'var(--tile-0)', text: 'var(--tile-text)', border: 'transparent', shadow: 'transparent' },
      2: { bg: '#eee4da', text: '#776e65', border: '#e0d4c8', shadow: 'rgba(238, 228, 218, 0.4)' },
      4: { bg: '#ede0c8', text: '#776e65', border: '#dcc8b0', shadow: 'rgba(237, 224, 200, 0.4)' },
      8: { bg: '#f2b179', text: '#f9f6f2', border: '#e09c5e', shadow: 'rgba(242, 177, 121, 0.5)' },
      16: { bg: '#f59563', text: '#f9f6f2', border: '#e07d4a', shadow: 'rgba(245, 149, 99, 0.5)' },
      32: { bg: '#f67c5f', text: '#f9f6f2', border: '#e06545', shadow: 'rgba(246, 124, 95, 0.5)' },
      64: { bg: '#f65e3b', text: '#f9f6f2', border: '#e04525', shadow: 'rgba(246, 94, 59, 0.6)' },
      128: { bg: '#edcf72', text: '#f9f6f2', border: '#d8b85a', shadow: 'rgba(237, 207, 114, 0.5)' },
      256: { bg: '#edcc61', text: '#f9f6f2', border: '#d8b54a', shadow: 'rgba(237, 204, 97, 0.5)' },
      512: { bg: '#edc850', text: '#f9f6f2', border: '#d8b038', shadow: 'rgba(237, 200, 80, 0.6)' },
      1024: { bg: '#edc53f', text: '#f9f6f2', border: '#d8ad2a', shadow: 'rgba(237, 197, 63, 0.6)' },
      2048: { bg: '#edc22e', text: '#f9f6f2', border: '#d8a91c', shadow: 'rgba(237, 194, 46, 0.7)' },
      4096: { bg: '#3c3a32', text: '#f9f6f2', border: '#5a574d', shadow: 'rgba(60, 58, 50, 0.7)' },
      8192: { bg: '#3c3a32', text: '#f9f6f2', border: '#5a574d', shadow: 'rgba(60, 58, 50, 0.7)' },
      16384: { bg: '#3c3a32', text: '#f9f6f2', border: '#5a574d', shadow: 'rgba(60, 58, 50, 0.7)' }
    },
    'threes': {
      0: { bg: 'var(--tile-0)', text: 'var(--tile-text)', border: 'transparent', shadow: 'transparent' },
      1: { bg: '#e6e6e6', text: '#333333', border: '#cccccc', shadow: 'rgba(230, 230, 230, 0.4)' },
      2: { bg: '#ffcc00', text: '#333333', border: '#e6b800', shadow: 'rgba(255, 204, 0, 0.5)' },
      3: { bg: '#ff6600', text: '#ffffff', border: '#e65c00', shadow: 'rgba(255, 102, 0, 0.5)' },
      6: { bg: '#cc3300', text: '#ffffff', border: '#b32d00', shadow: 'rgba(204, 51, 0, 0.5)' },
      12: { bg: '#990000', text: '#ffffff', border: '#800000', shadow: 'rgba(153, 0, 0, 0.5)' },
      24: { bg: '#660000', text: '#ffffff', border: '#4d0000', shadow: 'rgba(102, 0, 0, 0.5)' },
      48: { bg: '#cc0066', text: '#ffffff', border: '#b3005c', shadow: 'rgba(204, 0, 102, 0.5)' },
      96: { bg: '#99004d', text: '#ffffff', border: '#800040', shadow: 'rgba(153, 0, 77, 0.5)' },
      192: { bg: '#660033', text: '#ffffff', border: '#4d0029', shadow: 'rgba(102, 0, 51, 0.5)' },
      384: { bg: '#cc00cc', text: '#ffffff', border: '#b300b3', shadow: 'rgba(204, 0, 204, 0.5)' },
      768: { bg: '#990099', text: '#ffffff', border: '#800080', shadow: 'rgba(153, 0, 153, 0.5)' },
      1536: { bg: '#660066', text: '#ffffff', border: '#4d004d', shadow: 'rgba(102, 0, 102, 0.5)' },
      3072: { bg: '#6600cc', text: '#ffffff', border: '#5500b3', shadow: 'rgba(102, 0, 204, 0.5)' },
      6144: { bg: '#330099', text: '#ffffff', border: '#290080', shadow: 'rgba(51, 0, 153, 0.6)' }
    },
    'fibonacci': {
      0: { bg: 'var(--tile-0)', text: 'var(--tile-text)', border: 'transparent', shadow: 'transparent' },
      1: { bg: '#ffebcc', text: '#8b6914', border: '#ffd9a3', shadow: 'rgba(255, 235, 204, 0.4)' },
      2: { bg: '#ffe0b3', text: '#8b6914', border: '#ffcc80', shadow: 'rgba(255, 224, 179, 0.4)' },
      3: { bg: '#ffd499', text: '#8b6914', border: '#ffbf80', shadow: 'rgba(255, 212, 153, 0.5)' },
      5: { bg: '#ffc87f', text: '#ffffff', border: '#ffb366', shadow: 'rgba(255, 200, 127, 0.5)' },
      8: { bg: '#ffbc66', text: '#ffffff', border: '#ffa34d', shadow: 'rgba(255, 188, 102, 0.5)' },
      13: { bg: '#ffb04d', text: '#ffffff', border: '#ff9433', shadow: 'rgba(255, 176, 77, 0.5)' },
      21: { bg: '#ffa433', text: '#ffffff', border: '#ff851a', shadow: 'rgba(255, 164, 51, 0.5)' },
      34: { bg: '#ff981a', text: '#ffffff', border: '#ff7600', shadow: 'rgba(255, 152, 26, 0.5)' },
      55: { bg: '#ff8c00', text: '#ffffff', border: '#e67e00', shadow: 'rgba(255, 140, 0, 0.6)' },
      89: { bg: '#e67e00', text: '#ffffff', border: '#cc6d00', shadow: 'rgba(230, 126, 0, 0.6)' },
      144: { bg: '#cc6d00', text: '#ffffff', border: '#b35c00', shadow: 'rgba(204, 109, 0, 0.6)' },
      233: { bg: '#b35c00', text: '#ffffff', border: '#994d00', shadow: 'rgba(179, 92, 0, 0.6)' },
      377: { bg: '#994d00', text: '#ffffff', border: '#803d00', shadow: 'rgba(153, 77, 0, 0.6)' },
      610: { bg: '#803d00', text: '#ffffff', border: '#662e00', shadow: 'rgba(128, 61, 0, 0.6)' },
      987: { bg: '#662e00', text: '#ffffff', border: '#4d1f00', shadow: 'rgba(102, 46, 0, 0.6)' },
      1597: { bg: '#4d1f00', text: '#ffffff', border: '#331300', shadow: 'rgba(77, 31, 0, 0.6)' },
      2584: { bg: '#331300', text: '#ffffff', border: '#1a0a00', shadow: 'rgba(51, 19, 0, 0.6)' },
      4181: { bg: '#1a0a00', text: '#ffffff', border: '#0d0500', shadow: 'rgba(26, 10, 0, 0.6)' },
      6765: { bg: '#0d0500', text: '#ffd700', border: '#ffd700', shadow: 'rgba(255, 215, 0, 0.8)' }
    },
    'powers3': {
      0: { bg: 'var(--tile-0)', text: 'var(--tile-text)', border: 'transparent', shadow: 'transparent' },
      3: { bg: '#cce5ff', text: '#004080', border: '#99ccff', shadow: 'rgba(204, 229, 255, 0.4)' },
      9: { bg: '#99ccff', text: '#003366', border: '#66b3ff', shadow: 'rgba(153, 204, 255, 0.4)' },
      27: { bg: '#66b3ff', text: '#ffffff', border: '#3399ff', shadow: 'rgba(102, 179, 255, 0.5)' },
      81: { bg: '#3399ff', text: '#ffffff', border: '#0080ff', shadow: 'rgba(51, 153, 255, 0.5)' },
      243: { bg: '#0080ff', text: '#ffffff', border: '#0066cc', shadow: 'rgba(0, 128, 255, 0.5)' },
      729: { bg: '#0066cc', text: '#ffffff', border: '#0052a3', shadow: 'rgba(0, 102, 204, 0.5)' },
      2187: { bg: '#0052a3', text: '#ffffff', border: '#003d7a', shadow: 'rgba(0, 82, 163, 0.5)' },
      6561: { bg: '#003d7a', text: '#ffffff', border: '#002952', shadow: 'rgba(0, 61, 122, 0.6)' }
    },
    'powers5': {
      0: { bg: 'var(--tile-0)', text: 'var(--tile-text)', border: 'transparent', shadow: 'transparent' },
      5: { bg: '#ffe4cc', text: '#8b4513', border: '#ffcc99', shadow: 'rgba(255, 228, 204, 0.4)' },
      25: { bg: '#ffcc99', text: '#8b4513', border: '#ffb366', shadow: 'rgba(255, 204, 153, 0.4)' },
      125: { bg: '#ffb366', text: '#ffffff', border: '#ff9933', shadow: 'rgba(255, 179, 102, 0.5)' },
      625: { bg: '#ff9933', text: '#ffffff', border: '#ff8000', shadow: 'rgba(255, 153, 51, 0.5)' },
      3125: { bg: '#ff8000', text: '#ffffff', border: '#e67300', shadow: 'rgba(255, 128, 0, 0.5)' },
      15625: { bg: '#e67300', text: '#ffffff', border: '#cc6600', shadow: 'rgba(230, 115, 0, 0.6)' }
    },
    'primes': {
      0: { bg: 'var(--tile-0)', text: 'var(--tile-text)', border: 'transparent', shadow: 'transparent' },
      2: { bg: '#ff6b6b', text: '#ffffff', border: '#ff4444', shadow: 'rgba(255, 107, 107, 0.5)' },
      3: { bg: '#ffa502', text: '#ffffff', border: '#ff9400', shadow: 'rgba(255, 165, 2, 0.5)' },
      5: { bg: '#ffd32a', text: '#333333', border: '#e6bf00', shadow: 'rgba(255, 211, 42, 0.5)' },
      7: { bg: '#32e0c4', text: '#333333', border: '#2accb0', shadow: 'rgba(50, 224, 196, 0.5)' },
      11: { bg: '#2ed573', text: '#ffffff', border: '#26bf62', shadow: 'rgba(46, 213, 115, 0.5)' },
      13: { bg: '#1e90ff', text: '#ffffff', border: '#157ae6', shadow: 'rgba(30, 144, 255, 0.5)' },
      17: { bg: '#a55eea', text: '#ffffff', border: '#9146d4', shadow: 'rgba(165, 94, 234, 0.5)' },
      19: { bg: '#ff4757', text: '#ffffff', border: '#e63242', shadow: 'rgba(255, 71, 87, 0.5)' },
      23: { bg: '#ff6348', text: '#ffffff', border: '#e64d32', shadow: 'rgba(255, 99, 72, 0.5)' },
      29: { bg: '#ff9f1a', text: '#ffffff', border: '#e68f00', shadow: 'rgba(255, 159, 26, 0.5)' },
      31: { bg: '#ee5a24', text: '#ffffff', border: '#d4451b', shadow: 'rgba(238, 90, 36, 0.5)' },
      37: { bg: '#009432', text: '#ffffff', border: '#007a29', shadow: 'rgba(0, 148, 50, 0.5)' },
      41: { bg: '#0652dd', text: '#ffffff', border: '#0542b3', shadow: 'rgba(6, 82, 221, 0.5)' },
      43: { bg: '#9980fa', text: '#333333', border: '#856af8', shadow: 'rgba(153, 128, 250, 0.5)' },
      47: { bg: '#f368e0', text: '#ffffff', border: '#e04ec9', shadow: 'rgba(243, 104, 224, 0.5)' },
      53: { bg: '#ff9ff3', text: '#333333', border: '#ff85e6', shadow: 'rgba(255, 159, 243, 0.5)' },
      59: { bg: '#54a0ff', text: '#ffffff', border: '#3d8cff', shadow: 'rgba(84, 160, 255, 0.5)' },
      61: { bg: '#5f27cd', text: '#ffffff', border: '#4a1fc4', shadow: 'rgba(95, 39, 205, 0.5)' },
      67: { bg: '#00d2d3', text: '#333333', border: '#00b8b9', shadow: 'rgba(0, 210, 211, 0.5)' },
      71: { bg: '#1dd1a1', text: '#333333', border: '#18b88e', shadow: 'rgba(29, 209, 161, 0.5)' },
      73: { bg: '#10ac84', text: '#ffffff', border: '#0e9672', shadow: 'rgba(16, 172, 132, 0.5)' },
      79: { bg: '#ee5253', text: '#ffffff', border: '#d43d3e', shadow: 'rgba(238, 82, 83, 0.5)' },
      83: { bg: '#0abde3', text: '#333333', border: '#09a8c9', shadow: 'rgba(10, 189, 227, 0.5)' },
      89: { bg: '#ffbe76', text: '#333333', border: '#ffad5c', shadow: 'rgba(255, 190, 118, 0.5)' },
      97: { bg: '#686de0', text: '#ffffff', border: '#4f54c8', shadow: 'rgba(104, 109, 224, 0.6)' }
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
    maxHistory: 10
  };

  // ===== DOM Elements =====
  const els = {
    board: document.getElementById('board'),
    currentScore: document.getElementById('currentScore'),
    bestScore: document.getElementById('bestScore'),
    variantTag: document.getElementById('variantTag'),
    dailyTag: document.getElementById('dailyTag'),
    moveCounter: document.getElementById('moveCounter'),
    statusBar: document.getElementById('statusBar'),
    newGameBtn: document.getElementById('newGameBtn'),
    undoBtn: document.getElementById('undoBtn'),
    dailyBtn: document.getElementById('dailyBtn'),
    dailyDate: document.getElementById('dailyDate'),
    shareBtn: document.getElementById('shareBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    resultModal: document.getElementById('resultModal'),
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
    newGameFromWinBtn: document.getElementById('newGameFromWinBtn'),
    modalClose: document.getElementById('modalClose'),
    statBestTile: document.getElementById('statBestTile'),
    statBestScore: document.getElementById('statBestScore'),
    statGamesPlayed: document.getElementById('statGamesPlayed'),
    statWinRate: document.getElementById('statWinRate'),
    statDailyWins: document.getElementById('statDailyWins'),
    statStreak: document.getElementById('statStreak'),
    leaderboard: document.getElementById('leaderboard'),
    themeSelect: document.getElementById('themeSelect'),
    miniBest: document.getElementById('miniBest'),
    miniGames: document.getElementById('miniGames')
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
    updateMiniStats();
  }

  function setupEventListeners() {
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        state.variant = btn.dataset.variant;
        els.variantTag.textContent = VARIANTS[state.variant].name.toUpperCase();
        newGame();
      });
    });

    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        state.gridSize = parseInt(btn.dataset.size, 10);
        newGame();
      });
    });

    // Theme select
    els.themeSelect.addEventListener('change', () => {
      document.body.dataset.theme = els.themeSelect.value;
      localStorage.setItem('numberPuzzleTheme', els.themeSelect.value);
      updateTheme();
    });

    // Action buttons
    els.newGameBtn.addEventListener('click', () => newGame(false));
    els.undoBtn.addEventListener('click', undoMove);
    els.dailyBtn.addEventListener('click', () => newGame(true));
    els.shareBtn.addEventListener('click', shareResult);
    els.playAgainBtn.addEventListener('click', () => {
      closeModals();
      newGame(state.isDaily);
    });
    els.shareBtnModal.addEventListener('click', shareResult);
    els.playAgainBtnModal.addEventListener('click', () => {
      closeModals();
      newGame(state.isDaily);
    });
    els.continueBtn.addEventListener('click', () => {
      closeModals();
      state.hasWon = true;
    });
    els.newGameFromWinBtn.addEventListener('click', () => {
      closeModals();
      newGame(state.isDaily);
    });
    els.modalClose.addEventListener('click', closeModals);

    // Close modal on backdrop click
    els.resultModal.addEventListener('click', (e) => {
      if (e.target === els.resultModal) closeModals();
    });
    els.winModal.addEventListener('click', (e) => {
      if (e.target === els.winModal) closeModals();
    });

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    // Touch
    els.board.addEventListener('touchstart', handleTouchStart, { passive: true });
    els.board.addEventListener('touchend', handleTouchEnd, { passive: true });
    els.board.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

    // Prevent context menu on board
    els.board.addEventListener('contextmenu', e => e.preventDefault());
  }

  function updateTheme() {
    document.body.dataset.theme = els.themeSelect.value;
  }

  function updateDailyDate() {
    const today = new Date();
    els.dailyDate.textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  }

  function closeModals() {
    els.resultModal.close();
    els.winModal.close();
  }

  function updateMiniStats() {
    const variantKey = `${state.variant}-${state.gridSize}`;
    const s = state.stats[variantKey] || { bestScore: 0, gamesPlayed: 0 };
    els.miniBest.querySelector('span').textContent = s.bestScore || 0;
    els.miniGames.querySelector('span').textContent = s.gamesPlayed || 0;
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
      els.dailyTag.classList.remove('hidden');
    } else {
      state.rng = mulberry32(Date.now());
      els.dailyTag.classList.add('hidden');
    }

    // Add initial tiles
    addRandomTile();
    addRandomTile();

    updateDisplay();
    els.statusBar.textContent = isDaily ? 'DAILY CHALLENGE — MAKE YOUR MOVES' : 'ARROW KEYS OR SWIPE TO MERGE TILES';
    els.statusBar.className = 'status-bar active';
    els.shareBtn.hidden = true;
    els.playAgainBtn.hidden = true;
    updateMiniStats();
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
    let newBestTile = state.bestTile;

    const processLine = (line) => {
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
        } else {
          result.push(tiles[i]);
          i++;
        }
      }

      while (result.length < line.length) result.push(0);
      return result;
    };

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
      state.history.push({
        grid: oldGrid,
        score: state.score,
        bestTile: state.bestTile,
        moves: state.moves
      });
      if (state.history.length > state.maxHistory) state.history.shift();

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
    els.statusBar.textContent = 'MOVE UNDONE';
    els.statusBar.className = 'status-bar active';
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

    if (Math.max(absDx, absDy) < 30) return;

    if (absDx > absDy) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
  }

  // ===== Display =====
  function updateDisplay() {
    renderBoard();
    els.currentScore.textContent = state.score;
    els.bestScore.textContent = state.bestScore;
    els.moveCounter.textContent = `MOVES: ${state.moves}`;
    updateMiniStats();
  }

  function renderBoard() {
    const board = els.board;
    board.innerHTML = '';
    board.dataset.size = state.gridSize;

    for (let i = 0; i < state.gridSize; i++) {
      for (let j = 0; j < state.gridSize; j++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        const value = state.grid[i][j];

        if (value === 0) {
          tile.classList.add('empty');
          tile.style.setProperty('--tile-bg', getTileColor(0).bg);
          tile.style.setProperty('--tile-text', getTileColor(0).text);
          tile.style.setProperty('--tile-border', getTileColor(0).border);
          tile.style.setProperty('--tile-shadow', getTileColor(0).shadow);
          tile.textContent = '';
        } else {
          tile.dataset.value = value;
          tile.textContent = formatNumber(value);

          const colors = getTileColor(value);
          tile.style.setProperty('--tile-bg', colors.bg);
          tile.style.setProperty('--tile-text', colors.text);
          tile.style.setProperty('--tile-border', colors.border);
          tile.style.setProperty('--tile-shadow', colors.shadow);
        }

        board.appendChild(tile);
      }
    }

    // Trigger animations for new/merged tiles
    requestAnimationFrame(() => {
      board.querySelectorAll('.tile.new, .tile.merged').forEach(t => {
        t.classList.remove('new', 'merged');
      });
    });
  }

  function getTileColor(value) {
    const variantColors = TILE_COLORS[state.variant] || TILE_COLORS['2048'];
    return variantColors[value] || variantColors[0];
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
    if (num >= 1000) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return num.toString();
  }

  function showWinModal() {
    els.winModal.showModal();
    els.statusBar.textContent = `TARGET ${VARIANTS[state.variant].targetTile} REACHED!`;
    els.statusBar.className = 'status-bar win';
  }

  function gameOver() {
    state.isPlaying = false;
    const timeTaken = Math.round((Date.now() - state.startTime) / 1000);
    const won = state.hasWon;

    saveStats(won, timeTaken);

    els.modalTitle.textContent = won ? 'VICTORY' : 'GAME OVER';
    els.finalScore.textContent = state.score;
    els.finalBestTile.textContent = state.bestTile;
    els.finalMoves.textContent = state.moves;
    els.finalTime.textContent = formatTime(timeTaken);

    if (state.isDaily) {
      els.dailyResult.classList.remove('hidden');
      const dailyStats = state.stats.daily || {};
      const today = new Date().toISOString().split('T')[0];
      const key = `${state.variant}-${state.gridSize}-${today}`;
      const isNewBest = !dailyStats[key] || state.score > dailyStats[key].score;
      els.dailyMessage.textContent = isNewBest
        ? `NEW DAILY BEST! SCORE: ${state.score}`
        : `TODAY'S BEST: ${dailyStats[key]?.score || '—'}`;
    } else {
      els.dailyResult.classList.add('hidden');
    }

    els.resultModal.showModal();
    els.shareBtn.hidden = false;
    els.playAgainBtn.hidden = false;
    els.statusBar.textContent = won ? 'CONGRATULATIONS — YOU WON!' : 'NO MOVES LEFT — GAME OVER';
    els.statusBar.className = won ? 'status-bar win' : 'status-bar over';
  }

  function formatTime(seconds) {
    if (seconds < 60) return `${seconds}S`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}M ${secs.toString().padStart(2, '0')}S`;
  }

  // ===== Stats & Leaderboard =====
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
    updateMiniStats();
  }

  function loadStats() {
    // Load saved theme
    const savedTheme = localStorage.getItem('numberPuzzleTheme');
    if (savedTheme) {
      els.themeSelect.value = savedTheme;
      document.body.dataset.theme = savedTheme;
    }
  }

  function updateStatsDisplay() {
    const variantKey = `${state.variant}-${state.gridSize}`;
    const s = state.stats[variantKey] || { bestTile: 0, bestScore: 0, gamesPlayed: 0, wins: 0, dailyWins: 0, streak: 0 };

    els.statBestTile.textContent = s.bestTile || 0;
    els.statBestScore.textContent = s.bestScore || 0;
    els.statGamesPlayed.textContent = s.gamesPlayed || 0;
    els.statWinRate.textContent = s.gamesPlayed ? Math.round((s.wins / s.gamesPlayed) * 100) + '%' : '0%';
    els.statDailyWins.textContent = s.dailyWins || 0;
    els.statStreak.textContent = s.streak || 0;
  }

  function updateLeaderboard() {
    const variantKey = `${state.variant}-${state.gridSize}`;
    const scores = state.leaderboard[variantKey] || [];

    if (scores.length === 0) {
      els.leaderboard.innerHTML = '<div class="lb-entry" style="grid-column:1/-1;text-align:center;color:var(--muted);">NO SCORES YET</div>';
      return;
    }

    els.leaderboard.innerHTML = scores.map((s, i) => `
      <div class="lb-entry ${s.won ? 'won' : ''}">
        <span class="lb-rank">#${i + 1}</span>
        <span class="lb-score">${s.score} <span style="color:var(--muted);font-weight:400;">(${s.bestTile})</span></span>
        <span class="lb-meta">${s.moves} MOVES · ${formatTime(s.time)} · ${s.date}</span>
      </div>
    `).join('');
  }

  // ===== Share =====
  function shareResult() {
    const variant = VARIANTS[state.variant].name;
    const size = `${state.gridSize}×${state.gridSize}`;
    const text = `🔢 NUMBER PUZZLE (${variant.toUpperCase()}, ${size})
SCORE: ${state.score} | BEST TILE: ${state.bestTile}
MOVES: ${state.moves} | TIME: ${formatTime(Math.round((Date.now() - state.startTime) / 1000))}
${state.isDaily ? '📅 DAILY CHALLENGE' : ''}
#KING_YOSEF_`;

    if (navigator.share) {
      navigator.share({ title: 'Number Puzzle Result', text });
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