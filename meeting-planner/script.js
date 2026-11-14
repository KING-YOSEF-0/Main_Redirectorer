const TIMEZONES = [
  { city: 'UTC', zone: 'UTC', offset: 0, country: 'World' },
  { city: 'London', zone: 'Europe/London', offset: 0, country: 'UK' },
  { city: 'Dublin', zone: 'Europe/Dublin', offset: 0, country: 'Ireland' },
  { city: 'Lisbon', zone: 'Europe/Lisbon', offset: 0, country: 'Portugal' },
  { city: 'Reykjavik', zone: 'Atlantic/Reykjavik', offset: 0, country: 'Iceland' },
  { city: 'Casablanca', zone: 'Africa/Casablanca', offset: 1, country: 'Morocco' },
  { city: 'Berlin', zone: 'Europe/Berlin', offset: 1, country: 'Germany' },
  { city: 'Paris', zone: 'Europe/Paris', offset: 1, country: 'France' },
  { city: 'Rome', zone: 'Europe/Rome', offset: 1, country: 'Italy' },
  { city: 'Madrid', zone: 'Europe/Madrid', offset: 1, country: 'Spain' },
  { city: 'Amsterdam', zone: 'Europe/Amsterdam', offset: 1, country: 'Netherlands' },
  { city: 'Brussels', zone: 'Europe/Brussels', offset: 1, country: 'Belgium' },
  { city: 'Vienna', zone: 'Europe/Vienna', offset: 1, country: 'Austria' },
  { city: 'Warsaw', zone: 'Europe/Warsaw', offset: 1, country: 'Poland' },
  { city: 'Stockholm', zone: 'Europe/Stockholm', offset: 1, country: 'Sweden' },
  { city: 'Oslo', zone: 'Europe/Oslo', offset: 1, country: 'Norway' },
  { city: 'Copenhagen', zone: 'Europe/Copenhagen', offset: 1, country: 'Denmark' },
  { city: 'Prague', zone: 'Europe/Prague', offset: 1, country: 'Czechia' },
  { city: 'Budapest', zone: 'Europe/Budapest', offset: 1, country: 'Hungary' },
  { city: 'Zurich', zone: 'Europe/Zurich', offset: 1, country: 'Switzerland' },
  { city: 'Athens', zone: 'Europe/Athens', offset: 2, country: 'Greece' },
  { city: 'Helsinki', zone: 'Europe/Helsinki', offset: 2, country: 'Finland' },
  { city: 'Kyiv', zone: 'Europe/Kyiv', offset: 2, country: 'Ukraine' },
  { city: 'Bucharest', zone: 'Europe/Bucharest', offset: 2, country: 'Romania' },
  { city: 'Istanbul', zone: 'Europe/Istanbul', offset: 3, country: 'Turkey' },
  { city: 'Moscow', zone: 'Europe/Moscow', offset: 3, country: 'Russia' },
  { city: 'Riyadh', zone: 'Asia/Riyadh', offset: 3, country: 'Saudi Arabia' },
  { city: 'Dubai', zone: 'Asia/Dubai', offset: 4, country: 'UAE' },
  { city: 'Abu Dhabi', zone: 'Asia/Dubai', offset: 4, country: 'UAE' },
  { city: 'Muscat', zone: 'Asia/Muscat', offset: 4, country: 'Oman' },
  { city: 'Baku', zone: 'Asia/Baku', offset: 4, country: 'Azerbaijan' },
  { city: 'Karachi', zone: 'Asia/Karachi', offset: 5, country: 'Pakistan' },
  { city: 'Mumbai', zone: 'Asia/Kolkata', offset: 5.5, country: 'India' },
  { city: 'New Delhi', zone: 'Asia/Kolkata', offset: 5.5, country: 'India' },
  { city: 'Chennai', zone: 'Asia/Kolkata', offset: 5.5, country: 'India' },
  { city: 'Bangalore', zone: 'Asia/Kolkata', offset: 5.5, country: 'India' },
  { city: 'Kolkata', zone: 'Asia/Kolkata', offset: 5.5, country: 'India' },
  { city: 'Dhaka', zone: 'Asia/Dhaka', offset: 6, country: 'Bangladesh' },
  { city: 'Almaty', zone: 'Asia/Almaty', offset: 5, country: 'Kazakhstan' },
  { city: 'Tashkent', zone: 'Asia/Tashkent', offset: 5, country: 'Uzbekistan' },
  { city: 'Bangkok', zone: 'Asia/Bangkok', offset: 7, country: 'Thailand' },
  { city: 'Jakarta', zone: 'Asia/Jakarta', offset: 7, country: 'Indonesia' },
  { city: 'Hanoi', zone: 'Asia/Ho_Chi_Minh', offset: 7, country: 'Vietnam' },
  { city: 'Kuala Lumpur', zone: 'Asia/Kuala_Lumpur', offset: 8, country: 'Malaysia' },
  { city: 'Singapore', zone: 'Asia/Singapore', offset: 8, country: 'Singapore' },
  { city: 'Manila', zone: 'Asia/Manila', offset: 8, country: 'Philippines' },
  { city: 'Beijing', zone: 'Asia/Shanghai', offset: 8, country: 'China' },
  { city: 'Shanghai', zone: 'Asia/Shanghai', offset: 8, country: 'China' },
  { city: 'Hong Kong', zone: 'Asia/Hong_Kong', offset: 8, country: 'Hong Kong' },
  { city: 'Taipei', zone: 'Asia/Taipei', offset: 8, country: 'Taiwan' },
  { city: 'Seoul', zone: 'Asia/Seoul', offset: 9, country: 'South Korea' },
  { city: 'Tokyo', zone: 'Asia/Tokyo', offset: 9, country: 'Japan' },
  { city: 'Osaka', zone: 'Asia/Tokyo', offset: 9, country: 'Japan' },
  { city: 'Sydney', zone: 'Australia/Sydney', offset: 10, country: 'Australia' },
  { city: 'Melbourne', zone: 'Australia/Melbourne', offset: 10, country: 'Australia' },
  { city: 'Brisbane', zone: 'Australia/Brisbane', offset: 10, country: 'Australia' },
  { city: 'Perth', zone: 'Australia/Perth', offset: 8, country: 'Australia' },
  { city: 'Adelaide', zone: 'Australia/Adelaide', offset: 9.5, country: 'Australia' },
  { city: 'Auckland', zone: 'Pacific/Auckland', offset: 12, country: 'New Zealand' },
  { city: 'Wellington', zone: 'Pacific/Auckland', offset: 12, country: 'New Zealand' },
  { city: 'Honolulu', zone: 'Pacific/Honolulu', offset: -10, country: 'USA' },
  { city: 'Anchorage', zone: 'America/Anchorage', offset: -9, country: 'USA' },
  { city: 'Los Angeles', zone: 'America/Los_Angeles', offset: -8, country: 'USA' },
  { city: 'San Francisco', zone: 'America/Los_Angeles', offset: -8, country: 'USA' },
  { city: 'Seattle', zone: 'America/Los_Angeles', offset: -8, country: 'USA' },
  { city: 'Vancouver', zone: 'America/Vancouver', offset: -8, country: 'Canada' },
  { city: 'Denver', zone: 'America/Denver', offset: -7, country: 'USA' },
  { city: 'Phoenix', zone: 'America/Phoenix', offset: -7, country: 'USA' },
  { city: 'Edmonton', zone: 'America/Edmonton', offset: -7, country: 'Canada' },
  { city: 'Calgary', zone: 'America/Edmonton', offset: -7, country: 'Canada' },
  { city: 'Chicago', zone: 'America/Chicago', offset: -6, country: 'USA' },
  { city: 'Dallas', zone: 'America/Chicago', offset: -6, country: 'USA' },
  { city: 'Houston', zone: 'America/Chicago', offset: -6, country: 'USA' },
  { city: 'Mexico City', zone: 'America/Mexico_City', offset: -6, country: 'Mexico' },
  { city: 'Winnipeg', zone: 'America/Winnipeg', offset: -6, country: 'Canada' },
  { city: 'New York', zone: 'America/New_York', offset: -5, country: 'USA' },
  { city: 'Toronto', zone: 'America/Toronto', offset: -5, country: 'Canada' },
  { city: 'Washington DC', zone: 'America/New_York', offset: -5, country: 'USA' },
  { city: 'Boston', zone: 'America/New_York', offset: -5, country: 'USA' },
  { city: 'Miami', zone: 'America/New_York', offset: -5, country: 'USA' },
  { city: 'Montreal', zone: 'America/Toronto', offset: -5, country: 'Canada' },
  { city: 'Bogota', zone: 'America/Bogota', offset: -5, country: 'Colombia' },
  { city: 'Lima', zone: 'America/Lima', offset: -5, country: 'Peru' },
  { city: 'Caracas', zone: 'America/Caracas', offset: -4, country: 'Venezuela' },
  { city: 'La Paz', zone: 'America/La_Paz', offset: -4, country: 'Bolivia' },
  { city: 'Santiago', zone: 'America/Santiago', offset: -4, country: 'Chile' },
  { city: 'Brasilia', zone: 'America/Sao_Paulo', offset: -3, country: 'Brazil' },
  { city: 'Sao Paulo', zone: 'America/Sao_Paulo', offset: -3, country: 'Brazil' },
  { city: 'Rio de Janeiro', zone: 'America/Sao_Paulo', offset: -3, country: 'Brazil' },
  { city: 'Buenos Aires', zone: 'America/Argentina/Buenos_Aires', offset: -3, country: 'Argentina' },
  { city: 'Montevideo', zone: 'America/Montevideo', offset: -3, country: 'Uruguay' },
  { city: 'Nuuk', zone: 'America/Nuuk', offset: -2, country: 'Greenland' },
  { city: 'Azores', zone: 'Atlantic/Azores', offset: -1, country: 'Portugal' },
  { city: 'Cape Verde', zone: 'Atlantic/Cape_Verde', offset: -1, country: 'Cape Verde' },
];

const COLORS = [
  '#00d4aa', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe', '#fd79a8',
  '#00cec9', '#fdcb6e', '#e17055', '#74b9ff', '#81ecec', '#fab1a0',
];

const state = {
  selectedZones: [],
  meetingDate: null,
  duration: 60,
  recurrence: 'none',
  workingHours: { start: 9, end: 17, preset: 'default' },
  showWeekend: true,
  highlightOverlaps: true,
  compactMode: false,
  draggedIndex: null
};

function init() {
  const today = new Date();
  state.meetingDate = today.toISOString().split('T')[0];
  document.getElementById('meetingDate').value = state.meetingDate;
  document.getElementById('meetingDate').min = state.meetingDate;

  setupEventListeners();
  loadFromURL();
  renderSelectedZones();
  renderTimeline();
}

function setupEventListeners() {
  document.getElementById('meetingDate').addEventListener('change', e => {
    state.meetingDate = e.target.value;
    renderTimeline();
    updateURL();
  });

  document.getElementById('duration').addEventListener('input', e => {
    state.duration = parseInt(e.target.value);
    document.getElementById('durationValue').textContent = `${state.duration} min`;
    renderTimeline();
  });
  document.getElementById('duration').addEventListener('change', updateURL);

  document.getElementById('recurrence').addEventListener('change', e => {
    state.recurrence = e.target.value;
    updateURL();
  });

  const tzSearch = document.getElementById('tzSearch');
  const suggestions = document.getElementById('tzSuggestions');
  tzSearch.addEventListener('input', e => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 1) { suggestions.hidden = true; return; }
    const matches = TIMEZONES.filter(tz =>
      tz.city.toLowerCase().includes(query) ||
      tz.zone.toLowerCase().includes(query) ||
      tz.country.toLowerCase().includes(query) ||
      `utc${tz.offset >= 0 ? '+' : ''}${tz.offset}`.includes(query)
    ).slice(0, 10);
    if (matches.length) {
      suggestions.innerHTML = matches.map(m => `
        <div class="suggestion-item" data-zone='${JSON.stringify(m)}'>
          <div class="suggestion-main">
            <div class="suggestion-city">${escapeHtml(m.city)}</div>
            <div class="suggestion-zone">${escapeHtml(m.zone)}</div>
          </div>
          <span class="suggestion-offset">UTC${m.offset >= 0 ? '+' : ''}${m.offset}</span>
        </div>
      `).join('');
      suggestions.hidden = false;
    } else {
      suggestions.hidden = true;
    }
  });

  tzSearch.addEventListener('blur', () => setTimeout(() => suggestions.hidden = true, 200));
  tzSearch.addEventListener('focus', () => {
    if (tzSearch.value.trim().length >= 1) suggestions.hidden = false;
  });

  suggestions.addEventListener('click', e => {
    const item = e.target.closest('.suggestion-item');
    if (item) {
      const zone = JSON.parse(item.dataset.zone);
      addTimezone(zone);
      tzSearch.value = '';
      suggestions.hidden = true;
    }
  });

  document.querySelectorAll('input[name="whPreset"]').forEach(r => {
    r.addEventListener('change', e => {
      state.workingHours.preset = e.target.value;
      const custom = document.querySelector('.wh-custom');
      custom.hidden = e.target.value !== 'custom';
      if (e.target.value === 'default') { state.workingHours.start = 9; state.workingHours.end = 17; }
      else if (e.target.value === 'extended') { state.workingHours.start = 8; state.workingHours.end = 18; }
      updateWHInputs();
      renderTimeline();
      updateURL();
    });
  });

  document.getElementById('whStart').addEventListener('change', e => {
    state.workingHours.start = parseInt(e.target.value.split(':')[0]);
    renderTimeline();
    updateURL();
  });
  document.getElementById('whEnd').addEventListener('change', e => {
    state.workingHours.end = parseInt(e.target.value.split(':')[0]);
    renderTimeline();
    updateURL();
  });

  document.getElementById('showWeekend').addEventListener('change', e => {
    state.showWeekend = e.target.checked;
    renderTimeline();
    updateURL();
  });
  document.getElementById('highlightOverlaps').addEventListener('change', e => {
    state.highlightOverlaps = e.target.checked;
    renderTimeline();
    updateURL();
  });
  document.getElementById('compactMode').addEventListener('change', e => {
    state.compactMode = e.target.checked;
    document.body.classList.toggle('compact', state.compactMode);
    updateURL();
  });

  document.getElementById('findBestBtn').addEventListener('click', findBestSlots);
  document.getElementById('shareBtn').addEventListener('click', shareLink);
  document.getElementById('exportIcsBtn').addEventListener('click', exportICS);
  document.getElementById('exportSlackBtn').addEventListener('click', exportSlack);
  document.getElementById('exportTextBtn').addEventListener('click', exportText);

  document.getElementById('selectedTimezones').addEventListener('dragstart', e => {
    const chip = e.target.closest('.tz-chip');
    if (chip) {
      state.draggedIndex = parseInt(chip.dataset.index);
      chip.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    }
  });

  document.getElementById('selectedTimezones').addEventListener('dragover', e => {
    e.preventDefault();
    const chip = e.target.closest('.tz-chip');
    if (chip && state.draggedIndex !== null) {
      const targetIndex = parseInt(chip.dataset.index);
      if (targetIndex !== state.draggedIndex) {
        const zones = [...state.selectedZones];
        const [removed] = zones.splice(state.draggedIndex, 1);
        zones.splice(targetIndex, 0, removed);
        state.selectedZones = zones;
        state.draggedIndex = targetIndex;
        renderSelectedZones();
        renderTimeline();
      }
    }
    e.dataTransfer.dropEffect = 'move';
  });

  document.getElementById('selectedTimezones').addEventListener('dragend', e => {
    const chip = e.target.closest('.tz-chip');
    if (chip) chip.classList.remove('dragging');
    state.draggedIndex = null;
    updateURL();
  });
}

function updateWHInputs() {
  document.getElementById('whStart').value = String(state.workingHours.start).padStart(2, '0') + ':00';
  document.getElementById('whEnd').value = String(state.workingHours.end).padStart(2, '0') + ':00';
}

function addTimezone(zone) {
  if (state.selectedZones.length >= 8) { showToast('Maximum 8 time zones', 'warning'); return; }
  if (state.selectedZones.some(z => z.zone === zone.zone)) { showToast('Timezone already added', 'info'); return; }
  const color = COLORS[state.selectedZones.length % COLORS.length];
  state.selectedZones.push({ ...zone, color });
  renderSelectedZones();
  renderTimeline();
  updateURL();
}

function removeTimezone(index) {
  state.selectedZones.splice(index, 1);
  state.selectedZones.forEach((z, i) => z.color = COLORS[i % COLORS.length]);
  renderSelectedZones();
  renderTimeline();
  updateURL();
}

function renderSelectedZones() {
  const container = document.getElementById('selectedTimezones');
  if (state.selectedZones.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = state.selectedZones.map((z, i) => {
    const localTime = getLocalTime(z);
    return `
      <div class="tz-chip" data-index="${i}" draggable="true" style="--chip-color: ${z.color}">
        <div class="tz-chip-color" style="background: ${z.color}"></div>
        <div class="tz-chip-info">
          <div class="tz-chip-city">${escapeHtml(z.city)}</div>
          <div class="tz-chip-zone">${escapeHtml(z.zone)}</div>
        </div>
        <div class="tz-chip-time">${localTime}</div>
        <button class="tz-chip-remove" onclick="removeTimezone(${i})" aria-label="Remove ${escapeHtml(z.city)}">×</button>
      </div>
    `;
  }).join('');
}

window.removeTimezone = removeTimezone;

function getLocalTime(zone) {
  if (!state.meetingDate) return '--:--';
  const date = new Date(state.meetingDate + 'T12:00:00Z');
  const offset = getTimezoneOffset(zone.zone, date);
  const local = new Date(date.getTime() + offset * 3600000);
  return local.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getTimezoneOffset(zoneName, date) {
  const tz = TIMEZONES.find(t => t.zone === zoneName);
  if (tz) return tz.offset;
  try {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: zoneName, hour: 'numeric', minute: 'numeric', hour12: false, timeZoneName: 'shortOffset' });
    const parts = fmt.formatToParts(date);
    const offsetStr = parts.find(p => p.type === 'timeZoneName')?.value || '';
    const match = offsetStr.match(/UTC([+-])(\d+):?(\d+)?/);
    if (match) {
      const sign = match[1] === '+' ? 1 : -1;
      const hours = parseInt(match[2]);
      const mins = parseInt(match[3] || '0');
      return sign * (hours + mins / 60);
    }
  } catch {}
  return 0;
}

function renderTimeline() {
  const container = document.getElementById('timeline');
  const emptyState = document.getElementById('emptyState');
  const timelineDate = document.getElementById('timelineDate');
  const timelineGrid = document.getElementById('timelineGrid');
  const bestSlots = document.getElementById('bestSlots');
  const slotsList = document.getElementById('slotsList');

  if (state.selectedZones.length === 0) {
    container.hidden = true;
    emptyState.hidden = false;
    return;
  }

  container.hidden = false;
  emptyState.hidden = true;
  bestSlots.hidden = true;

  const date = new Date(state.meetingDate + 'T00:00:00Z');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
  timelineDate.textContent = date.toLocaleDateString('en-US', options);

  let gridHtml = '<div class="timeline-header-cell"></div>';
  for (let h = 0; h < 24; h++) {
    gridHtml += `<div class="timeline-header-cell">${String(h).padStart(2, '0')}:00</div>`;
  }

  state.selectedZones.forEach((zone, zi) => {
    const offset = getTimezoneOffset(zone.zone, date);
    const zoneDate = new Date(date.getTime() + offset * 3600000);
    const isWeekend = zoneDate.getDay() === 0 || zoneDate.getDay() === 6;
    const workStart = state.workingHours.start;
    const workEnd = state.workingHours.end;

    gridHtml += `
      <div class="timeline-zone-header" style="border-left: 4px solid ${zone.color}">
        <span class="timeline-zone-city">${escapeHtml(zone.city)}</span>
        <span class="timeline-zone-abbr">${escapeHtml(zone.zone)}</span>
        <span class="timeline-zone-offset">UTC${offset >= 0 ? '+' : ''}${offset}</span>
      </div>
    `;

    for (let h = 0; h < 24; h++) {
      const isWorkHour = h >= workStart && h < workEnd && (!isWeekend || state.showWeekend);
      const hourDate = new Date(date.getTime() + (h - offset) * 3600000);
      const overlapCount = countOverlaps(h, offset);

      let classes = 'timeline-hour';
      if (isWorkHour) classes += ' work-hours';
      if (state.highlightOverlaps && overlapCount > 1) {
        classes += ' overlap';
        if (overlapCount === state.selectedZones.length) classes += ' best-overlap';
      }
      if (isCurrentHour(h, offset)) classes += ' current';

      gridHtml += `
        <div class="${classes}" style="--zone-color: ${zone.color}" title="${zone.city}: ${String(h).padStart(2, '0')}:00 (${overlapCount} zones)">
          <span class="timeline-hour-label">${String(h).padStart(2, '0')}:00</span>
          ${overlapCount > 1 ? `<span class="timeline-hour-overlap-count">${overlapCount}</span>` : ''}
        </div>
      `;
    }
  });

  timelineGrid.innerHTML = gridHtml;
}

function countOverlaps(hour, baseOffset) {
  let count = 0;
  state.selectedZones.forEach(zone => {
    const offset = getTimezoneOffset(zone.zone, new Date(state.meetingDate + 'T00:00:00Z'));
    const localHour = hour + baseOffset - offset;
    if (localHour >= state.workingHours.start && localHour < state.workingHours.end) {
      const zoneDate = new Date(new Date(state.meetingDate + 'T00:00:00Z').getTime() + (hour - offset) * 3600000);
      const isWeekend = zoneDate.getDay() === 0 || zoneDate.getDay() === 6;
      if (!isWeekend || state.showWeekend) count++;
    }
  });
  return count;
}

function isCurrentHour(hour, baseOffset) {
  const now = new Date();
  const utcHour = now.getUTCHours();
  return hour === utcHour;
}

function findBestSlots() {
  if (state.selectedZones.length < 2) { showToast('Add at least 2 time zones', 'warning'); return; }

  const slots = [];
  const baseDate = new Date(state.meetingDate + 'T00:00:00Z');

  for (let h = 0; h < 24; h++) {
    const zoneScores = state.selectedZones.map(zone => {
      const offset = getTimezoneOffset(zone.zone, baseDate);
      const localHour = h - offset;
      const zoneDate = new Date(baseDate.getTime() + (h - offset) * 3600000);
      const isWeekend = zoneDate.getDay() === 0 || zoneDate.getDay() === 6;
      const inWorkHours = localHour >= state.workingHours.start && localHour < state.workingHours.end;
      const inWorkWeek = !isWeekend || state.showWeekend;
      return inWorkHours && inWorkWeek ? 1 : 0;
    });
    const score = zoneScores.reduce((a, b) => a + b, 0);
    if (score > 0) {
      const times = state.selectedZones.map(zone => {
        const offset = getTimezoneOffset(zone.zone, baseDate);
        const localHour = h - offset;
        const localDate = new Date(baseDate.getTime() + (h - offset) * 3600000);
        return `${zone.city}: ${String(localHour % 24).padStart(2, '0')}:00 (${localDate.toLocaleDateString()})`;
      });
      slots.push({ hour: h, score, times, zones: score });
    }
  }

  slots.sort((a, b) => b.score - a.score || a.hour - b.hour);
  const topSlots = slots.slice(0, 5);

  const slotsList = document.getElementById('slotsList');
  slotsList.innerHTML = topSlots.map((slot, i) => `
    <div class="slot-item">
      <div class="slot-rank">${i + 1}</div>
      <div class="slot-times">
        ${slot.times.map((t, ti) => `<span class="slot-time ${ti < state.selectedZones.length && slot.score === state.selectedZones.length ? 'primary' : ''}">${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="slot-score"><span class="score-value">${slot.score}</span>/${state.selectedZones.length} zones</div>
    </div>
  `).join('');

  document.getElementById('bestSlots').hidden = false;
  document.getElementById('bestSlots').scrollIntoView({ behavior: 'smooth' });
  showToast(`Found ${slots.length} viable slots`, 'success');
}

function shareLink() {
  const url = buildShareURL();
  navigator.clipboard.writeText(url);
  showToast('Share link copied to clipboard', 'success');
}

function buildShareURL() {
  const params = new URLSearchParams();
  params.set('date', state.meetingDate);
  params.set('duration', state.duration);
  params.set('recurrence', state.recurrence);
  params.set('wh', `${state.workingHours.preset},${state.workingHours.start},${state.workingHours.end}`);
  params.set('weekend', state.showWeekend ? '1' : '0');
  params.set('overlaps', state.highlightOverlaps ? '1' : '0');
  params.set('compact', state.compactMode ? '1' : '0');
  if (state.selectedZones.length) {
    params.set('zones', state.selectedZones.map(z => z.zone).join('|'));
  }
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function exportICS() {
  if (state.selectedZones.length === 0) { showToast('Add time zones first', 'warning'); return; }

  const baseDate = new Date(state.meetingDate + 'T00:00:00Z');
  const firstZone = state.selectedZones[0];
  const offset = getTimezoneOffset(firstZone.zone, baseDate);
  const startHour = 12; // Default to noon UTC for the meeting
  const start = new Date(baseDate.getTime() + (startHour - offset) * 3600000);
  const end = new Date(start.getTime() + state.duration * 60000);

  const formatICS = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//KING_YOSEF_//Meeting Planner//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}@meeting-planner.king-yosef-0.github.io
DTSTAMP:${formatICS(new Date())}
DTSTART:${formatICS(start)}
DTEND:${formatICS(end)}
SUMMARY:Meeting across ${state.selectedZones.length} time zones
DESCRIPTION:Meeting planned via Time Zone Meeting Planner\nZones: ${state.selectedZones.map(z => z.city).join(', ')}\n\nBest time slots calculated for working hours overlap.
LOCATION:Online / Multiple time zones
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  downloadText(ics, 'meeting.ics');
  showToast('ICS calendar file downloaded', 'success');
}

function exportSlack() {
  if (state.selectedZones.length === 0) { showToast('Add time zones first', 'warning'); return; }

  const baseDate = new Date(state.meetingDate + 'T00:00:00Z');
  const times = state.selectedZones.map(zone => {
    const offset = getTimezoneOffset(zone.zone, baseDate);
    const localHour = 12 - offset; // Default meeting at 12 UTC
    const localDate = new Date(baseDate.getTime() + (12 - offset) * 3600000);
    return `${zone.city}: ${String(localHour % 24).padStart(2, '0')}:00 ${localDate.toLocaleDateString()}`;
  });

  let text = `📅 *Meeting Scheduled*\n*Date:* ${baseDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n*Duration:* ${state.duration} minutes\n\n*Times by zone:*\n${times.map(t => `• ${t}`).join('\n')}\n\n_Planned with Time Zone Meeting Planner_`;

  navigator.clipboard.writeText(text);
  showToast('Slack message copied to clipboard', 'success');
}

function exportText() {
  if (state.selectedZones.length === 0) { showToast('Add time zones first', 'warning'); return; }

  const baseDate = new Date(state.meetingDate + 'T00:00:00Z');
  const times = state.selectedZones.map(zone => {
    const offset = getTimezoneOffset(zone.zone, baseDate);
    const localHour = 12 - offset;
    const localDate = new Date(baseDate.getTime() + (12 - offset) * 3600000);
    return `${zone.city} (${zone.zone}, UTC${offset >= 0 ? '+' : ''}${offset}): ${String(localHour % 24).padStart(2, '0')}:00 on ${localDate.toLocaleDateString()}`;
  });

  let text = `Meeting Planner Export
========================
Date: ${baseDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Duration: ${state.duration} minutes
Recurrence: ${state.recurrence}
Working Hours: ${state.workingHours.start}:00-${state.workingHours.end}:00 (${state.workingHours.preset})

Times by Zone:
${times.map(t => `  ${t}`).join('\n')}

Generated by Time Zone Meeting Planner
https://king-yosef-0.github.io/Main_Redirectorer/meeting-planner/`;

  navigator.clipboard.writeText(text);
  showToast('Plain text copied to clipboard', 'success');
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('date')) {
    state.meetingDate = params.get('date');
    document.getElementById('meetingDate').value = state.meetingDate;
  }
  if (params.has('duration')) {
    state.duration = parseInt(params.get('duration'));
    document.getElementById('duration').value = state.duration;
    document.getElementById('durationValue').textContent = `${state.duration} min`;
  }
  if (params.has('recurrence')) {
    state.recurrence = params.get('recurrence');
    document.getElementById('recurrence').value = state.recurrence;
  }
  if (params.has('wh')) {
    const [preset, start, end] = params.get('wh').split(',');
    state.workingHours.preset = preset;
    state.workingHours.start = parseInt(start);
    state.workingHours.end = parseInt(end);
    document.querySelector(`input[name="whPreset"][value="${preset}"]`).checked = true;
    document.querySelector('.wh-custom').hidden = preset !== 'custom';
    updateWHInputs();
  }
  if (params.has('weekend')) {
    state.showWeekend = params.get('weekend') === '1';
    document.getElementById('showWeekend').checked = state.showWeekend;
  }
  if (params.has('overlaps')) {
    state.highlightOverlaps = params.get('overlaps') === '1';
    document.getElementById('highlightOverlaps').checked = state.highlightOverlaps;
  }
  if (params.has('compact')) {
    state.compactMode = params.get('compact') === '1';
    document.getElementById('compactMode').checked = state.compactMode;
    document.body.classList.toggle('compact', state.compactMode);
  }
  if (params.has('zones')) {
    const zoneNames = params.get('zones').split('|');
    zoneNames.forEach(zoneName => {
      const tz = TIMEZONES.find(t => t.zone === zoneName);
      if (tz && !state.selectedZones.some(z => z.zone === tz.zone)) {
        const color = COLORS[state.selectedZones.length % COLORS.length];
        state.selectedZones.push({ ...tz, color });
      }
    });
  }
}

function updateURL() {
  const params = new URLSearchParams();
  params.set('date', state.meetingDate);
  params.set('duration', state.duration);
  params.set('recurrence', state.recurrence);
  params.set('wh', `${state.workingHours.preset},${state.workingHours.start},${state.workingHours.end}`);
  params.set('weekend', state.showWeekend ? '1' : '0');
  params.set('overlaps', state.highlightOverlaps ? '1' : '0');
  params.set('compact', state.compactMode ? '1' : '0');
  if (state.selectedZones.length) {
    params.set('zones', state.selectedZones.map(z => z.zone).join('|'));
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Dismiss">×</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', init);