// Geo Guess Daily - Guess locations from around the world
// Features: Daily challenge, Practice mode, Streak mode, World Tour
// Uses Leaflet for mapping and Haversine formula for distance calculation

(() => {
  'use strict';

  // ============================================
  // SEEDED PRNG (Mulberry32) for daily locations
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
  // LOCATION DATABASE (Curated list for demo)
  // In a real app, this would be much larger or fetched from an API
  // ============================================
  const LOCATIONS = [
    { id: 1, name: "Eiffel Tower, Paris", lat: 48.8584, lng: 2.2945, country: "France", region: "europe", img: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80" },
    { id: 2, name: "Statue of Liberty, New York", lat: 40.6892, lng: -74.0445, country: "USA", region: "americas", img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80" },
    { id: 3, name: "Colosseum, Rome", lat: 41.8902, lng: 12.4922, country: "Italy", region: "europe", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80" },
    { id: 4, name: "Taj Mahal, Agra", lat: 27.1751, lng: 78.0421, country: "India", region: "asia", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80" },
    { id: 5, name: "Great Wall, Beijing", lat: 40.4319, lng: 116.5704, country: "China", region: "asia", img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80" },
    { id: 6, name: "Machu Picchu", lat: -13.1631, lng: -72.5450, country: "Peru", region: "americas", img: "https://images.unsplash.com/photo-1587590227264-0ac64ce63ce8?auto=format&fit=crop&w=1200&q=80" },
    { id: 7, name: "Pyramids of Giza", lat: 29.9792, lng: 31.1342, country: "Egypt", region: "africa", img: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80" },
    { id: 8, name: "Sydney Opera House", lat: -33.8568, lng: 151.2153, country: "Australia", region: "oceania", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80" },
    { id: 9, name: "Burj Khalifa, Dubai", lat: 25.1972, lng: 55.2744, country: "UAE", region: "asia", img: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=1200&q=80" },
    { id: 10, name: "Mount Fuji", lat: 35.3606, lng: 138.7274, country: "Japan", region: "asia", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80" }
  ];

  // ============================================
  // MATH UTILS
  // ============================================
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calculateScore(distance) {
    // 5000 points max for < 20m, 0 points for > 15,000km
    if (distance < 0.02) return 5000;
    const score = 5000 * Math.exp(-distance / 2000);
    return Math.max(0, Math.round(score));
  }

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  let state = {
    mode: 'daily',
    currentLocation: null,
    guess: null,
    round: 1,
    totalRounds: 5,
    totalScore: 0,
    roundScore: 0,
    history: [],
    map: null,
    marker: null,
    panoZoom: 1,
    panoRotation: 0,
    stats: loadStats(),
    gameStatus: 'idle'
  };

  function loadStats() {
    try {
      const saved = localStorage.getItem('geoGuessStats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      locationsGuessed: 0,
      totalDistance: 0,
      bestDistance: Infinity,
      currentStreak: 0,
      bestStreak: 0,
      countriesFound: new Set(),
      lastDailyDate: null,
      leaderboard: []
    };
  }

  function saveStats() {
    const toSave = { ...state.stats };
    toSave.countriesFound = Array.from(state.stats.countriesFound);
    localStorage.setItem('geoGuessStats', JSON.stringify(toSave));
  }

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const els = {
    panoramaImage: document.getElementById('panoramaImage'),
    mapContainer: document.getElementById('mapContainer'),
    gameStatus: document.getElementById('gameStatus'),
    totalScore: document.getElementById('totalScore'),
    roundScore: document.getElementById('roundScore'),
    puzzleLabel: document.getElementById('puzzleLabel'),
    puzzleMeta: document.getElementById('puzzleMeta'),
    submitGuess: document.getElementById('submitGuess'),
    guessInfo: document.getElementById('guessInfo'),
    guessCoords: document.getElementById('guessCoords'),
    resultsModal: document.getElementById('resultsModal'),
    gameCompleteModal: document.getElementById('gameCompleteModal'),
    dailyBtn: document.getElementById('dailyBtn'),
    newBtn: document.getElementById('newBtn'),
    nextRoundBtn: document.getElementById('nextRoundBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    nextRoundBtnModal: document.getElementById('nextRoundBtnModal'),
    playAgainBtnModal: document.getElementById('playAgainBtnModal'),
    zoomIn: document.getElementById('zoomIn'),
    zoomOut: document.getElementById('zoomOut'),
    compassNeedle: document.getElementById('compassNeedle'),
    leaderboard: document.getElementById('leaderboard')
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function initMap() {
    if (state.map) return;
    state.map = L.map('mapContainer').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(state.map);

    state.map.on('click', (e) => {
      if (state.gameStatus !== 'active') return;
      setGuess(e.latlng.lat, e.latlng.lng);
    });
  }

  function setGuess(lat, lng) {
    state.guess = { lat, lng };
    if (state.marker) {
      state.marker.setLatLng([lat, lng]);
    } else {
      state.marker = L.marker([lat, lng]).addTo(state.map);
    }
    els.guessInfo.hidden = false;
    els.guessCoords.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    els.gameStatus.textContent = "Location selected. Submit your guess!";
    els.gameStatus.className = "game-status guessing";
  }

  function startNewGame(mode = 'daily') {
    state.mode = mode;
    state.round = 1;
    state.totalScore = 0;
    state.history = [];
    state.gameStatus = 'active';

    if (mode === 'daily') {
      const dailyRand = getDailyRandom();
      const locIdx = Math.floor(dailyRand() * LOCATIONS.length);
      state.currentLocation = LOCATIONS[locIdx];
    } else {
      state.currentLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    }

    updateUIForRound();
    initMap();
    resetRoundState();
  }

  function resetRoundState() {
    state.guess = null;
    if (state.marker) {
      state.map.removeLayer(state.marker);
      state.marker = null;
    }
    state.panoZoom = 1;
    state.panoRotation = 0;
    updatePanoTransform();
    els.panoramaImage.style.backgroundImage = `url(${state.currentLocation.img})`;
    els.guessInfo.hidden = true;
    els.gameStatus.textContent = "Look around and guess the location!";
    els.gameStatus.className = "game-status active";
    els.resultsModal.hidden = true;
  }

  function updateUIForRound() {
    els.puzzleLabel.textContent = state.mode === 'daily' ? 'Daily Challenge' : 'Practice Mode';
    els.puzzleMeta.textContent = `Round ${state.round} of ${state.totalRounds}`;
    els.totalScore.textContent = state.totalScore;
    els.roundScore.textContent = '0';
  }

  function updatePanoTransform() {
    els.panoramaImage.style.transform = `scale(${state.panoZoom}) rotate(${state.panoRotation}deg)`;
    els.compassNeedle.style.transform = `rotate(${-state.panoRotation}deg)`;
  }

  // ============================================
  // GAME LOGIC
  // ============================================
  function submitGuess() {
    if (!state.guess || !state.currentLocation) return;

    const dist = haversine(
      state.guess.lat, state.guess.lng,
      state.currentLocation.lat, state.currentLocation.lng
    );
    const score = calculateScore(dist);

    state.roundScore = score;
    state.totalScore += score;
    state.history.push({
      location: state.currentLocation,
      guess: state.guess,
      distance: dist,
      score
    });

    showRoundResults(dist, score);
  }

  function showRoundResults(dist, score) {
    state.gameStatus = 'revealed';
    document.getElementById('resultDistance').textContent = dist < 1 ? `${(dist*1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
    document.getElementById('resultPoints').textContent = score;
    document.getElementById('resultLocation').textContent = state.currentLocation.name;
    document.getElementById('resultGuess').textContent = `${state.guess.lat.toFixed(2)}, ${state.guess.lng.toFixed(2)}`;

    els.resultsModal.hidden = false;

    // Add polyline and actual location marker to map
    const actualLatLng = [state.currentLocation.lat, state.currentLocation.lng];
    const guessLatLng = [state.guess.lat, state.guess.lng];

    L.marker(actualLatLng, { icon: L.divIcon({ className: 'actual-marker', html: '📍' }) }).addTo(state.map);
    L.polyline([actualLatLng, guessLatLng], { color: 'red', dashArray: '5, 10' }).addTo(state.map);
    state.map.fitBounds([actualLatLng, guessLatLng], { padding: [50, 50] });
  }

  function nextRound() {
    if (state.round >= state.totalRounds) {
      finishGame();
      return;
    }

    state.round++;
    state.currentLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    updateUIForRound();
    resetRoundState();
    state.map.setView([20, 0], 2);
    // Clear lines/markers from map
    state.map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        state.map.removeLayer(layer);
      }
    });
  }

  function finishGame() {
    els.resultsModal.hidden = true;
    els.gameCompleteModal.hidden = false;
    document.getElementById('finalScore').textContent = state.totalScore;

    const avgDist = state.history.reduce((acc, curr) => acc + curr.distance, 0) / state.history.length;
    document.getElementById('finalAvgDist').textContent = `${avgDist.toFixed(1)} km`;

    // Update permanent stats
    state.stats.locationsGuessed += state.history.length;
    state.stats.totalDistance += state.history.reduce((acc, curr) => acc + curr.distance, 0);
    const minRoundDist = Math.min(...state.history.map(h => h.distance));
    if (minRoundDist < state.stats.bestDistance) state.stats.bestDistance = minRoundDist;

    state.history.forEach(h => state.stats.countriesFound.add(h.location.country));

    saveStats();
    updateStatsDisplay();
  }

  function updateStatsDisplay() {
    document.getElementById('locationsGuessed').textContent = state.stats.locationsGuessed;
    document.getElementById('avgDistance').textContent = state.stats.locationsGuessed > 0
      ? `${(state.stats.totalDistance / state.stats.locationsGuessed).toFixed(1)} km`
      : '—';
    document.getElementById('bestDistance').textContent = state.stats.bestDistance === Infinity
      ? '—'
      : `${state.stats.bestDistance.toFixed(1)} km`;
    document.getElementById('countriesFound').textContent = state.stats.countriesFound.size || 0;
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  els.dailyBtn.addEventListener('click', () => startNewGame('daily'));
  els.newBtn.addEventListener('click', () => startNewGame('practice'));
  els.submitGuess.addEventListener('click', submitGuess);
  els.nextRoundBtn.addEventListener('click', nextRound);
  els.nextRoundBtnModal.addEventListener('click', nextRound);

  els.zoomIn.addEventListener('click', () => {
    state.panoZoom = Math.min(state.panoZoom + 0.2, 3);
    updatePanoTransform();
  });

  els.zoomOut.addEventListener('click', () => {
    state.panoZoom = Math.max(state.panoZoom - 0.2, 1);
    updatePanoTransform();
  });

  // Simple drag rotation
  let isDragging = false;
  let startX = 0;
  els.panoramaImage.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    state.panoRotation += dx * 0.1;
    startX = e.clientX;
    updatePanoTransform();
  });
  window.addEventListener('mouseup', () => isDragging = false);

  // Initialize
  updateStatsDisplay();
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dailyDate').textContent = today;

  // Mode tabs
  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      els.dailyFields.hidden = state.mode !== 'daily';
      els.newBtn.hidden = state.mode === 'daily';
    });
  });

})();