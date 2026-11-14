const SVGOptimizer = (() => {
  let originalSvg = '';
  let optimizedSvg = '';
  let originalSize = 0;
  let optimizedSize = 0;

  const elements = {};

  const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200" viewBox="0 0 100 100">
  <!-- Sample SVG for testing -->
  <metadata>Created with SVG Optimizer</metadata>
  <title>Sample Icon</title>
  <desc>A simple circle with gradient</desc>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff4fa3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#35c3ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g fill="none" stroke="none">
    <circle cx="50" cy="50" r="40" fill="url(#grad1)" stroke="#000000" stroke-width="1" opacity="1" display="inline" />
    <rect x="10" y="10" width="20" height="20" fill="#ff4fa3" opacity="0" />
    <path d="M 10 10 L 20 20 L 30 10" fill="none" stroke="#2ee6a6" stroke-width="2" />
  </g>
  <text x="50" y="50" font-family="Arial" font-size="12" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">SVG</text>
</svg>`;

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
  }

  function cacheElements() {
    elements.svgInput = document.getElementById('svg-input');
    elements.svgFile = document.getElementById('svg-file');
    elements.svgOutput = document.getElementById('svg-output');
    elements.svgCode = document.getElementById('svg-code');
    elements.svgPreview = document.getElementById('svg-preview');
    elements.svgDiff = document.getElementById('svg-diff');
    elements.svgOriginal = document.getElementById('svg-original');
    elements.svgOptimizedSide = document.getElementById('svg-optimized-side');
    elements.statsContainer = document.getElementById('stats-container');
    elements.statsGrid = document.getElementById('stats-grid');
    elements.precision = document.getElementById('precision');
    elements.precisionValue = document.getElementById('precision-value');
    elements.btnLoadFile = document.getElementById('btn-load-file');
    elements.btnLoadSample = document.getElementById('btn-load-sample');
    elements.btnClear = document.getElementById('btn-clear');
    elements.btnOptimize = document.getElementById('btn-optimize');
    elements.btnOptimizeAggressive = document.getElementById('btn-optimize-aggressive');
    elements.btnCopyOutput = document.getElementById('btn-copy-output');
    elements.btnDownloadOutput = document.getElementById('btn-download-output');
    elements.btnDownloadOriginal = document.getElementById('btn-download-original');
    elements.viewModeRadios = document.querySelectorAll('input[name="view-mode"]');

    // Option checkboxes
    elements.options = {
      removeComments: document.getElementById('opt-remove-comments'),
      removeMetadata: document.getElementById('opt-remove-metadata'),
      removeHidden: document.getElementById('opt-remove-hidden'),
      removeUnusedNs: document.getElementById('opt-remove-unused-ns'),
      cleanupAttrs: document.getElementById('opt-cleanup-attrs'),
      mergePaths: document.getElementById('opt-merge-paths'),
      convertShapes: document.getElementById('opt-convert-shapes'),
      optimizeColors: document.getElementById('opt-optimize-colors'),
      roundCoords: document.getElementById('opt-round-coords'),
      removeDimensions: document.getElementById('opt-remove-dimensions'),
      minify: document.getElementById('opt-minify')
    };
  }

  function bindEvents() {
    elements.btnLoadFile.addEventListener('click', () => elements.svgFile.click());
    elements.svgFile.addEventListener('change', loadFile);
    elements.btnLoadSample.addEventListener('click', loadSample);
    elements.btnClear.addEventListener('click', clearAll);
    elements.btnOptimize.addEventListener('click', () => optimize(false));
    elements.btnOptimizeAggressive.addEventListener('click', () => optimize(true));
    elements.btnCopyOutput.addEventListener('click', copyOutput);
    elements.btnDownloadOutput.addEventListener('click', () => downloadOutput(false));
    elements.btnDownloadOriginal.addEventListener('click', () => downloadOutput(true));

    elements.precision.addEventListener('input', () => {
      elements.precisionValue.textContent = elements.precision.value;
    });

    elements.viewModeRadios.forEach(radio => {
      radio.addEventListener('change', switchView);
    });
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

  function loadFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      elements.svgInput.value = evt.target.result;
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function loadSample() {
    elements.svgInput.value = SAMPLE_SVG;
    showToast('Sample SVG loaded');
  }

  function clearAll() {
    elements.svgInput.value = '';
    elements.svgCode.textContent = '';
    elements.svgPreview.innerHTML = '';
    elements.svgDiff.innerHTML = '';
    elements.svgOriginal.textContent = '';
    elements.svgOptimizedSide.textContent = '';
    elements.statsContainer.hidden = true;
    originalSvg = '';
    optimizedSvg = '';
    showToast('Cleared');
  }

  function optimize(aggressive) {
    originalSvg = elements.svgInput.value.trim();
    if (!originalSvg) {
      showToast('Please enter SVG first');
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(originalSvg, 'image/svg+xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        showToast('Invalid SVG: ' + parseError.textContent);
        return;
      }

      const svgElement = doc.documentElement;
      if (svgElement.tagName !== 'svg') {
        showToast('Root element must be <svg>');
        return;
      }

      originalSize = originalSvg.length;

      // Apply optimizations
      const options = getOptions(aggressive);
      optimizedSvg = optimizeSVG(svgElement, options);

      optimizedSize = optimizedSvg.length;
      renderOutput();
      showStats();
      showToast(aggressive ? 'Aggressively optimized!' : 'Optimized!');
    } catch (e) {
      showToast('Optimization failed: ' + e.message);
    }
  }

  function getOptions(aggressive) {
    const opts = {
      removeComments: elements.options.removeComments.checked,
      removeMetadata: elements.options.removeMetadata.checked,
      removeHidden: elements.options.removeHidden.checked,
      removeUnusedNs: elements.options.removeUnusedNs.checked,
      cleanupAttrs: elements.options.cleanupAttrs.checked,
      mergePaths: elements.options.mergePaths.checked,
      convertShapes: elements.options.convertShapes.checked,
      optimizeColors: elements.options.optimizeColors.checked,
      roundCoords: elements.options.roundCoords.checked,
      removeDimensions: elements.options.removeDimensions.checked,
      minify: elements.options.minify.checked,
      precision: parseInt(elements.precision.value)
    };

    if (aggressive) {
      // Enable all aggressive options
      Object.keys(opts).forEach(k => {
        if (typeof opts[k] === 'boolean') opts[k] = true;
      });
      opts.precision = 1;
    }

    return opts;
  }

  function optimizeSVG(svgElement, options) {
    // Clone to avoid modifying original
    const svg = svgElement.cloneNode(true);

    // 1. Remove comments
    if (options.removeComments) {
      removeComments(svg);
    }

    // 2. Remove metadata, title, desc
    if (options.removeMetadata) {
      svg.querySelectorAll('metadata, title, desc').forEach(el => el.remove());
    }

    // 3. Remove hidden elements
    if (options.removeHidden) {
      svg.querySelectorAll('[style*="display:none"], [style*="display: none"], [opacity="0"], [style*="opacity:0"], [style*="opacity: 0"]').forEach(el => el.remove());
    }

    // 4. Remove unused namespaces
    if (options.removeUnusedNs) {
      removeUnusedNamespaces(svg);
    }

    // 5. Cleanup attributes
    if (options.cleanupAttrs) {
      cleanupAttributes(svg);
    }

    // 6. Convert shapes to paths
    if (options.convertShapes) {
      convertShapesToPaths(svg);
    }

    // 7. Merge paths (basic)
    if (options.mergePaths) {
      mergePaths(svg);
    }

    // 8. Optimize colors
    if (options.optimizeColors) {
      optimizeColors(svg);
    }

    // 9. Round coordinates
    if (options.roundCoords) {
      roundCoordinates(svg, options.precision);
    }

    // 10. Remove width/height
    if (options.removeDimensions) {
      svg.removeAttribute('width');
      svg.removeAttribute('height');
    }

    // Serialize
    const serializer = new XMLSerializer();
    let result = serializer.serializeToString(svg);

    // 11. Minify
    if (options.minify) {
      result = minifySVG(result);
    } else {
      result = prettyPrintSVG(result);
    }

    return result;
  }

  function removeComments(node) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_COMMENT);
    const comments = [];
    while (walker.nextNode()) comments.push(walker.currentNode);
    comments.forEach(c => c.remove());
  }

  function removeUnusedNamespaces(svg) {
    // Collect used prefixes
    const usedPrefixes = new Set(['xmlns']);
    const attrs = svg.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const name = attrs[i].name;
      if (name.startsWith('xmlns:')) {
        const prefix = name.split(':')[1];
        // Check if prefix is used
        const allElements = svg.querySelectorAll('*');
        let used = false;
        for (const el of allElements) {
          if (el.tagName.startsWith(prefix + ':') || Array.from(el.attributes).some(a => a.name.startsWith(prefix + ':'))) {
            used = true;
            break;
          }
        }
        if (used) usedPrefixes.add(prefix);
      }
    }

    // Remove unused xmlns attributes
    for (let i = attrs.length - 1; i >= 0; i--) {
      const name = attrs[i].name;
      if (name.startsWith('xmlns:')) {
        const prefix = name.split(':')[1];
        if (!usedPrefixes.has(prefix)) {
          svg.removeAttribute(name);
        }
      }
    }
  }

  function cleanupAttributes(svg) {
    const elements = svg.querySelectorAll('*');
    elements.forEach(el => {
      // Remove duplicate attributes
      const seen = new Set();
      const attrsToRemove = [];
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        const key = attr.name.toLowerCase();
        if (seen.has(key)) {
          attrsToRemove.push(attr.name);
        } else {
          seen.add(key);
        }
      }
      attrsToRemove.forEach(name => el.removeAttribute(name));

      // Merge style attributes
      if (el.hasAttribute('style')) {
        const style = el.getAttribute('style');
        const parsed = parseStyle(style);
        el.setAttribute('style', serializeStyle(parsed));
      }
    });
  }

  function parseStyle(style) {
    const result = {};
    style.split(';').forEach(rule => {
      const [prop, ...vals] = rule.split(':');
      if (prop && vals.length) {
        result[prop.trim()] = vals.join(':').trim();
      }
    });
    return result;
  }

  function serializeStyle(obj) {
    return Object.entries(obj).map(([k, v]) => `${k}:${v}`).join(';');
  }

  function convertShapesToPaths(svg) {
    const shapes = svg.querySelectorAll('rect, circle, ellipse, line, polyline, polygon');
    shapes.forEach(shape => {
      const path = shapeToPath(shape);
      if (path) {
        const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // Copy attributes
        Array.from(shape.attributes).forEach(attr => {
          if (attr.name !== 'x' && attr.name !== 'y' && attr.name !== 'width' &&
              attr.name !== 'height' && attr.name !== 'rx' && attr.name !== 'ry' &&
              attr.name !== 'cx' && attr.name !== 'cy' && attr.name !== 'r' &&
              attr.name !== 'x1' && attr.name !== 'y1' && attr.name !== 'x2' && attr.name !== 'y2' &&
              attr.name !== 'points') {
            newPath.setAttribute(attr.name, attr.value);
          }
        });
        newPath.setAttribute('d', path);
        shape.parentNode.replaceChild(newPath, shape);
      }
    });
  }

  function shapeToPath(shape) {
    const tag = shape.tagName.toLowerCase();
    switch (tag) {
      case 'rect': {
        const x = parseFloat(shape.getAttribute('x') || 0);
        const y = parseFloat(shape.getAttribute('y') || 0);
        const w = parseFloat(shape.getAttribute('width') || 0);
        const h = parseFloat(shape.getAttribute('height') || 0);
        const rx = parseFloat(shape.getAttribute('rx') || 0);
        const ry = parseFloat(shape.getAttribute('ry') || 0);
        if (rx === 0 && ry === 0) {
          return `M${x},${y} h${w} v${h} h${-w} Z`;
        }
        const r = Math.min(rx, ry, w/2, h/2);
        return `M${x+r},${y} h${w-2*r} a${r},${r} 0 0 1 ${r},${r} v${h-2*r} a${r},${r} 0 0 1 ${-r},${r} h${-w+2*r} a${r},${r} 0 0 1 ${-r},${-r} v${-h+2*r} a${r},${r} 0 0 1 ${r},${-r} Z`;
      }
      case 'circle': {
        const cx = parseFloat(shape.getAttribute('cx') || 0);
        const cy = parseFloat(shape.getAttribute('cy') || 0);
        const r = parseFloat(shape.getAttribute('r') || 0);
        return `M${cx-r},${cy} a${r},${r} 0 1 0 ${2*r},0 a${r},${r} 0 1 0 ${-2*r},0 Z`;
      }
      case 'ellipse': {
        const cx = parseFloat(shape.getAttribute('cx') || 0);
        const cy = parseFloat(shape.getAttribute('cy') || 0);
        const rx = parseFloat(shape.getAttribute('rx') || 0);
        const ry = parseFloat(shape.getAttribute('ry') || 0);
        return `M${cx-rx},${cy} a${rx},${ry} 0 1 0 ${2*rx},0 a${rx},${ry} 0 1 0 ${-2*rx},0 Z`;
      }
      case 'line': {
        const x1 = parseFloat(shape.getAttribute('x1') || 0);
        const y1 = parseFloat(shape.getAttribute('y1') || 0);
        const x2 = parseFloat(shape.getAttribute('x2') || 0);
        const y2 = parseFloat(shape.getAttribute('y2') || 0);
        return `M${x1},${y1} L${x2},${y2}`;
      }
      case 'polyline':
      case 'polygon': {
        const points = shape.getAttribute('points') || '';
        const coords = points.trim().split(/\s+/).map(p => p.split(',').map(parseFloat));
        if (coords.length < 2) return '';
        let d = `M${coords[0][0]},${coords[0][1]}`;
        for (let i = 1; i < coords.length; i++) {
          d += ` L${coords[i][0]},${coords[i][1]}`;
        }
        if (tag === 'polygon') d += ' Z';
        return d;
      }
    }
    return '';
  }

  function mergePaths(svg) {
    // Basic path merging: combine consecutive paths with same attributes
    const paths = Array.from(svg.querySelectorAll('path'));
    for (let i = 0; i < paths.length - 1; i++) {
      const p1 = paths[i], p2 = paths[i + 1];
      if (elementsEqual(p1, p2)) {
        const d1 = p1.getAttribute('d');
        const d2 = p2.getAttribute('d');
        if (d1 && d2 && !d1.endsWith('Z') && !d2.startsWith('M')) {
          p1.setAttribute('d', d1 + ' ' + d2);
          p2.remove();
        }
      }
    }
  }

  function elementsEqual(el1, el2) {
    if (el1.tagName !== el2.tagName) return false;
    const attrs1 = Array.from(el1.attributes).map(a => `${a.name}=${a.value}`).sort().join('|');
    const attrs2 = Array.from(el2.attributes).map(a => `${a.name}=${a.value}`).sort().join('|');
    return attrs1 === attrs2;
  }

  function optimizeColors(svg) {
    const elements = svg.querySelectorAll('*');
    elements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const value = attr.value;
        // Shorten hex colors
        const hexMatch = value.match(/^#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3$/);
        if (hexMatch) {
          attr.value = '#' + hexMatch[1] + hexMatch[2] + hexMatch[3];
        }
        // Convert rgb() to hex
        const rgbMatch = value.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
          const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
          const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
          attr.value = '#' + r + g + b;
        }
        // Named colors to hex (common ones)
        const namedColors = {
          'red': '#f00', 'green': '#0f0', 'blue': '#00f',
          'white': '#fff', 'black': '#000', 'transparent': 'none',
          'yellow': '#ff0', 'cyan': '#0ff', 'magenta': '#f0f',
          'silver': '#c0c0c0', 'gray': '#808080', 'grey': '#808080',
          'maroon': '#800000', 'olive': '#808000', 'purple': '#800080',
          'teal': '#008080', 'navy': '#000080'
        };
        const lower = value.toLowerCase();
        if (namedColors[lower]) {
          attr.value = namedColors[lower];
        }
      });
    });
  }

  function roundCoordinates(svg, precision) {
    const factor = Math.pow(10, precision);
    const elements = svg.querySelectorAll('*');
    elements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const value = attr.value;
        // Round numbers in path data
        if (attr.name === 'd' || attr.name === 'points') {
          attr.value = value.replace(/[-+]?\d*\.\d+/g, match => {
            const num = parseFloat(match);
            return Math.round(num * factor) / factor;
          });
        }
        // Round numeric attributes
        const numMatch = value.match(/^[-+]?\d*\.\d+$/);
        if (numMatch) {
          const num = parseFloat(value);
          attr.value = (Math.round(num * factor) / factor).toString();
        }
      });
    });
  }

  function minifySVG(svg) {
    return svg
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/{\s*/g, '{')
      .trim();
  }

  function prettyPrintSVG(svg) {
    // Basic pretty print
    let result = '';
    let indent = 0;
    const lines = svg.split(/(?=[<>])/);

    lines.forEach(line => {
      if (line.startsWith('</')) {
        indent--;
      }
      if (line.trim()) {
        result += '  '.repeat(Math.max(0, indent)) + line.trim() + '\n';
      }
      if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>') && !line.startsWith('<?')) {
        indent++;
      }
    });

    return result.trim();
  }

  function renderOutput() {
    const mode = document.querySelector('input[name="view-mode"]:checked').value;

    switch (mode) {
      case 'code':
        elements.svgCode.textContent = optimizedSvg;
        highlightXML(elements.svgCode);
        break;
      case 'preview':
        elements.svgPreview.innerHTML = optimizedSvg;
        break;
      case 'diff':
        renderDiff();
        break;
      case 'side-by-side':
        elements.svgOriginal.textContent = originalSvg;
        elements.svgOptimizedSide.textContent = optimizedSvg;
        highlightXML(elements.svgOriginal);
        highlightXML(elements.svgOptimizedSide);
        break;
    }
  }

  function switchView() {
    const views = ['code-view', 'preview-view', 'diff-view', 'side-by-side-view'];
    views.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });
    document.getElementById(document.querySelector('input[name="view-mode"]:checked').value + '-view').hidden = false;
    renderOutput();
  }

  function highlightXML(element) {
    const code = element.textContent;
    const highlighted = code
      .replace(/(<\/?)([a-zA-Z:][a-zA-Z0-9:-]*)/g, '$1<span class="xml-tag">$2</span>')
      .replace(/([a-zA-Z:-]+)(&#61;)"([^&]*)"/g, '<span class="xml-attr">$1</span>$2"<span class="xml-value">$3</span>"')
      .replace(/(<!--[\s\S]*?-->)/g, '<span class="xml-comment">$1</span>')
      .replace(/(xmlns[a-zA-Z:]*)/g, '<span class="xml-ns">$1</span>');
    element.innerHTML = highlighted;
  }

  function renderDiff() {
    const originalLines = originalSvg.split('\n');
    const optimizedLines = optimizedSvg.split('\n');
    const maxLen = Math.max(originalLines.length, optimizedLines.length);

    let html = '<div class="diff-output">';
    for (let i = 0; i < maxLen; i++) {
      const o = originalLines[i];
      const n = optimizedLines[i];
      if (o === n) {
        html += `<div class="diff-context">${escapeHtml(o || '')}</div>`;
      } else if (o === undefined) {
        html += `<div class="diff-add">+ ${escapeHtml(n)}</div>`;
      } else if (n === undefined) {
        html += `<div class="diff-remove">- ${escapeHtml(o)}</div>`;
      } else {
        html += `<div class="diff-remove">- ${escapeHtml(o)}</div>`;
        html += `<div class="diff-add">+ ${escapeHtml(n)}</div>`;
      }
    }
    html += '</div>';
    elements.svgDiff.innerHTML = html;
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
  }

  function showStats() {
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    elements.statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${formatBytes(originalSize)}</div>
        <div class="stat-label">Original Size</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${formatBytes(optimizedSize)}</div>
        <div class="stat-label">Optimized Size</div>
      </div>
      <div class="stat-card ${reduction > 0 ? '' : 'warning'}">
        <div class="stat-value">${reduction}%</div>
        <div class="stat-label">Reduction</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${formatBytes(originalSize - optimizedSize)}</div>
        <div class="stat-label">Bytes Saved</div>
      </div>
    `;
    elements.statsContainer.hidden = false;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  function copyOutput() {
    if (!optimizedSvg) { showToast('Nothing to copy'); return; }
    navigator.clipboard.writeText(optimizedSvg).then(() => showToast('Copied!'));
  }

  function downloadOutput(isOriginal) {
    const content = isOriginal ? originalSvg : optimizedSvg;
    if (!content) { showToast('Nothing to download'); return; }
    const blob = new Blob([content], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isOriginal ? 'original.svg' : 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${a.download}`);
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