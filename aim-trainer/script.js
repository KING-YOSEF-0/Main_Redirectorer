// Tactical Aim Trainer Pro — KING_YOSEF_
// 10 Training Modes: Static, Moving, Strafing, Grid, Reaction + Crosshair Customizer, Stats Dashboard, Warm-up, Leaderboard, Session Summary

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
    mode: 'static',
    duration: 30,
    targetSize: 40,
    spawnRate: 1.0,
    lives: 3,
    penalty: 0.5,
    reactionDelay: 2.0,
    crosshair: 'dot',
    chSize: 24,
    chGap: 8,
    chThick: 2,
    chOpacity: 100,
    chTrail: true,
    chDynamic: true,
    chColor: '#00ff88',
    isRunning: false,
    isPaused: false,
    isWarmup: false,
    startTime: 0,
    pauseTime: 0,
    elapsed: 0,
    targets: [],
    particles: [],
    trailPoints: [],
    hits: 0,
    misses: 0,
    shots: 0,
    reactionTimes: [],
    streak: 0,
    bestStreak: 0,
    livesLeft: 3,
    lastSpawn: 0,
    animationId: null,
    reactionState: 'waiting',
    reactionStartTime: 0,
    nextReactionTime: 0,
    crosshairX: 0,
    crosshairY: 0,
    highScores: JSON.parse(localStorage.getItem('aimTrainerScores') || '{}'),
    careerStats: JSON.parse(localStorage.getItem('aimTrainerCareer') || '{"sessions":0,"totalHits":0,"bestAccuracy":0,"bestReaction":Infinity}'),
    canvas: null,
    ctx: null,
    dpr: 1,
    width: 0,
    height: 0,
    rng: mulberry32(Date.now()),
    gridTargets: [],
    gridHitOrder: [],
  };

  // ===== DOM Elements =====
  const els = {
    canvas: document.getElementById('gameCanvas'),
    crosshair: document.getElementById('crosshair'),
    reactionOverlay: document.getElementById('reactionOverlay'),
    reactionRing: document.getElementById('reactionRing'),
    reactionCore: document.getElementById('reactionCore'),
    reactionText: document.getElementById('reactionText'),
    timeLeft: document.getElementById('timeLeft'),
    score: document.getElementById('score'),
    accuracy: document.getElementById('accuracy'),
    hps: document.getElementById('hps'),
    livesLeft: document.getElementById('livesLeft'),
    livesHud: document.getElementById('livesHud'),
    leaderboard: document.getElementById('leaderboard'),
    leaderboardFilter: document.getElementById('leaderboardFilter'),
    startBtn: document.getElementById('startBtn'),
    warmupBtn: document.getElementById('warmupBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    restartBtn: document.getElementById('restartBtn'),
    shareBtn: document.getElementById('shareBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    resultsModal: document.getElementById('resultsModal'),
    finalScore: document.getElementById('finalScore'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    finalAvgReaction: document.getElementById('finalAvgReaction'),
    finalHps: document.getElementById('finalHps'),
    finalStreak: document.getElementById('finalStreak'),
    finalHits: document.getElementById('finalHits'),
    modalMode: document.getElementById('modalMode'),
    reactionChart: document.getElementById('reactionChart'),
    streakChart: document.getElementById('streakChart'),
    canvasContainer: document.getElementById('canvasContainer'),
    gridOverlay: document.getElementById('gridOverlay'),
    warmupIndicator: document.getElementById('warmupIndicator'),
    modeIndicator: document.getElementById('modeIndicator'),
    panelToggle: document.getElementById('panelToggle'),
    controlPanel: document.getElementById('controlPanel'),
    careerSessions: document.getElementById('careerSessions'),
    careerHits: document.getElementById('careerHits'),
    careerAccuracy: document.getElementById('careerAccuracy'),
    careerReaction: document.getElementById('careerReaction'),
    toastContainer: document.getElementById('toastContainer'),
    connectionStatus: document.getElementById('connectionStatus'),
  };

  const sliders = {
    duration: document.getElementById('duration'),
    targetSize: document.getElementById('targetSize'),
    spawnRate: document.getElementById('spawnRate'),
    lives: document.getElementById('lives'),
    penalty: document.getElementById('penalty'),
    reactionDelay: document.getElementById('reactionDelay'),
    chSize: document.getElementById('chSize'),
    chGap: document.getElementById('chGap'),
    chThick: document.getElementById('chThick'),
    chOpacity: document.getElementById('chOpacity'),
  };

  const sliderValues = {
    duration: document.getElementById('durationValue'),
    targetSize: document.getElementById('sizeValue'),
    spawnRate: document.getElementById('spawnRateValue'),
    lives: document.getElementById('livesValue'),
    penalty: document.getElementById('penaltyValue'),
    reactionDelay: document.getElementById('reactionDelayValue'),
    chSize: document.getElementById('chSizeValue'),
    chGap: document.getElementById('chGapValue'),
    chThick: document.getElementById('chThickValue'),
    chOpacity: document.getElementById('chOpacityValue'),
  };

  const toggleInputs = {
    chTrail: document.getElementById('chTrail'),
    chDynamic: document.getElementById('chDynamic'),
  };

  const colorSwatches = document.querySelectorAll('.color-swatch');
  const customColorInput = document.getElementById('chCustomColor');

  // ===== Initialize =====
  function init() {
    setupCanvas();
    setupEventListeners();
    updateLeaderboard();
    updateSliderDisplays();
    updateCareerStats();
    updateCrosshairCSS();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mobile panel toggle
    els.panelToggle.addEventListener('click', () => {
      els.controlPanel.classList.toggle('open');
    });

    // Close panel when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 1100 && els.controlPanel.classList.contains('open')) {
        if (!els.controlPanel.contains(e.target) && !els.panelToggle.contains(e.target)) {
          els.controlPanel.classList.remove('open');
        }
      }
    });
  }

  function setupCanvas() {
    state.canvas = els.canvas;
    state.ctx = state.canvas.getContext('2d');
    state.dpr = window.devicePixelRatio || 1;
  }

  function resizeCanvas() {
    const rect = els.canvasContainer.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    state.canvas.width = state.width * state.dpr;
    state.canvas.height = state.height * state.dpr;
    state.canvas.style.width = state.width + 'px';
    state.canvas.style.height = state.height + 'px';
    state.ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    drawGridOverlay();
  }

  function drawGridOverlay() {
    const canvas = els.gridOverlay;
    canvas.width = state.width;
    canvas.height = state.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.strokeStyle = 'rgba(0,255,136,0.05)';
    ctx.lineWidth = 1;
    const spacing = 50;
    for (let x = 0; x < state.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.height);
      ctx.stroke();
    }
    for (let y = 0; y < state.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }
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
        state.mode = btn.dataset.mode;
        updateModeFields();
        updateLeaderboard();
      });
    });

    // Crosshair presets
    document.querySelectorAll('.ch-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ch-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.crosshair = btn.dataset.ch;
        updateCrosshairCSS();
      });
    });

    // Color swatches
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        colorSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        state.chColor = swatch.dataset.color;
        customColorInput.value = state.chColor;
        updateCrosshairCSS();
      });
    });

    customColorInput.addEventListener('input', () => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      state.chColor = customColorInput.value;
      updateCrosshairCSS();
    });

    // Sliders
    Object.keys(sliders).forEach(key => {
      sliders[key].addEventListener('input', () => {
        const val = key.includes('Rate') || key.includes('Delay') || key.includes('Penalty') || key === 'chOpacity'
          ? parseFloat(sliders[key].value)
          : parseInt(sliders[key].value, 10);
        state[key] = val;
        updateSliderDisplays();
        if (key.startsWith('ch')) updateCrosshairCSS();
      });
    });

    // Toggles
    toggleInputs.chTrail.addEventListener('change', () => {
      state.chTrail = toggleInputs.chTrail.checked;
      updateCrosshairCSS();
    });
    toggleInputs.chDynamic.addEventListener('change', () => {
      state.chDynamic = toggleInputs.chDynamic.checked;
      updateCrosshairCSS();
    });

    // Buttons
    els.startBtn.addEventListener('click', () => startGame(false));
    els.warmupBtn.addEventListener('click', () => startGame(true));
    els.pauseBtn.addEventListener('click', togglePause);
    els.restartBtn.addEventListener('click', () => startGame(state.isWarmup));
    els.playAgainBtn.addEventListener('click', () => {
      els.resultsModal.hidden = true;
      startGame(state.isWarmup);
    });
    els.shareBtn.addEventListener('click', shareResult);
    els.leaderboardFilter.addEventListener('change', updateLeaderboard);

    // Canvas events
    els.canvasContainer.addEventListener('mousemove', e => updateCrosshair(e));
    els.canvasContainer.addEventListener('click', e => handleClick(e));
    els.canvasContainer.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches[0]) updateCrosshair(e.touches[0]);
    }, { passive: false });
    els.canvasContainer.addEventListener('touchstart', e => {
      if (e.touches[0]) handleClick(e.touches[0]);
    }, { passive: false });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' && state.isRunning && !state.isPaused) {
        e.preventDefault();
        handleClick({ clientX: state.crosshairX + els.canvasContainer.getBoundingClientRect().left, clientY: state.crosshairY + els.canvasContainer.getBoundingClientRect().top });
      }
      if (e.key === 'Escape' && state.isRunning) togglePause();
      if (e.key === 'w' || e.key === 'W') {
        if (!state.isRunning) startGame(true);
      }
      if (e.key === 'r' || e.key === 'R') {
        if (state.isRunning) startGame(state.isWarmup);
      }
    });

    // Leaderboard filter
    els.leaderboardFilter.addEventListener('change', updateLeaderboard);
  }

  function updateModeFields() {
    const isReaction = state.mode === 'reaction';
    const isGrid = state.mode === 'grid';

    document.getElementById('spawnGroup').hidden = isReaction || isGrid;
    document.getElementById('livesGroup').hidden = isReaction;
    document.getElementById('penaltyGroup').hidden = isReaction;
    document.getElementById('reactionGroup').hidden = !isReaction;
    els.livesHud.hidden = isReaction;
    els.gridOverlay.hidden = !isGrid;

    if (isGrid) {
      state.spawnRate = 0;
      sliders.spawnRate.value = 0;
    }

    // Update mode indicator
    const modeNames = {
      static: 'STATIC TARGETS',
      moving: 'MOVING TARGETS',
      strafing: 'STRAFING TARGETS',
      grid: 'GRID ACQUISITION',
      reaction: 'REACTION TEST'
    };
    els.modeIndicator.textContent = `MODE: ${modeNames[state.mode]}`;
  }

  function updateSliderDisplays() {
    Object.keys(sliderValues).forEach(key => {
      const val = state[key];
      if (key === 'spawnRate' || key === 'penalty' || key === 'reactionDelay' || key === 'chOpacity') {
        sliderValues[key].textContent = val.toFixed(1);
      } else {
        sliderValues[key].textContent = val;
      }
    });
  }

  function updateCrosshairCSS() {
    const ch = els.crosshair;
    ch.style.setProperty('--ch-size', state.chSize + 'px');
    ch.style.setProperty('--ch-gap', state.chGap + 'px');
    ch.style.setProperty('--ch-thick', state.chThick + 'px');
    ch.style.setProperty('--ch-opacity', state.chOpacity);
    ch.style.setProperty('--ch-color', state.chColor);
    ch.className = 'crosshair ' + state.crosshair + (state.chTrail ? ' trail' : '');
  }

  function updateCareerStats() {
    const cs = state.careerStats;
    els.careerSessions.textContent = cs.sessions;
    els.careerHits.textContent = cs.totalHits.toLocaleString();
    els.careerAccuracy.textContent = cs.bestAccuracy + '%';
    els.careerReaction.textContent = cs.bestReaction === Infinity ? '∞ms' : cs.bestReaction + 'ms';
  }

  // ===== Game Loop =====
  function startGame(isWarmup) {
    state.isWarmup = isWarmup;
    state.isRunning = true;
    state.isPaused = false;
    state.startTime = performance.now();
    state.elapsed = 0;
    state.targets = [];
    state.particles = [];
    state.trailPoints = [];
    state.hits = 0;
    state.misses = 0;
    state.shots = 0;
    state.reactionTimes = [];
    state.streak = 0;
    state.bestStreak = 0;
    state.livesLeft = state.lives;
    state.lastSpawn = 0;
    state.reactionState = 'waiting';
    state.nextReactionTime = state.reactionDelay;
    state.gridTargets = [];
    state.gridHitOrder = [];

    els.startBtn.hidden = true;
    els.warmupBtn.hidden = true;
    els.pauseBtn.hidden = false;
    els.restartBtn.hidden = false;
    els.resultsModal.hidden = true;
    els.warmupIndicator.hidden = !isWarmup;
    els.canvasContainer.classList.toggle('warmup', isWarmup);
    els.crosshair.style.opacity = '1';

    if (isWarmup) {
      showToast('WARM-UP SEQUENCE INITIATED — NO SCORE RECORDED', 'warning');
    } else {
      showToast(`TRAINING STARTED — ${modeNames[state.mode]}`, 'success');
    }

    spawnInitialTargets();
    requestAnimationFrame(gameLoop);
  }

  const modeNames = {
    static: 'STATIC TARGETS',
    moving: 'MOVING TARGETS',
    strafing: 'STRAFING TARGETS',
    grid: 'GRID ACQUISITION',
    reaction: 'REACTION TEST'
  };

  function spawnInitialTargets() {
    if (state.mode === 'grid') {
      spawnGrid();
    } else if (state.mode === 'reaction') {
      state.reactionState = 'waiting';
      state.nextReactionTime = state.reactionDelay;
      els.reactionOverlay.hidden = false;
      els.reactionRing.classList.remove('ready');
      els.reactionText.textContent = 'STANDBY';
    } else {
      spawnTarget();
    }
  }

  function spawnGrid() {
    const cols = 5;
    const rows = 4;
    const padding = 80;
    const cellW = (state.width - padding * 2) / cols;
    const cellH = (state.height - padding * 2) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padding + c * cellW + cellW / 2 + (state.rng() - 0.5) * cellW * 0.25;
        const y = padding + r * cellH + cellH / 2 + (state.rng() - 0.5) * cellH * 0.25;
        state.gridTargets.push({
          x: Math.max(state.targetSize, Math.min(state.width - state.targetSize, x)),
          y: Math.max(state.targetSize, Math.min(state.height - state.targetSize, y)),
          size: state.targetSize,
          hit: false,
          hitTime: 0,
          col: c,
          row: r,
        });
      }
    }
    // Add to active targets
    state.targets = [...state.gridTargets];
  }

  function spawnTarget() {
    if (state.mode === 'grid' || state.mode === 'reaction') return;

    const margin = state.targetSize + 30;
    const x = margin + state.rng() * (state.width - 2 * margin);
    const y = margin + state.rng() * (state.height - 2 * margin);

    let vx = 0, vy = 0;
    if (state.mode === 'moving') {
      const angle = state.rng() * Math.PI * 2;
      const speed = 40 + state.rng() * 60;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else if (state.mode === 'strafing') {
      const angle = state.rng() * Math.PI * 2;
      const speed = 60 + state.rng() * 100;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }

    state.targets.push({
      x, y,
      size: state.targetSize,
      vx, vy,
      spawnTime: performance.now(),
      hit: false,
      hitTime: 0,
      strafeDir: state.mode === 'strafing' ? (state.rng() > 0.5 ? 1 : -1) : 0,
      strafeTimer: 0,
      lastDirChange: 0,
    });
  }

  function gameLoop(timestamp) {
    if (!state.isRunning) return;

    if (state.isPaused) {
      state.animationId = requestAnimationFrame(gameLoop);
      return;
    }

    state.elapsed = (timestamp - state.startTime) / 1000;
    const remaining = Math.max(0, state.duration - state.elapsed);

    updateUI(remaining);
    updateTrail();
    updateTargets(state.elapsed, timestamp);
    render();

    if (remaining <= 0 || (state.mode !== 'reaction' && state.livesLeft <= 0)) {
      endGame();
      return;
    }

    state.animationId = requestAnimationFrame(gameLoop);
  }

  function updateUI(remaining) {
    els.timeLeft.textContent = remaining.toFixed(1);
    const currentScore = state.hits * 100 - state.misses * 50;
    els.score.textContent = currentScore;
    els.accuracy.textContent = state.shots > 0
      ? Math.round((state.hits / state.shots) * 100) + '%'
      : '100%';
    els.hps.textContent = state.elapsed > 0 ? (state.hits / state.elapsed).toFixed(1) : '0.0';
    els.livesLeft.textContent = state.livesLeft;
  }

  function updateTrail() {
    if (!state.chTrail) return;
    state.trailPoints.unshift({ x: state.crosshairX, y: state.crosshairY, life: 1 });
    if (state.trailPoints.length > 20) state.trailPoints.pop();
    state.trailPoints.forEach(p => p.life -= 0.08);
    state.trailPoints = state.trailPoints.filter(p => p.life > 0);
  }

  function updateTargets(elapsed, timestamp) {
    const dt = 1/60;

    // Spawn new targets
    if (state.mode !== 'grid' && state.mode !== 'reaction') {
      const spawnInterval = 1 / Math.max(0.1, state.spawnRate);
      if (elapsed - state.lastSpawn >= spawnInterval) {
        spawnTarget();
        state.lastSpawn = elapsed;
      }
    }

    // Reaction mode logic
    if (state.mode === 'reaction') {
      if (state.reactionState === 'waiting' && elapsed >= state.nextReactionTime) {
        state.reactionState = 'ready';
        els.reactionRing.classList.add('ready');
        els.reactionText.textContent = 'FIRE!';
        state.reactionStartTime = performance.now();
        playSound('signal');
      }
    }

    // Update target positions
    for (let i = state.targets.length - 1; i >= 0; i--) {
      const t = state.targets[i];

      if (t.hit) {
        if (timestamp - t.hitTime > 200) {
          state.targets.splice(i, 1);
        }
        continue;
      }

      if (state.mode === 'moving' || state.mode === 'strafing') {
        t.x += t.vx * dt;
        t.y += t.vy * dt;

        // Bounce off walls
        const margin = t.size;
        if (t.x - margin <= 0 || t.x + margin >= state.width) {
          t.vx *= -1;
          t.x = Math.max(margin, Math.min(state.width - margin, t.x));
        }
        if (t.y - margin <= 0 || t.y + margin >= state.height) {
          t.vy *= -1;
          t.y = Math.max(margin, Math.min(state.height - margin, t.y));
        }

        // Strafing: random direction changes
        if (state.mode === 'strafing') {
          t.strafeTimer += dt;
          if (t.strafeTimer > 0.4 + state.rng() * 1.2) {
            t.strafeTimer = 0;
            const angle = state.rng() * Math.PI * 2;
            const speed = Math.sqrt(t.vx * t.vx + t.vy * t.vy);
            t.vx = Math.cos(angle) * speed;
            t.vy = Math.sin(angle) * speed;
          }
        }
      }

      // Grid mode - remove hit targets
      if (state.mode === 'grid' && t.hit) {
        if (timestamp - t.hitTime > 200) {
          state.targets.splice(i, 1);
        }
      }
    }

    // Update particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.vy += 200 * dt; // gravity
      if (p.life <= 0) {
        state.particles.splice(i, 1);
      }
    }
  }

  function render() {
    const ctx = state.ctx;
    const w = state.width;
    const h = state.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw subtle range lines
    drawRangeLines(ctx, w, h);

    // Draw targets
    state.targets.forEach(t => drawTarget(ctx, t));

    // Draw particles
    state.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size * (p.life / p.maxLife)), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw crosshair trail
    if (state.chTrail && state.trailPoints.length > 1) {
      drawTrail(ctx);
    }
  }

  function drawRangeLines(ctx, w, h) {
    ctx.strokeStyle = 'rgba(0,255,136,0.02)';
    ctx.lineWidth = 1;
    const spacing = 50;
    for (let x = 0; x < w; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Center cross
    ctx.strokeStyle = 'rgba(0,255,136,0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w/2, 0);
    ctx.lineTo(w/2, h);
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();
  }

  function drawTarget(ctx, t) {
    ctx.save();
    ctx.translate(t.x, t.y);

    const size = t.size;
    const hitProgress = t.hit ? Math.min(1, (performance.now() - t.hitTime) / 200) : 0;

    // Outer glow
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.8);
    glowGrad.addColorStop(0, 'rgba(0,255,136,0.3)');
    glowGrad.addColorStop(1, 'rgba(0,255,136,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size * (1.8 + hitProgress), 0, Math.PI * 2);
    ctx.fill();

    // Target rings
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    for (let r = 0.25; r < 1; r += 0.2) {
      ctx.beginPath();
      ctx.arc(0, 0, size * r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Target body
    const bodyGrad = ctx.createRadialGradient(-size*0.3, -size*0.3, 0, 0, 0, size);
    bodyGrad.addColorStop(0, '#1aff88');
    bodyGrad.addColorStop(0.5, '#00cc6e');
    bodyGrad.addColorStop(1, '#009952');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, size * (1 - hitProgress * 0.3), 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(-size*0.25, -size*0.25, size*0.2, 0, Math.PI*2);
    ctx.fill();

    // Center dot
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, size*0.12, 0, Math.PI*2);
    ctx.fill();

    // Hit animation
    if (t.hit && hitProgress < 1) {
      ctx.globalAlpha = 1 - hitProgress;
      const hitGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * (1 + hitProgress * 2));
      hitGrad.addColorStop(0, '#00ff88');
      hitGrad.addColorStop(1, 'rgba(0,255,136,0)');
      ctx.fillStyle = hitGrad;
      ctx.beginPath();
      ctx.arc(0, 0, size * (1 + hitProgress * 2), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawTrail(ctx) {
    if (state.trailPoints.length < 2) return;
    ctx.strokeStyle = state.chColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < state.trailPoints.length; i++) {
      const p1 = state.trailPoints[i-1];
      const p2 = state.trailPoints[i];
      ctx.globalAlpha = p2.life * 0.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ===== Input Handling =====
  function updateCrosshair(e) {
    const rect = els.canvasContainer.getBoundingClientRect();
    state.crosshairX = e.clientX - rect.left;
    state.crosshairY = e.clientY - rect.top;

    els.crosshair.style.left = state.crosshairX + 'px';
    els.crosshair.style.top = state.crosshairY + 'px';
  }

  function handleClick(e) {
    if (!state.isRunning || state.isPaused) return;

    const rect = els.canvasContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    state.shots++;

    if (state.mode === 'reaction') {
      handleReactionClick();
      return;
    }

    // Check target hits
    let hit = false;
    for (let i = state.targets.length - 1; i >= 0; i--) {
      const t = state.targets[i];
      if (t.hit) continue;
      const dx = x - t.x;
      const dy = y - t.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= t.size) {
        hit = true;
        registerHit(t, x, y, i);
        break;
      }
    }

    if (!hit) {
      registerMiss(x, y);
    }
  }

  function handleReactionClick() {
    if (state.reactionState === 'ready') {
      const reactionTime = performance.now() - state.reactionStartTime;
      state.reactionTimes.push(reactionTime);
      state.hits++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      createParticles(state.crosshairX, state.crosshairY, '#00ff88', 20);
      showHitIndicator(state.crosshairX, state.crosshairY, reactionTime);

      // Schedule next
      state.reactionState = 'waiting';
      const jitter = state.rng() * 1.5;
      state.nextReactionTime = state.elapsed + state.reactionDelay + jitter;
      els.reactionRing.classList.remove('ready');
      els.reactionText.textContent = 'STANDBY';
      playSound('hit');
    } else if (state.reactionState === 'waiting') {
      // Early click - penalty
      state.misses++;
      state.streak = 0;
      state.livesLeft = Math.max(0, state.livesLeft - 1);
      createParticles(state.crosshairX, state.crosshairY, '#ff3366', 12);
      showMissIndicator(state.crosshairX, state.crosshairY);
      playSound('miss');
    }
  }

  function registerHit(target, x, y, index) {
    state.hits++;
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    target.hit = true;
    target.hitTime = performance.now();

    const reactionTime = performance.now() - target.spawnTime;
    state.reactionTimes.push(reactionTime);

    createParticles(x, y, '#00ff88', 18);
    showHitIndicator(x, y, reactionTime);
    playSound('hit');

    // Grid mode bonus
    if (state.mode === 'grid') {
      target.hitOrder = state.gridHitOrder.length + 1;
      state.gridHitOrder.push({ x, y, time: reactionTime });
    }
  }

  function registerMiss(x, y) {
    state.misses++;
    state.streak = 0;
    state.livesLeft = Math.max(0, state.livesLeft - 1);
    createParticles(x, y, '#ff3366', 10);
    showMissIndicator(x, y);
    playSound('miss');
  }

  function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = state.rng() * Math.PI * 2;
      const speed = 80 + state.rng() * 200;
      const life = 0.4 + state.rng() * 0.6;
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + state.rng() * 5,
        color,
        life,
        maxLife: life,
      });
    }
  }

  function showHitIndicator(x, y, reactionTime) {
    const indicator = document.createElement('div');
    indicator.className = 'hit-indicator';
    indicator.style.cssText = `
      left: ${x}px; top: ${y}px;
      width: 60px; height: 60px;
      border: 3px solid #00ff88;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 24px #00ff88;
    `;
    els.canvasContainer.appendChild(indicator);
    setTimeout(() => indicator.remove(), 300);
  }

  function showMissIndicator(x, y) {
    const indicator = document.createElement('div');
    indicator.className = 'miss-indicator';
    indicator.style.cssText = `
      left: ${x}px; top: ${y}px;
    `;
    els.canvasContainer.appendChild(indicator);
    setTimeout(() => indicator.remove(), 400);
  }

  // ===== Audio =====
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playSound(type) {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hit') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    } else if (type === 'miss') {
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    } else if (type === 'signal') {
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.05);
      osc.type = 'square';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    }

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  // ===== Game End =====
  function endGame() {
    state.isRunning = false;
    cancelAnimationFrame(state.animationId);
    els.reactionOverlay.hidden = true;
    els.crosshair.style.opacity = '0';

    els.startBtn.hidden = false;
    els.warmupBtn.hidden = false;
    els.pauseBtn.hidden = true;
    els.restartBtn.hidden = true;

    if (state.isWarmup) {
      showToast('WARM-UP COMPLETE — SYSTEMS READY', 'success');
      return;
    }

    // Calculate final stats
    const finalScore = state.hits * 100 - state.misses * 50;
    const finalAccuracy = state.shots > 0 ? Math.round((state.hits / state.shots) * 100) : 100;
    const avgReaction = state.reactionTimes.length > 0
      ? Math.round(state.reactionTimes.reduce((a,b) => a+b, 0) / state.reactionTimes.length)
      : 0;
    const finalHps = state.elapsed > 0 ? (state.hits / state.elapsed).toFixed(1) : '0.0';

    // Update career stats
    updateCareerStatsRecord(finalScore, finalAccuracy, avgReaction, state.hits);

    // Save high score
    saveHighScore(finalScore, finalAccuracy, avgReaction, finalHps);

    // Show results
    els.finalScore.textContent = finalScore;
    els.finalAccuracy.textContent = finalAccuracy + '%';
    els.finalAvgReaction.textContent = avgReaction + 'ms';
    els.finalHps.textContent = finalHps;
    els.finalStreak.textContent = state.bestStreak;
    els.finalHits.textContent = state.hits;
    els.modalMode.textContent = modeNames[state.mode];
    drawReactionChart();
    drawStreakChart();
    els.resultsModal.hidden = false;
  }

  function updateCareerStatsRecord(score, accuracy, avgReaction, hits) {
    const cs = state.careerStats;
    cs.sessions++;
    cs.totalHits += hits;
    cs.bestAccuracy = Math.max(cs.bestAccuracy, accuracy);
    if (avgReaction > 0) cs.bestReaction = Math.min(cs.bestReaction, avgReaction);
    localStorage.setItem('aimTrainerCareer', JSON.stringify(cs));
    updateCareerStats();
  }

  function saveHighScore(score, accuracy, avgReaction, hps) {
    const key = state.mode;
    if (!state.highScores[key]) state.highScores[key] = [];

    const entry = {
      score,
      accuracy,
      avgReaction,
      hps: parseFloat(hps),
      streak: state.bestStreak,
      hits: state.hits,
      shots: state.shots,
      date: new Date().toISOString().split('T')[0],
      duration: state.duration,
      targetSize: state.targetSize,
    };

    state.highScores[key].push(entry);
    state.highScores[key].sort((a, b) => b.score - a.score);
    state.highScores[key] = state.highScores[key].slice(0, 20);

    localStorage.setItem('aimTrainerScores', JSON.stringify(state.highScores));
    updateLeaderboard();
  }

  function updateLeaderboard() {
    const key = els.leaderboardFilter.value;
    const scores = state.highScores[key] || [];

    if (scores.length === 0) {
      els.leaderboard.innerHTML = '<div class="leaderboard-empty">NO RECORDS — INITIATE TRAINING</div>';
      return;
    }

    els.leaderboard.innerHTML = scores.map((s, i) => `
      <div class="leaderboard-entry">
        <span class="rank">#${i+1}</span>
        <span class="score">${s.score}</span>
        <span class="details">
          <span>${s.accuracy}% ACC</span>
          <span>${s.avgReaction}ms AVG</span>
          <span>${s.hps}/s</span>
          <span>×${s.streak} STREAK</span>
        </span>
      </div>
    `).join('');
  }

  function drawReactionChart() {
    const canvas = els.reactionChart;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width = 500 * dpr;
    const h = canvas.height = 180 * dpr;
    ctx.scale(dpr, dpr);

    const cw = 500, ch = 180;
    const data = state.reactionTimes;
    if (data.length === 0) return;

    const maxVal = Math.max(...data, 100);
    const minVal = Math.min(...data);
    const padding = 40;
    const graphW = cw - padding * 2;
    const graphH = ch - padding * 2;

    // Background
    ctx.fillStyle = '#080a0d';
    ctx.fillRect(0, 0, cw, ch);

    // Grid
    ctx.strokeStyle = '#1e2934';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(cw - padding, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const x = padding + (graphW / 6) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, ch - padding);
      ctx.stroke();
    }

    // Area fill
    const areaGrad = ctx.createLinearGradient(0, padding, 0, ch - padding);
    areaGrad.addColorStop(0, 'rgba(0,255,136,0.15)');
    areaGrad.addColorStop(1, 'rgba(0,255,136,0)');
    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    ctx.moveTo(padding, ch - padding);
    data.forEach((val, i) => {
      const x = padding + (graphW / Math.max(1, data.length - 1)) * i;
      const y = padding + graphH - ((val - minVal) / Math.max(1, maxVal - minVal)) * graphH;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + graphW, ch - padding);
    ctx.closePath();
    ctx.fill();

    // Line
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding + (graphW / Math.max(1, data.length - 1)) * i;
      const y = padding + graphH - ((val - minVal) / Math.max(1, maxVal - minVal)) * graphH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Points
    ctx.fillStyle = '#00ff88';
    data.forEach((val, i) => {
      const x = padding + (graphW / Math.max(1, data.length - 1)) * i;
      const y = padding + graphH - ((val - minVal) / Math.max(1, maxVal - minVal)) * graphH;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#6a737d';
    ctx.font = '11px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`${maxVal}ms`, 5, padding + 14);
    ctx.fillText(`${minVal}ms`, 5, ch - padding + 14);
    ctx.textAlign = 'center';
    ctx.fillText('REACTION TIME (ms)', cw/2, ch - 8);
  }

  function drawStreakChart() {
    const canvas = els.streakChart;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width = 500 * dpr;
    const h = canvas.height = 100 * dpr;
    ctx.scale(dpr, dpr);

    const cw = 500, ch = 100;
    const data = state.reactionTimes.map((_, i) => i < state.bestStreak ? 1 : 0); // Simplified streak viz

    // Background
    ctx.fillStyle = '#080a0d';
    ctx.fillRect(0, 0, cw, ch);

    // Streak bars
    const barWidth = cw / Math.max(1, state.hits + state.misses);
    let x = 0;
    let currentStreak = 0;

    for (let i = 0; i < state.hits + state.misses; i++) {
      const isHit = i < state.hits ? true : false; // simplified
      if (isHit) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }

      const intensity = Math.min(1, currentStreak / 10);
      ctx.fillStyle = `rgba(0,255,136,${0.3 + intensity * 0.7})`;
      ctx.fillRect(x, ch - 20 - currentStreak * 3, barWidth - 1, 20 + currentStreak * 3);
      x += barWidth;
    }

    // Best streak label
    ctx.fillStyle = '#00ff88';
    ctx.font = '700 14px Orbitron';
    ctx.textAlign = 'right';
    ctx.fillText(`BEST STREAK: ${state.bestStreak}`, cw - 10, 30);
  }

  function togglePause() {
    if (!state.isRunning) return;
    state.isPaused = !state.isPaused;
    els.pauseBtn.querySelector('span').textContent = state.isPaused ? 'RESUME' : 'PAUSE';

    if (!state.isPaused) {
      state.startTime = performance.now() - state.elapsed * 1000;
      requestAnimationFrame(gameLoop);
    }
  }

  function shareResult() {
    const text = `🎯 TACTICAL AIM TRAINER PRO\nMode: ${modeNames[state.mode]}\nScore: ${els.finalScore.textContent} | Acc: ${els.finalAccuracy.textContent} | Avg: ${els.finalAvgReaction.textContent} | ${els.finalHps.textContent}/s | Streak: ${els.finalStreak.textContent}\n#KING_YOSEF_`;
    if (navigator.share) {
      navigator.share({ title: 'Tactical Aim Trainer Result', text });
    } else {
      navigator.clipboard.writeText(text).then(() => showToast('REPORT COPIED TO CLIPBOARD', 'success'));
    }
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    els.toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ===== Init =====
  init();
})();