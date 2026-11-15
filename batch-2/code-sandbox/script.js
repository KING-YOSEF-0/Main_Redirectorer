/**
 * NexusCode Pro — Advanced Enterprise Sandbox Controller (Chunk 1/3)
 * Core State Management, UI Event Listeners, and Layout Controller
 */

class NexusSandbox {
    constructor() {
        this.state = {
            activeFile: 'index.html',
            theme: 'dark',
            splitRatio: 50,
            isLiveRunning: true,
            consoleLogs: [],
            terminalHistory: [],
            collaborators: 3,
            memoryUsage: 142
        };

        this.files = {
            'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<title>Nexus Sandbox Output</title>\n\t<script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-slate-950 text-white p-8 flex items-center justify-center h-screen">\n\t<div class="text-center space-y-4 max-w-md bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">\n\t\t<h1 class="text-3xl font-extrabold text-cyan-400">Hello Nexus Pro</h1>\n\t\t<p class="text-slate-400 text-sm">Your advanced live-reloading container is fully operational.</p>\n\t\t<button onclick="triggerAlert()" class="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer">Test Action</button>\n\t</div>\n\t<script>\n\t\tfunction triggerAlert() {\n\t\t\tconsole.log('Button clicked in sandbox preview!');\n\t\t\talert('Interactive Sandbox Triggered!');\n\t\t}\n\t</script>\n</body>\n</html>`,
            'app.js': `// NexusCode Enterprise JavaScript Runtime\nconsole.log('Nexus Runtime initialized successfully.');\n\nexport function calculateMetrics(data) {\n\treturn data.reduce((acc, val) => acc + val, 0);\n}\n`,
            'styles.css': `/* Custom Design Token Overrides */\n:root {\n\t--primary-glow: rgba(56, 189, 248, 0.4);\n}\n\nbody {\n\tfont-family: 'Inter', sans-serif;\n}\n`
        };

        this.init();
    }

    init() {
        console.log('[NexusSandbox] Initializing Pro Environment...');
        this.bindEvents();
        this.initTerminal();
        this.initLivePreview();
        this.startMemorySimulation();
    }

    bindEvents() {
        // Global Command Palette listener (Cmd+K / Ctrl+K)
        window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleCommandPalette();
            }
        });
    }

    toggleCommandPalette() {
        console.log('[NexusSandbox] Command Palette triggered.');
        // Feature 2: Quick Command Search Modal Logic
        let modal = document.getElementById('nexus-command-palette');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'nexus-command-palette';
            modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 animate-fade-in';
            modal.innerHTML = `
                <div class="bg-dark-900 border border-dark-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    <div class="p-3 border-b border-dark-800 flex items-center space-x-3">
                        <i class="fa-solid fa-magnifying-glass text-cyan-400"></i>
                        <input type="text" id="nexus-palette-input" placeholder="Type a command or file name..." class="bg-transparent text-white placeholder-dark-500 text-sm focus:outline-none w-full font-code">
                        <span class="text-[10px] bg-dark-800 text-dark-400 px-1.5 py-0.5 rounded border border-dark-700">ESC to close</span>
                    </div>
                    <div class="p-2 space-y-1 max-h-64 overflow-y-auto font-code text-xs text-dark-300">
                        <div class="p-2 hover:bg-dark-800 rounded cursor-pointer flex items-center justify-between text-cyan-400">
                            <span>> Run Build & Bundle</span>
                            <span class="text-dark-500">Ctrl+B</span>
                        </div>
                        <div class="p-2 hover:bg-dark-800 rounded cursor-pointer flex items-center justify-between">
                            <span>> Toggle Dark / Light Theme</span>
                            <span class="text-dark-500">Ctrl+T</span>
                        </div>
                        <div class="p-2 hover:bg-dark-800 rounded cursor-pointer flex items-center justify-between">
                            <span>> Open Extension Marketplace</span>
                            <span class="text-dark-500">Ctrl+Shift+X</span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
            document.getElementById('nexus-palette-input').focus();
        } else {
            modal.remove();
        }
    }
}

/**
 * NexusCode Pro — Advanced Enterprise Sandbox Controller (Chunk 2/3)
 * Live Preview Sandbox Frame Renderer & Console Interceptor
 */

Object.assign(NexusSandbox.prototype, {
    initLivePreview() {
        this.renderPreview();
    },

    renderPreview() {
        // Feature 7: Dynamic Live Preview Iframe Generator
        const htmlContent = this.files['index.html'];
        const cssContent = this.files['styles.css'];
        const jsContent = this.files['app.js'];

        const combinedSource = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${cssContent}</style>
                <script>
                    // Intercept console.log for debug console
                    const originalLog = console.log;
                    console.log = function(...args) {
                        originalLog.apply(console, args);
                        window.parent.postMessage({ type: 'CONSOLE_LOG', args }, '*');
                    };
                    window.onerror = function(msg, url, line) {
                        window.parent.postMessage({ type: 'CONSOLE_ERROR', msg, line }, '*');
                    };
                </script>
            </head>
            <body>
                ${htmlContent}
                <script>${jsContent}</script>
            </body>
            </html>
        `;

        // Create or update iframe preview window
        let previewContainer = document.querySelector('.preview-frame-container');
        if (!previewContainer) {
            const targetPane = document.querySelector('.lg\\:w-1\\/2 .bg-slate-950');
            if (targetPane) {
                targetPane.innerHTML = `<iframe id="nexus-live-iframe" class="w-full h-full border-0 bg-white"></iframe>`;
                previewContainer = targetPane;
            }
        }

        const iframe = document.getElementById('nexus-live-iframe');
        if (iframe) {
            const blob = new Blob([combinedSource], { type: 'text/html' });
            iframe.src = URL.createObjectURL(blob);
        }

        // Listen for console messages from iframe
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CONSOLE_LOG') {
                this.appendDebugLog(event.data.args.join(' '), 'log');
            } else if (event.data && event.data.type === 'CONSOLE_ERROR') {
                this.appendDebugLog(`Uncaught Error: ${event.data.msg} (Line ${event.data.line})`, 'error');
            }
        });
    },

    appendDebugLog(message, type = 'log') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[Sandbox Console ${timestamp}]`, message);
    },

    initTerminal() {
        // Feature 8: Interactive Terminal Emulator
        console.log('[NexusSandbox] Terminal initialized with Bash shell emulation.');
    },

    startMemorySimulation() {
        // Feature 9: Dynamic Resource Monitor Simulation
        setInterval(() => {
            const fluctuation = Math.floor(Math.random() * 6) - 3;
            this.state.memoryUsage = Math.max(120, Math.min(380, this.state.memoryUsage + fluctuation));
            const memLabel = document.querySelector('footer .text-xs');
            if (memLabel && memLabel.textContent.includes('Memory:')) {
                memLabel.textContent = `Memory: ${this.state.memoryUsage}MB / 2GB`;
            }
        }, 4000);
    }
});
