"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConverterPanel = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const imageConverter_1 = require("../converters/imageConverter");
const audioConverter_1 = require("../converters/audioConverter");
class ConverterPanel {
    constructor(context) {
        this.extensionContext = context;
    }
    show() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            return;
        }
        this.panel = vscode.window.createWebviewPanel('fileConverterProPanel', 'File Converter Pro Hub', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        this.panel.webview.html = this.getHtmlContent();
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'convert':
                    try {
                        const { filePath, type, format, quality, volume } = message;
                        if (type === 'image') {
                            await imageConverter_1.ImageConverter.convert(filePath, { format, quality });
                            vscode.window.showInformationMessage('Image converted successfully!');
                        }
                        else if (type === 'audio-extract') {
                            await audioConverter_1.AudioConverter.extractAudio(filePath, { outputFormat: format });
                            vscode.window.showInformationMessage('Audio extracted successfully!');
                        }
                        else if (type === 'volume') {
                            await audioConverter_1.AudioConverter.boostVolume(filePath, { gainDb: Number(volume) });
                            vscode.window.showInformationMessage('Volume boosted successfully!');
                        }
                        this.panel?.webview.postMessage({ command: 'success', message: 'Conversion completed!' });
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Error: ${err.message}`);
                        this.panel?.webview.postMessage({ command: 'error', message: err.message });
                    }
                    break;
                case 'selectFile':
                    const picked = await vscode.window.showOpenDialog({ canSelectMany: false });
                    if (picked && picked[0]) {
                        this.panel?.webview.postMessage({
                            command: 'fileSelected',
                            filePath: picked[0].fsPath,
                            fileName: path.basename(picked[0].fsPath),
                        });
                    }
                    break;
            }
        });
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }
    dispose() {
        if (this.panel) {
            this.panel.dispose();
        }
    }
    getHtmlContent() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>File Converter Pro</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      padding: 20px;
      margin: 0;
    }
    h1 {
      color: var(--vscode-textLink-activeForeground);
      border-bottom: 2px solid var(--vscode-textSeparator-foreground);
      padding-bottom: 10px;
    }
    .card {
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-editorWidget-border);
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 6px;
    }
    input, select, button {
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      padding: 8px 12px;
      margin: 5px 0 15px 0;
      width: 100%;
      box-sizing: border-box;
      border-radius: 4px;
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      cursor: pointer;
      font-weight: bold;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .file-box {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  </style>
</head>
<body>
  <h1>⚡ File Converter Pro Hub (God Mode)</h1>

  <div class="card">
    <h3>🖼️ Image Converter & Quality Tuner</h3>
    <div class="file-box">
      <input type="text" id="imagePath" placeholder="Select or drop image file..." readonly />
      <button onclick="selectFile('imagePath')">Browse</button>
    </div>
    <label>Target Format:</label>
    <select id="imageFormat">
      <option value="png">PNG</option>
      <option value="jpeg">JPEG</option>
      <option value="webp">WebP</option>
      <option value="avif">AVIF</option>
      <option value="gif">GIF</option>
      <option value="bmp">BMP</option>
      <option value="tiff">TIFF</option>
    </select>
    <label>Quality (1-100):</label>
    <input type="number" id="imageQuality" value="90" min="1" max="100" />
    <button onclick="convert('image')">Convert Image</button>
  </div>

  <div class="card">
    <h3>🎵 Video to Audio Extractor (.mp4 → .mp3)</h3>
    <div class="file-box">
      <input type="text" id="videoPath" placeholder="Select video file..." readonly />
      <button onclick="selectFile('videoPath')">Browse</button>
    </div>
    <label>Audio Format:</label>
    <select id="audioFormat">
      <option value="mp3">MP3</option>
      <option value="wav">WAV</option>
      <option value="flac">FLAC</option>
      <option value="ogg">OGG</option>
      <option value="aac">AAC</option>
    </select>
    <button onclick="convert('audio-extract')">Extract Audio</button>
  </div>

  <div class="card">
    <h3>🔊 Volume Booster</h3>
    <div class="file-box">
      <input type="text" id="audioPath" placeholder="Select audio file..." readonly />
      <button onclick="selectFile('audioPath')">Browse</button>
    </div>
    <label>Boost (dB):</label>
    <input type="number" id="volumeDb" value="10" min="1" max="50" />
    <button onclick="convert('volume')">Boost Volume</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function selectFile(targetId) {
      vscode.postMessage({ command: 'selectFile', targetId });
    }

    function convert(type) {
      let filePath = '';
      let format = '';
      let quality = 90;
      let volume = 10;

      if (type === 'image') {
        filePath = document.getElementById('imagePath').value;
        format = document.getElementById('imageFormat').value;
        quality = document.getElementById('imageQuality').value;
      } else if (type === 'audio-extract') {
        filePath = document.getElementById('videoPath').value;
        format = document.getElementById('audioFormat').value;
      } else if (type === 'volume') {
        filePath = document.getElementById('audioPath').value;
        volume = document.getElementById('volumeDb').value;
      }

      if (!filePath) {
        alert('Please select a file first!');
        return;
      }

      vscode.postMessage({ command: 'convert', type, filePath, format, quality, volume });
    }

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'fileSelected') {
        if (message.filePath.match(/\\.(png|jpg|jpeg|webp|gif|bmp|avif|tiff)$/i)) {
          document.getElementById('imagePath').value = message.filePath;
        } else if (message.filePath.match(/\\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i)) {
          document.getElementById('videoPath').value = message.filePath;
        } else {
          document.getElementById('audioPath').value = message.filePath;
        }
      }
    });
  </script>
</body>
</html>`;
    }
}
exports.ConverterPanel = ConverterPanel;
//# sourceMappingURL=panel.js.map