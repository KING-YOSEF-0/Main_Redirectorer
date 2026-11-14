const RegexTester = (() => {
  const state = {
    pattern: '',
    flags: 'g',
    testString: '',
    regex: null,
    matches: [],
    savedPatterns: [],
    currentMatchIndex: -1,
  };

  const elements = {};

  const PRESETS = [
    { label: 'Email', pattern: '/^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$/' },
    { label: 'URL', pattern: '/https?:\\/\\/[^\\s]+/' },
    { label: 'IP Address', pattern: '/\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/' },
    { label: 'Hex Color', pattern: '/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/' },
    { label: 'Date (YYYY-MM-DD)', pattern: '/^\\d{4}-\\d{2}-\\d{2}$/' },
    { label: 'Phone (US)', pattern: '/\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}/' },
    { label: 'UUID', pattern: '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i' },
    { label: 'JWT', pattern: '/^eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$/' },
    { label: 'Credit Card', pattern: '/\\b\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b/' },
    { label: 'HTML Tag', pattern: '/<([^>]+)>[^<]*<\\/\\1>/' },
    { label: 'Whitespace', pattern: '/\\s+/' },
    { label: 'Words', pattern: '/\\b\\w+\\b/g' },
  ];

  function init() {
    cacheElements();
    loadSavedPatterns();
    renderPresets();
    renderSavedPatterns();
    bindEvents();
    startBubbles();
    checkUrlHash();
  }

  function cacheElements() {
    elements.patternInput = document.getElementById('regex-pattern');
    elements.testString = document.getElementById('test-string');
    elements.replacement = document.getElementById('replacement');
    elements.replaceAll = document.getElementById('replace-all');
    elements.replacementResult = document.getElementById('replacement-result');
    elements.explanationOutput = document.getElementById('explanation-output');
    elements.matchStats = document.getElementById('match-stats');
    elements.resultsContent = document.getElementById('results-content');
    elements.validationStatus = document.getElementById('validation-status');
    elements.btnTest = document.getElementById('btn-test');
    elements.btnClear = document.getElementById('btn-clear');
    elements.btnSave = document.getElementById('btn-save');
    elements.btnReplace = document.getElementById('btn-replace');
    elements.btnCopyMatches = document.getElementById('btn-copy-matches');
    elements.btnCopyGroups = document.getElementById('btn-copy-groups');
    elements.btnExportJson = document.getElementById('btn-export-json');
    elements.savedPatternsSelect = document.getElementById('saved-patterns-select');
    elements.btnApplySaved = document.getElementById('btn-apply-saved');
    elements.btnDeleteSaved = document.getElementById('btn-delete-saved');
    elements.matchModal = document.getElementById('match-modal');
    elements.matchModalClose = document.getElementById('match-modal-close');
    elements.matchModalTitle = document.getElementById('match-modal-title');
    elements.matchModalContent = document.getElementById('match-modal-content');
    elements.regexHelpModal = document.getElementById('regex-help-modal');
    elements.regexHelpClose = document.getElementById('regex-help-close');
    elements.regexHelpContent = document.getElementById('regex-help-content');
    elements.presetButtons = document.getElementById('regex-presets');

    // Flag checkboxes
    elements.flags = {
      g: document.getElementById('flag-global'),
      i: document.getElementById('flag-ignorecase'),
      m: document.getElementById('flag-multiline'),
      s: document.getElementById('flag-dotall'),
      u: document.getElementById('flag-unicode'),
      y: document.getElementById('flag-sticky'),
    };
  }

  function bindEvents() {
    elements.patternInput.addEventListener('input', validatePattern);
    elements.testString.addEventListener('input', () => {
      if (state.regex) testRegex();
    });
    elements.replacement.addEventListener('input', applyReplacement);
    elements.replaceAll.addEventListener('change', applyReplacement);

    Object.values(elements.flags).forEach(cb => {
      cb.addEventListener('change', () => {
        updateFlags();
        if (state.regex) testRegex();
      });
    });

    elements.btnTest.addEventListener('click', testRegex);
    elements.btnClear.addEventListener('click', clearAll);
    elements.btnSave.addEventListener('click', savePattern);
    elements.btnReplace.addEventListener('click', applyReplacement);
    elements.btnCopyMatches.addEventListener('click', copyAllMatches);
    elements.btnCopyGroups.addEventListener('click', copyGroups);
    elements.btnExportJson.addEventListener('click', exportJson);
    elements.btnApplySaved.addEventListener('click', applySavedPattern);
    elements.btnDeleteSaved.addEventListener('click', deleteSavedPattern);
    elements.savedPatternsSelect.addEventListener('change', () => {
      elements.btnApplySaved.disabled = !elements.savedPatternsSelect.value;
      elements.btnDeleteSaved.disabled = !elements.savedPatternsSelect.value;
    });

    elements.matchModalClose.addEventListener('click', () => elements.matchModal.hidden = true);
    elements.matchModal.addEventListener('click', (e) => {
      if (e.target === elements.matchModal) elements.matchModal.hidden = true;
    });

    elements.regexHelpClose.addEventListener('click', () => elements.regexHelpModal.hidden = true);
    elements.regexHelpModal.addEventListener('click', (e) => {
      if (e.target === elements.regexHelpModal) elements.regexHelpModal.hidden = true;
    });

    document.querySelectorAll('.syntax-tab').forEach(btn => {
      btn.addEventListener('click', () => switchHelpTab(btn.dataset.syntax));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        elements.matchModal.hidden = true;
        elements.regexHelpModal.hidden = true;
      }
    });
  }

  function updateFlags() {
    state.flags = Object.entries(elements.flags)
      .filter(([_, cb]) => cb.checked)
      .map(([flag]) => flag)
      .join('');
    elements.flags.g.checked = true; // Always keep global for match display
    if (!state.flags.includes('g')) state.flags += 'g';
  }

  function validatePattern() {
    const input = elements.patternInput.value.trim();
    elements.btnTest.disabled = !input;

    if (!input) {
      hideValidation();
      return;
    }

    const { pattern, flags } = parsePatternInput(input);
    try {
      new RegExp(pattern, flags);
      showValidation('valid', '✓ Valid regex pattern');
    } catch (e) {
      showValidation('invalid', `✗ ${e.message}`);
    }
  }

  function parsePatternInput(input) {
    // Handle /pattern/flags format
    const match = input.match(/^\/(.+)\/([gimsuy]*)$/);
    if (match) {
      return { pattern: match[1], flags: match[2] };
    }
    return { pattern: input, flags: state.flags };
  }

  function showValidation(type, message) {
    elements.validationStatus.hidden = false;
    elements.validationStatus.className = `validation-status ${type}`;
    elements.validationStatus.textContent = message;
  }

  function hideValidation() {
    elements.validationStatus.hidden = true;
  }

  function testRegex() {
    const input = elements.patternInput.value.trim();
    if (!input) return;

    const { pattern, flags } = parsePatternInput(input);
    state.pattern = pattern;
    state.flags = flags || 'g';

    try {
      state.regex = new RegExp(pattern, state.flags);
    } catch (e) {
      showValidation('invalid', `✗ ${e.message}`);
      return;
    }

    state.testString = elements.testString.value;
    state.matches = [];
    state.currentMatchIndex = -1;

    // Find all matches
    let match;
    const globalRegex = new RegExp(pattern, state.flags.includes('g') ? state.flags : state.flags + 'g');
    while ((match = globalRegex.exec(state.testString)) !== null) {
      state.matches.push({
        index: match.index,
        fullMatch: match[0],
        groups: match.slice(1),
        namedGroups: match.groups || {},
        input: match.input,
      });
      if (!globalRegex.global) break;
    }

    renderResults();
    renderExplanation();
    applyReplacement();
    showValidation('valid', `✓ Valid - ${state.matches.length} match${state.matches.length !== 1 ? 'es' : ''} found`);
  }

  function renderResults() {
    elements.resultsContent.innerHTML = '';

    if (state.matches.length === 0) {
      elements.resultsContent.innerHTML = `
        <div class="empty-results">
          <div class="empty-icon">🔍</div>
          <p>No matches found</p>
        </div>
      `;
      elements.matchStats.textContent = '';
      return;
    }

    elements.matchStats.textContent = `${state.matches.length} match${state.matches.length !== 1 ? 'es' : ''}`;

    // Show highlighted string
    const highlightedDiv = document.createElement('div');
    highlightedDiv.className = 'highlighted-string';
    highlightedDiv.innerHTML = highlightMatches(state.testString, state.matches);
    elements.resultsContent.appendChild(highlightedDiv);

    // Match details list
    state.matches.forEach((match, i) => {
      const item = document.createElement('div');
      item.className = 'match-item';
      item.dataset.index = i;
      item.innerHTML = `
        <div class="match-header">
          <span class="match-index">#${i + 1}</span>
          <span class="match-position">Index: ${match.index} → ${match.index + match.fullMatch.length}</span>
        </div>
        <div class="match-full">${escapeHtml(match.fullMatch)}</div>
        ${match.groups.length > 0 || Object.keys(match.namedGroups).length > 0 ? `
          <div class="match-groups">
            ${match.groups.map((g, idx) => `
              <div class="group-item">
                <span class="group-name">$${idx + 1}</span>
                <span class="group-value">${escapeHtml(g)}</span>
                <span class="group-index">${match.index + match.fullMatch.indexOf(g)}</span>
              </div>
            `).join('')}
            ${Object.entries(match.namedGroups).map(([name, val]) => `
              <div class="group-item">
                <span class="group-name">{{${name}}}</span>
                <span class="group-value">${escapeHtml(val)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      `;
      item.addEventListener('click', () => showMatchDetails(i));
      elements.resultsContent.appendChild(item);
    });
  }

  function highlightMatches(str, matches) {
    if (matches.length === 0) return escapeHtml(str);

    let result = '';
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // Text before match
      result += escapeHtml(str.slice(lastIndex, match.index));
      // Match with highlight
      const className = `match-highlight group-${i % 5}`;
      result += `<span class="${className}">${escapeHtml(match.fullMatch)}</span>`;
      lastIndex = match.index + match.fullMatch.length;
    });

    // Remaining text
    result += escapeHtml(str.slice(lastIndex));
    return result;
  }

  function renderExplanation() {
    if (!state.regex) {
      elements.explanationOutput.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">Enter a pattern to see explanation</p>';
      return;
    }

    const tokens = tokenizeRegex(state.pattern);
    elements.explanationOutput.innerHTML = tokens.map(t => `
      <span class="explanation-token ${t.type}" title="${t.desc}">
        <span class="token-symbol">${escapeHtml(t.symbol)}</span>
        <span class="token-desc">${escapeHtml(t.desc)}</span>
      </span>
    `).join('');
  }

  function tokenizeRegex(pattern) {
    const tokens = [];
    let i = 0;

    while (i < pattern.length) {
      const ch = pattern[i];

      // Escaped character
      if (ch === '\\' && i + 1 < pattern.length) {
        const next = pattern[i + 1];
        if ('^$.*+?()[]{}|\\'.includes(next)) {
          tokens.push({ symbol: '\\' + next, desc: 'Escaped literal', type: 'literal' });
          i += 2;
          continue;
        }
        // Special escapes
        const special = { d: '\\d (digit)', D: '\\D (non-digit)', w: '\\w (word)', W: '\\W (non-word)', s: '\\s (space)', S: '\\S (non-space)', b: '\\b (word boundary)', B: '\\B (non-boundary)' };
        if (special[next]) {
          tokens.push({ symbol: '\\' + next, desc: special[next], type: 'meta' });
          i += 2;
          continue;
        }
        // Control escapes
        const control = { n: 'newline', r: 'carriage return', t: 'tab', f: 'form feed', v: 'vertical tab' };
        if (control[next]) {
          tokens.push({ symbol: '\\' + next, desc: `\\${next} (${control[next]})`, type: 'literal' });
          i += 2;
          continue;
        }
        // Hex/Unicode
        if (next === 'x' && i + 3 < pattern.length) {
          tokens.push({ symbol: pattern.slice(i, i + 4), desc: 'Hex escape', type: 'literal' });
          i += 4;
          continue;
        }
        if (next === 'u' && i + 5 < pattern.length) {
          tokens.push({ symbol: pattern.slice(i, i + 6), desc: 'Unicode escape', type: 'literal' });
          i += 6;
          continue;
        }
        // Default escaped
        tokens.push({ symbol: '\\' + next, desc: 'Escaped character', type: 'literal' });
        i += 2;
        continue;
      }

      // Quantifiers
      if ('*+?'.includes(ch)) {
        tokens.push({ symbol: ch, desc: ch === '*' ? '0 or more' : ch === '+' ? '1 or more' : '0 or 1', type: 'quantifier' });
        i++;
        continue;
      }
      if (ch === '{') {
        const end = pattern.indexOf('}', i);
        if (end !== -1) {
          tokens.push({ symbol: pattern.slice(i, end + 1), desc: 'Quantifier', type: 'quantifier' });
          i = end + 1;
          continue;
        }
      }

      // Groups
      if (ch === '(') {
        if (i + 1 < pattern.length && pattern[i + 1] === '?') {
          if (i + 2 < pattern.length) {
            const next = pattern[i + 2];
            if (next === '<') {
              const end = pattern.indexOf('>', i);
              if (end !== -1) {
                tokens.push({ symbol: pattern.slice(i, end + 1), desc: 'Named capture group', type: 'group' });
                i = end + 1;
                continue;
              }
            }
            if (':'.includes(next)) {
              tokens.push({ symbol: '(?:', desc: 'Non-capturing group', type: 'group' });
              i += 3;
              continue;
            }
            if ('=!'.includes(next)) {
              tokens.push({ symbol: '(?' + next, desc: next === '=' ? 'Positive lookahead' : 'Negative lookahead', type: 'assertion' });
              i += 3;
              continue;
            }
            if ('<'.includes(next)) {
              // Lookbehind handled below
            }
          }
        }
        tokens.push({ symbol: '(', desc: 'Capturing group', type: 'group' });
        i++;
        continue;
      }
      if (ch === ')') {
        tokens.push({ symbol: ')', desc: 'End group', type: 'group' });
        i++;
        continue;
      }

      // Assertions
      if (ch === '^') {
        tokens.push({ symbol: '^', desc: 'Start of string/line', type: 'assertion' });
        i++;
        continue;
      }
      if (ch === '$') {
        tokens.push({ symbol: '$', desc: 'End of string/line', type: 'assertion' });
        i++;
        continue;
      }
      if (ch === '\\' && i + 1 < pattern.length && 'bB'.includes(pattern[i + 1])) {
        tokens.push({ symbol: '\\' + pattern[i + 1], desc: pattern[i + 1] === 'b' ? 'Word boundary' : 'Non-word boundary', type: 'assertion' });
        i += 2;
        continue;
      }
      if (ch === '(?=' || (ch === '(' && pattern.slice(i, i + 4) === '(?=')) {
        tokens.push({ symbol: '(?=', desc: 'Positive lookahead', type: 'assertion' });
        i += 3;
        continue;
      }
      if (ch === '(?!' || (ch === '(' && pattern.slice(i, i + 4) === '(?!')) {
        tokens.push({ symbol: '(?!', desc: 'Negative lookahead', type: 'assertion' });
        i += 3;
        continue;
      }
      if (ch === '(?<=' || (ch === '(' && pattern.slice(i, i + 5) === '(?<=')) {
        tokens.push({ symbol: '(?<=', desc: 'Positive lookbehind', type: 'assertion' });
        i += 4;
        continue;
      }
      if (ch === '(?<!' || (ch === '(' && pattern.slice(i, i + 5) === '(?<!')) {
        tokens.push({ symbol: '(?<!', desc: 'Negative lookbehind', type: 'assertion' });
        i += 4;
        continue;
      }

      // Alternation
      if (ch === '|') {
        tokens.push({ symbol: '|', desc: 'Alternation (OR)', type: 'meta' });
        i++;
        continue;
      }

      // Character classes
      if (ch === '[') {
        const end = pattern.indexOf(']', i);
        if (end !== -1) {
          tokens.push({ symbol: pattern.slice(i, end + 1), desc: 'Character class', type: 'charclass' });
          i = end + 1;
          continue;
        }
      }

      // Dot
      if (ch === '.') {
        tokens.push({ symbol: '.', desc: 'Any character (except newline)', type: 'meta' });
        i++;
        continue;
      }

      // Literal character
      tokens.push({ symbol: ch, desc: 'Literal character', type: 'literal' });
      i++;
    }

    return tokens;
  }

  function applyReplacement() {
    if (!state.regex || !elements.replacement.value) {
      elements.replacementResult.value = '';
      return;
    }

    const replacement = elements.replacement.value;
    const flags = elements.replaceAll.checked ? state.flags : state.flags.replace('g', '');

    try {
      const regex = new RegExp(state.pattern, flags);
      const result = state.testString.replace(regex, replacement);
      elements.replacementResult.value = result;
    } catch (e) {
      elements.replacementResult.value = `Error: ${e.message}`;
    }
  }

  function showMatchDetails(index) {
    const match = state.matches[index];
    if (!match) return;

    state.currentMatchIndex = index;

    // Update selected state
    document.querySelectorAll('.match-item').forEach(item => {
      item.classList.toggle('selected', parseInt(item.dataset.index) === index);
    });

    let html = `
      <div style="margin-bottom:1rem;">
        <strong>Full Match:</strong>
        <div style="font-family:var(--font-mono);background:var(--bg);padding:0.5rem;border-radius:4px;border:1px solid var(--border);margin-top:0.5rem;word-break:break-all;">${escapeHtml(match.fullMatch)}</div>
      </div>
      <div style="margin-bottom:1rem;">
        <strong>Position:</strong> ${match.index} → ${match.index + match.fullMatch.length} (length: ${match.fullMatch.length})
      </div>
    `;

    if (match.groups.length > 0) {
      html += '<div><strong>Numbered Groups:</strong></div>';
      match.groups.forEach((g, i) => {
        html += `
          <div class="group-item" style="margin:0.5rem 0;">
            <span class="group-name">$${i + 1}</span>
            <span class="group-value">${escapeHtml(g)}</span>
          </div>
        `;
      });
    }

    if (Object.keys(match.namedGroups).length > 0) {
      html += '<div style="margin-top:1rem;"><strong>Named Groups:</strong></div>';
      Object.entries(match.namedGroups).forEach(([name, val]) => {
        html += `
          <div class="group-item" style="margin:0.5rem 0;">
            <span class="group-name">{{${name}}}</span>
            <span class="group-value">${escapeHtml(val)}</span>
          </div>
        `;
      });
    }

    elements.matchModalTitle.textContent = `Match #${index + 1} Details`;
    elements.matchModalContent.innerHTML = html;
    elements.matchModal.hidden = false;
  }

  function copyAllMatches() {
    if (state.matches.length === 0) return;
    const text = state.matches.map(m => m.fullMatch).join('\n');
    navigator.clipboard.writeText(text).then(() => showToast('Copied all matches'));
  }

  function copyGroups() {
    if (state.matches.length === 0) return;
    const groups = state.matches.flatMap(m => m.groups);
    if (groups.length === 0) {
      showToast('No capture groups found');
      return;
    }
    const text = groups.join('\n');
    navigator.clipboard.writeText(text).then(() => showToast('Copied capture groups'));
  }

  function exportJson() {
    if (!state.regex) return;
    const data = {
      pattern: state.pattern,
      flags: state.flags,
      testString: state.testString,
      matches: state.matches.map(m => ({
        index: m.index,
        match: m.fullMatch,
        groups: m.groups,
        namedGroups: m.namedGroups,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regex-matches.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as JSON');
  }

  function savePattern() {
    const name = prompt('Enter a name for this pattern:', 'My Pattern');
    if (!name) return;

    const pattern = {
      name,
      pattern: state.pattern,
      flags: state.flags,
      testString: state.testString,
      replacement: elements.replacement.value,
      timestamp: Date.now(),
    };

    state.savedPatterns.push(pattern);
    localStorage.setItem('regex-tester-patterns', JSON.stringify(state.savedPatterns));
    renderSavedPatterns();
    showToast('Pattern saved');
  }

  function loadSavedPatterns() {
    try {
      const stored = localStorage.getItem('regex-tester-patterns');
      if (stored) state.savedPatterns = JSON.parse(stored);
    } catch (e) {
      state.savedPatterns = [];
    }
  }

  function renderSavedPatterns() {
    elements.savedPatternsSelect.innerHTML = '<option value="">Select a saved pattern...</option>';
    state.savedPatterns.forEach((p, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${p.name} (/${p.pattern}/${p.flags})`;
      elements.savedPatternsSelect.appendChild(opt);
    });
    elements.btnApplySaved.disabled = true;
    elements.btnDeleteSaved.disabled = true;
  }

  function applySavedPattern() {
    const index = parseInt(elements.savedPatternsSelect.value);
    if (isNaN(index) || index < 0 || index >= state.savedPatterns.length) return;

    const p = state.savedPatterns[index];
    elements.patternInput.value = `/${p.pattern}/${p.flags}`;
    elements.testString.value = p.testString || '';
    elements.replacement.value = p.replacement || '';
    updateFlagsFromString(p.flags);
    validatePattern();
    testRegex();
    applyReplacement();
    showToast(`Loaded: ${p.name}`);
  }

  function updateFlagsFromString(flags) {
    Object.keys(elements.flags).forEach(flag => {
      elements.flags[flag].checked = flags.includes(flag);
    });
    updateFlags();
  }

  function deleteSavedPattern() {
    const index = parseInt(elements.savedPatternsSelect.value);
    if (isNaN(index) || index < 0 || index >= state.savedPatterns.length) return;

    const name = state.savedPatterns[index].name;
    state.savedPatterns.splice(index, 1);
    localStorage.setItem('regex-tester-patterns', JSON.stringify(state.savedPatterns));
    renderSavedPatterns();
    showToast(`Deleted: ${name}`);
  }

  function renderPresets() {
    elements.presetButtons.innerHTML = PRESETS.map(p =>
      `<button class="preset-btn" data-pattern="${escapeHtml(p.pattern)}">${escapeHtml(p.label)}</button>`
    ).join('');
    elements.presetButtons.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.patternInput.value = btn.dataset.pattern;
        validatePattern();
        testRegex();
      });
    });
  }

  function switchHelpTab(syntax) {
    document.querySelectorAll('.syntax-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.syntax === syntax);
    });
    elements.regexHelpContent.innerHTML = getHelpContent(syntax);
  }

  function getHelpContent(syntax) {
    const content = {
      anchors: `
        <div class="syntax-section"><h4>Anchors</h4>
          <div class="syntax-row"><span class="syntax-field">^</span><span class="syntax-desc">Start of string (or line with m flag)</span></div>
          <div class="syntax-row"><span class="syntax-field">$</span><span class="syntax-desc">End of string (or line with m flag)</span></div>
          <div class="syntax-row"><span class="syntax-field">\\b</span><span class="syntax-desc">Word boundary</span></div>
          <div class="syntax-row"><span class="syntax-field">\\B</span><span class="syntax-desc">Non-word boundary</span></div>
          <div class="syntax-row"><span class="syntax-field">(?=...)</span><span class="syntax-desc">Positive lookahead</span></div>
          <div class="syntax-row"><span class="syntax-field">(?!...)</span><span class="syntax-desc">Negative lookahead</span></div>
          <div class="syntax-row"><span class="syntax-field">(?<=...)</span><span class="syntax-desc">Positive lookbehind</span></div>
          <div class="syntax-row"><span class="syntax-field">(?<!...)</span><span class="syntax-desc">Negative lookbehind</span></div>
        </div>
        <div class="syntax-example">^\\d+$        # String is only digits\n\\bcat\\b     # Word "cat" as whole word\n(?=\\d)      # Followed by digit</div>
      `,
      quantifiers: `
        <div class="syntax-section"><h4>Quantifiers</h4>
          <div class="syntax-row"><span class="syntax-field">*</span><span class="syntax-desc">0 or more (greedy)</span></div>
          <div class="syntax-row"><span class="syntax-field">+</span><span class="syntax-desc">1 or more (greedy)</span></div>
          <div class="syntax-row"><span class="syntax-field">?</span><span class="syntax-desc">0 or 1 (greedy)</span></div>
          <div class="syntax-row"><span class="syntax-field">{n}</span><span class="syntax-desc">Exactly n times</span></div>
          <div class="syntax-row"><span class="syntax-field">{n,}</span><span class="syntax-desc">n or more times</span></div>
          <div class="syntax-row"><span class="syntax-field">{n,m}</span><span class="syntax-desc">Between n and m times</span></div>
          <div class="syntax-row"><span class="syntax-field">*?</span><span class="syntax-desc">0 or more (lazy)</span></div>
          <div class="syntax-row"><span class="syntax-field">+?</span><span class="syntax-desc">1 or more (lazy)</span></div>
          <div class="syntax-row"><span class="syntax-field">??</span><span class="syntax-desc">0 or 1 (lazy)</span></div>
          <div class="syntax-row"><span class="syntax-field">{n,m}?</span><span class="syntax-desc">Between n and m (lazy)</span></div>
        </div>
        <div class="syntax-example">\\d*          # Zero or more digits\n\\d+          # One or more digits\n\\d{2,4}      # 2 to 4 digits\n.*?           # Lazy match any chars</div>
      `,
      classes: `
        <div class="syntax-section"><h4>Character Classes</h4>
          <div class="syntax-row"><span class="syntax-field">.</span><span class="syntax-desc">Any character except newline</span></div>
          <div class="syntax-row"><span class="syntax-field">\\d</span><span class="syntax-desc">Digit [0-9]</span></div>
          <div class="syntax-row"><span class="syntax-field">\\D</span><span class="syntax-desc">Non-digit [^0-9]</span></div>
          <div class="syntax-row"><span class="syntax-field">\\w</span><span class="syntax-desc">Word char [A-Za-z0-9_]</span></div>
          <div class="syntax-row"><span class="syntax-field">\\W</span><span class="syntax-desc">Non-word [^A-Za-z0-9_]</span></div>
          <div class="syntax-row"><span class="syntax-field">\\s</span><span class="syntax-desc">Whitespace [ \\t\\r\\n\\f\\v]</span></div>
          <div class="syntax-row"><span class="syntax-field">\\S</span><span class="syntax-desc">Non-whitespace</span></div>
          <div class="syntax-row"><span class="syntax-field">[abc]</span><span class="syntax-desc">a, b, or c</span></div>
          <div class="syntax-row"><span class="syntax-field">[^abc]</span><span class="syntax-desc">Not a, b, or c</span></div>
          <div class="syntax-row"><span class="syntax-field">[a-z]</span><span class="syntax-desc">Range a through z</span></div>
        </div>
        <div class="syntax-example">[aeiou]       # Vowels\n[0-9a-fA-F]   # Hex digit\n[^\\s]         # Non-whitespace\n.              # Any char (with s flag: newline too)</div>
      `,
      groups: `
        <div class="syntax-section"><h4>Groups & References</h4>
          <div class="syntax-row"><span class="syntax-field">(...)</span><span class="syntax-desc">Capturing group</span></div>
          <div class="syntax-row"><span class="syntax-field">(?:...)</span><span class="syntax-desc">Non-capturing group</span></div>
          <div class="syntax-row"><span class="syntax-field">(?<name>...)</span><span class="syntax-desc">Named capture group</span></div>
          <div class="syntax-row"><span class="syntax-field">\\1, \\2...</span><span class="syntax-desc">Backreference to group</span></div>
          <div class="syntax-row"><span class="syntax-field">\\k<name></span><span class="syntax-desc">Named backreference</span></div>
          <div class="syntax-row"><span class="syntax-field">$1, $2...</span><span class="syntax-desc">Replacement: group ref</span></div>
          <div class="syntax-row"><span class="syntax-field">{{name}}</span><span class="syntax-desc">Replacement: named group</span></div>
          <div class="syntax-row"><span class="syntax-field">$&</span><span class="syntax-desc">Replacement: full match</span></div>
          <div class="syntax-row"><span class="syntax-field">$`</span><span class="syntax-desc">Replacement: before match</span></div>
          <div class="syntax-row"><span class="syntax-field">$'</span><span class="syntax-desc">Replacement: after match</span></div>
        </div>
        <div class="syntax-example">(\\w+)\\s+\\1    # Repeated word\n(?<year>\\d{4}) # Named group\n$1-$2           # Swap groups in replace\n{{year}}        # Named in replace</div>
      `,
      assertions: `
        <div class="syntax-section"><h4>Assertions (Zero-width)</h4>
          <div class="syntax-row"><span class="syntax-field">^</span><span class="syntax-desc">Start of string/line</span></div>
          <div class="syntax-row"><span class="syntax-field">$</span><span class="syntax-desc">End of string/line</span></div>
          <div class="syntax-row"><span class="syntax-field">\\b</span><span class="syntax-desc">Word boundary</span></div>
          <div class="syntax-row"><span class="syntax-field">\\B</span><span class="syntax-desc">Non-word boundary</span></div>
          <div class="syntax-row"><span class="syntax-field">(?=pattern)</span><span class="syntax-desc">Positive lookahead</span></div>
          <div class="syntax-row"><span class="syntax-field">(?!pattern)</span><span class="syntax-desc">Negative lookahead</span></div>
          <div class="syntax-row"><span class="syntax-field">(?<=pattern)</span><span class="syntax-desc">Positive lookbehind</span></div>
          <div class="syntax-row"><span class="syntax-field">(?<!pattern)</span><span class="syntax-desc">Negative lookbehind</span></div>
        </div>
        <div class="syntax-example">\\d+(?=px)      # Digits followed by "px"\n\\d+(?!px)      # Digits NOT followed by "px"\n(?<=\\$)\\d+    # Digits preceded by "$"\n(?<!\\d)\\d{3}(?!\\d) # 3 digits not part of longer number</div>
      `,
      flags: `
        <div class="syntax-section"><h4>Flags</h4>
          <div class="syntax-row"><span class="syntax-field">g</span><span class="syntax-desc">Global - find all matches</span></div>
          <div class="syntax-row"><span class="syntax-field">i</span><span class="syntax-desc">Ignore case</span></div>
          <div class="syntax-row"><span class="syntax-field">m</span><span class="syntax-desc">Multiline - ^$ match lines</span></div>
          <div class="syntax-row"><span class="syntax-field">s</span><span class="syntax-desc">DotAll - . matches newline</span></div>
          <div class="syntax-row"><span class="syntax-field">u</span><span class="syntax-desc">Unicode - full Unicode support</span></div>
          <div class="syntax-row"><span class="syntax-field">y</span><span class="syntax-desc">Sticky - match from lastIndex</span></div>
          <div class="syntax-row"><span class="syntax-field">d</span><span class="syntax-desc">Indices - match.indices array</span></div>
        </div>
        <div class="syntax-example">/pattern/gim    # Multiple flags\n/\\w+/g         # Global word match\n/^line$/m       # Per-line anchors\n/./s            # Dot matches newline\n/\\p{L}/u       # Unicode letter property</div>
      `,
      examples: `
        <div class="syntax-section"><h4>Common Patterns</h4>
          <div class="syntax-row"><span class="syntax-field">Email</span><span class="syntax-desc">^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$</span></div>
          <div class="syntax-row"><span class="syntax-field">URL</span><span class="syntax-desc">https?:\\/\\/[^\\s]+</span></div>
          <div class="syntax-row"><span class="syntax-field">IPv4</span><span class="syntax-desc">\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\b</span></div>
          <div class="syntax-row"><span class="syntax-field">Date ISO</span><span class="syntax-desc">^\\d{4}-\\d{2}-\\d{2}$</span></div>
          <div class="syntax-row"><span class="syntax-field">Hex Color</span><span class="syntax-desc">^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$</span></div>
          <div class="syntax-row"><span class="syntax-field">UUID v4</span><span class="syntax-desc">^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$</span></div>
          <div class="syntax-row"><span class="syntax-field">Credit Card</span><span class="syntax-desc">\\b\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b</span></div>
          <div class="syntax-row"><span class="syntax-field">HTML Tag</span><span class="syntax-desc"><([^>]+)>[^<]*</\\1></span></div>
        </div>
        <div class="syntax-example"># Validate email\n/^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$/.test('user@example.com')\n\n# Extract domain\n/^@(.+)$/.exec('user@example.com')[1]  // 'example.com'\n\n# Replace multiple spaces\n'hello   world'.replace(/\\s+/g, ' ')  // 'hello world'</div>
      `,
    };
    return content[syntax] || '';
  }

  function clearAll() {
    elements.patternInput.value = '';
    elements.testString.value = '';
    elements.replacement.value = '';
    elements.replaceAll.checked = false;
    elements.replacementResult.value = '';
    Object.keys(elements.flags).forEach(f => elements.flags[f].checked = f === 'g');
    updateFlags();
    hideValidation();
    elements.resultsContent.innerHTML = `
      <div class="empty-results">
        <div class="empty-icon">🔍</div>
        <p>Enter a pattern and test string, then click <strong>Test Regex</strong></p>
      </div>
    `;
    elements.matchStats.textContent = '';
    elements.explanationOutput.innerHTML = '<p style="color:var(--muted);text-align:center;padding:2rem">Enter a pattern to see explanation</p>';
    state.regex = null;
    state.matches = [];
    elements.patternInput.focus();
  }

  function checkUrlHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      const data = JSON.parse(atob(hash));
      if (data.pattern) {
        elements.patternInput.value = data.pattern;
        if (data.flags) updateFlagsFromString(data.flags);
        if (data.testString) elements.testString.value = data.testString;
        if (data.replacement) elements.replacement.value = data.replacement;
        validatePattern();
        testRegex();
        applyReplacement();
      }
    } catch (e) {
      console.warn('Invalid share link');
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
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": ''' })[c]);
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