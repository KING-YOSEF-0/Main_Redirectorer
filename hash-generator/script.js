// Hash Generator & Verifier - Client-side cryptographic hashing

const ALGORITHMS = [
  { id: 'md5', name: 'MD5', length: 32, secure: false, webCrypto: false },
  { id: 'sha1', name: 'SHA-1', length: 40, secure: false, webCrypto: 'SHA-1' },
  { id: 'sha256', name: 'SHA-256', length: 64, secure: true, webCrypto: 'SHA-256' },
  { id: 'sha384', name: 'SHA-384', length: 96, secure: true, webCrypto: 'SHA-384' },
  { id: 'sha512', name: 'SHA-512', length: 128, secure: true, webCrypto: 'SHA-512' },
  { id: 'sha3-256', name: 'SHA3-256', length: 64, secure: true, webCrypto: 'SHA3-256' },
  { id: 'sha3-384', name: 'SHA3-384', length: 96, secure: true, webCrypto: 'SHA3-384' },
  { id: 'sha3-512', name: 'SHA3-512', length: 128, secure: true, webCrypto: 'SHA3-512' },
  { id: 'blake2b', name: 'BLAKE2b', length: 128, secure: true, webCrypto: false },
  { id: 'blake2s', name: 'BLAKE2s', length: 64, secure: true, webCrypto: false },
  { id: 'ripemd160', name: 'RIPEMD-160', length: 40, secure: false, webCrypto: false },
];

let selectedAlgorithms = new Set(['md5', 'sha1', 'sha256', 'sha512', 'sha3-256', 'blake2b']);

// Background bubbles
const COLORS = ['#ff4fa3', '#ff9f1c', '#ffe14d', '#2ee6a6', '#35c3ff', '#9b5cff'];
const rand = (a, b) => Math.random() * (b - a) + a;
const bubbleLayer = document.getElementById('bubbles');

function spawnBubble() {
  const b = document.createElement('div');
  const size = rand(20, 90);
  b.className = 'float';
  b.style.cssText = `width:${size}px;height:${size}px;left:${rand(0, 100)}%;` +
    `--c:${COLORS[Math.floor(rand(0, COLORS.length))]};--dx:${rand(-80, 80)}px;` +
    `animation-duration:${rand(8, 16)}s`;
  bubbleLayer.appendChild(b);
  b.addEventListener('animationend', () => b.remove());
}
setInterval(spawnBubble, 600);
for (let i = 0; i < 8; i++) setTimeout(spawnBubble, i * 150);

// Initialize algorithm grid
function initAlgoGrid() {
  const grid = document.getElementById('algo-grid');
  grid.innerHTML = ALGORITHMS.map(algo => `
    <label class="algo-item ${selectedAlgorithms.has(algo.id) ? 'selected' : ''}" data-algo="${algo.id}">
      <input type="checkbox" ${selectedAlgorithms.has(algo.id) ? 'checked' : ''}>
      <span class="algo-label">${algo.name}</span>
      <span class="algo-badge">${algo.length} hex</span>
    </label>
  `).join('');

  grid.querySelectorAll('.algo-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
      const algoId = item.dataset.algo;
      const checkbox = item.querySelector('input');
      checkbox.checked = !checkbox.checked;
      toggleAlgo(algoId, checkbox.checked);
    });
    item.querySelector('input').addEventListener('change', (e) => {
      toggleAlgo(item.dataset.algo, e.target.checked);
    });
  });
}

function toggleAlgo(id, selected) {
  if (selected) selectedAlgorithms.add(id);
  else selectedAlgorithms.delete(id);
  document.querySelector(`.algo-item[data-algo="${id}"]`).classList.toggle('selected', selected);
}

// Text encoding
function getEncoder(encoding) {
  switch (encoding) {
    case 'utf-16le': return new TextEncoder('utf-16le');
    case 'latin1': return { encode: (s) => Uint8Array.from(s, c => c.charCodeAt(0) & 0xff) };
    default: return new TextEncoder();
  }
}

// Convert ArrayBuffer to hex
function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Web Crypto hash
async function hashWebCrypto(algoName, data) {
  const buffer = await crypto.subtle.digest(algoName, data);
  return bytesToHex(buffer);
}

// MD5 implementation (not in Web Crypto)
async function hashMD5(data) {
  // Simple MD5 implementation
  function md5cycle(x, k) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
  function add32(a, b) { return (a + b) & 0xffffffff; }

  const bytes = new Uint8Array(data);
  const len = bytes.length;
  const bits = len * 8;
  const padded = new Uint8Array(((len + 9 + 63) & ~63) + 64);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bits, true);
  view.setUint32(padded.length - 4, 0, true);

  let x = [1732584193, -271733879, -1732584194, 271733878];
  for (let i = 0; i < padded.length; i += 64) {
    const k = new Array(16);
    for (let j = 0; j < 16; j++) {
      k[j] = view.getUint32(i + j * 4, true);
    }
    md5cycle(x, k);
  }
  return x.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
}

// SHA-3 / Keccak (simplified - using Web Crypto if available)
async function hashSHA3(algoName, data) {
  if (crypto.subtle.digest) {
    try {
      return await hashWebCrypto(algoName, data);
    } catch {}
  }
  // Fallback: use a simple implementation or return placeholder
  return 'SHA3 not available in this browser';
}

// BLAKE2 implementation (simplified)
async function hashBLAKE2(algoName, data) {
  // Placeholder - would need full BLAKE2 implementation
  return `${algoName.toUpperCase()} not implemented in demo`;
}

// RIPEMD-160
async function hashRIPEMD160(data) {
  return 'RIPEMD-160 not implemented in demo';
}

// Main hash function
async function computeHash(algo, data) {
  const a = ALGORITHMS.find(x => x.id === algo);
  if (!a) return 'Unknown algorithm';

  if (a.webCrypto && crypto.subtle.digest) {
    try {
      return await hashWebCrypto(a.webCrypto, data);
    } catch (e) {
      return `Error: ${e.message}`;
    }
  }

  switch (algo) {
    case 'md5': return await hashMD5(data);
    case 'sha3-256': case 'sha3-384': case 'sha3-512': return await hashSHA3(algo.toUpperCase(), data);
    case 'blake2b': case 'blake2s': return await hashBLAKE2(algo, data);
    case 'ripemd160': return await hashRIPEMD160(data);
    default: return 'Not implemented';
  }
}

// HMAC
async function computeHMAC(algo, key, data) {
  const a = ALGORITHMS.find(x => x.id === algo);
  if (!a || !a.webCrypto) return 'HMAC not supported for this algorithm';

  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw', key, { name: 'HMAC', hash: { name: a.webCrypto } }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return bytesToHex(sig);
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

// Streaming file hash
async function hashFileStream(file, algorithms, onProgress) {
  const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  const hashes = {};
  const hashStates = {};

  // Initialize hash states for Web Crypto algorithms
  for (const algo of algorithms) {
    const a = ALGORITHMS.find(x => x.id === algo);
    if (a && a.webCrypto) {
      // Web Crypto doesn't support streaming directly, so we'll accumulate
      // For true streaming, we'd need a different approach
      hashStates[algo] = { chunks: [] };
    } else {
      hashStates[algo] = { chunks: [] };
    }
  }

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let loaded = 0;

  for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const arrayBuffer = await chunk.arrayBuffer();
    loaded += chunk.size;

    for (const algo of algorithms) {
      hashStates[algo].chunks.push(arrayBuffer);
    }

    if (onProgress) onProgress(loaded / file.size * 100);
  }

  // Compute final hashes
  for (const algo of algorithms) {
    const combined = concatArrayBuffers(hashStates[algo].chunks);
    hashes[algo] = await computeHash(algo, combined);
  }

  return hashes;
}

function concatArrayBuffers(buffers) {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return result;
}

// Generate all hashes for text input
async function generateTextHashes() {
  const text = document.getElementById('text-input').value;
  const encoding = document.getElementById('text-encoding').value;
  const encoder = getEncoder(encoding);
  const data = encoder.encode(text);

  const results = {};
  for (const algo of selectedAlgorithms) {
    results[algo] = await computeHash(algo, data);
  }
  return results;
}

// Generate HMAC
async function generateHMAC() {
  const message = document.getElementById('hmac-message').value;
  const keyInput = document.getElementById('hmac-key').value;
  const keyEncoding = document.getElementById('hmac-encoding').value;

  let key;
  const encoder = new TextEncoder();
  switch (keyEncoding) {
    case 'base64':
      const binary = atob(keyInput);
      key = Uint8Array.from(binary, c => c.charCodeAt(0));
      break;
    case 'hex':
      key = new Uint8Array(keyInput.match(/.{1,2}/g).map(b => parseInt(b, 16)));
      break;
    default:
      key = encoder.encode(keyInput);
  }

  const data = encoder.encode(message);
  const results = {};
  for (const algo of selectedAlgorithms) {
    results[algo] = await computeHMAC(algo, key, data);
  }
  return results;
}

// Generate batch hashes
async function generateBatchHashes() {
  const input = document.getElementById('batch-input').value;
  const delimiter = document.getElementById('batch-delimiter').value;

  let lines;
  switch (delimiter) {
    case 'comma': lines = input.split(','); break;
    case 'semicolon': lines = input.split(';'); break;
    case 'tab': lines = input.split('\t'); break;
    default: lines = input.split('\n');
  }

  lines = lines.map(l => l.trim()).filter(l => l.length > 0);
  const encoder = new TextEncoder();

  const results = [];
  for (const line of lines) {
    const data = encoder.encode(line);
    const row = { input: line };
    for (const algo of selectedAlgorithms) {
      row[algo] = await computeHash(algo, data);
    }
    results.push(row);
  }
  return results;
}

// Verify hash
async function verifyHash() {
  const input = document.getElementById('verify-input').value;
  const expectedHash = document.getElementById('expected-hash').value.trim().toLowerCase();
  const algoSelect = document.getElementById('verify-algo').value;

  if (!input || !expectedHash) {
    showToast('Please provide both input and expected hash');
    return;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  let match = false;
  let matchedAlgo = null;
  let computedHash = '';

  if (algoSelect !== 'auto') {
    computedHash = (await computeHash(algoSelect, data)).toLowerCase();
    match = computedHash === expectedHash;
    matchedAlgo = algoSelect;
  } else {
    // Try all algorithms by length
    for (const algo of ALGORITHMS) {
      if (algo.length * 2 !== expectedHash.length) continue; // hex chars = bytes * 2
      computedHash = (await computeHash(algo.id, data)).toLowerCase();
      if (computedHash === expectedHash) {
        match = true;
        matchedAlgo = algo.id;
        break;
      }
    }
  }

  showVerifyResult(match, matchedAlgo, computedHash, expectedHash);
}

function showVerifyResult(match, algo, computed, expected) {
  const badge = document.getElementById('verify-badge');
  const msg = document.getElementById('verify-message');
  const details = document.getElementById('verify-details');
  const container = document.getElementById('verify-result');

  container.hidden = false;
  badge.className = 'verify-badge ' + (match ? 'match' : 'mismatch');
  badge.innerHTML = match ? '✓ MATCH' : '✗ MISMATCH';
  msg.textContent = match ? 'Hashes match!' : 'Hashes do not match';

  if (algo) {
    details.innerHTML = `
      <div class="detail-row"><span class="detail-label">Algorithm</span><span class="detail-value">${algo.toUpperCase()}</span></div>
      <div class="detail-row"><span class="detail-label">Expected</span><span class="detail-value">${expected}</span></div>
      <div class="detail-row"><span class="detail-label">Computed</span><span class="detail-value">${computed}</span></div>
    `;
  } else {
    details.innerHTML = `
      <div class="detail-row"><span class="detail-label">Expected</span><span class="detail-value">${expected}</span></div>
      <div class="detail-row"><span class="detail-label">No matching algorithm found</span></div>
    `;
  }
}

// Render results
function renderResults(results, type) {
  const container = document.getElementById('results-content');

  if (type === 'batch') {
    renderBatchTable(results);
  } else {
    renderHashGrid(results);
  }
}

function renderHashGrid(results) {
  const container = document.getElementById('results-content');
  container.innerHTML = `
    <div class="hash-grid">
      ${Object.entries(results).map(([algo, hash]) => {
        const a = ALGORITHMS.find(x => x.id === algo);
        const len = a ? a.length : hash.length / 2;
        return `
          <div class="hash-card" data-algo="${algo}">
            <div class="hash-header">
              <span class="hash-name">${algo.toUpperCase()}</span>
              <span class="hash-len">${len} bytes</span>
            </div>
            <div class="hash-value" id="hash-${algo}">${hash}</div>
            <div class="hash-actions">
              <button class="btn-icon" data-copy="${algo}" title="Copy">📋</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const algo = btn.dataset.copy;
      const hash = document.getElementById(`hash-${algo}`).textContent;
      copyText(hash, algo.toUpperCase());
    });
  });
}

function renderBatchTable(results) {
  if (results.length === 0) {
    document.getElementById('results-content').innerHTML = '<div class="empty-results"><div class="empty-icon">📊</div><p>No valid lines to hash</p></div>';
    return;
  }

  const algos = Array.from(selectedAlgorithms);
  const container = document.getElementById('results-content');
  container.innerHTML = `
    <div style="overflow-x: auto;">
      <table class="batch-table">
        <thead>
          <tr>
            <th>Input</th>
            ${algos.map(a => `<th>${a.toUpperCase()}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${results.map(row => `
            <tr>
              <td>${escapeHtml(row.input.slice(0, 50))}${row.input.length > 50 ? '…' : ''}</td>
              ${algos.map(a => `<td class="batch-hash">${row[a]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Copy all
async function copyAllHashes() {
  const hashCards = document.querySelectorAll('.hash-card');
  if (hashCards.length === 0) {
    showToast('No hashes to copy');
    return;
  }

  let text = '';
  hashCards.forEach(card => {
    const algo = card.dataset.algo;
    const hash = card.querySelector('.hash-value').textContent;
    text += `${algo.toUpperCase()}: ${hash}\n`;
  });
  await copyText(text, 'All hashes');
}

// Download results
function downloadResults() {
  const hashCards = document.querySelectorAll('.hash-card');
  const batchTable = document.querySelector('.batch-table');

  let content = '';
  let filename = 'hashes.txt';

  if (hashCards.length > 0) {
    hashCards.forEach(card => {
      const algo = card.dataset.algo;
      const hash = card.querySelector('.hash-value').textContent;
      content += `${algo.toUpperCase()}: ${hash}\n`;
    });
    filename = 'hashes.txt';
  } else if (batchTable) {
    // Convert table to CSV
    const rows = batchTable.querySelectorAll('tr');
    content = Array.from(rows).map(row =>
      Array.from(row.querySelectorAll('th, td')).map(c => c.textContent).join(',')
    ).join('\n');
    filename = 'hashes.csv';
  } else {
    showToast('No results to download');
    return;
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${filename}`);
}

// Shareable link (encode state in URL hash)
function shareLink() {
  const state = {
    v: 1,
    text: document.getElementById('text-input').value,
    encoding: document.getElementById('text-encoding').value,
    algos: Array.from(selectedAlgorithms)
  };
  const encoded = btoa(JSON.stringify(state));
  const url = `${location.origin}${location.pathname}#${encoded}`;
  copyText(url, 'Shareable link');
}

// Load from URL hash
function loadFromHash() {
  if (location.hash.startsWith('#')) {
    try {
      const encoded = location.hash.slice(1);
      const state = JSON.parse(atob(encoded));
      if (state.text) document.getElementById('text-input').value = state.text;
      if (state.encoding) document.getElementById('text-encoding').value = state.encoding;
      if (state.algos) {
        selectedAlgorithms = new Set(state.algos);
        initAlgoGrid();
      }
    } catch {}
  }
}

// Toast
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function copyText(text, label) {
  return navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} copied!`);
  }).catch(() => {
    showToast('Failed to copy');
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  initAlgoGrid();
  loadFromHash();

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => p.hidden = true);

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(`panel-${btn.dataset.tab}`).hidden = false;
    });
  });

  // Generate button
  document.getElementById('btn-generate').addEventListener('click', async () => {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    document.getElementById('verify-result').hidden = true;

    try {
      let results;
      if (activeTab === 'text') results = await generateTextHashes();
      else if (activeTab === 'hmac') results = await generateHMAC();
      else if (activeTab === 'batch') {
        results = await generateBatchHashes();
        renderResults(results, 'batch');
        return;
      }
      renderResults(results, 'hash');
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  });

  // Clear button
  document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('text-input').value = '';
    document.getElementById('hmac-message').value = '';
    document.getElementById('hmac-key').value = '';
    document.getElementById('batch-input').value = '';
    document.getElementById('verify-input').value = '';
    document.getElementById('expected-hash').value = '';
    document.getElementById('results-content').innerHTML = `
      <div class="empty-results">
        <div class="empty-icon">#️⃣</div>
        <p>Generate hashes to see results</p>
      </div>
    `;
    document.getElementById('verify-result').hidden = true;
    document.getElementById('file-info').hidden = true;
    document.getElementById('file-progress').hidden = true;
    document.getElementById('progress-text').hidden = true;
  });

  // Copy all
  document.getElementById('btn-copy-all').addEventListener('click', copyAllHashes);

  // Download
  document.getElementById('btn-download').addEventListener('click', downloadResults);

  // Share
  document.getElementById('btn-share').addEventListener('click', shareLink);

  // File drop zone
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

  document.getElementById('btn-remove-file').addEventListener('click', () => {
    fileInput.value = '';
    document.getElementById('file-info').hidden = true;
  });

  // Verify file drop
  const verifyDrop = document.getElementById('verify-drop-zone');
  const verifyFileInput = document.getElementById('verify-file-input');
  verifyDrop.addEventListener('click', () => verifyFileInput.click());
  verifyDrop.addEventListener('dragover', (e) => { e.preventDefault(); verifyDrop.classList.add('drag-over'); });
  verifyDrop.addEventListener('dragleave', () => verifyDrop.classList.remove('drag-over'));
  verifyDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    verifyDrop.classList.remove('drag-over');
    handleVerifyFile(e.dataTransfer.files[0]);
  });
  verifyFileInput.addEventListener('change', () => handleVerifyFile(verifyFileInput.files[0]));

  // Live text hashing (debounced)
  let textDebounce;
  document.getElementById('text-input').addEventListener('input', () => {
    clearTimeout(textDebounce);
    textDebounce = setTimeout(() => {
      if (document.querySelector('.tab-btn.active').dataset.tab === 'text') {
        document.getElementById('btn-generate').click();
      }
    }, 300);
  });

  // HMAC key toggle
  document.getElementById('btn-toggle-hmac-key').addEventListener('click', (e) => {
    const input = document.getElementById('hmac-key');
    input.type = input.type === 'password' ? 'text' : 'password';
    e.target.textContent = input.type === 'password' ? '👁' : '🙈';
  });
});

async function handleFile(file) {
  if (!file) return;
  if (file.size > 100 * 1024 * 1024) {
    showToast('File too large (max 100MB)');
    return;
  }

  document.getElementById('file-name').textContent = file.name;
  document.getElementById('file-size').textContent = formatBytes(file.size);
  document.getElementById('file-info').hidden = false;
  document.getElementById('file-progress').hidden = false;
  document.getElementById('progress-text').hidden = false;

  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  try {
    const results = await hashFileStream(file, Array.from(selectedAlgorithms), (pct) => {
      progressFill.style.width = `${pct}%`;
      progressText.textContent = `${pct.toFixed(1)}%`;
    });
    renderResults(results, 'hash');
    progressText.textContent = 'Done!';
  } catch (e) {
    showToast('Error hashing file: ' + e.message);
  }
}

async function handleVerifyFile(file) {
  if (!file) return;
  const arrayBuffer = await file.arrayBuffer();
  // For simplicity, just show file name and let user compute
  document.getElementById('verify-input').value = `[File: ${file.name} (${formatBytes(file.size)})]`;
  showToast('File loaded. Click Generate to hash.');
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
}