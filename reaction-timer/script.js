// Reaction Timer — KING_YOSEF_
// Types: Simple, Choice, Go/No-Go

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
    mode: 'simple',
    trials: 10,
    choiceCount: 4,
    goProbability: 0.7,
    minDelay: 1000,
    maxDelay: 4000,
    sound: 'beep',
    isDaily: false,
    isRunning: false,
    isWaiting: false,
    isReady: false,
    currentTrial: 0,
    reactions: [],
    errors: 0,
    startTime: 0,
    timeoutId: null,
    targetIndex: 0,
    choices: [],
    correctChoice: 0,
    isGoTrial: true,
    stats: JSON.parse(localStorage.getItem('reactionStats') || '{}'),
    history: JSON.parse(localStorage.getItem('reactionHistory') || '[]'),
    audioCtx: null,
    rng: mulberry32(Date.now()),
  };

  // ===== DOM Elements =====
  const els = {
    gameArea: document.getElementById('gameArea'),
    instruction: document.getElementById('instruction'),
    targetZone: document.getElementById('targetZone'),
    targetCircle: document.getElementById('targetCircle'),
    targetText: document.getElementById('targetText'),
    choiceGrid: document.getElementById('choiceGrid'),
    gonogoDisplay: document.getElementById('gonogoDisplay'),
    gonogoShape: document.getElementById('gonogoShape'),
    gonogoLabel: document.getElementById('gonogoLabel'),
    currentTrial: document.getElementById('currentTrial'),
    totalTrials: document.getElementById('totalTrials'),
    modeBadge: document.getElementById('modeBadge'),
    dailyBadge: document.getElementById('dailyBadge'),
    liveStats: document.getElementById('liveStats'),
    lastReaction: document.getElementById('lastReaction'),
    bestReaction: document.getElementById('bestReaction'),
    avgReaction: document.getElementById('avgReaction'),
    worstReaction: document.getElementById('worstReaction'),
    errorCount: document.getElementById('errorCount'),
    retryBtn: document.getElementById('retryBtn'),
    restartBtn: document.getElementById('restartBtn'),
    startBtn: document.getElementById('startBtn'),
    dailyBtn: document.getElementById('dailyBtn'),
    resultsModal: document.getElementById('resultsModal'),
    historyModal: document.getElementById('historyModal'),
    modalTitle: document.getElementById('modalTitle'),
    finalAvg: document.getElementById('finalAvg'),
    finalBest: document.getElementById('finalBest'),
    finalWorst: document.getElementById('finalWorst'),
    finalStdDev: document.getElementById('finalStdDev'),
    finalErrors: document.getElementById('finalErrors'),
    finalConsistency: document.getElementById('finalConsistency'),
    reactionChart: document.getElementById('reactionChart'),
    dailyResult: document.getElementById('dailyResult'),
    dailyMessage: document.getElementById('dailyMessage'),
    shareBtn: document.getElementById('shareBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    bestSimple: document.getElementById('bestSimple'),
    avgSimple: document.getElementById('avgSimple'),
    bestChoice: document.getElementById('bestChoice'),
    avgChoice: document.getElementById('avgChoice'),
    bestGoNoGo: document.getElementById('bestGoNoGo'),
    dailyStreak: document.getElementById('dailyStreak'),
    testsTaken: document.getElementById('testsTaken'),
    leaderboard: document.getElementById('leaderboard'),
  };

  // Slider elements
  const sliders = {
    trials: document.getElementById('trials'),
    choiceCount: document.getElementById('choiceCount'),
    goProbability: document.getElementById('goProbability'),
    minDelay: document.getElementById('minDelay'),
    maxDelay: document.getElementById('maxDelay'),
  };

  const sliderValues = {
    trials: document.getElementById('trialsValue'),
    choiceCount: document.getElementById('choiceCountValue'),
    goProbability: document.getElementById('goProbValue'),
  };

  // ===== Initialize =====
  function init() {
    setupEventListeners();
    updateSliderDisplays();
    updateStatsDisplay();
    updateLeaderboard();
    updateHistory();
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
        updateModeFields();
        els.modeBadge.textContent = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
      });
    });

    // Sliders
    Object.keys(sliders).forEach(key => {
      if (sliders[key]) {
        sliders[key].addEventListener('input', () => {
          if (key === 'goProbability') {
            state[key] = parseInt(sliders[key].value, 10) / 100;
          } else {
            state[key] = parseInt(sliders[key].value, 10);
          }
          updateSliderDisplays();
        });
      }
    });

    // Sound select
    document.getElementById('soundSelect').addEventListener('change', e => {
      state.sound = e.target.value;
    });

    // Buttons
    els.startBtn.addEventListener('click', () => startTest(false));
    els.dailyBtn.addEventListener('click', () => startTest(true));
    els.retryBtn.addEventListener('click', retryTrial);
    els.restartBtn.addEventListener('click', () => startTest(state.isDaily));
    els.playAgainBtn.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      startTest(state.isDaily);
    });
    els.shareBtn.addEventListener('click', shareResult);
    els.clearHistoryBtn.addEventListener('click', clearHistory);
    els.closeHistoryBtn.addEventListener('click', () => els.historyModal.hidden = true);

    // History tabs
    document.querySelectorAll('.history-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.history-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateHistory(btn.dataset.history);
      });
    });

    // Target zone events
    els.targetZone.addEventListener('click', handleTargetClick);
    els.targetZone.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleTargetClick();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (!state.isRunning || state.mode !== 'choice') return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= state.choiceCount) {
        handleChoiceClick(num - 1);
      }
    });
  }

  function updateModeFields() {
    const isChoice = state.mode === 'choice';
    const isGoNoGo = state.mode === 'gonogo';

    document.getElementById('trialsField').hidden = false;
    document.getElementById('choiceCountField').hidden = !isChoice;
    document.getElementById('goProbabilityField').hidden = !isGoNoGo;
    document.getElementById('delayRangeField').hidden = false;
  }

  function updateSliderDisplays() {
    if (sliderValues.trials) sliderValues.trials.textContent = state.trials;
    if (sliderValues.choiceCount) sliderValues.choiceCount.textContent = state.choiceCount;
    if (sliderValues.goProbability) sliderValues.goProbability.textContent = Math.round(state.goProbability * 100);
  }

  // ===== Audio =====
  function getAudioContext() {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return state.audioCtx;
  }

  function playSound(type) {
    if (state.sound === 'none') return;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (state.sound) {
      case 'beep':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.stop(ctx.currentTime + 0.15);
        break;
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.stop(ctx.currentTime + 0.1);
        break;
      case 'tone':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.stop(ctx.currentTime + 0.3);
        break;
    }

    osc.start();
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
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  // ===== Test Logic =====
  function startTest(isDaily) {
    state.isDaily = isDaily;
    state.isRunning = true;
    state.currentTrial = 0;
    state.reactions = [];
    state.errors = 0;

    els.startBtn.hidden = true;
    els.dailyBtn.hidden = true;
    els.retryBtn.hidden = true;
    els.restartBtn.hidden = false;
    els.resultsModal.hidden = true;
    els.liveStats.hidden = false;

    if (isDaily) {
      els.dailyBadge.hidden = false;
      const today = new Date().toISOString().split('T')[0];
      state.rng = mulberry32(hashString(today + state.mode));
    } else {
      els.dailyBadge.hidden = true;
      state.rng = mulberry32(Date.now());
    }

    els.totalTrials.textContent = state.trials;
    els.currentTrial.textContent = 1;
    updateLiveStats();

    nextTrial();
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function nextTrial() {
    state.currentTrial++;
    els.currentTrial.textContent = state.currentTrial;

    if (state.currentTrial > state.trials) {
      endTest();
      return;
    }

    // Reset UI
    resetTargetUI();
    els.instruction.textContent = getInstructionText();
    els.choiceGrid.hidden = true;
    els.gonogoDisplay.hidden = true;
    els.targetZone.hidden = false;

    // Generate delay
    const delay = state.minDelay + state.rng() * (state.maxDelay - state.minDelay);

    if (state.mode === 'choice') {
      // Choice reaction: show choices after delay
      state.isWaiting = true;
      state.targetIndex = Math.floor(state.rng() * state.choiceCount);
      state.choices = Array.from({ length: state.choiceCount }, (_, i) => i);
      // Shuffle positions but keep track of correct index
      state.choices.sort(() => state.rng() - 0.5);
      state.correctChoice = state.choices.indexOf(state.targetIndex);

      state.timeoutId = setTimeout(() => {
        state.isWaiting = false;
        state.isReady = true;
        showChoices();
        playSound('beep');
        state.startTime = performance.now();
      }, delay);
    } else if (state.mode === 'gonogo') {
      // Go/No-Go
      state.isGoTrial = state.rng() < state.goProbability;
      state.isWaiting = true;

      state.timeoutId = setTimeout(() => {
        state.isWaiting = false;
        state.isReady = true;
        showGoNoGo();
        playSound('beep');
        state.startTime = performance.now();
      }, delay);
    } else {
      // Simple reaction
      state.isWaiting = true;

      state.timeoutId = setTimeout(() => {
        state.isWaiting = false;
        state.isReady = true;
        els.targetZone.classList.remove('waiting');
        els.targetZone.classList.add('ready');
        els.targetText.textContent = 'CLICK!';
        playSound('beep');
        state.startTime = performance.now();
      }, delay);
    }
  }

  function getInstructionText() {
    switch (state.mode) {
      case 'simple':
        return 'Wait for the circle to turn green and say "CLICK", then click/tap/press Space as fast as you can.';
      case 'choice':
        return 'Wait for the buttons to appear, then click the highlighted one as fast as you can. Keys 1-9 also work.';
      case 'gonogo':
        return 'Wait for the shape to appear. If it\'s GREEN (Go) — click! If RED (No-Go) — do nothing.';
    }
  }

  function resetTargetUI() {
    els.targetZone.className = 'target-zone waiting';
    els.targetText.textContent = 'WAIT';
    clearTimeout(state.timeoutId);
    state.isWaiting = false;
    state.isReady = false;
  }

  function showChoices() {
    els.targetZone.hidden = true;
    els.choiceGrid.hidden = false;
    els.choiceGrid.innerHTML = '';

    state.choices.forEach((choiceIdx, position) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choiceIdx + 1;
      btn.dataset.position = position;
      btn.dataset.choice = choiceIdx;
      btn.addEventListener('click', () => handleChoiceClick(position));
      els.choiceGrid.appendChild(btn);
    });

    // Adjust grid columns
    const cols = Math.min(state.choiceCount, 4);
    els.choiceGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  }

  function showGoNoGo() {
    els.targetZone.hidden = true;
    els.gonogoDisplay.hidden = false;

    if (state.isGoTrial) {
      els.gonogoShape.className = 'gonogo-shape go';
      els.gonogoLabel.textContent = 'GO';
    } else {
      els.gonogoShape.className = 'gonogo-shape nogo';
      els.gonogoLabel.textContent = 'NO-GO';
    }
  }

  function handleTargetClick() {
    if (!state.isRunning) return;

    if (state.mode === 'simple') {
      if (state.isWaiting) {
        // Too early!
        handleError();
      } else if (state.isReady) {
        // Good reaction
        const reactionTime = performance.now() - state.startTime;
        recordReaction(reactionTime);
      }
    } else if (state.mode === 'gonogo') {
      if (state.isWaiting) {
        handleError();
      } else if (state.isReady) {
        if (state.isGoTrial) {
          const reactionTime = performance.now() - state.startTime;
          recordReaction(reactionTime);
        } else {
          // False alarm on No-Go
          handleError();
        }
      }
    }
  }

  function handleChoiceClick(position) {
    if (!state.isRunning || !state.isReady) return;

    const isCorrect = position === state.correctChoice;
    const reactionTime = performance.now() - state.startTime;

    // Visual feedback
    const buttons = els.choiceGrid.querySelectorAll('.choice-btn');
    buttons.forEach((btn, i) => {
      btn.classList.remove('correct', 'wrong');
      if (i === state.correctChoice) btn.classList.add('correct');
      if (i === position && !isCorrect) btn.classList.add('wrong');
    });

    if (isCorrect) {
      recordReaction(reactionTime);
    } else {
      handleError();
    }

    // Brief pause then next trial
    setTimeout(() => {
      nextTrial();
    }, 500);
  }

  function recordReaction(time) {
    state.reactions.push(time);
    state.isReady = false;
    updateLiveStats();

    // Visual feedback
    els.targetZone.classList.remove('ready');
    els.targetZone.classList.add('clicked');
    els.targetText.textContent = `${Math.round(time)}ms`;

    playSound('click');

    // Brief pause then next trial
    setTimeout(() => {
      nextTrial();
    }, 500);
  }

  function handleError() {
    state.errors++;
    state.isWaiting = false;
    state.isReady = false;
    updateLiveStats();

    playErrorSound();

    els.targetZone.classList.add('error');
    els.targetText.textContent = state.mode === 'gonogo' && !state.isGoTrial
      ? 'FALSE ALARM!'
      : 'TOO EARLY!';

    setTimeout(() => {
      els.targetZone.classList.remove('error');
      nextTrial();
    }, 800);
  }

  function retryTrial() {
    if (!state.isRunning) return;
    // Remove last reaction if exists
    if (state.reactions.length > 0) {
      state.reactions.pop();
    }
    if (state.errors > 0) state.errors--;
    state.currentTrial--;
    nextTrial();
  }

  function updateLiveStats() {
    const validReactions = state.reactions.filter(r => r > 0);

    els.errorCount.textContent = state.errors;

    if (validReactions.length === 0) {
      els.lastReaction.textContent = '—';
      els.bestReaction.textContent = '—';
      els.avgReaction.textContent = '—';
      els.worstReaction.textContent = '—';
      return;
    }

    const last = validReactions[validReactions.length - 1];
    const best = Math.min(...validReactions);
    const worst = Math.max(...validReactions);
    const avg = validReactions.reduce((a, b) => a + b, 0) / validReactions.length;

    els.lastReaction.textContent = Math.round(last) + 'ms';
    els.bestReaction.textContent = Math.round(best) + 'ms';
    els.avgReaction.textContent = Math.round(avg) + 'ms';
    els.worstReaction.textContent = Math.round(worst) + 'ms';

    els.lastReaction.className = 'live-value';
    els.bestReaction.className = 'live-value best';
    els.avgReaction.className = 'live-value';
    els.worstReaction.className = 'live-value worst';
    els.errorCount.className = state.errors > 0 ? 'live-value error' : 'live-value';
  }

  function endTest() {
    state.isRunning = false;
    clearTimeout(state.timeoutId);

    els.startBtn.hidden = false;
    els.dailyBtn.hidden = false;
    els.retryBtn.hidden = true;
    els.restartBtn.hidden = true;
    els.liveStats.hidden = true;

    const validReactions = state.reactions.filter(r => r > 0);
    if (validReactions.length === 0) {
      showToast('No valid reactions recorded');
      return;
    }

    // Calculate stats
    const avg = validReactions.reduce((a, b) => a + b, 0) / validReactions.length;
    const best = Math.min(...validReactions);
    const worst = Math.max(...validReactions);
    const variance = validReactions.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / validReactions.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - (stdDev / avg * 100));

    // Save to history
    const entry = {
      mode: state.mode,
      date: new Date().toISOString(),
      dateStr: new Date().toLocaleDateString(),
      timeStr: new Date().toLocaleTimeString(),
      trials: state.trials,
      reactions: validReactions,
      avg: Math.round(avg),
      best: Math.round(best),
      worst: Math.round(worst),
      stdDev: Math.round(stdDev),
      errors: state.errors,
      consistency: Math.round(consistency),
      isDaily: state.isDaily,
    };

    state.history.unshift(entry);
    state.history = state.history.slice(0, 100);
    localStorage.setItem('reactionHistory', JSON.stringify(state.history));

    // Update stats
    updateStats(entry);

    // Show results
    els.modalTitle.textContent = state.isDaily ? 'Daily Challenge Complete!' : 'Test Complete!';
    els.finalAvg.textContent = Math.round(avg) + 'ms';
    els.finalBest.textContent = Math.round(best) + 'ms';
    els.finalWorst.textContent = Math.round(worst) + 'ms';
    els.finalStdDev.textContent = Math.round(stdDev) + 'ms';
    els.finalErrors.textContent = state.errors;
    els.finalConsistency.textContent = Math.round(consistency) + '%';

    els.finalErrors.className = state.errors > 0 ? 'result-value error' : 'result-value';
    els.finalConsistency.className = consistency > 80 ? 'result-value' : consistency > 60 ? 'result-value warn' : 'result-value error';

    drawChart(validReactions);

    if (state.isDaily) {
      els.dailyResult.hidden = false;
      const dailyStats = state.stats.daily || {};
      const today = new Date().toISOString().split('T')[0];
      const key = `${state.mode}-${today}`;
      const isNewBest = !dailyStats[key] || avg < dailyStats[key].avg;
      els.dailyMessage.textContent = isNewBest
        ? `🎉 New daily best! Avg: ${Math.round(avg)}ms`
        : `Today's best (${state.mode}): ${dailyStats[key]?.avg || '—'}ms`;
    } else {
      els.dailyResult.hidden = true;
    }

    els.resultsModal.hidden = false;
    updateHistory();
    updateLeaderboard();
  }

  function updateStats(entry) {
    const mode = entry.mode;
    if (!state.stats[mode]) {
      state.stats[mode] = { best: Infinity, total: 0, count: 0, tests: 0 };
    }
    const s = state.stats[mode];
    s.tests++;
    s.count += entry.reactions.length;
    s.total += entry.reactions.reduce((a, b) => a + b, 0);
    s.best = Math.min(s.best, entry.best);

    // Daily streak
    if (entry.isDaily) {
      const today = new Date().toISOString().split('T')[0];
      if (!state.stats.daily) state.stats.daily = {};
      const key = `${mode}-${today}`;
      if (!state.stats.daily[key] || entry.avg < state.stats.daily[key].avg) {
        state.stats.daily[key] = { avg: entry.avg, date: today };
      }

      // Calculate streak
      const dates = Object.keys(state.stats.daily)
        .filter(k => k.startsWith(mode + '-'))
        .map(k => state.stats.daily[k].date)
        .sort()
        .reverse();

      let streak = 0;
      let checkDate = today;
      for (const d of dates) {
        if (d === checkDate) {
          streak++;
          checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
        } else if (d < checkDate) {
          break;
        }
      }
      state.stats.streak = streak;
    }

    localStorage.setItem('reactionStats', JSON.stringify(state.stats));
    updateStatsDisplay();
  }

  function updateStatsDisplay() {
    const modes = ['simple', 'choice', 'gonogo'];
    modes.forEach(mode => {
      const s = state.stats[mode];
      const bestEl = document.getElementById(`best${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
      const avgEl = document.getElementById(`avg${mode.charAt(0).toUpperCase() + mode.slice(1)}`);

      if (s && s.count > 0) {
        bestEl.textContent = Math.round(s.best) + 'ms';
        avgEl.textContent = Math.round(s.total / s.count) + 'ms';
      } else {
        bestEl.textContent = '—';
        avgEl.textContent = '—';
      }
    });

    els.dailyStreak.textContent = state.stats.streak || 0;
    els.testsTaken.textContent = Object.values(state.stats).reduce((sum, s) => sum + (s.tests || 0), 0);
  }

  function updateLeaderboard() {
    const mode = state.mode;
    const modeHistory = state.history
      .filter(h => h.mode === mode)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 10);

    if (modeHistory.length === 0) {
      els.leaderboard.innerHTML = '<div style="color:var(--muted);text-align:center;padding:1rem;">No scores yet</div>';
      return;
    }

    els.leaderboard.innerHTML = modeHistory.map((h, i) => `
      <div class="leaderboard-entry">
        <span class="rank">#${i+1}</span>
        <span class="score">${h.avg}ms avg</span>
        <span class="mode">${h.errors} err • ${h.trials} trials • ${h.dateStr}</span>
      </div>
    `).join('');
  }

  function updateHistory(filter = 'all') {
    let filtered = state.history;
    if (filter !== 'all') {
      filtered = state.history.filter(h => h.mode === filter);
    }

    if (filtered.length === 0) {
      els.historyList.innerHTML = '<div style="color:var(--muted);text-align:center;padding:2rem;">No history yet</div>';
      return;
    }

    els.historyList.innerHTML = filtered.map(h => `
      <div class="history-item">
        <span class="date">${h.dateStr} ${h.timeStr}</span>
        <span class="mode">${h.mode}</span>
        <span class="avg">${h.avg}ms</span>
        <span class="best">${h.best}ms</span>
        <span class="errors">${h.errors} err</span>
      </div>
    `).join('');
  }

  function drawChart(data) {
    const canvas = els.reactionChart;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width = 500 * dpr;
    const h = canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);

    const cw = 500, ch = 200;
    const padding = 40;
    const graphW = cw - padding * 2;
    const graphH = ch - padding * 2;

    // Background
    ctx.fillStyle = '#0f0f14';
    ctx.fillRect(0, 0, cw, ch);

    // Grid
    ctx.strokeStyle = '#2d2d3f';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(cw - padding, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const x = padding + (graphW / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, ch - padding);
      ctx.stroke();
    }

    // Data line
    if (data.length > 1) {
      const maxVal = Math.max(...data);
      const minVal = Math.min(...data);
      const range = Math.max(1, maxVal - minVal);

      ctx.strokeStyle = '#2ee6a6';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      data.forEach((val, i) => {
        const x = padding + (graphW / (data.length - 1)) * i;
        const y = padding + graphH - ((val - minVal) / range) * graphH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Points
      ctx.fillStyle = '#2ee6a6';
      data.forEach((val, i) => {
        const x = padding + (graphW / (data.length - 1)) * i;
        const y = padding + graphH - ((val - minVal) / range) * graphH;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Average line
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      const avgY = padding + graphH - ((avg - minVal) / range) * graphH;
      ctx.strokeStyle = 'rgba(255, 159, 28, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, avgY);
      ctx.lineTo(cw - padding, avgY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ff9f1c';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`Avg: ${Math.round(avg)}ms`, padding + 5, avgY - 5);
    }

    // Y-axis labels
    if (data.length > 0) {
      const maxVal = Math.max(...data);
      const minVal = Math.min(...data);
      ctx.fillStyle = '#9aa0a6';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(maxVal)}ms`, padding - 5, padding + 12);
      ctx.fillText(`${Math.round(minVal)}ms`, padding - 5, ch - padding + 4);
    }

    // X-axis labels
    ctx.fillStyle = '#9aa0a6';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    if (data.length > 1) {
      ctx.fillText('1', padding, ch - padding + 20);
      ctx.fillText(data.length.toString(), cw - padding, ch - padding + 20);
    }
    ctx.fillText('Trial', cw / 2, ch - 5);
  }

  function shareResult() {
    const text = `⚡ Reaction Timer (${state.mode})\nAvg: ${els.finalAvg.textContent} | Best: ${els.finalBest.textContent} | Consistency: ${els.finalConsistency.textContent} | Errors: ${els.finalErrors.textContent}\n#KING_YOSEF_`;
    if (navigator.share) {
      navigator.share({ title: 'Reaction Timer Result', text });
    } else {
      navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
    }
  }

  function clearHistory() {
    if (confirm('Clear all reaction history?')) {
      state.history = [];
      localStorage.setItem('reactionHistory', JSON.stringify(state.history));
      updateHistory();
      updateLeaderboard();
      showToast('History cleared');
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