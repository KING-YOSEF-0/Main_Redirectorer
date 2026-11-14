const ShadowPlayground = (() => {
  const state = {
    // Box Shadow
    boxShadowLayers: [
      { x: 0, y: 4, blur: 8, spread: 0, color: '#ff4fa3', opacity: 0.3, inset: false },
      { x: 0, y: 12, blur: 24, spread: -4, color: '#ff4fa3', opacity: 0.15, inset: false },
      { x: 0, y: 2, blur: 4, spread: -2, color: '#2ee6a6', opacity: 0.1, inset: false },
    ],
    boxShadowInset: false,

    // Text Shadow
    textShadowLayers: [
      { x: 0, y: 2, blur: 4, color: '#ff4fa3', opacity: 0.4 },
      { x: 0, y: 4, blur: 8, color: '#35c3ff', opacity: 0.2 },
    ],

    // Filter
    filterFunctions: [
      { type: 'blur', value: 0 },
      { type: 'brightness', value: 100 },
      { type: 'contrast', value: 100 },
      { type: 'saturate', value: 100 },
    ],

    // Backdrop Filter
    backdropFilterFunctions: [
      { type: 'blur', value: 8 },
      { type: 'saturate', value: 120 },
    ],
    backdropBg: 'gradient',

    // Current editor
    currentEditor: 'box-shadow',
    syncPreviews: true,
    exportFormat: 'css',
  };

  const elements = {};

  const FILTER_TYPES = [
    { id: 'blur', label: 'Blur', unit: 'px', min: 0, max: 50, step: 1, default: 0, hasColor: false },
    { id: 'brightness', label: 'Brightness', unit: '%', min: 0, max: 300, step: 1, default: 100, hasColor: false },
    { id: 'contrast', label: 'Contrast', unit: '%', min: 0, max: 300, step: 1, default: 100, hasColor: false },
    { id: 'saturate', label: 'Saturate', unit: '%', min: 0, max: 300, step: 1, default: 100, hasColor: false },
    { id: 'grayscale', label: 'Grayscale', unit: '%', min: 0, max: 100, step: 1, default: 0, hasColor: false },
    { id: 'sepia', label: 'Sepia', unit: '%', min: 0, max: 100, step: 1, default: 0, hasColor: false },
    { id: 'hue-rotate', label: 'Hue Rotate', unit: 'deg', min: 0, max: 360, step: 1, default: 0, hasColor: false },
    { id: 'invert', label: 'Invert', unit: '%', min: 0, max: 100, step: 1, default: 0, hasColor: false },
    { id: 'opacity', label: 'Opacity', unit: '%', min: 0, max: 100, step: 1, default: 100, hasColor: false },
    { id: 'drop-shadow', label: 'Drop Shadow', unit: '', min: 0, max: 50, step: 1, default: 0, hasColor: true, color: '#000000', opacity: 0.5, offsetX: 0, offsetY: 4, blur: 8 },
  ];

  const PRESETS = {
    'box-shadow': [
      { name: 'Neumorphic', layers: [
        { x: 8, y: 8, blur: 16, spread: 0, color: '#000000', opacity: 0.15, inset: false },
        { x: -8, y: -8, blur: 16, spread: 0, color: '#ffffff', opacity: 0.7, inset: false },
      ], inset: false },
      { name: 'Glassmorphism', layers: [
        { x: 0, y: 8, blur: 32, spread: -8, color: '#000000', opacity: 0.15, inset: false },
        { x: 0, y: 0, blur: 1, spread: 0, color: '#ffffff', opacity: 0.1, inset: true },
      ], inset: false },
      { name: 'Deep Elevation', layers: [
        { x: 0, y: 2, blur: 4, spread: -1, color: '#000000', opacity: 0.15, inset: false },
        { x: 0, y: 4, blur: 6, spread: -2, color: '#000000', opacity: 0.1, inset: false },
        { x: 0, y: 10, blur: 20, spread: -5, color: '#000000', opacity: 0.1, inset: false },
        { x: 0, y: 20, blur: 25, spread: -5, color: '#000000', opacity: 0.15, inset: false },
      ], inset: false },
      { name: 'Glow', layers: [
        { x: 0, y: 0, blur: 20, spread: 5, color: '#ff4fa3', opacity: 0.5, inset: false },
        { x: 0, y: 0, blur: 40, spread: 10, color: '#ff4fa3', opacity: 0.3, inset: false },
      ], inset: false },
      { name: 'Retro', layers: [
        { x: 4, y: 4, blur: 0, spread: 0, color: '#000000', opacity: 1, inset: false },
        { x: 8, y: 8, blur: 0, spread: 0, color: '#ff4fa3', opacity: 1, inset: false },
      ], inset: false },
      { name: 'Inner Glow', layers: [
        { x: 0, y: 0, blur: 20, spread: 0, color: '#2ee6a6', opacity: 0.3, inset: true },
      ], inset: true },
    ],
    'text-shadow': [
      { name: 'Neon', layers: [
        { x: 0, y: 0, blur: 5, color: '#ff4fa3', opacity: 1 },
        { x: 0, y: 0, blur: 10, color: '#ff4fa3', opacity: 0.8 },
        { x: 0, y: 0, blur: 20, color: '#ff4fa3', opacity: 0.6 },
        { x: 0, y: 0, blur: 30, color: '#ff4fa3', opacity: 0.4 },
      ]},
      { name: 'Retro 3D', layers: [
        { x: 1, y: 1, blur: 0, color: '#000000', opacity: 1 },
        { x: 2, y: 2, blur: 0, color: '#000000', opacity: 1 },
        { x: 3, y: 3, blur: 0, color: '#000000', opacity: 1 },
        { x: 4, y: 4, blur: 0, color: '#000000', opacity: 1 },
        { x: 5, y: 5, blur: 0, color: '#ff4fa3', opacity: 1 },
      ]},
      { name: 'Elegant', layers: [
        { x: 0, y: 2, blur: 4, color: '#000000', opacity: 0.3 },
        { x: 0, y: 4, blur: 8, color: '#000000', opacity: 0.15 },
      ]},
      { name: 'Glow Text', layers: [
        { x: 0, y: 0, blur: 10, color: '#35c3ff', opacity: 0.8 },
        { x: 0, y: 0, blur: 20, color: '#35c3ff', opacity: 0.5 },
      ]},
      { name: 'Fire', layers: [
        { x: 0, y: 0, blur: 2, color: '#ff9f1c', opacity: 1 },
        { x: 0, y: 2, blur: 4, color: '#ff4fa3', opacity: 0.8 },
        { x: 0, y: 4, blur: 8, color: '#ff9f1c', opacity: 0.6 },
      ]},
    ],
    'filter': [
      { name: 'Vintage', functions: [
        { type: 'sepia', value: 40 },
        { type: 'contrast', value: 110 },
        { type: 'brightness', value: 105 },
        { type: 'saturate', value: 80 },
      ]},
      { name: 'B&W Contrast', functions: [
        { type: 'grayscale', value: 100 },
        { type: 'contrast', value: 150 },
        { type: 'brightness', value: 110 },
      ]},
      { name: 'Dreamy', functions: [
        { type: 'blur', value: 2 },
        { type: 'brightness', value: 115 },
        { type: 'contrast', value: 90 },
        { type: 'saturate', value: 130 },
      ]},
      { name: 'Cyberpunk', functions: [
        { type: 'contrast', value: 130 },
        { type: 'saturate', value: 180 },
        { type: 'hue-rotate', value: 180 },
      ]},
      { name: 'Inverted', functions: [
        { type: 'invert', value: 100 },
        { type: 'hue-rotate', value: 180 },
      ]},
    ],
    'backdrop-filter': [
      { name: 'Frosted Glass', functions: [
        { type: 'blur', value: 12 },
        { type: 'saturate', value: 150 },
      ], bg: 'gradient' },
      { name: 'Dark Glass', functions: [
        { type: 'blur', value: 20 },
        { type: 'brightness', value: 60 },
        { type: 'contrast', value: 120 },
      ], bg: 'gradient' },
      { name: 'Tinted Blur', functions: [
        { type: 'blur', value: 16 },
        { type: 'saturate', value: 200 },
        { type: 'hue-rotate', value: 280 },
      ], bg: 'image' },
      { name: 'Subtle', functions: [
        { type: 'blur', value: 4 },
        { type: 'saturate', value: 110 },
      ], bg: 'noise' },
    ],
  };

  function init() {
    cacheElements();
    renderAll();
    bindEvents();
    startBubbles();
  }

  function cacheElements() {
    // Editor tabs
    elements.editorTabs = document.querySelectorAll('.mode-tab[data-editor]');
    elements.editorPanels = {
      'box-shadow': document.getElementById('editor-box-shadow'),
      'text-shadow': document.getElementById('editor-text-shadow'),
      'filter': document.getElementById('editor-filter'),
      'backdrop-filter': document.getElementById('editor-backdrop-filter'),
    };

    // Box Shadow
    elements.shadowLayers = document.getElementById('shadowLayers');
    elements.shadowLayersValue = document.getElementById('shadowLayersValue');
    elements.shadowLayersContainer = document.getElementById('shadowLayersContainer');
    elements.addShadowLayer = document.getElementById('addShadowLayer');
    elements.removeShadowLayer = document.getElementById('removeShadowLayer');
    elements.shadowInset = document.getElementById('shadowInset');

    // Text Shadow
    elements.textShadowLayers = document.getElementById('textShadowLayers');
    elements.textShadowLayersValue = document.getElementById('textShadowLayersValue');
    elements.textShadowLayersContainer = document.getElementById('textShadowLayersContainer');
    elements.addTextShadowLayer = document.getElementById('addTextShadowLayer');
    elements.removeTextShadowLayer = document.getElementById('removeTextShadowLayer');

    // Filter
    elements.filterFunctionsContainer = document.getElementById('filterFunctionsContainer');
    elements.addFilterFunction = document.getElementById('addFilterFunction');
    elements.removeFilterFunction = document.getElementById('removeFilterFunction');
    elements.filterHueRotateAnim = document.getElementById('filterHueRotateAnim');

    // Backdrop Filter
    elements.backdropFilterContainer = document.getElementById('backdropFilterContainer');
    elements.addBackdropFilter = document.getElementById('addBackdropFilter');
    elements.removeBackdropFilter = document.getElementById('removeBackdropFilter');
    elements.backdropBg = document.getElementById('backdropBg');

    // Presets
    elements.presetButtons = document.getElementById('presetButtons');
    elements.randomizeBtn = document.getElementById('randomizeBtn');
    elements.resetBtn = document.getElementById('resetBtn');

    // Export
    elements.exportTabs = document.querySelectorAll('.export-tab');
    elements.exportOutput = document.getElementById('exportOutput');
    elements.copyExport = document.getElementById('copyExport');
    elements.downloadExport = document.getElementById('downloadExport');

    // Preview
    elements.previewSync = document.getElementById('previewSync');
    elements.previewGrid = document.getElementById('previewGrid');
    elements.previewCard = document.getElementById('previewCard');
    elements.previewBtnPrimary = document.getElementById('previewBtnPrimary');
    elements.previewBtnSecondary = document.getElementById('previewBtnSecondary');
    elements.previewBtnGhost = document.getElementById('previewBtnGhost');
    elements.previewText = document.getElementById('previewText');
    elements.previewImage = document.getElementById('previewImage');
    elements.generatedCss = document.getElementById('generatedCss');
    elements.generatedTextCss = document.getElementById('generatedTextCss');
    elements.generatedFilterCss = document.getElementById('generatedFilterCss');
    elements.generatedBackdropCss = document.getElementById('generatedBackdropCss');
  }

  function bindEvents() {
    // Editor tabs
    elements.editorTabs.forEach(tab => {
      tab.addEventListener('click', () => switchEditor(tab.dataset.editor));
    });

    // Box Shadow
    elements.shadowLayers.addEventListener('input', () => {
      updateShadowLayersCount(parseInt(elements.shadowLayers.value));
      elements.shadowLayersValue.textContent = elements.shadowLayers.value;
    });
    elements.addShadowLayer.addEventListener('click', () => addShadowLayer());
    elements.removeShadowLayer.addEventListener('click', () => removeShadowLayer());
    elements.shadowInset.addEventListener('change', () => {
      state.boxShadowInset = elements.shadowInset.checked;
      updateAll();
    });

    // Text Shadow
    elements.textShadowLayers.addEventListener('input', () => {
      updateTextShadowLayersCount(parseInt(elements.textShadowLayers.value));
      elements.textShadowLayersValue.textContent = elements.textShadowLayers.value;
    });
    elements.addTextShadowLayer.addEventListener('click', () => addTextShadowLayer());
    elements.removeTextShadowLayer.addEventListener('click', () => removeTextShadowLayer());

    // Filter
    elements.addFilterFunction.addEventListener('click', () => addFilterFunction());
    elements.removeFilterFunction.addEventListener('click', () => removeFilterFunction());
    elements.filterHueRotateAnim.addEventListener('change', updateAll);

    // Backdrop Filter
    elements.addBackdropFilter.addEventListener('click', () => addBackdropFilter());
    elements.removeBackdropFilter.addEventListener('click', () => removeBackdropFilter());
    elements.backdropBg.addEventListener('change', () => {
      state.backdropBg = elements.backdropBg.value;
      updateBackdropPreview();
    });

    // Presets
    elements.randomizeBtn.addEventListener('click', randomize);
    elements.resetBtn.addEventListener('click', reset);

    // Export tabs
    elements.exportTabs.forEach(tab => {
      tab.addEventListener('click', () => switchExportFormat(tab.dataset.export));
    });
    elements.copyExport.addEventListener('click', copyExport);
    elements.downloadExport.addEventListener('click', downloadExport);

    // Preview sync
    elements.previewSync.addEventListener('change', () => {
      state.syncPreviews = elements.previewSync.checked;
      updateAll();
    });
  }

  function switchEditor(editor) {
    state.currentEditor = editor;
    elements.editorTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.editor === editor);
      tab.setAttribute('aria-selected', tab.dataset.editor === editor);
    });
    Object.entries(elements.editorPanels).forEach(([key, panel]) => {
      panel.hidden = key !== editor;
    });
    renderPresets();
    updateExportOutput();
  }

  function switchExportFormat(format) {
    state.exportFormat = format;
    elements.exportTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.export === format);
      tab.setAttribute('aria-selected', tab.dataset.export === format);
    });
    updateExportOutput();
  }

  // ============ Box Shadow ============
  function updateShadowLayersCount(count) {
    const current = state.boxShadowLayers.length;
    if (count > current) {
      while (state.boxShadowLayers.length < count) {
        state.boxShadowLayers.push({
          x: 0, y: 4 + state.boxShadowLayers.length * 4,
          blur: 8 + state.boxShadowLayers.length * 4,
          spread: 0,
          color: '#ff4fa3',
          opacity: 0.2 / (state.boxShadowLayers.length + 1),
          inset: false,
        });
      }
    } else if (count < current) {
      state.boxShadowLayers = state.boxShadowLayers.slice(0, count);
    }
    renderBoxShadowLayers();
    updateAll();
  }

  function addShadowLayer() {
    if (state.boxShadowLayers.length >= 10) return;
    state.boxShadowLayers.push({
      x: 0, y: 4 + state.boxShadowLayers.length * 4,
      blur: 8 + state.boxShadowLayers.length * 4,
      spread: 0,
      color: '#ff4fa3',
      opacity: 0.2 / (state.boxShadowLayers.length + 1),
      inset: false,
    });
    elements.shadowLayers.value = state.boxShadowLayers.length;
    elements.shadowLayersValue.textContent = state.boxShadowLayers.length;
    renderBoxShadowLayers();
    updateAll();
  }

  function removeShadowLayer() {
    if (state.boxShadowLayers.length <= 1) return;
    state.boxShadowLayers.pop();
    elements.shadowLayers.value = state.boxShadowLayers.length;
    elements.shadowLayersValue.textContent = state.boxShadowLayers.length;
    renderBoxShadowLayers();
    updateAll();
  }

  function renderBoxShadowLayers() {
    elements.shadowLayersContainer.innerHTML = state.boxShadowLayers.map((layer, i) => `
      <div class="shadow-layer" data-index="${i}">
        <div class="shadow-layer-header">
          <span class="shadow-layer-title">Layer ${i + 1}</span>
        </div>
        <div class="shadow-layer-controls">
          <div class="shadow-control">
            <label>X Offset</label>
            <input type="range" class="layer-x" min="-50" max="50" value="${layer.x}" data-index="${i}">
            <span class="layer-x-value">${layer.x}px</span>
          </div>
          <div class="shadow-control">
            <label>Y Offset</label>
            <input type="range" class="layer-y" min="-50" max="50" value="${layer.y}" data-index="${i}">
            <span class="layer-y-value">${layer.y}px</span>
          </div>
          <div class="shadow-control">
            <label>Blur</label>
            <input type="range" class="layer-blur" min="0" max="100" value="${layer.blur}" data-index="${i}">
            <span class="layer-blur-value">${layer.blur}px</span>
          </div>
          <div class="shadow-control">
            <label>Spread</label>
            <input type="range" class="layer-spread" min="-20" max="20" value="${layer.spread}" data-index="${i}">
            <span class="layer-spread-value">${layer.spread}px</span>
          </div>
          <div class="shadow-control">
            <label>Color</label>
            <input type="color" class="layer-color" value="${layer.color}" data-index="${i}">
          </div>
          <div class="shadow-control">
            <label>Opacity</label>
            <input type="range" class="layer-opacity" min="0" max="1" step="0.01" value="${layer.opacity}" data-index="${i}">
            <span class="layer-opacity-value">${(layer.opacity * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    `).join('');

    // Bind layer controls
    elements.shadowLayersContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        const layer = state.boxShadowLayers[index];
        if (!layer) return;

        if (e.target.classList.contains('layer-x')) {
          layer.x = parseInt(e.target.value);
          e.target.nextElementSibling.textContent = layer.x + 'px';
        } else if (e.target.classList.contains('layer-y')) {
          layer.y = parseInt(e.target.value);
          e.target.nextElementSibling.textContent = layer.y + 'px';
        } else if (e.target.classList.contains('layer-blur')) {
          layer.blur = parseInt(e.target.value);
          e.target.nextElementSibling.textContent = layer.blur + 'px';
        } else if (e.target.classList.contains('layer-spread')) {
          layer.spread = parseInt(e.target.value);
          e.target.nextElementSibling.textContent = layer.spread + 'px';
        } else if (e.target.classList.contains('layer-color')) {
          layer.color = e.target.value;
        } else if (e.target.classList.contains('layer-opacity')) {
          layer.opacity = parseFloat(e.target.value);
          e.target.nextElementSibling.textContent = Math.round(layer.opacity * 100) + '%';
        }
        updateAll();
      });
    });
  }

  // ============ Text Shadow ============
  function updateTextShadowLayersCount(count) {
    const current = state.textShadowLayers.length;
    if (count > current) {
      while (state.textShadowLayers.length < count) {
        state.textShadowLayers.push({
          x: 0, y: 2 + state.textShadowLayers.length * 2,
          blur: 4 + state.textShadowLayers.length * 2,
          color: '#ff4fa3',
          opacity: 0.3 / (state.textShadowLayers.length + 1),
        });
      }
    } else if (count < current) {
      state.textShadowLayers = state.textShadowLayers.slice(0, count);
    }
    renderTextShadowLayers();
    updateAll();
  }

  function addTextShadowLayer() {
    if (state.textShadowLayers.length >= 8) return;
    state.textShadowLayers.push({
      x: 0, y: 2 + state.textShadowLayers.length * 2,
      blur: 4 + state.textShadowLayers.length * 2,
      color: '#ff4fa3',
      opacity: 0.3 / (state.textShadowLayers.length + 1),
    });
    elements.textShadowLayers.value = state.textShadowLayers.length;
    elements.textShadowLayersValue.textContent = state.textShadowLayers.length;
    renderTextShadowLayers();
    updateAll();
  }

  function removeTextShadowLayer() {
    if (state.textShadowLayers.length <= 1) return;
    state.textShadowLayers.pop();
    elements.textShadowLayers.value = state.textShadowLayers.length;
    elements.textShadowLayersValue.textContent = state.textShadowLayers.length;
    renderTextShadowLayers();
    updateAll();
  }

  function renderTextShadowLayers() {
    elements.textShadowLayersContainer.innerHTML = state.textShadowLayers.map((layer, i) => `
      <div class="shadow-layer" data-index="${i}">
        <div class="shadow-layer-header">
          <span class="shadow-layer-title">Layer ${i + 1}</span>
        </div>
        <div class="shadow-layer-controls">
          <div class="shadow-control">
            <label>X Offset</label>
            <input type="range" class="ts-layer-x" min="-20" max="20" value="${layer.x}" data-index="${i}">
            <span class="ts-layer-x-value">${layer.x}px</span>
          </div>
          <div class="shadow-control">
            <label>Y Offset</label>
            <input type="range" class="ts-layer-y" min="-20" max="20" value="${layer.y}" data-index="${i}">
            <span class="ts-layer-y-value">${layer.y}px</span>
          </div>
          <div class="shadow-control">
            <label>Blur</label>
            <input type="range" class="ts-layer-blur" min="0" max="50" value="${layer.blur}" data-index="${i}">
            <span class="ts-layer-blur-value">${layer.blur}px</span>
          </div>
          <div class="shadow-control">
            <label>Color</label>
            <input type="color" class="ts-layer-color" value="${layer.color}" data-index="${i}">
          </div>
          <div class="shadow-control">
            <label>Opacity</label>
            <input type="range" class="ts-layer-opacity" min="0" max="1" step="0.01" value="${layer.opacity}" data-index="${i}">
            <span class="ts-layer-opacity-value">${(layer.opacity * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    `).join('');

    elements.textShadowLayersContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        const layer = state.textShadowLayers[index];
        if (!layer) return;

        if (e.target.classList.contains('ts-layer-x')) {
          layer.x = parseInt(e.target.value);
          e.target.nextElementSibling.textContent = layer.x + 'px';
        } else if (e.target.classList.contains('ts-layer-y')) {
          layer.y = parseInt(e.target.value);
          e.target.nextElementSibling.textContent = layer.y + 'px';
        } else if (e.target.classList.contains('ts-layer-blur')) {
          layer.blur = parseInt(e.target.value);
          e.target.nextElementSibling.textContent = layer.blur + 'px';
        } else if (e.target.classList.contains('ts-layer-color')) {
          layer.color = e.target.value;
        } else if (e.target.classList.contains('ts-layer-opacity')) {
          layer.opacity = parseFloat(e.target.value);
          e.target.nextElementSibling.textContent = Math.round(layer.opacity * 100) + '%';
        }
        updateAll();
      });
    });
  }

  // ============ Filter ============
  function addFilterFunction() {
    if (state.filterFunctions.length >= 10) return;
    state.filterFunctions.push({ type: 'blur', value: 0 });
    renderFilterFunctions();
    updateAll();
  }

  function removeFilterFunction() {
    if (state.filterFunctions.length <= 1) return;
    state.filterFunctions.pop();
    renderFilterFunctions();
    updateAll();
  }

  function renderFilterFunctions() {
    elements.filterFunctionsContainer.innerHTML = state.filterFunctions.map((fn, i) => {
      const filterDef = FILTER_TYPES.find(f => f.id === fn.type);
      return `
        <div class="filter-function" data-index="${i}">
          <div class="filter-function-header">
            <select class="filter-type" data-index="${i}">
              ${FILTER_TYPES.map(f => `<option value="${f.id}" ${f.id === fn.type ? 'selected' : ''}>${f.label}</option>`).join('')}
            </select>
            <button class="btn btn-small" data-action="remove-filter" data-index="${i}" style="padding:0.25rem 0.5rem;font-size:0.7rem;">Remove</button>
          </div>
          <div class="filter-function-controls" id="filter-controls-${i}">
            ${renderFilterControls(fn, i)}
          </div>
        </div>
      `;
    }).join('');

    // Bind filter controls
    elements.filterFunctionsContainer.querySelectorAll('.filter-type').forEach(select => {
      select.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        state.filterFunctions[index].type = e.target.value;
        // Reset value to default for new type
        const def = FILTER_TYPES.find(f => f.id === e.target.value);
        state.filterFunctions[index].value = def.default;
        if (def.hasColor) {
          state.filterFunctions[index].color = def.color;
          state.filterFunctions[index].opacity = def.opacity;
          state.filterFunctions[index].offsetX = def.offsetX;
          state.filterFunctions[index].offsetY = def.offsetY;
          state.filterFunctions[index].blur = def.blur;
        }
        renderFilterFunctions();
        updateAll();
      });
    });

    elements.filterFunctionsContainer.querySelectorAll('[data-action="remove-filter"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        state.filterFunctions.splice(index, 1);
        renderFilterFunctions();
        updateAll();
      });
    });

    elements.filterFunctionsContainer.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        const fn = state.filterFunctions[index];
        if (!fn) return;
        const prop = e.target.dataset.prop;
        fn[prop] = e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
        const valueSpan = e.target.nextElementSibling;
        if (valueSpan && valueSpan.classList.contains('filter-value')) {
          const def = FILTER_TYPES.find(f => f.id === fn.type);
          valueSpan.textContent = fn[prop] + (def ? def.unit : '');
        }
        updateAll();
      });
    });

    elements.filterFunctionsContainer.querySelectorAll('input[type="color"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        const fn = state.filterFunctions[index];
        if (!fn) return;
        fn.color = e.target.value;
        updateAll();
      });
    });
  }

  function renderFilterControls(fn, index) {
    const def = FILTER_TYPES.find(f => f.id === fn.type);
    if (!def) return '';

    let html = '';
    if (def.id === 'drop-shadow') {
      html += `
        <div class="filter-control">
          <label>X Offset</label>
          <input type="range" min="-50" max="50" value="${fn.offsetX || 0}" data-index="${index}" data-prop="offsetX">
          <span class="filter-value">${fn.offsetX || 0}px</span>
        </div>
        <div class="filter-control">
          <label>Y Offset</label>
          <input type="range" min="-50" max="50" value="${fn.offsetY || 4}" data-index="${index}" data-prop="offsetY">
          <span class="filter-value">${fn.offsetY || 4}px</span>
        </div>
        <div class="filter-control">
          <label>Blur</label>
          <input type="range" min="0" max="50" value="${fn.blur || 8}" data-index="${index}" data-prop="blur">
          <span class="filter-value">${fn.blur || 8}px</span>
        </div>
        <div class="filter-control">
          <label>Color</label>
          <input type="color" value="${fn.color || '#000000'}" data-index="${index}" data-prop="color">
        </div>
        <div class="filter-control">
          <label>Opacity</label>
          <input type="range" min="0" max="1" step="0.01" value="${fn.opacity || 0.5}" data-index="${index}" data-prop="opacity">
          <span class="filter-value">${Math.round((fn.opacity || 0.5) * 100)}%</span>
        </div>
      `;
    } else {
      html += `
        <div class="filter-control">
          <label>${def.label}</label>
          <input type="range" min="${def.min}" max="${def.max}" step="${def.step}" value="${fn.value}" data-index="${index}" data-prop="value">
          <span class="filter-value">${fn.value}${def.unit}</span>
        </div>
      `;
    }
    return html;
  }

  // ============ Backdrop Filter ============
  function addBackdropFilter() {
    if (state.backdropFilterFunctions.length >= 10) return;
    state.backdropFilterFunctions.push({ type: 'blur', value: 8 });
    renderBackdropFilters();
    updateAll();
  }

  function removeBackdropFilter() {
    if (state.backdropFilterFunctions.length <= 1) return;
    state.backdropFilterFunctions.pop();
    renderBackdropFilters();
    updateAll();
  }

  function renderBackdropFilters() {
    elements.backdropFilterContainer.innerHTML = state.backdropFilterFunctions.map((fn, i) => {
      const filterDef = FILTER_TYPES.find(f => f.id === fn.type);
      return `
        <div class="filter-function" data-index="${i}">
          <div class="filter-function-header">
            <select class="backdrop-filter-type" data-index="${i}">
              ${FILTER_TYPES.map(f => `<option value="${f.id}" ${f.id === fn.type ? 'selected' : ''}>${f.label}</option>`).join('')}
            </select>
            <button class="btn btn-small" data-action="remove-backdrop-filter" data-index="${i}" style="padding:0.25rem 0.5rem;font-size:0.7rem;">Remove</button>
          </div>
          <div class="filter-function-controls" id="backdrop-filter-controls-${i}">
            ${renderBackdropFilterControls(fn, i)}
          </div>
        </div>
      `;
    }).join('');

    elements.backdropFilterContainer.querySelectorAll('.backdrop-filter-type').forEach(select => {
      select.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        state.backdropFilterFunctions[index].type = e.target.value;
        const def = FILTER_TYPES.find(f => f.id === e.target.value);
        state.backdropFilterFunctions[index].value = def.default;
        if (def.hasColor) {
          state.backdropFilterFunctions[index].color = def.color;
          state.backdropFilterFunctions[index].opacity = def.opacity;
          state.backdropFilterFunctions[index].offsetX = def.offsetX;
          state.backdropFilterFunctions[index].offsetY = def.offsetY;
          state.backdropFilterFunctions[index].blur = def.blur;
        }
        renderBackdropFilters();
        updateAll();
      });
    });

    elements.backdropFilterContainer.querySelectorAll('[data-action="remove-backdrop-filter"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        state.backdropFilterFunctions.splice(index, 1);
        renderBackdropFilters();
        updateAll();
      });
    });

    elements.backdropFilterContainer.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        const fn = state.backdropFilterFunctions[index];
        if (!fn) return;
        const prop = e.target.dataset.prop;
        fn[prop] = e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
        const valueSpan = e.target.nextElementSibling;
        if (valueSpan && valueSpan.classList.contains('filter-value')) {
          const def = FILTER_TYPES.find(f => f.id === fn.type);
          valueSpan.textContent = fn[prop] + (def ? def.unit : '');
        }
        updateAll();
      });
    });

    elements.backdropFilterContainer.querySelectorAll('input[type="color"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        const fn = state.backdropFilterFunctions[index];
        if (!fn) return;
        fn.color = e.target.value;
        updateAll();
      });
    });
  }

  function renderBackdropFilterControls(fn, index) {
    const def = FILTER_TYPES.find(f => f.id === fn.type);
    if (!def) return '';

    let html = '';
    if (def.id === 'drop-shadow') {
      html += `
        <div class="filter-control">
          <label>X Offset</label>
          <input type="range" min="-50" max="50" value="${fn.offsetX || 0}" data-index="${index}" data-prop="offsetX">
          <span class="filter-value">${fn.offsetX || 0}px</span>
        </div>
        <div class="filter-control">
          <label>Y Offset</label>
          <input type="range" min="-50" max="50" value="${fn.offsetY || 4}" data-index="${index}" data-prop="offsetY">
          <span class="filter-value">${fn.offsetY || 4}px</span>
        </div>
        <div class="filter-control">
          <label>Blur</label>
          <input type="range" min="0" max="50" value="${fn.blur || 8}" data-index="${index}" data-prop="blur">
          <span class="filter-value">${fn.blur || 8}px</span>
        </div>
        <div class="filter-control">
          <label>Color</label>
          <input type="color" value="${fn.color || '#000000'}" data-index="${index}" data-prop="color">
        </div>
        <div class="filter-control">
          <label>Opacity</label>
          <input type="range" min="0" max="1" step="0.01" value="${fn.opacity || 0.5}" data-index="${index}" data-prop="opacity">
          <span class="filter-value">${Math.round((fn.opacity || 0.5) * 100)}%</span>
        </div>
      `;
    } else {
      html += `
        <div class="filter-control">
          <label>${def.label}</label>
          <input type="range" min="${def.min}" max="${def.max}" step="${def.step}" value="${fn.value}" data-index="${index}" data-prop="value">
          <span class="filter-value">${fn.value}${def.unit}</span>
        </div>
      `;
    }
    return html;
  }

  // ============ Presets ============
  function renderPresets() {
    const presets = PRESETS[state.currentEditor] || [];
    elements.presetButtons.innerHTML = presets.map((preset, i) => `
      <button class="preset-btn" data-preset-index="${i}">${preset.name}</button>
    `).join('');

    elements.presetButtons.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.presetIndex);
        applyPreset(index);
        elements.presetButtons.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  function applyPreset(index) {
    const presets = PRESETS[state.currentEditor] || [];
    const preset = presets[index];
    if (!preset) return;

    if (state.currentEditor === 'box-shadow') {
      state.boxShadowLayers = preset.layers.map(l => ({ ...l }));
      state.boxShadowInset = preset.inset;
      elements.shadowInset.checked = preset.inset;
      elements.shadowLayers.value = state.boxShadowLayers.length;
      elements.shadowLayersValue.textContent = state.boxShadowLayers.length;
      renderBoxShadowLayers();
    } else if (state.currentEditor === 'text-shadow') {
      state.textShadowLayers = preset.layers.map(l => ({ ...l }));
      elements.textShadowLayers.value = state.textShadowLayers.length;
      elements.textShadowLayersValue.textContent = state.textShadowLayers.length;
      renderTextShadowLayers();
    } else if (state.currentEditor === 'filter') {
      state.filterFunctions = preset.functions.map(f => ({ ...f }));
      renderFilterFunctions();
    } else if (state.currentEditor === 'backdrop-filter') {
      state.backdropFilterFunctions = preset.functions.map(f => ({ ...f }));
      state.backdropBg = preset.bg || 'gradient';
      elements.backdropBg.value = state.backdropBg;
      renderBackdropFilters();
    }
    updateAll();
  }

  // ============ Randomize ============
  function randomize() {
    if (state.currentEditor === 'box-shadow') {
      const count = Math.floor(Math.random() * 5) + 2;
      state.boxShadowLayers = [];
      for (let i = 0; i < count; i++) {
        state.boxShadowLayers.push({
          x: Math.floor(Math.random() * 30) - 15,
          y: Math.floor(Math.random() * 30) - 5,
          blur: Math.floor(Math.random() * 40) + 4,
          spread: Math.floor(Math.random() * 10) - 5,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
          opacity: Math.random() * 0.4 + 0.1,
          inset: Math.random() > 0.8,
        });
      }
      state.boxShadowInset = Math.random() > 0.5;
      elements.shadowInset.checked = state.boxShadowInset;
      elements.shadowLayers.value = count;
      elements.shadowLayersValue.textContent = count;
      renderBoxShadowLayers();
    } else if (state.currentEditor === 'text-shadow') {
      const count = Math.floor(Math.random() * 4) + 1;
      state.textShadowLayers = [];
      for (let i = 0; i < count; i++) {
        state.textShadowLayers.push({
          x: Math.floor(Math.random() * 10) - 5,
          y: Math.floor(Math.random() * 10) - 2,
          blur: Math.floor(Math.random() * 20) + 2,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
      elements.textShadowLayers.value = count;
      elements.textShadowLayersValue.textContent = count;
      renderTextShadowLayers();
    } else if (state.currentEditor === 'filter') {
      const count = Math.floor(Math.random() * 4) + 2;
      state.filterFunctions = [];
      const types = FILTER_TYPES.filter(f => !f.hasColor);
      for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        state.filterFunctions.push({
          type: type.id,
          value: type.min + Math.random() * (type.max - type.min),
        });
      }
      renderFilterFunctions();
    } else if (state.currentEditor === 'backdrop-filter') {
      const count = Math.floor(Math.random() * 3) + 1;
      state.backdropFilterFunctions = [];
      const types = FILTER_TYPES.filter(f => f.id !== 'drop-shadow');
      for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        state.backdropFilterFunctions.push({
          type: type.id,
          value: type.min + Math.random() * (type.max - type.min),
        });
      }
      renderBackdropFilters();
    }
    updateAll();
  }

  function reset() {
    if (state.currentEditor === 'box-shadow') {
      state.boxShadowLayers = [
        { x: 0, y: 4, blur: 8, spread: 0, color: '#ff4fa3', opacity: 0.3, inset: false },
        { x: 0, y: 12, blur: 24, spread: -4, color: '#ff4fa3', opacity: 0.15, inset: false },
        { x: 0, y: 2, blur: 4, spread: -2, color: '#2ee6a6', opacity: 0.1, inset: false },
      ];
      state.boxShadowInset = false;
      elements.shadowInset.checked = false;
      elements.shadowLayers.value = 3;
      elements.shadowLayersValue.textContent = '3';
      renderBoxShadowLayers();
    } else if (state.currentEditor === 'text-shadow') {
      state.textShadowLayers = [
        { x: 0, y: 2, blur: 4, color: '#ff4fa3', opacity: 0.4 },
        { x: 0, y: 4, blur: 8, color: '#35c3ff', opacity: 0.2 },
      ];
      elements.textShadowLayers.value = 2;
      elements.textShadowLayersValue.textContent = '2';
      renderTextShadowLayers();
    } else if (state.currentEditor === 'filter') {
      state.filterFunctions = [
        { type: 'blur', value: 0 },
        { type: 'brightness', value: 100 },
        { type: 'contrast', value: 100 },
        { type: 'saturate', value: 100 },
      ];
      renderFilterFunctions();
    } else if (state.currentEditor === 'backdrop-filter') {
      state.backdropFilterFunctions = [
        { type: 'blur', value: 8 },
        { type: 'saturate', value: 120 },
      ];
      state.backdropBg = 'gradient';
      elements.backdropBg.value = 'gradient';
      renderBackdropFilters();
    }
    updateAll();
  }

  // ============ Update All ============
  function updateAll() {
    updatePreview();
    updateGeneratedCss();
    updateExportOutput();
  }

  function updatePreview() {
    // Box Shadow
    const boxShadow = generateBoxShadowCss();
    const previewElements = [
      elements.previewCard,
      elements.previewBtnPrimary,
      elements.previewBtnSecondary,
      elements.previewBtnGhost,
      elements.previewText,
      elements.previewImage,
    ];
    if (state.syncPreviews) {
      previewElements.forEach(el => {
        if (el) el.style.boxShadow = boxShadow;
      });
    } else {
      elements.previewCard.style.boxShadow = boxShadow;
    }

    // Text Shadow
    const textShadow = generateTextShadowCss();
    const textElements = elements.previewText.querySelectorAll('h1, h2, p, code');
    textElements.forEach(el => {
      el.style.textShadow = textShadow;
    });

    // Filter
    const filter = generateFilterCss();
    if (state.syncPreviews) {
      previewElements.forEach(el => {
        if (el) el.style.filter = filter;
      });
    } else {
      elements.previewImage.style.filter = filter;
    }

    // Backdrop Filter
    const backdropFilter = generateBackdropFilterCss();
    elements.previewCard.style.backdropFilter = backdropFilter;
    updateBackdropPreview();
  }

  function updateBackdropPreview() {
    const bg = state.backdropBg;
    if (bg === 'gradient') {
      elements.previewCard.style.background = 'linear-gradient(135deg, var(--card), var(--bg))';
    } else if (bg === 'image') {
      elements.previewCard.style.background = 'url("https://picsum.photos/seed/shadowplay/400/300") center/cover';
    } else if (bg === 'video') {
      elements.previewCard.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3))';
      elements.previewCard.style.backgroundSize = '200% 200%';
      elements.previewCard.style.animation = 'gradientShift 3s ease infinite';
    } else if (bg === 'noise') {
      elements.previewCard.style.background = 'var(--card)';
      elements.previewCard.style.backgroundImage = `
        url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
      `;
    }
  }

  // ============ CSS Generation ============
  function generateBoxShadowCss() {
    return state.boxShadowLayers.map(layer => {
      const color = hexToRgba(layer.color, layer.opacity);
      const inset = (state.boxShadowInset || layer.inset) ? 'inset ' : '';
      return `${inset}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${color}`;
    }).join(', ');
  }

  function generateTextShadowCss() {
    return state.textShadowLayers.map(layer => {
      const color = hexToRgba(layer.color, layer.opacity);
      return `${layer.x}px ${layer.y}px ${layer.blur}px ${color}`;
    }).join(', ');
  }

  function generateFilterCss() {
    return state.filterFunctions.map(fn => {
      const def = FILTER_TYPES.find(f => f.id === fn.type);
      if (!def) return '';

      if (def.id === 'drop-shadow') {
        const color = hexToRgba(fn.color || '#000000', fn.opacity || 0.5);
        return `drop-shadow(${fn.offsetX || 0}px ${fn.offsetY || 4}px ${fn.blur || 8}px ${color})`;
      }

      const value = fn.value;
      switch (def.id) {
        case 'blur': return `blur(${value}px)`;
        case 'brightness': return `brightness(${value / 100})`;
        case 'contrast': return `contrast(${value / 100})`;
        case 'saturate': return `saturate(${value / 100})`;
        case 'grayscale': return `grayscale(${value / 100})`;
        case 'sepia': return `sepia(${value / 100})`;
        case 'hue-rotate': return `hue-rotate(${value}deg)`;
        case 'invert': return `invert(${value / 100})`;
        case 'opacity': return `opacity(${value / 100})`;
        default: return '';
      }
    }).filter(Boolean).join(' ') || 'none';
  }

  function generateBackdropFilterCss() {
    return state.backdropFilterFunctions.map(fn => {
      const def = FILTER_TYPES.find(f => f.id === fn.type);
      if (!def) return '';

      if (def.id === 'drop-shadow') {
        const color = hexToRgba(fn.color || '#000000', fn.opacity || 0.5);
        return `drop-shadow(${fn.offsetX || 0}px ${fn.offsetY || 4}px ${fn.blur || 8}px ${color})`;
      }

      const value = fn.value;
      switch (def.id) {
        case 'blur': return `blur(${value}px)`;
        case 'brightness': return `brightness(${value / 100})`;
        case 'contrast': return `contrast(${value / 100})`;
        case 'saturate': return `saturate(${value / 100})`;
        case 'grayscale': return `grayscale(${value / 100})`;
        case 'sepia': return `sepia(${value / 100})`;
        case 'hue-rotate': return `hue-rotate(${value}deg)`;
        case 'invert': return `invert(${value / 100})`;
        case 'opacity': return `opacity(${value / 100})`;
        default: return '';
      }
    }).filter(Boolean).join(' ') || 'none';
  }

  function updateGeneratedCss() {
    elements.generatedCss.value = `box-shadow: ${generateBoxShadowCss()};`;
    elements.generatedTextCss.value = `text-shadow: ${generateTextShadowCss()};`;
    elements.generatedFilterCss.value = `filter: ${generateFilterCss()};`;
    elements.generatedBackdropCss.value = `backdrop-filter: ${generateBackdropFilterCss()};`;
  }

  // ============ Export ============
  function updateExportOutput() {
    const format = state.exportFormat;
    let output = '';

    if (format === 'css') {
      output = generateCssExport();
    } else if (format === 'tailwind') {
      output = generateTailwindExport();
    } else if (format === 'custom-props') {
      output = generateCustomPropsExport();
    }

    elements.exportOutput.value = output;
  }

  function generateCssExport() {
    let css = '/* CSS Shadow & Filter Playground Export */\n\n';
    css += `.shadow-element {\n  box-shadow: ${generateBoxShadowCss()};\n}\n\n`;
    css += `.text-shadow-element {\n  text-shadow: ${generateTextShadowCss()};\n}\n\n`;
    css += `.filter-element {\n  filter: ${generateFilterCss()};\n}\n\n`;
    css += `.backdrop-filter-element {\n  backdrop-filter: ${generateBackdropFilterCss()};\n}\n`;
    return css;
  }

  function generateTailwindExport() {
    // Tailwind arbitrary values
    const boxShadow = generateBoxShadowCss().replace(/ /g, '_').replace(/,/g, ',_');
    const textShadow = generateTextShadowCss().replace(/ /g, '_').replace(/,/g, ',_');
    const filter = generateFilterCss().replace(/ /g, '_');
    const backdropFilter = generateBackdropFilterCss().replace(/ /g, '_');

    let tw = '/* Tailwind CSS Export (arbitrary values) */\n\n';
    tw += '<!-- Box Shadow -->\n';
    tw += '<div class="shadow-[' + boxShadow + ']">Box Shadow</div>\n\n';
    tw += '<!-- Text Shadow -->\n';
    tw += '<p class="text-shadow-[' + textShadow + ']">Text Shadow</p>\n\n';
    tw += '<!-- Filter -->\n';
    tw += '<div class="filter-[' + filter + ']">Filter</div>\n\n';
    tw += '<!-- Backdrop Filter -->\n';
    tw += '<div class="backdrop-filter-[' + backdropFilter + ']">Backdrop Filter</div>\n\n';
    tw += '/* Add to tailwind.config.js for reuse: */\n';
    tw += '/* theme: { extend: { boxShadow: { custom: \'' + boxShadow + '\' }, textShadow: { custom: \'' + textShadow + '\' }, filter: { custom: \'' + filter + '\' }, backdropFilter: { custom: \'' + backdropFilter + '\' } } } */';
    return tw;
  }

  function generateCustomPropsExport() {
    let css = '/* CSS Custom Properties Export */\n\n';
    css += ':root {\n';
    css += '  --shadow-box: ' + generateBoxShadowCss() + ';\n';
    css += '  --shadow-text: ' + generateTextShadowCss() + ';\n';
    css += '  --filter-main: ' + generateFilterCss() + ';\n';
    css += '  --filter-backdrop: ' + generateBackdropFilterCss() + ';\n';
    css += '}\n\n';
    css += '.element {\n  box-shadow: var(--shadow-box);\n  text-shadow: var(--shadow-text);\n  filter: var(--filter-main);\n  backdrop-filter: var(--filter-backdrop);\n}';
    return css;
  }

  function copyExport() {
    navigator.clipboard.writeText(elements.exportOutput.value).then(() => {
      showToast('Copied to clipboard!');
    });
  }

  function downloadExport() {
    const format = state.exportFormat;
    const ext = format === 'css' ? 'css' : format === 'tailwind' ? 'html' : 'css';
    const blob = new Blob([elements.exportOutput.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadow-playground-export.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded!');
  }

  // ============ Helpers ============
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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

  function renderAll() {
    renderBoxShadowLayers();
    renderTextShadowLayers();
    renderFilterFunctions();
    renderBackdropFilters();
    renderPresets();
    updateAll();
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