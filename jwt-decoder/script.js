// JWT Decoder & Validator - Client-side JWT inspection and verification

// Sample JWTs for demo
const SAMPLE_JWTS = {
  hs256: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  rs256: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.cTh5q9vZGzF8K7J6L5M4N3O2P1Q0R9S8T7U6V5W4X3Y2Z1',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.ExpiredSignature',
  none: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.'
};

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

// Base64URL decode
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  try {
    return decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
  } catch {
    return atob(base64);
  }
}

// Parse JWT
function parseJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: expected 3 parts separated by dots');
  }
  const [headerB64, payloadB64, signatureB64] = parts;
  let header, payload;
  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch (e) {
    throw new Error('Invalid base64url encoding in header or payload');
  }
  const signature = base64UrlToBytes(signatureB64);
  return { header, payload, signature, raw: { headerB64, payloadB64, signatureB64 } };
}

function base64UrlToBytes(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Format JSON with syntax highlighting
function formatJSON(obj, indent = 2) {
  const json = JSON.stringify(obj, null, indent);
  return json
    .replace(/(".*?"):/g, '<span class="key">$1</span>:')
    .replace(/: (".*?")/g, ': <span class="string">$1</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="boolean">$1</span>')
    .replace(/: null/g, ': <span class="null">null</span>');
}

// Humanize timestamp
function humanizeTimestamp(ts) {
  if (!ts || typeof ts !== 'number') return '—';
  const date = new Date(ts * 1000);
  const now = Date.now();
  const diff = date.getTime() - now;
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / 86400000);
  const hours = Math.floor((absDiff % 86400000) / 3600000);
  const mins = Math.floor((absDiff % 3600000) / 60000);
  let relative = '';
  if (diff < 0) {
    if (days > 0) relative = `${days}d ${hours}h ago`;
    else if (hours > 0) relative = `${hours}h ${mins}m ago`;
    else relative = `${mins}m ago`;
  } else {
    if (days > 0) relative = `in ${days}d ${hours}h`;
    else if (hours > 0) relative = `in ${hours}h ${mins}m`;
    else relative = `in ${mins}m`;
  }
  return `${date.toLocaleString()} (${relative})`;
}

// Check expiry status
function checkExpiry(payload) {
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp) {
    const diff = payload.exp - now;
    if (diff < 0) return { status: 'expired', label: 'Expired', diff };
    if (diff < 300) return { status: 'expiring', label: 'Expiring Soon', diff };
    return { status: 'valid', label: 'Valid', diff };
  }
  if (payload.nbf) {
    if (payload.nbf > now) return { status: 'not-yet', label: 'Not Yet Valid', diff: payload.nbf - now };
  }
  return { status: 'no-exp', label: 'No Expiry', diff: null };
}

// Import key for Web Crypto
async function importKey(algo, keyInput) {
  const isPEM = keyInput.includes('-----BEGIN');
  let keyData, format, algorithm, usages;

  if (algo.startsWith('HS')) {
    // HMAC - secret key
    const enc = new TextEncoder();
    keyData = enc.encode(keyInput);
    format = 'raw';
    algorithm = { name: 'HMAC', hash: { name: 'SHA-' + algo.slice(2) } };
    usages = ['verify'];
  } else if (algo.startsWith('RS') || algo.startsWith('PS')) {
    // RSA
    if (!isPEM) throw new Error('RSA/PS algorithms require PEM public key');
    const pem = keyInput;
    const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    keyData = binary.buffer;
    format = 'spki';
    algorithm = {
      name: algo.startsWith('RS') ? 'RSASSA-PKCS1-v1_5' : 'RSA-PSS',
      hash: { name: 'SHA-' + algo.slice(2) }
    };
    usages = ['verify'];
  } else if (algo.startsWith('ES')) {
    // ECDSA
    if (!isPEM) throw new Error('ES algorithms require PEM public key');
    const pem = keyInput;
    const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    keyData = binary.buffer;
    format = 'spki';
    const curve = { 'ES256': 'P-256', 'ES384': 'P-384', 'ES512': 'P-521' }[algo];
    algorithm = { name: 'ECDSA', namedCurve: curve, hash: { name: 'SHA-' + algo.slice(2) } };
    usages = ['verify'];
  } else {
    throw new Error('Unsupported algorithm: ' + algo);
  }

  return crypto.subtle.importKey(format, keyData, algorithm, false, usages);
}

// Verify signature
async function verifySignature(token, algo, keyInput) {
  const parts = token.split('.');
  const signingInput = parts[0] + '.' + parts[1];
  const signature = base64UrlToBytes(parts[2]);

  if (algo === 'none') {
    return { valid: true, message: 'Algorithm "none" - no verification performed' };
  }

  try {
    const key = await importKey(algo, keyInput);
    const enc = new TextEncoder();
    const data = enc.encode(signingInput);

    let valid;
    if (algo.startsWith('PS')) {
      valid = await crypto.subtle.verify(
        { name: 'RSA-PSS', saltLength: 32 },
        key,
        signature,
        data
      );
    } else {
      valid = await crypto.subtle.verify(
        { name: algo.startsWith('RS') ? 'RSASSA-PKCS1-v1_5' : algo.startsWith('ES') ? 'ECDSA' : 'HMAC' },
        key,
        signature,
        data
      );
    }

    return { valid, message: valid ? 'Signature is VALID' : 'Signature is INVALID' };
  } catch (e) {
    return { valid: false, message: 'Verification failed: ' + e.message };
  }
}

// Auto-detect algorithm from header
function detectAlgorithm(header) {
  return header.alg || 'HS256';
}

// Show toast
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

// Copy to clipboard
async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied!`);
  } catch {
    showToast('Failed to copy');
  }
}

// Main decode function
async function decodeJWT() {
  const input = document.getElementById('jwt-input').value.trim();
  const secretInput = document.getElementById('secret-input').value.trim();
  let algoSelect = document.getElementById('algo-select').value;

  if (!input) {
    showToast('Please paste a JWT token');
    return;
  }

  // Hide all states
  document.getElementById('empty-state').hidden = true;
  document.getElementById('error-state').hidden = true;
  document.getElementById('token-parts').hidden = true;
  document.getElementById('claims-panel').hidden = true;
  document.getElementById('verification-panel').hidden = true;
  document.getElementById('status-bar').hidden = true;

  try {
    const parsed = parseJWT(input);
    const { header, payload, signature, raw } = parsed;

    // Auto-detect algorithm
    if (algoSelect === 'auto') {
      algoSelect = detectAlgorithm(header);
      document.getElementById('algo-select').value = algoSelect;
    }

    // Show token parts
    document.getElementById('token-parts').hidden = false;
    document.getElementById('header-view').innerHTML = formatJSON(header);
    document.getElementById('payload-view').innerHTML = formatJSON(payload);
    document.getElementById('signature-view').textContent = bytesToHex(signature).toUpperCase();

    // Status bar
    const expiry = checkExpiry(payload);
    const statusBar = document.getElementById('status-bar');
    const statusBadge = document.getElementById('status-badge');
    const statusText = document.getElementById('status-text');
    statusBar.hidden = false;
    statusBadge.textContent = expiry.label;
    statusBadge.className = 'status-badge ' + expiry.status;
    statusText.textContent = expiry.diff !== null
      ? `Algorithm: ${header.alg || 'none'} • ${expiry.label}${expiry.diff !== null ? ' (' + humanizeTimestamp(payload.exp) + ')' : ''}`
      : `Algorithm: ${header.alg || 'none'} • ${expiry.label}`;

    // Claims panel
    document.getElementById('claims-panel').hidden = false;
    renderClaims(payload, expiry);

    // Verification
    if (secretInput || algoSelect === 'none') {
      document.getElementById('verification-panel').hidden = false;
      const result = await verifySignature(input, algoSelect, secretInput);
      const vr = document.getElementById('verification-result');
      vr.className = 'verification-result ' + (result.valid ? 'success' : 'error');
      vr.textContent = result.message;
    } else {
      document.getElementById('verification-panel').hidden = false;
      const vr = document.getElementById('verification-result');
      vr.className = 'verification-result info';
      vr.textContent = 'Enter secret/public key to verify signature';
    }

    // Store for copy buttons
    window.lastParsed = { header, payload, signature: bytesToHex(signature) };

  } catch (e) {
    document.getElementById('error-state').hidden = false;
    document.getElementById('error-message').textContent = e.message;
  }
}

function renderClaims(payload, expiry) {
  const grid = document.getElementById('claims-grid');
  const claims = [
    { key: 'iss', label: 'Issuer (iss)', value: payload.iss },
    { key: 'sub', label: 'Subject (sub)', value: payload.sub },
    { key: 'aud', label: 'Audience (aud)', value: payload.aud },
    { key: 'exp', label: 'Expiration (exp)', value: payload.exp ? humanizeTimestamp(payload.exp) : '—', status: expiry.status },
    { key: 'nbf', label: 'Not Before (nbf)', value: payload.nbf ? humanizeTimestamp(payload.nbf) : '—' },
    { key: 'iat', label: 'Issued At (iat)', value: payload.iat ? humanizeTimestamp(payload.iat) : '—' },
    { key: 'jti', label: 'JWT ID (jti)', value: payload.jti },
  ];

  grid.innerHTML = claims.filter(c => c.value !== '—' && c.value !== undefined).map(c => `
    <div class="claim-item">
      <div class="claim-label">${c.label}</div>
      <div class="claim-value ${c.status || ''}">${escapeHtml(String(c.value))}</div>
    </div>
  `).join('');
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
document.getElementById('btn-decode').addEventListener('click', decodeJWT);

document.getElementById('btn-clear').addEventListener('click', () => {
  document.getElementById('jwt-input').value = '';
  document.getElementById('secret-input').value = '';
  document.getElementById('algo-select').value = 'auto';
  document.getElementById('empty-state').hidden = false;
  document.getElementById('error-state').hidden = true;
  document.getElementById('token-parts').hidden = true;
  document.getElementById('claims-panel').hidden = true;
  document.getElementById('verification-panel').hidden = true;
  document.getElementById('status-bar').hidden = true;
});

document.getElementById('btn-sample').addEventListener('click', () => {
  document.getElementById('jwt-input').value = SAMPLE_JWTS.hs256;
  document.getElementById('secret-input').value = 'secret';
  document.getElementById('algo-select').value = 'HS256';
  decodeJWT();
});

// Copy buttons
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.copy;
    const data = window.lastParsed;
    if (!data) return;
    if (target === 'header') copyText(JSON.stringify(data.header, null, 2), 'Header');
    if (target === 'payload') copyText(JSON.stringify(data.payload, null, 2), 'Payload');
    if (target === 'signature') copyText(data.signature, 'Signature');
  });
});

// Enter key in textarea = decode (Ctrl+Enter)
document.getElementById('jwt-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    decodeJWT();
  }
});

// Paste handling
document.getElementById('jwt-input').addEventListener('paste', () => {
  setTimeout(decodeJWT, 10);
});

// Initial focus
document.getElementById('jwt-input').focus();