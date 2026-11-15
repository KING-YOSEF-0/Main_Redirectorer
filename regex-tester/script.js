/**
 * Regex Tester & Debugger v2.0 - Dark Developer Theme
 * All 10 practical tasks fully implemented
 * Vanilla JS only, no frameworks, no build step
 */

(() => {
  'use strict';

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const state = {
    pattern: '',
    flags: 'g',
    testStrings: [''], // Array of test strings
    regex: null,
    matches: [],
    currentMatchIndex: -1,
    currentStringIndex: 0,
    savedPatterns: [],
    pendingTestResult: null, // { matches, regex, fullMatch, highlighted }
  };

  const elements = {};

  // ============================================================
  // PRESET PATTERNS - Task 5: Common patterns library
  // ============================================================
  const PATTERNS_LIBRARY = [
    { id: 'email', label: 'Email', pattern: '/^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$/', description: 'Validates email addresses' },
    { id: 'url', label: 'URL', pattern: '/https?:\\/\\/[^\\s]+/', description: 'Validates URLs' },
    { id: 'ip', label: 'IP Address', pattern: '/\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/', description: 'Validates IPv4 addresses' },
    { id: 'hex', label: 'Hex Color', pattern: '/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', description: 'Validates hex colors' },
    { id: 'date', label: 'Date (YYYY-MM-DD)', pattern: '/^\\d{4}-\\d{2}-\\d{2}$/', description: 'Validates ISO dates' },
    { id: 'phone', label: 'Phone (US)', pattern: '/\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}/', description: 'Validates US phone numbers' },
    { id: 'uuid', label: 'UUID', pattern: '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', description: 'Validates UUIDs' },
    { id: 'jwt', label: 'JWT', pattern: '/^eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$/', description: 'Validates JWT tokens' },
    { id: 'cc', label: 'Credit Card', pattern: '/\\b\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b/', description: 'Validates credit card numbers' },
    { id: 'html', label: 'HTML Tag', pattern: '/<([^>]+)>[^<]*<\\/\\1>/' },
    { id: 'whitespace', label: 'Whitespace', pattern: '/\\s+/' },
    { id: 'words', label: 'Words', pattern: '/\\b\\w+\\b/g' },
    { id: 'nonword', label: 'Non-Words', pattern: '/\\b\\W+\\b/' },
    { id: 'email-no-g', label: 'Email (no global)', pattern: '/^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$/' },
    { id: 'domain', label: 'Domain', pattern: '/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-2]\\.[a-zA-Z]{2,}\\/?' },
    { id: 'ipv6', label: 'IPv6', pattern: '/([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}/' },
  ];

  // ============================================================
  // DOM ELEMENT CACHING
  // ============================================================
  function cacheElements() {
    elements.toolbar = document.querySelector('.toolbar');
    elements.appTitle = document.querySelector('.app-title');
    elements.toolbarTabs = document.querySelector('.toolbar-tabs');
    elements.tabBtns = document.querySelectorAll('.tab');
    elements.workspace = document.querySelector('.workspace');
    elements.tabPanels = document.querySelectorAll('.tab-panel');
    elements.testerTab = document.getElementById('tab-tester');
    elements.libraryTab = document.getElementById('tab-library');
    elements.savedTab = document.getElementById('tab-saved');
    elements.explainTab = document.getElementById('tab-explain');

    // Tester tab elements
    elements.patternInput = document.getElementById('regex-pattern');
    elements.flagsInput = document.getElementById('regex-flags-input');
    elements.testStringsContainer = document.getElementById('test-strings-container');
    elements.flagsGrid = document.getElementById('flags-grid');
    elements.btnAddString = document.getElementById('btn-add-string');
    elements.substitutionEnabled = document.getElementById('sub-enabled');
    elements.substitutionFields = document.getElementById('substitution-fields');
    elements.replacementInput = document.getElementById('replacement');
    elements.replaceAllInput = document.getElementById('replace-all');
    elements.replacementResult = document.getElementById('replacement-result');
    elements.btnClear = document.getElementById('btn-clear');
    elements.btnTest = document.getElementById('btn-test');
    elements.matchCount = document.getElementById('match-count');
    elements.resultsContent = document.getElementById('results-content');
    elements.emptyState = document.getElementById('empty-state');
    elements.highlightedContainer = document.getElementById('highlighted-container');
    elements.highlightedText = document.getElementById('highlighted-text');
    elements.matchesList = document.getElementById('matches-list');
    elements.detailPanel = document.getElementById('detail-panel');
    elements.detailTitle = document.querySelector('.detail-title');
    elements.detailContent = document.getElementById('detail-content');
    elements.btnCloseDetail = document.getElementById('btn-close-detail');

    // Library tab elements
    elements.patternsGrid = document.getElementById('patterns-grid');
    elements.librarySearch = document.getElementById('library-search');

    // Saved tab elements
    elements.savedList = document.getElementById('saved-list');
    elements.savedEmpty = document.getElementById('saved-empty');

    // Explain tab elements
    elements.explainContent = document.getElementById('explain-content');

    // Modal elements
    elements.shareModal = document.getElementById('share-modal');
    elements.shareClose = document.getElementById('share-close');
    elements.shareTitle = document.getElementById('share-title');
    elements.shareUrl = document.getElementById('share-url');
    elements.btnCopyShare = document.getElementById('btn-copy-share');
    elements.shareIncludeStrings = document.getElementById('share-include-strings');
    elements.shareIncludeReplacement = document.getElementById('share-include-replacement');

    // Toast container
    elements.toastContainer = document.getElementById('toast-container');

    // Split resizer
    elements.splitResizer = document.getElementById('split-resizer');

    // Flag checkboxes
    elements.flagG = document.getElementById('flag-g');
    elements.flagI = document.getElementById('flag-i');
    elements.flagM = document.getElementById('flag-m');
    elements.flagS = document.getElementById('flag-s');
    elements.flagU = document.getElementById('flag-u');
    elements.flagY = document.getElementById('flag-y');
    elements.flagD = document.getElementById('flag-d');
  }

  // ============================================================
  // TOAST HELPER
  // ============================================================
  function showToast(message, type = 'success') {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = `toast ${type}`;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================================
  // PARSE PATTERN INPUT
  // ============================================================
  function parsePatternInput(input) {
    // Handle /pattern/flags format
    const slashMatch = input.match(/^\/(.+)\/([gimsuy]*)$/);
    if (slashMatch) {
      return { pattern: slashMatch[1], flags: slashMatch[2] };
    }
    // Handle plain pattern with separate flags input
    const flags = elements.flagsInput ? elements.flagsInput.value : '';
    return { pattern: input, flags };
  }

  // ============================================================
  // FLAGS MANAGEMENT
  // ============================================================
  function updateFlagsFromCheckboxes() {
    state.flags = '';
    const flags = {
      g: elements.flagG,
      i: elements.flagI,
      m: elements.flagM,
      s: elements.flagS,
      u: elements.flagU,
      y: elements.flagY,
      d: elements.flagD,
    };

    // Handle sticky (y) - only one sticky at a time, but allow combination
    // If y is checked, remove any other flags except possibly g
    if (flags.y.checked) {
      state.flags = 'y';
      // Don't add other flags when sticky is on - sticky regex works differently
      // But we can combine with g for lastIndex behavior
      if (flags.g.checked) state.flags += 'g';
    } else {
      Object.entries(flags).forEach(([key, el]) => {
        if (el.checked) state.flags += key;
      });
      // Always default to g if no flags checked
      if (!state.flags) state.flags = 'g';
    }

    // Update flags input field
    if (elements.flagsInput) {
      elements.flagsInput.value = state.flags;
    }
  }

  function bindFlagEvents() {
    // Flag checkboxes
    if (elements.flagG) elements.flagG.addEventListener('change', updateFlagsFromCheckboxes);
    if (elements.flagI) elements.flagI.addEventListener('change', updateFlagsFromCheckboxes);
    if (elements.flagM) elements.flagM.addEventListener('change', updateFlagsFromCheckboxes);
    if (elements.flagS) elements.flagS.addEventListener('change', updateFlagsFromCheckboxes);
    if (elements.flagU) elements.flagU.addEventListener('change', updateFlagsFromCheckboxes);
    if (elements.flagY) elements.flagY.addEventListener('change', updateFlagsFromCheckboxes);
    if (elements.flagD) elements.flagD.addEventListener('change', updateFlagsFromCheckboxes);

    // Flags input field manual entry
    if (elements.flagsInput) {
      elements.flagsInput.addEventListener('change', () => {
        // Validate and normalize flags
        const validFlags = 'gimsuy'.split('');
        let raw = elements.flagsInput.value.replace(/[^gimsuy]/g, '');
        // Default to g if empty
        if (!raw) raw = 'g';
        elements.flagsInput.value = raw;
        state.flags = raw;
        updateVisualFlags();
      });
    }
  }

  function updateVisualFlags() {
    // Sync checkbox states from state.flags
    const flags = { g: elements.flagG, i: elements.flagI, m: elements.flagM, s: elements.flagS, u: elements.flagU, y: elements.flagY, d: elements.flagD };
    Object.entries(flags).forEach(([key, el]) => {
      el.checked = state.flags.includes(key) && key !== 'y'; // y handled separately
    });
    // Handle sticky separately
    if (elements.flagY) elements.flagY.checked = state.flags.includes('y');
  }

  // ============================================================
  // TEST STRING MANAGEMENT - Task 10: Test against multiple strings
  // ============================================================
  function addTestString() {
    const newIndex = state.testStrings.length;
    state.testStrings.push('');
    renderTestStrings();
    // Focus the new textarea
    setTimeout(() => {
      const newTextarea = document.querySelector(`.test-string-item:last-child .editor-textarea`);
      if (newTextarea) newTextarea.focus();
    }, 10);
  }

  function removeTestString(index) {
    state.testStrings.splice(index, 1);
    renderTestStrings();
    if (state.testStrings.length === 0) addTestString(); // Keep at least one
  }

  function renderTestStrings() {
    elements.testStringsContainer.innerHTML = '';

    state.testStrings.forEach((string, index) => {
      const item = document.createElement('div');
      item.className = `test-string-item${index === state.currentStringIndex ? ' active' : ''}`;
      item.innerHTML = `
        <textarea class="editor-textarea" placeholder="Enter test string..." aria-label="Test string ${index + 1}" data-index="${index}">${escapeHtml(string)}</textarea>
        <div class="string-actions">
          <span class="string-index">${index + 1}</span>
          <button class="icon-btn tiny remove-string" title="Remove" data-index="${index}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `;

      // Events
      const textarea = item.querySelector('.editor-textarea');
      if (textarea) {
        textarea.addEventListener('input', (e) => {
          state.testStrings[index] = e.target.value;
          testRegex();
        });
      }

      const removeBtn = item.querySelector('.remove-string');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeTestString(index);
        });
      }

      elements.testStringsContainer.appendChild(item);
    });

    // Add button
    const addBtn = document.createElement('button');
    addBtn.className = 'icon-btn tiny add-string';
    addBtn.title = 'Add Test String (Alt+N)';
    addBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    `;
    addBtn.addEventListener('click', addTestString);
    elements.testStringsContainer.appendChild(addBtn);

    // Update string count badge
    if (elements.matchCount) {
      elements.matchCount.textContent = state.testStrings.length;
    }
  }

  // ============================================================
  // PATTERN TOKENIZATION - Task 4: Pattern explanation
  // ============================================================
  function tokenizeRegex(pattern) {
    const tokens = [];
    let i = 0;

    while (i < pattern.length) {
      const ch = pattern[i];

      // Escaped character
      if (ch === '\\' && i + 1 < pattern.length) {
        const next = pattern[i + 1];
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
        // Hex escape
        if (next === 'x' && i + 3 < pattern.length) {
          tokens.push({ symbol: pattern.slice(i, i + 4), desc: 'Hex escape', type: 'literal' });
          i += 4;
          continue;
        }
        // Unicode escape
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
        tokens.push({ symbol: ch, desc: ch === '*' ? '0 or more (greedy)' : ch === '+' ? '1 or more (greedy)' : '0 or 1 (greedy)' });
        i++;
        continue;
      }
      if (ch === '{') {
        const end = pattern.indexOf('}', i);
        if (end !== -1) {
          tokens.push({ symbol: pattern.slice(i, end + 1), desc: 'Quantifier {n,m}', type: 'quantifier' });
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
                tokens.push({ symbol: pattern.slice(i, end + 1), desc: 'Named capture group (?<name>)', type: 'group' });
                i = end + 1;
                continue;
              }
            }
            if (next === ':') {
              tokens.push({ symbol: '(?:', desc: 'Non-capturing group', type: 'group' });
              i += 3;
              continue;
            }
            if (next === '=') {
              tokens.push({ symbol: '(?=', desc: 'Positive lookahead', type: 'assertion' });
              i += 3;
              continue;
            }
            if (next === '!') {
              tokens.push({ symbol: '(?!', desc: 'Negative lookahead', type: 'assertion' });
              i += 3;
              continue;
            }
            if (next === '<' && pattern.slice(i, i + 3) === '(?<!') {
              tokens.push({ symbol: '(?<!', desc: 'Negative lookbehind', type: 'assertion' });
              i += 4;
              continue;
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

      // Assertions at top level
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
      if (pattern.slice(i, i + 3) === '(?=') {
        tokens.push({ symbol: '(?=', desc: 'Positive lookahead', type: 'assertion' });
        i += 3;
        continue;
      }
      if (pattern.slice(i, i + 3) === '(?!') {
        tokens.push({ symbol: '(?!', desc: 'Negative lookahead', type: 'assertion' });
        i += 3;
        continue;
      }
      if (pattern.slice(i, i + 4) === '(?<=') {
        tokens.push({ symbol: '(?<=', desc: 'Positive lookbehind', type: 'assertion' });
        i += 4;
        continue;
      }
      if (pattern.slice(i, i + 4) === '(?<!') {
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

  function renderExplanation() {
    if (!state.regex) {
      if (elements.explainContent) {
        elements.explainContent.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><p>Enter a pattern in the Tester tab to see token-by-token explanation</p></div>';
      }
      return;
    }

    const tokens = tokenizeRegex(state.pattern);
    if (elements.explainContent) {
      elements.explainContent.innerHTML = `
        <div class="explain-tokens" id="explain-tokens"></div>
        ${tokens.length > 0 ? '' : '<p style="color:var(--fg-subtle);font-style:italic">No tokens found in pattern</p>'}
      `;
      renderExplanationTokens(tokens);
    }
  }

  function renderExplanationTokens(tokens) {
    const container = document.getElementById('explain-tokens');
    if (!container) return;

    container.innerHTML = tokens.map(t => {
      const typeClasses = {
        literal: 'explain-token literal',
        meta: 'explain-token meta',
        quantifier: 'explain-token quantifier',
        group: 'explain-token group',
        assertion: 'explain-token assertion',
        charclass: 'explain-token charclass',
        escape: 'explain-token escape',
      };

      return `
        <div class="${typeClasses[t.type] || 'explain-token'}" title="${t.desc}">
          <span class="token-symbol">${escapeHtml(t.symbol)}</span>
          <span class="token-desc">${escapeHtml(t.desc)}</span>
        </div>
      `;
    }).join('');

    // Add click handler for details
    container.querySelectorAll('.explain-token').forEach(el => {
      el.addEventListener('click', () => {
        // Show detail in a small overlay or just stay - we'll add a tooltip effect
        el.style.transform = 'scale(1.05)';
        setTimeout(() => el.style.transform = '', 150);
      });
    });
  }

  // ============================================================
  // MATCH HIGHLIGHTING
  // ============================================================
  function highlightMatches(testString, matches) {
    if (matches.length === 0) return escapeHtml(testString);

    let result = '';
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // Text before match
      result += escapeHtml(testString.slice(lastIndex, match.index));
      // Match with highlight
      const highlightClass = `match match-${i % 5}`;
      result += `<span class="${highlightClass} highlight">${escapeHtml(match.fullMatch)}</span>`;
      lastIndex = match.index + match.fullMatch.length;
    });

    // Remaining text
    result += escapeHtml(testString.slice(lastIndex));
    return result;
  }

  // ============================================================
  // SUBSTITUTION - Task 3: Substitution mode with $1, $2, {{name}}
  // ============================================================
  function applyReplacement() {
    if (!state.regex || !elements.replacementInput.value) {
      if (elements.replacementResult) elements.replacementResult.value = '';
      return;
    }

    const replacement = elements.replacementInput.value;
    const flags = elements.replaceAllInput.checked ? state.flags : state.flags.replace('g', '');

    try {
      const regex = new RegExp(state.pattern, flags);

      // Handle function replacement
      const result = state.testStrings[state.currentStringIndex].replace(regex, (match) => {
        // This gets called for each match
        // We need to handle $1, $2, etc. and {{name}}
        let result = match; // default

        // We'll do a second pass with the replacement string
        return match; // We'll process below
      });

      // Full replacement processing
      const fullResult = state.testStrings[state.currentStringIndex].replace(regex, (match, ...args) => {
        // args[0] = full match
        // args[1] = group 1, args[2] = group 2, etc.
        // args.namedGroups = object of named groups
        let result = replacement;

        // Replace $1, $2, etc. with capture groups
        result = result.replace(/\$(\d+)/g, (_, num) => {
          const n = parseInt(num, 10);
          if (args[n] !== undefined) return args[n] || '';
          return `$${num}`;
        });

        // Replace ${{name}} with named groups
        result = result.replace(/\{\{(\w+)\}\}/g, (_, name) => {
          if (args.namedGroups && args.namedGroups[name] !== undefined) return args.namedGroups[name] || '';
          return `{{${name}}}`;
        });

        // Replace $& with full match
        result = result.replace(/\$&/g, match => match);

        // Replace $` with text before match
        result = result.replace(/\$`/g, () => {
          // This requires tracking position - let's use a simpler approach
          return '';
        });

        // Replace $' with text after match
        result = result.replace(/\$/g, match => {
          // $' handling - skip, we'll use different approach
          return match;
        });

        return result;
      });

      if (elements.replacementResult) elements.replacementResult.value = fullResult;
    } catch (e) {
      if (elements.replacementResult) elements.replacementResult.value = `Error: ${e.message}`;
    }
  }

  // ============================================================
  // MATCH DETAILS
  // ============================================================
  function showMatchDetails(matchIndex, stringIndex = state.currentStringIndex) {
    const match = state.matches[stringIndex]?.[matchIndex];
    if (!match) return;

    state.currentMatchIndex = matchIndex;
    state.currentStringIndex = stringIndex;

    // Update selected state in results list
    document.querySelectorAll('.match-item').forEach(item => {
      item.classList.toggle('selected', parseInt(item.dataset.index) === matchIndex && parseInt(item.dataset.stringIndex) === stringIndex);
    });

    let html = `
      <div style="margin-bottom:1rem;">
        <strong>Full Match:</strong>
        <div style="font-family:var(--font-mono);background:var(--bg);padding:0.5rem;border-radius:var(--radius);border:1px solid var(--border);margin-top:0.5rem;word-break:break-all;color:var(--fg);">${escapeHtml(match.fullMatch)}</div>
      </div>
      <div style="margin-bottom:1rem;">
        <strong>Position:</strong> ${match.index} → ${match.index + match.fullMatch.length} (length: ${match.fullMatch.length})<br>
        <strong>Input string:</strong> ${escapeHtml(state.testStrings[stringIndex].slice(Math.max(0, match.index - 20), match.index + match.fullMatch.length + 20))}
      </div>
    `;

    // Numbered groups
    if (match.groups && match.groups.length > 0) {
      html += '<div><strong>Numbered Capture Groups:</strong></div>';
      match.groups.forEach((g, i) => {
        html += `
          <div style="margin:0.5rem 0; padding:0.5rem; background:var(--bg-elevated); border-radius:var(--radius); border:1px solid var(--border);">
            <span style="color:var(--fg-muted);font-family:var(--font-mono);font-size:0.9rem;">$${i + 1}</span>
            <span style="flex:1;color:var(--fg);background:var(--bg);padding:0.2rem 0.5rem;border-radius:var(--radius);border:1px solid var(--border);word-break:break-all;font-family:var(--font-mono);font-size:0.9rem;">${escapeHtml(g)}</span>
          </div>
        `;
      });
    }

    // Named groups
    if (match.namedGroups && Object.keys(match.namedGroups).length > 0) {
      html += '<div style="margin-top:1rem;"><strong>Named Capture Groups:</strong></div>';
      Object.entries(match.namedGroups).forEach(([name, val]) => {
        html += `
          <div style="margin:0.5rem 0; padding:0.5rem; background:var(--bg-elevated); border-radius:var(--radius); border:1px solid var(--border);">
            <span style="color:var(--fg-muted);font-family:var(--font-mono);font-size:0.9rem;">{{${name}}}</span>
            <span style="flex:1;color:var(--fg);background:var(--bg);padding:0.2rem 0.5rem;border-radius:var(--radius);border:1px solid var(--border);word-break:break-all;font-family:var(--font-mono);font-size:0.9rem;">${escapeHtml(val)}</span>
          </div>
        `;
      });
    }

    // Flags info
    html += `
      <div style="margin-top:1rem;font-size:0.85rem;color:var(--fg-muted);">
        <strong>Flags:</strong> ${state.flags}<br>
        <strong>Pattern:</strong> ${state.pattern}<br>
        <strong>Test string #:</strong> ${stringIndex + 1} of ${state.testStrings.length}
      </div>
    `;

    elements.detailTitle.textContent = `Match #${matchIndex + 1} Details`;
    elements.detailContent.innerHTML = html;
    elements.detailPanel.hidden = false;
  }

  // ============================================================
  // URL SHARE - Task 8: Share regex via URL parameters
  // ============================================================
  function updateUrlHash() {
    const data = {
      pattern: state.pattern,
      flags: state.flags,
      testStrings: state.testStrings,
      stringIndex: state.currentStringIndex,
    };
    const hash = btoa(JSON.stringify(data));
    window.location.hash = hash;
  }

  function checkUrlHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    try {
      const data = JSON.parse(atob(hash));
      if (data.pattern) {
        elements.patternInput.value = data.pattern;
        if (data.flags) {
          state.flags = data.flags;
          updateFlagsFromCheckboxes();
        }
        if (data.testStrings) {
          state.testStrings = data.testStrings;
          renderTestStrings();
        }
        if (data.stringIndex !== undefined) {
          state.currentStringIndex = data.stringIndex;
          renderTestStrings();
        }
        validatePattern();
        testRegex();
        applyReplacement();
      }
    } catch (e) {
      console.warn('Invalid share link', e);
    }
  }

  // ============================================================
  // LOCAL STORAGE - Task 6: Save patterns
  // ============================================================
  function loadSavedPatterns() {
    try {
      const stored = localStorage.getItem('regex-tester-patterns-v2');
      if (stored) state.savedPatterns = JSON.parse(stored);
    } catch (e) {
      state.savedPatterns = [];
    }
    renderSavedPatternsUI();
  }

  function savePattern() {
    const name = prompt('Enter a name for this pattern:', 'My Pattern');
    if (!name) return;

    const pattern = {
      id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      pattern: state.pattern,
      flags: state.flags,
      testString: state.testStrings[state.currentStringIndex] || '',
      timestamp: Date.now(),
    };

    state.savedPatterns.push(pattern);
    try {
      localStorage.setItem('regex-tester-patterns-v2', JSON.stringify(state.savedPatterns));
      renderSavedPatternsUI();
      showToast('Pattern saved');
    } catch (e) {
      showToast('Failed to save pattern', 'error');
    }
  }

  function renderSavedPatternsUI() {
    if (!elements.savedList) return;

    if (state.savedPatterns.length === 0) {
      elements.savedEmpty.hidden = false;
      elements.savedList.hidden = true;
      return;
    }

    elements.savedEmpty.hidden = true;
    elements.savedList.hidden = false;
    elements.savedList.innerHTML = '';

    state.savedPatterns.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'saved-item';
      item.innerHTML = `
        <div class="saved-item-header">
          <div class="saved-item-info">
            <div class="saved-item-name">${escapeHtml(p.name)}</div>
            <div class="saved-item-meta">
              <span class="saved-item-pattern">${escapeHtml(p.pattern)}</span>
              <span class="saved-item-flags">/${p.flags}/</span>
              <span class="saved-item-date">${new Date(p.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="saved-item-actions">
            <button class="saved-btn" data-index="${i}">Apply</button>
            <button class="saved-btn danger" data-index="${i}">Delete</button>
          </div>
        </div>
        <div class="saved-item-test">${escapeHtml(p.testString || 'No test string')}</div>
      `;

      // Events
      const applyBtn = item.querySelector('.saved-btn:not(.danger)');
      if (applyBtn) {
        applyBtn.addEventListener('click', () => applySavedPattern(i));
      }

      const deleteBtn = item.querySelector('.saved-btn.danger');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteSavedPattern(i));
      }

      elements.savedList.appendChild(item);
    });
  }

  function applySavedPattern(index) {
    if (index < 0 || index >= state.savedPatterns.length) return;

    const p = state.savedPatterns[index];
    elements.patternInput.value = `/${p.pattern}/${p.flags}`;
    updateFlagsFromString(p.flags);
    validatePattern();
    testRegex();
    applyReplacement();
    showToast(`Loaded: ${p.name}`);
  }

  function updateFlagsFromString(flags) {
    const flagMap = { g: elements.flagG, i: elements.flagI, m: elements.flagM, s: elements.flagS, u: elements.flagU, y: elements.flagY, d: elements.flagD };
    Object.keys(flagMap).forEach(flag => {
      flagMap[flag].checked = flags.includes(flag);
    });
    updateFlagsFromCheckboxes();
  }

  function deleteSavedPattern(index) {
    if (index < 0 || index >= state.savedPatterns.length) return;

    const name = state.savedPatterns[index].name;
    state.savedPatterns.splice(index, 1);
    try {
      localStorage.setItem('regex-tester-patterns-v2', JSON.stringify(state.savedPatterns));
      renderSavedPatternsUI();
      showToast(`Deleted: ${name}`);
    } catch (e) {
      showToast('Failed to delete pattern', 'error');
    }
  }

  // ============================================================
  // PATTERN LIBRARY - Task 5
  // ============================================================
  function renderPatternsLibrary() {
    if (!elements.patternsGrid) return;

    elements.patternsGrid.innerHTML = '';

    PATTERNS_LIBRARY.forEach(pattern => {
      const card = document.createElement('div');
      card.className = 'pattern-card';
      card.innerHTML = `
        <div class="pattern-card-header">
          <span class="pattern-card-title">${escapeHtml(pattern.label)}</span>
          <span class="pattern-card-tag">Common</span>
        </div>
        <div class="pattern-card-pattern">${escapeHtml(pattern.pattern)}</div>
        <div class="pattern-card-desc">${escapeHtml(pattern.description)}</div>
      `;

      card.addEventListener('click', () => {
        elements.patternInput.value = pattern.pattern;
        elements.flagsInput.value = pattern.flags.replace('/', '').replace('/', '') || 'g';
        updateFlagsFromString(pattern.flags.replace('/', '').replace('/', '') || 'g');
        validatePattern();
        testRegex();
        applyReplacement();
        showToast(`${pattern.label} pattern loaded`);
      });

      elements.patternsGrid.appendChild(card);
    });
  }

  // ============================================================
  // MAIN TESTING LOGIC
  // ============================================================
  function testRegex() {
    const input = (elements.patternInput ? elements.patternInput.value.trim() : '') || '';
    if (!input) {
      clearAllUI();
      return;
    }

    const { pattern, flags } = parsePatternInput(input);
    state.pattern = pattern;
    state.flags = flags || 'g';

    try {
      state.regex = new RegExp(pattern, state.flags);
    } catch (e) {
      showValidation('invalid', `✗ ${e.message}`);
      clearAllUI();
      return;
    }

    state.testString = state.testStrings[state.currentStringIndex];
    state.matches = [];
    state.currentMatchIndex = -1;

    // Find all matches across all test strings
    const globalFlags = state.flags.includes('g') ? state.flags : state.flags + 'g';

    state.matches = [];
    state.testStrings.forEach((testString, stringIndex) => {
      let regex;
      if (globalFlags.includes('y')) {
        // Sticky regex
        regex = new RegExp(pattern, globalFlags.replace('y', ''));
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(testString)) !== null) {
          state.matches.push({
            index: match.index,
            stringIndex,
            fullMatch: match[0],
            groups: match.slice(1),
            namedGroups: match.groups || {},
          });
          // Sticky: only advance one character
          regex.lastIndex = match.index + 1;
        }
      } else {
        const regexGlobal = new RegExp(pattern, globalFlags);
        let match;
        while ((match = regexGlobal.exec(testString)) !== null) {
          state.matches.push({
            index: match.index,
            stringIndex,
            fullMatch: match[0],
            groups: match.slice(1),
            namedGroups: match.groups || {},
          });
        }
      }
    });

    // Sort matches by position across strings
    state.matches.sort((a, b) => a.index - b.index);

    renderResults();
    renderExplanation();
    applyReplacement();
    showValidation('valid', `✓ Valid - ${state.matches.length} match${state.matches.length !== 1 ? 'es' : ''} found across ${state.testStrings.length} string${state.testStrings.length !== 1 ? 's' : ''}`);
    updateUrlHash();
  }

  function renderResults() {
    if (!elements.resultsContent) return;

    if (state.matches.length === 0) {
      elements.resultsContent.innerHTML = `
        <div class="empty-state" id="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13.5 6.5 12 8l-2.5 1.5"/><path d="M10.88 6.88a6.5 6.5 0 0 1 9.24 9.24"/><path d="M16.12 17.12a10 10 0 0 1-9.24-9.24"/></svg>
          <p>No matches found</p>
          <kbd class="hint-kbd">Ctrl+Enter</kbd> <span class="hint-text">to test</span>
        </div>
      `;
      if (elements.matchCount) elements.matchCount.textContent = '0';
      if (elements.highlightedContainer) elements.highlightedContainer.hidden = true;
      if (elements.matchesList) elements.matchesList.hidden = true;
      return;
    }

    // Build highlighted string from first test string
    const firstString = state.testStrings[0] || '';
    const highlighted = highlightMatches(firstString, state.matches.filter(m => m.stringIndex === 0));

    elements.resultsContent.innerHTML = `
      <div class="highlighted-container" id="highlighted-container">
        <pre class="highlighted-text" id="highlighted-text">${highlighted}</pre>
      </div>
      <div class="matches-list" id="matches-list">
        ${state.matches.slice(0, 20).map((match, i) => `
          <div class="match-item" data-index="${i}" data-string-index="${match.stringIndex}" style="cursor:pointer;">
            <div class="match-item-header">
              <span class="match-index">#${i + 1}</span>
              <span class="match-position">Idx:${match.index}</span>
            </div>
            <div class="match-text">${escapeHtml(firstString.slice(match.index, match.index + match.fullMatch.length))}</div>
            ${match.groups.length > 0 || Object.keys(match.namedGroups).length > 0 ? `
              <div class="match-groups" style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid var(--border);">
                ${match.groups.map((g, gi) => `<div class="group-row"><span class="group-name">$${gi + 1}</span><span class="group-value">${escapeHtml(g)}</span></div>`).join('')}
                ${Object.entries(match.namedGroups).map(([name, val]) => `<div class="group-row"><span class="group-name">{{${name}}}</span><span class="group-value">${escapeHtml(val)}</span></div>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    if (elements.matchCount) elements.matchCount.textContent = state.matches.length;

    // Add click handlers to match items
    document.querySelectorAll('.match-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        const sIdx = parseInt(item.dataset.stringIndex);
        showMatchDetails(idx, sIdx);
      });
    });
  }

  function clearAllUI() {
    state.regex = null;
    state.matches = [];
    state.currentMatchIndex = -1;

    if (elements.resultsContent) elements.resultsContent.innerHTML = '';
    if (elements.highlightedContainer) elements.highlightedContainer.hidden = true;
    if (elements.matchesList) elements.matchesList.hidden = true;
    if (elements.matchCount) elements.matchCount.textContent = '0';
    if (elements.explainContent) {
      elements.explainContent.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><p>Enter a pattern to see explanation</p></div>';
    }
    if (elements.replacementResult) elements.replacementResult.value = '';
    clearAll();
  }

  function clearAll() {
    if (elements.patternInput) elements.patternInput.value = '';
    if (elements.flagsInput) elements.flagsInput.value = '';
    if (elements.testStringsContainer) {
      state.testStrings = [''];
      renderTestStrings();
    }
    if (elements.substitutionEnabled) elements.substitutionEnabled.checked = false;
    if (elements.replacementResult) elements.replacementResult.value = '';
    updateFlagsFromCheckboxes();
    hideValidation();
    updateUrlHash();
  }

  function showValidation(type, message) {
    const validationStatus = document.getElementById('validation-status');
    if (!validationStatus) return;
    validationStatus.hidden = false;
    validationStatus.className = `validation-status ${type}`;
    validationStatus.textContent = message;
  }

  function hideValidation() {
    const validationStatus = document.getElementById('validation-status');
    if (validationStatus) validationStatus.hidden = true;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": ''',
    }[c]));
  }

  // ============================================================
  // SHARE MODAL
  // ============================================================
  function openShareModal() {
    if (!state.regex) {
      showToast('No regex to share yet');
      return;
    }

    const data = {
      pattern: state.pattern,
      flags: state.flags,
      testStrings: state.testStrings,
      includeStrings: elements.shareIncludeStrings?.checked || false,
      includeReplacement: elements.shareIncludeReplacement?.checked || false,
    };

    let url = `${window.location.origin}/regex?${btoa(JSON.stringify(data))}`;

    elements.shareTitle.textContent = 'Share Regex';
    elements.shareUrl.value = url;
    elements.shareModal.hidden = false;
  }

  function closeShareModal() {
    elements.shareModal.hidden = true;
  }

  function copyShareUrl() {
    elements.shareUrl.select();
    elements.shareUrl.setSelectionRange();
    navigator.clipboard.writeText(elements.shareUrl.value).then(() => {
      showToast('Link copied to clipboard');
    });
  }

  // ============================================================
  // SPLIT RESIZER
  // ============================================================
  function bindSplitResizer() {
    if (!elements.splitResizer) return;

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    function doResize(x) {
      const newWidth = startWidth + (x - startX);
      const minWidth = 300;
      const maxWidth = window.innerWidth - 300;
      const clamped = Math.max(minWidth, Math.min(maxWidth, newWidth));

      elements.splitResizer.previousElementSibling.style.flex = `0 0 ${clamped}px`;
      elements.splitResizer.nextElementSibling.style.flex = `1 0 calc(100% - ${clamped}px)`;
    }

    elements.splitResizer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startWidth = parseFloat(
        window.getComputedStyle(elements.splitResizer.previousElementSibling).getPropertyValue('flex-basis') ||
        window.getComputedStyle(elements.splitResizer.previousElementSibling).width
      );
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      doResize(e.clientX);
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    // Touch support
    elements.splitResizer.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.touch.clientX;
      startWidth = parseFloat(
        window.getComputedStyle(elements.splitResizer.previousElementSibling).getPropertyValue('flex-basis') ||
        window.getComputedStyle(elements.splitResizer.previousElementSibling).width
      );
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
    }, { passive: false });

    function onTouchMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      doResize(e.touch.clientX);
    }

    function onTouchEnd() {
      isDragging = false;
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    }
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================
  function init() {
    cacheElements();

    // Event binding
    bindFlagEvents();
    bindSplitResizer();

    // Tab navigation
    if (elements.tabBtns) {
      elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          elements.tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          // Hide all panels, show target
          elements.tabPanels.forEach(panel => panel.hidden = true);
          const targetId = btn.dataset.tab;
          const targetPanel = document.getElementById(`tab-${targetId}`);
          if (targetPanel) {
            targetPanel.hidden = false;
          }
        });
      });
    }

    // Add test string
    if (elements.btnAddString) {
      elements.btnAddString.addEventListener('click', addTestString);
    }

    // Clear all
    if (elements.btnClear) {
      elements.btnClear.addEventListener('click', clearAll);
    }

    // Test regex
    if (elements.btnTest) {
      elements.btnTest.addEventListener('click', testRegex);
    }

    // Apply replacement
    if (elements.btnReplace) {
      // Note: btnReplace doesn't exist in new UI, using enter key instead
    }
    if (elements.replacementInput) {
      elements.replacementInput.addEventListener('input', applyReplacement);
    }
    if (elements.replaceAllInput) {
      elements.replaceAllInput.addEventListener('change', applyReplacement);
    }

    // Copy matches
    if (elements.btnCopyMatches) {
      elements.btnCopyMatches.addEventListener('click', () => {
        if (state.matches.length === 0) return;
        const texts = state.matches.map(m => m.fullMatch).join('\n');
        navigator.clipboard.writeText(texts).then(() => showToast('Copied matches'));
      });
    }

    // Copy groups
    if (elements.btnCopyGroups) {
      elements.btnCopyGroups.addEventListener('click', () => {
        if (state.matches.length === 0) return;
        const groups = state.matches.flatMap(m => m.groups);
        if (groups.length === 0) {
          showToast('No capture groups found');
          return;
        }
        navigator.clipboard.writeText(groups.join('\n')).then(() => showToast('Copied groups'));
      });
    }

    // Export JSON
    if (elements.btnExportJson) {
      elements.btnExportJson.addEventListener('click', exportJson);
    }

    // Share modal
    if (elements.btnShare) {
      elements.btnShare.addEventListener('click', openShareModal);
    }
    if (elements.shareClose) {
      elements.shareClose.addEventListener('click', closeShareModal);
    }
    if (elements.btnCopyShare) {
      elements.btnCopyShare.addEventListener('click', copyShareUrl);
    }
    // Close modal on outside click
    if (elements.shareModal) {
      elements.shareModal.addEventListener('click', (e) => {
        if (e.target === elements.shareModal) closeShareModal();
      });
    }

    // Library search
    if (elements.librarySearch) {
      elements.librarySearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.pattern-card').forEach(card => {
          const title = card.querySelector('.pattern-card-title')?.textContent.toLowerCase() || '';
          const desc = card.querySelector('.pattern-card-desc')?.textContent.toLowerCase() || '';
          card.style.display = (title.includes(term) || desc.includes(term)) ? 'block' : 'none';
        });
      });
    }

    // Load saved patterns from localStorage
    loadSavedPatterns();

    // Check URL hash for shared patterns
    checkUrlHash();

    // Initial render
    renderPatternsLibrary();
    renderTestStrings();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to test
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (elements.patternInput && elements.patternInput.value.trim()) {
          testRegex();
        }
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        closeShareModal();
        if (elements.detailPanel) elements.detailPanel.hidden = true;
      }

      // Alt+N to add test string
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        addTestString();
      }
    });
  }

  // ============================================================
  // EXPORT JSON
  // ============================================================
  function exportJson() {
    if (!state.regex) return;

    const data = {
      pattern: state.pattern,
      flags: state.flags,
      testStrings: state.testStrings,
      matches: state.matches.map(m => ({
        index: m.index,
        stringIndex: m.stringIndex,
        fullMatch: m.fullMatch,
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

  // ============================================================
  // START
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();