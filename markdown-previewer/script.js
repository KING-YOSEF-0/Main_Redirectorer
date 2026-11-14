const MarkdownPreviewer = (() => {
  const state = {
    content: '',
    lastRendered: '',
  };

  const elements = {};

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    loadFromStorage();
    setupMarked();
    render();
  }

  function cacheElements() {
    elements.editor = document.getElementById('md-editor');
    elements.preview = document.getElementById('md-preview');
    elements.themeSelect = document.getElementById('md-theme');
    elements.wordCount = document.getElementById('word-count');
    elements.btnLoadFile = document.getElementById('btn-load-file');
    elements.btnClear = document.getElementById('btn-clear');
    elements.btnExportHtml = document.getElementById('btn-export-html');
    elements.btnExportPdf = document.getElementById('btn-export-pdf');
    elements.btnExportMd = document.getElementById('btn-export-md');
    elements.btnCopyHtml = document.getElementById('btn-copy-html');
    elements.btnOpenNewTab = document.getElementById('btn-open-new-tab');
    elements.btnPrint = document.getElementById('btn-print');

    elements.settingAutosave = document.getElementById('setting-autosave');
    elements.settingWordwrap = document.getElementById('setting-wordwrap');
    elements.settingLinenums = document.getElementById('setting-linenums');
    elements.settingTabs = document.getElementById('setting-tabs');

    // Toolbar buttons
    elements.toolbarBtns = document.querySelectorAll('.tool-btn');
  }

  function bindEvents() {
    // Editor input with debounce
    elements.editor.addEventListener('input', debounce(() => {
      state.content = elements.editor.value;
      render();
      updateWordCount();
      if (elements.settingAutosave.checked) saveToStorage();
    }, 150));

    // Theme change
    elements.themeSelect.addEventListener('change', () => {
      elements.preview.dataset.theme = elements.themeSelect.value;
      render();
    });

    // Toolbar actions
    elements.toolbarBtns.forEach(btn => {
      btn.addEventListener('click', () => applyFormatting(btn.dataset.action));
    });

    // Keyboard shortcuts
    elements.editor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); applyFormatting('bold'); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); applyFormatting('italic'); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); applyFormatting('link'); }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); applyFormatting('code'); }
      if (e.key === 'Tab' && elements.settingTabs.checked) { e.preventDefault(); insertAtCursor('  '); }
    });

    // Settings
    elements.settingWordwrap.addEventListener('change', () => {
      elements.editor.style.whiteSpace = elements.settingWordwrap.checked ? 'pre-wrap' : 'pre';
    });
    elements.settingLinenums.addEventListener('change', toggleLineNumbers);

    // Export buttons
    elements.btnLoadFile.addEventListener('click', loadFile);
    elements.btnClear.addEventListener('click', clearEditor);
    elements.btnExportHtml.addEventListener('click', exportHtml);
    elements.btnExportPdf.addEventListener('click', exportPdf);
    elements.btnExportMd.addEventListener('click', exportMarkdown);
    elements.btnCopyHtml.addEventListener('click', copyHtml);
    elements.btnOpenNewTab.addEventListener('click', openInNewTab);
    elements.btnPrint.addEventListener('click', printPreview);

    // Drag and drop file
    elements.editor.addEventListener('dragover', (e) => { e.preventDefault(); elements.editor.style.borderColor = 'var(--accent)'; });
    elements.editor.addEventListener('dragleave', () => { elements.editor.style.borderColor = 'var(--border)'; });
    elements.editor.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.editor.style.borderColor = 'var(--border)';
      const file = e.dataTransfer.files[0];
      if (file && (file.type === 'text/markdown' || file.name.endsWith('.md'))) {
        readFile(file);
      }
    });
  }

  function setupMarked() {
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false,
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
    });

    // Custom renderer for task lists
    const renderer = new marked.Renderer();
    const originalCheckbox = renderer.checkbox;
    renderer.checkbox = (checked) => {
      return `<input type="checkbox" class="task-list-item-checkbox" ${checked ? 'checked' : ''} disabled> `;
    };
    marked.use({ renderer });
  }

  function applyFormatting(action) {
    const textarea = elements.editor;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let before = '', after = '', newCursorPos = start;

    switch (action) {
      case 'bold': before = '**'; after = '**'; break;
      case 'italic': before = '*'; after = '*'; break;
      case 'strike': before = '~~'; after = '~~'; break;
      case 'code': before = '`'; after = '`'; break;
      case 'h1': before = '# '; after = ''; newCursorPos = start + 2; break;
      case 'h2': before = '## '; after = ''; newCursorPos = start + 3; break;
      case 'h3': before = '### '; after = ''; newCursorPos = start + 4; break;
      case 'ul': before = '- '; after = ''; newCursorPos = start + 2; break;
      case 'ol': before = '1. '; after = ''; newCursorPos = start + 3; break;
      case 'task': before = '- [ ] '; after = ''; newCursorPos = start + 6; break;
      case 'quote': before = '> '; after = ''; newCursorPos = start + 2; break;
      case 'link':
        before = '['; after = '](https://)';
        newCursorPos = start + 1;
        break;
      case 'image':
        before = '!['; after = '](https://)';
        newCursorPos = start + 2;
        break;
      case 'table':
        before = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n';
        after = '';
        newCursorPos = start + before.length;
        break;
      case 'hr':
        before = '\n---\n';
        after = '';
        newCursorPos = start + before.length;
        break;
      case 'math':
        before = '$$\n'; after = '\n$$';
        newCursorPos = start + 3;
        break;
      case 'mermaid':
        before = '```mermaid\ngraph TD\n    A --> B\n```\n';
        after = '';
        newCursorPos = start + before.length;
        break;
      case 'footnote':
        before = '[^1]'; after = '\n\n[^1]: Footnote text';
        newCursorPos = start + before.length;
        break;
    }

    const newValue = textarea.value.substring(0, start) + before + selectedText + after + textarea.value.substring(end);
    textarea.value = newValue;
    state.content = newValue;

    // Set cursor position
    if (selectedText) {
      textarea.selectionStart = start;
      textarea.selectionEnd = start + before.length + selectedText.length + after.length;
    } else {
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
    }
    textarea.focus();
    render();
    updateWordCount();
    if (elements.settingAutosave.checked) saveToStorage();
  }

  function insertAtCursor(text) {
    const textarea = elements.editor;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
    state.content = textarea.value;
    render();
    updateWordCount();
  }

  function render() {
    if (state.content === state.lastRendered) return;

    const html = marked.parse(state.content);
    const sanitized = DOMPurify.sanitize(html);
    elements.preview.innerHTML = sanitized;
    state.lastRendered = state.content;

    // Render math
    renderMathInElement(elements.preview, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
    });

    // Render mermaid
    elements.preview.querySelectorAll('.language-mermaid, .mermaid').forEach(el => {
      if (!el.dataset.mermaidProcessed) {
        el.dataset.mermaidProcessed = 'true';
        el.classList.add('mermaid');
      }
    });
    mermaid.init(undefined, elements.preview.querySelectorAll('.mermaid'));

    // Highlight code
    elements.preview.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }

  function updateWordCount() {
    const text = state.content;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    elements.wordCount.textContent = `${words} words · ${chars} chars · ${lines} lines`;
  }

  function loadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) readFile(file);
    };
    input.click();
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      elements.editor.value = e.target.result;
      state.content = e.target.result;
      render();
      updateWordCount();
      if (elements.settingAutosave.checked) saveToStorage();
      showToast(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }

  function clearEditor() {
    if (confirm('Clear the editor? This cannot be undone.')) {
      elements.editor.value = '';
      state.content = '';
      render();
      updateWordCount();
      if (elements.settingAutosave.checked) saveToStorage();
    }
  }

  function exportHtml() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Markdown Export</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/github-dark.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<style>
  body { font-family: 'Fredoka', system-ui, sans-serif; background: #0f0f14; color: #f5f5f7; line-height: 1.7; max-width: 800px; margin: 0 auto; padding: 2rem; }
  pre { background: #1a1a24; border: 1px solid #2d2d3f; border-radius: 10px; padding: 1rem; overflow-x: auto; }
  code { font-family: 'JetBrains Mono', monospace; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 3px solid #ff4fa3; padding-left: 1rem; margin: 1rem 0; color: #9aa0a6; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  th, td { border: 1px solid #2d2d3f; padding: 0.75rem 1rem; }
  th { background: #1a1a24; font-weight: 600; }
  tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
  img { max-width: 100%; border-radius: 8px; }
  hr { border: none; border-top: 1px solid #2d2d3f; margin: 2rem 0; }
  a { color: #35c3ff; }
  .katex { font-size: 1.1em; }
</style>
</head>
<body>
${elements.preview.innerHTML}
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
<script>
  document.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
  mermaid.init(undefined, document.querySelectorAll('.mermaid'));
  renderMathInElement(document.body, {
    delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
    throwOnError: false
  });
</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.html';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as HTML');
  }

  function exportPdf() {
    // Open print dialog
    printPreview();
  }

  function exportMarkdown() {
    const blob = new Blob([state.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-export.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as Markdown');
  }

  function copyHtml() {
    navigator.clipboard.writeText(elements.preview.innerHTML).then(() => {
      showToast('HTML copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy');
    });
  }

  function openInNewTab() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Markdown Preview</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/github-dark.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<style>
  body { font-family: system-ui, sans-serif; background: #0f0f14; color: #f5f5f7; line-height: 1.7; max-width: 800px; margin: 0 auto; padding: 2rem; }
  pre { background: #1a1a24; border: 1px solid #2d2d3f; border-radius: 10px; padding: 1rem; overflow-x: auto; }
  code { font-family: 'JetBrains Mono', monospace; }
  pre code { background: none; padding: 0; }
</style>
</head>
<body>
${elements.preview.innerHTML}
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
<script>
  document.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
  mermaid.init(undefined, document.querySelectorAll('.mermaid'));
  renderMathInElement(document.body, {
    delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
    throwOnError: false
  });
</script>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function printPreview() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Markdown Preview - Print</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/github-dark.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<style>
  body { font-family: system-ui, sans-serif; background: white; color: black; line-height: 1.7; max-width: 800px; margin: 0 auto; padding: 2rem; }
  pre { background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; overflow-x: auto; }
  code { font-family: monospace; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 3px solid #333; padding-left: 1rem; margin: 1rem 0; color: #666; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  th, td { border: 1px solid #ddd; padding: 0.75rem 1rem; }
  th { background: #f5f5f5; font-weight: 600; }
  tr:nth-child(even) td { background: #fafafa; }
  img { max-width: 100%; }
  hr { border: none; border-top: 1px solid #ddd; margin: 2rem 0; }
  a { color: #0066cc; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head>
<body>
${elements.preview.innerHTML}
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
<script>
  document.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
  mermaid.init(undefined, document.querySelectorAll('.mermaid'));
  renderMathInElement(document.body, {
    delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
    throwOnError: false
  });
  window.onload = () => window.print();
</script>
</body>
</html>`);
    printWindow.document.close();
  }

  function saveToStorage() {
    localStorage.setItem('markdown-previewer-content', state.content);
    localStorage.setItem('markdown-previewer-theme', elements.themeSelect.value);
    localStorage.setItem('markdown-previewer-settings', JSON.stringify({
      autosave: elements.settingAutosave.checked,
      wordwrap: elements.settingWordwrap.checked,
      linenums: elements.settingLinenums.checked,
      tabs: elements.settingTabs.checked,
    }));
  }

  function loadFromStorage() {
    const saved = localStorage.getItem('markdown-previewer-content');
    if (saved) {
      elements.editor.value = saved;
      state.content = saved;
    }
    const theme = localStorage.getItem('markdown-previewer-theme');
    if (theme) elements.themeSelect.value = theme;
    const settings = JSON.parse(localStorage.getItem('markdown-previewer-settings') || '{}');
    elements.settingAutosave.checked = settings.autosave !== false;
    elements.settingWordwrap.checked = settings.wordwrap !== false;
    elements.settingLinenums.checked = settings.linenums !== false;
    elements.settingTabs.checked = settings.tabs !== false;
    elements.editor.style.whiteSpace = elements.settingWordwrap.checked ? 'pre-wrap' : 'pre';
    toggleLineNumbers();
  }

  function toggleLineNumbers() {
    // Simple line numbers via CSS counter (placeholder)
    if (elements.settingLinenums.checked) {
      elements.editor.style.paddingLeft = '3rem';
    } else {
      elements.editor.style.paddingLeft = '0.9rem';
    }
  }

  function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
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