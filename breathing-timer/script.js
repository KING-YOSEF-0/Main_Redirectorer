const PATTERNS = {
  box: { inhale: 4, hold: 4, exhale: 4, holdOut: 4, name: 'Box Breathing' },
  relax: { inhale: 4, hold: 7, exhale: 8, holdOut: 0, name: '4-7-8 Relax' },
  deep: { inhale: 6, hold: 2, exhale: 8, holdOut: 0, name: 'Deep Calm' },
  coherent: { inhale: 5.5, hold: 0, exhale: 5.5, holdOut: 0, name: 'Coherent' },
  power: { inhale: 2, hold: 0, exhale: 2, holdOut: 0, name: 'Power Breath' },
  wimhof: { inhale: 1.5, hold: 0, exhale: 1.5, holdOut: 0, name: 'Wim Hof' }
};

const SOUNDSCAPES = {
  rain: { name: 'Rain', freq: [200, 800], noise: true },
  ocean: { name: 'Ocean', freq: [80, 200], noise: true },
  forest: { name: 'Forest', freq: [300, 1000], noise: true },
  space: { name: 'Space', freq: [100, 150], noise: false },
  campfire: { name: 'Campfire', freq: [150, 400], noise: true }
};

const BINAURAL = {
  theta: { base: 400, beat: 6 },
  alpha: { base: 400, beat: 10 },
  beta: { base: 400, beat: 20 },
  gamma: { base: 400, beat: 40 }
};

const MOOD_LABELS = { terrible: '😢', bad: '😐', ok: '🙂', good: '😊', great: '😍' };

const state = {
  pattern: 'box',
  inhale: 4, hold: 4, exhale: 4, holdOut: 4,
  duration: 10 * 60, // seconds
  loopMode: 'loop',
  soundscape: 'rain',
  binaural: 'none',
  running: false,
  paused: false,
  phase: 'ready', // ready, inhale, hold, exhale, holdOut
  phaseStart: 0,
  phaseDuration: 0,
  cycleCount: 0,
  sessionStart: 0,
  animationFrame: null,
  audioContext: null,
  soundscapeNode: null,
  binauralNode: null,
  binauralGain: null,
  log: JSON.parse(localStorage.getItem('breathingLog') || '[]')
};

function init() {
  setupBubbles();
  setupEventListeners();
  renderPatterns();
  renderDurationPresets();
  renderSoundscapePresets();
  renderLog();
}

function setupBubbles() {
  const container = document.getElementById('bubbles');
  for (let i = 0; i < 15; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = Math.random() * 60 + 20;
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${Math.random() * 100}vw`;
    b.style.animationDuration = `${Math.random() * 10 + 6}s`;
    b.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(b);
  }
}

function setupEventListeners() {
  document.querySelectorAll('.pattern-presets .preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pattern-presets .preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.pattern = btn.dataset.pattern;
      applyPattern();
    });
  });

  ['inhale', 'hold', 'exhale', 'holdOut'].forEach(id => {
    document.getElementById(id).addEventListener('input', e => {
      state[id] = parseFloat(e.target.value);
      document.getElementById(`${id}Val`).textContent = state[id];
      if (state.running && !state.paused) updatePhase();
    });
  });

  document.querySelectorAll('.duration-presets .preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.duration-presets .preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.duration = parseInt(btn.dataset.min) * 60;
      document.getElementById('durationDisplay').textContent = btn.dataset.min;
    });
  });

  document.getElementById('loopMode').addEventListener('change', e => state.loopMode = e.target.value);

  document.querySelectorAll('.soundscape-presets .preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.soundscape-presets .preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.soundscape = btn.dataset.soundscape;
      if (state.running) setupAudio();
    });
  });

  document.getElementById('binaural').addEventListener('change', e => {
    state.binaural = e.target.value;
    if (state.running) setupAudio();
  });

  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      logMood(btn.dataset.mood);
    });
  });

  document.getElementById('startBtn').addEventListener('click', startSession);
  document.getElementById('pauseBtn').addEventListener('click', pauseSession);
  document.getElementById('stopBtn').addEventListener('click', stopSession);
  document.getElementById('exportLogBtn').addEventListener('click', exportLog);
  document.getElementById('sharePresetBtn').addEventListener('click', sharePreset);
}

function applyPattern() {
  const p = PATTERNS[state.pattern];
  state.inhale = p.inhale; state.hold = p.hold; state.exhale = p.exhale; state.holdOut = p.holdOut;
  document.getElementById('inhale').value = p.inhale; document.getElementById('inhaleVal').textContent = p.inhale;
  document.getElementById('hold').value = p.hold; document.getElementById('holdVal').textContent = p.hold;
  document.getElementById('exhale').value = p.exhale; document.getElementById('exhaleVal').textContent = p.exhale;
  document.getElementById('holdOut').value = p.holdOut; document.getElementById('holdOutVal').textContent = p.holdOut;
}

function renderPatterns() {
  document.querySelectorAll('.pattern-presets .preset-btn').forEach(btn => {
    btn.textContent = PATTERNS[btn.dataset.pattern].name;
  });
}

function renderDurationPresets() {
  document.getElementById('durationDisplay').textContent = state.duration / 60;
}

function renderSoundscapePresets() {
  // Already in HTML
}

function startSession() {
  if (!state.audioContext) initAudio();
  state.running = true; state.paused = false;
  state.cycleCount = 0; state.sessionStart = Date.now();
  state.phase = 'inhale'; state.phaseStart = Date.now(); state.phaseDuration = state.inhale * 1000;
  setupAudio();
  updateUI();
  animate();
}

function pauseSession() {
  if (state.paused) {
    state.paused = false;
    state.phaseStart = Date.now() - (state.phaseDuration - getPhaseRemaining());
    document.getElementById('pauseBtn').textContent = 'Pause';
  } else {
    state.paused = true;
    document.getElementById('pauseBtn').textContent = 'Resume';
  }
  updateUI();
}

function stopSession() {
  state.running = false; state.paused = false;
  cancelAnimationFrame(state.animationFrame);
  stopAudio();
  logSession();
  updateUI();
}

function animate() {
  if (!state.running || state.paused) return;
  updatePhase();
  state.animationFrame = requestAnimationFrame(animate);
}

function updatePhase() {
  const now = Date.now();
  const elapsed = now - state.phaseStart;
  const remaining = Math.max(0, state.phaseDuration - elapsed);

  document.getElementById('phaseCountdown').textContent = (remaining / 1000).toFixed(1);

  if (elapsed >= state.phaseDuration) {
    const phases = ['inhale', 'hold', 'exhale', 'holdOut'];
    const idx = phases.indexOf(state.phase);
    if (idx === phases.length - 1) {
      state.cycleCount++;
      state.phase = 'inhale';
      state.phaseDuration = state.inhale * 1000;
    } else {
      state.phase = phases[idx + 1];
      state.phaseDuration = state[state.phase] * 1000;
    }
    state.phaseStart = now;
    updateRingVisuals();
  }
  updateUI();
}

function getPhaseRemaining() {
  return Math.max(0, state.phaseDuration - (Date.now() - state.phaseStart));
}

function updateUI() {
  const phaseLabels = { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale', holdOut: 'Hold', ready: 'Ready' };
  document.getElementById('phaseText').textContent = phaseLabels[state.phase] || 'Ready';

  const elapsed = Math.floor((Date.now() - state.sessionStart) / 1000);
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');
  document.getElementById('sessionTimer').textContent = `${mins}:${secs}`;
  document.getElementById('cycleCounter').textContent = `Cycle ${state.cycleCount}`;

  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');

  if (state.running) {
    startBtn.disabled = true; startBtn.textContent = 'Running...';
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
  } else {
    startBtn.disabled = false; startBtn.textContent = 'Start Session';
    pauseBtn.disabled = true; pauseBtn.textContent = 'Pause';
    stopBtn.disabled = true;
  }
}

function updateRingVisuals() {
  const outer = document.getElementById('ringOuter');
  const inner = document.getElementById('ringInner');
  const center = document.getElementById('ringCenter');

  const phaseColors = {
    inhale: '#00d4aa', hold: '#4ecdc4', exhale: '#ff6b6b', holdOut: '#ffe66d', ready: '#8b8ba3'
  };
  const color = phaseColors[state.phase] || '#8b8ba3';

  outer.style.borderColor = color;
  inner.style.borderColor = color;
  center.style.boxShadow = `0 0 40px ${color}88, 0 0 80px ${color}44`;
}

function initAudio() {
  state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function setupAudio() {
  stopAudio();
  if (!state.audioContext) return;

  // Soundscape
  if (state.soundscape !== 'none') {
    const sc = SOUNDSCAPES[state.soundscape];
    if (sc.noise) {
      const bufferSize = state.audioContext.sampleRate * 2;
      const buffer = state.audioContext.createBuffer(1, bufferSize, state.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = state.audioContext.createBufferSource();
      noise.buffer = buffer; noise.loop = true;

      const filter = state.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = sc.freq[0] + Math.random() * (sc.freq[1] - sc.freq[0]);
      filter.Q.value = 0.5;

      const gain = state.audioContext.createGain();
      gain.gain.value = 0.15;

      noise.connect(filter).connect(gain).connect(state.audioContext.destination);
      noise.start();
      state.soundscapeNode = { noise, filter, gain };
    }
  }

  // Binaural beats
  if (state.binaural !== 'none') {
    const bb = BINAURAL[state.binaural];
    const osc1 = state.audioContext.createOscillator();
    const osc2 = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();

    osc1.type = 'sine'; osc1.frequency.value = bb.base;
    osc2.type = 'sine'; osc2.frequency.value = bb.base + bb.beat;
    gain.gain.value = 0.08;

    osc1.connect(gain); osc2.connect(gain);
    gain.connect(state.audioContext.destination);
    osc1.start(); osc2.start();

    state.binauralNode = { osc1, osc2, gain };
  }
}

function stopAudio() {
  if (state.soundscapeNode) {
    state.soundscapeNode.noise.stop();
    state.soundscapeNode = null;
  }
  if (state.binauralNode) {
    state.binauralNode.osc1.stop();
    state.binauralNode.osc2.stop();
    state.binauralNode = null;
  }
}

function logSession() {
  const entry = {
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString(),
    pattern: state.pattern,
    duration: Math.floor((Date.now() - state.sessionStart) / 60000),
    cycles: state.cycleCount,
    soundscape: state.soundscape,
    binaural: state.binaural
  };
  state.log.unshift(entry);
  if (state.log.length > 50) state.log = state.log.slice(0, 50);
  localStorage.setItem('breathingLog', JSON.stringify(state.log));
  renderLog();
}

function logMood(mood) {
  const entry = {
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString(),
    mood: mood,
    label: MOOD_LABELS[mood]
  };
  state.log.unshift({ ...entry, type: 'mood' });
  localStorage.setItem('breathingLog', JSON.stringify(state.log));
  renderLog();
}

function renderLog() {
  const container = document.getElementById('sessionLog');
  if (!state.log.length) {
    container.innerHTML = '<p style="color:var(--muted); font-size:0.75rem;">No sessions yet</p>';
    return;
  }
  container.innerHTML = state.log.slice(0, 20).map(e => `
    <div class="log-entry">
      <span>${e.date} ${e.time}</span>
      <span>${e.type === 'mood' ? e.label + ' Mood' : e.pattern + ' • ' + e.duration + 'm • ' + e.cycles + ' cycles'}</span>
    </div>
  `).join('');
}

function exportLog() {
  const headers = ['Date', 'Time', 'Pattern', 'Duration (min)', 'Cycles', 'Soundscape', 'Binaural', 'Mood'];
  const rows = state.log.map(e => [
    e.date, e.time, e.pattern || '', e.duration || '', e.cycles || '',
    e.soundscape || '', e.binaural || '', e.mood || ''
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `breathing_log_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

function sharePreset() {
  const params = new URLSearchParams();
  params.set('pattern', state.pattern);
  params.set('inhale', state.inhale); params.set('hold', state.hold);
  params.set('exhale', state.exhale); params.set('holdOut', state.holdOut);
  params.set('duration', state.duration / 60);
  params.set('loop', state.loopMode);
  params.set('soundscape', state.soundscape);
  params.set('binaural', state.binaural);
  const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(url);
  alert('Preset link copied to clipboard!');
}

document.addEventListener('DOMContentLoaded', init);