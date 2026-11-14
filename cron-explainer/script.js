const CronExplainer = (() => {
  const state = {
    cronExpr: '',
    parsed: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referenceTime: null,
    runCount: 10,
    showPrevious: true,
    showNext: true,
    nextRuns: [],
    previousRuns: [],
    calendarRuns: [],
  };

  const elements = {};

  const PRESETS = {
    standard: [
      { label: 'Every minute', expr: '* * * * *' },
      { label: 'Every 5 minutes', expr: '*/5 * * * *' },
      { label: 'Every hour at minute 0', expr: '0 * * * *' },
      { label: 'Every day at 9:00 AM', expr: '0 9 * * *' },
      { label: 'Every weekday at 9:00 AM', expr: '0 9 * * 1-5' },
      { label: 'Every Monday at 9:00 AM', expr: '0 9 * * 1' },
      { label: 'First day of month at midnight', expr: '0 0 1 * *' },
      { label: 'Midnight on 1st & 15th', expr: '0 0 1,15 * *' },
      { label: 'Every 6 hours', expr: '0 */6 * * *' },
      { label: 'Every 30 minutes', expr: '*/30 * * * *' },
    ],
    quartz: [
      { label: 'Every minute', expr: '* * * * * ?' },
      { label: 'Every 5 minutes', expr: '0 */5 * * * ?' },
      { label: 'Weekdays at 9:00 AM', expr: '0 0 9 ? * MON-FRI' },
      { label: 'Last day of month at 11:59 PM', expr: '0 59 23 L * ?' },
      { label: 'Last Friday of month at 5 PM', expr: '0 0 17 ? * 6L' },
      { label: 'First Monday of month at 9 AM', expr: '0 0 9 ? * 2#1' },
      { label: 'Every hour at minute 30', expr: '0 30 * * * ?' },
      { label: 'Every 15 minutes (Quartz)', expr: '0 0/15 * * * ?' },
    ],
    spring: [
      { label: '@yearly (Jan 1, midnight)', expr: '@yearly' },
      { label: '@monthly (1st day, midnight)', expr: '@monthly' },
      { label: '@weekly (Sunday, midnight)', expr: '@weekly' },
      { label: '@daily (midnight)', expr: '@daily' },
      { label: '@hourly (minute 0)', expr: '@hourly' },
    ],
  };

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function init() {
    cacheElements();
    populateTimezones();
    setDefaultReferenceTime();
    renderPresets();
    bindEvents();
    startBubbles();
    checkUrlHash();
  }

  function cacheElements() {
    elements.cronInput = document.getElementById('cron-input');
    elements.timezoneSelect = document.getElementById('timezone-select');
    elements.referenceTime = document.getElementById('reference-time');
    elements.runCount = document.getElementById('run-count');
    elements.showPrevious = document.getElementById('show-previous');
    elements.showNext = document.getElementById('show-next');
    elements.presetButtons = document.getElementById('preset-buttons');
    elements.btnExplain = document.getElementById('btn-explain');
    elements.btnClear = document.getElementById('btn-clear');
    elements.btnRandom = document.getElementById('btn-random');
    elements.validationStatus = document.getElementById('validation-status');
    elements.explanationCard = document.getElementById('explanation-card');
    elements.explanationText = document.getElementById('explanation-text');
    elements.explanationFields = document.getElementById('explanation-fields');
    elements.runsCard = document.getElementById('runs-card');
    elements.nextRuns = document.getElementById('next-runs');
    elements.previousRuns = document.getElementById('previous-runs');
    elements.calendarCard = document.getElementById('calendar-card');
    elements.calendarGrid = document.getElementById('calendar-grid');
    elements.calendarMonths = document.getElementById('calendar-months');
    elements.calendarStart = document.getElementById('calendar-start');
    elements.exportCard = document.getElementById('export-card');
    elements.emptyState = document.getElementById('empty-state');
    elements.errorState = document.getElementById('error-state');
    elements.errorMessage = document.getElementById('error-message');
    elements.syntaxModal = document.getElementById('syntax-modal');
    elements.modalClose = document.getElementById('modal-close');
    elements.syntaxContent = document.getElementById('syntax-content');
    elements.btnExportText = document.getElementById('btn-export-text');
    elements.btnExportJson = document.getElementById('btn-export-json');
    elements.btnExportIcal = document.getElementById('btn-export-ical');
    elements.btnExportCsv = document.getElementById('btn-export-csv');
    elements.btnExportLink = document.getElementById('btn-export-link');
    document.querySelectorAll('.btn-toggle').forEach(btn => {
      btn.addEventListener('click', () => toggleRunsView(btn.dataset.view));
    });
    document.querySelectorAll('.syntax-tab').forEach(btn => {
      btn.addEventListener('click', () => switchSyntaxTab(btn.dataset.syntax));
    });
  }

  function populateTimezones() {
    const timezones = Intl.supportedValuesOf('timeZone');
    const current = Intl.DateTimeFormat().resolvedOptions().timeZone;
    elements.timezoneSelect.innerHTML = timezones.map(tz =>
      `<option value="${tz}" ${tz === current ? 'selected' : ''}>${tz}</option>`
    ).join('');
  }

  function setDefaultReferenceTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    elements.referenceTime.value = now.toISOString().slice(0, 16);
  }

  function renderPresets() {
    const allPresets = [...PRESETS.standard, ...PRESETS.quartz, ...PRESETS.spring];
    elements.presetButtons.innerHTML = allPresets.map(p =>
      `<button class="preset-btn" data-expr="${escapeHtml(p.expr)}">${escapeHtml(p.label)}</button>`
    ).join('');
    elements.presetButtons.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.cronInput.value = btn.dataset.expr;
        elements.cronInput.focus();
        validateExpression();
      });
    });
  }

  function bindEvents() {
    elements.cronInput.addEventListener('input', validateExpression);
    elements.timezoneSelect.addEventListener('change', () => {
      state.timezone = elements.timezoneSelect.value;
      if (state.parsed) analyze();
    });
    elements.referenceTime.addEventListener('change', () => {
      if (state.parsed) analyze();
    });
    elements.runCount.addEventListener('change', () => {
      state.runCount = Math.max(1, Math.min(100, parseInt(elements.runCount.value) || 10));
      if (state.parsed) analyze();
    });
    elements.showPrevious.addEventListener('change', () => {
      state.showPrevious = elements.showPrevious.checked;
      if (state.parsed) analyze();
    });
    elements.showNext.addEventListener('change', () => {
      state.showNext = elements.showNext.checked;
      if (state.parsed) analyze();
    });
    elements.btnExplain.addEventListener('click', analyze);
    elements.btnClear.addEventListener('click', clearAll);
    elements.btnRandom.addEventListener('click', randomExpression);
    elements.calendarMonths.addEventListener('change', renderCalendar);
    elements.calendarStart.addEventListener('change', renderCalendar);
    elements.btnExportText.addEventListener('click', () => exportData('text'));
    elements.btnExportJson.addEventListener('click', () => exportData('json'));
    elements.btnExportIcal.addEventListener('click', () => exportData('ical'));
    elements.btnExportCsv.addEventListener('click', () => exportData('csv'));
    elements.btnExportLink.addEventListener('click', exportLink);
    elements.modalClose.addEventListener('click', () => elements.syntaxModal.hidden = true);
    elements.syntaxModal.addEventListener('click', (e) => {
      if (e.target === elements.syntaxModal) elements.syntaxModal.hidden = true;
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') elements.syntaxModal.hidden = true;
    });
  }

  function validateExpression() {
    const expr = elements.cronInput.value.trim();
    elements.btnExplain.disabled = !expr;
    const result = parseCronExpression(expr);
    if (expr && result.valid) {
      showValidation('valid', `✓ Valid ${result.type} expression`);
    } else if (expr) {
      showValidation('invalid', `✗ ${result.error}`);
    } else {
      hideValidation();
    }
  }

  function showValidation(type, message) {
    elements.validationStatus.hidden = false;
    elements.validationStatus.className = `validation-status ${type}`;
    elements.validationStatus.textContent = message;
  }

  function hideValidation() {
    elements.validationStatus.hidden = true;
  }

  function analyze() {
    const expr = elements.cronInput.value.trim();
    if (!expr) return;

    state.cronExpr = expr;
    state.timezone = elements.timezoneSelect.value;
    state.referenceTime = elements.referenceTime.value
      ? parseLocalDateTime(elements.referenceTime.value)
      : new Date();
    state.runCount = Math.max(1, Math.min(100, parseInt(elements.runCount.value) || 10));
    state.showPrevious = elements.showPrevious.checked;
    state.showNext = elements.showNext.checked;

    const result = parseCronExpression(expr);
    if (!result.valid) {
      showError(result.error);
      return;
    }

    state.parsed = result;
    calculateRuns();
    renderAll();
    hideError();
    showResults();
  }

  function parseCronExpression(expr) {
    const trimmed = expr.trim();

    // Spring annotations
    const springMap = {
      '@yearly': '0 0 1 1 *',
      '@annually': '0 0 1 1 *',
      '@monthly': '0 0 1 * *',
      '@weekly': '0 0 * * 0',
      '@daily': '0 0 * * *',
      '@midnight': '0 0 * * *',
      '@hourly': '0 * * * *',
    };
    if (springMap[trimmed.toLowerCase()]) {
      return {
        valid: true,
        type: 'Spring',
        original: trimmed,
        expression: springMap[trimmed.toLowerCase()],
        hasSeconds: false,
        fields: parseStandardFields(springMap[trimmed.toLowerCase()]),
      };
    }

    // Check for Quartz (has ? or # or L)
    const isQuartz = /[?#L]/.test(trimmed);

    const parts = trimmed.split(/\s+/);
    if (parts.length === 5) {
      return {
        valid: true,
        type: isQuartz ? 'Quartz' : 'Standard (5-field)',
        original: trimmed,
        expression: trimmed,
        hasSeconds: false,
        fields: parseStandardFields(trimmed),
        isQuartz,
      };
    }
    if (parts.length === 6) {
      return {
        valid: true,
        type: isQuartz ? 'Quartz (with seconds)' : 'Standard (6-field with seconds)',
        original: trimmed,
        expression: trimmed,
        hasSeconds: true,
        fields: parseStandardFields(trimmed, true),
        isQuartz,
      };
    }

    return { valid: false, error: `Expected 5 or 6 fields, got ${parts.length}` };
  }

  function parseStandardFields(expr, hasSeconds = false) {
    const parts = expr.split(/\s+/);
    const fieldNames = hasSeconds
      ? ['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek']
      : ['minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek'];

    return fieldNames.map((name, i) => ({
      name,
      raw: parts[i],
      parsed: parseField(parts[i], name, hasSeconds),
    }));
  }

  function parseField(raw, fieldName, hasSeconds) {
    const limits = getFieldLimits(fieldName, hasSeconds);
    const result = { values: [], isEvery: false, isRange: false, isList: false, step: 1 };

    if (raw === '*' || raw === '?') {
      result.isEvery = true;
      result.values = Array.from({ length: limits.max - limits.min + 1 }, (_, i) => limits.min + i);
      return result;
    }

    const segments = raw.split(',');
    result.isList = segments.length > 1;

    for (const seg of segments) {
      if (seg.includes('/')) {
        const [range, step] = seg.split('/');
        result.step = parseInt(step, 10);
        parseRange(range, limits, result);
      } else {
        parseRange(seg, limits, result);
      }
    }

    result.values = [...new Set(result.values)].sort((a, b) => a - b);
    return result;
  }

  function getFieldLimits(name, hasSeconds) {
    const limits = {
      seconds: { min: 0, max: 59 },
      minutes: { min: 0, max: 59 },
      hours: { min: 0, max: 23 },
      dayOfMonth: { min: 1, max: 31 },
      month: { min: 1, max: 12 },
      dayOfWeek: { min: 0, max: 6 },
    };
    if (hasSeconds && name === 'minutes') return limits.minutes;
    if (hasSeconds && name === 'hours') return limits.hours;
    return limits[name];
  }

  function parseRange(seg, limits, result) {
    if (seg === '*' || seg === '?') {
      result.isEvery = true;
      for (let i = limits.min; i <= limits.max; i++) result.values.push(i);
      return;
    }
    if (seg.includes('-')) {
      result.isRange = true;
      const [start, end] = seg.split('-').map(s => parseAlias(s, limits.name));
      for (let i = start; i <= end; i += result.step) {
        if (i >= limits.min && i <= limits.max) result.values.push(i);
      }
      return;
    }
    const val = parseAlias(seg, limits.name);
    if (val >= limits.min && val <= limits.max) result.values.push(val);
  }

  function parseAlias(val, fieldName) {
    const upper = val.toUpperCase();
    const monthMap = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
    const dayMap = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
    if (fieldName === 'month' && monthMap[upper]) return monthMap[upper];
    if (fieldName === 'dayOfWeek' && dayMap[upper] !== undefined) return dayMap[upper];
    return parseInt(val, 10);
  }

  function calculateRuns() {
    const { parsed, referenceTime, runCount, showPrevious, showNext, timezone } = state;
    if (!parsed) return;

    state.nextRuns = [];
    state.previousRuns = [];

    if (showNext) {
      let current = new Date(referenceTime.getTime());
      current = roundToMinute(current);
      if (current <= referenceTime) current = addMinute(current);
      for (let i = 0; i < runCount; i++) {
        current = findNextRun(current, parsed, timezone);
        if (!current) break;
        state.nextRuns.push(new Date(current));
        current = addMinute(current);
      }
    }

    if (showPrevious) {
      let current = new Date(referenceTime.getTime());
      current = roundToMinute(current);
      if (current >= referenceTime) current = subtractMinute(current);
      for (let i = 0; i < runCount; i++) {
        current = findPreviousRun(current, parsed, timezone);
        if (!current) break;
        state.previousRuns.unshift(new Date(current));
        current = subtractMinute(current);
      }
    }

    // For calendar, get runs for a wider range
    calculateCalendarRuns();
  }

  function roundToMinute(date) {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  }

  function addMinute(date) {
    return new Date(date.getTime() + 60000);
  }

  function subtractMinute(date) {
    return new Date(date.getTime() - 60000);
  }

  function findNextRun(start, parsed, timezone) {
    const maxIterations = 100000;
    let current = new Date(start.getTime());

    for (let i = 0; i < maxIterations; i++) {
      if (matchesCron(current, parsed, timezone)) {
        return new Date(current);
      }
      current = addMinute(current);
    }
    return null;
  }

  function findPreviousRun(start, parsed, timezone) {
    const maxIterations = 100000;
    let current = new Date(start.getTime());

    for (let i = 0; i < maxIterations; i++) {
      if (matchesCron(current, parsed, timezone)) {
        return new Date(current);
      }
      current = subtractMinute(current);
    }
    return null;
  }

  function matchesCron(date, parsed, timezone) {
    const fields = parsed.fields;
    const hasSeconds = parsed.hasSeconds;

    // Get date components in the target timezone
    const components = getDateComponents(date, timezone);

    // Check seconds (if 6-field)
    if (hasSeconds) {
      const secField = fields.find(f => f.name === 'seconds');
      if (!secField.parsed.values.includes(components.seconds)) return false;
    }

    // Check minutes
    const minField = fields.find(f => f.name === 'minutes');
    if (!minField.parsed.values.includes(components.minutes)) return false;

    // Check hours
    const hourField = fields.find(f => f.name === 'hours');
    if (!hourField.parsed.values.includes(components.hours)) return false;

    // Check day of month
    const domField = fields.find(f => f.name === 'dayOfMonth');
    if (!domField.parsed.isEvery && !domField.parsed.values.includes(components.dayOfMonth)) return false;

    // Check month
    const monthField = fields.find(f => f.name === 'month');
    if (!monthField.parsed.values.includes(components.month)) return false;

    // Check day of week
    const dowField = fields.find(f => f.name === 'dayOfWeek');
    if (!dowField.parsed.isEvery && !dowField.parsed.values.includes(components.dayOfWeek)) return false;

    // Handle Quartz ? (no specific value)
    if (parsed.isQuartz) {
      const domRaw = fields.find(f => f.name === 'dayOfMonth').raw;
      const dowRaw = fields.find(f => f.name === 'dayOfWeek').raw;
      if (domRaw === '?' && dowRaw !== '?') {
        // Only DOW matters
        return true;
      }
      if (dowRaw === '?' && domRaw !== '?') {
        // Only DOM matters
        return true;
      }
      // Both specified: both must match (already checked above)
    }

    return true;
  }

  function getDateComponents(date, timezone) {
    // Use Intl.DateTimeFormat to get components in target timezone
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    });
    const parts = fmt.formatToParts(date);
    const get = (type) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
    const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    return {
      year: get('year'),
      month: get('month'),
      dayOfMonth: get('day'),
      hours: get('hour'),
      minutes: get('minute'),
      seconds: get('second'),
      dayOfWeek: weekdayMap[parts.find(p => p.type === 'weekday')?.value || 'Sun'],
    };
  }

  function calculateCalendarRuns() {
    const { parsed, timezone } = state;
    if (!parsed) return;

    const months = parseInt(elements.calendarMonths.value) || 3;
    const startStr = elements.calendarStart.value;
    let startDate;
    if (startStr) {
      const [y, m] = startStr.split('-').map(Number);
      startDate = new Date(Date.UTC(y, m - 1, 1));
    } else {
      const now = new Date();
      startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    endDate.setDate(0); // Last day of previous month

    state.calendarRuns = [];
    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    // Find first run on or after startDate
    current = findNextRun(current, parsed, timezone);
    while (current && current <= endDate) {
      state.calendarRuns.push(new Date(current));
      current = addMinute(current);
      current = findNextRun(current, parsed, timezone);
    }
  }

  function renderAll() {
    renderExplanation();
    renderRuns();
    renderCalendar();
  }

  function renderExplanation() {
    const { parsed } = state;
    if (!parsed) return;

    elements.explanationCard.hidden = false;
    elements.explanationText.textContent = generateHumanExplanation(parsed);
    renderExplanationFields(parsed);
  }

  function generateHumanExplanation(parsed) {
    const fields = parsed.fields;
    const parts = [];

    // Seconds
    if (parsed.hasSeconds) {
      const sec = fields.find(f => f.name === 'seconds');
      parts.push(describeField(sec, 'second'));
    }

    // Minutes
    const min = fields.find(f => f.name === 'minutes');
    parts.push(describeField(min, 'minute'));

    // Hours
    const hour = fields.find(f => f.name === 'hours');
    parts.push(describeField(hour, 'hour'));

    // Day of month
    const dom = fields.find(f => f.name === 'dayOfMonth');
    const dow = fields.find(f => f.name === 'dayOfWeek');
    const month = fields.find(f => f.name === 'month');

    // Check for special patterns
    if (dom.parsed.isEvery && dow.parsed.isEvery && month.parsed.values.length === 12) {
      parts.push('every day');
    } else if (!dom.parsed.isEvery || !dow.parsed.isEvery) {
      const domDesc = dom.parsed.isEvery ? '' : describeField(dom, 'day of month');
      const dowDesc = dow.parsed.isEvery ? '' : describeField(dow, 'day of week');
      const monthDesc = month.parsed.values.length === 12 ? '' : ` in ${describeField(month, 'month')}`;

      if (domDesc && dowDesc) {
        parts.push(`${domDesc} and ${dowDesc}${monthDesc}`);
      } else if (domDesc) {
        parts.push(`${domDesc}${monthDesc}`);
      } else if (dowDesc) {
        parts.push(`${dowDesc}${monthDesc}`);
      }
    }

    return `Runs ${parts.join(', ')}.`;
  }

  function describeField(field, unit) {
    const { parsed, raw } = field;
    if (parsed.isEvery) return `every ${unit}`;
    if (parsed.isList && parsed.values.length <= 5) {
      const vals = parsed.values.map(v => formatValue(v, field.name)).join(', ');
      return `at ${unit} ${vals}`;
    }
    if (parsed.isRange && parsed.step === 1) {
      const start = formatValue(parsed.values[0], field.name);
      const end = formatValue(parsed.values[parsed.values.length - 1], field.name);
      return `from ${unit} ${start} through ${end}`;
    }
    if (parsed.step > 1) {
      const start = formatValue(parsed.values[0], field.name);
      return `every ${parsed.step} ${unit}s starting at ${start}`;
    }
    return `at ${unit} ${formatValue(parsed.values[0], field.name)}`;
  }

  function formatValue(val, fieldName) {
    if (fieldName === 'month') return MONTH_NAMES[val - 1];
    if (fieldName === 'dayOfWeek') return DAY_NAMES_FULL[val];
    return String(val).padStart(2, '0');
  }

  function renderExplanationFields(parsed) {
    const fields = parsed.fields;
    elements.explanationFields.innerHTML = fields.map(f => {
      const values = f.parsed.isEvery ? '*' : f.parsed.values.map(v => formatValue(v, f.name)).join(', ');
      return `
        <div class="field-box">
          <div class="field-label">${f.name.replace(/([A-Z])/g, ' $1').trim()}</div>
          <div class="field-value">${escapeHtml(values)}</div>
        </div>
      `;
    }).join('');
  }

  function renderRuns() {
    elements.runsCard.hidden = false;
    renderRunsList(state.nextRuns, elements.nextRuns, 'next');
    renderRunsList(state.previousRuns, elements.previousRuns, 'previous');
  }

  function renderRunsList(runs, container, type) {
    if (runs.length === 0) {
      container.innerHTML = '<div class="empty-state" style="padding:1rem"><p>No runs to display</p></div>';
      return;
    }
    container.innerHTML = runs.map((run, i) => {
      const formatted = formatDateTime(run);
      const relative = getRelativeTime(run);
      return `
        <div class="run-item">
          <span class="run-index">${type === 'next' ? i + 1 : state.previousRuns.length - i}</span>
          <span class="run-datetime">${formatted}</span>
          <span class="run-relative">${relative}</span>
        </div>
      `;
    }).join('');
  }

  function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: state.timezone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  }

  function getRelativeTime(date) {
    const diff = date - state.referenceTime;
    const absDiff = Math.abs(diff);
    const minutes = Math.floor(absDiff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${diff > 0 ? 'in' : ''} ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${diff > 0 ? 'in' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    return `${diff > 0 ? 'in' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  function toggleRunsView(view) {
    document.querySelectorAll('.btn-toggle').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    elements.nextRuns.hidden = view !== 'next';
    elements.previousRuns.hidden = view !== 'previous';
  }

  function renderCalendar() {
    if (!state.parsed) return;
    elements.calendarCard.hidden = false;
    calculateCalendarRuns();

    const months = parseInt(elements.calendarMonths.value) || 3;
    const startStr = elements.calendarStart.value;
    let startDate;
    if (startStr) {
      const [y, m] = startStr.split('-').map(Number);
      startDate = new Date(Date.UTC(y, m - 1, 1));
    } else {
      const now = new Date();
      startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    }

    const today = new Date();
    const todayStr = formatDateKey(today);

    // Group runs by date
    const runsByDate = {};
    for (const run of state.calendarRuns) {
      const key = formatDateKey(run);
      runsByDate[key] = (runsByDate[key] || 0) + 1;
    }

    let html = '';
    for (let m = 0; m < months; m++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(monthDate.getMonth() + m);

      const year = monthDate.getUTCFullYear();
      const month = monthDate.getUTCMonth();
      const firstDay = new Date(Date.UTC(year, month, 1));
      const lastDay = new Date(Date.UTC(year, month + 1, 0));
      const startWeekday = firstDay.getUTCDay();
      const daysInMonth = lastDay.getUTCDate();

      html += `
        <div class="calendar-month">
          <div style="font-weight:600;margin-bottom:0.5rem;color:var(--fg)">${MONTH_NAMES[month]} ${year}</div>
          <div class="calendar-month-header">
            ${DAY_NAMES.map(d => `<div>${d}</div>`).join('')}
          </div>
          <div class="calendar-grid">
      `;

      // Empty cells before first day
      for (let i = 0; i < startWeekday; i++) {
        html += '<div class="calendar-day empty"></div>';
      }

      // Days of month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(year, month, day));
        const key = formatDateKey(date);
        const count = runsByDate[key] || 0;
        const isToday = key === todayStr;

        let classes = 'calendar-day';
        if (count > 0) {
          classes += count > 1 ? ' multiple' : ' has-run';
        }
        if (isToday) classes += ' today';
        if (count === 0) classes += ' empty';

        html += `<div class="${classes}" title="${key}${count ? ` (${count} run${count > 1 ? 's' : ''})` : ''}">${day}</div>`;
      }

      html += '</div></div>';
    }

    elements.calendarGrid.innerHTML = html;
  }

  function formatDateKey(date) {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: state.timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
    return fmt.format(date);
  }

  function showResults() {
    elements.emptyState.hidden = true;
    elements.errorState.hidden = true;
  }

  function showError(message) {
    elements.errorState.hidden = false;
    elements.errorMessage.textContent = message;
    elements.explanationCard.hidden = true;
    elements.runsCard.hidden = true;
    elements.calendarCard.hidden = true;
    elements.exportCard.hidden = true;
    elements.emptyState.hidden = true;
  }

  function hideError() {
    elements.errorState.hidden = true;
  }

  function clearAll() {
    elements.cronInput.value = '';
    elements.referenceTime.value = '';
    setDefaultReferenceTime();
    elements.runCount.value = '10';
    elements.showPrevious.checked = true;
    elements.showNext.checked = true;
    hideValidation();
    hideError();
    elements.explanationCard.hidden = true;
    elements.runsCard.hidden = true;
    elements.calendarCard.hidden = true;
    elements.exportCard.hidden = true;
    elements.emptyState.hidden = false;
    state.parsed = null;
    state.nextRuns = [];
    state.previousRuns = [];
    state.calendarRuns = [];
    elements.cronInput.focus();
  }

  function randomExpression() {
    const all = [...PRESETS.standard, ...PRESETS.quartz, ...PRESETS.spring];
    const random = all[Math.floor(Math.random() * all.length)];
    elements.cronInput.value = random.expr;
    validateExpression();
    analyze();
  }

  function exportData(format) {
    if (!state.parsed) return;

    const data = {
      expression: state.cronExpr,
      type: state.parsed.type,
      timezone: state.timezone,
      referenceTime: state.referenceTime.toISOString(),
      explanation: generateHumanExplanation(state.parsed),
      nextRuns: state.nextRuns.map(d => d.toISOString()),
      previousRuns: state.previousRuns.map(d => d.toISOString()),
    };

    let content, filename, mime;

    switch (format) {
      case 'text':
        content = generateTextExport(data);
        filename = 'cron-explanation.txt';
        mime = 'text/plain';
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = 'cron-expression.json';
        mime = 'application/json';
        break;
      case 'ical':
        content = generateIcalExport(data);
        filename = 'cron-schedule.ics';
        mime = 'text/calendar';
        break;
      case 'csv':
        content = generateCsvExport(data);
        filename = 'cron-runs.csv';
        mime = 'text/csv';
        break;
    }

    downloadBlob(content, filename, mime);
    showToast(`Exported as ${format.toUpperCase()}`);
  }

  function generateTextExport(data) {
    let out = `Cron Expression: ${data.expression}\n`;
    out += `Type: ${data.type}\n`;
    out += `Timezone: ${data.timezone}\n`;
    out += `Reference Time: ${data.referenceTime}\n\n`;
    out += `Explanation: ${data.explanation}\n\n`;
    if (data.nextRuns.length) {
      out += `Next ${data.nextRuns.length} Runs:\n`;
      data.nextRuns.forEach((r, i) => out += `  ${i + 1}. ${r}\n`);
      out += '\n';
    }
    if (data.previousRuns.length) {
      out += `Previous ${data.previousRuns.length} Runs:\n`;
      data.previousRuns.forEach((r, i) => out += `  ${i + 1}. ${r}\n`);
    }
    return out;
  }

  function generateIcalExport(data) {
    const allRuns = [...data.previousRuns, ...data.nextRuns].sort();
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//KING_YOSEF_//Cron Explainer//EN\nCALSCALE:GREGORIAN\n';
    for (const run of allRuns) {
      const dt = new Date(run);
      const stamp = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      ical += `BEGIN:VEVENT\nUID:${stamp}@cron-explainer\nDTSTAMP:${stamp}\nDTSTART:${stamp}\nSUMMARY:Cron: ${data.expression}\nDESCRIPTION:${data.explanation}\nEND:VEVENT\n`;
    }
    ical += 'END:VCALENDAR';
    return ical;
  }

  function generateCsvExport(data) {
    let csv = 'Type,Run Number,ISO Timestamp,Local Time\n';
    data.nextRuns.forEach((r, i) => {
      const local = formatDateTime(new Date(r));
      csv += `Next,${i + 1},${r},${local}\n`;
    });
    data.previousRuns.forEach((r, i) => {
      const local = formatDateTime(new Date(r));
      csv += `Previous,${i + 1},${r},${local}\n`;
    });
    return csv;
  }

  function exportLink() {
    const payload = {
      expr: state.cronExpr,
      tz: state.timezone,
      ref: state.referenceTime.toISOString(),
      count: state.runCount,
      prev: state.showPrevious,
      next: state.showNext,
    };
    const encoded = btoa(JSON.stringify(payload));
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Shareable link copied to clipboard!');
    }).catch(() => {
      prompt('Copy this link:', url);
    });
  }

  function checkUrlHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      const payload = JSON.parse(atob(hash));
      if (payload.expr) {
        elements.cronInput.value = payload.expr;
        if (payload.tz) elements.timezoneSelect.value = payload.tz;
        if (payload.ref) {
          const dt = new Date(payload.ref);
          dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
          elements.referenceTime.value = dt.toISOString().slice(0, 16);
        }
        if (payload.count) elements.runCount.value = payload.count;
        if (payload.prev !== undefined) elements.showPrevious.checked = payload.prev;
        if (payload.next !== undefined) elements.showNext.checked = payload.next;
        analyze();
      }
    } catch (e) {
      console.warn('Invalid share link');
    }
  }

  function downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function switchSyntaxTab(syntax) {
    document.querySelectorAll('.syntax-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.syntax === syntax);
    });
    elements.syntaxContent.innerHTML = getSyntaxContent(syntax);
  }

  function getSyntaxContent(syntax) {
    if (syntax === 'standard') {
      return `
        <div class="syntax-section">
          <h4>Standard 5-Field Format</h4>
          <div class="syntax-row"><span class="syntax-field">* * * * *</span><span class="syntax-desc">Minute Hour Day Month Weekday</span></div>
          <div class="syntax-row"><span class="syntax-field">0 9 * * 1-5</span><span class="syntax-desc">9:00 AM on weekdays</span></div>
          <div class="syntax-row"><span class="syntax-field">*/15 * * * *</span><span class="syntax-desc">Every 15 minutes</span></div>
          <div class="syntax-row"><span class="syntax-field">0 0 1 * *</span><span class="syntax-desc">Midnight on 1st of month</span></div>
          <div class="syntax-row"><span class="syntax-field">0 0 * * 0</span><span class="syntax-desc">Midnight on Sundays</span></div>
        </div>
        <div class="syntax-section">
          <h4>Standard 6-Field Format (with seconds)</h4>
          <div class="syntax-row"><span class="syntax-field">* * * * * *</span><span class="syntax-desc">Second Minute Hour Day Month Weekday</span></div>
          <div class="syntax-row"><span class="syntax-field">0 0 9 * * 1-5</span><span class="syntax-desc">9:00:00 AM on weekdays</span></div>
        </div>
        <div class="syntax-section">
          <h4>Special Characters</h4>
          <div class="syntax-row"><span class="syntax-field">*</span><span class="syntax-desc">Any value</span></div>
          <div class="syntax-row"><span class="syntax-field">,</span><span class="syntax-desc">Value list (1,3,5)</span></div>
          <div class="syntax-row"><span class="syntax-field">-</span><span class="syntax-desc">Range (1-5)</span></div>
          <div class="syntax-row"><span class="syntax-field">/</span><span class="syntax-desc">Step (*/5 = every 5)</span></div>
          <div class="syntax-row"><span class="syntax-field">Names</span><span class="syntax-desc">JAN-DEC, SUN-SAT</span></div>
        </div>
        <div class="syntax-example">
0 9 * * 1-5     # Weekdays at 9 AM\n*/30 * * * *    # Every 30 minutes\n0 0 1,15 * *    # 1st and 15th of month\n0 0 * * 0       # Sundays at midnight
        </div>
      `;
    }
    if (syntax === 'quartz') {
      return `
        <div class="syntax-section">
          <h4>Quartz Format (6 or 7 fields)</h4>
          <div class="syntax-row"><span class="syntax-field">* * * * * ? *</span><span class="syntax-desc">Sec Min Hour Day Month Weekday Year</span></div>
          <div class="syntax-row"><span class="syntax-field">0 0 9 ? * MON-FRI</span><span class="syntax-desc">9 AM weekdays (no specific day)</span></div>
          <div class="syntax-row"><span class="syntax-field">0 0 12 L * ?</span><span class="syntax-desc">Noon on last day of month</span></div>
          <div class="syntax-row"><span class="syntax-field">0 0 17 ? * 6L</span><span class="syntax-desc">5 PM on last Friday</span></div>
          <div class="syntax-row"><span class="syntax-field">0 0 9 ? * 2#1</span><span class="syntax-desc">9 AM on first Monday</span></div>
        </div>
        <div class="syntax-section">
          <h4>Quartz Special Characters</h4>
          <div class="syntax-row"><span class="syntax-field">?</span><span class="syntax-desc">No specific value (Day/Weekday)</span></div>
          <div class="syntax-row"><span class="syntax-field">L</span><span class="syntax-desc">Last (last day, last Friday=6L)</span></div>
          <div class="syntax-row"><span class="syntax-field">#</span><span class="syntax-desc">Nth occurrence (2#1 = 1st Monday)</span></div>
          <div class="syntax-row"><span class="syntax-field">W</span><span class="syntax-desc">Nearest weekday (15W = weekday near 15th)</span></div>
        </div>
        <div class="syntax-example">
0 0 9 ? * MON-FRI   # Weekdays 9 AM\n0 0 12 L * ?        # Last day of month at noon\n0 0 17 ? * 6L       # Last Friday at 5 PM\n0 0 9 ? * 2#1       # First Monday at 9 AM
        </div>
      `;
    }
    if (syntax === 'spring') {
      return `
        <div class="syntax-section">
          <h4>Spring @Annotations</h4>
          <div class="syntax-row"><span class="syntax-field">@yearly</span><span class="syntax-desc">Jan 1, midnight (0 0 1 1 *)</span></div>
          <div class="syntax-row"><span class="syntax-field">@monthly</span><span class="syntax-desc">1st of month, midnight (0 0 1 * *)</span></div>
          <div class="syntax-row"><span class="syntax-field">@weekly</span><span class="syntax-desc">Sunday, midnight (0 0 * * 0)</span></div>
          <div class="syntax-row"><span class="syntax-field">@daily</span><span class="syntax-desc">Every day, midnight (0 0 * * *)</span></div>
          <div class="syntax-row"><span class="syntax-field">@hourly</span><span class="syntax-desc">Every hour, minute 0 (0 * * * *)</span></div>
        </div>
        <div class="syntax-example">
@yearly   # 0 0 1 1 *\n@monthly  # 0 0 1 * *\n@weekly   # 0 0 * * 0\n@daily    # 0 0 * * *\n@hourly   # 0 * * * *
        </div>
      `;
    }
    return '';
  }

  function parseLocalDateTime(str) {
    const [datePart, timePart] = str.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": ''' })[c]);
  }

  // Bubble animation (shared with other tools)
  function startBubbles() {
    const container = document.getElementById('bubbles');
    const colors = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)'];

    function spawn() {
      const bubble = document.createElement('div');
      bubble.className = 'float';
      const size = Math.random() * 60 + 20;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const duration = Math.random() * 20 + 15;
      const dx = (Math.random() - 0.5) * 200;

      bubble.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        --c: ${color};
        --duration: ${duration}s;
        --dx: ${dx}px;
      `;
      container.appendChild(bubble);
      setTimeout(() => bubble.remove(), duration * 1000);
    }

    setInterval(spawn, 800);
    for (let i = 0; i < 8; i++) setTimeout(spawn, i * 200);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();