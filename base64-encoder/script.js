const Base64Encoder = (() => {
  const state = {
    mode: 'encode',
    currentFormat: 'base64',
    lastResult: '',
    lastBinary: null,
  };

  const elements = {};

  // Base32 alphabet (RFC 4648)
  const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const BASE32_HEX_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
  const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  const PRESETS = [
    { label: 'Hello World', text: 'Hello, World!' },
    { label: 'JSON', text: '{"name":"test","value":123}' },
    { label: 'URL', text: 'https://example.com/path?query=value' },
    { label: 'JWT Header', text: '{"alg":"HS256","typ":"JWT"}' },
    { label: 'Empty', text: '' },
  ];

  function init() {
    cacheElements();
    renderPresets();
    bindEvents();
    startBubbles();
  }

  function cacheElements() {
    elements.modeTabs = document.getElementById('mode-tabs');
    elements.panels = {
      encode: document.getElementById('panel-encode'),
      decode: document.getElementById('panel-decode'),
      batch: document.getElementById('panel-batch'),
    };
    elements.encodeInput = document.getElementById('encode-input');
    elements.encodeFile = document.getElementById('encode-file');
    elements.encodeFormat = document.getElementById('encode-format');
    elements.encodeChunked = document.getElementById('encode-chunked');
    elements.encodePadding = document.getElementById('encode-padding');
    elements.btnEncode = document.getElementById('btn-encode');
    elements.btnClearEncode = document.getElementById('btn-clear-encode');

    elements.decodeInput = document.getElementById('decode-input');
    elements.decodeFile = document.getElementById('decode-file');
    elements.decodeFormat = document.getElementById('decode-format');
    elements.decodeUtf8 = document.getElementById('decode-utf8');
    elements.btnDecode = document.getElementById('btn-decode');
    elements.btnClearDecode = document.getElementById('btn-clear-decode');

    elements.batchInput = document.getElementById('batch-input');
    elements.batchOperation = document.getElementById('batch-operation');
    elements.batchFormat = document.getElementById('batch-format');
    elements.btnBatch = document.getElementById('btn-batch');
    elements.btnClearBatch = document.getElementById('btn-clear-batch');

    elements.outputStats = document.getElementById('output-stats');
    elements.outputResult = document.getElementById('output-result');
    elements.fileInfo = document.getElementById('file-info');
    elements.fileInfoContent = document.getElementById('file-info-content');
    elements.emptyResults = document.getElementById('empty-results');

    elements.btnCopy = document.getElementById('btn-copy-output');
    elements.btnDownloadTxt = document.getElementById('btn-download-txt');
    elements.btnDownloadBin = document.getElementById('btn-download-bin');
    elements.btnSwap = document.getElementById('btn-swap');

    elements.presetButtons = document.getElementById('preset-buttons');
  }

  function bindEvents() {
    // Mode tabs
    document.querySelectorAll('#mode-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Encode
    elements.btnEncode.addEventListener('click', encode);
    elements.btnClearEncode.addEventListener('click', () => clearPanel('encode'));
    elements.encodeFile.addEventListener('change', (e) => handleFileEncode(e.target.files));
    elements.encodeFormat.addEventListener('change', () => {
      state.currentFormat = elements.encodeFormat.value;
    });

    // Decode
    elements.btnDecode.addEventListener('click', decode);
    elements.btnClearDecode.addEventListener('click', () => clearPanel('decode'));
    elements.decodeFile.addEventListener('change', (e) => handleFileDecode(e.target.files));

    // Batch
    elements.btnBatch.addEventListener('click', processBatch);
    elements.btnClearBatch.addEventListener('click', () => clearPanel('batch'));

    // Output actions
    elements.btnCopy.addEventListener('click', copyOutput);
    elements.btnDownloadTxt.addEventListener('click', downloadAsText);
    elements.btnDownloadBin.addEventListener('click', downloadAsBinary);
    elements.btnSwap.addEventListener('click', swapInputOutput);
  }

  function switchMode(mode) {
    state.mode = mode;
    document.querySelectorAll('#mode-tabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
      btn.setAttribute('aria-selected', btn.dataset.mode === mode);
    });
    Object.entries(elements.panels).forEach(([key, panel]) => {
      panel.hidden = key !== mode;
    });
  }

  function renderPresets() {
    elements.presetButtons.innerHTML = PRESETS.map(p =>
      `<button class="preset-btn" data-text="${escapeHtml(p.text)}">${escapeHtml(p.label)}</button>`
    ).join('');
    elements.presetButtons.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.encodeInput.value = btn.dataset.text;
        encode();
      });
    });
  }

  // ========== ENCODING ==========

  async function encode() {
    const text = elements.encodeInput.value;
    const format = elements.encodeFormat.value;
    const chunked = elements.encodeChunked.checked;
    const keepPadding = elements.encodePadding.checked;

    if (!text && !state.lastBinary) {
      showToast('Enter text or upload a file');
      return;
    }

    try {
      let binary;
      if (state.lastBinary && !text) {
        binary = state.lastBinary;
      } else {
        binary = stringToBytes(text);
      }

      let result = encodeBinary(binary, format);

      if (format === 'base64' && chunked) {
        result = chunkString(result, 76);
      }

      if (!keepPadding && (format === 'base64' || format === 'base32' || format === 'base32hex')) {
        result = result.replace(/=+$/, '');
      }

      state.lastResult = result;
      state.lastBinary = binary;
      showResult(result, binary.length);
    } catch (e) {
      showToast(`Encode error: ${e.message}`);
    }
  }

  function encodeBinary(bytes, format) {
    switch (format) {
      case 'base64':
        return bytesToBase64(bytes);
      case 'base64url':
        return bytesToBase64URL(bytes);
      case 'base32':
        return bytesToBase32(bytes, BASE32_ALPHABET);
      case 'base32hex':
        return bytesToBase32(bytes, BASE32_HEX_ALPHABET);
      case 'base58':
        return bytesToBase58(bytes);
      case 'hex':
        return bytesToHex(bytes);
      default:
        return bytesToBase64(bytes);
    }
  }

  function bytesToBase64(bytes) {
    let result = '';
    const len = bytes.length;
    for (let i = 0; i < len; i += 3) {
      const b1 = bytes[i];
      const b2 = i + 1 < len ? bytes[i + 1] : 0;
      const b3 = i + 2 < len ? bytes[i + 2] : 0;

      const triplet = (b1 << 16) | (b2 << 8) | b3;

      result += BASE64_CHARS[(triplet >> 18) & 0x3F];
      result += BASE64_CHARS[(triplet >> 12) & 0x3F];
      result += i + 1 < len ? BASE64_CHARS[(triplet >> 6) & 0x3F] : '=';
      result += i + 2 < len ? BASE64_CHARS[triplet & 0x3F] : '=';
    }
    return result;
  }

  function bytesToBase64URL(bytes) {
    return bytesToBase64(bytes)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  function bytesToBase32(bytes, alphabet) {
    let bits = 0;
    let bitCount = 0;
    let result = '';

    for (const byte of bytes) {
      bits = (bits << 8) | byte;
      bitCount += 8;

      while (bitCount >= 5) {
        bitCount -= 5;
        result += alphabet[(bits >> bitCount) & 0x1F];
      }
    }

    if (bitCount > 0) {
      result += alphabet[(bits << (5 - bitCount)) & 0x1F];
    }

    // Padding for RFC 4648
    const padding = (8 - (result.length % 8)) % 8;
    if (padding > 0 && alphabet === BASE32_ALPHABET) {
      result += '='.repeat(padding);
    }

    return result;
  }

  function bytesToBase58(bytes) {
    // Convert to big integer
    let num = 0n;
    for (const byte of bytes) {
      num = (num << 8n) | BigInt(byte);
    }

    // Count leading zeros
    let leadingZeros = 0;
    for (const byte of bytes) {
      if (byte === 0) leadingZeros++;
      else break;
    }

    // Convert to base58
    let result = '';
    while (num > 0n) {
      const mod = num % 58n;
      result = BASE58_ALPHABET[Number(mod)] + result;
      num = num / 58n;
    }

    // Add leading '1's for each leading zero byte
    return '1'.repeat(leadingZeros) + result;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }

  // ========== DECODING ==========

  async function decode() {
    const input = elements.decodeInput.value.trim();
    const format = elements.decodeFormat.value;
    const asUtf8 = elements.decodeUtf8.checked;

    if (!input && !state.lastBinary) {
      showToast('Enter encoded data or upload a file');
      return;
    }

    try {
      let binary;

      if (state.lastBinary && !input) {
        binary = state.lastBinary;
      } else {
        const detectedFormat = format === 'auto' ? detectFormat(input) : format;
        binary = decodeBinary(input, detectedFormat);
      }

      state.lastBinary = binary;

      let result;
      if (asUtf8) {
        result = bytesToString(binary);
      } else {
        result = `[Binary data: ${binary.length} bytes]`;
        showFileInfo(binary);
      }

      state.lastResult = result;
      showResult(result, binary.length);
    } catch (e) {
      showToast(`Decode error: ${e.message}`);
    }
  }

  function detectFormat(str) {
    // Remove whitespace
    const clean = str.replace(/\s/g, '');

    // Base64URL (has - or _)
    if (/[-_]/.test(clean) && /^[A-Za-z0-9\-_=]+$/.test(clean)) {
      return 'base64url';
    }

    // Base64 (standard)
    if (/^[A-Za-z0-9+/=]+$/.test(clean) && clean.length % 4 === 0) {
      return 'base64';
    }

    // Base32
    if (/^[A-Z2-7=]+$/i.test(clean)) {
      return 'base32';
    }

    // Base32Hex
    if (/^[0-9A-V=]+$/i.test(clean)) {
      return 'base32hex';
    }

    // Base58
    if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(clean)) {
      return 'base58';
    }

    // Hex
    if (/^[0-9A-Fa-f]+$/.test(clean) && clean.length % 2 === 0) {
      return 'hex';
    }

    // Default to base64
    return 'base64';
  }

  function decodeBinary(str, format) {
    const clean = str.replace(/\s/g, '');

    switch (format) {
      case 'base64':
        return base64ToBytes(clean);
      case 'base64url':
        return base64URLToBytes(clean);
      case 'base32':
        return base32ToBytes(clean, BASE32_ALPHABET);
      case 'base32hex':
        return base32ToBytes(clean, BASE32_HEX_ALPHABET);
      case 'base58':
        return base58ToBytes(clean);
      case 'hex':
        return hexToBytes(clean);
      default:
        return base64ToBytes(clean);
    }
  }

  function base64ToBytes(str) {
    const padding = str.endsWith('==') ? 2 : str.endsWith('=') ? 1 : 0;
    const clean = str.replace(/=+$/, '');
    const len = clean.length;
    const bytes = new Uint8Array(((len * 3) / 4) | 0);

    for (let i = 0, j = 0; i < len; i += 4, j += 3) {
      const c1 = BASE64_INDEX[clean.charCodeAt(i)];
      const c2 = BASE64_INDEX[clean.charCodeAt(i + 1)];
      const c3 = i + 2 < len ? BASE64_INDEX[clean.charCodeAt(i + 2)] : 0;
      const c4 = i + 3 < len ? BASE64_INDEX[clean.charCodeAt(i + 3)] : 0;

      const triplet = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;

      bytes[j] = (triplet >> 16) & 0xFF;
      if (j + 1 < bytes.length) bytes[j + 1] = (triplet >> 8) & 0xFF;
      if (j + 2 < bytes.length) bytes[j + 2] = triplet & 0xFF;
    }

    return bytes;
  }

  function base64URLToBytes(str) {
    // Restore standard base64
    let restored = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding
    const pad = (4 - (restored.length % 4)) % 4;
    restored += '='.repeat(pad);
    return base64ToBytes(restored);
  }

  function base32ToBytes(str, alphabet) {
    const clean = str.replace(/=+$/, '').toUpperCase();
    const map = {};
    for (let i = 0; i < alphabet.length; i++) {
      map[alphabet[i]] = i;
    }

    let bits = 0;
    let bitCount = 0;
    const bytes = [];

    for (const ch of clean) {
      const val = map[ch];
      if (val === undefined) continue;

      bits = (bits << 5) | val;
      bitCount += 5;

      if (bitCount >= 8) {
        bitCount -= 8;
        bytes.push((bits >> bitCount) & 0xFF);
      }
    }

    return new Uint8Array(bytes);
  }

  function base58ToBytes(str) {
    // Count leading '1's
    let leadingOnes = 0;
    for (const ch of str) {
      if (ch === '1') leadingOnes++;
      else break;
    }

    // Convert from base58
    let num = 0n;
    for (const ch of str) {
      const val = BASE58_ALPHABET.indexOf(ch);
      if (val === -1) continue;
      num = num * 58n + BigInt(val);
    }

    // Convert to bytes
    const bytes = [];
    while (num > 0n) {
      bytes.unshift(Number(num & 0xFFn));
      num = num >> 8n;
    }

    // Add leading zeros
    const result = new Uint8Array(leadingOnes + bytes.length);
    for (let i = 0; i < leadingOnes; i++) result[i] = 0;
    for (let i = 0; i < bytes.length; i++) result[leadingOnes + i] = bytes[i];

    return result;
  }

  function hexToBytes(str) {
    const clean = str.replace(/\s/g, '');
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
    }
    return bytes;
  }

  // ========== BATCH PROCESSING ==========

  function processBatch() {
    const lines = elements.batchInput.value.split('\n').filter(l => l.trim());
    const operation = elements.batchOperation.value;
    const format = elements.batchFormat.value;

    if (lines.length === 0) {
      showToast('Enter at least one line');
      return;
    }

    const results = lines.map((line, i) => {
      try {
        if (operation === 'encode') {
          const binary = stringToBytes(line);
          return { input: line, output: encodeBinary(binary, format), error: null };
        } else {
          const detected = detectFormat(line);
          const binary = decodeBinary(line, detected);
          return { input: line, output: bytesToString(binary), error: null };
        }
      } catch (e) {
        return { input: line, output: '', error: e.message };
      }
    });

    renderBatchResults(results);
    showToast(`Processed ${lines.length} lines`);
  }

  function renderBatchResults(results) {
    elements.outputResult.value = '';
    const container = document.createElement('div');
    container.className = 'batch-results';

    results.forEach((r, i) => {
      const item = document.createElement('div');
      item.className = 'batch-item';
      item.innerHTML = `
        <span class="batch-index">${i + 1}</span>
        <span class="batch-input" title="${escapeHtml(r.input)}">${escapeHtml(truncate(r.input, 50))}</span>
        <span class="batch-output" title="${escapeHtml(r.output)}">${escapeHtml(truncate(r.output || r.error, 50))}</span>
        <button class="batch-copy" data-index="${i}">Copy</button>
      `;
      container.appendChild(item);
    });

    container.querySelectorAll('.batch-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        navigator.clipboard.writeText(results[idx].output || results[idx].error);
        showToast('Copied');
      });
    });

    elements.outputResult.parentNode.replaceChild(container, elements.outputResult);
    elements.outputResult = container;
    elements.outputStats.textContent = `${results.length} lines processed`;
    elements.emptyResults.hidden = true;
  }

  // ========== FILE HANDLING ==========

  async function handleFileEncode(files) {
    if (files.length === 0) return;

    const file = files[0];
    if (file.size > 100 * 1024 * 1024) {
      showToast('File too large (max 100MB)');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      state.lastBinary = bytes;

      const format = elements.encodeFormat.value;
      const chunked = elements.encodeChunked.checked;
      const keepPadding = elements.encodePadding.checked;

      let result = encodeBinary(bytes, format);
      if (format === 'base64' && chunked) {
        result = chunkString(result, 76);
      }
      if (!keepPadding && (format === 'base64' || format === 'base32' || format === 'base32hex')) {
        result = result.replace(/=+$/, '');
      }

      state.lastResult = result;
      showResult(result, bytes.length);
      showFileInfo(bytes, file.name);
      showToast(`Encoded ${file.name} (${formatFileSize(file.size)})`);
    } catch (e) {
      showToast(`File encode error: ${e.message}`);
    }
  }

  async function handleFileDecode(files) {
    if (files.length === 0) return;

    const file = files[0];
    if (file.size > 100 * 1024 * 1024) {
      showToast('File too large (max 100MB)');
      return;
    }

    try {
      const text = await file.text();
      elements.decodeInput.value = text;
      decode();
      showToast(`Loaded ${file.name}`);
    } catch (e) {
      showToast(`File decode error: ${e.message}`);
    }
  }

  // ========== OUTPUT ACTIONS ==========

  function showResult(result, byteLength) {
    elements.outputResult.value = result;
    elements.outputResult.hidden = false;
    elements.emptyResults.hidden = true;
    elements.outputStats.textContent = `${result.length} chars, ${byteLength} bytes`;
    elements.btnCopy.disabled = false;
    elements.btnDownloadTxt.disabled = false;
    elements.btnDownloadBin.disabled = !state.lastBinary;
    elements.btnSwap.disabled = false;
  }

  function showFileInfo(bytes, name = '') {
    elements.fileInfo.hidden = false;
    const info = [];
    if (name) info.push(`Name: ${name}`);
    info.push(`Size: ${bytes.length} bytes (${formatFileSize(bytes.length)})`);
    info.push(`Hex: ${bytesToHex(bytes.slice(0, 32))}${bytes.length > 32 ? '...' : ''}`);
    elements.fileInfoContent.innerHTML = info.map((line, i) =>
      `<div class="decode-row"><span class="decode-label">${i === 0 ? 'File' : ''}</span><span class="decode-value">${escapeHtml(line)}</span></div>`
    ).join('');
  }

  function copyOutput() {
    if (!state.lastResult) return;
    navigator.clipboard.writeText(state.lastResult).then(() => showToast('Copied to clipboard'));
  }

  function downloadAsText() {
    if (!state.lastResult) return;
    const blob = new Blob([state.lastResult], { type: 'text/plain' });
    downloadBlob(blob, 'encoded.txt');
    showToast('Downloaded as .txt');
  }

  function downloadAsBinary() {
    if (!state.lastBinary) return;
    const blob = new Blob([state.lastBinary], { type: 'application/octet-stream' });
    downloadBlob(blob, 'decoded.bin');
    showToast('Downloaded as binary');
  }

  function swapInputOutput() {
    if (state.mode === 'encode') {
      elements.decodeInput.value = state.lastResult;
      switchMode('decode');
      decode();
    } else {
      elements.encodeInput.value = state.lastResult;
      switchMode('encode');
      encode();
    }
  }

  function clearPanel(panel) {
    switch (panel) {
      case 'encode':
        elements.encodeInput.value = '';
        elements.encodeFile.value = '';
        break;
      case 'decode':
        elements.decodeInput.value = '';
        elements.decodeFile.value = '';
        break;
      case 'batch':
        elements.batchInput.value = '';
        break;
    }
    elements.outputResult.value = '';
    elements.outputResult.hidden = true;
    elements.emptyResults.hidden = false;
    elements.fileInfo.hidden = true;
    elements.outputStats.textContent = '';
    elements.btnCopy.disabled = true;
    elements.btnDownloadTxt.disabled = true;
    elements.btnDownloadBin.disabled = true;
    elements.btnSwap.disabled = true;
  }

  // ========== UTILITIES ==========

  const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const BASE64_INDEX = new Array(128).fill(-1);
  for (let i = 0; i < 64; i++) {
    BASE64_INDEX[BASE64_CHARS.charCodeAt(i)] = i;
  }

  function stringToBytes(str) {
    return new TextEncoder().encode(str);
  }

  function bytesToString(bytes) {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }

  function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks.join('\n');
  }

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function downloadBlob(blob, filename) {
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