const CSSGridFlexboxGenerator = (() => {
  let gridColumns = ['1fr', '1fr', '1fr'];
  let gridRows = ['auto', 'auto'];
  let flexItems = [
    { flex: '1 1 auto', alignSelf: 'auto', order: '0', basis: 'auto' },
    { flex: '1 1 auto', alignSelf: 'auto', order: '0', basis: 'auto' },
    { flex: '1 1 auto', alignSelf: 'auto', order: '0', basis: 'auto' }
  ];
  let breakpoints = [];
  let currentDevice = 'desktop';
  let layoutMode = 'grid';

  const elements = {};

  const PRESET_LAYOUTS = {
    'holy-grail': {
      mode: 'grid',
      columns: ['1fr', '3fr', '1fr'],
      rows: ['auto', '1fr', 'auto'],
      areas: 'header header header\nsidebar main aside\nfooter footer footer',
      gap: 16
    },
    'sidebar': {
      mode: 'grid',
      columns: ['250px', '1fr'],
      rows: ['auto', '1fr'],
      areas: 'header header\nsidebar main\nfooter footer',
      gap: 20
    },
    'card-grid': {
      mode: 'grid',
      columns: 'repeat(auto-fit, minmax(280px, 1fr))',
      rows: 'auto',
      gap: 24
    },
    'centered': {
      mode: 'flexbox',
      direction: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20
    },
    'navbar': {
      mode: 'flexbox',
      direction: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    },
    'hero': {
      mode: 'grid',
      columns: ['1fr', '1fr'],
      rows: ['1fr'],
      gap: 40
    },
    'dashboard': {
      mode: 'grid',
      columns: ['280px', '1fr'],
      rows: ['auto', '1fr'],
      areas: 'sidebar header\nsidebar main\nsidebar footer',
      gap: 0
    },
    'masonry': {
      mode: 'grid',
      columns: 'repeat(auto-fill, minmax(200px, 1fr))',
      rows: 'masonry',
      gap: 16
    }
  };

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    renderTracks();
    renderFlexItems();
    generateCSS();
    updatePreview();
  }

  function cacheElements() {
    // Layout mode
    elements.layoutModeRadios = document.querySelectorAll('input[name="layout-mode"]');
    elements.gridControls = document.getElementById('grid-controls');
    elements.flexControls = document.getElementById('flex-controls');

    // Grid
    elements.gridColumns = document.getElementById('grid-columns');
    elements.gridRows = document.getElementById('grid-rows');
    elements.gridGapRow = document.getElementById('grid-gap-row');
    elements.gridGapCol = document.getElementById('grid-gap-col');
    elements.gridAlignItems = document.getElementById('grid-align-items');
    elements.gridJustifyItems = document.getElementById('grid-justify-items');
    elements.gridAlignContent = document.getElementById('grid-align-content');
    elements.gridJustifyContent = document.getElementById('grid-justify-content');
    elements.gridAutoFlowDense = document.getElementById('grid-auto-flow-dense');
    elements.gridAutoFlowColumn = document.getElementById('grid-auto-flow-column');
    elements.gridAreas = document.getElementById('grid-areas');
    elements.btnAddColumn = document.getElementById('btn-add-column');
    elements.btnAddRow = document.getElementById('btn-add-row');

    // Flexbox
    elements.flexDirection = document.getElementById('flex-direction');
    elements.flexWrap = document.getElementById('flex-wrap');
    elements.flexGap = document.getElementById('flex-gap');
    elements.flexAlignItems = document.getElementById('flex-align-items');
    elements.flexJustifyContent = document.getElementById('flex-justify-content');
    elements.flexAlignContent = document.getElementById('flex-align-content');
    elements.flexAlignSelf = document.getElementById('flex-align-self');
    elements.flexItems = document.getElementById('flex-items');
    elements.btnAddFlexItem = document.getElementById('btn-add-flex-item');

    // Breakpoints
    elements.breakpoints = document.getElementById('breakpoints');
    elements.btnAddBreakpoint = document.getElementById('btn-add-breakpoint');

    // Actions
    elements.btnGenerate = document.getElementById('btn-generate');
    elements.btnPresetLayout = document.getElementById('btn-preset-layout');
    elements.btnReset = document.getElementById('btn-reset');

    // Preview
    elements.deviceBtns = document.querySelectorAll('.device-btn');
    elements.layoutPreview = document.getElementById('layout-preview');
    elements.cssCode = document.getElementById('css-code');
    elements.quickCopy = document.getElementById('quick-copy');
    elements.btnCopyCss = document.getElementById('btn-copy-css');
    elements.btnDownloadCss = document.getElementById('btn-download-css');
    elements.btnCopyHtml = document.getElementById('btn-copy-html');
  }

  function bindEvents() {
    // Layout mode switch
    elements.layoutModeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        layoutMode = radio.value;
        elements.gridControls.hidden = layoutMode !== 'grid';
        elements.flexControls.hidden = layoutMode === 'grid';
        generateCSS();
        updatePreview();
      });
    });

    // Grid events
    elements.btnAddColumn.addEventListener('click', () => {
      gridColumns.push('1fr');
      renderTracks();
      generateCSS();
      updatePreview();
    });
    elements.btnAddRow.addEventListener('click', () => {
      gridRows.push('auto');
      renderTracks();
      generateCSS();
      updatePreview();
    });

    elements.gridGapRow.addEventListener('input', () => { generateCSS(); updatePreview(); });
    elements.gridGapCol.addEventListener('input', () => { generateCSS(); updatePreview(); });
    elements.gridAlignItems.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.gridJustifyItems.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.gridAlignContent.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.gridJustifyContent.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.gridAutoFlowDense.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.gridAutoFlowColumn.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.gridAreas.addEventListener('input', () => { generateCSS(); updatePreview(); });

    // Flexbox events
    elements.flexDirection.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.flexWrap.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.flexGap.addEventListener('input', () => { generateCSS(); updatePreview(); });
    elements.flexAlignItems.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.flexJustifyContent.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.flexAlignContent.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.flexAlignSelf.addEventListener('change', () => { generateCSS(); updatePreview(); });
    elements.btnAddFlexItem.addEventListener('click', () => {
      flexItems.push({ flex: '1 1 auto', alignSelf: 'auto', order: '0', basis: 'auto' });
      renderFlexItems();
      generateCSS();
      updatePreview();
    });

    // Breakpoints
    elements.btnAddBreakpoint.addEventListener('click', addBreakpoint);

    // Actions
    elements.btnGenerate.addEventListener('click', () => { generateCSS(); showToast('CSS generated!'); });
    elements.btnPresetLayout.addEventListener('click', showPresetMenu);
    elements.btnReset.addEventListener('click', resetAll);

    // Device preview
    elements.deviceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.deviceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDevice = btn.dataset.device;
        updatePreview();
      });
    });

    // Export
    elements.btnCopyCss.addEventListener('click', copyCSS);
    elements.btnDownloadCss.addEventListener('click', downloadCSS);
    elements.btnCopyHtml.addEventListener('click', copyHTML);
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

  function renderTracks() {
    // Grid columns
    elements.gridColumns.innerHTML = '';
    gridColumns.forEach((col, i) => {
      const div = document.createElement('div');
      div.className = 'track-item';
      div.innerHTML = `
        <input type="text" value="${escapeHtml(col)}" placeholder="1fr" data-index="${i}" data-type="column">
        <select data-index="${i}" data-type="column-unit">
          <option value="fr" ${col.endsWith('fr') ? 'selected' : ''}>fr</option>
          <option value="px" ${col.endsWith('px') ? 'selected' : ''}>px</option>
          <option value="%" ${col.endsWith('%') ? 'selected' : ''}>%</option>
          <option value="auto" ${col === 'auto' ? 'selected' : ''}>auto</option>
          <option value="minmax" ${col.startsWith('minmax') ? 'selected' : ''}>minmax()</option>
          <option value="repeat" ${col.startsWith('repeat') ? 'selected' : ''}>repeat()</option>
        </select>
        <button class="btn-sm" data-index="${i}" data-type="remove-column">×</button>
      `;
      elements.gridColumns.appendChild(div);
    });

    // Grid rows
    elements.gridRows.innerHTML = '';
    gridRows.forEach((row, i) => {
      const div = document.createElement('div');
      div.className = 'track-item';
      div.innerHTML = `
        <input type="text" value="${escapeHtml(row)}" placeholder="auto" data-index="${i}" data-type="row">
        <select data-index="${i}" data-type="row-unit">
          <option value="fr" ${row.endsWith('fr') ? 'selected' : ''}>fr</option>
          <option value="px" ${row.endsWith('px') ? 'selected' : ''}>px</option>
          <option value="%" ${row.endsWith('%') ? 'selected' : ''}>%</option>
          <option value="auto" ${row === 'auto' ? 'selected' : ''}>auto</option>
          <option value="minmax" ${row.startsWith('minmax') ? 'selected' : ''}>minmax()</option>
        </select>
        <button class="btn-sm" data-index="${i}" data-type="remove-row">×</button>
      `;
      elements.gridRows.appendChild(div);
    });

    // Bind track events
    document.querySelectorAll('.track-item input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const type = e.target.dataset.type;
        if (type === 'column') gridColumns[idx] = e.target.value;
        else gridRows[idx] = e.target.value;
        generateCSS();
        updatePreview();
      });
    });

    document.querySelectorAll('.track-item select').forEach(select => {
      select.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const type = e.target.dataset.type;
        const value = e.target.value;
        let newVal = value;
        if (value === 'minmax') newVal = 'minmax(100px, 1fr)';
        else if (value === 'repeat') newVal = 'repeat(3, 1fr)';
        if (type === 'column-unit') gridColumns[idx] = newVal;
        else gridRows[idx] = newVal;
        renderTracks();
        generateCSS();
        updatePreview();
      });
    });

    document.querySelectorAll('.track-item button[data-type="remove-column"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (gridColumns.length > 1) {
          gridColumns.splice(idx, 1);
          renderTracks();
          generateCSS();
          updatePreview();
        }
      });
    });

    document.querySelectorAll('.track-item button[data-type="remove-row"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (gridRows.length > 1) {
          gridRows.splice(idx, 1);
          renderTracks();
          generateCSS();
          updatePreview();
        }
      });
    });
  }

  function renderFlexItems() {
    elements.flexItems.innerHTML = '';
    flexItems.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'track-item';
      div.innerHTML = `
        <input type="text" value="${escapeHtml(item.flex)}" placeholder="1 1 auto" data-index="${i}" data-prop="flex" style="flex: 1;">
        <input type="text" value="${escapeHtml(item.basis)}" placeholder="auto" data-index="${i}" data-prop="basis" style="width: 80px;">
        <select data-index="${i}" data-prop="alignSelf">
          <option value="auto" ${item.alignSelf === 'auto' ? 'selected' : ''}>auto</option>
          <option value="stretch" ${item.alignSelf === 'stretch' ? 'selected' : ''}>stretch</option>
          <option value="flex-start" ${item.alignSelf === 'flex-start' ? 'selected' : ''}>flex-start</option>
          <option value="center" ${item.alignSelf === 'center' ? 'selected' : ''}>center</option>
          <option value="flex-end" ${item.alignSelf === 'flex-end' ? 'selected' : ''}>flex-end</option>
          <option value="baseline" ${item.alignSelf === 'baseline' ? 'selected' : ''}>baseline</option>
        </select>
        <input type="number" value="${escapeHtml(item.order)}" data-index="${i}" data-prop="order" style="width: 50px;">
        <button class="btn-sm" data-index="${i}" data-type="remove-flex-item">×</button>
      `;
      elements.flexItems.appendChild(div);
    });

    // Bind flex item events
    document.querySelectorAll('#flex-items input[data-prop]').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const prop = e.target.dataset.prop;
        flexItems[idx][prop] = e.target.value;
        generateCSS();
        updatePreview();
      });
    });

    document.querySelectorAll('#flex-items select[data-prop]').forEach(select => {
      select.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const prop = e.target.dataset.prop;
        flexItems[idx][prop] = e.target.value;
        generateCSS();
        updatePreview();
      });
    });

    document.querySelectorAll('#flex-items button[data-type="remove-flex-item"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (flexItems.length > 1) {
          flexItems.splice(idx, 1);
          renderFlexItems();
          generateCSS();
          updatePreview();
        }
      });
    });
  }

  function addBreakpoint() {
    const div = document.createElement('div');
    div.className = 'breakpoint-row';
    div.innerHTML = `
      <select class="bp-condition">
        <option value="min-width">min-width</option>
        <option value="max-width">max-width</option>
      </select>
      <input type="number" class="bp-value" placeholder="768" min="0" max="2000" step="1">
      <span>px</span>
      <button class="btn-sm btn-secondary" type="button">Remove</button>
    `;
    elements.breakpoints.appendChild(div);

    div.querySelector('button').addEventListener('click', () => {
      div.remove();
      generateCSS();
    });

    div.querySelectorAll('select, input').forEach(el => {
      el.addEventListener('change', generateCSS);
    });
  }

  function generateCSS() {
    let css = '';
    const selector = '.layout';

    if (layoutMode === 'grid') {
      css = generateGridCSS(selector);
    } else {
      css = generateFlexboxCSS(selector);
    }

    // Add responsive breakpoints
    if (breakpoints.length > 0) {
      css += '\n\n' + generateResponsiveCSS(selector);
    }

    elements.cssCode.textContent = css;
    highlightCSS();
    renderQuickCopy(css);
  }

  function generateGridCSS(selector) {
    let css = `${selector} {\n  display: grid;\n`;

    // Columns
    const cols = gridColumns.join(' ');
    if (cols.includes('repeat') || cols.includes('minmax') || cols.includes('auto-fit') || cols.includes('auto-fill')) {
      css += `  grid-template-columns: ${cols};\n`;
    } else {
      css += `  grid-template-columns: ${cols};\n`;
    }

    // Rows
    const rows = gridRows.join(' ');
    css += `  grid-template-rows: ${rows};\n`;

    // Gap
    const gapRow = elements.gridGapRow.value;
    const gapCol = elements.gridGapCol.value;
    if (gapRow === gapCol) {
      css += `  gap: ${gapRow}px;\n`;
    } else {
      css += `  row-gap: ${gapRow}px;\n  column-gap: ${gapCol}px;\n`;
    }

    // Alignment
    css += `  align-items: ${elements.gridAlignItems.value};\n`;
    css += `  justify-items: ${elements.gridJustifyItems.value};\n`;
    css += `  align-content: ${elements.gridAlignContent.value};\n`;
    css += `  justify-content: ${elements.gridJustifyContent.value};\n`;

    // Auto flow
    let autoFlow = 'row';
    if (elements.gridAutoFlowColumn.checked) autoFlow = 'column';
    if (elements.gridAutoFlowDense.checked) autoFlow += ' dense';
    css += `  grid-auto-flow: ${autoFlow};\n`;

    // Grid areas
    const areas = elements.gridAreas.value.trim();
    if (areas) {
      const areaLines = areas.split('\n').map(l => l.trim()).filter(l => l);
      if (areaLines.length > 0) {
        css += `  grid-template-areas:\n`;
        areaLines.forEach((line, i) => {
          css += `    "${line}"${i === areaLines.length - 1 ? ';' : ''}\n`;
        });
      }
    }

    css += '}';

    // Item styles for grid areas
    if (areas) {
      const areaNames = new Set();
      areas.split(/\s+/).forEach(name => {
        if (name && name !== '.') areaNames.add(name);
      });
      areaNames.forEach(name => {
        css += `\n\n${selector}__${name} {\n  grid-area: ${name};\n}`;
      });
    }

    return css;
  }

  function generateFlexboxCSS(selector) {
    let css = `${selector} {\n  display: flex;\n`;
    css += `  flex-direction: ${elements.flexDirection.value};\n`;
    css += `  flex-wrap: ${elements.flexWrap.value};\n`;
    css += `  gap: ${elements.flexGap.value}px;\n`;
    css += `  align-items: ${elements.flexAlignItems.value};\n`;
    css += `  justify-content: ${elements.flexJustifyContent.value};\n`;
    css += `  align-content: ${elements.flexAlignContent.value};\n`;
    css += '}';

    // Item styles
    flexItems.forEach((item, i) => {
      css += `\n\n${selector}__item:nth-child(${i + 1}) {\n`;
      css += `  flex: ${item.flex};\n`;
      if (item.basis !== 'auto') css += `  flex-basis: ${item.basis};\n`;
      if (item.alignSelf !== 'auto') css += `  align-self: ${item.alignSelf};\n`;
      if (item.order !== '0') css += `  order: ${item.order};\n`;
      css += '}';
    });

    return css;
  }

  function generateResponsiveCSS(selector) {
    let css = '';
    breakpoints.forEach(bp => {
      const condition = bp.condition;
      const value = bp.value;
      css += `@media (${condition}: ${value}px) {\n`;
      css += `  ${selector} {\n`;

      if (layoutMode === 'grid') {
        // Responsive grid adjustments
        css += `    grid-template-columns: 1fr;\n`;
        if (condition === 'max-width') {
          css += `    grid-template-rows: auto;\n`;
        }
      } else {
        css += `    flex-direction: column;\n`;
      }
      css += `  }\n`;
      css += '}\n';
    });
    return css;
  }

  function highlightCSS() {
    const code = elements.cssCode.textContent;
    const highlighted = code
      .replace(/^(\s*)([.#]?[\w-]+)(\s*{)/gm, '$1<span class="css-selector">$2</span>$3')
      .replace(/(\s+)([\w-]+)(\s*:)/g, '$1<span class="css-property">$2</span>$3')
      .replace(/:\s*([^;{}]+);/g, ': <span class="css-value">$1</span>;')
      .replace(/(\{|\})/g, '<span class="css-brace">$1</span>')
      .replace(/\/\*[\s\S]*?\*\//g, '<span class="css-comment">$&</span>');
    elements.cssCode.innerHTML = highlighted;
  }

  function renderQuickCopy(css) {
    const properties = {};
    const lines = css.split('\n');
    let inRule = false;
    let currentSelector = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.endsWith('{')) {
        inRule = true;
        currentSelector = trimmed.slice(0, -1).trim();
      } else if (trimmed === '}') {
        inRule = false;
      } else if (inRule && trimmed.includes(':')) {
        const [prop, val] = trimmed.split(':').map(s => s.trim());
        if (!properties[prop]) properties[prop] = val.replace(';', '');
      }
    });

    const keyProps = ['display', 'grid-template-columns', 'grid-template-rows', 'gap', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content'];
    elements.quickCopy.innerHTML = '';

    keyProps.forEach(prop => {
      if (properties[prop]) {
        const btn = document.createElement('button');
        btn.className = 'quick-copy-btn';
        btn.textContent = `${prop}: ${properties[prop]}`;
        btn.dataset.copy = `${prop}: ${properties[prop]};`;
        btn.addEventListener('click', () => quickCopy(btn.dataset.copy, btn));
        elements.quickCopy.appendChild(btn);
      }
    });

    // Full CSS button
    const fullBtn = document.createElement('button');
    fullBtn.className = 'quick-copy-btn';
    fullBtn.textContent = 'Full CSS';
    fullBtn.dataset.copy = css;
    fullBtn.addEventListener('click', () => quickCopy(fullBtn.dataset.copy, fullBtn));
    elements.quickCopy.appendChild(fullBtn);
  }

  function quickCopy(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1500);
      showToast('Copied!');
    });
  }

  function updatePreview() {
    elements.layoutPreview.className = 'layout-preview ' + layoutMode;
    elements.layoutPreview.dataset.device = currentDevice;
    elements.layoutPreview.innerHTML = '';

    if (layoutMode === 'grid') {
      // Create grid items for preview
      const colCount = gridColumns.length;
      const rowCount = gridRows.length;
      const itemCount = Math.min(colCount * rowCount, 12);

      // Apply inline styles
      elements.layoutPreview.style.gridTemplateColumns = gridColumns.join(' ');
      elements.layoutPreview.style.gridTemplateRows = gridRows.join(' ');
      elements.layoutPreview.style.gap = elements.gridGapRow.value + 'px';
      elements.layoutPreview.style.alignItems = elements.gridAlignItems.value;
      elements.layoutPreview.style.justifyItems = elements.gridJustifyItems.value;

      for (let i = 0; i < itemCount; i++) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.textContent = `${i + 1}`;
        elements.layoutPreview.appendChild(item);
      }
    } else {
      // Flexbox preview
      elements.layoutPreview.style.flexDirection = elements.flexDirection.value;
      elements.layoutPreview.style.flexWrap = elements.flexWrap.value;
      elements.layoutPreview.style.gap = elements.flexGap.value + 'px';
      elements.layoutPreview.style.alignItems = elements.flexAlignItems.value;
      elements.layoutPreview.style.justifyContent = elements.flexJustifyContent.value;
      elements.layoutPreview.style.alignContent = elements.flexAlignContent.value;

      flexItems.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'preview-item';
        el.textContent = `Item ${i + 1}`;
        el.style.flex = item.flex;
        if (item.basis !== 'auto') el.style.flexBasis = item.basis;
        if (item.alignSelf !== 'auto') el.style.alignSelf = item.alignSelf;
        if (item.order !== '0') el.style.order = item.order;
        elements.layoutPreview.appendChild(el);
      });
    }
  }

  function showPresetMenu() {
    const menu = document.createElement('div');
    menu.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
      padding: 1.5rem; box-shadow: var(--shadow); z-index: 1000; min-width: 250px;
    `;
    menu.innerHTML = '<h3 style="margin-bottom: 1rem;">Preset Layouts</h3>' +
      Object.entries(PRESET_LAYOUTS).map(([key, preset]) => `
        <button class="btn secondary" style="width: 100%; margin: 0.25rem 0; text-align: left;" data-preset="${key}">
          ${key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </button>
      `).join('') +
      '<button class="btn" style="width: 100%; margin-top: 0.5rem;" id="close-preset">Cancel</button>';

    document.body.appendChild(menu);

    menu.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        applyPreset(btn.dataset.preset);
        menu.remove();
      });
    });

    menu.querySelector('#close-preset').addEventListener('click', () => menu.remove());
  }

  function applyPreset(key) {
    const preset = PRESET_LAYOUTS[key];
    if (!preset) return;

    layoutMode = preset.mode;
    document.querySelector(`input[name="layout-mode"][value="${layoutMode}"]`).checked = true;
    elements.gridControls.hidden = layoutMode !== 'grid';
    elements.flexControls.hidden = layoutMode === 'grid';

    if (preset.columns) {
      if (typeof preset.columns === 'string') {
        gridColumns = [preset.columns];
      } else {
        gridColumns = [...preset.columns];
      }
    }
    if (preset.rows) {
      if (typeof preset.rows === 'string') {
        gridRows = [preset.rows];
      } else {
        gridRows = [...preset.rows];
      }
    }
    if (preset.areas) elements.gridAreas.value = preset.areas;
    if (preset.gap) {
      elements.gridGapRow.value = preset.gap;
      elements.gridGapCol.value = preset.gap;
    }
    if (preset.direction) elements.flexDirection.value = preset.direction;
    if (preset.alignItems) elements.flexAlignItems.value = preset.alignItems;
    if (preset.justifyContent) elements.flexJustifyContent.value = preset.justifyContent;

    renderTracks();
    renderFlexItems();
    generateCSS();
    updatePreview();
    showToast(`Applied ${key} layout`);
  }

  function resetAll() {
    gridColumns = ['1fr', '1fr', '1fr'];
    gridRows = ['auto', 'auto'];
    flexItems = [
      { flex: '1 1 auto', alignSelf: 'auto', order: '0', basis: 'auto' },
      { flex: '1 1 auto', alignSelf: 'auto', order: '0', basis: 'auto' },
      { flex: '1 1 auto', alignSelf: 'auto', order: '0', basis: 'auto' }
    ];
    breakpoints = [];
    elements.gridGapRow.value = 16;
    elements.gridGapCol.value = 16;
    elements.gridAlignItems.value = 'stretch';
    elements.gridJustifyItems.value = 'stretch';
    elements.gridAlignContent.value = 'start';
    elements.gridJustifyContent.value = 'start';
    elements.gridAutoFlowDense.checked = true;
    elements.gridAutoFlowColumn.checked = false;
    elements.gridAreas.value = '';
    elements.flexDirection.value = 'row';
    elements.flexWrap.value = 'wrap';
    elements.flexGap.value = 16;
    elements.flexAlignItems.value = 'stretch';
    elements.flexJustifyContent.value = 'flex-start';
    elements.flexAlignContent.value = 'stretch';
    elements.flexAlignSelf.value = 'auto';
    elements.breakpoints.innerHTML = '';

    renderTracks();
    renderFlexItems();
    generateCSS();
    updatePreview();
    showToast('Reset to defaults');
  }

  function copyCSS() {
    const css = elements.cssCode.textContent;
    if (!css) { showToast('Nothing to copy'); return; }
    navigator.clipboard.writeText(css).then(() => showToast('CSS copied!'));
  }

  function downloadCSS() {
    const css = elements.cssCode.textContent;
    if (!css) { showToast('Nothing to download'); return; }
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'layout.css';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded layout.css');
  }

  function copyHTML() {
    let html = '<div class="layout">\n';

    if (layoutMode === 'grid') {
      const areas = elements.gridAreas.value.trim();
      if (areas) {
        const areaLines = areas.split('\n').map(l => l.trim()).filter(l => l);
        const areaNames = new Set();
        areas.split(/\s+/).forEach(name => { if (name && name !== '.') areaNames.add(name); });
        areaNames.forEach(name => {
          html += `  <div class="layout__${name}">${name}</div>\n`;
        });
      } else {
        const colCount = gridColumns.length;
        const rowCount = gridRows.length;
        const itemCount = Math.min(colCount * rowCount, 12);
        for (let i = 0; i < itemCount; i++) {
          html += `  <div class="layout__item">Item ${i + 1}</div>\n`;
        }
      }
    } else {
      flexItems.forEach((_, i) => {
        html += `  <div class="layout__item">Item ${i + 1}</div>\n`;
      });
    }

    html += '</div>';

    navigator.clipboard.writeText(html).then(() => showToast('HTML copied!'));
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
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