// Aim Trainer — KING_YOSEF_
// Modes: Static, Moving, Strafing, Grid, Reaction

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
    spawnRate: 1,
    lives: 3,
    penalty: 0.5,
    reactionDelay: 2,
    crosshair: 'dot',
    isRunning: false,
    isPaused: false,
    isWarmup: false,
    startTime: 0,
    pauseTime: 0,
    elapsed: 0,
    targets: [],
    particles: [],
    hits: 0,
    misses: 0,
    shots: 0,
    reactionTimes: [],
    livesLeft: 3,
    lastSpawn: 0,
    animationId: null,
    reactionState: 'waiting', // waiting, ready, active
    reactionStartTime: 0,
    nextReactionTime: 0,
    highScores: JSON.parse(localStorage.getItem('aimTrainerScores') || '{}'),
    canvas: null,
    ctx: null,
    dpr: 1,
    width: 0,
    height: 0,
    rng: mulberry32(Date.now()),
  };

  // ===== DOM Elements =====
  const els = {
    canvas: document.getElementById('gameCanvas'),
    crosshair: document.getElementById('crosshair'),
    reactionOverlay: document.getElementById('reactionOverlay'),
    reactionCircle: document.getElementById('reactionCircle'),
    reactionText: document.getElementById('reactionText'),
    timeLeft: document.getElementById('timeLeft'),
    score: document.getElementById('score'),
    accuracy: document.getElementById('accuracy'),
    hps: document.getElementById('hps'),
    livesLeft: document.getElementById('livesLeft'),
    livesStat: document.getElementById('livesStat'),
    leaderboard: document.getElementById('leaderboard'),
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
    reactionChart: document.getElementById('reactionChart'),
    canvasWrapper: document.getElementById('canvasWrapper'),
    spawnRateField: document.getElementById('spawnRateField'),
    livesField: document.getElementById('livesField'),
    penaltyField: document.getElementById('penaltyField'),
    reactionDelayField: document.getElementById('reactionDelayField'),
  };

  const sliders = {
    duration: document.getElementById('duration'),
    targetSize: document.getElementById('targetSize'),
    spawnRate: document.getElementById('spawnRate'),
    lives: document.getElementById('lives'),
    penalty: document.getElementById('penalty'),
    reactionDelay: document.getElementById('reactionDelay'),
  };

  const sliderValues = {
    duration: document.getElementById('durationValue'),
    targetSize: document.getElementById('sizeValue'),
    spawnRate: document.getElementById('spawnRateValue'),
    lives: document.getElementById('livesValue'),
    penalty: document.getElementById('penaltyValue'),
    reactionDelay: document.getElementById('reactionDelayValue'),
  };

  // ===== Initialize =====
  function init() {
    setupCanvas();
    setupEventListeners();
    updateLeaderboard();
    updateSliderDisplays();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function setupCanvas() {
    state.canvas = els.canvas;
    state.ctx = state.canvas.getContext('2d');
    state.dpr = window.devicePixelRatio || 1;
  }

  function resizeCanvas() {
    const rect = els.canvasWrapper.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    state.canvas.width = state.width * state.dpr;
    state.canvas.height = state.height * state.dpr;
    state.canvas.style.width = state.width + 'px';
    state.canvas.style.height = state.height + 'px';
    state.ctx.scale(state.dpr, state.dpr);
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
      });
    });

    // Crosshair options
    document.querySelectorAll('.crosshair-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.crosshair-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.crosshair = btn.dataset.crosshair;
        els.crosshair.className = 'crosshair ' + state.crosshair;
      });
    });

    // Sliders
    Object.keys(sliders).forEach(key => {
      sliders[key].addEventListener('input', () => {
        state[key] = key === 'spawnRate' || key === 'penalty' || key === 'reactionDelay'
          ? parseFloat(sliders[key].value)
          : parseInt(sliders[key].value, 10);
        updateSliderDisplays();
      });
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

    // Canvas events
    els.canvasWrapper.addEventListener('mousemove', e => updateCrosshair(e));
    els.canvasWrapper.addEventListener('click', e => handleClick(e));
    els.canvasWrapper.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches[0]) updateCrosshair(e.touches[0]);
    }, { passive: false });
    els.canvasWrapper.addEventListener('touchstart', e => {
      if (e.touches[0]) handleClick(e.touches[0]);
    }, { passive: false });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' && state.isRunning && !state.isPaused) {
        e.preventDefault();
        handleClick({ clientX: state.crosshairX, clientY: state.crosshairY });
      }
      if (e.key === 'Escape' && state.isRunning) togglePause();
    });
  }

  function updateModeFields() {
    const isReaction = state.mode === 'reaction';
    const isGrid = state.mode === 'grid';
    const showSpawn = !isReaction && !isGrid;
    const showLives = state.mode !== 'reaction';

    els.spawnRateField.hidden = !showSpawn;
    els.livesField.hidden = !showLives;
    els.penaltyField.hidden = !showLives;
    els.reactionDelayField.hidden = !isReaction;
    els.livesStat.hidden = !showLives;

    if (isGrid) {
      state.spawnRate = 0;
      sliders.spawnRate.value = 0;
    }
  }

  function updateSliderDisplays() {
    Object.keys(sliderValues).forEach(key => {
      const val = state[key];
      sliderValues[key].textContent = key === 'spawnRate' || key === 'penalty' || key === 'reactionDelay'
        ? val.toFixed(1)
        : val;
    });
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
    state.hits = 0;
    state.misses = 0;
    state.shots = 0;
    state.reactionTimes = [];
    state.livesLeft = state.lives;
    state.lastSpawn = 0;
    state.reactionState = 'waiting';
    state.nextReactionTime = state.reactionDelay;

    els.startBtn.hidden = true;
    els.warmupBtn.hidden = true;
    els.pauseBtn.hidden = false;
    els.restartBtn.hidden = false;
    els.resultsModal.hidden = true;
    els.canvasWrapper.classList.toggle('warmup', isWarmup);

    if (isWarmup) {
      showToast('Warm-up mode — no score saved');
    }

    spawnInitialTargets();
    requestAnimationFrame(gameLoop);
  }

  function spawnInitialTargets() {
    if (state.mode === 'grid') {
      spawnGrid();
    } else if (state.mode === 'reaction') {
      state.reactionState = 'waiting';
      state.nextReactionTime = state.reactionDelay;
      els.reactionOverlay.hidden = false;
      els.reactionCircle.classList.remove('ready');
      els.reactionText.textContent = 'WAIT...';
    } else {
      // Spawn first target immediately
      spawnTarget();
    }
  }

  function spawnGrid() {
    const cols = 4;
    const rows = 3;
    const padding = 60;
    const cellW = (state.width - padding * 2) / cols;
    const cellH = (state.height - padding * 2) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padding + c * cellW + cellW / 2 + (state.rng() - 0.5) * cellW * 0.3;
        const y = padding + r * cellH + cellH / 2 + (state.rng() - 0.5) * cellH * 0.3;
        state.targets.push({
          x: Math.max(state.targetSize, Math.min(state.width - state.targetSize, x)),
          y: Math.max(state.targetSize, Math.min(state.height - state.targetSize, y)),
          size: state.targetSize,
          vx: 0,
          vy: 0,
          spawnTime: performance.now(),
        });
      }
    }
  }

  function spawnTarget() {
    if (state.mode === 'grid' || state.mode === 'reaction') return;

    const margin = state.targetSize + 20;
    const x = margin + state.rng() * (state.width - 2 * margin);
    const y = margin + state.rng() * (state.height - 2 * margin);

    let vx = 0, vy = 0;
    if (state.mode === 'moving') {
      const angle = state.rng() * Math.PI * 2;
      const speed = 30 + state.rng() * 50;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    } else if (state.mode === 'strafing') {
      const angle = state.rng() * Math.PI * 2;
      const speed = 50 + state.rng() * 80;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }

    state.targets.push({
      x, y,
      size: state.targetSize,
      vx, vy,
      spawnTime: performance.now(),
      strafeDir: state.mode === 'strafing' ? (state.rng() > 0.5 ? 1 : -1) : 0,
      strafeTimer: 0,
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
    updateTargets(state.elapsed);
    render();

    if (remaining <= 0 || (state.mode !== 'reaction' && state.livesLeft <= 0)) {
      endGame();
      return;
    }

    state.animationId = requestAnimationFrame(gameLoop);
  }

  function updateUI(remaining) {
    els.timeLeft.textContent = remaining.toFixed(1);
    els.score.textContent = state.hits * 100 - state.misses * 50;
    els.accuracy.textContent = state.shots > 0
      ? Math.round((state.hits / state.shots) * 100) + '%'
      : '100%';
    els.hps.textContent = state.elapsed > 0 ? (state.hits / state.elapsed).toFixed(1) : '0.0';
    els.livesLeft.textContent = state.livesLeft;
  }

  function updateTargets(elapsed) {
    const dt = 1/60; // Fixed timestep for physics

    // Spawn new targets
    if (state.mode !== 'grid' && state.mode !== 'reaction') {
      const spawnInterval = 1 / state.spawnRate;
      if (elapsed - state.lastSpawn >= spawnInterval) {
        spawnTarget();
        state.lastSpawn = elapsed;
      }
    }

    // Reaction mode logic
    if (state.mode === 'reaction') {
      if (state.reactionState === 'waiting' && elapsed >= state.nextReactionTime) {
        state.reactionState = 'ready';
        els.reactionCircle.classList.add('ready');
        els.reactionText.textContent = 'CLICK!';
        state.reactionStartTime = performance.now();
      }
    }

    // Update target positions
    for (let i = state.targets.length - 1; i >= 0; i--) {
      const t = state.targets[i];

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
          if (t.strafeTimer > 0.5 + state.rng() * 1.5) {
            t.strafeTimer = 0;
            const angle = state.rng() * Math.PI * 2;
            const speed = Math.sqrt(t.vx * t.vx + t.vy * t.vy);
            t.vx = Math.cos(angle) * speed;
            t.vy = Math.sin(angle) * speed;
          }
        }
      }

      // Remove targets that have been hit (animation finished)
      if (t.hit && t.hitTime && elapsed - t.hitTime > 0.2) {
        state.targets.splice(i, 1);
      }
    }

    // Update particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life -= dt;
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

    // Draw grid lines for reference (subtle)
    if (state.mode === 'grid') {
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
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
    }

    // Draw targets
    state.targets.forEach(t => {
      ctx.save();
      ctx.translate(t.x, t.y);

      // Outer glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, t.size);
      gradient.addColorStop(0, 'rgba(46, 230, 166, 0.4)');
      gradient.addColorStop(1, 'rgba(46, 230, 166, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, t.size * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Target body
      const bodyGrad = ctx.createRadialGradient(-t.size*0.3, -t.size*0.3, 0, 0, 0, t.size);
      bodyGrad.addColorStop(0, '#4ef5b0');
      bodyGrad.addColorStop(0.7, '#2ee6a6');
      bodyGrad.addColorStop(1, '#1db88a');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(0, 0, t.size, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(-t.size*0.3, -t.size*0.3, t.size*0.25, 0, Math.PI*2);
      ctx.fill();

      // Rings
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      for (let r = 0.3; r < 1; r += 0.2) {
        ctx.beginPath();
        ctx.arc(0, 0, t.size * r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Hit animation
      if (t.hit) {
        const progress = Math.min(1, (performance.now()/1000 - t.hitTime) / 0.15);
        ctx.globalAlpha = 1 - progress;
        ctx.fillStyle = '#2ee6a6';
        ctx.beginPath();
        ctx.arc(0, 0, t.size * (1 + progress * 2), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // Draw particles
    state.particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // ===== Input Handling =====
  function updateCrosshair(e) {
    const rect = els.canvasWrapper.getBoundingClientRect();
    state.crosshairX = e.clientX - rect.left;
    state.crosshairY = e.clientY - rect.top;

    els.crosshair.style.left = state.crosshairX + 'px';
    els.crosshair.style.top = state.crosshairY + 'px';
  }

  function handleClick(e) {
    if (!state.isRunning || state.isPaused) return;

    const rect = els.canvasWrapper.getBoundingClientRect();
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
      const dx = x - t.x;
      const dy = y - t.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= t.size) {
        hit = true;
        registerHit(t, x, y);
        state.targets.splice(i, 1);
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
      createParticles(state.crosshairX, state.crosshairY, '#2ee6a6', 15);

      // Schedule next
      state.reactionState = 'waiting';
      state.nextReactionTime = state.elapsed + state.reactionDelay + state.rng() * 2;
      els.reactionCircle.classList.remove('ready');
      els.reactionText.textContent = 'WAIT...';
    } else if (state.reactionState === 'waiting') {
      // Early click - penalty
      state.misses++;
      state.livesLeft = Math.max(0, state.livesLeft - 1);
      createParticles(state.crosshairX, state.crosshairY, '#ff4fa3', 10);
    }
  }

  function registerHit(target, x, y) {
    state.hits++;
    target.hit = true;
    target.hitTime = performance.now() / 1000;

    const reactionTime = (performance.now() - target.spawnTime);
    state.reactionTimes.push(reactionTime);

    createParticles(x, y, '#2ee6a6', 20);
    playSound('hit');
  }

  function registerMiss(x, y) {
    state.misses++;
    state.livesLeft = Math.max(0, state.livesLeft - 1);
    createParticles(x, y, '#ff4fa3', 10);
    playSound('miss');

    // Visual feedback on canvas
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: absolute; left: ${x}px; top: ${y}px;
      width: 40px; height: 40px;
      border: 3px solid var(--accent);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none; z-index: 20;
      animation: missFlash 0.1s ease-out 3;
    `;
    els.canvasWrapper.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
  }

  function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = state.rng() * Math.PI * 2;
      const speed = 50 + state.rng() * 150;
      const life = 0.3 + state.rng() * 0.5;
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + state.rng() * 4,
        color,
        life,
        maxLife: life,
      });
    }
  }

  // ===== Audio =====
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'hit') {
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    }

    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }

  // ===== Game End =====
  function endGame() {
    state.isRunning = false;
    cancelAnimationFrame(state.animationId);
    els.reactionOverlay.hidden = true;

    els.startBtn.hidden = false;
    els.warmupBtn.hidden = false;
    els.pauseBtn.hidden = true;
    els.restartBtn.hidden = true;

    if (state.isWarmup) {
      showToast('Warm-up complete!');
      return;
    }

    // Calculate final stats
    const finalScore = state.hits * 100 - state.misses * 50;
    const finalAccuracy = state.shots > 0 ? Math.round((state.hits / state.shots) * 100) : 100;
    const avgReaction = state.reactionTimes.length > 0
      ? Math.round(state.reactionTimes.reduce((a,b) => a+b, 0) / state.reactionTimes.length)
      : 0;
    const finalHps = state.elapsed > 0 ? (state.hits / state.elapsed).toFixed(1) : '0.0';

    // Save high score
    saveHighScore(finalScore, finalAccuracy, avgReaction, finalHps);

    // Show results
    els.finalScore.textContent = finalScore;
    els.finalAccuracy.textContent = finalAccuracy + '%';
    els.finalAvgReaction.textContent = avgReaction + 'ms';
    els.finalHps.textContent = finalHps;
    drawReactionChart();
    els.resultsModal.hidden = false;
  }

  function saveHighScore(score, accuracy, avgReaction, hps) {
    const key = state.mode;
    if (!state.highScores[key]) state.highScores[key] = [];

    const entry = {
      score,
      accuracy,
      avgReaction,
      hps: parseFloat(hps),
      date: new Date().toISOString().split('T')[0],
      duration: state.duration,
      targetSize: state.targetSize,
    };

    state.highScores[key].push(entry);
    state.highScores[key].sort((a, b) => b.score - a.score);
    state.highScores[key] = state.highScores[key].slice(0, 10);

    localStorage.setItem('aimTrainerScores', JSON.stringify(state.highScores));
    updateLeaderboard();
  }

  function updateLeaderboard() {
    const key = state.mode;
    const scores = state.highScores[key] || [];

    if (scores.length === 0) {
      els.leaderboard.innerHTML = '<div style="color:var(--muted);text-align:center;padding:1rem;">No scores yet</div>';
      return;
    }

    els.leaderboard.innerHTML = scores.map((s, i) => `
      <div class="leaderboard-entry">
        <span class="rank">#${i+1}</span>
        <span class="score">${s.score}</span>
        <span class="mode">${s.accuracy}% • ${s.avgReaction}ms • ${s.hps}/s</span>
      </div>
    `).join('');
  }

  function drawReactionChart() {
    const canvas = els.reactionChart;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width = 400 * dpr;
    const h = canvas.height = 150 * dpr;
    ctx.scale(dpr, dpr);

    const cw = 400, ch = 150;
    const data = state.reactionTimes;
    if (data.length === 0) return;

    const maxVal = Math.max(...data, 100);
    const minVal = Math.min(...data);
    const padding = 20;
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

    // Line
    ctx.strokeStyle = '#2ee6a6';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    data.forEach((val, i) => {
      const x = padding + (graphW / Math.max(1, data.length - 1)) * i;
      const y = padding + graphH - ((val - minVal) / Math.max(1, maxVal - minVal)) * graphH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points
    ctx.fillStyle = '#2ee6a6';
    data.forEach((val, i) => {
      const x = padding + (graphW / Math.max(1, data.length - 1)) * i;
      const y = padding + graphH - ((val - minVal) / Math.max(1, maxVal - minVal)) * graphH;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#9aa0a6';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`${maxVal}ms`, 5, padding + 12);
    ctx.fillText(`${minVal}ms`, 5, ch - padding + 12);
  }

  function togglePause() {
    if (!state.isRunning) return;
    state.isPaused = !state.isPaused;
    els.pauseBtn.textContent = state.isPaused ? 'Resume' : 'Pause';

    if (!state.isPaused) {
      state.startTime = performance.now() - state.elapsed * 1000;
      requestAnimationFrame(gameLoop);
    }
  }

  function shareResult() {
    const text = `🎯 Aim Trainer (${state.mode})\nScore: ${els.finalScore.textContent} | Acc: ${els.finalAccuracy.textContent} | Avg: ${els.finalAvgReaction.textContent} | ${els.finalHps.textContent}/s\n#KING_YOSEF_`;
    if (navigator.share) {
      navigator.share({ title: 'Aim Trainer Result', text });
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