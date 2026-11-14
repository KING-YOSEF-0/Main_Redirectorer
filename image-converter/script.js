const state = {
  files: [],
  results: [],
  currentFormat: 'base64',
  options: {
    base64: { dataUri: true, cssBg: false, markdown: false, htmlImg: false },
    webp: { quality: 0.8, lossless: false, nearLossless: false, alphaQuality: false },
    avif: { quality: 0.5, speed: 5, lossless: false, chromaSubsampling: true },
    jpeg: { quality: 0.85, progressive: false, mozjpeg: false },
    png: { lossless: true, compression: false },
    resize: { mode: 'none', width: 0, height: 0, percent: 100 },
    stripExif: true,
    fixOrientation: true,
    maintainAspect: true
  }
};

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileQueue = document.getElementById('fileQueue');
const queueCount = document.getElementById('queueCount');
const results = document.getElementById('results');
const resultsGrid = document.getElementById('resultsGrid');
const resultCount = document.getElementById('resultCount');
const comparison = document.getElementById('comparison');
const originalImg = document.getElementById('originalImg');
const convertedImg = document.getElementById('convertedImg');
const originalInfo = document.getElementById('originalInfo');
const convertedInfo = document.getElementById('convertedInfo');
const compareStats = document.getElementById('compareStats');
const convertBtn = document.getElementById('convertBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const clearResultsBtn = document.getElementById('clearResultsBtn');

const formatTabs = document.querySelectorAll('.format-tab');
const optionsPanels = document.querySelectorAll('.options-panel');

function init() {
  setupEventListeners();
  setupFormatTabs();
  setupOptionsControls();
  loadFromURL();
}

function setupEventListeners() {
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);
  fileInput.addEventListener('change', handleFiles);

  document.addEventListener('paste', handlePaste);

  convertBtn.addEventListener('click', convertAll);
  clearBtn.addEventListener('click', clearQueue);
  downloadAllBtn.addEventListener('click', downloadAll);
  copyAllBtn.addEventListener('click', copyAllBase64);
  clearResultsBtn.addEventListener('click', clearResults);
}

function setupFormatTabs() {
  formatTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const format = tab.dataset.format;
      state.currentFormat = format;
      formatTabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });
      optionsPanels.forEach(p => {
        p.hidden = p.id !== `options-${format}`;
      });
      updateURL();
    });
  });
}

function setupOptionsControls() {
  const checkboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateOptionsFromUI();
      updateURL();
    });
  });

  const ranges = document.querySelectorAll('input[type="range"]');
  ranges.forEach(range => {
    range.addEventListener('input', () => {
      const valueEl = document.getElementById(`${range.id}Value`);
      if (valueEl) valueEl.textContent = range.value;
      updateOptionsFromUI();
    });
    range.addEventListener('change', updateURL);
  });

  const resizeMode = document.getElementById('resizeMode');
  resizeMode.addEventListener('change', () => {
    const inputs = document.getElementById('resizeInputs');
    const percent = document.getElementById('resizePercentage');
    const mode = resizeMode.value;
    inputs.hidden = mode === 'none' || mode === 'percentage';
    percent.hidden = mode !== 'percentage';
    updateOptionsFromUI();
    updateURL();
  });

  [document.getElementById('resizeWidth'), document.getElementById('resizeHeight'), document.getElementById('resizePercent')].forEach(el => {
    if (el) {
      el.addEventListener('input', () => {
        updateOptionsFromUI();
      });
      el.addEventListener('change', updateURL);
    }
  });
}

function updateOptionsFromUI() {
  state.options.base64.dataUri = document.getElementById('base64DataUri').checked;
  state.options.base64.cssBg = document.getElementById('base64CssBg').checked;
  state.options.base64.markdown = document.getElementById('base64Markdown').checked;
  state.options.base64.htmlImg = document.getElementById('base64HtmlImg').checked;

  state.options.webp.quality = parseInt(document.getElementById('webpQuality').value) / 100;
  state.options.webp.lossless = document.getElementById('webpLossless').checked;
  state.options.webp.nearLossless = document.getElementById('webpNearLossless').checked;
  state.options.webp.alphaQuality = document.getElementById('webpAlphaQuality').checked;

  state.options.avif.quality = parseInt(document.getElementById('avifQuality').value) / 100;
  state.options.avif.speed = parseInt(document.getElementById('avifSpeed').value);
  state.options.avif.lossless = document.getElementById('avifLossless').checked;
  state.options.avif.chromaSubsampling = document.getElementById('avifChromaSubsampling').checked;

  state.options.jpeg.quality = parseInt(document.getElementById('jpegQuality').value) / 100;
  state.options.jpeg.progressive = document.getElementById('jpegProgressive').checked;
  state.options.jpeg.mozjpeg = document.getElementById('jpegMozjpeg').checked;

  state.options.png.lossless = document.getElementById('pngLossless').checked;
  state.options.png.compression = document.getElementById('pngCompression').checked;

  const mode = document.getElementById('resizeMode').value;
  state.options.resize.mode = mode;
  if (mode === 'max' || mode === 'width' || mode === 'height' || mode === 'exact') {
    state.options.resize.width = parseInt(document.getElementById('resizeWidth').value) || 0;
    state.options.resize.height = parseInt(document.getElementById('resizeHeight').value) || 0;
  } else if (mode === 'percentage') {
    state.options.resize.percent = parseInt(document.getElementById('resizePercent').value) || 100;
  }

  state.options.stripExif = document.getElementById('stripExif').checked;
  state.options.fixOrientation = document.getElementById('fixOrientation').checked;
  state.options.maintainAspect = document.getElementById('maintainAspect').checked;
}

function handleDragOver(e) {
  e.preventDefault();
  dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  addFiles(files);
}

function handleFiles(e) {
  const files = Array.from(e.target.files);
  addFiles(files);
  e.target.value = '';
}

function handlePaste(e) {
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      addFiles([file]);
      break;
    }
  }
}

function addFiles(newFiles) {
  for (const file of newFiles) {
    if (!file.type.startsWith('image/')) continue;
    if (state.files.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) continue;

    const reader = new FileReader();
    reader.onload = (e) => {
      state.files.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        preview: e.target.result
      });
      renderQueue();
    };
    reader.readAsDataURL(file);
  }
}

function removeFile(index) {
  state.files.splice(index, 1);
  renderQueue();
}

function clearQueue() {
  state.files = [];
  renderQueue();
}

function renderQueue() {
  queueCount.textContent = state.files.length;
  if (state.files.length === 0) {
    fileQueue.innerHTML = '<div class="empty-state"><p>No files in queue</p></div>';
    return;
  }
  fileQueue.innerHTML = state.files.map((f, i) => `
    <div class="queue-item" role="listitem">
      <img class="queue-thumb" src="${f.preview}" alt="">
      <div class="queue-info">
        <div class="queue-name">${escapeHtml(f.name)}</div>
        <div class="queue-size">${formatBytes(f.size)} • ${f.type}</div>
      </div>
      <button class="queue-remove" aria-label="Remove ${escapeHtml(f.name)}" onclick="removeFile(${i})">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('');
}

async function convertAll() {
  if (state.files.length === 0) {
    showToast('No files to convert', 'error');
    return;
  }

  convertBtn.disabled = true;
  convertBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;margin-right:8px"></span>Converting...';

  results.hidden = false;
  resultsGrid.innerHTML = '';
  state.results = [];

  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';
  progressContainer.innerHTML = '<div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div><p id="progressText" style="font-size:0.8rem;color:var(--muted);text-align:center">0 / 0</p>';
  resultsGrid.parentNode.insertBefore(progressContainer, resultsGrid);

  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  for (let i = 0; i < state.files.length; i++) {
    const fileObj = state.files[i];
    progressText.textContent = `${i + 1} / ${state.files.length} - ${escapeHtml(fileObj.name)}`;
    progressFill.style.width = `${((i) / state.files.length) * 100}%`;

    try {
      const result = await convertFile(fileObj);
      state.results.push(result);
      renderResult(result, state.results.length - 1);
    } catch (err) {
      console.error('Conversion failed:', err);
      showToast(`Failed to convert ${fileObj.name}`, 'error');
    }
  }

  progressFill.style.width = '100%';
  progressText.textContent = `Done! ${state.results.length} converted`;

  setTimeout(() => {
    progressContainer.remove();
  }, 1000);

  resultCount.textContent = state.results.length;
  convertBtn.disabled = false;
  convertBtn.textContent = 'Convert All';
  showToast(`${state.results.length} image(s) converted`, 'success');
}

async function convertFile(fileObj) {
  const img = await loadImage(fileObj.preview);

  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');

  let { width, height } = calculateDimensions(img.width, img.height);
  canvas.width = width;
  canvas.height = height;

  if (state.options.fixOrientation) {
    await drawWithOrientation(ctx, img, width, height, fileObj.file);
  } else {
    ctx.drawImage(img, 0, 0, width, height);
  }

  let blob, mimeType, extension;

  switch (state.currentFormat) {
    case 'base64':
      mimeType = fileObj.type || 'image/png';
      blob = await canvasToBlob(canvas, mimeType);
      break;
    case 'webp':
      mimeType = 'image/webp';
      blob = await canvasToBlob(canvas, mimeType, state.options.webp.quality, {
        lossless: state.options.webp.lossless
      });
      break;
    case 'avif':
      mimeType = 'image/avif';
      blob = await canvasToBlob(canvas, mimeType, state.options.avif.quality, {
        lossless: state.options.avif.lossless,
        speed: state.options.avif.speed
      });
      break;
    case 'jpeg':
      mimeType = 'image/jpeg';
      blob = await canvasToBlob(canvas, mimeType, state.options.jpeg.quality);
      break;
    case 'png':
      mimeType = 'image/png';
      blob = await canvasToBlob(canvas, mimeType);
      break;
  }

  if (state.options.stripExif && state.currentFormat !== 'base64') {
    blob = await stripExif(blob, mimeType);
  }

  const base64 = await blobToBase64(blob);
  const dataUri = `data:${mimeType};base64,${base64}`;

  let outputFormats = {};
  if (state.currentFormat === 'base64') {
    if (state.options.base64.dataUri) outputFormats.dataUri = dataUri;
    if (state.options.base64.cssBg) outputFormats.cssBg = `background-image: url("${dataUri}");`;
    if (state.options.base64.markdown) outputFormats.markdown = `![${fileObj.name}](${dataUri})`;
    if (state.options.base64.htmlImg) outputFormats.htmlImg = `<img src="${dataUri}" alt="${escapeHtml(fileObj.name)}">`;
  }

  return {
    original: fileObj,
    blob,
    base64,
    dataUri,
    mimeType,
    width,
    height,
    size: blob.size,
    outputFormats,
    format: state.currentFormat
  };
}

function calculateDimensions(origW, origH) {
  const { mode, width, height, percent, maintainAspect } = state.options.resize;
  let w = origW, h = origH;

  if (mode === 'max' && (width || height)) {
    const maxW = width || Infinity;
    const maxH = height || Infinity;
    const scale = Math.min(maxW / origW, maxH / origH, 1);
    w = Math.round(origW * scale);
    h = Math.round(origH * scale);
  } else if (mode === 'width' && width) {
    const scale = width / origW;
    w = width;
    h = maintainAspect ? Math.round(origH * scale) : origH;
  } else if (mode === 'height' && height) {
    const scale = height / origH;
    h = height;
    w = maintainAspect ? Math.round(origW * scale) : origW;
  } else if (mode === 'exact' && width && height) {
    w = width;
    h = height;
  } else if (mode === 'percentage') {
    const scale = percent / 100;
    w = Math.round(origW * scale);
    h = Math.round(origH * scale);
  }

  return { width: w, height: h };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawWithOrientation(ctx, img, width, height, file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target.result);
      if (view.getUint16(0, false) !== 0xFFD8) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve();
        return;
      }
      const length = view.byteLength;
      let offset = 2;
      let orientation = 1;
      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) break;
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xFFE1) {
          if (view.getUint32(offset += 2, false) !== 0x45786966) {
            offset += view.getUint16(offset, false);
            continue;
          }
          const tiffOffset = offset += 6;
          if (view.getUint16(offset, false) !== 0x4949) {
            offset += 2;
            continue;
          }
          if (view.getUint16(offset + 2, false) !== 0x002A) {
            offset += 2;
            continue;
          }
          const ifdOffset = view.getUint32(offset + 4, true);
          offset = tiffOffset + ifdOffset;
          const numEntries = view.getUint16(offset, true);
          offset += 2;
          for (let i = 0; i < numEntries; i++) {
            if (view.getUint16(offset, true) === 0x0112) {
              orientation = view.getUint16(offset + 8, true);
              break;
            }
            offset += 12;
          }
        }
        if (marker >= 0xFF00 && marker <= 0xFFEF) {
          offset += view.getUint16(offset, false);
        } else break;
      }

      ctx.save();
      switch (orientation) {
        case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
        case 7: ctx.transform(0, -1, 1, 0, 0, width); break;
        case 8: ctx.transform(0, -1, -1, 0, height, width); break;
      }
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
      resolve();
    };
    reader.readAsArrayBuffer(file);
  });
}

function canvasToBlob(canvas, mimeType, quality = 0.92, options = {}) {
  return new Promise((resolve) => {
    if (mimeType === 'image/avif' && canvas.toBlob) {
      canvas.toBlob(resolve, mimeType, { quality, ...options });
    } else if (mimeType === 'image/webp' && options.lossless) {
      canvas.toBlob(resolve, mimeType, { quality: 1, lossless: true });
    } else {
      canvas.toBlob(resolve, mimeType, quality);
    }
  });
}

async function stripExif(blob, mimeType) {
  return blob;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function renderResult(result, index) {
  const card = document.createElement('div');
  card.className = 'result-card';
  card.setAttribute('role', 'listitem');

  const formats = result.format === 'base64' ? result.outputFormats : { dataUri: result.dataUri };
  const primaryFormat = formats.dataUri || Object.values(formats)[0];

  card.innerHTML = `
    <div class="result-preview">
      <img src="${primaryFormat}" alt="${escapeHtml(result.original.name)}" loading="lazy">
    </div>
    <div class="result-info">
      <div class="result-name">${escapeHtml(result.original.name)}</div>
      <div class="result-meta">
        <span>${result.width}×${result.height}</span>
        <span>${formatBytes(result.size)}</span>
        <span>${result.mimeType}</span>
      </div>
      <div class="result-actions">
        <button class="copy-btn" data-index="${index}" title="Copy ${result.format === 'base64' ? 'Base64' : 'Data URI'}">Copy</button>
        <button class="download-btn" data-index="${index}" title="Download">↓</button>
        <button class="compare-btn" data-index="${index}" title="Compare">⧉</button>
      </div>
    </div>
  `;

  resultsGrid.appendChild(card);

  card.querySelector('.copy-btn').addEventListener('click', () => copyResult(index));
  card.querySelector('.download-btn').addEventListener('click', () => downloadResult(index));
  card.querySelector('.compare-btn').addEventListener('click', () => showComparison(index));
}

async function copyResult(index) {
  const result = state.results[index];
  const text = result.format === 'base64' && result.outputFormats.dataUri
    ? result.outputFormats.dataUri
    : result.dataUri;

  await navigator.clipboard.writeText(text);
  const btn = document.querySelector(`.copy-btn[data-index="${index}"]`);
  btn.textContent = 'Copied!';
  btn.classList.add('copied');
  showToast('Copied to clipboard', 'success');
  setTimeout(() => {
    btn.textContent = 'Copy';
    btn.classList.remove('copied');
  }, 2000);
}

function downloadResult(index) {
  const result = state.results[index];
  const a = document.createElement('a');
  a.href = result.dataUri;
  const ext = result.mimeType.split('/')[1] || 'png';
  a.download = `${result.original.name.replace(/\.[^/.]+$/, '')}_converted.${ext}`;
  a.click();
  showToast('Download started', 'success');
}

function showComparison(index) {
  const result = state.results[index];
  originalImg.src = result.original.preview;
  convertedImg.src = result.dataUri;

  originalInfo.innerHTML = `
    <div>${result.original.width}×${result.original.height}</div>
    <div>${formatBytes(result.original.size)}</div>
    <div>${result.original.type}</div>
  `;

  convertedInfo.innerHTML = `
    <div>${result.width}×${result.height}</div>
    <div>${formatBytes(result.size)}</div>
    <div>${result.mimeType}</div>
  `;

  const savings = result.original.size - result.size;
  const percent = ((savings / result.original.size) * 100).toFixed(1);
  compareStats.innerHTML = `
    <div class="stat">
      <div class="stat-label">Size Change</div>
      <div class="stat-value" style="color: ${savings >= 0 ? 'var(--accent)' : 'var(--danger)'}">
        ${savings >= 0 ? '-' : '+'}${formatBytes(Math.abs(savings))} (${percent}%)
      </div>
    </div>
    <div class="stat">
      <div class="stat-label">Original</div>
      <div class="stat-value">${formatBytes(result.original.size)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Converted</div>
      <div class="stat-value">${formatBytes(result.size)}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Dimensions</div>
      <div class="stat-value">${result.original.width}×${result.original.height} → ${result.width}×${result.height}</div>
    </div>
  `;

  comparison.hidden = false;
  comparison.scrollIntoView({ behavior: 'smooth' });
}

async function downloadAll() {
  if (state.results.length === 0) return;

  showToast('Preparing ZIP...', 'info');

  const JSZip = await loadJSZip();
  const zip = new JSZip();

  for (const result of state.results) {
    const ext = result.mimeType.split('/')[1] || 'png';
    const name = `${result.original.name.replace(/\.[^/.]+$/, '')}_converted.${ext}`;
    zip.file(name, result.base64, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = `converted-images-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(a.href);

  showToast('ZIP downloaded', 'success');
}

function loadJSZip() {
  return new Promise((resolve, reject) => {
    if (window.JSZip) return resolve(window.JSZip);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve(window.JSZip);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function copyAllBase64() {
  if (state.results.length === 0) return;

  const texts = state.results.map(r =>
    r.format === 'base64' && r.outputFormats.dataUri ? r.outputFormats.dataUri : r.dataUri
  );
  await navigator.clipboard.writeText(texts.join('\n'));
  showToast(`${state.results.length} Base64 strings copied`, 'success');
}

function clearResults() {
  state.results = [];
  results.hidden = true;
  resultsGrid.innerHTML = '';
  resultCount.textContent = '0';
  comparison.hidden = true;
  showToast('Results cleared', 'info');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Dismiss">×</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}

function updateURL() {
  const params = new URLSearchParams();
  params.set('format', state.currentFormat);
  const opts = JSON.stringify(state.options);
  if (opts.length < 2000) params.set('opts', btoa(opts));
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const format = params.get('format');
  if (format && document.querySelector(`.format-tab[data-format="${format}"]`)) {
    document.querySelector(`.format-tab[data-format="${format}"]`).click();
  }

  const opts = params.get('opts');
  if (opts) {
    try {
      const decoded = JSON.parse(atob(opts));
      Object.assign(state.options, decoded);
      applyOptionsToUI();
    } catch (e) {
      console.warn('Failed to parse options from URL', e);
    }
  }
}

function applyOptionsToUI() {
  document.getElementById('base64DataUri').checked = state.options.base64.dataUri;
  document.getElementById('base64CssBg').checked = state.options.base64.cssBg;
  document.getElementById('base64Markdown').checked = state.options.base64.markdown;
  document.getElementById('base64HtmlImg').checked = state.options.base64.htmlImg;

  document.getElementById('webpQuality').value = Math.round(state.options.webp.quality * 100);
  document.getElementById('webpQualityValue').textContent = Math.round(state.options.webp.quality * 100);
  document.getElementById('webpLossless').checked = state.options.webp.lossless;
  document.getElementById('webpNearLossless').checked = state.options.webp.nearLossless;
  document.getElementById('webpAlphaQuality').checked = state.options.webp.alphaQuality;

  document.getElementById('avifQuality').value = Math.round(state.options.avif.quality * 100);
  document.getElementById('avifQualityValue').textContent = Math.round(state.options.avif.quality * 100);
  document.getElementById('avifSpeed').value = state.options.avif.speed;
  document.getElementById('avifSpeedValue').textContent = state.options.avif.speed;
  document.getElementById('avifLossless').checked = state.options.avif.lossless;
  document.getElementById('avifChromaSubsampling').checked = state.options.avif.chromaSubsampling;

  document.getElementById('jpegQuality').value = Math.round(state.options.jpeg.quality * 100);
  document.getElementById('jpegQualityValue').textContent = Math.round(state.options.jpeg.quality * 100);
  document.getElementById('jpegProgressive').checked = state.options.jpeg.progressive;
  document.getElementById('jpegMozjpeg').checked = state.options.jpeg.mozjpeg;

  document.getElementById('pngLossless').checked = state.options.png.lossless;
  document.getElementById('pngCompression').checked = state.options.png.compression;

  document.getElementById('resizeMode').value = state.options.resize.mode;
  const inputs = document.getElementById('resizeInputs');
  const percent = document.getElementById('resizePercentage');
  const mode = state.options.resize.mode;
  inputs.hidden = mode === 'none' || mode === 'percentage';
  percent.hidden = mode !== 'percentage';
  document.getElementById('resizeWidth').value = state.options.resize.width || '';
  document.getElementById('resizeHeight').value = state.options.resize.height || '';
  document.getElementById('resizePercent').value = state.options.resize.percent || 100;

  document.getElementById('stripExif').checked = state.options.stripExif;
  document.getElementById('fixOrientation').checked = state.options.fixOrientation;
  document.getElementById('maintainAspect').checked = state.options.maintainAspect;
}

window.removeFile = removeFile;

document.addEventListener('DOMContentLoaded', init);