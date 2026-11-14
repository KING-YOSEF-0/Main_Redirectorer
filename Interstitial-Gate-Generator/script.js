// Interstitial Gate Generator - Client-side gate page generator

const GATE_TEMPLATES = {
  leaving: {
    title: 'You Are Leaving',
    badge: 'Leaving Gate',
    generate: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.title || 'Leaving')}</title>
<style>
  :root { --accent: #ff4fa3; --bg: #0f0f14; --card: #1a1a24; --fg: #f5f5f7; --muted: #9aa0a6; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); color: var(--fg); font-family: system-ui, sans-serif; padding: 1.5rem; }
  .gate { background: var(--card); border: 1px solid #2d2d3f; border-radius: 20px; padding: 3rem 2rem; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
  .icon { font-size: 3.5rem; margin-bottom: 1rem; }
  h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
  p { color: var(--muted); margin-bottom: 2rem; line-height: 1.6; }
  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 600; text-decoration: none; transition: transform 0.1s, box-shadow 0.2s; }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: linear-gradient(135deg, var(--accent), #e8408a); color: white; box-shadow: 0 4px 14px rgba(255,79,163,0.4); }
  .btn-secondary { background: transparent; color: var(--fg); border: 1px solid #2d2d3f; margin-left: 0.75rem; }
  .brand { margin-top: 1.5rem; font-size: 0.75rem; color: var(--muted); opacity: 0.7; }
  ${data.customCss || ''}
</style>
</head>
<body>
<div class="gate">
  <div class="icon">🌐</div>
  <h1>${escapeHtml(data.title || 'You Are Leaving')}</h1>
  <p>${escapeHtml(data.message || 'You are about to leave this site. We are not responsible for the content of external sites.')}</p>
  <a href="${escapeHtml(data.targetUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Continue →</a>
  <a href="#" class="btn btn-secondary" onclick="window.history.back(); return false;">Stay Here</a>
  ${data.showBranding ? '<p class="brand">Powered by Interstitial Gate Generator</p>' : ''}
</div>
</body>
</html>`
  },

  age: {
    title: 'Age Verification',
    badge: 'Age Gate',
    generate: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.title || 'Age Verification Required')}</title>
<style>
  :root { --accent: #ff9f1c; --bg: #0f0f14; --card: #1a1a24; --fg: #f5f5f7; --muted: #9aa0a6; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); color: var(--fg); font-family: system-ui, sans-serif; padding: 1.5rem; }
  .gate { background: var(--card); border: 1px solid #2d2d3f; border-radius: 20px; padding: 3rem 2rem; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
  .icon { font-size: 3.5rem; margin-bottom: 1rem; }
  h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
  p { color: var(--muted); margin-bottom: 1.5rem; line-height: 1.6; }
  .age-input { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .age-input select { background: var(--bg); border: 1px solid #2d2d3f; border-radius: 10px; padding: 0.7rem 1rem; color: var(--fg); font-size: 1rem; min-width: 120px; }
  .age-input select:focus { outline: none; border-color: var(--accent); }
  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 2rem; border-radius: 12px; font-weight: 600; border: none; cursor: pointer; transition: transform 0.1s, box-shadow 0.2s; }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: linear-gradient(135deg, var(--accent), #e88d00); color: #0f0f14; box-shadow: 0 4px 14px rgba(255,159,28,0.4); }
  .brand { margin-top: 1.5rem; font-size: 0.75rem; color: var(--muted); opacity: 0.7; }
  ${data.customCss || ''}
</style>
</head>
<body>
<div class="gate">
  <div class="icon">🔞</div>
  <h1>${escapeHtml(data.title || 'Age Verification Required')}</h1>
  <p>${escapeHtml(data.message || 'You must be at least ' + (data.minAge || 18) + ' years old to access this content.')}</p>
  <div class="age-input">
    <select id="age-select">
      <option value="">Select your age</option>
      ${Array.from({length: 100}, (_, i) => i + 13).map(age => `<option value="${age}">${age}</option>`).join('')}
    </select>
  </div>
  <button class="btn btn-primary" id="verify-btn" disabled>Verify & Continue</button>
  ${data.showBranding ? '<p class="brand">Powered by Interstitial Gate Generator</p>' : ''}
</div>
<script>
  const minAge = ${data.minAge || 18};
  const targetUrl = "${escapeHtml(data.targetUrl)}";
  const select = document.getElementById('age-select');
  const btn = document.getElementById('verify-btn');
  select.addEventListener('change', () => {
    btn.disabled = parseInt(select.value) < minAge;
  });
  btn.addEventListener('click', () => {
    window.location.href = targetUrl;
  });
</script>
</body>
</html>`
  },

  maintenance: {
    title: 'Maintenance Mode',
    badge: 'Maintenance',
    generate: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.title || 'Under Maintenance')}</title>
<style>
  :root { --accent: #35c3ff; --bg: #0f0f14; --card: #1a1a24; --fg: #f5f5f7; --muted: #9aa0a6; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); color: var(--fg); font-family: system-ui, sans-serif; padding: 1.5rem; }
  .gate { background: var(--card); border: 1px solid #2d2d3f; border-radius: 20px; padding: 3rem 2rem; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
  .icon { font-size: 3.5rem; margin-bottom: 1rem; animation: spin 2s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
  p { color: var(--muted); margin-bottom: 1rem; line-height: 1.6; }
  .retry { color: var(--accent); font-weight: 500; }
  .brand { margin-top: 1.5rem; font-size: 0.75rem; color: var(--muted); opacity: 0.7; }
  ${data.customCss || ''}
</style>
</head>
<body>
<div class="gate">
  <div class="icon">🛠️</div>
  <h1>${escapeHtml(data.title || 'Under Maintenance')}</h1>
  <p>${escapeHtml(data.message || 'We are currently performing scheduled maintenance. Please check back soon.')}</p>
  <p class="retry">Estimated retry: ${data.retryAfter || 30} minutes</p>
  ${data.showBranding ? '<p class="brand">Powered by Interstitial Gate Generator</p>' : ''}
</div>
</body>
</html>`
  },

  warning: {
    title: 'Warning',
    badge: 'Warning Gate',
    generate: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.title || 'Warning')}</title>
<style>
  :root { --accent: #ff4fa3; --bg: #0f0f14; --card: #1a1a24; --fg: #f5f5f7; --muted: #9aa0a6; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); color: var(--fg); font-family: system-ui, sans-serif; padding: 1.5rem; }
  .gate { background: var(--card); border: 1px solid #2d2d3f; border-radius: 20px; padding: 3rem 2rem; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
  .icon { font-size: 3.5rem; margin-bottom: 1rem; }
  h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
  p { color: var(--muted); margin-bottom: 2rem; line-height: 1.6; }
  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 600; text-decoration: none; transition: transform 0.1s, box-shadow 0.2s; }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: linear-gradient(135deg, var(--accent), #e8408a); color: white; box-shadow: 0 4px 14px rgba(255,79,163,0.4); }
  .btn-secondary { background: transparent; color: var(--fg); border: 1px solid #2d2d3f; margin-left: 0.75rem; }
  .brand { margin-top: 1.5rem; font-size: 0.75rem; color: var(--muted); opacity: 0.7; }
  ${data.customCss || ''}
</style>
</head>
<body>
<div class="gate">
  <div class="icon">⚠️</div>
  <h1>${escapeHtml(data.title || 'Warning')}</h1>
  <p>${escapeHtml(data.message || 'Please review the following information before proceeding.')}</p>
  <a href="${escapeHtml(data.targetUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">I Understand, Continue →</a>
  <a href="#" class="btn btn-secondary" onclick="window.history.back(); return false;">Go Back</a>
  ${data.showBranding ? '<p class="brand">Powered by Interstitial Gate Generator</p>' : ''}
</div>
</body>
</html>`
  },

  countdown: {
    title: 'Redirecting...',
    badge: 'Countdown',
    generate: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.title || 'Redirecting')}</title>
<style>
  :root { --accent: #2ee6a6; --bg: #0f0f14; --card: #1a1a24; --fg: #f5f5f7; --muted: #9aa0a6; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); color: var(--fg); font-family: system-ui, sans-serif; padding: 1.5rem; }
  .gate { background: var(--card); border: 1px solid #2d2d3f; border-radius: 20px; padding: 3rem 2rem; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
  .icon { font-size: 3.5rem; margin-bottom: 1rem; }
  h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
  p { color: var(--muted); margin-bottom: 1.5rem; line-height: 1.6; }
  .countdown { font-size: 3.5rem; font-weight: 700; color: var(--accent); font-family: ui-monospace, monospace; margin-bottom: 1rem; }
  .progress { height: 6px; background: #2d2d3f; border-radius: 3px; overflow: hidden; margin-bottom: 1.5rem; }
  .progress-bar { height: 100%; background: linear-gradient(90deg, var(--accent), #1dd190); border-radius: 3px; transition: width 1s linear; width: 100%; }
  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 600; text-decoration: none; transition: transform 0.1s, box-shadow 0.2s; }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: linear-gradient(135deg, var(--accent), #1dd190); color: #0f0f14; box-shadow: 0 4px 14px rgba(46,230,166,0.4); }
  .brand { margin-top: 1.5rem; font-size: 0.75rem; color: var(--muted); opacity: 0.7; }
  ${data.customCss || ''}
</style>
</head>
<body>
<div class="gate">
  <div class="icon">⏱️</div>
  <h1>${escapeHtml(data.title || 'Redirecting...')}</h1>
  <p>${escapeHtml(data.message || 'You will be redirected shortly.')}</p>
  <div class="countdown" id="countdown">${data.countdown || 5}</div>
  <div class="progress"><div class="progress-bar" id="progress-bar"></div></div>
  <a href="${escapeHtml(data.targetUrl)}" class="btn btn-primary" id="manual-link" target="_blank" rel="noopener noreferrer">Redirect Now</a>
  ${data.showBranding ? '<p class="brand">Powered by Interstitial Gate Generator</p>' : ''}
</div>
<script>
  const seconds = ${data.countdown || 5};
  const targetUrl = "${escapeHtml(data.targetUrl)}";
  const countdownEl = document.getElementById('countdown');
  const progressBar = document.getElementById('progress-bar');
  let remaining = seconds;
  const interval = setInterval(() => {
    remaining--;
    countdownEl.textContent = remaining;
    progressBar.style.width = (remaining / seconds * 100) + '%';
    if (remaining <= 0) {
      clearInterval(interval);
      window.location.href = targetUrl;
    }
  }, 1000);
</script>
</body>
</html>`
  },

  password: {
    title: 'Password Protected',
    badge: 'Password Gate',
    generate: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.title || 'Password Required')}</title>
<style>
  :root { --accent: #9b5cff; --bg: #0f0f14; --card: #1a1a24; --fg: #f5f5f7; --muted: #9aa0a6; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); color: var(--fg); font-family: system-ui, sans-serif; padding: 1.5rem; }
  .gate { background: var(--card); border: 1px solid #2d2d3f; border-radius: 20px; padding: 3rem 2rem; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
  .icon { font-size: 3.5rem; margin-bottom: 1rem; }
  h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
  p { color: var(--muted); margin-bottom: 1.5rem; line-height: 1.6; }
  .pwd-input { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1rem; flex-wrap: wrap; }
  .pwd-input input { background: var(--bg); border: 1px solid #2d2d3f; border-radius: 10px; padding: 0.7rem 1rem; color: var(--fg); font-size: 1rem; min-width: 200px; flex: 1; }
  .pwd-input input:focus { outline: none; border-color: var(--accent); }
  .error { color: #ff6b6b; font-size: 0.85rem; min-height: 1.2em; margin-bottom: 0.5rem; }
  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 2rem; border-radius: 12px; font-weight: 600; border: none; cursor: pointer; transition: transform 0.1s, box-shadow 0.2s; }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: linear-gradient(135deg, var(--accent), #7c3dff); color: white; box-shadow: 0 4px 14px rgba(155,92,255,0.4); }
  .brand { margin-top: 1.5rem; font-size: 0.75rem; color: var(--muted); opacity: 0.7; }
  ${data.customCss || ''}
</style>
</head>
<body>
<div class="gate">
  <div class="icon">🔐</div>
  <h1>${escapeHtml(data.title || 'Password Required')}</h1>
  <p>${escapeHtml(data.message || 'Enter the password to access this content.')}</p>
  <div class="pwd-input">
    <input type="password" id="pwd-input" placeholder="Enter password" autocomplete="current-password">
  </div>
  <div class="error" id="pwd-error"></div>
  <button class="btn btn-primary" id="pwd-btn">Unlock</button>
  ${data.showBranding ? '<p class="brand">Powered by Interstitial Gate Generator</p>' : ''}
</div>
<script>
  const correctPassword = "${escapeHtml(data.password || '')}";
  const targetUrl = "${escapeHtml(data.targetUrl)}";
  const input = document.getElementById('pwd-input');
  const btn = document.getElementById('pwd-btn');
  const error = document.getElementById('pwd-error');
  function check() {
    if (input.value === correctPassword) {
      window.location.href = targetUrl;
    } else {
      error.textContent = 'Incorrect password. Try again.';
      input.value = '';
      input.focus();
    }
  }
  btn.addEventListener('click', check);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  input.focus();
</script>
</body>
</html>`
  },

  cookie: {
    title: 'Cookie Consent',
    badge: 'Cookie Consent',
    generate: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.title || 'Cookie Consent')}</title>
<style>
  :root { --accent: #ffe14d; --bg: #0f0f14; --card: #1a1a24; --fg: #f5f5f7; --muted: #9aa0a6; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: flex-end; justify-content: center; background: var(--bg); color: var(--fg); font-family: system-ui, sans-serif; padding: 1.5rem; }
  .gate { background: var(--card); border: 1px solid #2d2d3f; border-radius: 20px 20px 0 0; padding: 2rem; max-width: 600px; width: 100%; box-shadow: 0 -10px 50px rgba(0,0,0,0.4); animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
  .icon { font-size: 2rem; flex-shrink: 0; margin-top: 0.2rem; }
  .content { flex: 1; }
  h1 { font-size: 1.1rem; margin-bottom: 0.5rem; }
  p { color: var(--muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem; }
  .btn-group { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; border: none; cursor: pointer; transition: transform 0.1s, box-shadow 0.2s; }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: linear-gradient(135deg, var(--accent), #e6ca3a); color: #0f0f14; box-shadow: 0 4px 14px rgba(255,225,77,0.4); }
  .btn-secondary { background: transparent; color: var(--fg); border: 1px solid #2d2d3f; }
  .brand { margin-top: 1rem; font-size: 0.7rem; color: var(--muted); opacity: 0.7; text-align: center; }
  ${data.customCss || ''}
</style>
</head>
<body>
<div class="gate">
  <div class="header">
    <div class="icon">🍪</div>
    <div class="content">
      <h1>${escapeHtml(data.title || 'We Value Your Privacy')}</h1>
      <p>${escapeHtml(data.message || 'This site uses cookies to improve your experience. By clicking "Accept", you consent to our use of cookies.')}</p>
      <div class="btn-group">
        <button class="btn btn-primary" id="accept-btn">Accept All</button>
        <button class="btn btn-secondary" id="decline-btn">Decline</button>
        <button class="btn btn-secondary" id="settings-btn">Settings</button>
      </div>
      ${data.showBranding ? '<p class="brand">Powered by Interstitial Gate Generator</p>' : ''}
    </div>
  </div>
</div>
<script>
  const accepted = localStorage.getItem('cookie-consent');
  if (accepted) document.querySelector('.gate').remove();
  document.getElementById('accept-btn').onclick = () => { localStorage.setItem('cookie-consent', 'accept'); document.querySelector('.gate').remove(); };
  document.getElementById('decline-btn').onclick = () => { localStorage.setItem('cookie-consent', 'decline'); document.querySelector('.gate').remove(); };
  document.getElementById('settings-btn').onclick = () => alert('Cookie settings would open here. Implement as needed.');
</script>
</body>
</html>`
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

function getFormData() {
  const type = document.getElementById('gate-type').value;
  const targetUrl = document.getElementById('target-url').value.trim();
  const title = document.getElementById('gate-title').value.trim();
  const message = document.getElementById('gate-message').value.trim();
  const countdown = parseInt(document.getElementById('countdown-seconds').value) || 5;
  const password = document.getElementById('gate-password').value;
  const minAge = parseInt(document.getElementById('min-age').value) || 18;
  const retryAfter = parseInt(document.getElementById('retry-after').value) || 30;
  const customCss = document.getElementById('custom-css').value.trim();
  const showBranding = document.getElementById('show-branding').checked;

  return { type, targetUrl, title, message, countdown, password, minAge, retryAfter, customCss, showBranding };
}

function updateVisibleFields() {
  const type = document.getElementById('gate-type').value;
  const fields = {
    'f-target': true,
    'f-title': true,
    'f-message': true,
    'f-countdown': false,
    'f-password': false,
    'f-age': false,
    'f-maintenance': false,
    'f-custom-css': true
  };
  if (type === 'countdown') fields['f-countdown'] = true;
  if (type === 'password') fields['f-password'] = true;
  if (type === 'age') fields['f-age'] = true;
  if (type === 'maintenance') fields['f-maintenance'] = true;
  if (type === 'cookie') { fields['f-target'] = false; fields['f-custom-css'] = true; }

  Object.entries(fields).forEach(([id, show]) => {
    const el = document.getElementById(id);
    if (el) el.hidden = !show;
  });

  document.getElementById('preview-badge').textContent = GATE_TEMPLATES[type]?.badge || 'Gate';
}

function generateGateHtml(data) {
  const template = GATE_TEMPLATES[data.type];
  if (!template) return '';
  return template.generate(data);
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
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function previewGate() {
  const data = getFormData();
  if (!data.targetUrl && data.type !== 'cookie') {
    showToast('Please enter a target URL');
    return;
  }
  const html = generateGateHtml(data);
  const iframe = document.getElementById('preview-iframe');
  iframe.srcdoc = html;
}

function copyGateHtml() {
  const data = getFormData();
  if (!data.targetUrl && data.type !== 'cookie') {
    showToast('Please enter a target URL');
    return;
  }
  const html = generateGateHtml(data);
  navigator.clipboard.writeText(html).then(() => {
    showToast('HTML copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy');
  });
}

function downloadGateHtml() {
  const data = getFormData();
  if (!data.targetUrl && data.type !== 'cookie') {
    showToast('Please enter a target URL');
    return;
  }
  const html = generateGateHtml(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.type}-gate.html`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('File downloaded!');
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

// Event listeners
document.getElementById('gate-type').addEventListener('change', () => {
  updateVisibleFields();
  previewGate();
});

['target-url', 'gate-title', 'gate-message', 'countdown-seconds', 'gate-password', 'min-age', 'retry-after', 'custom-css', 'show-branding'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', previewGate);
});

document.getElementById('btn-preview').addEventListener('click', previewGate);
document.getElementById('btn-copy').addEventListener('click', copyGateHtml);
document.getElementById('btn-download').addEventListener('click', downloadGateHtml);

// Initial
updateVisibleFields();
previewGate();