const state = {
  habits: JSON.parse(localStorage.getItem('habits') || '[]'),
  completions: JSON.parse(localStorage.getItem('completions') || '{}'), // { "habitId_YYYY-MM-DD": value }
  currentDate: new Date().toISOString().split('T')[0],
  activeTab: 'today'
};

function init() {
  setupBubbles();
  setupEventListeners();
  render();
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
  document.getElementById('habitType').addEventListener('change', e => {
    document.getElementById('targetField').hidden = e.target.value === 'boolean';
  });

  document.getElementById('habitForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('habitName').value.trim();
    const category = document.getElementById('habitCategory').value;
    const type = document.getElementById('habitType').value;
    const target = parseInt(document.getElementById('habitTarget').value) || 1;
    const frequency = document.getElementById('habitFrequency').value;
    const color = document.querySelector('input[name="color"]:checked').value;

    if (!name) return;

    const habit = {
      id: 'h_' + Date.now(),
      name,
      category,
      type,
      target,
      frequency,
      color,
      createdAt: new Date().toISOString()
    };

    state.habits.push(habit);
    saveState();
    e.target.reset();
    document.getElementById('targetField').hidden = true;
    render();
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.hidden = true);
      btn.classList.add('active');
      state.activeTab = btn.dataset.tab;
      document.getElementById(`tab${capitalize(state.activeTab)}`).hidden = false;
      renderTabContent();
    });
  });

  document.getElementById('prevDay').addEventListener('click', () => {
    const d = new Date(state.currentDate);
    d.setDate(d.getDate() - 1);
    state.currentDate = d.toISOString().split('T')[0];
    renderToday();
  });

  document.getElementById('nextDay').addEventListener('click', () => {
    const d = new Date(state.currentDate);
    d.setDate(d.getDate() + 1);
    state.currentDate = d.toISOString().split('T')[0];
    renderToday();
  });

  document.getElementById('exportDataBtn').addEventListener('click', () => {
    const data = JSON.stringify({ habits: state.habits, completions: state.completions }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `habits_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  });

  document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  document.getElementById('importFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.habits && parsed.completions) {
          state.habits = parsed.habits;
          state.completions = parsed.completions;
          saveState();
          render();
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('heatmapHabitSelect').addEventListener('change', renderHeatmap);
}

function saveState() {
  localStorage.setItem('habits', JSON.stringify(state.habits));
  localStorage.setItem('completions', JSON.stringify(state.completions));
}

function render() {
  renderStats();
  renderTabContent();
}

function renderStats() {
  document.getElementById('totalHabits').textContent = state.habits.length;

  const today = state.currentDate;
  let completedToday = 0;
  state.habits.forEach(h => {
    const key = `${h.id}_${today}`;
    if (state.completions[key]) completedToday++;
  });
  document.getElementById('todayCompleted').textContent = `${completedToday}/${state.habits.length}`;

  let bestStreak = 0;
  state.habits.forEach(h => {
    const streak = calculateStreak(h.id);
    if (streak > bestStreak) bestStreak = streak;
  });
  document.getElementById('bestStreakOverall').textContent = bestStreak;
}

function renderTabContent() {
  if (state.activeTab === 'today') renderToday();
  else if (state.activeTab === 'all') renderAll();
  else if (state.activeTab === 'heatmap') renderHeatmapSelect();
  else if (state.activeTab === 'analytics') renderAnalytics();
}

function renderToday() {
  const display = document.getElementById('currentDateDisplay');
  const today = new Date().toISOString().split('T')[0];
  if (state.currentDate === today) display.textContent = 'Today (' + today + ')';
  else display.textContent = state.currentDate;

  const container = document.getElementById('todayHabitsList');
  if (state.habits.length === 0) {
    container.innerHTML = '<p style="color:var(--muted); text-align:center; padding:2rem;">No habits created yet. Add one from the left panel!</p>';
    return;
  }

  container.innerHTML = state.habits.map(h => {
    const key = `${h.id}_${state.currentDate}`;
    const completed = !!state.completions[key];
    const streak = calculateStreak(h.id);

    return `
      <div class="habit-card ${completed ? 'completed' : ''}" style="--habit-color: ${h.color}">
        <div class="habit-check" onclick="toggleHabit('${h.id}', '${state.currentDate}')">${completed ? '✓' : ''}</div>
        <div class="habit-info">
          <div class="habit-title">${escapeHtml(h.name)}</div>
          <div class="habit-meta">
            <span>${h.category}</span>
            <span class="habit-streak">🔥 ${streak} day streak</span>
          </div>
        </div>
        <div class="habit-actions">
          <button class="habit-btn delete" onclick="deleteHabit('${h.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderAll() {
  const container = document.getElementById('allHabitsList');
  if (state.habits.length === 0) {
    container.innerHTML = '<p style="color:var(--muted); text-align:center; padding:2rem;">No habits created yet.</p>';
    return;
  }

  container.innerHTML = state.habits.map(h => {
    const streak = calculateStreak(h.id);
    return `
      <div class="habit-card" style="--habit-color: ${h.color}">
        <div class="habit-info">
          <div class="habit-title">${escapeHtml(h.name)}</div>
          <div class="habit-meta">
            <span>Category: ${h.category}</span>
            <span>Type: ${h.type}</span>
            <span class="habit-streak">🔥 ${streak} day streak</span>
          </div>
        </div>
        <div class="habit-actions">
          <button class="habit-btn delete" onclick="deleteHabit('${h.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function toggleHabit(id, dateStr) {
  const key = `${id}_${dateStr}`;
  if (state.completions[key]) {
    delete state.completions[key];
  } else {
    state.completions[key] = true;
  }
  saveState();
  render();
}

function deleteHabit(id) {
  if (!confirm('Are you sure you want to delete this habit?')) return;
  state.habits = state.habits.filter(h => h.id !== id);
  Object.keys(state.completions).forEach(k => {
    if (k.startsWith(id + '_')) delete state.completions[k];
  });
  saveState();
  render();
}

function calculateStreak(id) {
  let streak = 0;
  let d = new Date();
  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    const key = `${id}_${dateStr}`;
    if (state.completions[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      // Check if today is incomplete, check yesterday before breaking
      if (streak === 0 && dateStr === new Date().toISOString().split('T')[0]) {
        d.setDate(d.getDate() - 1);
        const yestStr = d.toISOString().split('T')[0];
        if (state.completions[`${id}_${yestStr}`]) {
          streak++;
          d.setDate(d.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  return streak;
}

function renderHeatmapSelect() {
  const select = document.getElementById('heatmapHabitSelect');
  select.innerHTML = '<option value="all">All Habits Combined</option>' +
    state.habits.map(h => `<option value="${h.id}">${escapeHtml(h.name)}</option>`).join('');
  renderHeatmap();
}

function renderHeatmap() {
  const habitId = document.getElementById('heatmapHabitSelect').value;
  const grid = document.getElementById('heatmapGrid');

  let html = '';
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    let level = 0;
    if (habitId === 'all') {
      const completedCount = state.habits.filter(h => state.completions[`${h.id}_${dateStr}`]).length;
      if (state.habits.length > 0) {
        const ratio = completedCount / state.habits.length;
        if (ratio > 0.75) level = 4;
        else if (ratio > 0.5) level = 3;
        else if (ratio > 0.25) level = 2;
        else if (ratio > 0) level = 1;
      }
    } else {
      if (state.completions[`${habitId}_${dateStr}`]) level = 4;
    }

    html += `<div class="heat-cell l${level}" title="${dateStr}"></div>`;
  }
  grid.innerHTML = html;
}

function renderAnalytics() {
  // Simple category breakdown chart
  const canvas1 = document.getElementById('categoryChart');
  const ctx1 = canvas1.getContext('2d');
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);

  const cats = {};
  state.habits.forEach(h => cats[h.category] = (cats[h.category] || 0) + 1);

  let total = state.habits.length || 1;
  let startAngle = 0;
  const colors = ['#00d4aa', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe'];

  let i = 0;
  for (let cat in cats) {
    const sliceAngle = (cats[cat] / total) * 2 * Math.PI;
    ctx1.beginPath();
    ctx1.moveTo(150, 100);
    ctx1.arc(150, 100, 80, startAngle, startAngle + sliceAngle);
    ctx1.closePath();
    ctx1.fillStyle = colors[i % colors.length];
    ctx1.fill();
    startAngle += sliceAngle;
    i++;
  }

  // Weekly trend canvas
  const canvas2 = document.getElementById('weeklyChart');
  const ctx2 = canvas2.getContext('2d');
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

  ctx2.strokeStyle = '#00d4aa';
  ctx2.lineWidth = 3;
  ctx2.beginPath();

  for (let w = 6; w >= 0; w--) {
    const d = new Date();
    d.setDate(d.getDate() - w);
    const dateStr = d.toISOString().split('T')[0];
    const completed = state.habits.filter(h => state.completions[`${h.id}_${dateStr}`]).length;
    const x = (6 - w) * 40 + 20;
    const y = 180 - (completed / (state.habits.length || 1)) * 150;
    if (w === 6) ctx2.moveTo(x, y);
    else ctx2.lineTo(x, y);
  }
  ctx2.stroke();
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

window.toggleHabit = toggleHabit;
window.deleteHabit = deleteHabit;

document.addEventListener('DOMContentLoaded', init);