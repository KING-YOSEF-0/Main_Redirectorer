// API Request Builder — Feature 1: Fetching
// Feature 2: Mocking responses
// Feature 3: Clearing the console

const form = document.getElementById('api-request-form');
const preview = document.getElementById('request-preview');
const details = document.getElementById('request-details');

// Mock registry for intercepted responses
const mockRegistry = {};

function renderPreview(method, endpoint, headers, body) {
    details.innerHTML = '';
    const rows = [
        { label: 'Method', value: method.toUpperCase() },
        { label: 'Endpoint', value: endpoint },
        { label: 'Headers', value: headers || '(none)' },
        { label: 'Body', value: body || '(none)' },
    ];
    rows.forEach(r => {
        const row = document.createElement('div');
        row.className = 'request-item';
        row.innerHTML = `<span class="request-label">${r.label}:</span><span class="request-value">${r.value}</span>`;
        details.appendChild(row);
    });
    preview.classList.remove('hidden');
}

// Feature 1: Fetching
async function executeFetch(method, endpoint, headers, body) {
    const options = { method };
    if (headers) {
        try { options.headers = JSON.parse(headers); } catch (e) { console.warn('Invalid headers JSON'); }
    }
    if (body && method !== 'GET') {
        try { options.body = JSON.parse(body); } catch (e) { console.warn('Invalid body JSON'); }
    }
    const res = await fetch(endpoint, options);
    const text = await res.text();
    console.log('Response:', text);
    return text;
}

// Feature 2: Mocking responses
function registerMock(endpoint, mockResponse) {
    mockRegistry[endpoint] = mockResponse;
    console.log(`Mock registered for ${endpoint}`);
}

function getMockResponse(endpoint) {
    return mockRegistry[endpoint] || null;
}

// Feature 3: Clearing the console
function clearConsole() {
    console.clear();
    details.innerHTML = '';
    preview.classList.add('hidden');
}

// Feature 4: History
const requestHistory = [];
const MAX_HISTORY = 50;

function saveToHistory(method, endpoint, headers, body) {
    const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        timestamp: new Date().toISOString(),
        method: method.toUpperCase(),
        endpoint,
        headers: headers || '',
        body: body || '',
    };
    requestHistory.unshift(entry);
    if (requestHistory.length > MAX_HISTORY) requestHistory.pop();
    console.log('Saved to history:', entry.method, entry.endpoint);
}

function loadFromHistory(id) {
    const entry = requestHistory.find(e => e.id === id);
    if (!entry) return null;
    form.method.value = entry.method;
    form.endpoint.value = entry.endpoint;
    form.headers.value = entry.headers;
    form.body.value = entry.body;
    console.log('Loaded from history:', entry.method, entry.endpoint);
    return entry;
}

function clearHistory() {
    requestHistory.length = 0;
    console.log('History cleared');
}

// Feature 5: Copying
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard');
        }).catch(err => {
            console.error('Clipboard copy failed:', err);
        });
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        console.log('Copied to clipboard (fallback)');
    } catch (err) {
        console.error('Copy failed:', err);
    } finally {
        document.body.removeChild(ta);
    }
}

function copyRequestAsCurl(method, endpoint, headers, body) {
    let cmd = `curl -X ${method.toUpperCase()} '${endpoint}'`;
    if (headers) {
        try {
            const h = JSON.parse(headers);
            for (const [k, v] of Object.entries(h)) {
                cmd += ` -H '${k}: ${v}'`;
            }
        } catch (e) { console.warn('Invalid headers JSON for curl export'); }
    }
    if (body && method !== 'GET') {
        cmd += ` -d '${body.replace(/'/g, "\\'")}'`;
    }
    return cmd;
}

// Feature 6: Formatting
function formatJSON(text) {
    try {
        const obj = JSON.parse(text);
        return JSON.stringify(obj, null, 2);
    } catch (e) {
        console.warn('Not valid JSON, returning raw text');
        return text;
    }
}

function prettyPrintResponse(text) {
    const formatted = formatJSON(text);
    const pre = document.createElement('pre');
    pre.textContent = formatted;
    pre.className = 'request-value json';
    return pre;
}

// Wire history save into the submit handler
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const method = form.method.value;
    const endpoint = form.endpoint.value;
    const headers = form.headers.value;
    const body = form.body.value;

    saveToHistory(method, endpoint, headers, body);
    renderPreview(method, endpoint, headers, body);

    const mock = getMockResponse(endpoint);
    if (mock) {
        console.log('Mocked response:', mock);
    } else {
        executeFetch(method, endpoint, headers, body).catch(err => {
            console.error('Fetch failed:', err);
        });
    }
});