const JSONFormatter = (() => {
  let originalJson = '';
  let parsedJson = null;
  let currentFormat = 'formatted';

  const elements = {};

  const SAMPLE_JSON = {
    "store": {
      "book": [
        { "category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95 },
        { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99 },
        { "category": "fiction", "author": "Herman Melville", "title": "Moby Dick", "isbn": "0-553-21311-3", "price": 8.99 },
        { "category": "fiction", "author": "J. R. R. Tolkien", "title": "The Lord of the Rings", "isbn": "0-395-19395-8", "price": 22.99 }
      ],
      "bicycle": { "color": "red", "price": 19.95 }
    },
    "expensive": 10
  };

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    loadSample();
  }

  function cacheElements() {
    elements.jsonInput = document.getElementById('json-input');
    elements.jsonFile = document.getElementById('json-file');
    elements.jsonOutput = document.getElementById('json-output');
    elements.jsonCode = document.getElementById('json-code');
    elements.validationOutput = document.getElementById('validation-output');
    elements.indentSize = document.getElementById('indent-size');
    elements.jsonpathQuery = document.getElementById('jsonpath-query');
    elements.btnFormat = document.getElementById('btn-format');
    elements.btnMinify = document.getElementById('btn-minify');
    elements.btnValidate = document.getElementById('btn-validate');
    elements.btnLoadFile = document.getElementById('btn-load-file');
    elements.btnLoadSample = document.getElementById('btn-load-sample');
    elements.btnClear = document.getElementById('btn-clear');
    elements.btnJsonpath = document.getElementById('btn-jsonpath');
    elements.btnCopyOutput = document.getElementById('btn-copy-output');
    elements.btnDownloadOutput = document.getElementById('btn-download-output');
    elements.btnDiff = document.getElementById('btn-diff');
    elements.outputFormatRadios = document.querySelectorAll('input[name="output-format"]');
  }

  function bindEvents() {
    elements.btnFormat.addEventListener('click', () => processJson('formatted'));
    elements.btnMinify.addEventListener('click', () => processJson('minified'));
    elements.btnValidate.addEventListener('click', () => processJson('validate'));
    elements.btnLoadFile.addEventListener('click', () => elements.jsonFile.click());
    elements.jsonFile.addEventListener('change', loadFile);
    elements.btnLoadSample.addEventListener('click', loadSample);
    elements.btnClear.addEventListener('click', clearAll);
    elements.btnJsonpath.addEventListener('click', runJsonPath);
    elements.btnCopyOutput.addEventListener('click', copyOutput);
    elements.btnDownloadOutput.addEventListener('click', downloadOutput);
    elements.btnDiff.addEventListener('click', showDiff);

    elements.outputFormatRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        currentFormat = radio.value;
        if (parsedJson !== null) {
          renderOutput();
        }
      });
    });

    elements.jsonInput.addEventListener('input', debounce(() => {
      validateOnly();
    }, 500));

    elements.jsonpathQuery.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') runJsonPath();
    });
  }

  function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
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

  function loadFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      elements.jsonInput.value = evt.target.result;
      validateOnly();
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function loadSample() {
    elements.jsonInput.value = JSON.stringify(SAMPLE_JSON, null, 2);
    validateOnly();
    showToast('Sample JSON loaded');
  }

  function clearAll() {
    elements.jsonInput.value = '';
    elements.jsonCode.textContent = '';
    elements.validationOutput.textContent = '';
    parsedJson = null;
    originalJson = '';
    showToast('Cleared');
  }

  function processJson(mode) {
    const input = elements.jsonInput.value.trim();
    if (!input) {
      showToast('Please enter JSON first');
      return;
    }

    originalJson = input;

    try {
      parsedJson = JSON.parse(input);
      elements.jsonInput.style.borderColor = 'var(--accent-3)';
      setTimeout(() => elements.jsonInput.style.borderColor = '', 1000);
    } catch (e) {
      elements.jsonInput.style.borderColor = 'var(--accent)';
      showValidationError(e);
      showToast('Invalid JSON: ' + e.message);
      return;
    }

    if (mode === 'validate') {
      showValidationSuccess();
      showToast('Valid JSON!');
      return;
    }

    currentFormat = mode;
    document.querySelector(`input[name="output-format"][value="${mode}"]`).checked = true;
    renderOutput();
    showValidationSuccess();
    showToast(mode === 'formatted' ? 'Formatted!' : 'Minified!');
  }

  function validateOnly() {
    const input = elements.jsonInput.value.trim();
    if (!input) {
      elements.validationOutput.textContent = 'No input';
      return;
    }

    try {
      parsedJson = JSON.parse(input);
      originalJson = input;
      showValidationSuccess();
    } catch (e) {
      showValidationError(e);
    }
  }

  function showValidationSuccess() {
    const stats = getJsonStats(parsedJson);
    elements.validationOutput.innerHTML = `
<span class="validation-success">✓ Valid JSON</span>
<span class="validation-info">${stats}</span>
    `.trim();
  }

  function showValidationError(e) {
    const lines = originalJson.split('\n');
    const lineNum = e.message.match(/position (\d+)/i);
    let context = '';
    if (lineNum) {
      const pos = parseInt(lineNum[1]);
      let charCount = 0;
      let foundLine = 0;
      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1;
        if (charCount >= pos) {
          foundLine = i + 1;
          break;
        }
      }
      context = `\nError near line ${foundLine}: ${lines[foundLine - 1]?.substring(0, 80)}`;
    }
    elements.validationOutput.innerHTML = `
<span class="validation-error">✗ Invalid JSON: ${e.message}${context}</span>
    `.trim();
    elements.jsonCode.textContent = '';
  }

  function getJsonStats(obj) {
    let keys = 0, arrays = 0, strings = 0, numbers = 0, booleans = 0, nulls = 0, depth = 0;

    function count(o, d = 0) {
      depth = Math.max(depth, d);
      if (o === null) { nulls++; return; }
      if (Array.isArray(o)) { arrays++; o.forEach(v => count(v, d + 1)); return; }
      if (typeof o === 'object') { keys += Object.keys(o).length; Object.values(o).forEach(v => count(v, d + 1)); return; }
      if (typeof o === 'string') { strings++; return; }
      if (typeof o === 'number') { numbers++; return; }
      if (typeof o === 'boolean') { booleans++; return; }
    }
    count(obj);
    return `${keys} keys, ${arrays} arrays, ${strings} strings, ${numbers} numbers, ${booleans} booleans, ${nulls} nulls | Max depth: ${depth}`;
  }

  function renderOutput() {
    if (parsedJson === null) return;

    const indent = elements.indentSize.value;
    const indentStr = indent === '\t' ? '\t' : ' '.repeat(parseInt(indent));

    switch (currentFormat) {
      case 'formatted':
        elements.jsonCode.textContent = JSON.stringify(parsedJson, null, indentStr);
        highlightJson();
        break;
      case 'minified':
        elements.jsonCode.textContent = JSON.stringify(parsedJson);
        highlightJson();
        break;
      case 'tree':
        renderTreeView();
        break;
      case 'ts':
        elements.jsonCode.textContent = generateTypeScript(parsedJson);
        highlightTypeScript();
        break;
      case 'csv':
        elements.jsonCode.textContent = generateCSV(parsedJson);
        break;
    }
  }

  function highlightJson() {
    const code = elements.jsonCode.textContent;
    const highlighted = code
      .replace(/("([^"\\]|\\.)*")\s*:/g, '<span class="json-key">$1</span>:')
      .replace(/: "([^"\\]|\\.)*"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
      .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/: null/g, ': <span class="json-null">null</span>')
      .replace(/([{}[\],:])/g, '<span class="json-punct">$1</span>');
    elements.jsonCode.innerHTML = highlighted;
  }

  function highlightTypeScript() {
    const code = elements.jsonCode.textContent;
    const highlighted = code
      .replace(/\b(interface|type|export|readonly|string|number|boolean|Date|any)\b/g, '<span class="json-key">$1</span>')
      .replace(/("([^"\\]|\\.)*")/g, '<span class="json-string">$1</span>')
      .replace(/(\d+\.?\d*)/g, '<span class="json-number">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
      .replace(/([{}[\],:;|])/g, '<span class="json-punct">$1</span>');
    elements.jsonCode.innerHTML = highlighted;
  }

  function renderTreeView() {
    function buildTree(obj, key = '', depth = 0, isRoot = true) {
      if (obj === null) {
        return `<div class="tree-node"><span class="tree-expand"></span>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}<span class="tree-null">null</span></div>`;
      }
      if (Array.isArray(obj)) {
        const children = obj.map((v, i) => buildTree(v, `[${i}]`, depth + 1, false)).join('');
        return `<div class="tree-node"><span class="tree-expand"></span>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}[${obj.length}]${obj.length > 0 ? `<div class="tree-children">${children}</div>` : ''}</div>`;
      }
      if (typeof obj === 'object') {
        const entries = Object.entries(obj);
        const children = entries.map(([k, v]) => buildTree(v, k, depth + 1, false)).join('');
        return `<div class="tree-node"><span class="tree-expand"></span>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}{${entries.length}}${entries.length > 0 ? `<div class="tree-children">${children}</div>` : ''}</div>`;
      }
      if (typeof obj === 'string') {
        return `<div class="tree-node"><span class="tree-expand"></span>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}<span class="tree-string">"${escapeHtml(obj)}"</span></div>`;
      }
      if (typeof obj === 'number') {
        return `<div class="tree-node"><span class="tree-expand"></span>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}<span class="tree-number">${obj}</span></div>`;
      }
      if (typeof obj === 'boolean') {
        return `<div class="tree-node"><span class="tree-expand"></span>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}<span class="tree-boolean">${obj}</span></div>`;
      }
      return `<div class="tree-node"><span class="tree-expand"></span>${key ? `<span class="tree-key">"${key}"</span>: ` : ''}<span class="tree-null">undefined</span></div>`;
    }

    elements.jsonCode.innerHTML = `<div class="json-tree">${buildTree(parsedJson)}</div>`;

    // Add click handlers for tree expansion
    elements.jsonCode.querySelectorAll('.tree-node').forEach(node => {
      const expand = node.querySelector('.tree-expand');
      if (expand && node.querySelector('.tree-children')) {
        node.addEventListener('click', (e) => {
          if (e.target === node || e.target === expand) {
            node.classList.toggle('collapsed');
          }
        });
      }
    });
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
  }

  function generateTypeScript(obj, name = 'Root') {
    const seen = new Set();
    let output = '';

    function getType(val, keyName) {
      if (val === null) return 'null';
      if (Array.isArray(val)) {
        if (val.length === 0) return 'any[]';
        const itemType = getType(val[0]);
        return `${itemType}[]`;
      }
      if (typeof val === 'object') {
        const objId = JSON.stringify(val);
        if (seen.has(objId)) return keyName ? capitalize(keyName) : 'Record<string, any>';
        seen.add(objId);
        const entries = Object.entries(val).map(([k, v]) => `  ${k}: ${getType(v, k)};`).join('\n');
        return `{\n${entries}\n}`;
      }
      if (typeof val === 'string') {
        if (/^\d{4}-\d{2}-\d{2}T/.test(val)) return 'Date';
        return 'string';
      }
      return typeof val;
    }

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1).replace(/[^a-zA-Z0-9]/g, '');
    }

    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      const entries = Object.entries(obj).map(([k, v]) => `  ${k}: ${getType(v, k)};`).join('\n');
      output = `export interface ${capitalize(name)} {\n${entries}\n}`;
    } else {
      output = `export type ${capitalize(name)} = ${getType(obj, name)};`;
    }
    return output;
  }

  function generateCSV(obj) {
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '';
      if (typeof obj[0] === 'object' && obj[0] !== null) {
        const headers = new Set();
        obj.forEach(row => Object.keys(row).forEach(k => headers.add(k)));
        const headerArr = Array.from(headers);
        const rows = obj.map(row => headerArr.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val).replace(/"/g, '""');
          return String(val).replace(/"/g, '""');
        }).map(v => `"${v}"`).join(','));
        return [headerArr.map(h => `"${h}"`).join(','), ...rows].join('\n');
      }
      return obj.map(v => `"${String(v).replace(/"/g, '""')}"`).join('\n');
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj).map(([k, v]) => `"${k}","${String(v).replace(/"/g, '""')}"`).join('\n');
    }
    return String(obj);
  }

  function runJsonPath() {
    const query = elements.jsonpathQuery.value.trim();
    if (!query) {
      showToast('Enter a JSONPath query');
      return;
    }
    if (parsedJson === null) {
      showToast('Parse JSON first');
      return;
    }

    try {
      const results = jsonPath(parsedJson, query);
      elements.jsonCode.textContent = JSON.stringify(results, null, 2);
      highlightJson();
      currentFormat = 'formatted';
      showToast(`Found ${results.length} result(s)`);
    } catch (e) {
      elements.jsonCode.textContent = 'Error: ' + e.message;
      showToast('Invalid JSONPath');
    }
  }

  // Simple JSONPath implementation
  function jsonPath(obj, path) {
    const results = [];
    const tokens = tokenizePath(path);

    function evaluate(current, tokenIndex) {
      if (tokenIndex >= tokens.length) {
        results.push(current);
        return;
      }

      const token = tokens[tokenIndex];

      if (token === '$') {
        evaluate(current, tokenIndex + 1);
      } else if (token === '*') {
        if (Array.isArray(current)) {
          current.forEach(item => evaluate(item, tokenIndex + 1));
        } else if (typeof current === 'object' && current !== null) {
          Object.values(current).forEach(item => evaluate(item, tokenIndex + 1));
        }
      } else if (token.startsWith('[') && token.endsWith(']')) {
        const inner = token.slice(1, -1);
        if (inner === '*') {
          if (Array.isArray(current)) {
            current.forEach(item => evaluate(item, tokenIndex + 1));
          }
        } else if (inner.startsWith('?(') && inner.endsWith(')')) {
          // Filter: [?(@.price > 10)]
          const filterExpr = inner.slice(2, -1);
          if (Array.isArray(current)) {
            current.forEach(item => {
              if (evalFilter(item, filterExpr)) evaluate(item, tokenIndex + 1);
            });
          }
        } else {
          // Index access: [0], [1,2], [-1]
          const indices = inner.split(',').map(s => parseInt(s.trim()));
          if (Array.isArray(current)) {
            indices.forEach(idx => {
              const actualIdx = idx < 0 ? current.length + idx : idx;
              if (actualIdx >= 0 && actualIdx < current.length) {
                evaluate(current[actualIdx], tokenIndex + 1);
              }
            });
          }
        }
      } else if (token === '..') {
        // Recursive descent
        function descend(o) {
          if (typeof o === 'object' && o !== null) {
            evaluate(o, tokenIndex + 1);
            if (Array.isArray(o)) {
              o.forEach(descend);
            } else {
              Object.values(o).forEach(descend);
            }
          }
        }
        descend(current);
      } else {
        // Property access
        if (typeof current === 'object' && current !== null && token in current) {
          evaluate(current[token], tokenIndex + 1);
        }
      }
    }

    function evalFilter(obj, expr) {
      // Simple filter evaluation: @.key > 10, @.key == 'value'
      try {
        const func = new Function('@', `with (@) { return ${expr.replace(/@\./g, '')}; }`);
        return func(obj);
      } catch {
        return false;
      }
    }

    function tokenizePath(path) {
      // Simple tokenizer for JSONPath
      const tokens = [];
      let current = '';
      let inBracket = false;
      let inParen = 0;

      for (let i = 0; i < path.length; i++) {
        const char = path[i];
        if (char === '[' && !inParen) {
          if (current) { tokens.push(current); current = ''; }
          inBracket = true;
          current += char;
        } else if (char === ']' && !inParen) {
          current += char;
          tokens.push(current);
          current = '';
          inBracket = false;
        } else if (char === '(' && inBracket) {
          inParen++;
          current += char;
        } else if (char === ')' && inBracket) {
          inParen--;
          current += char;
        } else if (char === '.' && !inBracket) {
          if (current) { tokens.push(current); current = ''; }
          if (path[i + 1] === '.') {
            tokens.push('..');
            i++;
          }
        } else {
          current += char;
        }
      }
      if (current) tokens.push(current);
      return tokens.filter(t => t);
    }

    evaluate(obj, 0);
    return results;
  }

  function copyOutput() {
    const text = elements.jsonCode.textContent || elements.jsonCode.innerText;
    if (!text) { showToast('Nothing to copy'); return; }
    navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
  }

  function downloadOutput() {
    const text = elements.jsonCode.textContent || elements.jsonCode.innerText;
    if (!text) { showToast('Nothing to download'); return; }

    let ext = '.json';
    let mime = 'application/json';
    if (currentFormat === 'ts') { ext = '.ts'; mime = 'text/typescript'; }
    else if (currentFormat === 'csv') { ext = '.csv'; mime = 'text/csv'; }
    else if (currentFormat === 'minified') { ext = '.min.json'; }

    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded output${ext}`);
  }

  function showDiff() {
    if (!originalJson || parsedJson === null) {
      showToast('No original JSON to compare');
      return;
    }

    const formatted = JSON.stringify(parsedJson, null, 2);
    const originalLines = originalJson.split('\n');
    const formattedLines = formatted.split('\n');

    const diff = computeDiff(originalLines, formattedLines);
    elements.jsonCode.innerHTML = diff;
    currentFormat = 'diff';
    showToast('Showing diff');
  }

  function computeDiff(oldLines, newLines) {
    // Simple line-based diff
    const maxLen = Math.max(oldLines.length, newLines.length);
    let html = '<div class="diff-output">';

    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === newLine) {
        html += `<div class="diff-context">${escapeHtml(oldLine || '')}</div>`;
      } else if (oldLine === undefined) {
        html += `<div class="diff-add">+ ${escapeHtml(newLine)}</div>`;
      } else if (newLine === undefined) {
        html += `<div class="diff-remove">- ${escapeHtml(oldLine)}</div>`;
      } else {
        html += `<div class="diff-remove">- ${escapeHtml(oldLine)}</div>`;
        html += `<div class="diff-add">+ ${escapeHtml(newLine)}</div>`;
      }
    }
    html += '</div>';
    return html;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();