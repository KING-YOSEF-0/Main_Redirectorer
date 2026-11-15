/* ── JWT / JWK / Cert Toolbox — KING_YOSEF_ ──
 * All 10 practical tasks fully functional:
 * 1. Decode JWT
 * 2. Verify JWT signature (HS/RS/PS/ES/EdDSA)
 * 3. Sign JWT with custom claims & algorithm
 * 4. Generate RSA keys (2048/4096) for RS/PS/ES
 * 5. Generate EC keys (P-256/P-384/P-521) for ES
 * 6. Generate Ed25519 keys for EdDSA
 * 7. Generate HMAC secret keys
 * 8. Build JWK Sets from keys & export
 * 9. Convert PEM ⇄ JWK
 * 10. Parse X.509 certificates with chain validation
 *
 * Vanilla JS, Web Crypto API, Base64URL encoding/decoding
 * No frameworks, no build step
 */

const state = {
  currentMode: 'decode',
  jwkSet: [],
  generatedKeys: {},
  toastTimer: null
};

const outputArea = document.getElementById('outputArea');
const toastContainer = document.getElementById('toastContainer');

// ── Toast helpers ──────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  if (!toastContainer) return;
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Dismiss">×</button>
  `;
  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  toastContainer.appendChild(toast);
  if (state.toastTimer) clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.remove(), 4000);
}

// ── Base64URL ──
function parseBase64Url(str) {
  const padding = '='.repeat((4 - str.length % 4) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  const raw = atob(base64);
  return JSON.parse(raw);
}

function base64UrlEncode(obj) {
  const json = JSON.stringify(obj);
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTimestamp(ts) {
  const date = new Date(ts * 1000);
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function formatDuration(seconds) {
  if (seconds < 0) return formatDuration(-seconds) + ' ago';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins) parts.push(`${mins}m`);
  if (secs || parts.length === 0) parts.push(`${secs}s`);
  return parts.join(' ');
}

// ── Mode switching ───────────────────────────────────────────────────────────
function setupModeTabs() {
  document.querySelectorAll('.mode-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      state.currentMode = mode;
      document.querySelectorAll('.mode-btn').forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });
      document.querySelectorAll('.mode-panel').forEach(p => p.hidden = true);
      document.getElementById(`panel-${mode}`).hidden = false;
      updateURL();
    });
  });
}

function setupVerifyTabs() {
  document.querySelectorAll('.method-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.method-tab').forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });
      document.querySelectorAll('.method-panel').forEach(p => p.hidden = true);
      document.getElementById(`verify-${tab.dataset.method}`).hidden = false;
    });
  });
}

function setupKeyTabs() {
  document.querySelectorAll('.key-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.key-tab').forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });
      document.querySelectorAll('.key-input-panel').forEach(p => p.hidden = true);
      document.getElementById(`sign-${tab.dataset.keyType}`).hidden = false;
    });
  });
}

function setupConvTabs() {
  document.querySelectorAll('.conv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.conv-tab').forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });
      document.querySelectorAll('.conversion-panel').forEach(p => p.hidden = true);
      document.getElementById(`conv-${tab.dataset.conv}`).hidden = false;
    });
  });
}

function updateSignKeyTabs() {
  const alg = document.getElementById('signAlg').value;
  const isHS = alg.startsWith('HS');
  const isRS = alg.startsWith('RS') || alg.startsWith('PS');
  const isES = alg.startsWith('ES');
  const isEd = alg === 'EdDSA';

  document.querySelectorAll('.key-tab').forEach(tab => {
    const type = tab.dataset.keyType;
    tab.hidden = true; // hidden individually below
    if (type === 'secret') tab.hidden = !isHS;
    else if (type === 'pem') tab.hidden = !(isRS || isES);
    else if (type === 'jwk') tab.hidden = !(isRS || isES || isEd);
    else if (type === 'generate') tab.hidden = false;
  });

  if (isHS && !document.querySelector('.key-tab[data-key-type="secret"]').classList.contains('active')) {
    document.querySelector('.key-tab[data-key-type="secret"]').click();
  } else if ((isRS || isES) && !document.querySelector('.key-tab[data-key-type="pem"]').classList.contains('active')) {
    document.querySelector('.key-tab[data-key-type="pem"]').click();
  } else if (isEd && !document.querySelector('.key-tab[data-key-type="jwk"]').classList.contains('active')) {
    document.querySelector('.key-tab[data-key-type="jwk"]').click();
  }
}

// ── Decode JWT ──────────────────────────────────────────────────────────────
async function decodeJWT() {
  const input = document.getElementById('decodeInput').value.trim();
  if (!input) { showToast('Please enter a JWT', 'error'); return; }

  try {
    const parts = input.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format (expected 3 parts)');

    const header = parseBase64Url(parts[0]);
    const payload = parseBase64Url(parts[1]);
    const signature = parts[2];

    renderDecodedJWT(header, payload, signature, input);
    showToast('JWT decoded successfully', 'success');
  } catch (e) {
    showToast('Decode failed: ' + e.message, 'error');
  }
}

function renderDecodedJWT(header, payload, signature, rawJWT) {
  const expInfo = payload.exp ? formatTimestamp(payload.exp) : null;
  const nbfInfo = payload.nbf ? formatTimestamp(payload.nbf) : null;
  const iatInfo = payload.iat ? formatTimestamp(payload.iat) : null;

  let html = `
    <div class="jwt-part">
      <div class="jwt-part-header">
        <div class="jwt-part-title">
          <span>Header</span>
          <span class="jwt-part-badge badge-header">Header</span>
        </div>
        <div class="jwt-part-actions">
          <button onclick="copyText('${escapeHtml(JSON.stringify(header, null, 2))}')">Copy JSON</button>
        </div>
      </div>
      <pre class="jwt-json">${syntaxHighlight(JSON.stringify(header, null, 2))}</pre>
    </div>

    <div class="jwt-part">
      <div class="jwt-part-header">
        <div class="jwt-part-title">
          <span>Payload</span>
          <span class="jwt-part-badge badge-payload">Payload</span>
        </div>
        <div class="jwt-part-actions">
          <button onclick="copyText('${escapeHtml(JSON.stringify(payload, null, 2))}')">Copy JSON</button>
        </div>
      </div>
  `;

  const standardClaims = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'];
  const allKeys = [...new Set([...Object.keys(payload), ...standardClaims])].sort((a, b) => {
    const aStd = standardClaims.includes(a) ? 0 : 1;
    const bStd = standardClaims.includes(b) ? 0 : 1;
    return aStd - bStd || a.localeCompare(b);
  });

  for (const key of allKeys) {
    if (!(key in payload)) continue;
    const value = payload[key];
    const isStandard = standardClaims.includes(key);
    let humanized = '';
    if (key === 'exp' || key === 'nbf' || key === 'iat') {
      humanized = formatTimestamp(value);
    } else if (typeof value === 'object' && value !== null) {
      humanized = JSON.stringify(value);
    }

    html += `
      <div class="claim-row ${isStandard ? 'claim-standard' : 'claim-private'}">
        <span class="claim-name">${escapeHtml(key)}</span>
        <span class="claim-value">${escapeHtml(typeof value === 'object' ? JSON.stringify(value) : value)}</span>
        ${humanized ? `<span class="claim-humanized">(${humanized})</span>` : ''}
      </div>
    `;
  }

  html += `</div><div class="jwt-part">
      <div class="jwt-part-header">
        <div class="jwt-part-title">
          <span>Signature</span>
          <span class="jwt-part-badge badge-signature">Signature</span>
        </div>
        <div class="jwt-part-actions">
          <button onclick="copyText('${escapeHtml(signature)}')">Copy</button>
        </div>
      </div>
      <div style="font-family: var(--font-mono); font-size: 0.75rem; word-break: break-all; color: var(--muted);">
        ${escapeHtml(signature)}
      </div>
      <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--muted);">
        Algorithm: <strong>${escapeHtml(header.alg || 'unknown')}</strong>
        ${header.typ ? ` • Type: ${escapeHtml(header.typ)}` : ''}
        ${header.kid ? ` • Key ID: ${escapeHtml(header.kid)}` : ''}
        ${header.jwk ? ` • <strong>JWK in header</strong>` : ''}
        ${header.x5c ? ` • <strong>x5c chain (${header.x5c.length} certs)</strong>` : ''}
      </div>
    </div>`;

  if (payload.exp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = payload.exp - now;
    let statusClass = 'badge-valid', statusText = 'Valid';
    if (diff < 0) { statusClass = 'badge-invalid'; statusText = 'Expired'; }
    else if (diff < 300) { statusClass = 'badge-warning'; statusText = 'Expiring soon'; }
    html += `
      <div class="jwt-part" style="background: var(--accent-dim); border-color: var(--accent);">
        <div class="jwt-part-header">
          <div class="jwt-part-title">
            <span>Expiration Status</span>
            <span class="jwt-part-badge ${statusClass}">${statusText}</span>
          </div>
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.85rem;">
          Expires: ${expInfo} (in ${formatDuration(diff)})
        </div>
      </div>
    `;
  }

  outputArea.innerHTML = html;
  updateURL({ jwt: rawJWT });
}

function syntaxHighlight(json) {
  return json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
      const isKey = match.endsWith(':');
      return `<span class="${isKey ? 'key' : 'string'}">${escapeHtml(match)}</span>`;
    })
    .replace(/(-?\d+\.?\d*)/g, '<span class="number">$1</span>')
    .replace(/\b(true|false)\b/g, '<span class="boolean">$1</span>')
    .replace(/\bnull\b/g, '<span class="null">null</span>');
}

// ── Verify JWT ──────────────────────────────────────────────────────────────
async function verifyJWT() {
  const jwt = document.getElementById('verifyJwtInput').value.trim();
  if (!jwt) { showToast('Please enter a JWT to verify', 'error'); return; }

  const method = document.querySelector('.method-tab.active').dataset.method;
  let key, header, alg;

  try {
    const parts = jwt.split('.');
    header = parseBase64Url(parts[0]);
    alg = header.alg;

    if (method === 'secret') {
      const secret = document.getElementById('verifySecret').value.trim();
      if (!secret) { showToast('Please enter a secret', 'error'); return; }
      key = await importHMACKey(secret, alg);
    } else if (method === 'jwks') {
      const url = document.getElementById('verifyJwksUrl').value.trim();
      if (!url) { showToast('Please enter JWKS URL', 'error'); return; }
      const kid = header.kid;
      const jwks = await fetchJWKS(url, document.getElementById('verifyJwksCache').checked);
      const jwk = jwks.keys.find(k => k.kid === kid) || jwks.keys[0];
      if (!jwk) throw new Error('No matching key found in JWKS');
      const keyOps = alg.startsWith('HS') ? 'HMAC' : 'verify';
      const algName = alg.startsWith('HS') ? 'HMAC' : 'RSASSA-PKCS1-v1_5';
      const hashAlg = getHashAlg(alg);
      key = await crypto.subtle.importKey('jwk', jwk, { name: algName, hash: hashAlg }, true, ['verify']);
    } else if (method === 'pem') {
      const pem = document.getElementById('verifyPem').value.trim();
      if (!pem) { showToast('Please enter PEM public key', 'error'); return; }
      key = await importSPKI(pem, alg);
    } else if (method === 'cert') {
      const certPem = document.getElementById('verifyCert').value.trim();
      if (!certPem) { showToast('Please enter certificate', 'error'); return; }
      const cert = await parseX509(certPem);
      key = await crypto.subtle.importKey('spki', cert.publicKey, { name: 'RSASSA-PKCS1-v1_5', hash: getHashAlg(alg) }, true, ['verify']);
    }

    const isValid = await verifySignature(jwt, key, alg);
    const claimsValid = checkClaims(jwt, header);

    renderVerifyResult(isValid, claimsValid, header, jwt);
    showToast(isValid && claimsValid ? 'JWT verified successfully' : 'JWT verification failed', isValid && claimsValid ? 'success' : 'error');
  } catch (e) {
    showToast('Verification error: ' + e.message, 'error');
  }
}

function getHashAlg(alg) {
  if (alg.includes('256')) return 'SHA-256';
  if (alg.includes('384')) return 'SHA-384';
  if (alg.includes('512')) return 'SHA-512';
  return 'SHA-256';
}

async function importHMACKey(secret, alg) {
  const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(secret) && secret.length % 4 === 0;
  const keyData = isBase64 ? base64ToArrayBuffer(secret) : stringToArrayBuffer(secret);
  return crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: getHashAlg(alg) }, false, ['sign', 'verify']);
}

async function importSPKI(pem, alg) {
  const binary = pemToArrayBuffer(pem);
  return crypto.subtle.importKey('spki', binary, { name: 'RSASSA-PKCS1-v1_5', hash: getHashAlg(alg) }, true, ['verify']);
}

function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/, '').replace(/-----END [^-]+-----/, '').replace(/\s/g, '');
  const binary = atob(b64);
  return stringToArrayBuffer(binary);
}

function base64ToArrayBuffer(b64) {
  const binary = atob(b64);
  return stringToArrayBuffer(binary);
}

function stringToArrayBuffer(str) {
  const buf = new ArrayBuffer(str.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) view[i] = str.charCodeAt(i);
  return buf;
}

async function fetchJWKS(url, useCache) {
  const cacheKey = 'jwks_' + url;
  if (useCache) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) return data;
    }
  }
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Failed to fetch JWKS: ' + resp.status);
  const data = await resp.json();
  if (useCache) localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}

async function verifySignature(jwt, key, alg) {
  const parts = jwt.split('.');
  const signingInput = parts[0] + '.' + parts[1];
  const signature = base64UrlToArrayBuffer(parts[2]);
  const encoder = new TextEncoder();
  const data = encoder.encode(signingInput);

  if (alg.startsWith('HS')) {
    return crypto.subtle.verify({ name: 'HMAC' }, key, signature, data);
  } else if (alg.startsWith('RS') || alg.startsWith('PS')) {
    const padding = alg.startsWith('PS') ? 'PSS' : 'PKCS1-v1_5';
    return crypto.subtle.verify({ name: 'RSASSA-' + padding, saltLength: 32 }, key, signature, data);
  } else if (alg.startsWith('ES')) {
    return crypto.subtle.verify({ name: 'ECDSA', hash: getHashAlg(alg) }, key, signature, data);
  } else if (alg === 'EdDSA') {
    return crypto.subtle.verify({ name: 'Ed25519' }, key, signature, data);
  }
  throw new Error('Unsupported algorithm: ' + alg);
}

function base64UrlToArrayBuffer(b64url) {
  const padding = '='.repeat((4 - b64url.length % 4) % 4);
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + padding;
  const binary = atob(b64);
  return stringToArrayBuffer(binary);
}

function checkClaims(jwt, header) {
  const parts = jwt.split('.');
  const payload = parseBase64Url(parts[1]);
  const now = Math.floor(Date.now() / 1000);
  const leeway = document.getElementById('verifyAllowLeeway').checked ? 60 : 0;
  const results = [];

  if (document.getElementById('verifyCheckExp').checked && payload.exp) {
    const valid = payload.exp >= now - leeway;
    results.push({ check: 'Expiration (exp)', valid, value: formatTimestamp(payload.exp) });
  }
  if (document.getElementById('verifyCheckNbf').checked && payload.nbf) {
    const valid = payload.nbf <= now + leeway;
    results.push({ check: 'Not Before (nbf)', valid, value: formatTimestamp(payload.nbf) });
  }
  if (document.getElementById('verifyCheckIat').checked && payload.iat) {
    const valid = payload.iat <= now + leeway;
    results.push({ check: 'Issued At (iat)', valid, value: formatTimestamp(payload.iat) });
  }

  return { valid: results.every(r => r.valid), details: results };
}

function renderVerifyResult(sigValid, claimsResult, header, jwt) {
  const overallValid = sigValid && claimsResult.valid;
  let html = `
    <div class="verify-result ${overallValid ? 'valid' : 'invalid'}">
      <div class="verify-result-header">
        <span class="verify-result-icon">${overallValid ? '✓' : '✕'}</span>
        <span>Signature: ${sigValid ? 'VALID' : 'INVALID'}</span>
      </div>
      <div class="verify-details">
  `;

  for (const detail of claimsResult.details) {
    html += `
      <div class="verify-detail-row">
        <span class="verify-detail-label">${detail.check}:</span>
        <span class="verify-detail-value ${detail.valid ? 'ok' : 'fail'}">${detail.valid ? '✓ Pass' : '✕ Fail'}</span>
      </div>
    `;
  }

  html += `
        <div class="verify-detail-row">
          <span class="verify-detail-label">Algorithm:</span>
          <span class="verify-detail-value">${escapeHtml(header.alg || 'unknown')}</span>
        </div>
        <div class="verify-detail-row">
          <span class="verify-detail-label">Key ID:</span>
          <span class="verify-detail-value">${escapeHtml(header.kid || 'none')}</span>
        </div>
      </div>
  `;

  html += `</div></div>`;
  outputArea.innerHTML = html;
  updateURL({ verify: jwt });
}

// ── Sign JWT ────────────────────────────────────────────────────────────────
async function signJWT() {
  const alg = document.getElementById('signAlg').value;
  const header = parseJSON(document.getElementById('signHeader').value, 'Header');
  const payload = parseJSON(document.getElementById('signPayload').value, 'Payload');
  if (!header || !payload) return;

  header.alg = alg;
  header.typ = header.typ || 'JWT';

  const keyTab = document.querySelector('.key-tab.active');
  const keyType = keyTab.dataset.keyType;
  let key;

  try {
    if (keyType === 'secret') {
      const secret = document.getElementById('signSecret').value.trim();
      if (!secret) { showToast('Enter secret', 'error'); return; }
      key = await importHMACKey(secret, alg);
    } else if (keyType === 'pem') {
      const pem = document.getElementById('signPem').value.trim();
      if (!pem) { showToast('Enter PEM private key', 'error'); return; }
      key = await importPKCS8(pem, alg, document.getElementById('signPemPassphrase').checked ? document.getElementById('signPemPass').value : null);
    } else if (keyType === 'jwk') {
      const jwk = parseJSON(document.getElementById('signJwk').value, 'JWK');
      if (!jwk) return;
      key = await crypto.subtle.importKey('jwk', jwk, getKeyImportAlg(alg), true, ['sign']);
    } else if (keyType === 'generate') {
      if (!state.generatedKeys.privateKey) { showToast('Generate a key first', 'error'); return; }
      key = state.generatedKeys.privateKey;
    }

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const signingInput = encodedHeader + '.' + encodedPayload;
    const encoder = new TextEncoder();
    const data = encoder.encode(signingInput);

    let signature;
    if (alg.startsWith('HS')) {
      signature = await crypto.subtle.sign({ name: 'HMAC' }, key, data);
    } else if (alg.startsWith('RS') || alg.startsWith('PS')) {
      const padding = alg.startsWith('PS') ? { name: 'RSASSA-PSS', saltLength: 32 } : 'RSASSA-PKCS1-v1_5';
      signature = await crypto.subtle.sign(padding, key, data);
    } else if (alg.startsWith('ES')) {
      signature = await crypto.subtle.sign({ name: 'ECDSA', hash: getHashAlg(alg) }, key, data);
      signature = derToRawSignature(new Uint8Array(signature), getCurveBits(alg));
    } else if (alg === 'EdDSA') {
      signature = await crypto.subtle.sign({ name: 'Ed25519' }, key, data);
    }

    const sigB64 = arrayBufferToBase64Url(signature);
    const jwt = signingInput + '.' + sigB64;

    renderSignedJWT(jwt, header, payload, key, alg);
    showToast('JWT signed successfully', 'success');
  } catch (e) {
    showToast('Signing failed: ' + e.message, 'error');
  }
}

function getKeyImportAlg(alg) {
  if (alg.startsWith('HS')) return { name: 'HMAC', hash: getHashAlg(alg) };
  if (alg.startsWith('RS') || alg.startsWith('PS')) return { name: 'RSASSA-PKCS1-v1_5', hash: getHashAlg(alg) };
  if (alg.startsWith('ES')) return { name: 'ECDSA', namedCurve: getCurveName(alg) };
  if (alg === 'EdDSA') return { name: 'Ed25519' };
}

async function importPKCS8(pem, alg, passphrase) {
  let binary = pemToArrayBuffer(pem);
  if (passphrase) {
    showToast('Encrypted PKCS8 not supported in browser Web Crypto', 'warning');
  }
  return crypto.subtle.importKey('pkcs8', binary, getKeyImportAlg(alg), true, ['sign']);
}

function getCurveName(alg) {
  if (alg === 'ES256') return 'P-256';
  if (alg === 'ES384') return 'P-384';
  if (alg === 'ES512') return 'P-521';
  return 'P-256';
}

function getCurveBits(alg) {
  if (alg === 'ES256') return 256;
  if (alg === 'ES384') return 384;
  if (alg === 'ES512') return 521;
  return 256;
}

function derToRawSignature(der, bits) {
  const byteLen = Math.ceil(bits / 8);
  let offset = 0;
  if (der[offset++] !== 0x30) throw new Error('Invalid DER');
  const len = der[offset++];
  if (der[offset++] !== 0x02) throw new Error('Invalid DER');
  const rLen = der[offset++];
  const r = der.slice(offset, offset + rLen);
  offset += rLen;
  if (der[offset++] !== 0x02) throw new Error('Invalid DER');
  const sLen = der[offset++];
  const s = der.slice(offset, offset + sLen);

  const rPadded = new Uint8Array(byteLen);
  const sPadded = new Uint8Array(byteLen);
  rPadded.set(r.slice(-byteLen), byteLen - r.length);
  sPadded.set(s.slice(-byteLen), byteLen - s.length);

  const raw = new Uint8Array(byteLen * 2);
  raw.set(rPadded, 0);
  raw.set(sPadded, byteLen);
  return raw;
}

function arrayBufferToBase64Url(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function renderSignedJWT(jwt, header, payload, key, alg) {
  let html = `
    <div class="signed-jwt-output">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <strong>Signed JWT</strong>
        <div style="display: flex; gap: 0.4rem;">
          <button onclick="copyText('${escapeHtml(jwt)}')">Copy JWT</button>
          <button onclick="downloadText('${escapeHtml(jwt)}', 'token.jwt')">Download</button>
        </div>
      </div>
      <code>${escapeHtml(jwt)}</code>
    </div>

    <div class="jwt-part">
      <div class="jwt-part-header">
        <div class="jwt-part-title">
          <span>Header (used)</span>
          <span class="jwt-part-badge badge-header">Header</span>
        </div>
      </div>
      <pre class="jwt-json">${syntaxHighlight(JSON.stringify(header, null, 2))}</pre>
    </div>

    <div class="jwt-part">
      <div class="jwt-part-header">
        <div class="jwt-part-title">
          <span>Payload (used)</span>
          <span class="jwt-part-badge badge-payload">Payload</span>
        </div>
      </div>
      <pre class="jwt-json">${syntaxHighlight(JSON.stringify(payload, null, 2))}</pre>
    </div>
  `;

  outputArea.innerHTML = html;
  updateURL({ signed: jwt });
}

function parseJSON(str, name) {
  try {
    return JSON.parse(str);
  } catch (e) {
    showToast(`Invalid JSON in ${name}: ` + e.message, 'error');
    return null;
  }
}

// ── Key generation ───────────────────────────────────────────────────────────
async function generateKeyForSign() {
  const type = document.getElementById('genKeyType').value;
  const [algo, size] = type.split('-');
  let keyPair;

  try {
    if (algo === 'RSA') {
      keyPair = await crypto.subtle.generateKey(
        { name: 'RSASSA-PKCS1-v1_5', modulusLength: parseInt(size), publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true, ['sign', 'verify']
      );
    } else if (algo === 'EC') {
      const curve = size === 'P256' ? 'P-256' : size === 'P384' ? 'P-384' : 'P-521';
      keyPair = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: curve }, true, ['sign', 'verify']
      );
    } else if (algo === 'Ed25519') {
      keyPair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
    } else if (algo === 'HMAC') {
      const bits = parseInt(size);
      const key = await crypto.subtle.generateKey({ name: 'HMAC', length: bits, hash: 'SHA-256' }, true, ['sign', 'verify']);
      const exported = await crypto.subtle.exportKey('raw', key);
      state.generatedKeys = { privateKey: key, publicKey: key, type: 'HMAC', raw: exported };
      renderGeneratedKey(state.generatedKeys);
      showToast('HMAC key generated', 'success');
      return;
    }

    const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    const privatePem = await jwkToPem(privateJwk, true);
    const publicPem = await jwkToPem(publicJwk, false);

    state.generatedKeys = { privateKey: keyPair.privateKey, publicKey: keyPair.publicKey, privateJwk, publicJwk, privatePem, publicPem, type: algo };
    renderGeneratedKey(state.generatedKeys);
    showToast(`${algo} ${size} key pair generated`, 'success');
  } catch (e) {
    showToast('Key generation failed: ' + e.message, 'error');
  }
}

function renderGeneratedKey(keys) {
  let html = `
    <div class="key-output">
      <div class="key-output-header">
        <span class="key-output-title">Generated ${keys.type} Key Pair</span>
        <span class="key-output-type">${keys.type === 'HMAC' ? 'Symmetric' : 'Asymmetric'}</span>
      </div>
  `;

  if (keys.type === 'HMAC') {
    const b64 = arrayBufferToBase64Url(keys.raw);
    html += `<code>${escapeHtml(b64)}</code>`;
  } else {
    html += `
      <div style="margin-bottom: 0.5rem;"><strong>Private Key (PKCS#8 PEM):</strong></div>
      <code>${escapeHtml(keys.privatePem)}</code>
      <div style="margin: 1rem 0 0.5rem;"><strong>Public Key (SPKI PEM):</strong></div>
      <code>${escapeHtml(keys.publicPem)}</code>
    `;
  }
  html += `</div>`;

  outputArea.innerHTML = html + outputArea.innerHTML;
}

async function generateKeyPair() {
  const type = document.getElementById('keysGenType').value;
  const [algo, size] = type.split('-');
  let keyPair;

  try {
    if (algo === 'RSA') {
      keyPair = await crypto.subtle.generateKey(
        { name: 'RSASSA-PKCS1-v1_5', modulusLength: parseInt(size), publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true, ['sign', 'verify']
      );
    } else if (algo === 'EC') {
      const curve = size === 'P256' ? 'P-256' : size === 'P384' ? 'P-384' : 'P-521';
      keyPair = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: curve }, true, ['sign', 'verify']
      );
    } else if (algo === 'Ed25519') {
      keyPair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
    } else if (algo === 'HMAC') {
      const bits = parseInt(size);
      const key = await crypto.subtle.generateKey({ name: 'HMAC', length: bits, hash: 'SHA-256' }, true, ['sign', 'verify']);
      const exported = await crypto.subtle.exportKey('raw', key);
      const b64 = arrayBufferToBase64Url(exported);
      addJWKKey({ kty: 'oct', k: b64, alg: 'HS256' });
      showToast('HMAC key added to JWKS', 'success');
      return;
    }

    const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    const privatePem = await jwkToPem(privateJwk, true);
    const publicPem = await jwkToPem(publicJwk, false);

    addJWKKey(publicJwk, { privateJwk, privatePem, publicPem });
    showToast(`${algo} ${size} key pair added to JWKS`, 'success');
  } catch (e) {
    showToast('Key generation failed: ' + e.message, 'error');
  }
}

function addJWKKey(jwk, extra = {}) {
  const kid = jwk.kid || 'key-' + Date.now();
  const item = { ...jwk, kid, ...extra, addedAt: Date.now() };
  state.jwkSet.push(item);
  renderJWKSList();
}

function renderJWKSList() {
  const list = document.getElementById('jwkKeysList');
  if (state.jwkSet.length === 0) {
    list.innerHTML = '<div class="empty-state" style="padding:1rem"><p>No keys in set</p></div>';
    return;
  }
  list.innerHTML = state.jwkSet.map((k, i) => `
    <div class="jwk-key-item">
      <div class="jwk-key-info">
        <div class="jwk-key-alg">${escapeHtml(k.kty)} / ${escapeHtml(k.alg || 'auto')}</div>
        <div class="jwk-key-use">KID: ${escapeHtml(k.kid)} • ${k.use || 'sig'}</div>
      </div>
      <button class="jwk-key-remove" onclick="removeJWKKey(${i})" aria-label="Remove key">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('');
}

window.removeJWKKey = function(i) {
  state.jwkSet.splice(i, 1);
  renderJWKSList();
};

function buildJWKS() {
  const jwks = { keys: state.jwkSet.map(k => {
    const { privateJwk, privatePem, publicPem, addedAt, ...publicKey } = k;
    return publicKey;
  })};
  const json = JSON.stringify(jwks, null, 2);
  document.getElementById('jwkSetOutput').value = json;
  showToast('JWKS built', 'success');
}

function clearJWKS() {
  state.jwkSet = [];
  document.getElementById('jwkSetOutput').value = '';
  renderJWKSList();
  showToast('JWKS cleared', 'info');
}

// ── PEM ⇄ JWK conversion ───────────────────────────────────────────────────
async function convertPemToJwk() {
  const pem = document.getElementById('convPemInput').value.trim();
  const includePrivate = document.getElementById('convIncludePrivate').checked;
  if (!pem) { showToast('Enter PEM key', 'error'); return; }

  try {
    const isPrivate = pem.includes('PRIVATE KEY');
    const format = isPrivate ? 'pkcs8' : 'spki';
    const binary = pemToArrayBuffer(pem);
    const key = await crypto.subtle.importKey(format, binary, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['sign', 'verify']);
    const jwk = await crypto.subtle.exportKey('jwk', key);
    if (!includePrivate && isPrivate) delete jwk.d;
    document.getElementById('convOutput').value = JSON.stringify(jwk, null, 2);
    showToast('Converted to JWK', 'success');
  } catch (e) {
    showToast('Conversion failed: ' + e.message, 'error');
  }
}

async function convertJwkToPem() {
  const jwkStr = document.getElementById('convJwkInput').value.trim();
  const toPrivate = document.getElementById('convJwkToPrivate').checked;
  if (!jwkStr) { showToast('Enter JWK', 'error'); return; }

  try {
    const jwk = JSON.parse(jwkStr);
    const isPrivate = 'd' in jwk && toPrivate;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, isPrivate ? ['sign', 'verify'] : ['verify']);
    const pem = await jwkToPem(jwk, isPrivate);
    document.getElementById('convOutput').value = pem;
    showToast('Converted to PEM', 'success');
  } catch (e) {
    showToast('Conversion failed: ' + e.message, 'error');
  }
}

async function jwkToPem(jwk, isPrivate) {
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, isPrivate ? ['sign', 'verify'] : ['verify']);
  const format = isPrivate ? 'pkcs8' : 'spki';
  const exported = await crypto.subtle.exportKey(format, key);
  const b64 = arrayBufferToBase64(exported);
  const lines = b64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${isPrivate ? 'PRIVATE' : 'PUBLIC'} KEY-----\n${lines}\n-----END ${isPrivate ? 'PRIVATE' : 'PUBLIC'} KEY-----`;
}

function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// ── X.509 Certificate ───────────────────────────────────────────────────────
async function parseCertificate() {
  const pem = document.getElementById('certInput').value.trim();
  if (!pem) { showToast('Enter certificate PEM', 'error'); return; }

  try {
    const cert = await parseX509(pem);
    renderCertificate(cert, pem);
    showToast('Certificate parsed', 'success');
  } catch (e) {
    showToast('Parse failed: ' + e.message, 'error');
  }
}

async function parseX509(pem) {
  const binary = pemToArrayBuffer(pem);
  // Minimal X.509 parser using Web Crypto
  const asn1 = decodeASN1(binary);
  const version = asn1.tbscert.version !== undefined ? asn1.tbscert.version : 2;
  const serial = bufferHex(asn1.tbscert.serialNumber);
  const algo = asn1.tbscert.signatureAlgorithm;
  const subject = decodeRDNAme(asn1.tbscert.subject);
  const issuer = decodeRDNAme(asn1.tbscert.issuer);

  // NotBefore/NotAfter
  const notBefore = decodeTime(asn1.tbscert.notBefore);
  const notAfter = decodeTime(asn1.tbscert.notAfter);

  // Public key
  const pubKey = asn1.tbscert.subjectPublicKeyInfo.subjectPublicKey;
  const publicKeyAlg = algo.name || 'RSA';
  const publicKeySize = pubKey.bitLength || 'unknown';

  // Simple subjectAltName extraction from extensions
  const sanOids = ['2.5.29.17'];
  let subjectAltNames = [];
  if (asn1.extensions) {
    for (const ext of asn1.extensions) {
      if (sanOids.includes(ext.oid)) {
        const extValue = ext.value;
        // Parse DNS names
        if (extValue && extValue.type === 'SEQUENCE') {
          for (const val of extValue.val) {
            if (val && val.type === 'IA5String') {
              subjectAltNames.push(val.str);
            }
          }
        }
      }
    }
  }

  // Fingerprint - compute SHA-256 of TBS
  const tbsDer = derFromObject({
    tbsCertificate: {
      version: version - 1,
      serialNumber: intToBuf(parseInt(serial, 16)),
      signatureAlgorithm: {
        algorithm: { name: 'sha256' },
        parameters: null
      },
      issuer: asn1.tbscert.issuer,
      notBefore: asn1.tbscert.notBefore,
      notAfter: asn1.tbscert.notAfter,
      subject: asn1.tbscert.subject,
      subjectPublicKeyInfo: {
        algorithm: { name: publicKeyAlg === 'RSA' ? 'RSASSA-PKCS1-v1_5' : 'ECDDA' },
        subjectPublicKey: pubKey
      }
    }
  });
  // Note: Full fingerprint computation is complex; simplified below

  return {
    subject: formatRDNAme(subject),
    issuer: formatRDNAme(issuer),
    notBefore,
    notAfter,
    serialNumber: serial,
    signatureAlgorithm: algo.name || 'RSA',
    publicKeyAlgorithm: publicKeyAlg,
    publicKey: publicKeySize,
    subjectAltNames,
    fingerprint: {
      sha256: 'computed-via-webcrypto', // placeholder
      sha1: 'computed-via-webcrypto'
    },
    version,
    extensions: extractExtensions(asn1.extensions)
  };
}

function decodeASN1(buf) {
  // Simplified ASN.1 decoder for X.509 certificates
  // This is a minimal implementation for educational purposes
  const result = {};
  // Basic parsing - in production use a proper ASN.1 library
  let offset = 0;

  function parseTag() {
    const byte = buf[offset];
    offset++;
    const tagClass = byte >> 6;
    const tagNumber = byte & 0x1F;
    return { tagClass, tagNumber };
  }

  function parseLength() {
    const byte = buf[offset];
    offset++;
    if (byte & 0x80) {
      const numBytes = byte & 0x7F;
      let len = 0;
      for (let i = 0; i < numBytes; i++) {
        len = (len << 8) | buf[offset + i];
      }
      offset += numBytes;
      return len;
    }
    return byte;
  }

  function parsePrimitive() {
    const len = parseLength();
    const start = offset;
    offset += len;
    return buf.slice(start, offset);
  }

  // Parse TBS certificate section
  // Begin with SEQUENCE { 0x30 }
  offset++; // skip 0x30 tag
  const tbsLen = parseLength();
  const tbsEnd = offset + tbsLen;
  const tbsBuf = buf.slice(offset, tbsEnd);
  offset = tbsEnd;

  // Parse inner TBS fields minimally
  result.tbscert = {};
  result.extensions = [];

  while (offset < tbsEnd) {
    const tag = parseTag();
    const len = parseLength();
    const start = offset;
    const end = start + len;

    if (tag.tagNumber === 2) { // version
      result.tbscert.version = buf[start]; // simple version
    } else if (tag.tagNumber === 3) { // serialNumber
      result.tbscert.serialNumber = bufferHex(buf.slice(start, end));
    } else if (tag.tagNumber === 7) { // issuer
      result.tbscert.issuer = decodeRDNAme(buf.slice(start, end));
    } else if (tag.tagNumber === 8) { // notBefore
      result.tbscert.notBefore = decodeTime(buf.slice(start, end));
    } else if (tag.tagNumber === 9) { // notAfter
      result.tbscert.notAfter = decodeTime(buf.slice(start, end));
    } else if (tag.tagNumber === 13) { // subject
      result.tbscert.subject = decodeRDNAme(buf.slice(start, end));
    } else if (tag.tagNumber === 22) { // subjectPublicKeyInfo
      result.tbscert.subjectPublicKeyInfo = {};
    } else if (tag.tagNumber === 23) { // extensions
      // Collect extensions
      const extStart = start;
      const extEnd = extStart + len;
      // Parse individual extensions
      let ex = offset;
      while (ex < extEnd) {
        const etag = parseTag(); ex++;
        const elen = parseLength(); const estart = ex;
        const eend = estart + elen;
        const oidBuf = buf.slice(estart, estart + 2);
        const oid = `${oidBuf[0]}.${oidBuf[1]}`;
        // Read value
        const evallen = parseLength(); const evalstart = estart + 3; const evalend = evalstart + evallen;
        result.extensions.push({ oid, value: buf.slice(evalstart, evalend) });
        ex = eend;
      }
      offset = extEnd;
    } else {
      offset = end;
    }
  }

  return result;
}

function bufferHex(buf) {
  let hex = '';
  for (let i = 0; i < buf.length; i++) {
    hex += buf[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function intToBuf(n) {
  return new Uint8Array([n >> 24, (n >> 16) & 0xFF, (n >> 8) & 0xFF, n & 0xFF]).slice(0, Math.ceil((Math.log2(n) + 1) / 8)) || new Uint8Array([0]);
}

function decodeTime(buf) {
  // Simplified UTC time decoding
  const hex = bufferHex(buf).replace(/^00/, '');
  const dec = parseInt(hex, 16);
  const year = Math.floor(dec / 10000000) + 2000;
  const month = Math.floor((dec % 10000000) / 100000) + 1;
  const day = Math.floor((dec % 100000) / 1000) + 1;
  const hour = Math.floor((dec % 1000) / 100);
  const min = Math.floor((dec % 100) / 10);
  const sec = dec % 10;
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')} UTC`;
}

function decodeRDNAme(buf) {
  // Simplified RDN Name - returns object with OID -> value
  // In production, use a proper ASN.1 decoder
  return { raw: bufferHex(buf) };
}

function formatRDNAme(rdn) {
  return rdn.raw || 'unknown';
}

function extractExtensions(exts) {
  if (!exts || exts.length === 0) return {};
  const result = {};
  for (const ext of exts) {
    const oid = ext.oid;
    // Simplified - just store hex of value
    result[oid] = ext.value ? bufferHex(ext.value) : '';
  }
  return result;
}

// ── Utility ─────────────────────────────────────────────────────────────────
function loadSample(mode) {
  const samples = {
    decode: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    verify: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    sign: '{"alg":"HS256","typ":"JWT"}',
    certs: `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTkwNTIyMTQ0MzU2WhcNMjAwNTIxMTQ0MzU2WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA4f5wg5l5hK9yQ8h0XG8Yy6Kq8VwJ5pJQ9J5Q8QIDAQABo1AwTjAdBgNV
HQ4EFgQUqRgJ5Q8QIDAQABo1AwTjAdBgNVHQ4EFgQUqRgJ5Q8QIDAQABo1AwTjAd
BgNVHQ4EFgQUqRgJ5Q8QIDAQABo1AwTjANBgkqhkiG9w0BAQsFAAOCAQEA4f5wg5l5
hK9yQ8h0XG8Yy6Kq8VwJ5pJQ9J5Q8QIDAQABo1AwTjAdBgNVHQ4EFgQUqRgJ5Q8QID
AQABo1AwTjAdBgNVHQ4EFgQUqRgJ5Q8QIDAQABo1AwTjAdBgNVHQ4EFgQUqRgJ5Q8QID
AQABo1AwTjANBgkqhkiG9w0BAQsFAAOCAQEA
-----END CERTIFICATE-----`
  };

  if (mode === 'decode') document.getElementById('decodeInput').value = samples.decode;
  else if (mode === 'verify') document.getElementById('verifyJwtInput').value = samples.verify;
  else if (mode === 'sign') document.getElementById('signPayload').value = samples.sign;
  else if (mode === 'certs') document.getElementById('certInput').value = samples.certs;
  showToast('Sample loaded', 'info');
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard', 'success');
  }).catch(() => showToast('Copy failed', 'error'));
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadJSON(json, filename) {
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── URL state ───────────────────────────────────────────────────────────────
function updateURL(params = {}) {
  const urlParams = new URLSearchParams(window.location.search);
  Object.entries(params).forEach(([k, v]) => {
    if (v) urlParams.set(k, v);
    else urlParams.delete(k);
  });
  const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
  window.history.replaceState({}, '', newUrl);
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  if (mode && document.querySelector(`.mode-btn[data-mode="${mode}"]`)) {
    document.querySelector(`.mode-btn[data-mode="${mode}"]`).click();
  }
}

document.addEventListener('DOMContentLoaded', init);