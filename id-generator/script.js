// ID Generator - UUID v1/v4/v7, ULID, NanoID, KSUID, ObjectId

// Crypto random bytes
function randomBytes(length) {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return arr;
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

// UUID v4 (random)
function generateUUIDv4() {
  const bytes = randomBytes(16);
  // Set version (4) and variant (10xx)
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  return bytesToHex(bytes);
}

// UUID v1 (timestamp + MAC)
let uuid1ClockSeq = (randomBytes(2)[0] << 8) | randomBytes(2)[1];
let uuid1LastTime = 0;
let uuid1NodeId = randomBytes(6);

function generateUUIDv1() {
  // 100-nanosecond intervals since 1582-10-15
  const now = Date.now();
  const epochDiff = 12219292800000; // ms between 1582-10-15 and 1970-01-01
  let time = BigInt((now + epochDiff) * 10000);

  // Handle clock sequence
  if (time <= uuid1LastTime) {
    uuid1ClockSeq = (uuid1ClockSeq + 1) & 0x3fff;
  }
  uuid1LastTime = time;

  const timeLow = Number(time & 0xffffffffn);
  const timeMid = Number((time >> 32n) & 0xffffn);
  const timeHi = Number((time >> 48n) & 0xfffn);

  const bytes = new Uint8Array(16);
  // time_low (4 bytes)
  bytes[0] = (timeLow >> 24) & 0xff;
  bytes[1] = (timeLow >> 16) & 0xff;
  bytes[2] = (timeLow >> 8) & 0xff;
  bytes[3] = timeLow & 0xff;
  // time_mid (2 bytes)
  bytes[4] = (timeMid >> 8) & 0xff;
  bytes[5] = timeMid & 0xff;
  // time_hi_and_version (2 bytes)
  bytes[6] = ((timeHi >> 8) & 0xff) | 0x10; // version 1
  bytes[7] = timeHi & 0xff;
  // clock_seq_hi_and_reserved (1 byte)
  bytes[8] = ((uuid1ClockSeq >> 8) & 0x3f) | 0x80; // variant 10
  // clock_seq_low (1 byte)
  bytes[9] = uuid1ClockSeq & 0xff;
  // node (6 bytes)
  bytes.set(uuid1NodeId, 10);

  return bytesToHex(bytes);
}

// UUID v7 (timestamp + random)
function generateUUIDv7(timestampMs = Date.now()) {
  const bytes = new Uint8Array(16);
  // unix_ts_ms (48 bits = 6 bytes)
  const ts = BigInt(timestampMs);
  bytes[0] = Number((ts >> 40n) & 0xffn);
  bytes[1] = Number((ts >> 32n) & 0xffn);
  bytes[2] = Number((ts >> 24n) & 0xffn);
  bytes[3] = Number((ts >> 16n) & 0xffn);
  bytes[4] = Number((ts >> 8n) & 0xffn);
  bytes[5] = Number(ts & 0xffn);
  // ver (4 bits) + rand_a (12 bits)
  const randA = randomBytes(2);
  bytes[6] = (randA[0] & 0x0f) | 0x70; // version 7
  bytes[7] = randA[1];
  // rand_b (64 bits = 8 bytes)
  bytes.set(randomBytes(8), 8);
  return bytesToHex(bytes);
}

function decodeUUIDv7(uuid) {
  const hex = uuid.replace(/-/g, '');
  if (hex.length !== 32) return null;
  const tsBytes = hexToBytes(hex.slice(0, 12));
  let ts = 0n;
  for (let i = 0; i < 6; i++) {
    ts = (ts << 8n) | BigInt(tsBytes[i]);
  }
  const date = new Date(Number(ts));
  return {
    timestamp: ts.toString(),
    date: date.toISOString(),
    local: date.toLocaleString(),
    version: (hex[12] >> 4) & 0xf,
    variant: (hex[16] >> 6) & 0x3
  };
}

// ULID (48-bit timestamp + 80-bit randomness)
let ulidLastTime = 0;
let ulidLastRandom = new Uint8Array(10);

function generateULID(timestampMs = Date.now(), monotonic = false) {
  const ts = timestampMs;
  if (monotonic && ts === ulidLastTime) {
    // Increment the random part
    let carry = 1;
    for (let i = 9; i >= 0 && carry; i--) {
      const sum = ulidLastRandom[i] + carry;
      ulidLastRandom[i] = sum & 0xff;
      carry = sum >> 8;
    }
  } else {
    ulidLastTime = ts;
    ulidLastRandom = randomBytes(10);
  }

  const bytes = new Uint8Array(16);
  // timestamp (48 bits = 6 bytes)
  bytes[0] = (ts >> 40) & 0xff;
  bytes[1] = (ts >> 32) & 0xff;
  bytes[2] = (ts >> 24) & 0xff;
  bytes[2] = (ts >> 16) & 0xff;
  bytes[4] = (ts >> 8) & 0xff;
  bytes[5] = ts & 0xff;
  // randomness (80 bits = 10 bytes)
  bytes.set(ulidLastRandom, 6);

  // Encode as Crockford's Base32
  return bytesToBase32(bytes);
}

const BASE32_ENCODE = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const BASE32_DECODE = {};
for (let i = 0; i < BASE32_ENCODE.length; i++) {
  BASE32_DECODE[BASE32_ENCODE[i]] = i;
  BASE32_DECODE[BASE32_ENCODE[i].toLowerCase()] = i;
}

function bytesToBase32(bytes) {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ENCODE[(value >> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ENCODE[(value << (5 - bits)) & 31];
  }
  return output.padStart(26, '0'); // ULID is always 26 chars
}

function base32ToBytes(str) {
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (const char of str) {
    const val = BASE32_DECODE[char];
    if (val === undefined) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

function decodeULID(ulid) {
  const bytes = base32ToBytes(ulid);
  if (bytes.length !== 16) return null;

  let ts = 0;
  for (let i = 0; i < 6; i++) {
    ts = (ts << 8) | bytes[i];
  }
  const date = new Date(ts);
  return {
    timestamp: ts,
    date: date.toISOString(),
    local: date.toLocaleString(),
    randomness: bytesToHex(bytes.slice(6))
  };
}

// NanoID
const DEFAULT_ALPHABET = '_~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateNanoID(length = 21, alphabet = DEFAULT_ALPHABET) {
  const mask = (2 << Math.log2(alphabet.length - 1)) - 1;
  let id = '';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  for (let i = 0; i < length; i++) {
    id += alphabet[bytes[i] & mask] || '';
  }
  return id;
}

function nanoIDCollisionProbability(length, alphabetSize, count) {
  // Birthday problem approximation: p ≈ 1 - e^(-n²/2N)
  // where N = alphabetSize^length, n = count
  const N = Math.pow(alphabetSize, length);
  if (N === Infinity) return 0;
  const p = 1 - Math.exp(-(count * count) / (2 * N));
  return p;
}

// KSUID (32-bit timestamp + 128-bit random, base62)
const KSUID_EPOCH = 1400000000; // 2014-05-13T16:53:20Z
const BASE62_ENCODE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function generateKSUID(timestampMs = Date.now()) {
  const ts = Math.floor(timestampMs / 1000) - KSUID_EPOCH;
  const bytes = new Uint8Array(20);
  // timestamp (32 bits = 4 bytes, big endian)
  bytes[0] = (ts >> 24) & 0xff;
  bytes[1] = (ts >> 16) & 0xff;
  bytes[2] = (ts >> 8) & 0xff;
  bytes[3] = ts & 0xff;
  // payload (128 bits = 16 bytes)
  bytes.set(randomBytes(16), 4);

  // Encode as base62
  return bytesToBase62(bytes);
}

function bytesToBase62(bytes) {
  // Convert to big integer and then to base62
  let n = 0n;
  for (const byte of bytes) {
    n = (n << 8n) | BigInt(byte);
  }

  if (n === 0n) return '0'.repeat(27);

  let result = '';
  while (n > 0n) {
    result = BASE62_ENCODE[Number(n % 62n)] + result;
    n = n / 62n;
  }
  return result.padStart(27, '0'); // KSUID is 27 chars
}

function decodeKSUID(ksuid) {
  // Decode base62
  let n = 0n;
  for (const char of ksuid) {
    const val = BASE62_ENCODE.indexOf(char);
    if (val === -1) continue;
    n = n * 62n + BigInt(val);
  }

  // Extract bytes
  const bytes = new Uint8Array(20);
  for (let i = 19; i >= 0; i--) {
    bytes[i] = Number(n & 0xffn);
    n = n >> 8n;
  }

  const ts = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  const date = new Date((ts + KSUID_EPOCH) * 1000);

  return {
    timestamp: ts + KSUID_EPOCH,
    date: date.toISOString(),
    local: date.toLocaleString(),
    payload: bytesToHex(bytes.slice(4))
  };
}

// MongoDB ObjectId (4-byte timestamp + 5-byte random + 3-byte counter)
let objectIdCounter = randomBytes(3)[0] << 16 | randomBytes(3)[1] << 8 | randomBytes(3)[2];
let objectIdRandom = randomBytes(5);

function generateObjectId(timestampMs = Date.now()) {
  const ts = Math.floor(timestampMs / 1000);
  const bytes = new Uint8Array(12);

  // timestamp (4 bytes, big endian)
  bytes[0] = (ts >> 24) & 0xff;
  bytes[1] = (ts >> 16) & 0xff;
  bytes[2] = (ts >> 8) & 0xff;
  bytes[3] = ts & 0xff;

  // random (5 bytes)
  bytes.set(objectIdRandom, 4);

  // counter (3 bytes, big endian)
  objectIdCounter = (objectIdCounter + 1) & 0xffffff;
  bytes[9] = (objectIdCounter >> 16) & 0xff;
  bytes[10] = (objectIdCounter >> 8) & 0xff;
  bytes[11] = objectIdCounter & 0xff;

  return bytesToHex(bytes);
}

function decodeObjectId(oid) {
  const hex = oid.replace(/-/g, '');
  if (hex.length !== 24) return null;
  const bytes = hexToBytes(hex);

  const ts = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  const date = new Date(ts * 1000);

  return {
    timestamp: ts,
    date: date.toISOString(),
    local: date.toLocaleString(),
    machine: bytesToHex(bytes.slice(4, 9)),
    pid: bytesToHex(bytes.slice(9, 11)),
    counter: bytesToHex(bytes.slice(11, 12))
  };
}

// Format UUID
function formatUUID(hex, format, uppercase) {
  if (uppercase) hex = hex.toUpperCase();

  switch (format) {
    case 'compact':
      return hex;
    case 'standard':
      return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
    case 'urn':
      return `urn:uuid:${formatUUID(hex, 'standard', uppercase)}`;
    case 'braced':
      return `{${formatUUID(hex, 'standard', uppercase)}}`;
    case 'sql':
      return `('${formatUUID(hex, 'standard', uppercase)}')`;
    default:
      return formatUUID(hex, 'standard', uppercase);
  }
}

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

let generatedIds = [];
let currentType = 'uuid4';

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

// Format options for current type
const FORMAT_OPTIONS = {
  uuid4: ['standard', 'compact', 'urn', 'braced', 'sql'],
  uuid7: ['standard', 'compact', 'urn', 'braced'],
  uuid1: ['standard', 'compact', 'urn', 'braced'],
  ulid: ['standard'],
  nanoid: ['standard'],
  ksuid: ['standard'],
  objectid: ['standard']
};

function renderFormatOptions() {
  const grid = document.getElementById('format-grid');
  const options = FORMAT_OPTIONS[currentType] || ['standard'];
  grid.innerHTML = options.map(opt => `
    <label class="format-item ${opt === 'standard' ? 'selected' : ''}" data-format="${opt}">
      <input type="radio" name="format" value="${opt}" ${opt === 'standard' ? 'checked' : ''}>
      <span class="format-label">${opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
    </label>
  `).join('');

  grid.querySelectorAll('.format-item').forEach(item => {
    item.addEventListener('click', () => {
      grid.querySelectorAll('.format-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      item.querySelector('input').checked = true;
    });
  });
}

function getSelectedFormat() {
  const selected = document.querySelector('.format-item.selected');
  return selected ? selected.dataset.format : 'standard';
}

// Generate IDs
async function generateIDs() {
  const count = parseInt(document.getElementById(`${currentType}-count`)?.value) || 10;
  const format = getSelectedFormat();
  const uppercase = document.getElementById(`${currentType}-uppercase`)?.checked || false;

  let ids = [];
  let timestampMs = Date.now();

  // Get timestamp from input if provided
  const tsInput = document.getElementById(`${currentType}-timestamp`);
  if (tsInput && tsInput.value) {
    timestampMs = new Date(tsInput.value).getTime();
  }

  for (let i = 0; i < count; i++) {
    let id;
    switch (currentType) {
      case 'uuid4':
        id = generateUUIDv4();
        break;
      case 'uuid1':
        id = generateUUIDv1();
        break;
      case 'uuid7':
        id = generateUUIDv7(timestampMs);
        break;
      case 'ulid':
        const monotonic = document.getElementById('ulid-monotonic')?.checked || false;
        id = generateULID(timestampMs, monotonic);
        break;
      case 'nanoid':
        const length = parseInt(document.getElementById('nanoid-length')?.value) || 21;
        const alphabet = document.getElementById('nanoid-alphabet')?.value || DEFAULT_ALPHABET;
        id = generateNanoID(length, alphabet);
        break;
      case 'ksuid':
        id = generateKSUID(timestampMs);
        break;
      case 'objectid':
        id = generateObjectId(timestampMs);
        break;
    }
    ids.push(format !== 'standard' && currentType.startsWith('uuid') ? formatUUID(id, format, uppercase) : (uppercase ? id.toUpperCase() : id));
  }

  generatedIds = ids;
  renderResults();
  updateStats();
  showDecodeInfo();
}

function renderResults() {
  const container = document.getElementById('results-content');
  const filterBar = document.getElementById('filter-bar');

  if (generatedIds.length === 0) {
    container.innerHTML = `
      <div class="empty-results">
        <div class="empty-icon">🆔</div>
        <p>Click Generate to create IDs</p>
      </div>
    `;
    filterBar.hidden = true;
    return;
  }

  filterBar.hidden = false;
  container.innerHTML = `
    <div class="ids-list">
      ${generatedIds.map((id, i) => `
        <div class="id-item" data-index="${i}">
          <input type="checkbox" class="id-checkbox" data-index="${i}">
          <span class="id-value" title="Click to copy">${escapeHtml(id)}</span>
          <button class="id-copy" data-index="${i}" title="Copy">📋</button>
        </div>
      `).join('')}
    </div>
  `;

  // Click to copy
  container.querySelectorAll('.id-value').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.parentElement.dataset.index);
      copyText(generatedIds[idx], 'ID');
    });
  });

  container.querySelectorAll('.id-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      copyText(generatedIds[idx], 'ID');
    });
  });

  // Checkboxes
  container.querySelectorAll('.id-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const item = cb.closest('.id-item');
      item.classList.toggle('selected', cb.checked);
      updateSelectAll();
    });
  });

  document.getElementById('filter-select-all').addEventListener('change', (e) => {
    const checked = e.target.checked;
    container.querySelectorAll('.id-checkbox').forEach(cb => {
      cb.checked = checked;
      cb.closest('.id-item').classList.toggle('selected', checked);
    });
  });
}

function updateSelectAll() {
  const checkboxes = document.querySelectorAll('.id-checkbox');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  const someChecked = Array.from(checkboxes).some(cb => cb.checked);
  const selectAll = document.getElementById('filter-select-all');
  selectAll.checked = allChecked;
  selectAll.indeterminate = someChecked && !allChecked;
}

// Filter
document.getElementById('filter-input')?.addEventListener('input', (e) => {
  const filter = e.target.value.toLowerCase();
  document.querySelectorAll('.id-item').forEach(item => {
    const id = item.querySelector('.id-value').textContent.toLowerCase();
    item.style.display = id.includes(filter) ? 'flex' : 'none';
  });
});

function updateStats() {
  document.getElementById('results-stats').textContent = `${generatedIds.length} IDs generated`;
}

function showDecodeInfo() {
  const decodeDiv = document.getElementById(`${currentType}-decode`);
  const displayDiv = document.getElementById(`${currentType}-decoded`);

  if (!decodeDiv || !displayDiv || generatedIds.length === 0) return;

  let decoded;
  switch (currentType) {
    case 'uuid7':
      decoded = decodeUUIDv7(generatedIds[0]);
      break;
    case 'ulid':
      decoded = decodeULID(generatedIds[0]);
      break;
    case 'ksuid':
      decoded = decodeKSUID(generatedIds[0]);
      break;
    case 'objectid':
      decoded = decodeObjectId(generatedIds[0]);
      break;
  }

  if (decoded) {
    decodeDiv.hidden = false;
    displayDiv.innerHTML = Object.entries(decoded).map(([k, v]) => `
      <div class="decode-row">
        <span class="decode-label">${k.charAt(0).toUpperCase() + k.slice(1)}</span>
        <span class="decode-value">${escapeHtml(String(v))}</span>
      </div>
    `).join('');
  } else {
    decodeDiv.hidden = true;
  }

  // NanoID collision probability
  if (currentType === 'nanoid') {
    const collisionDiv = document.getElementById('nanoid-collision');
    const collisionDisplay = document.getElementById('nanoid-collision-display');
    const length = parseInt(document.getElementById('nanoid-length')?.value) || 21;
    const alphabet = document.getElementById('nanoid-alphabet')?.value || DEFAULT_ALPHABET;
    const alphabetSize = new Set(alphabet).size;
    const count = parseInt(document.getElementById('nanoid-count')?.value) || 10;

    collisionDiv.hidden = false;
    const p = nanoIDCollisionProbability(length, alphabetSize, count);
    collisionDisplay.innerHTML = `
      <div class="decode-row"><span class="decode-label">Alphabet Size</span><span class="decode-value">${alphabetSize}</span></div>
      <div class="decode-row"><span class="decode-label">Length</span><span class="decode-value">${length}</span></div>
      <div class="decode-row"><span class="decode-label">Entropy (bits)</span><span class="decode-value">${(length * Math.log2(alphabetSize)).toFixed(1)}</span></div>
      <div class="decode-row"><span class="decode-label">Collision Probability (${count} IDs)</span><span class="decode-value">${p === 0 ? '~0' : p.toExponential(2)}</span></div>
      <div class="decode-row"><span class="decode-label">Safe for</span><span class="decode-value">${p < 1e-9 ? '✓ Production' : p < 1e-6 ? '⚠ Low volume' : '✗ Testing only'}</span></div>
    `;
  } else {
    document.getElementById('nanoid-collision')?.hidden = true;
  }
}

function copyAll() {
  if (generatedIds.length === 0) {
    showToast('No IDs to copy');
    return;
  }
  copyText(generatedIds.join('\n'), 'All IDs');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadTXT() {
  if (generatedIds.length === 0) return;
  downloadFile(generatedIds.join('\n'), `ids-${currentType}.txt`, 'text/plain');
  showToast('Downloaded .txt');
}

function downloadJSON() {
  if (generatedIds.length === 0) return;
  downloadFile(JSON.stringify(generatedIds, null, 2), `ids-${currentType}.json`, 'application/json');
  showToast('Downloaded .json');
}

function downloadCSV() {
  if (generatedIds.length === 0) return;
  const csv = 'index,id\n' + generatedIds.map((id, i) => `${i},${id}`).join('\n');
  downloadFile(csv, `ids-${currentType}.csv`, 'text/csv');
  showToast('Downloaded .csv');
}

function clearAll() {
  generatedIds = [];
  document.getElementById(`${currentType}-count`).value = 10;
  const tsInput = document.getElementById(`${currentType}-timestamp`);
  if (tsInput) tsInput.value = '';
  const nanoidAlphabet = document.getElementById('nanoid-alphabet');
  if (nanoidAlphabet) nanoidAlphabet.value = '';
  renderResults();
  document.getElementById('results-stats').textContent = '';
  document.getElementById('filter-bar').hidden = true;
  showDecodeInfo();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

function copyText(text, label) {
  return navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} copied!`);
  }).catch(() => {
    showToast('Failed to copy');
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  renderFormatOptions();

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
      document.getElementById(`panel-${btn.dataset.type}`).hidden = false;

      currentType = btn.dataset.type;
      renderFormatOptions();
      clearAll();
    });
  });

  // Generate button
  document.getElementById('btn-generate').addEventListener('click', generateIDs);

  // Clear button
  document.getElementById('btn-clear').addEventListener('click', clearAll);

  // Download buttons
  document.getElementById('btn-copy-all').addEventListener('click', copyAll);
  document.getElementById('btn-download-txt').addEventListener('click', downloadTXT);
  document.getElementById('btn-download-json').addEventListener('click', downloadJSON);
  document.getElementById('btn-download-csv').addEventListener('click', downloadCSV);

  // Timestamp input changes -> update decode preview
  ['uuid7', 'ulid', 'ksuid', 'objectid'].forEach(type => {
    const input = document.getElementById(`${type}-timestamp`);
    if (input) {
      input.addEventListener('change', () => {
        if (currentType === type && generatedIds.length > 0) {
          showDecodeInfo();
        }
      });
    }
  });

  // NanoID inputs -> update collision
  ['nanoid-length', 'nanoid-alphabet', 'nanoid-count'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      if (currentType === 'nanoid') showDecodeInfo();
    });
  });

  // Format radio changes
  document.getElementById('format-grid')?.addEventListener('change', () => {
    if (generatedIds.length > 0) renderResults();
  });

  // Initial decode info
  showDecodeInfo();
});