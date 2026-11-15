// Simon Sequence — KING_YOSEF_
// Dark Neon Rhythm Game Theme
// 10 Practical Tasks: Classic, Reverse, Speed, Dual, Button Count, Color-blind, Sound-only, Daily Challenge, Streak/Leaderboard, Statistics

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

  // ===== State =====
  const state = {
    mode: 'classic',
    buttonCount: 4,
    speed: 'normal',
    soundTheme: 'pentatonic',
    colorblind: false,
    soundOnly: false,
    isDaily: false,
    isRunning: false,
    isWatching: false,
    isPlayerTurn: false,
    sequence: [],
    dualSequence: [],
    playerSequence: [],
    currentLevel: 1,
    currentStep: 0,
    showIndex: 0,
    currentSpeed: 800,
    stats: JSON.parse(localStorage.getItem('simonStats') || '{}'),
    highScores: JSON.parse(localStorage.getItem('simonScores') || '{}'),
    audioCtx: null,
    speedMs: { slow: 1200, normal: 800, fast: 500, insane: 300 },
    patterns: ['slash', 'dots', 'lines', 'cross', 'tri', 'square', 'diamond', 'ring', 'wave', 'grid'],
    rng: mulberry32(Date.now()),
    lastDailyDate: null,
  };

  // ===== DOM Elements =====
  const els = {
    simonGrid: document.getElementById('simonGrid'),
    currentLevel: document.getElementById('currentLevel'),
    modeBadge: document.getElementById('modeBadge'),
    dailyBadge: document.getElementById('dailyBadge'),
    gameStatus: document.getElementById('gameStatus'),
    startBtn: document.getElementById('startBtn'),
    dailyBtn: document.getElementById('dailyBtn'),
    replayBtn: document.getElementById('replayBtn'),
    restartBtn: document.getElementById('restartBtn'),
    shareBtn: document.getElementById('shareBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    resultsModal: document.getElementById('resultsModal'),
    modalTitle: document.getElementById('modalTitle'),
    finalLevel: document.getElementById('finalLevel'),
    finalMode: document.getElementById('finalMode'),
    finalLength: document.getElementById('finalLength'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    dailyResult: document.getElementById('dailyResult'),
    dailyMessage: document.getElementById('dailyMessage'),
    bestLevel: document.getElementById('bestLevel'),
    avgLevel: document.getElementById('avgLevel'),
    currentStreak: document.getElementById('currentStreak'),
    bestStreak: document.getElementById('bestStreak'),
    dailyBest: document.getElementById('dailyBest'),
    gamesPlayed: document.getElementById('gamesPlayed'),
    leaderboard: document.getElementById('leaderboard'),
    colorblindToggle: document.getElementById('colorblindToggle'),
    soundOnlyToggle: document.getElementById('soundOnlyToggle'),
    speedField: document.getElementById('speedField'),
    keyboardHint: document.getElementById('keyboardHint'),
    particles: document.getElementById('particles'),
  };

  // ===== Initialize =====
  function init() {
    setupEventListeners();
    updateStatsDisplay();
    updateLeaderboard();
    generateButtons();
    spawnBackgroundParticles();
    checkDailyChallenge();
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
        els.modeBadge.textContent = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
        updateSpeedField();
      });
    });

    // Button count
    document.querySelectorAll('.count-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.buttonCount = parseInt(btn.dataset.count, 10);
        generateButtons();
      });
    });

    // Selects
    document.getElementById('speedSelect').addEventListener('change', e => {
      state.speed = e.target.value;
    });
    document.getElementById('soundSelect').addEventListener('change', e => {
      state.soundTheme = e.target.value;
    });

    // Accessibility toggles
    els.colorblindToggle.addEventListener('change', e => {
      state.colorblind = e.target.checked;
      generateButtons();
    });
    els.soundOnlyToggle.addEventListener('change', e => {
      state.soundOnly = e.target.checked;
      generateButtons();
      els.simonGrid.classList.toggle('sound-only', state.soundOnly);
    });

    // Buttons
    els.startBtn.addEventListener('click', () => startGame(false));
    els.dailyBtn.addEventListener('click', () => startGame(true));
    els.replayBtn.addEventListener('click', replaySequence);
    els.restartBtn.addEventListener('click', () => startGame(state.isDaily));
    els.playAgainBtn.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      startGame(state.isDaily);
    });
    els.shareBtn.addEventListener('click', shareResult);

    // Keyboard support
    document.addEventListener('keydown', e => {
      if (!state.isPlayerTurn) return;
      const key = e.key;
      if (key >= '1' && key <= '9') {
        const idx = parseInt(key, 10) - 1;
        if (idx < state.buttonCount) handlePlayerInput(idx);
      }
    });

    // Show keyboard hint on first interaction
    document.addEventListener('click', () => {
      if (els.keyboardHint) els.keyboardHint.style.opacity = '0.7';
    }, { once: true });
  }

  function updateSpeedField() {
    els.speedField.hidden = state.mode !== 'speed';
  }

  function generateButtons() {
    const grid = els.simonGrid;
    grid.innerHTML = '';
    grid.dataset.count = state.buttonCount;
    grid.classList.toggle('sound-only', state.soundOnly);

    const colors = [
      '--simon-0', '--simon-1', '--simon-2', '--simon-3',
      '--simon-4', '--simon-5', '--simon-6', '--simon-7', '--simon-8'
    ];

    for (let i = 0; i < state.buttonCount; i++) {
      const btn = document.createElement('button');
      btn.className = 'simon-btn';
      btn.dataset.index = i;
      btn.style.setProperty('--btn-color', `var(${colors[i % colors.length]})`);
      btn.style.background = `var(${colors[i % colors.length]})`;
      btn.style.color = `var(${colors[i % colors.length]})`;

      // Add number label for sound-only mode
      const numberSpan = document.createElement('span');
      numberSpan.className = 'btn-number';
      numberSpan.textContent = i + 1;
      btn.appendChild(numberSpan);

      if (state.colorblind) {
        btn.dataset.pattern = state.patterns[i % state.patterns.length];
      }

      if (state.soundOnly) {
        btn.style.opacity = '0.2';
      }

      btn.addEventListener('click', () => handlePlayerInput(i));
      btn.addEventListener('mousedown', () => { if (!btn.disabled) btn.classList.add('active'); });
      btn.addEventListener('mouseup', () => btn.classList.remove('active'));
      btn.addEventListener('mouseleave', () => btn.classList.remove('active'));
      btn.addEventListener('touchstart', e => {
        e.preventDefault();
        if (!btn.disabled) btn.classList.add('active');
      }, { passive: false });
      btn.addEventListener('touchend', e => {
        e.preventDefault();
        btn.classList.remove('active');
      }, { passive: false });

      grid.appendChild(btn);
    }
  }

  function spawnBackgroundParticles() {
    const container = els.particles;
    if (!container) return;
    const count = 15;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
      p.style.background = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)'][Math.floor(Math.random() * 5)];
      p.style.opacity = '0';
      p.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
      p.style.animationDelay = Math.random() * 15 + 's';
      p.style.animationDuration = (Math.random() * 10 + 15) + 's';
      container.appendChild(p);
    }
  }

  // ===== Audio =====
  function getAudioContext() {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return state.audioCtx;
  }

  function playTone(index, duration = 300) {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const themes = {
      pentatonic: [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98],
      major: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33],
      chromatic: [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30],
      synth: [220, 330, 440, 550, 660, 880, 1100, 1320, 1760],
    };

    const freq = themes[state.soundTheme][index % themes[state.soundTheme].length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = state.soundTheme === 'synth' ? 'square' : 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  }

  function playErrorSound() {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  function playSuccessSound() {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const t = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  function playLevelUpSound() {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    [392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const t = ctx.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  // ===== Game Logic =====
  function startGame(isDaily) {
    state.isDaily = isDaily;
    state.isRunning = true;
    state.sequence = [];
    state.dualSequence = [];
    state.playerSequence = [];
    state.currentLevel = 1;
    state.currentStep = 0;

    els.startBtn.hidden = true;
    els.dailyBtn.hidden = true;
    els.replayBtn.hidden = true;
    els.restartBtn.hidden = false;
    els.resultsModal.hidden = true;
    els.gameFooter.querySelectorAll('.btn').forEach(b => b.hidden = false);

    if (isDaily) {
      els.dailyBadge.hidden = false;
      const today = new Date().toISOString().split('T')[0];
      state.rng = mulberry32(hashString(today));
      state.lastDailyDate = today;
    } else {
      els.dailyBadge.hidden = true;
      state.rng = mulberry32(Date.now());
    }

    els.modeBadge.textContent = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
    updateLevelDisplay();
    nextRound();
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function nextRound() {
    state.playerSequence = [];
    state.currentStep = 0;

    // Add new step to sequence
    const nextButton = Math.floor(state.rng() * state.buttonCount);
    state.sequence.push(nextButton);

    // Adjust speed for Speed mode
    if (state.mode === 'speed') {
      const baseSpeed = state.speedMs[state.speed];
      const speedFactor = Math.max(0.25, 1 - (state.currentLevel - 1) * 0.06);
      state.currentSpeed = baseSpeed * speedFactor;
    } else {
      state.currentSpeed = state.speedMs[state.speed];
    }

    // For Dual mode, generate second sequence
    if (state.mode === 'dual') {
      state.dualSequence = [];
      for (let i = 0; i < state.currentLevel; i++) {
        state.dualSequence.push(Math.floor(state.rng() * state.buttonCount));
      }
    }

    showSequence();
  }

  function showSequence() {
    state.isWatching = true;
    state.isPlayerTurn = false;
    els.gameStatus.textContent = 'WATCH';
    els.gameStatus.className = 'game-status watching';
    disableButtons(true);

    let delay = 0;
    const showMainSequence = () => {
      state.sequence.forEach((btnIndex, i) => {
        setTimeout(() => {
          flashButton(btnIndex);
          playTone(btnIndex, state.currentSpeed * 0.75);
        }, delay);
        delay += state.currentSpeed;
      });
    };

    showMainSequence();

    // For Reverse mode, also show reversed at the end
    if (state.mode === 'reverse') {
      setTimeout(() => {
        [...state.sequence].reverse().forEach((btnIndex, i) => {
          setTimeout(() => {
            flashButton(btnIndex);
            playTone(btnIndex, state.currentSpeed * 0.75);
          }, i * state.currentSpeed);
        });
      }, delay + 400);
      delay += state.sequence.length * state.currentSpeed + 400;
    }

    // For Dual mode, show second sequence
    if (state.mode === 'dual') {
      setTimeout(() => {
        state.dualSequence.forEach((btnIndex, i) => {
          setTimeout(() => {
            flashButton(btnIndex);
            playTone(btnIndex, state.currentSpeed * 0.75);
          }, i * state.currentSpeed);
        });
      }, delay + 400);
      delay += state.dualSequence.length * state.currentSpeed + 400;
    }

    setTimeout(() => {
      state.isWatching = false;
      state.isPlayerTurn = true;
      els.gameStatus.textContent = 'YOUR TURN';
      els.gameStatus.className = 'game-status playing';
      disableButtons(false);
    }, delay);
  }

  function flashButton(index) {
    const btn = els.simonGrid.children[index];
    if (!btn) return;
    btn.classList.add('active');
    createBurstParticles(btn, index);
    setTimeout(() => btn.classList.remove('active'), state.currentSpeed * 0.6);
  }

  function createBurstParticles(btn, index) {
    const colors = ['var(--simon-0)', 'var(--simon-1)', 'var(--simon-2)', 'var(--simon-3)',
      'var(--simon-4)', 'var(--simon-5)', 'var(--simon-6)', 'var(--simon-7)', 'var(--simon-8)'];
    const color = colors[index % colors.length];

    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'burst-particle';
      const rect = btn.getBoundingClientRect();
      const gridRect = els.simonGrid.getBoundingClientRect();
      p.style.left = (rect.left - gridRect.left + rect.width / 2) + 'px';
      p.style.top = (rect.top - gridRect.top + rect.height / 2) + 'px';
      p.style.width = p.style.height = (Math.random() * 8 + 6) + 'px';
      p.style.background = color;
      const angle = (i / 8) * Math.PI * 2;
      const distance = Math.random() * 60 + 40;
      p.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
      p.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
      els.simonGrid.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }

  function disableButtons(disabled) {
    [...els.simonGrid.children].forEach(btn => {
      btn.disabled = disabled;
      btn.classList.toggle('disabled', disabled);
    });
  }

  function handlePlayerInput(index) {
    if (!state.isPlayerTurn || state.isWatching) return;

    playTone(index, 180);

    const expectedIndex = getExpectedIndex(state.currentStep);

    if (index === expectedIndex) {
      state.playerSequence.push(index);
      state.currentStep++;

      // Visual feedback
      const btn = els.simonGrid.children[index];
      if (btn) {
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 100);
      }

      if (state.currentStep >= getSequenceLength()) {
        // Round complete
        state.isPlayerTurn = false;
        disableButtons(true);
        playSuccessSound();
        playLevelUpSound();
        els.gameStatus.textContent = 'CORRECT!';
        els.gameStatus.className = 'game-status success';
        state.currentLevel++;
        updateLevelDisplay();

        setTimeout(() => {
          nextRound();
        }, 900);
      }
    } else {
      // Wrong!
      gameOver();
    }
  }

  function getExpectedIndex(step) {
    if (state.mode === 'reverse') {
      return state.sequence[state.sequence.length - 1 - step];
    } else if (state.mode === 'dual' && step >= state.sequence.length) {
      return state.dualSequence[step - state.sequence.length];
    }
    return state.sequence[step];
  }

  function getSequenceLength() {
    if (state.mode === 'dual') {
      return state.sequence.length + state.dualSequence.length;
    }
    return state.sequence.length;
  }

  function replaySequence() {
    if (!state.isRunning) return;
    state.isPlayerTurn = false;
    disableButtons(true);
    showSequence();
  }

  function gameOver() {
    state.isRunning = false;
    state.isPlayerTurn = false;
    disableButtons(true);

    playErrorSound();
    els.gameStatus.textContent = 'GAME OVER';
    els.gameStatus.className = 'game-status error';

    // Screen shake
    const gamePanel = document.querySelector('.game-panel');
    if (gamePanel) {
      gamePanel.classList.add('shake');
      setTimeout(() => gamePanel.classList.remove('shake'), 500);
    }

    const finalLevel = state.currentLevel - 1;
    const sequenceLength = getSequenceLength();

    // Calculate accuracy
    let correctCount = 0;
    for (let i = 0; i < state.playerSequence.length; i++) {
      if (state.playerSequence[i] === getExpectedIndex(i)) correctCount++;
    }
    const accuracy = state.playerSequence.length > 0
      ? Math.round((correctCount / state.playerSequence.length) * 100)
      : 0;

    // Save stats
    saveStats(finalLevel, accuracy, sequenceLength);

    // Show results
    setTimeout(() => {
      els.modalTitle.textContent = state.isDaily ? 'DAILY CHALLENGE COMPLETE' : 'GAME OVER';
      els.finalLevel.textContent = finalLevel;
      els.finalMode.textContent = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
      els.finalLength.textContent = sequenceLength;
      els.finalAccuracy.textContent = accuracy + '%';

      if (state.isDaily) {
        els.dailyResult.hidden = false;
        const dailyStats = state.stats.daily || {};
        const today = new Date().toISOString().split('T')[0];
        const isNewBest = !dailyStats[today] || finalLevel > dailyStats[today].level;
        els.dailyMessage.textContent = isNewBest
          ? `🎉 NEW DAILY BEST! Level ${finalLevel}`
          : `Today's best: Level ${dailyStats[today]?.level || '—'}`;
      } else {
        els.dailyResult.hidden = true;
      }

      els.resultsModal.hidden = false;
      els.replayBtn.hidden = true;
      els.restartBtn.hidden = false;
    }, 800);
  }

  function saveStats(level, accuracy, length) {
    // Update general stats
    if (!state.stats.general) {
      state.stats.general = { games: 0, totalLevel: 0, bestLevel: 0, streak: 0, bestStreak: 0 };
    }
    const g = state.stats.general;
    g.games++;
    g.totalLevel += level;
    g.bestLevel = Math.max(g.bestLevel, level);

    // Streak (consecutive games with level >= 5)
    if (level >= 5) {
      g.streak++;
      g.bestStreak = Math.max(g.bestStreak, g.streak);
    } else {
      g.streak = 0;
    }

    // Mode-specific high scores
    if (!state.highScores[state.mode]) state.highScores[state.mode] = [];
    state.highScores[state.mode].push({
      level,
      accuracy,
      length,
      date: new Date().toISOString().split('T')[0],
      buttonCount: state.buttonCount,
    });
    state.highScores[state.mode].sort((a, b) => b.level - a.level || b.accuracy - a.accuracy);
    state.highScores[state.mode] = state.highScores[state.mode].slice(0, 10);

    // Daily challenge
    if (state.isDaily) {
      const today = new Date().toISOString().split('T')[0];
      if (!state.stats.daily) state.stats.daily = {};
      if (!state.stats.daily[today] || level > state.stats.daily[today].level) {
        state.stats.daily[today] = { level, accuracy, length, date: today };
      }
    }

    localStorage.setItem('simonStats', JSON.stringify(state.stats));
    localStorage.setItem('simonScores', JSON.stringify(state.highScores));

    updateStatsDisplay();
    updateLeaderboard();
  }

  function updateStatsDisplay() {
    const g = state.stats.general || {};
    els.bestLevel.textContent = g.bestLevel || '—';
    els.avgLevel.textContent = g.games ? (g.totalLevel / g.games).toFixed(1) : '—';
    els.currentStreak.textContent = g.streak || 0;
    els.bestStreak.textContent = g.bestStreak || 0;
    els.gamesPlayed.textContent = g.games || 0;

    // Daily best
    const daily = state.stats.daily || {};
    const today = new Date().toISOString().split('T')[0];
    els.dailyBest.textContent = daily[today]?.level || '—';
  }

  function updateLeaderboard() {
    const scores = state.highScores[state.mode] || [];
    if (scores.length === 0) {
      els.leaderboard.innerHTML = '<div style="color:var(--muted);text-align:center;padding:1rem;">No scores yet — play a game!</div>';
      return;
    }

    els.leaderboard.innerHTML = scores.map((s, i) => `
      <div class="leaderboard-entry">
        <span class="rank">#${i + 1}</span>
        <span class="score">Level ${s.level}</span>
        <span class="mode">${s.accuracy}% • ${s.buttonCount}btn • ${s.date}</span>
      </div>
    `).join('');
  }

  function updateLevelDisplay() {
    els.currentLevel.textContent = state.currentLevel;
  }

  function shareResult() {
    const level = els.finalLevel.textContent;
    const mode = state.mode;
    const text = `🧠 SIMON SEQUENCE (${mode.toUpperCase()})\nLevel: ${level} | Length: ${els.finalLength.textContent} | Acc: ${els.finalAccuracy.textContent}\n#KING_YOSEF_`;
    if (navigator.share) {
      navigator.share({ title: 'Simon Sequence Result', text });
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

  function checkDailyChallenge() {
    const today = new Date().toISOString().split('T')[0];
    const daily = state.stats.daily || {};
    if (daily[today]) {
      // Already played today - could show a badge
      els.dailyBtn.title = `Today's best: Level ${daily[today].level}`;
    }
  }

  // ===== Init =====
  init();
})();