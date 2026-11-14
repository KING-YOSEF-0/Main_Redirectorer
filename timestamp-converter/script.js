const TimestampConverter = (() => {
  const state = {
    currentDate: null,
    currentTz: 'local',
    customOffset: 0,
  };

  const elements = {};

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    setDefaultToNow();
  }

  function cacheElements() {
    elements.tsInput = document.getElementById('ts-input');
    elements.tsTimezone = document.getElementById('ts-timezone');
    elements.customOffsetField = document.getElementById('custom-offset-field');
    elements.customOffset = document.getElementById('custom-offset');
    elements.btnConvert = document.getElementById('btn-convert');
    elements.btnNow = document.getElementById('btn-now');
    elements.btnRandom = document.getElementById('btn-random');
    elements.conversionsOutput = document.getElementById('conversions-output');
    elements.relativePanel = document.getElementById('relative-panel');
    elements.relativeOutput = document.getElementById('relative-output');
    elements.tzPanel = document.getElementById('tz-panel');
    elements.tzGrid = document.getElementById('tz-grid');
    elements.formatModal = document.getElementById('format-modal');
    elements.formatModalClose = document.getElementById('format-modal-close');

    // Date math
    elements.mathBase = document.getElementById('math-base');
    elements.mathAdd = document.getElementById('math-add');
    elements.mathSubtract = document.getElementById('math-subtract');
    elements.btnCalculate = document.getElementById('btn-calculate');
    elements.mathResult = document.getElementById('math-result');

    // Batch
    elements.batchInput = document.getElementById('batch-input');
    elements.btnBatchConvert = document.getElementById('btn-batch-convert');
    elements.btnBatchExportCsv = document.getElementById('btn-batch-export-csv');
    elements.btnBatchExportJson = document.getElementById('btn-batch-export-json');
    elements.batchOutput = document.getElementById('batch-output');
  }

  function bindEvents() {
    elements.tsInput.addEventListener('input', () => {
      // Live validation could go here
    });
    elements.tsTimezone.addEventListener('change', () => {
      state.currentTz = elements.tsTimezone.value;
      if (state.currentTz === 'custom') {
        elements.customOffsetField.hidden = false;
      } else {
        elements.customOffsetField.hidden = true;
        convert();
      }
    });
    elements.customOffset.addEventListener('input', () => {
      state.customOffset = parseFloat(elements.customOffset.value) || 0;
      convert();
    });

    elements.btnConvert.addEventListener('click', convert);
    elements.btnNow.addEventListener('click', setDefaultToNow);
    elements.btnRandom.addEventListener('click', randomDate);
    elements.btnCalculate.addEventListener('click', calculateDateMath);
    elements.btnBatchConvert.addEventListener('click', batchConvert);
    elements.btnBatchExportCsv.addEventListener('click', () => batchExport('csv'));
    elements.btnBatchExportJson.addEventListener('click', () => batchExport('json'));

    elements.formatModalClose.addEventListener('click', () => elements.formatModal.hidden = true);
    elements.formatModal.addEventListener('click', (e) => {
      if (e.target === elements.formatModal) elements.formatModal.hidden = true;
    });
    document.getElementById('btn-format-help').addEventListener('click', () => {
      elements.formatModal.hidden = false;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') elements.formatModal.hidden = true;
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) convert();
    });
  }

  function setDefaultToNow() {
    const now = new Date();
    elements.tsInput.value = now.toISOString();
    convert();
  }

  function randomDate() {
    const start = new Date(1970, 0, 1).getTime();
    const end = new Date(2100, 0, 1).getTime();
    const randomTime = start + Math.random() * (end - start);
    const date = new Date(randomTime);
    elements.tsInput.value = date.toISOString();
    convert();
  }

  function parseInput(input) {
    const str = input.trim();
    if (!str) return null;

    // "now" keyword
    if (str.toLowerCase() === 'now') {
      return new Date();
    }

    // Unix timestamp (seconds or milliseconds)
    const unixMatch = str.match(/^(\d{10,13})$/);
    if (unixMatch) {
      const num = parseInt(unixMatch[1]);
      // Heuristic: if 13 digits, it's milliseconds; if 10, it's seconds
      if (unixMatch[1].length >= 13) {
        return new Date(num);
      } else {
        return new Date(num * 1000);
      }
    }

    // Try parsing as ISO 8601 / RFC 2822 / other formats
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  }

  function getTimezoneOffset(date) {
    if (state.currentTz === 'utc') return 0;
    if (state.currentTz === 'local') return -date.getTimezoneOffset() * 60000;
    if (state.currentTz === 'custom') return state.customOffset * 3600000;

    // Named timezones - use Intl.DateTimeFormat
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: state.currentTz,
        hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      // This is a simplified approach; for true timezone support we'd need a library
      // For now, we'll use the offset calculation
      const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      const tzDate = new Date(utcDate.toLocaleString('en-US', { timeZone: state.currentTz }));
      return tzDate.getTime() - utcDate.getTime();
    } catch (e) {
      return -date.getTimezoneOffset() * 60000;
    }
  }

  function applyTimezone(date) {
    const offset = getTimezoneOffset(date);
    return new Date(date.getTime() + offset);
  }

  function formatDate(date, format) {
    const d = applyTimezone(date);

    switch (format) {
      case 'unix':
        return Math.floor(d.getTime() / 1000).toString();
      case 'unix-ms':
        return d.getTime().toString();
      case 'iso':
        return d.toISOString();
      case 'iso-local':
        // ISO format but with local timezone offset
        const offset = -d.getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const pad = n => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(Math.abs(offset)/60))}:${pad(Math.abs(offset)%60)}`;
      case 'rfc2822':
        return d.toUTCString();
      case 'rfc3339':
        return d.toISOString().replace('Z', '+00:00');
      case 'human':
        return d.toLocaleString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          timeZoneName: 'short',
        });
      case 'human-short':
        return d.toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
      case 'date-only':
        return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      case 'time-only':
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
      case 'sql':
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      case 'http':
        return d.toUTCString().replace('GMT', 'GMT'); // Already correct
      case 'cocoa':
        return (d.getTime() / 1000 - 978307200).toFixed(6); // Mac absolute time
      case 'windows':
        return (BigInt(d.getTime() * 10000) + 116444736000000000n).toString(); // Windows file time
      default:
        return d.toISOString();
    }
  }

  function pad(n) { return n.toString().padStart(2, '0'); }

  function convert() {
    const input = elements.tsInput.value;
    const parsed = parseInput(input);

    if (!parsed) {
      elements.conversionsOutput.innerHTML = '<div class="empty-results"><div class="empty-icon">⚠️</div><p>Invalid timestamp or date format</p></div>';
      elements.relativePanel.hidden = true;
      elements.tzPanel.hidden = true;
      return;
    }

    state.currentDate = parsed;
    renderConversions();
    renderRelativeTime();
    renderTimezoneComparison();
  }

  function renderConversions() {
    const formats = [
      { key: 'unix', label: 'Unix Timestamp (seconds)', short: true },
      { key: 'unix-ms', label: 'Unix Timestamp (milliseconds)' },
      { key: 'iso', label: 'ISO 8601 (UTC)', short: true },
      { key: 'iso-local', label: 'ISO 8601 (Local)' },
      { key: 'rfc2822', label: 'RFC 2822 / UTC' },
      { key: 'rfc3339', label: 'RFC 3339' },
      { key: 'human', label: 'Human Readable', short: true },
      { key: 'human-short', label: 'Short Format' },
      { key: 'date-only', label: 'Date Only' },
      { key: 'time-only', label: 'Time Only' },
      { key: 'sql', label: 'SQL Datetime' },
      { key: 'http', label: 'HTTP Header (RFC 1123)' },
      { key: 'cocoa', label: 'Cocoa / Core Data' },
      { key: 'windows', label: 'Windows File Time' },
    ];

    let html = '<div class="conversion-grid">';
    for (const item of formats) {
      const value = formatDate(state.currentDate, item.key);
      html += `
        <div class="conversion-card" data-format="${item.key}">
          <div class="conversion-header">
            <span class="conversion-label">${item.label}</span>
            <button class="conversion-copy" data-value="${escapeHtml(value)}">Copy</button>
          </div>
          <div class="conversion-value" title="${escapeHtml(value)}">${escapeHtml(value)}</div>
        </div>
      `;
    }
    html += '</div>';

    elements.conversionsOutput.innerHTML = html;

    elements.conversionsOutput.querySelectorAll('.conversion-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.value).then(() => {
          btn.textContent = 'Copied!';
          btn.parentElement.parentElement.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.parentElement.parentElement.classList.remove('copied');
          }, 1500);
        });
      });
    });
  }

  function renderRelativeTime() {
    const now = new Date();
    const diff = state.currentDate.getTime() - now.getTime();
    const absDiff = Math.abs(diff);
    const isPast = diff < 0;

    const units = [
      { unit: 'year', ms: 31557600000 },
      { unit: 'month', ms: 2629800000 },
      { unit: 'week', ms: 604800000 },
      { unit: 'day', ms: 86400000 },
      { unit: 'hour', ms: 3600000 },
      { unit: 'minute', ms: 60000 },
      { unit: 'second', ms: 1000 },
    ];

    let remaining = absDiff;
    const parts = [];

    for (const { unit, ms } of units) {
      const value = Math.floor(remaining / ms);
      if (value > 0) {
        parts.push(`${value} ${unit}${value > 1 ? 's' : ''}`);
        remaining -= value * ms;
      }
    }

    const relativeStr = parts.length > 0 ? parts.slice(0, 3).join(', ') : 'less than a second';
    const fullRelative = isPast ? `${relativeStr} ago` : `in ${relativeStr}`;

    // Calculate specific milestones
    const milestones = [
      { label: 'From now', value: fullRelative },
      { label: 'Days difference', value: (diff / 86400000).toFixed(2) },
      { label: 'Hours difference', value: (diff / 3600000).toFixed(2) },
      { label: 'Minutes difference', value: (diff / 60000).toFixed(2) },
      { label: 'Seconds difference', value: (diff / 1000).toFixed(2) },
      { label: 'Milliseconds difference', value: diff.toString() },
      { label: 'Unix diff (seconds)', value: Math.floor(diff / 1000).toString() },
    ];

    let html = '';
    for (const m of milestones) {
      html += `
        <div class="relative-item">
          <span class="relative-label">${m.label}</span>
          <span class="relative-value">${escapeHtml(m.value)}</span>
        </div>
      `;
    }

    elements.relativeOutput.innerHTML = html;
    elements.relativePanel.hidden = false;
  }

  function renderTimezoneComparison() {
    const zones = [
      { id: 'utc', name: 'UTC' },
      { id: 'america/new_york', name: 'New York' },
      { id: 'america/los_angeles', name: 'Los Angeles' },
      { id: 'europe/london', name: 'London' },
      { id: 'europe/paris', name: 'Paris' },
      { id: 'asia/tokyo', name: 'Tokyo' },
      { id: 'asia/shanghai', name: 'Shanghai' },
      { id: 'asia/dubai', name: 'Dubai' },
      { id: 'asia/kolkata', name: 'Kolkata' },
      { id: 'australia/sydney', name: 'Sydney' },
    ];

    let html = '';
    for (const zone of zones) {
      let timeStr, offsetStr;
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: zone.id,
          hour12: false,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        const parts = formatter.formatToParts(state.currentDate);
        const get = type => parts.find(p => p.type === type)?.value || '';
        timeStr = `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;

        // Get offset
        const jan = new Date(state.currentDate.getFullYear(), 0, 1);
        const jul = new Date(state.currentDate.getFullYear(), 6, 1);
        const janOffset = -new Intl.DateTimeFormat('en-US', { timeZone: zone.id, timeZoneName: 'longOffset' }).formatToParts(jan).find(p => p.type === 'timeZoneName')?.value?.match(/([+-]\d+)/)?.[1] || 0;
        const julOffset = -new Intl.DateTimeFormat('en-US', { timeZone: zone.id, timeZoneName: 'longOffset' }).formatToParts(jul).find(p => p.type === 'timeZoneName')?.value?.match(/([+-]\d+)/)?.[1] || 0;
        const offset = Math.max(parseInt(janOffset), parseInt(julOffset));
        offsetStr = `UTC${offset >= 0 ? '+' : ''}${offset}`;
      } catch (e) {
        timeStr = 'N/A';
        offsetStr = 'N/A';
      }

      const isCurrent = (state.currentTz === zone.id) || (state.currentTz === 'local' && zone.id === Intl.DateTimeFormat().resolvedOptions().timeZone);
      html += `
        <div class="tz-card ${isCurrent ? 'current' : ''}">
          <div class="tz-name">${zone.name}</div>
          <div class="tz-time">${escapeHtml(timeStr)}</div>
          <div class="tz-offset">${escapeHtml(offsetStr)}</div>
        </div>
      `;
    }

    elements.tzGrid.innerHTML = html;
    elements.tzPanel.hidden = false;
  }

  function calculateDateMath() {
    const baseInput = elements.mathBase.value.trim() || elements.tsInput.value.trim();
    const baseDate = parseInput(baseInput);

    if (!baseDate) {
      showToast('Invalid base date');
      return;
    }

    const addStr = elements.mathAdd.value.trim();
    const subtractStr = elements.mathSubtract.value.trim();

    let resultDate = new Date(baseDate.getTime());

    if (addStr) {
      const addMs = parseDuration(addStr);
      if (addMs !== null) resultDate = new Date(resultDate.getTime() + addMs);
    }

    if (subtractStr) {
      const subMs = parseDuration(subtractStr);
      if (subMs !== null) resultDate = new Date(resultDate.getTime() - subMs);
    }

    const diffMs = resultDate.getTime() - baseDate.getTime();

    elements.mathResult.innerHTML = `
      <div class="math-row"><span class="math-label">Base Date</span><span class="math-value">${formatDate(baseDate, 'human')}</span></div>
      <div class="math-row"><span class="math-label">Result Date</span><span class="math-value">${formatDate(resultDate, 'human')}</span></div>
      <div class="math-row"><span class="math-label">Difference</span><span class="math-value">${formatDuration(diffMs)}</span></div>
      <div class="math-row"><span class="math-label">Result Unix (s)</span><span class="math-value">${Math.floor(resultDate.getTime() / 1000)}</span></div>
      <div class="math-row"><span class="math-label">Result ISO</span><span class="math-value">${resultDate.toISOString()}</span></div>
    `;
  }

  function parseDuration(str) {
    // Parse formats like: 1y 2m 3w 4d 5h 6m 7s
    const regex = /(\d+(?:\.\d+)?)\s*([ymwdhms])/gi;
    let totalMs = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();

      switch (unit) {
        case 'y': totalMs += value * 31557600000; break; // year (365.25 days)
        case 'm':
          // Could be month or minute - check context
          // If followed by 's' or alone at end, likely minutes
          // This is ambiguous; we'll check if there's a space after
          const nextChar = str[match.index + match[0].length];
          if (nextChar === 's' || nextChar === ' ' || !nextChar) {
            // Check previous context
            const prevPart = str.slice(0, match.index).trim().slice(-1);
            if (prevPart === 'h' || prevPart === 'd' || prevPart === 'w') {
              totalMs += value * 60000; // minutes
            } else {
              totalMs += value * 2629800000; // months
            }
          } else {
            totalMs += value * 60000; // minutes
          }
          break;
        case 'w': totalMs += value * 604800000; break;
        case 'd': totalMs += value * 86400000; break;
        case 'h': totalMs += value * 3600000; break;
        case 's': totalMs += value * 1000; break;
      }
    }

    return totalMs > 0 ? totalMs : null;
  }

  function formatDuration(ms) {
    const absMs = Math.abs(ms);
    const sign = ms < 0 ? '-' : '';

    const units = [
      { unit: 'year', ms: 31557600000 },
      { unit: 'month', ms: 2629800000 },
      { unit: 'week', ms: 604800000 },
      { unit: 'day', ms: 86400000 },
      { unit: 'hour', ms: 3600000 },
      { unit: 'minute', ms: 60000 },
      { unit: 'second', ms: 1000 },
      { unit: 'ms', ms: 1 },
    ];

    let remaining = absMs;
    const parts = [];

    for (const { unit, ms: unitMs } of units) {
      const value = Math.floor(remaining / unitMs);
      if (value > 0) {
        parts.push(`${value}${unit[0]}`);
        remaining -= value * unitMs;
      }
    }

    return sign + (parts.length > 0 ? parts.join(' ') : '0ms');
  }

  function batchConvert() {
    const lines = elements.batchInput.value.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) {
      showToast('Enter timestamps to convert');
      return;
    }

    let html = `
      <div class="batch-row batch-row-header">
        <div>Input</div>
        <div class="batch-value">Unix (s)</div>
        <div class="batch-value">Unix (ms)</div>
        <div class="batch-value">ISO 8601</div>
        <div class="batch-value">Human</div>
      </div>
    `;

    for (const line of lines) {
      const parsed = parseInput(line.trim());
      if (parsed) {
        html += `
          <div class="batch-row">
            <div>${escapeHtml(line.trim().slice(0, 50))}</div>
            <div class="batch-value">${formatDate(parsed, 'unix')}</div>
            <div class="batch-value">${formatDate(parsed, 'unix-ms')}</div>
            <div class="batch-value">${formatDate(parsed, 'iso')}</div>
            <div class="batch-value">${formatDate(parsed, 'human-short')}</div>
          </div>
        `;
      } else {
        html += `
          <div class="batch-row" style="color: var(--accent);">
            <div>${escapeHtml(line.trim().slice(0, 50))}</div>
            <div class="batch-value" colspan="4">Invalid format</div>
          </div>
        `;
      }
    }

    elements.batchOutput.innerHTML = html;
    showToast(`Converted ${lines.length} timestamps`);
  }

  function batchExport(format) {
    const lines = elements.batchInput.value.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return;

    let content;
    if (format === 'csv') {
      content = 'Input,Unix (s),Unix (ms),ISO 8601,RFC 2822,Human\n';
      for (const line of lines) {
        const parsed = parseInput(line.trim());
        if (parsed) {
          content += `"${escapeCsv(line.trim())}",${formatDate(parsed, 'unix')},${formatDate(parsed, 'unix-ms')},"${formatDate(parsed, 'iso')}","${formatDate(parsed, 'rfc2822')}","${formatDate(parsed, 'human')}"\n`;
        } else {
          content += `"${escapeCsv(line.trim())}",,,,\n`;
        }
      }
    } else {
      const data = lines.map(line => {
        const parsed = parseInput(line.trim());
        if (parsed) {
          return {
            input: line.trim(),
            unix: formatDate(parsed, 'unix'),
            unix_ms: formatDate(parsed, 'unix-ms'),
            iso: formatDate(parsed, 'iso'),
            rfc2822: formatDate(parsed, 'rfc2822'),
            human: formatDate(parsed, 'human'),
          };
        }
        return { input: line.trim(), error: 'Invalid format' };
      });
      content = JSON.stringify(data, null, 2);
    }

    const mime = format === 'csv' ? 'text/csv' : 'application/json';
    const ext = format === 'csv' ? 'csv' : 'json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timestamps.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported as ${ext.toUpperCase()}`);
  }

  function escapeCsv(str) {
    return str.replace(/"/g, '""');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": ''' })[c]);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();