// Chess Puzzles - Tactical training with daily challenges
// Features: Mate in 1/2/3, Forks, Pins, Skewers, Discovery, Sacrifices
// Daily challenges, local leaderboards, PGN/FEN export, board themes
// 4 difficulty levels, move validation, hint system

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
    board[0] = 'br'; board[1] = 'bn'; board[2] = 'bb'; board[3] = 'bq';
    board[4] = 'bk'; board[5] = 'bb'; board[6] = 'bn'; board[7] = 'br';
    for (let i = 8; i < 16; i++) board[i] = 'bp';
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
        const one = square(r + dir, f);
        if (inBounds(one) && !board[one]) {
          moves.push({ from: i, to: one, promotion: rank(one) === 0 || rank(one) === 7 });
          if (r === startRank) {
            const two = square(r + 2 * dir, f);
            if (!board[two]) moves.push({ from: i, to: two, double: true });
          }
        }
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

    if (type === 'k') san = 'K';
    else if (type === 'q') san = 'Q';
    else if (type === 'r') san = 'R';
    else if (type === 'b') san = 'B';
    else if (type === 'n') san = 'N';
    else san = '';

    if (captured) {
      if (type === 'p') san += squareToAlg(move.from)[0];
      san += 'x';
    }

    san += squareToAlg(move.to);

    if (move.promotion) {
      san += '=' + move.promotion.toUpperCase();
    }

    // Check for check/checkmate
    const newBoard = makeMove(board, move);
    const oppColor = piece[0] === 'w' ? 'b' : 'w';
    if (isCheckmate(newBoard, oppColor)) san += '#';
    else if (isInCheck(newBoard, oppColor)) san += '+';

    return san;
  }

  function parseSan(board, color, san) {
    // Simplified SAN parser for puzzle solution validation
    san = san.replace(/[#+]/g, '');
    const moves = getMoves(board, color);
    for (const move of moves) {
      if (moveToSan(board, move).replace(/[#+]/g, '') === san) {
        return move;
      }
    }
    return null;
  }

  // ============================================
  // COMPREHENSIVE PUZZLE DATABASE
  // ============================================
  const PUZZLES = {
    mate1: [
      // Beginner
      { fen: '8/8/8/4k3/3Q4/8/8/4K3 w - - 0 1', solution: ['Qe4#'], theme: 'mate1', difficulty: 'easy', name: 'Queen Mate' },
      { fen: '8/8/8/4k3/3R4/8/8/4K3 w - - 0 1', solution: ['Re4#'], theme: 'mate1', difficulty: 'easy', name: 'Rook Mate' },
      { fen: '8/8/8/4k3/3B4/8/8/4K3 w - - 0 1', solution: ['Be4#'], theme: 'mate1', difficulty: 'easy', name: 'Bishop Mate' },
      { fen: '8/8/8/4k3/3N4/8/8/4K3 w - - 0 1', solution: ['Ne4#'], theme: 'mate1', difficulty: 'easy', name: 'Knight Mate' },
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['Qxf7#'], theme: 'mate1', difficulty: 'easy', name: "Scholar's Mate" },
      { fen: '8/8/8/4k3/8/3Q4/8/4K3 w - - 0 1', solution: ['Qd5#'], theme: 'mate1', difficulty: 'easy', name: 'Queen Box Mate' },
      { fen: '8/8/8/4k3/8/3R4/8/4K3 w - - 0 1', solution: ['Rd5#'], theme: 'mate1', difficulty: 'easy', name: 'Rook Box Mate' },
      { fen: '8/8/8/4k3/8/8/3Q4/4K3 w - - 0 1', solution: ['Qd6#'], theme: 'mate1', difficulty: 'easy', name: 'Smothered Queen' },
      { fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1', solution: ['Qh5#'], theme: 'mate1', difficulty: 'easy', name: "Fool's Mate" },
      { fen: '8/8/8/4k3/3P4/8/8/4K3 w - - 0 1', solution: ['e4#'], theme: 'mate1', difficulty: 'easy', name: 'Pawn Mate' },
      // Intermediate
      { fen: '8/8/8/4k3/2Q5/8/8/4K3 w - - 0 1', solution: ['Qd5#'], theme: 'mate1', difficulty: 'medium', name: 'Diagonal Queen Mate' },
      { fen: '8/8/8/4k3/2R5/8/8/4K3 w - - 0 1', solution: ['Rd5#'], theme: 'mate1', difficulty: 'medium', name: 'Diagonal Rook Mate' },
      { fen: '8/8/8/4k3/8/2Q5/8/4K3 w - - 0 1', solution: ['Qc6#'], theme: 'mate1', difficulty: 'medium', name: 'Long Range Queen' },
      { fen: '8/8/8/4k3/8/2R5/8/4K3 w - - 0 1', solution: ['Rc6#'], theme: 'mate1', difficulty: 'medium', name: 'Long Range Rook' },
      { fen: '8/8/8/4k3/8/8/2Q5/4K3 w - - 0 1', solution: ['Qc7#'], theme: 'mate1', difficulty: 'medium', name: 'Seventh Rank Queen' },
      // Advanced
      { fen: '6k1/5ppp/8/8/8/5Q2/5PPP/6K1 w - - 0 1', solution: ['Qg7#'], theme: 'mate1', difficulty: 'hard', name: 'Back Rank Mate' },
      { fen: '6k1/5ppp/8/8/8/5R2/5PPP/6K1 w - - 0 1', solution: ['Rg7#'], theme: 'mate1', difficulty: 'hard', name: 'Back Rank Rook' },
      { fen: '8/5k2/8/8/8/5Q2/5PPP/6K1 w - - 0 1', solution: ['Qg7#'], theme: 'mate1', difficulty: 'hard', name: 'Smothered Mate Pattern' },
      { fen: '8/5k2/8/8/8/5R2/5PPP/6K1 w - - 0 1', solution: ['Rg7#'], theme: 'mate1', difficulty: 'hard', name: 'Rook Smothered' },
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K2R w KQ - 0 1', solution: ['Qxf7#'], theme: 'mate1', difficulty: 'hard', name: "Scholar's Mate Variation" },
      // Expert
      { fen: 'r1bqk2r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K2R w KQkq - 0 1', solution: ['Qxf7#'], theme: 'mate1', difficulty: 'expert', name: 'Advanced Scholar Mate' },
      { fen: '6k1/5ppp/8/8/5Q2/8/5PPP/6K1 w - - 0 1', solution: ['Qg7#'], theme: 'mate1', difficulty: 'expert', name: 'Epaulette Mate' },
    ],
    mate2: [
      // Beginner
      { fen: '8/8/8/4k3/3Q4/8/8/4K3 w - - 0 1', solution: ['Qd5', 'Qe4#'], theme: 'mate2', difficulty: 'easy', name: 'Queen Approach' },
      { fen: '8/8/8/4k3/3R4/8/8/4K3 w - - 0 1', solution: ['Rd5', 'Re4#'], theme: 'mate2', difficulty: 'easy', name: 'Rook Approach' },
      { fen: '8/8/8/4k3/8/3Q4/8/4K3 w - - 0 1', solution: ['Qd6', 'Qd5#'], theme: 'mate2', difficulty: 'easy', name: 'Box Mate 2' },
      { fen: '8/8/8/4k3/8/3R4/8/4K3 w - - 0 1', solution: ['Rd6', 'Rd5#'], theme: 'mate2', difficulty: 'easy', name: 'Rook Box 2' },
      { fen: '8/8/8/4k3/3B4/8/8/4K3 w - - 0 1', solution: ['Bd5', 'Be4#'], theme: 'mate2', difficulty: 'easy', name: 'Bishop Mate 2' },
      // Intermediate
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['Qxf7+', 'Kxf7', 'Bc4#'], theme: 'mate2', difficulty: 'medium', name: 'Sacrifice Mate' },
      { fen: '8/8/8/4k3/2Q5/8/8/4K3 w - - 0 1', solution: ['Qd5+', 'Kc6', 'Qd6#'], theme: 'mate2', difficulty: 'medium', name: 'Queen Chase' },
      { fen: '8/8/8/4k3/2R5/8/8/4K3 w - - 0 1', solution: ['Rd5+', 'Kc6', 'Rd6#'], theme: 'mate2', difficulty: 'medium', name: 'Rook Chase' },
      { fen: '8/8/8/4k3/8/2B5/8/4K3 w - - 0 1', solution: ['Bd6+', 'Kc5', 'Bc6#'], theme: 'mate2', difficulty: 'medium', name: 'Bishop Chase' },
      { fen: '8/8/8/4k3/8/2N5/8/4K3 w - - 0 1', solution: ['Nd6+', 'Kc5', 'Ne7#'], theme: 'mate2', difficulty: 'medium', name: 'Knight Mate 2' },
      // Advanced
      { fen: '8/8/8/4k3/3Q4/8/8/4K3 w - - 0 1', solution: ['Qe5+', 'Kc6', 'Qe6#'], theme: 'mate2', difficulty: 'hard', name: 'Queen Zigzag' },
      { fen: '8/8/8/4k3/3R4/8/8/4K3 w - - 0 1', solution: ['Re5+', 'Kc6', 'Re6#'], theme: 'mate2', difficulty: 'hard', name: 'Rook Zigzag' },
      { fen: '8/8/8/4k3/3B4/8/8/4K3 w - - 0 1', solution: ['Be5+', 'Kc6', 'Be6#'], theme: 'mate2', difficulty: 'hard', name: 'Bishop Zigzag' },
      // Expert
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K2R w KQ - 0 1', solution: ['Qxf7+', 'Kxf7', 'Bc4#'], theme: 'mate2', difficulty: 'expert', name: 'Complex Sacrifice' },
      { fen: '6k1/5ppp/8/8/5Q2/8/5PPP/6K1 w - - 0 1', solution: ['Qg7+', 'Kxg7', 'Rg1#'], theme: 'mate2', difficulty: 'expert', name: 'Double Sacrifice' },
    ],
    mate3: [
      // Beginner
      { fen: '8/8/8/4k3/8/3Q4/8/4K3 w - - 0 1', solution: ['Qd6', 'Kc5', 'Qd5#'], theme: 'mate3', difficulty: 'easy', name: 'King Hunt' },
      { fen: '8/8/8/4k3/8/3R4/8/4K3 w - - 0 1', solution: ['Rd6', 'Kc5', 'Rd5#'], theme: 'mate3', difficulty: 'easy', name: 'Rook Hunt' },
      { fen: '8/8/8/4k3/3B4/8/8/4K3 w - - 0 1', solution: ['Bd5', 'Kc5', 'Be4#'], theme: 'mate3', difficulty: 'easy', name: 'Bishop Hunt' },
      // Intermediate
      { fen: '8/8/8/4k3/8/2Q5/8/4K3 w - - 0 1', solution: ['Qc6+', 'Kb5', 'Qc5#'], theme: 'mate3', difficulty: 'medium', name: 'Side Box Mate' },
      { fen: '8/8/8/4k3/8/2R5/8/4K3 w - - 0 1', solution: ['Rc6+', 'Kb5', 'Rc5#'], theme: 'mate3', difficulty: 'medium', name: 'Rook Side Box' },
      { fen: '8/8/8/4k3/8/8/2Q5/4K3 w - - 0 1', solution: ['Qc7+', 'Kb6', 'Qc6#'], theme: 'mate3', difficulty: 'medium', name: 'Seventh Rank Box' },
      // Advanced
      { fen: '8/8/8/4k3/3Q4/8/8/4K3 w - - 0 1', solution: ['Qe5+', 'Kd6', 'Qe6#'], theme: 'mate3', difficulty: 'hard', name: 'Direct Mate 3' },
      { fen: '8/8/8/4k3/3R4/8/8/4K3 w - - 0 1', solution: ['Re5+', 'Kd6', 'Re6#'], theme: 'mate3', difficulty: 'hard', name: 'Rook Direct 3' },
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['Qxf7+', 'Kxf7', 'Bc4+', 'Ke7', 'Qd5#'], theme: 'mate3', difficulty: 'hard', name: 'Extended Scholar' },
      // Expert
      { fen: '6k1/5ppp/8/8/5Q2/8/5PPP/6K1 w - - 0 1', solution: ['Qg7+', 'Kxg7', 'Rg1+', 'Kh8', 'Rg8#'], theme: 'mate3', difficulty: 'expert', name: 'Masterpiece Mate' },
      { fen: '8/5k2/8/8/8/5Q2/5PPP/6K1 w - - 0 1', solution: ['Qg7+', 'Kxg7', 'f8=Q+', 'Kh8', 'Qg7#'], theme: 'mate3', difficulty: 'expert', name: 'Promotion Mate' },
    ],
    fork: [
      // Beginner
      { fen: '8/8/8/3k4/8/2N5/8/4K3 w - - 0 1', solution: ['Ne5+'], theme: 'fork', difficulty: 'easy', name: 'Knight Fork King+Queen' },
      { fen: '8/8/8/3k4/8/2N5/8/4K3 w - - 0 1', solution: ['Nc5+'], theme: 'fork', difficulty: 'easy', name: 'Knight Fork King+Rook' },
      { fen: '8/8/8/3k4/8/2N5/8/4K3 w - - 0 1', solution: ['Nd6+'], theme: 'fork', difficulty: 'easy', name: 'Knight Fork King+Bishop' },
      // Intermediate
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['Nxe5'], theme: 'fork', difficulty: 'medium', name: 'Opening Fork' },
      { fen: '8/8/8/3k4/3q4/2N5/8/4K3 w - - 0 1', solution: ['Ne5+'], theme: 'fork', difficulty: 'medium', name: 'Fork Queen+Bishop' },
      { fen: '8/8/8/3k4/3r4/2N5/8/4K3 w - - 0 1', solution: ['Nc5+'], theme: 'fork', difficulty: 'medium', name: 'Fork Rook+Bishop' },
      // Advanced
      { fen: '8/8/8/3k4/3q4/8/2N5/4K3 w - - 0 1', solution: ['Ne6+'], theme: 'fork', difficulty: 'hard', name: 'Double Fork' },
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p2Q/2B1P3/5N2/PPPP1PPP/RNB1K2R w KQ - 0 1', solution: ['Nxe5'], theme: 'fork', difficulty: 'hard', name: 'Complex Opening Fork' },
      // Expert
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p2Q/2B1P3/5N2/PPPP1PPP/RNB1K2R w KQ - 0 1', solution: ['Nxf7'], theme: 'fork', difficulty: 'expert', name: 'Knight Sacrifice Fork' },
      { fen: '8/8/8/3k4/3q1r2/8/2N5/4K3 w - - 0 1', solution: ['Ne6+'], theme: 'fork', difficulty: 'expert', name: 'Triple Fork' },
    ],
    pin: [
      // Beginner
      { fen: '8/8/8/3k4/3b4/8/8/4K3 w - - 0 1', solution: ['Bd5'], theme: 'pin', difficulty: 'easy', name: 'Absolute Pin' },
      { fen: '8/8/8/3k4/3n4/8/8/4K3 w - - 0 1', solution: ['Bd5'], theme: 'pin', difficulty: 'easy', name: 'Knight Pin' },
      { fen: '8/8/8/3k4/3r4/8/8/4K3 w - - 0 1', solution: ['Rd1'], theme: 'pin', difficulty: 'easy', name: 'Rook Pin' },
      // Intermediate
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1', solution: ['Bg5'], theme: 'pin', difficulty: 'medium', name: 'Opening Pin' },
      { fen: '8/8/8/3k4/3b4/8/3R4/4K3 w - - 0 1', solution: ['Rd1'], theme: 'pin', difficulty: 'medium', name: 'Rook Pin Line' },
      { fen: '8/8/8/3k4/3q4/8/3B4/4K3 w - - 0 1', solution: ['Bd5'], theme: 'pin', difficulty: 'medium', name: 'Bishop Pin Queen' },
      // Advanced
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQ - 0 1', solution: ['Bg5'], theme: 'pin', difficulty: 'hard', name: 'Advanced Opening Pin' },
      { fen: '8/8/8/3k4/3q4/8/3R4/4K3 w - - 0 1', solution: ['Rd1'], theme: 'pin', difficulty: 'hard', name: 'Pin on Queen' },
      // Expert
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K2R w KQ - 0 1', solution: ['Qxf7+'], theme: 'pin', difficulty: 'expert', name: 'Pin to Sacrifice' },
      { fen: '8/8/8/3k4/3q1r2/8/3R4/4K3 w - - 0 1', solution: ['Rd1'], theme: 'pin', difficulty: 'expert', name: 'Double Pin' },
    ],
    skewer: [
      // Beginner
      { fen: '8/8/8/3k4/8/8/8/4K2R w - - 0 1', solution: ['Rd8+'], theme: 'skewer', difficulty: 'easy', name: 'Rook Skewer' },
      { fen: '8/8/8/3k4/8/8/8/4K2B w - - 0 1', solution: ['Bd8+'], theme: 'skewer', difficulty: 'easy', name: 'Bishop Skewer' },
      { fen: '8/8/8/3k4/8/8/8/4K1QR w - - 0 1', solution: ['Qd8+'], theme: 'skewer', difficulty: 'easy', name: 'Queen Skewer' },
      // Intermediate
      { fen: '8/8/8/3k4/8/8/8/4K2R w - - 0 1', solution: ['Rd8+'], theme: 'skewer', difficulty: 'medium', name: 'Long Range Skewer' },
      { fen: '8/8/8/3k4/8/8/8/4K2B w - - 0 1', solution: ['Bd8+'], theme: 'skewer', difficulty: 'medium', name: 'Diagonal Skewer' },
      { fen: '8/8/8/3k4/3r4/8/8/4K2Q w - - 0 1', solution: ['Qd8+'], theme: 'skewer', difficulty: 'medium', name: 'Skewer Rook' },
      // Advanced
      { fen: '8/8/8/3k4/3q4/8/8/4K2R w - - 0 1', solution: ['Rd8+'], theme: 'skewer', difficulty: 'hard', name: 'Skewer Queen' },
      { fen: '8/8/8/3k4/3b4/8/8/4K2R w - - 0 1', solution: ['Rd8+'], theme: 'skewer', difficulty: 'hard', name: 'Skewer Bishop' },
      // Expert
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K2R w KQ - 0 1', solution: ['Qxf7+'], theme: 'skewer', difficulty: 'expert', name: 'Skewer Sacrifice' },
      { fen: '8/8/8/3k4/3q1r2/8/8/4K2R w - - 0 1', solution: ['Rd8+'], theme: 'skewer', difficulty: 'expert', name: 'Complex Skewer' },
    ],
    discovery: [
      // Beginner
      { fen: '8/8/8/3k4/8/2N5/8/4K2B w - - 0 1', solution: ['Ne5+'], theme: 'discovery', difficulty: 'easy', name: 'Discovered Attack' },
      { fen: '8/8/8/3k4/8/2B5/8/4K2R w - - 0 1', solution: ['Bd5+'], theme: 'discovery', difficulty: 'easy', name: 'Discovered Check' },
      { fen: '8/8/8/3k4/8/2N5/8/4K2Q w - - 0 1', solution: ['Ne5+'], theme: 'discovery', difficulty: 'easy', name: 'Knight Discovery' },
      // Intermediate
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1', solution: ['Nxe5'], theme: 'discovery', difficulty: 'medium', name: 'Opening Discovery' },
      { fen: '8/8/8/3k4/3q4/2B5/8/4K2R w - - 0 1', solution: ['Bd5+'], theme: 'discovery', difficulty: 'medium', name: 'Bishop Discovery Queen' },
      { fen: '8/8/8/3k4/3r4/2B5/8/4K2Q w - - 0 1', solution: ['Bd5+'], theme: 'discovery', difficulty: 'medium', name: 'Discovery Rook' },
      // Advanced
      { fen: '8/8/8/3k4/3q4/2N5/8/4K2R w - - 0 1', solution: ['Ne5+'], theme: 'discovery', difficulty: 'hard', name: 'Double Discovery' },
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQ - 0 1', solution: ['Nxe5'], theme: 'discovery', difficulty: 'hard', name: 'Advanced Discovery' },
      // Expert
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p2Q/2B1P3/5N2/PPPP1PPP/RNB1K2R w KQ - 0 1', solution: ['Nxf7+'], theme: 'discovery', difficulty: 'expert', name: 'Discovery Sacrifice' },
      { fen: '8/8/8/3k4/3q1r2/2N5/8/4K2R w - - 0 1', solution: ['Ne5+'], theme: 'discovery', difficulty: 'expert', name: 'Multi Discovery' },
    ],
    sacrifice: [
      // Beginner
      { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', solution: ['Qxf7+'], theme: 'sacrifice', difficulty: 'easy', name: 'Queen Sacrifice' },
      { fen: '8/8/8/4k3/3R4/8/8/4K3 w - - 0 1', solution: ['Rf7+'], theme: 'sacrifice', difficulty: 'easy', name: 'Rook Sacrifice' },
      { fen: '8/8/8/4k3/3B4/8/8/4K3 w - - 0 1', solution: ['Bf7+'], theme: 'sacrifice', difficulty: 'easy', name: 'Bishop Sacrifice' },
      // Intermediate
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K2R w KQ - 0 1', solution: ['Qxf7+'], theme: 'sacrifice', difficulty: 'medium', name: 'Opening Queen Sac' },
      { fen: '8/8/8/4k3/3R4/8/8/4K3 w - - 0 1', solution: ['Rf7+'], theme: 'sacrifice', difficulty: 'medium', name: 'Rook Sac Mate' },
      { fen: '8/8/8/4k3/3B4/8/8/4K3 w - - 0 1', solution: ['Bf7+'], theme: 'sacrifice', difficulty: 'medium', name: 'Bishop Sac Mate' },
      // Advanced
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p2Q/2B1P3/5N2/PPPP1PPP/RNB1K2R w KQ - 0 1', solution: ['Nxf7+'], theme: 'sacrifice', difficulty: 'hard', name: 'Knight Sacrifice' },
      { fen: '8/8/8/4k3/3Q4/8/8/4K3 w - - 0 1', solution: ['Qf7+'], theme: 'sacrifice', difficulty: 'hard', name: 'Queen Sac Mate 2' },
      // Expert
      { fen: '6k1/5ppp/8/8/5Q2/8/5PPP/6K1 w - - 0 1', solution: ['Qg7+', 'Kxg7', 'Rg1#'], theme: 'sacrifice', difficulty: 'expert', name: 'Double Sacrifice Mate' },
      { fen: 'r1bq1rk1/pppp1ppp/2n2n2/4p2Q/2B1P3/5N2/PPPP1PPP/RNB1K2R w KQ - 0 1', solution: ['Qxf7+', 'Kxf7', 'Bc4+', 'Ke7', 'Nd5#'], theme: 'sacrifice', difficulty: 'expert', name: 'Masterpiece Sacrifice' },
    ],
  };

  // Flatten all puzzles for easy filtering
  const ALL_PUZZLES = [];
  for (const [theme, puzzles] of Object.entries(PUZZLES)) {
    for (const p of puzzles) {
      ALL_PUZZLES.push({ ...p, theme });
    }
  }

  // Difficulty order for sorting
  const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2, expert: 3 };

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
    gameStatus: 'idle',
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
    boardContainer: document.getElementById('boardContainer'),
    gameStatus: document.getElementById('gameStatus'),
    timer: document.getElementById('timer'),
    puzzleLabel: document.getElementById('puzzleLabel'),
    puzzleMeta: document.getElementById('puzzleMeta'),
    difficultyBadge: document.getElementById('difficultyBadge'),
    themeBadge: document.getElementById('themeBadge'),
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
    exportBtn: document.getElementById('exportBtn'),
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
  // BOARD RENDERING
  // ============================================
  function renderBoard() {
    const board = state.board;
    const flipped = state.flipped;

    let html = '<div class="chess-board" data-board-theme="' + state.boardTheme + '">';

    // Add coordinate labels
    html += '<div class="coordinates">';
    for (let f = 0; f < 8; f++) {
      const displayFile = flipped ? 7 - f : f;
      const fileChar = String.fromCharCode(97 + displayFile);
      html += `<div class="coordinate file" style="left: ${f * 12.5}%;">${fileChar}</div>`;
    }
    for (let r = 0; r < 8; r++) {
      const displayRank = flipped ? r + 1 : 8 - r;
      html += `<div class="coordinate rank" style="top: ${r * 12.5}%;">${displayRank}</div>`;
    }
    html += '</div>';

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
    const diffClass = `difficulty-${puzzle.difficulty}`;
    const diffLabel = puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1);
    const themeLabel = puzzle.theme.replace('mate', 'Mate ').replace(/^\w/, c => c.toUpperCase());
    els.puzzleMeta.innerHTML = `
      <span class="difficulty-badge ${diffClass}" id="difficultyBadge">${diffLabel}</span>
      <span class="theme-badge" id="themeBadge">${themeLabel}</span>
    `;
    els.gameStatus.textContent = `Find the best move${puzzle.solution && puzzle.solution.length > 1 ? 's' : ''}!`;
    els.gameStatus.className = 'game-status active';
    els.moveList.hidden = true;
    els.moves.innerHTML = '';
    els.showSolutionBtn.hidden = true;
    els.copyPgnBtn.hidden = true;
    els.exportBtn.hidden = true;
    els.shareBtn.hidden = true;
    els.playAgainBtn.hidden = true;
    els.dailyResult.hidden = true;
    els.solutionDisplay.hidden = true;

    // Update daily button text
    const today = new Date().toISOString().split('T')[0];
    els.dailyDate.textContent = today;
    els.dailyBtn.textContent = isDaily ? "Today's Puzzle (Active)" : "Play Today's Puzzle";
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
    const moveSan = moveToSan(state.board, move).replace(/[#+]/g, '');
    const expected = expectedSan.replace(/[#+]/g, '');
    return moveSan === expected;
  }

  function makeOpponentMove() {
    // For puzzles, the opponent usually has forced moves
    // In a real implementation, this would use the puzzle's solution line
    // For now, we'll make a legal move for demo
    const oppColor = state.playerColor === 'w' ? 'b' : 'w';
    const moves = getMoves(state.board, oppColor);
    if (moves.length > 0) {
      // Try to find a move that matches the next expected move in solution
      const nextExpected = state.puzzleMoves[state.currentMoveIndex];
      const parsedMove = parseSan(state.board, oppColor, nextExpected);
      const move = parsedMove || moves[0];
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

    showToast('Wrong move! Try again or use Hint.', 'error');
  }

  function showResultsModal(solved, elapsed) {
    els.modalTitle.textContent = solved ? 'Puzzle Solved!' : 'Puzzle Complete';
    els.resultStatus.textContent = solved ? 'Solved' : 'Failed';
    els.resultStatus.style.color = solved ? 'var(--gold-bright)' : '#e74c3c';
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

    // Show move list
    els.moveList.hidden = false;
    els.moves.innerHTML = state.moveHistory.map((h, i) => {
      const moveNum = Math.floor(i / 2) + 1;
      const isWhite = i % 2 === 0;
      return `<span class="move-item ${isWhite ? 'move-white' : 'move-black'}">${isWhite ? moveNum + '.' : ''} ${h.san}</span>`;
    }).join(' ');

    els.copyPgnBtn.hidden = false;
    els.exportBtn.hidden = false;
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

    const expectedSan = state.puzzleMoves[state.currentMoveIndex];
    const moves = getMoves(state.board, state.playerColor);
    const hintMove = moves.find(m => moveToSan(state.board, m).replace(/[#+]/g, '') === expectedSan.replace(/[#+]/g, ''));

    if (hintMove) {
      state.selectedSquare = hintMove.from;
      state.validMoves = [hintMove];
      renderBoard();
      showToast(`Hint: Move piece from ${squareToAlg(hintMove.from)} to ${squareToAlg(hintMove.to)}`, 'info');
      els.gameStatus.textContent = `Hint: ${squareToAlg(hintMove.from)}${squareToAlg(hintMove.to)}`;
      els.gameStatus.className = 'game-status hint';
    }
  }

  // ============================================
  // SHARE FUNCTIONALITY
  // ============================================
  function shareResult() {
    if (!state.currentPuzzle) return;

    const elapsed = Date.now() - (state.startTime || Date.now());
    const text = `🏆 Chess Puzzles ${state.isDaily ? 'Daily' : 'Practice'}
${state.currentPuzzle.name} (${state.currentPuzzle.difficulty.charAt(0).toUpperCase() + state.currentPuzzle.difficulty.slice(1)})
${state.gameStatus === 'solved' ? '✅ Solved' : '❌ Failed'} in ${formatTime(elapsed)}
${state.moveHistory.length} moves ${state.hintUsed ? '• Hint used' : ''}

Play at: king-yosef-0.github.io/Main_Redirectorer/chess-puzzles/`;

    if (navigator.share) {
      navigator.share({ title: 'Chess Puzzles Result', text });
    } else {
      navigator.clipboard.writeText(text).then(() => showToast('Result copied to clipboard!', 'success'));
    }
  }

  // ============================================
  // COPY FEN / PGN / EXPORT
  // ============================================
  function copyFen() {
    const fen = boardToFen(state.board);
    navigator.clipboard.writeText(fen).then(() => showToast('FEN copied to clipboard!', 'success'));
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

    navigator.clipboard.writeText(pgn).then(() => showToast('PGN copied to clipboard!', 'success'));
  }

  function exportPgn() {
    if (!state.currentPuzzle) return;

    let pgn = `[Event "${state.isDaily ? 'Daily Challenge' : 'Practice'}"]\n`;
    pgn += `[Site "Chess Puzzles - KING_YOSEF_"]\n`;
    pgn += `[Date "${new Date().toISOString().split('T')[0]}"]\n`;
    pgn += `[Round "-"]\n`;
    pgn += `[White "${state.playerColor === 'w' ? 'Player' : 'Engine'}"]\n`;
    pgn += `[Black "${state.playerColor === 'b' ? 'Player' : 'Engine'}"]\n`;
    pgn += `[Result "${state.gameStatus === 'solved' ? '1-0' : '*'}"]\n`;
    pgn += `[Puzzle "${state.currentPuzzle.name}"]\n`;
    pgn += `[Difficulty "${state.currentPuzzle.difficulty}"]\n`;
    pgn += `[Theme "${state.currentPuzzle.theme}"]\n`;
    pgn += `[FEN "${state.currentPuzzle.fen}"]\n`;
    pgn += `[TimeControl "-"]\n`;
    pgn += `[Termination "${state.gameStatus === 'solved' ? 'Normal' : 'Unfinished'}"]\n\n`;

    // Include the full solution line
    const solutionMoves = state.currentPuzzle.solution || [];
    for (let i = 0; i < solutionMoves.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      pgn += `${moveNum}. ${solutionMoves[i]}`;
      if (i + 1 < solutionMoves.length) pgn += ` ${solutionMoves[i + 1]}`;
      pgn += ' ';
    }
    pgn += state.gameStatus === 'solved' ? '1-0' : '*';

    // Create download
    const blob = new Blob([pgn], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-puzzle-${state.currentPuzzle.theme}-${state.currentPuzzle.difficulty}-${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('PGN file downloaded!', 'success');
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
    if (top.length === 0) {
      els.leaderboard.innerHTML = '<div class="empty-leaderboard">No scores yet — solve puzzles to appear here!</div>';
      return;
    }
    els.leaderboard.innerHTML = top.map((entry, i) => `
      <div class="leaderboard-entry">
        <span class="rank">#${i + 1}</span>
        <span class="score">${entry.score} pts</span>
        <span class="mode">${entry.mode} • ${entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}</span>
        <span class="theme">${entry.theme}</span>
      </div>
    `).join('');
  }

  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
      showToast('You already completed today\'s puzzle!', 'info');
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
    showToast('Solution shown above', 'info');
  });

  els.flipBoardBtn.addEventListener('click', () => {
    state.flipped = !state.flipped;
    renderBoard();
  });

  els.copyFenBtn.addEventListener('click', copyFen);
  els.copyPgnBtn.addEventListener('click', copyPgn);
  els.exportBtn.addEventListener('click', exportPgn);

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
    if (e.key === 'h' || e.key === 'H') {
      if (state.gameStatus === 'active') showHint();
    }
    if (e.key === 'n' || e.key === 'N') {
      if (!els.resultsModal.hidden) return;
      const puzzle = selectRandomPuzzle();
      if (puzzle) loadPuzzle(puzzle, false);
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