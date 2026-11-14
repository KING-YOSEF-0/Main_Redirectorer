// Word Ladder Daily — KING_YOSEF_
// Transform words one letter at a time. New puzzle daily.

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

  // ===== Word Dictionary (common English words, 4-6 letters) =====
  // Curated subset for offline play - in production would load from file
  const DICTIONARY = {
    4: [
      'COLD', 'CORD', 'CARD', 'WARD', 'WARM', 'WORM', 'WORD', 'WORE', 'WOOD', 'GOOD',
      'FOOD', 'FOOL', 'COOL', 'POOL', 'POLE', 'POPE', 'PORE', 'POUR', 'FOUR', 'LOUR',
      'LOVE', 'LIVE', 'LIFE', 'LIFT', 'LEFT', 'LEAF', 'BEAF', 'BEAM', 'TEAM', 'TEAR',
      'WEAR', 'BEAR', 'BEAT', 'BEST', 'REST', 'RUST', 'MUST', 'MOST', 'MORE', 'CORE',
      'CARE', 'BARE', 'BARN', 'YARN', 'YARD', 'HARD', 'CARD', 'CART', 'PART', 'PORT',
      'POST', 'PAST', 'PASS', 'LASS', 'LAST', 'LOST', 'LOOT', 'LOOK', 'BOOK', 'COOK',
      'COOK', 'COOP', 'CROP', 'DROP', 'DRAG', 'DRUG', 'DRUM', 'DRIP', 'DROP', 'PROP',
      'PROM', 'FROM', 'FORM', 'FARM', 'HARM', 'WARM', 'WARN', 'WORN', 'CORN', 'BORN',
      'BURN', 'TURN', 'TURF', 'SURF', 'SURF', 'SURE', 'PURE', 'CURE', 'CURL', 'GIRL',
      'GIRL', 'GIRT', 'GIFT', 'LIFT', 'LEFT', 'LENT', 'LEND', 'BEND', 'SEND', 'SENT',
      'WENT', 'WENT', 'WEST', 'BEST', 'BEST', 'BEAT', 'BEAR', 'BEAN', 'DEAN', 'DEAD',
      'READ', 'READ', 'REAL', 'DEAL', 'MEAL', 'MEAT', 'MEET', 'FEET', 'FEEL', 'PEEL',
      'PEEL', 'PEER', 'BEER', 'BEET', 'FEET', 'FEET', 'FEET', 'FEET', 'FEET', 'FEET'
    ],
    5: [
      'COLD', 'CORDS', 'CARDS', 'WARDS', 'WARMS', 'WORMS', 'WORDS', 'WORES', 'WOODS', 'GOODS',
      'FOODS', 'FOOLS', 'COOLS', 'POOLS', 'POLES', 'POPES', 'PORES', 'POURS', 'FOURS', 'LOURS',
      'LOVES', 'LIVES', 'LIFES', 'LIFTS', 'LEFTS', 'LEAFS', 'BEAMS', 'TEAMS', 'TEARS', 'WEARS',
      'BEARS', 'BEATS', 'BESTS', 'RESTS', 'RUSTS', 'MUSTS', 'MOSTS', 'MORES', 'CORES',
      'CARES', 'BARES', 'BARNs', 'YARNS', 'YARDS', 'HARDS', 'CARDS', 'CARTS', 'PARTS', 'PORTS',
      'POSTS', 'PASTS', 'PASSES', 'LASSES', 'LASTS', 'LOSTS', 'LOOTS', 'LOOKS', 'BOOKS', 'COOKS',
      'CRANE', 'CRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'CRAZY', 'HAZY', 'HAZE', 'HATE', 'DATE',
      'DATE', 'DATE', 'MATE', 'MATE', 'MATE', 'MATE', 'MATE', 'MATE', 'MATE', 'MATE',
      'HOUSE', 'MOUSE', 'MOUSE', 'MOUSE', 'MOUSE', 'MOUSE', 'MOUSE', 'MOUSE', 'MOUSE', 'MOUSE',
      'WATER', 'LATER', 'LATER', 'LATER', 'LATER', 'LATER', 'LATER', 'LATER', 'LATER', 'LATER',
      'MONEY', 'HONEY', 'HONEY', 'HONEY', 'HONEY', 'HONEY', 'HONEY', 'HONEY', 'HONEY', 'HONEY',
      'MUSIC', 'MUSIC', 'MUSIC', 'MUSIC', 'MUSIC', 'MUSIC', 'MUSIC', 'MUSIC', 'MUSIC', 'MUSIC',
      'LIGHT', 'MIGHT', 'MIGHT', 'MIGHT', 'MIGHT', 'MIGHT', 'MIGHT', 'MIGHT', 'MIGHT', 'MIGHT',
      'NIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT', 'RIGHT',
      'SIGHT', 'FIGHT', 'FIGHT', 'FIGHT', 'FIGHT', 'FIGHT', 'FIGHT', 'FIGHT', 'FIGHT', 'FIGHT',
      'BRIGHT', 'BRIGHT', 'BRIGHT', 'BRIGHT', 'BRIGHT', 'BRIGHT', 'BRIGHT', 'BRIGHT', 'BRIGHT', 'BRIGHT'
    ],
    6: [
      'COLDER', 'CORDON', 'CARDED', 'WARDED', 'WARMED', 'WORMED', 'WORDED', 'WOODED', 'GOODED', 'FOODED',
      'FOOLED', 'COOLED', 'POOLED', 'POOLED', 'POLE', 'POPE', 'PORE', 'POUR', 'FOUR', 'LOUR',
      'LOVED', 'LIVED', 'LIFTED', 'LEFTED', 'LEAFED', 'BEAMED', 'TEAMED', 'TORED', 'WORED', 'BEARED',
      'BEATED', 'BESTED', 'RESTED', 'RUSTED', 'MUSTED', 'MOSTED', 'MOORED', 'CORED',
      'CARED', 'BARED', 'BARNED', 'YARNED', 'YARDED', 'HARDED', 'CARDED', 'CARTED', 'PARTED', 'PORTED',
      'POSTED', 'PASTED', 'PASSED', 'LASSED', 'LASTED', 'LOSTED', 'LOOTED', 'LOOKED', 'BOOKED', 'COOKED',
      'CRAZED', 'GRAZED', 'GLAZED', 'CRAZES', 'HAZING', 'HAZING', 'HATING', 'DATING', 'MATING', 'RATING',
      'HATRED', 'MATRED', 'MATTER', 'CATTER', 'CATTER', 'CATTLE', 'BATTLE', 'BATTLE', 'BATTLE', 'BATTLE',
      'SETTLE', 'KETTLE', 'KETTLE', 'KETTLE', 'KETTLE', 'KETTLE', 'KETTLE', 'KETTLE', 'KETTLE', 'KETTLE',
      'LITTLE', 'LITTLE', 'LITTLE', 'LITTLE', 'LITTLE', 'LITTLE', 'LITTLE', 'LITTLE', 'LITTLE', 'LITTLE',
      'BOTTLE', 'BOTTLE', 'BOTTLE', 'BOTTLE', 'BOTTLE', 'BOTTLE', 'BOTTLE', 'BOTTLE', 'BOTTLE', 'BOTTLE'
    ]
  };

  // Flatten for quick lookup
  const ALL_WORDS = new Set();
  Object.values(DICTIONARY).forEach(arr => arr.forEach(w => ALL_WORDS.add(w)));

  // ===== Build adjacency graph =====
  function buildGraph(words) {
    const graph = new Map();
    const wordList = Array.from(words);

    wordList.forEach(word => {
      graph.set(word, []);
    });

    wordList.forEach((word, i) => {
      for (let j = i + 1; j < wordList.length; j++) {
        const other = wordList[j];
        if (word.length !== other.length) continue;
        let diff = 0;
        for (let k = 0; k < word.length; k++) {
          if (word[k] !== other[k]) diff++;
          if (diff > 1) break;
        }
        if (diff === 1) {
          graph.get(word).push(other);
          graph.get(other).push(word);
        }
      }
    });

    return graph;
  }

  const GRAPHS = {};
  Object.entries(DICTIONARY).forEach(([len, words]) => {
    GRAPHS[len] = buildGraph(new Set(words));
  });

  // ===== BFS for shortest path =====
  function findShortestPath(start, end, graph) {
    if (start === end) return [start];
    if (!graph.has(start) || !graph.has(end)) return null;

    const queue = [[start]];
    const visited = new Set([start]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      for (const neighbor of graph.get(current)) {
        if (neighbor === end) {
          return [...path, neighbor];
        }
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null;
  }

  // ===== State =====
  const state = {
    mode: 'daily',
    wordLength: 5,
    startWord: '',
    endWord: '',
    currentWord: '',
    path: [],
    optimalPath: null,
    stepCount: 0,
    startTime: null,
    isPlaying: false,
    isDaily: false,
    hintsUsed: 0,
    rng: mulberry32(Date.now()),
    stats: JSON.parse(localStorage.getItem('wordLadderStats') || '{}'),
    leaderboard: JSON.parse(localStorage.getItem('wordLadderLeaderboard') || '{}'),
  };

  // ===== DOM Elements =====
  const els = {
    ladderContainer: document.getElementById('ladderContainer'),
    currentWord: document.getElementById('currentWord'),
    currentStep: document.getElementById('currentStep'),
    targetSteps: document.getElementById('targetSteps'),
    gameStatus: document.getElementById('gameStatus'),
    keyboard: document.getElementById('keyboard'),
    letterInput: document.getElementById('letterInput'),
    submitBtn: document.getElementById('submitBtn'),
    undoBtn: document.getElementById('undoBtn'),
    clearBtn: document.getElementById('clearBtn'),
    newBtn: document.getElementById('newBtn'),
    hintBtn: document.getElementById('hintBtn'),
    shareBtn: document.getElementById('shareBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    resultsModal: document.getElementById('resultsModal'),
    modalTitle: document.getElementById('modalTitle'),
    finalSteps: document.getElementById('finalSteps'),
    optimalSteps: document.getElementById('optimalSteps'),
    efficiency: document.getElementById('efficiency'),
    finalTime: document.getElementById('finalTime'),
    dailyResult: document.getElementById('dailyResult'),
    dailyMessage: document.getElementById('dailyMessage'),
    solutionDisplay: document.getElementById('solutionDisplay'),
    solutionPath: document.getElementById('solutionPath'),
    shareBtnModal: document.getElementById('shareBtnModal'),
    playAgainBtnModal: document.getElementById('playAgainBtnModal'),
    hintArea: document.getElementById('hintArea'),
    hintContent: document.getElementById('hintContent'),
    closeHintBtn: document.getElementById('closeHintBtn'),
    puzzleLabel: document.getElementById('puzzleLabel'),
    puzzleDate: document.getElementById('puzzleDate'),
    dailySolved: document.getElementById('dailySolved'),
    currentStreak: document.getElementById('currentStreak'),
    bestStreak: document.getElementById('bestStreak'),
    avgSteps: document.getElementById('avgSteps'),
    practiceSolved: document.getElementById('practiceSolved'),
    leaderboard: document.getElementById('leaderboard'),
    practiceFields: document.getElementById('practiceFields'),
    customFields: document.getElementById('customFields'),
    customStart: document.getElementById('customStart'),
    customEnd: document.getElementById('customEnd'),
    customStartBtn: document.getElementById('customStartBtn'),
  };

  // ===== Initialize =====
  function init() {
    setupEventListeners();
    updateStatsDisplay();
    updateLeaderboard();
    generateDailyPuzzle();
  }

  function setupEventListeners() {
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
        els.practiceFields.hidden = state.mode !== 'practice';
        els.customFields.hidden = true;
        if (state.mode === 'daily') {
          generateDailyPuzzle();
        }
      });
    });

    // Size tabs (practice mode)
    document.querySelectorAll('.size-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-tab').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        state.wordLength = parseInt(btn.dataset.length, 10);
      });
    });

    // Custom puzzle
    els.customStartBtn.addEventListener('click', () => {
      const start = els.customStart.value.toUpperCase().trim();
      const end = els.customEnd.value.toUpperCase().trim();
      if (start && end && start.length === end.length && start.length >= 3 && start.length <= 6) {
        if (ALL_WORDS.has(start) && ALL_WORDS.has(end)) {
          state.wordLength = start.length;
          state.mode = 'practice';
          startGame(start, end, false);
          els.customFields.hidden = true;
          document.querySelector('.mode-tab[data-mode="practice"]').click();
        } else {
          showToast('Both words must be in dictionary');
        }
      } else {
        showToast('Enter valid words of same length (3-6 letters)');
      }
    });

    // Input handling
    els.letterInput.addEventListener('input', e => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    });

    els.letterInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitLetter();
      if (e.key === 'Backspace' && !e.target.value) undoStep();
    });

    // Buttons
    els.submitBtn.addEventListener('click', submitLetter);
    els.undoBtn.addEventListener('click', undoStep);
    els.clearBtn.addEventListener('click', clearGame);
    els.newBtn.addEventListener('click', () => {
      if (state.mode === 'daily') generateDailyPuzzle();
      else newPracticePuzzle();
    });
    els.hintBtn.addEventListener('click', showHint);
    els.closeHintBtn.addEventListener('click', () => els.hintArea.hidden = true);
    els.shareBtn.addEventListener('click', shareResult);
    els.playAgainBtn.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      if (state.isDaily) generateDailyPuzzle();
      else newPracticePuzzle();
    });
    els.shareBtnModal.addEventListener('click', shareResult);
    els.playAgainBtnModal.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      if (state.isDaily) generateDailyPuzzle();
      else newPracticePuzzle();
    });

    // Keyboard buttons
    els.keyboard.addEventListener('click', e => {
      const btn = e.target.closest('.key-btn');
      if (btn && !btn.disabled) {
        const letter = btn.dataset.key;
        els.letterInput.value = letter;
        submitLetter();
      }
    });
  }

  // ===== Puzzle Generation =====
  function generateDailyPuzzle() {
    const today = new Date().toISOString().split('T')[0];
    state.rng = mulberry32(hashString(today + 'wordladder'));
    state.isDaily = true;
    state.hintsUsed = 0;

    const words = DICTIONARY[state.wordLength] || DICTIONARY[5];
    const validPairs = [];

    // Find all solvable pairs
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const path = findShortestPath(words[i], words[j], GRAPHS[state.wordLength]);
        if (path && path.length >= 3 && path.length <= 7) {
          validPairs.push({ start: words[i], end: words[j], path });
        }
      }
    }

    if (validPairs.length === 0) {
      // Fallback
      state.startWord = 'COLD';
      state.endWord = 'WARM';
      state.wordLength = 4;
    } else {
      const pair = validPairs[Math.floor(state.rng() * validPairs.length)];
      state.startWord = pair.start;
      state.endWord = pair.end;
      state.optimalPath = pair.path;
    }

    startGame(state.startWord, state.endWord, true);
  }

  function newPracticePuzzle() {
    state.rng = mulberry32(Date.now());
    state.isDaily = false;
    state.hintsUsed = 0;

    const words = DICTIONARY[state.wordLength] || DICTIONARY[5];
    const validPairs = [];

    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const path = findShortestPath(words[i], words[j], GRAPHS[state.wordLength]);
        if (path && path.length >= 3 && path.length <= 7) {
          validPairs.push({ start: words[i], end: words[j], path });
        }
      }
    }

    if (validPairs.length === 0) {
      state.startWord = 'COLD';
      state.endWord = 'WARM';
      state.optimalPath = ['COLD', 'CORD', 'CARD', 'WARD', 'WARM'];
    } else {
      const pair = validPairs[Math.floor(state.rng() * validPairs.length)];
      state.startWord = pair.start;
      state.endWord = pair.end;
      state.optimalPath = pair.path;
    }

    startGame(state.startWord, state.endWord, false);
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // ===== Game Logic =====
  function startGame(start, end, isDaily) {
    state.startWord = start;
    state.endWord = end;
    state.currentWord = start;
    state.path = [start];
    state.stepCount = 0;
    state.startTime = Date.now();
    state.isPlaying = true;
    state.isDaily = isDaily;

    // Find optimal path if not already known
    if (!state.optimalPath) {
      state.optimalPath = findShortestPath(start, end, GRAPHS[state.wordLength]);
    }

    // Update UI
    els.puzzleLabel.textContent = isDaily ? 'Daily Challenge' : 'Practice Mode';
    els.puzzleDate.textContent = isDaily
      ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : `${state.wordLength} letters • ${state.optimalPath?.length - 1 || '?'} optimal steps`;
    els.targetSteps.textContent = state.optimalPath ? state.optimalPath.length - 1 : '?';
    els.currentStep.textContent = 0;
    els.currentWord.textContent = start;
    els.gameStatus.textContent = `Transform "${start}" into "${end}"`;
    els.gameStatus.className = 'game-status active';

    renderLadder();
    renderKeyboard();
    els.hintArea.hidden = true;
    els.shareBtn.hidden = true;
    els.playAgainBtn.hidden = true;
    els.resultsModal.hidden = true;
    els.newBtn.textContent = isDaily ? 'New Daily' : 'New Puzzle';
  }

  function renderLadder() {
    const container = els.ladderContainer;
    container.innerHTML = '';

    const maxDisplay = state.optimalPath ? state.optimalPath.length : 10;

    for (let i = 0; i < maxDisplay; i++) {
      const step = document.createElement('div');
      step.className = 'ladder-step';
      step.dataset.step = i;

      const num = document.createElement('span');
      num.className = 'ladder-step-number';
      num.textContent = i === 0 ? 'START' : i;
      step.appendChild(num);

      const word = document.createElement('span');
      word.className = 'ladder-step-word';
      if (i < state.path.length) {
        word.textContent = state.path[i];
        if (i === state.path.length - 1) {
          word.classList.add('current');
        } else {
          word.classList.add('correct');
        }
      } else if (i === state.path.length) {
        word.textContent = '_'.repeat(state.wordLength);
        word.classList.add('empty', 'current');
      } else {
        word.textContent = '_'.repeat(state.wordLength);
        word.classList.add('empty');
      }
      step.appendChild(word);

      if (i < maxDisplay - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'ladder-step-arrow';
        arrow.textContent = '→';
        step.appendChild(arrow);
      }

      container.appendChild(step);
    }

    // Scroll to current step
    const currentStep = container.querySelector('.ladder-step-word.current');
    if (currentStep) {
      currentStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function renderKeyboard() {
    const keyboard = els.keyboard;
    keyboard.innerHTML = '';

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    letters.forEach(letter => {
      const btn = document.createElement('button');
      btn.className = 'key-btn';
      btn.dataset.key = letter;
      btn.textContent = letter;
      btn.disabled = false;
      keyboard.appendChild(btn);
    });
  }

  function updateKeyboardState() {
    const usedLetters = new Set();
    for (let i = 1; i < state.path.length; i++) {
      const prev = state.path[i - 1];
      const curr = state.path[i];
      for (let j = 0; j < prev.length; j++) {
        if (prev[j] !== curr[j]) {
          usedLetters.add(curr[j]);
        }
      }
    }

    document.querySelectorAll('.key-btn').forEach(btn => {
      const letter = btn.dataset.key;
      btn.classList.remove('used', 'wrong', 'hint');
      if (usedLetters.has(letter)) {
        btn.classList.add('used');
      }
    });
  }

  function submitLetter() {
    if (!state.isPlaying) return;

    const letter = els.letterInput.value.toUpperCase();
    if (!letter || letter.length !== 1) {
      els.letterInput.focus();
      return;
    }

    const current = state.currentWord;
    const wordLength = current.length;
    let newWord = null;

    // Try each position
    for (let i = 0; i < wordLength; i++) {
      const candidate = current.slice(0, i) + letter + current.slice(i + 1);
      if (candidate !== current && ALL_WORDS.has(candidate)) {
        // Check if it's one letter different from current
        let diff = 0;
        for (let j = 0; j < wordLength; j++) {
          if (current[j] !== candidate[j]) diff++;
        }
        if (diff === 1) {
          newWord = candidate;
          break;
        }
      }
    }

    if (newWord) {
      // Valid move
      state.path.push(newWord);
      state.currentWord = newWord;
      state.stepCount++;
      els.letterInput.value = '';

      els.currentStep.textContent = state.stepCount;
      els.currentWord.textContent = newWord;
      els.gameStatus.textContent = `Good! "${newWord}" → Target: "${state.endWord}"`;
      els.gameStatus.className = 'game-status success';

      renderLadder();
      updateKeyboardState();

      // Check win
      if (newWord === state.endWord) {
        winGame();
      }
    } else {
      // Invalid move
      els.letterInput.value = '';
      els.gameStatus.textContent = `Invalid move. Must be a real word, one letter different from "${current}".`;
      els.gameStatus.className = 'game-status error';

      // Shake animation on current word
      const currentWordEl = document.querySelector('.ladder-step-word.current');
      if (currentWordEl) {
        currentWordEl.classList.add('wrong');
        setTimeout(() => currentWordEl.classList.remove('wrong'), 400);
      }
    }

    els.letterInput.focus();
  }

  function undoStep() {
    if (state.path.length <= 1) return;

    state.path.pop();
    state.currentWord = state.path[state.path.length - 1];
    state.stepCount = Math.max(0, state.stepCount - 1);

    els.currentStep.textContent = state.stepCount;
    els.currentWord.textContent = state.currentWord;
    els.gameStatus.textContent = `Undone. Current: "${state.currentWord}"`;
    els.gameStatus.className = 'game-status active';

    renderLadder();
    updateKeyboardState();
    els.letterInput.focus();
  }

  function clearGame() {
    if (!state.isPlaying) return;
    state.path = [state.startWord];
    state.currentWord = state.startWord;
    state.stepCount = 0;
    state.hintsUsed = 0;

    els.currentStep.textContent = 0;
    els.currentWord.textContent = state.startWord;
    els.gameStatus.textContent = `Cleared. Start: "${state.startWord}" → Target: "${state.endWord}"`;
    els.gameStatus.className = 'game-status active';

    renderLadder();
    updateKeyboardState();
    els.hintArea.hidden = true;
    els.letterInput.focus();
  }

  function showHint() {
    if (!state.isPlaying || !state.optimalPath) return;

    const currentIndex = state.path.length - 1;
    const optimalIndex = state.optimalPath.indexOf(state.currentWord);

    if (optimalIndex === -1 || optimalIndex >= state.optimalPath.length - 1) {
      showToast('No hint available');
      return;
    }

    const nextOptimal = state.optimalPath[optimalIndex + 1];
    const hintLetter = nextOptimal.split('').find((c, i) => c !== state.currentWord[i]);

    state.hintsUsed++;
    els.hintArea.hidden = false;
    els.hintContent.textContent = `Try changing one letter to "${hintLetter}" → ${nextOptimal}`;

    // Highlight hint key
    document.querySelectorAll('.key-btn').forEach(btn => {
      btn.classList.remove('hint');
      if (btn.dataset.key === hintLetter) btn.classList.add('hint');
    });

    els.gameStatus.textContent = `Hint: Next optimal word is "${nextOptimal}"`;
    els.gameStatus.className = 'game-status hint';
  }

  function winGame() {
    state.isPlaying = false;
    const timeTaken = Math.round((Date.now() - state.startTime) / 1000);
    const optimalSteps = state.optimalPath ? state.optimalPath.length - 1 : state.stepCount;
    const efficiency = Math.round((optimalSteps / state.stepCount) * 100);

    saveStats(state.stepCount, optimalSteps, timeTaken, efficiency);

    els.modalTitle.textContent = state.isDaily ? 'Daily Challenge Complete!' : 'Puzzle Solved!';
    els.finalSteps.textContent = state.stepCount;
    els.optimalSteps.textContent = optimalSteps;
    els.efficiency.textContent = efficiency + '%';
    els.finalTime.textContent = formatTime(timeTaken);

    if (state.isDaily) {
      els.dailyResult.hidden = false;
      const dailyStats = state.stats.daily || {};
      const today = new Date().toISOString().split('T')[0];
      const isNewBest = !dailyStats[today] || state.stepCount < dailyStats[today].steps;
      els.dailyMessage.textContent = isNewBest
        ? `🎉 New daily best! ${state.stepCount} steps (optimal: ${optimalSteps})`
        : `Today's best: ${dailyStats[today]?.steps || '—'} steps`;
    } else {
      els.dailyResult.hidden = true;
    }

    // Show optimal solution
    if (state.optimalPath) {
      els.solutionDisplay.hidden = false;
      els.solutionPath.innerHTML = state.optimalPath.map((word, i) => `
        <div class="solution-step">
          <span class="solution-step-number">${i === 0 ? 'START' : i}</span>
          <span class="solution-step-word">${word}</span>
          ${i < state.optimalPath.length - 1 ? '<span class="solution-step-arrow">→</span>' : ''}
        </div>
      `).join('');
    } else {
      els.solutionDisplay.hidden = true;
    }

    els.resultsModal.hidden = false;
    els.shareBtn.hidden = false;
    els.playAgainBtn.hidden = false;
  }

  function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  function saveStats(steps, optimalSteps, time, efficiency) {
    const modeKey = state.isDaily ? 'daily' : 'practice';

    if (!state.stats[modeKey]) {
      state.stats[modeKey] = {
        solved: 0,
        totalSteps: 0,
        bestSteps: Infinity,
        streak: 0,
        bestStreak: 0,
        lastDate: null
      };
    }
    const s = state.stats[modeKey];
    s.solved++;
    s.totalSteps += steps;
    s.bestSteps = Math.min(s.bestSteps, steps);

    // Streak (daily only)
    if (state.isDaily) {
      const today = new Date().toISOString().split('T')[0];
      if (s.lastDate) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (s.lastDate === yesterday) {
          s.streak++;
        } else if (s.lastDate !== today) {
          s.streak = 1;
        }
      } else {
        s.streak = 1;
      }
      s.bestStreak = Math.max(s.bestStreak, s.streak);
      s.lastDate = today;

      // Daily record
      if (!state.stats.daily) state.stats.daily = {};
      if (!state.stats.daily[today] || steps < state.stats.daily[today].steps) {
        state.stats.daily[today] = { steps, optimalSteps, time, efficiency, date: today };
      }
    }

    // Leaderboard
    const lbKey = `${state.wordLength}x${state.isDaily ? 'daily' : 'practice'}`;
    if (!state.leaderboard[lbKey]) state.leaderboard[lbKey] = [];

    state.leaderboard[lbKey].push({
      steps,
      optimalSteps,
      time,
      efficiency,
      date: new Date().toISOString().split('T')[0],
      words: `${state.startWord} → ${state.endWord}`
    });
    state.leaderboard[lbKey].sort((a, b) => a.steps - b.steps || a.time - b.time);
    state.leaderboard[lbKey] = state.leaderboard[lbKey].slice(0, 10);

    localStorage.setItem('wordLadderStats', JSON.stringify(state.stats));
    localStorage.setItem('wordLadderLeaderboard', JSON.stringify(state.leaderboard));

    updateStatsDisplay();
    updateLeaderboard();
  }

  function updateStatsDisplay() {
    const daily = state.stats.daily || { solved: 0, streak: 0, bestStreak: 0, bestSteps: Infinity };
    const practice = state.stats.practice || { solved: 0 };

    els.dailySolved.textContent = daily.solved || '—';
    els.currentStreak.textContent = daily.streak || 0;
    els.bestStreak.textContent = daily.bestStreak || 0;
    els.avgSteps.textContent = daily.solved ? Math.round(daily.totalSteps / daily.solved) : '—';
    els.practiceSolved.textContent = practice.solved || 0;
  }

  function updateLeaderboard() {
    const lbKey = `${state.wordLength}x${state.isDaily ? 'daily' : 'practice'}`;
    const scores = state.leaderboard[lbKey] || [];

    if (scores.length === 0) {
      els.leaderboard.innerHTML = '<div style="color:var(--muted);text-align:center;padding:1rem;">No scores yet</div>';
      return;
    }

    els.leaderboard.innerHTML = scores.map((s, i) => `
      <div class="leaderboard-entry">
        <span class="rank">#${i+1}</span>
        <span class="score">${s.steps} steps (${s.optimalSteps} opt)</span>
        <span class="mode">${s.efficiency}% • ${s.time}s • ${s.date}</span>
      </div>
    `).join('');
  }

  function shareResult() {
    const steps = els.finalSteps.textContent;
    const optimal = els.optimalSteps.textContent;
    const efficiency = els.efficiency.textContent;
    const time = els.finalTime.textContent;
    const mode = state.isDaily ? 'Daily' : 'Practice';
    const text = `🪜 Word Ladder (${mode}, ${state.wordLength} letters)
${state.startWord} → ${state.endWord}
Steps: ${steps}/${optimal} (${efficiency})
Time: ${time}
#KING_YOSEF_`;

    if (navigator.share) {
      navigator.share({ title: 'Word Ladder Result', text });
    } else {
      navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
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