// Chess Puzzles - Tactical training with daily challenges
// Features: Mate in 1/2/3, Forks, Pins, Skewers, Discovery, Sacrifice
// Daily challenges, local leaderboards, PGN export, board themes

(() => {
  'use strict';

  // ============================================
  // SEEDED PRNG (Mulberry32) for daily puzzles
  // ============================================
  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function getDailySeed() {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  }

  function getDailyRandom() {
    return mulberry32(getDailySeed());
  }

  // ============================================
  // CHESS ENGINE - Board representation & move validation
  // ============================================
  const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
  const PIECE_SYMBOLS = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
  };

  function createBoard() {
    const board = Array(64).fill(null);
    // Black pieces (rank 8, 7)
    board[0] = 'br'; board[1] = 'bn'; board[2] = 'bb'; board[3] = 'bq';
    board[4] = 'bk'; board[5] = 'bb'; board[6] = 'bn'; board[7] = 'br';
    for (let i = 8; i < 16; i++) board[i] = 'bp';
    // White pieces (rank 2, 1)
    for (let i = 48; i < 56; i++) board[i] = 'wp';
    board[56] = 'wr'; board[57] = 'wn'; board[58] = 'wb'; board[59] = 'wq';
    board[60] = 'wk'; board[61] = 'wb'; board[62] = 'wn'; board[63] = 'wr';
    return board;
  }

  function fenToBoard(fen) {
    const board = Array(64).fill(null);
    const rows = fen.split(' ')[0].split('/');
    let idx = 0;
    for (const row of rows) {
      for (const ch of row) {
        if (ch >= '1' && ch <= '8') {
          idx += parseInt(ch);
        } else {
          const color = ch === ch.toUpperCase() ? 'w' : 'b';
          board[idx++] = color + ch.toLowerCase();
        }
      }
    }
    return board;
  }

  function boardToFen(board, turn = 'w', castling = 'KQkq', ep = '-', halfmove = 0, fullmove = 1) {
    let fen = '';
    for (let rank = 0; rank < 8; rank++) {
      let empty = 0;
      for (let file = 0; file < 8; file++) {
        const piece = board[rank * 8 + file];
        if (piece) {
          if (empty > 0) { fen += empty; empty = 0; }
          const sym = piece[1].toUpperCase();
          fen += piece[0] === 'w' ? sym : sym.toLowerCase();
        } else {
          empty++;
        }
      }
      if (empty > 0) fen += empty;
      if (rank < 7) fen += '/';
    }
    return `${fen} ${turn} ${castling} ${ep} ${halfmove} ${fullmove}`;
  }

  function inBounds(idx) { return idx >= 0 && idx < 64; }
  function rank(idx) { return Math.floor(idx / 8); }
  function file(idx) { return idx % 8; }
  function square(r, f) { return r * 8 + f; }

  function getMoves(board, color) {
    const moves = [];
    const oppColor = color === 'w' ? 'b' : 'w';
    for (let i = 0; i < 64; i++) {
      const piece = board[i];
      if (!piece || piece[0] !== color) continue;
      const type = piece[1];
      const r = rank(i), f = file(i);

      if (type === 'p') {
        const dir = color === 'w' ? -1 : 1;
        const startRank = color === 'w' ? 6 : 1;
        // Forward
        const one = square(r + dir, f);
        if (inBounds(one) && !board[one]) {
          moves.push({ from: i, to: one, promotion: rank(one) === 0 || rank(one) === 7 });
          // Double
          if (r === startRank) {
            const two = square(r + 2 * dir, f);
            if (!board[two]) moves.push({ from: i, to: two, double: true });
          }
        }
        // Captures
        for (const df of [-1, 1]) {
          const cap = square(r + dir, f + df);
          if (inBounds(cap) && board[cap] && board[cap][0] === oppColor) {
            moves.push({ from: i, to: cap, promotion: rank(cap) === 0 || rank(cap) === 7 });
          }
        }
      } else if (type === 'n') {
        const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        for (const [dr, df] of knightMoves) {
          const to = square(r + dr, f + df);
          if (inBounds(to) && (!board[to] || board[to][0] === oppColor)) {
            moves.push({ from: i, to });
          }
        }
      } else if (type === 'b') {
        for (const [dr, df] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
          for (let step = 1; step < 8; step++) {
            const to = square(r + dr * step, f + df * step);
            if (!inBounds(to)) break;
            if (!board[to]) {
              moves.push({ from: i, to });
            } else {
              if (board[to][0] === oppColor) moves.push({ from: i, to });
              break;
            }
          }
        }
      } else if (type === 'r') {
        for (const [dr, df] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          for (let step = 1; step < 8; step++) {
            const to = square(r + dr * step, f + df * step);
            if (!inBounds(to)) break;
            if (!board[to]) {
              moves.push({ from: i, to });
            } else {
              if (board[to][0] === oppColor) moves.push({ from: i, to });
              break;
            }
          }
        }
      } else if (type === 'q') {
        for (const [dr, df] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) {
          for (let step = 1; step < 8; step++) {
            const to = square(r + dr * step, f + df * step);
            if (!inBounds(to)) break;
            if (!board[to]) {
              moves.push({ from: i, to });
            } else {
              if (board[to][0] === oppColor) moves.push({ from: i, to });
              break;
            }
          }
        }
      } else if (type === 'k') {
        for (const [dr, df] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
          const to = square(r + dr, f + df);
          if (inBounds(to) && (!board[to] || board[to][0] === oppColor)) {
            moves.push({ from: i, to });
          }
        }
      }
    }
    return moves;
  }

  function makeMove(board, move, promotion = 'q') {
    const newBoard = [...board];
    const piece = newBoard[move.from];
    newBoard[move.to] = move.promotion ? piece[0] + promotion : piece;
    newBoard[move.from] = null;
    // Handle en passant (simplified - not fully implemented)
    return newBoard;
  }

  function isInCheck(board, color) {
    const kingIdx = board.findIndex(p => p === color + 'k');
    if (kingIdx === -1) return false;
    const oppColor = color === 'w' ? 'b' : 'w';
    const oppMoves = getMoves(board, oppColor);
    return oppMoves.some(m => m.to === kingIdx);
  }

  function isCheckmate(board, color) {
    if (!isInCheck(board, color)) return false;
    const moves = getMoves(board, color);
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      if (!isInCheck(newBoard, color)) return false;
    }
    return true;
  }

  function squareToAlg(idx) {
    return String.fromCharCode(97 + file(idx)) + (8 - rank(idx));
  }

  function algToSquare(alg) {
    return square(8 - parseInt(alg[1]), alg.charCodeAt(0) - 97);
  }

  function moveToSan(board, move) {
    const piece = board[move.from];
    const captured = board[move.to];
    const type = piece[1];
    let san = '';

    if (type === 'k') {
      san = 'K';
    } else if (type === 'q') {
      san = 'Q';
    } else if (type === 'r') {
      san = 'R';
    } else if (type === 'b') {
      san = 'B';
    } else if (type === 'n') {
      san = 'N';
    } else {
      san = '';
    }

    if (captured) {
      if (type === 'p') san += squareToAlg(move.from)[0];
      san += 'x';
    }

    san += squareToAlg(move.to);

    if (move.promotion) {
      san += '=' + move.promotion.toUpperCase();
    }

    // Check/checkmate detection would need the new board
    return san;
  }

  // ============================================
  // PUZZLE DATABASE
  // ============================================
  const PUZZLES = {
    mate1: [
      // Mate in 1 puzzles
      { fen: '8/8/8/4k3/3Q4/8/8/4K3 w - - 0 1', solution: ['Qe4#'], theme: 'mate1', difficulty: 'easy', name: 'Queen Mate' },
      { fen: '8/8/8/4k3/3R4/8/8/4K3 w - - 0 1', solution: ['Re4#'], theme: 'mate1', difficulty: 'easy', name: 'Rook Mate' },
      { fen: '8/8/8/4k3/3B4/8/8/4K3 w - - 0 1', solution: ['Be4#'], theme: 'mate1', difficulty: 'easy', name: 'Bishop Mate' },
      { fen: '8/8/8/4k3/3N4/8/8/4K3 w - - 0 1', solution: ['Ne4#'], theme: 'mate1', difficulty: 'easy', name: 'Knight Mate' },
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['Qxf7#'], theme: 'mate1', difficulty: 'easy', name: 'Scholar\'s Mate' },
      { fen: '8/8/8/4k3/8/3Q4/8/4K3 w - - 0 1', solution: ['Qd5#'], theme: 'mate1', difficulty: 'easy', name: 'Queen Box Mate' },
      { fen: '8/8/8/4k3/8/3R4/8/4K3 w - - 0 1', solution: ['Rd5#'], theme: 'mate1', difficulty: 'easy', name: 'Rook Box Mate' },
      { fen: '8/8/8/4k3/8/8/3Q4/4K3 w - - 0 1', solution: ['Qd6#'], theme: 'mate1', difficulty: 'easy', name: 'Smothered Queen' },
      { fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1', solution: ['Qh5#'], theme: 'mate1', difficulty: 'easy', name: 'Fool\'s Mate' },
      { fen: '8/8/8/4k3/3P4/8/8/4K3 w - - 0 1', solution: ['e4#'], theme: 'mate1', difficulty: 'easy', name: 'Pawn Mate' },
    ],
    mate2: [
      { fen: '8/8/8/4k3/3Q4/8/8/4K3 w - - 0 1', solution: ['Qd5', 'Qe4#'], theme: 'mate2', difficulty: 'medium', name: 'Queen Approach' },
      { fen: '8/8/8/4k3/3R4/8/8/4K3 w - - 0 1', solution: ['Rd5', 'Re4#'], theme: 'mate2', difficulty: 'medium', name: 'Rook Approach' },
      { fen: '8/8/8/4k3/8/3Q4/8/4K3 w - - 0 1', solution: ['Qd6', 'Qd5#'], theme: 'mate2', difficulty: 'medium', name: 'Box Mate 2' },
      { fen: '8/8/8/4k3/8/8/3R4/4K3 w - - 0 1', solution: ['Rd6', 'Rd5#'], theme: 'mate2', difficulty: 'medium', name: 'Rook Box 2' },
      { fen: '8/8/8/4k3/3B4/8/8/4K3 w - - 0 1', solution: ['Bd5', 'Be4#'], theme: 'mate2', difficulty: 'medium', name: 'Bishop Mate 2' },
      { fen: '8/8/8/4k3/3N4/8/8/4K3 w - - 0 1', solution: ['Nd5', 'Ne7#'], theme: 'mate2', difficulty: 'medium', name: 'Knight Mate 2' },
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['Qxf7+', 'Kxf7', 'Bc4#'], theme: 'mate2', difficulty: 'medium', name: 'Sacrifice Mate' },
    ],
    mate3: [
      { fen: '8/8/8/4k3/8/3Q4/8/4K3 w - - 0 1', solution: ['Qd6', 'Kc5', 'Qd5#'], theme: 'mate3', difficulty: 'hard', name: 'King Hunt' },
      { fen: '8/8/8/4k3/8/3R4/8/4K3 w - - 0 1', solution: ['Rd6', 'Kc5', 'Rd5#'], theme: 'mate3', difficulty: 'hard', name: 'Rook Hunt' },
      { fen: '8/8/8/4k3/3B4/8/8/4K3 w - - 0 1', solution: ['Bd5', 'Kc5', 'Be4#'], theme: 'mate3', difficulty: 'hard', name: 'Bishop Hunt' },
    ],
    fork: [
      { fen: '8/8/8/3k4/8/2N5/8/4K3 w - - 0 1', solution: ['Ne5+'], theme: 'fork', difficulty: 'easy', name: 'Knight Fork King+Queen' },
      { fen: '8/8/8/3k4/8/2N5/8/4K3 w - - 0 1', solution: ['Nc5+'], theme: 'fork', difficulty: 'easy', name: 'Knight Fork King+Rook' },
      { fen: '8/8/8/3k4/8/2N5/8/4K3 w - - 0 1', solution: ['Nd6+'], theme: 'fork', difficulty: 'medium', name: 'Knight Fork Family' },
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['Nxe5'], theme: 'fork', difficulty: 'medium', name: 'Opening Fork' },
    ],
    pin: [
      { fen: '8/8/8/3k4/3b4/8/8/4K3 w - - 0 1', solution: ['Bd5'], theme: 'pin', difficulty: 'easy', name: 'Absolute Pin' },
      { fen: '8/8/8/3k4/3b4/8/8/4K3 w - - 0 1', solution: ['Rd1'], theme: 'pin', difficulty: 'medium', name: 'Rook Pin' },
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1', solution: ['Bg5'], theme: 'pin', difficulty: 'medium', name: 'Opening Pin' },
    ],
    skewer: [
      { fen: '8/8/8/3k4/8/8/8/4K2R w - - 0 1', solution: ['Rd8+'], theme: 'skewer', difficulty: 'easy', name: 'Rook Skewer' },
      { fen: '8/8/8/3k4/8/8/8/4K2B w - - 0 1', solution: ['Bd8+'], theme: 'skewer', difficulty: 'easy', name: 'Bishop Skewer' },
      { fen: '8/8/8/3k4/8/8/8/4K1QR w - - 0 1', solution: ['Qd8+'], theme: 'skewer', difficulty: 'medium', name: 'Queen Skewer' },
    ],
    discovery: [
      { fen: '8/8/8/3k4/8/2N5/8/4K2B w - - 0 1', solution: ['Ne5+'], theme: 'discovery', difficulty: 'medium', name: 'Discovered Attack' },
      { fen: '8/8/8/3k4/8/2B5/8/4K2R w - - 0 1', solution: ['Bd5+'], theme: 'discovery', difficulty: 'medium', name: 'Discovered Check' },
    ],
    sacrifice: [
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['Qxf7+'], theme: 'sacrifice', difficulty: 'medium', name: 'Queen Sacrifice' },
      { fen: '8/8/8/4k3/3R4/8/8/4K3 w - - 0 1', solution: ['Rf7+'], theme: 'sacrifice', difficulty: 'hard', name: 'Rook Sacrifice' },
      { fen: '8/8/8/4k3/3B4/8/8/4K3 w - - 0 1', solution: ['Bf7+'], theme: 'sacrifice', difficulty: 'hard', name: 'Bishop Sacrifice' },
    ],
  };

  // Flatten all puzzles for easy filtering
  const ALL_PUZZLES = [];
  for (const [theme, puzzles] of Object.entries(PUZZLES)) {
    for (const p of puzzles) {
      ALL_PUZZLES.push({ ...p, theme });
    }
  }

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  let state = {
    board: createBoard(),
    currentPuzzle: null,
    selectedSquare: null,
    validMoves: [],
    playerColor: 'w',
    flipped: false,
    moveHistory: [],
    puzzleMoves: [],
    currentMoveIndex: 0,
    isDaily: false,
    startTime: null,
    timerInterval: null,
    hintUsed: false,
    showSolution: false,
    gameStatus: 'idle', // idle, active, solved, failed
    stats: loadStats(),
    boardTheme: 'classic',
    difficulty: 'easy',
    selectedTheme: 'all',
  };

  function loadStats() {
    try {
      const saved = localStorage.getItem('chessPuzzlesStats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      puzzlesSolved: 0,
      puzzlesAttempted: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalTime: 0,
      dailySolved: 0,
      lastDailyDate: null,
      leaderboard: [],
    };
  }

  function saveStats() {
    localStorage.setItem('chessPuzzlesStats', JSON.stringify(state.stats));
  }

  function addToLeaderboard(entry) {
    state.stats.leaderboard.push({
      ...entry,
      date: new Date().toISOString().split('T')[0],
      time: Date.now(),
    });
    state.stats.leaderboard.sort((a, b) => {
      // Sort by score (puzzles solved), then by time
      if (b.score !== a.score) return b.score - a.score;
      return a.time - b.time;
    });
    if (state.stats.leaderboard.length > 50) state.stats.leaderboard = state.stats.leaderboard.slice(0, 50);
    saveStats();
  }

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const els = {
    bubbles: document.getElementById('bubbles'),
    boardContainer: document.getElementById('boardContainer'),
    gameStatus: document.getElementById('gameStatus'),
    timer: document.getElementById('timer'),
    puzzleLabel: document.getElementById('puzzleLabel'),
    puzzleMeta: document.getElementById('puzzleMeta'),
    moveList: document.getElementById('moveList'),
    moves: document.getElementById('moves'),
    newBtn: document.getElementById('newBtn'),
    dailyBtn: document.getElementById('dailyBtn'),
    hintBtn: document.getElementById('hintBtn'),
    dailyDate: document.getElementById('dailyDate'),
    showSolutionBtn: document.getElementById('showSolutionBtn'),
    flipBoardBtn: document.getElementById('flipBoardBtn'),
    copyFenBtn: document.getElementById('copyFenBtn'),
    copyPgnBtn: document.getElementById('copyPgnBtn'),
    shareBtn: document.getElementById('shareBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    resultsModal: document.getElementById('resultsModal'),
    modalTitle: document.getElementById('modalTitle'),
    resultStatus: document.getElementById('resultStatus'),
    finalTime: document.getElementById('finalTime'),
    finalMoves: document.getElementById('finalMoves'),
    hintUsed: document.getElementById('hintUsed'),
    dailyResult: document.getElementById('dailyResult'),
    dailyMessage: document.getElementById('dailyMessage'),
    solutionDisplay: document.getElementById('solutionDisplay'),
    solutionMoves: document.getElementById('solutionMoves'),
    shareBtnModal: document.getElementById('shareBtnModal'),
    playAgainBtnModal: document.getElementById('playAgainBtnModal'),
    puzzlesSolved: document.getElementById('puzzlesSolved'),
    accuracy: document.getElementById('accuracy'),
    currentStreak: document.getElementById('currentStreak'),
    bestStreak: document.getElementById('bestStreak'),
    avgTime: document.getElementById('avgTime'),
    dailySolved: document.getElementById('dailySolved'),
    leaderboard: document.getElementById('leaderboard'),
    boardTheme: document.getElementById('boardTheme'),
    difficultyTabs: document.querySelectorAll('[data-difficulty]'),
    themeTabs: document.querySelectorAll('[data-theme]'),
  };

  // ============================================
  // BUBBLE ANIMATION
  // ============================================
  function spawnBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'float';
    const colors = ['#ff4fa3', '#ff9f1c', '#2ee6a6', '#35c3ff', '#9b5cff'];
    const c = colors[Math.floor(Math.random() * colors.length)];
    bubble.style.setProperty('--c', c);
    bubble.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
    bubble.style.setProperty('--duration', (15 + Math.random() * 20) + 's');
    bubble.style.left = Math.random() * 100 + 'vw';
    bubble.style.width = bubble.style.height = (10 + Math.random() * 40) + 'px';
    els.bubbles.appendChild(bubble);
    setTimeout(() => bubble.remove(), 35000);
  }

  setInterval(spawnBubble, 800);

  // ============================================
  // BOARD RENDERING
  // ============================================
  function renderBoard() {
    const board = state.board;
    const flipped = state.flipped;

    let html = '<div class="chess-board" data-board-theme="' + state.boardTheme + '">';

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const displayRank = flipped ? r : 7 - r;
        const displayFile = flipped ? 7 - f : f;
        const idx = displayRank * 8 + displayFile;
        const piece = board[idx];
        const isLight = (r + f) % 2 === 0;
        const squareClass = 'square ' + (isLight ? 'light' : 'dark');
        const alg = squareToAlg(idx);

        let extraClass = '';
        if (idx === state.selectedSquare) extraClass += ' selected';
        if (state.validMoves.some(m => m.to === idx)) extraClass += ' hint';
        if (state.lastMove && (state.lastMove.from === idx || state.lastMove.to === idx)) extraClass += ' last-move';
        if (state.checkSquare === idx) extraClass += ' check';

        html += `<div class="${squareClass} ${extraClass}" data-square="${idx}" data-alg="${alg}">`;

        if (piece) {
          const color = piece[0];
          const type = piece[1];
          const symbol = PIECE_SYMBOLS[color][type];
          const shadow = color === 'w' ? 'var(--piece-white-shadow)' : 'var(--piece-black-shadow)';
          html += `<span class="piece" style="--piece-shadow: ${shadow};">${symbol}</span>`;
        }

        html += '</div>';
      }
    }

    html += '</div>';
    els.boardContainer.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.square').forEach(sq => {
      sq.addEventListener('click', () => handleSquareClick(parseInt(sq.dataset.square)));
    });
  }

  // ============================================
  // PUZZLE LOGIC
  // ============================================
  function getFilteredPuzzles() {
    return ALL_PUZZLES.filter(p => {
      const diffMatch = state.difficulty === 'mixed' || p.difficulty === state.difficulty;
      const themeMatch = state.selectedTheme === 'all' || p.theme === state.selectedTheme;
      return diffMatch && themeMatch;
    });
  }

  function selectRandomPuzzle() {
    const filtered = getFilteredPuzzles();
    if (filtered.length === 0) return null;
    const rand = Math.floor(Math.random() * filtered.length);
    return filtered[rand];
  }

  function selectDailyPuzzle() {
    const filtered = getFilteredPuzzles();
    if (filtered.length === 0) return null;
    const dailyRand = getDailyRandom();
    const idx = Math.floor(dailyRand() * filtered.length);
    return filtered[idx];
  }

  function loadPuzzle(puzzle, isDaily = false) {
    state.currentPuzzle = puzzle;
    state.isDaily = isDaily;
    state.board = fenToBoard(puzzle.fen);
    state.playerColor = puzzle.fen.split(' ')[1] === 'w' ? 'w' : 'b';
    state.selectedSquare = null;
    state.validMoves = [];
    state.moveHistory = [];
    state.puzzleMoves = puzzle.solution || [];
    state.currentMoveIndex = 0;
    state.hintUsed = false;
    state.showSolution = false;
    state.gameStatus = 'active';
    state.startTime = Date.now();
    state.lastMove = null;
    state.checkSquare = null;

    // Update UI
    els.puzzleLabel.textContent = isDaily ? 'Daily Challenge' : 'Practice Mode';
    els.puzzleMeta.textContent = `${capitalize(puzzle.difficulty)} • ${capitalize(puzzle.theme.replace('mate', 'Mate '))}`;
    els.gameStatus.textContent = `Find the best move${puzzle.solution && puzzle.solution.length > 1 ? 's' : ''}!`;
    els.gameStatus.className = 'game-status active';
    els.moveList.hidden = true;
    els.moves.innerHTML = '';
    els.showSolutionBtn.hidden = true;
    els.copyPgnBtn.hidden = true;
    els.shareBtn.hidden = true;
    els.playAgainBtn.hidden = true;
    els.dailyResult.hidden = true;
    els.solutionDisplay.hidden = true;

    // Update daily button text
    const today = new Date().toISOString().split('T')[0];
    els.dailyDate.textContent = today;
    els.dailyBtn.textContent = isDaily ? 'Today\'s Puzzle (Active)' : 'Play Today\'s Puzzle';
    els.dailyBtn.disabled = isDaily && state.stats.lastDailyDate === today;

    renderBoard();
    startTimer();
  }

  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
  }

  function updateTimer() {
    if (!state.startTime) return;
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    els.timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function formatTime(ms) {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    return `${mins}:${(secs % 60).toString().padStart(2, '0')}`;
  }

  // ============================================
  // MOVE HANDLING
  // ============================================
  function handleSquareClick(idx) {
    if (state.gameStatus !== 'active') return;

    const piece = state.board[idx];

    // If we have a selected square
    if (state.selectedSquare !== null) {
      // Check if clicking on a valid move
      const move = state.validMoves.find(m => m.to === idx);
      if (move) {
        makePlayerMove(move);
        return;
      }

      // Clicking on own piece - change selection
      if (piece && piece[0] === state.playerColor) {
        state.selectedSquare = idx;
        state.validMoves = getMoves(state.board, state.playerColor).filter(m => m.from === idx);
        renderBoard();
        return;
      }

      // Clicking elsewhere - deselect
      state.selectedSquare = null;
      state.validMoves = [];
      renderBoard();
      return;
    }

    // No selection - select if own piece
    if (piece && piece[0] === state.playerColor) {
      state.selectedSquare = idx;
      state.validMoves = getMoves(state.board, state.playerColor).filter(m => m.from === idx);
      renderBoard();
    }
  }

  function makePlayerMove(move) {
    const san = moveToSan(state.board, move);
    state.board = makeMove(state.board, move);
    state.moveHistory.push({ move, san, fen: boardToFen(state.board) });
    state.lastMove = { from: move.from, to: move.to };

    // Check if this matches the puzzle solution
    const expectedMove = state.puzzleMoves[state.currentMoveIndex];
    const isCorrect = checkMoveCorrect(move, expectedMove);

    if (isCorrect) {
      state.currentMoveIndex++;
      state.validMoves = [];
      state.selectedSquare = null;

      if (state.currentMoveIndex >= state.puzzleMoves.length) {
        // Puzzle solved!
        puzzleSolved();
      } else {
        // More moves needed - make opponent move (simplified)
        makeOpponentMove();
      }
    } else {
      // Wrong move
      puzzleFailed();
    }

    renderBoard();
  }

  function checkMoveCorrect(move, expectedSan) {
    // Simplified - just check if the move matches expected SAN
    const moveSan = moveToSan(state.board, move);
    return moveSan === expectedSan || moveSan.replace(/[#+]/g, '') === expectedSan.replace(/[#+]/g, '');
  }

  function makeOpponentMove() {
    // For puzzles, the opponent usually has forced moves
    // In a real implementation, this would use the puzzle's solution line
    // For now, we'll just make a random legal move for demo
    const oppColor = state.playerColor === 'w' ? 'b' : 'w';
    const moves = getMoves(state.board, oppColor);
    if (moves.length > 0) {
      // Try to find a move that matches the next expected move in solution
      const nextExpected = state.puzzleMoves[state.currentMoveIndex];
      // This is simplified - in reality we'd parse the full solution line
      const move = moves[0];
      state.board = makeMove(state.board, move);
      state.lastMove = { from: move.from, to: move.to };
      state.currentMoveIndex++;

      if (state.currentMoveIndex >= state.puzzleMoves.length) {
        puzzleSolved();
      }
    }
    renderBoard();
  }

  function puzzleSolved() {
    state.gameStatus = 'solved';
    stopTimer();
    const elapsed = Date.now() - state.startTime;

    // Update stats
    state.stats.puzzlesSolved++;
    state.stats.puzzlesAttempted++;
    state.stats.totalTime += elapsed;
    state.stats.currentStreak++;
    if (state.stats.currentStreak > state.stats.bestStreak) {
      state.stats.bestStreak = state.stats.currentStreak;
    }

    if (state.isDaily) {
      state.stats.dailySolved++;
      state.stats.lastDailyDate = new Date().toISOString().split('T')[0];
      els.dailyBtn.disabled = true;
      els.dailyBtn.textContent = 'Daily Complete!';
    }

    addToLeaderboard({
      score: state.stats.puzzlesSolved,
      streak: state.stats.currentStreak,
      time: elapsed,
      mode: state.isDaily ? 'daily' : 'practice',
      difficulty: state.currentPuzzle.difficulty,
      theme: state.currentPuzzle.theme,
    });

    saveStats();
    updateStatsDisplay();
    renderLeaderboard();

    // Show results modal
    showResultsModal(true, elapsed);
  }

  function puzzleFailed() {
    state.gameStatus = 'failed';
    stopTimer();

    state.stats.puzzlesAttempted++;
    state.stats.currentStreak = 0;
    saveStats();
    updateStatsDisplay();

    els.gameStatus.textContent = 'Wrong move! Try again.';
    els.gameStatus.className = 'game-status failed';
    els.showSolutionBtn.hidden = false;

    showToast('Wrong move! Try again or use Hint.');
  }

  function showResultsModal(solved, elapsed) {
    els.modalTitle.textContent = solved ? 'Puzzle Solved!' : 'Puzzle Complete';
    els.resultStatus.textContent = solved ? 'Solved' : 'Failed';
    els.resultStatus.style.color = solved ? 'var(--accent-3)' : 'var(--accent)';
    els.finalTime.textContent = formatTime(elapsed);
    els.finalMoves.textContent = state.moveHistory.length;
    els.hintUsed.textContent = state.hintUsed ? 'Yes' : 'No';

    if (state.isDaily) {
      els.dailyResult.hidden = false;
      const streak = state.stats.currentStreak;
      els.dailyMessage.textContent = `Daily streak: ${streak} day${streak !== 1 ? 's' : ''}!`;
    }

    // Show solution
    els.solutionDisplay.hidden = false;
    els.solutionMoves.innerHTML = state.puzzleMoves.map((m, i) =>
      `<span class="move-item">${i + 1}. ${m}</span>`
    ).join(' ');

    els.shareBtn.hidden = false;
    els.playAgainBtn.hidden = false;
    els.shareBtnModal.hidden = false;
    els.playAgainBtnModal.hidden = false;
    els.resultsModal.hidden = false;
  }

  // ============================================
  // HINT SYSTEM
  // ============================================
  function showHint() {
    if (!state.currentPuzzle || state.gameStatus !== 'active') return;

    state.hintUsed = true;

    // Highlight the correct piece and destination
    const expectedSan = state.puzzleMoves[state.currentMoveIndex];
    // Parse expected move to find from/to squares
    // This is simplified - would need proper SAN parsing
    const moves = getMoves(state.board, state.playerColor);
    const hintMove = moves.find(m => moveToSan(state.board, m).replace(/[#+]/g, '') === expectedSan.replace(/[#+]/g, ''));

    if (hintMove) {
      state.selectedSquare = hintMove.from;
      state.validMoves = [hintMove];
      renderBoard();
      showToast(`Hint: Move piece from ${squareToAlg(hintMove.from)} to ${squareToAlg(hintMove.to)}`);
    }
  }

  // ============================================
  // SHARE FUNCTIONALITY
  // ============================================
  function shareResult() {
    if (!state.currentPuzzle) return;

    const elapsed = Date.now() - (state.startTime || Date.now());
    const text = `🏆 Chess Puzzles ${state.isDaily ? 'Daily' : 'Practice'}
${state.currentPuzzle.name} (${capitalize(state.currentPuzzle.difficulty)})
${state.gameStatus === 'solved' ? '✅ Solved' : '❌ Failed'} in ${formatTime(elapsed)}
${state.moveHistory.length} moves ${state.hintUsed ? '• Hint used' : ''}

Play at: king-yosef-0.github.io/Main_Redirectorer/chess-puzzles/`;

    if (navigator.share) {
      navigator.share({ title: 'Chess Puzzles Result', text });
    } else {
      navigator.clipboard.writeText(text).then(() => showToast('Result copied to clipboard!'));
    }
  }

  // ============================================
  // COPY FEN / PGN
  // ============================================
  function copyFen() {
    const fen = boardToFen(state.board);
    navigator.clipboard.writeText(fen).then(() => showToast('FEN copied!'));
  }

  function copyPgn() {
    if (!state.currentPuzzle) return;

    let pgn = `[Event "${state.isDaily ? 'Daily Challenge' : 'Practice'}"]\n`;
    pgn += `[Site "Chess Puzzles"]\n`;
    pgn += `[Date "${new Date().toISOString().split('T')[0]}"]\n`;
    pgn += `[Puzzle "${state.currentPuzzle.name}"]\n`;
    pgn += `[Difficulty "${state.currentPuzzle.difficulty}"]\n`;
    pgn += `[Theme "${state.currentPuzzle.theme}"]\n`;
    pgn += `[FEN "${state.currentPuzzle.fen}"]\n\n`;

    const moves = state.puzzleMoves;
    for (let i = 0; i < moves.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      pgn += `${moveNum}. ${moves[i]}`;
      if (i + 1 < moves.length) pgn += ` ${moves[i + 1]}`;
      pgn += ' ';
    }
    pgn += '*';

    navigator.clipboard.writeText(pgn).then(() => showToast('PGN copied!'));
  }

  // ============================================
  // UI UPDATES
  // ============================================
  function updateStatsDisplay() {
    els.puzzlesSolved.textContent = state.stats.puzzlesSolved;
    const acc = state.stats.puzzlesAttempted > 0
      ? Math.round((state.stats.puzzlesSolved / state.stats.puzzlesAttempted) * 100)
      : 0;
    els.accuracy.textContent = `${acc}%`;
    els.currentStreak.textContent = state.stats.currentStreak;
    els.bestStreak.textContent = state.stats.bestStreak;
    els.avgTime.textContent = state.stats.puzzlesSolved > 0
      ? formatTime(state.stats.totalTime / state.stats.puzzlesSolved)
      : '—';
    els.dailySolved.textContent = state.stats.dailySolved;
  }

  function renderLeaderboard() {
    const top = state.stats.leaderboard.slice(0, 10);
    els.leaderboard.innerHTML = top.map((entry, i) => `
      <div class="leaderboard-entry">
        <span class="rank">#${i + 1}</span>
        <span class="score">${entry.score} pts</span>
        <span class="mode">${entry.mode} • ${entry.difficulty}</span>
      </div>
    `).join('') || '<div class="leaderboard-entry"><span>No scores yet</span></div>';
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  els.newBtn.addEventListener('click', () => {
    const puzzle = selectRandomPuzzle();
    if (puzzle) loadPuzzle(puzzle, false);
  });

  els.dailyBtn.addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    if (state.stats.lastDailyDate === today) {
      showToast('You already completed today\'s puzzle!');
      return;
    }
    const puzzle = selectDailyPuzzle();
    if (puzzle) loadPuzzle(puzzle, true);
  });

  els.hintBtn.addEventListener('click', showHint);

  els.showSolutionBtn.addEventListener('click', () => {
    state.showSolution = true;
    els.solutionDisplay.hidden = false;
    els.solutionMoves.innerHTML = state.puzzleMoves.map((m, i) =>
      `<span class="move-item">${i + 1}. ${m}</span>`
    ).join(' ');
    els.gameStatus.textContent = 'Solution revealed';
    els.gameStatus.className = 'game-status';
    showToast('Solution shown above');
  });

  els.flipBoardBtn.addEventListener('click', () => {
    state.flipped = !state.flipped;
    renderBoard();
  });

  els.copyFenBtn.addEventListener('click', copyFen);
  els.copyPgnBtn.addEventListener('click', copyPgn);

  els.shareBtn.addEventListener('click', shareResult);
  els.shareBtnModal.addEventListener('click', shareResult);

  els.playAgainBtn.addEventListener('click', () => {
    els.resultsModal.hidden = true;
    const puzzle = selectRandomPuzzle();
    if (puzzle) loadPuzzle(puzzle, false);
  });

  els.playAgainBtnModal.addEventListener('click', () => {
    els.resultsModal.hidden = true;
    const puzzle = selectRandomPuzzle();
    if (puzzle) loadPuzzle(puzzle, false);
  });

  // Difficulty tabs
  els.difficultyTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      els.difficultyTabs.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      state.difficulty = btn.dataset.difficulty;
    });
  });

  // Theme tabs
  els.themeTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      els.themeTabs.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      state.selectedTheme = btn.dataset.theme;
    });
  });

  // Board theme selector
  els.boardTheme.addEventListener('change', (e) => {
    state.boardTheme = e.target.value;
    document.querySelector('.chess-board').dataset.boardTheme = state.boardTheme;
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      // Could implement keyboard navigation
    }
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      // Undo - not implemented for puzzles
    }
  });

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    updateStatsDisplay();
    renderLeaderboard();

    // Set daily date
    const today = new Date().toISOString().split('T')[0];
    els.dailyDate.textContent = today;
    if (state.stats.lastDailyDate === today) {
      els.dailyBtn.disabled = true;
      els.dailyBtn.textContent = 'Daily Complete!';
    }

    // Load a random puzzle on start
    const puzzle = selectRandomPuzzle();
    if (puzzle) loadPuzzle(puzzle, false);

    // Apply board theme
    document.querySelector('.chess-board').dataset.boardTheme = state.boardTheme;
  }

  init();
})();