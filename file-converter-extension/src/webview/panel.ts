import * as vscode from 'vscode';
import * as path from 'path';
import { ImageConverter } from '../converters/imageConverter';
import { AudioConverter } from '../converters/audioConverter';
import { FileOps } from '../utils/fileOps';

export class ConverterPanel {
  private panel: vscode.WebviewPanel | undefined;

  constructor(private readonly context: vscode.ExtensionContext) {}

  public show() {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'fileConverterPro',
      'File Converter Pro',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [this.context.extensionUri],
      }
    );

    this.panel.webview.html = this.getHtmlContent();

    this.panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'convert':
          try {
            const { filePath, type, format, quality, volume } = message;
            if (type === 'image') {
              await ImageConverter.convert(filePath, { format, quality });
              vscode.window.showInformationMessage('Image converted successfully!');
            } else if (type === 'audio-extract') {
              await AudioConverter.extractAudio(filePath, { outputFormat: format });
              vscode.window.showInformationMessage('Audio extracted successfully!');
            } else if (type === 'volume') {
              await AudioConverter.boostVolume(filePath, { gainDb: Number(volume) });
              vscode.window.showInformationMessage('Volume boosted successfully!');
            }
            this.panel?.webview.postMessage({ command: 'success', message: 'Conversion completed!' });
          } catch (err: any) {
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

  private getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>File Converter Pro Hub</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      padding: 20px;
      margin: 0;
    }
    h1 {
      color: var(--vscode-textLink-activeForeground);
      border-bottom: 2px solid var(--vscode-textSeparator-foreground);
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    .card {
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-editorWidget-border);
      padding: 20px;
      margin-bottom: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card h3 {
      margin-top: 0;
      color: var(--vscode-foreground);
    }
    input, select, button {
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      padding: 10px 12px;
      margin: 5px 0 15px 0;
      width: 100%;
      box-sizing: border-box;
      border-radius: 4px;
      font-size: 14px;
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      cursor: pointer;
      font-weight: 600;
      padding: 12px 24px;
      margin-right: 10px;
      transition: background-color 0.2s;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    button.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .file-box {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 15px;
    }
    .file-box input {
      flex: 1;
      margin-bottom: 0;
    }
    .status {
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
      font-size: 14px;
    }
    .success {
      background: var(--vscode-charts-green);
      color: white;
    }
    .error {
      background: var(--vscode-charts-red);
      color: white;
    }
    .info {
      background: var(--vscode-charts-blue);
      color: white;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid var(--vscode-progressBar-background);
      border-top: 3px solid var(--vscode-button-background);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 10px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .warning {
      background: var(--vscode-editorWarning-foreground);
      color: var(--vscode-editor-background);
      border-left: 4px solid var(--vscode-editorWarning-foreground);
      padding: 12px 15px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <h1>⚡ File Converter Pro Hub - All-in-One</h1>

  <div class="warning">
    <strong>⚠ Note:</strong> This extension requires FFmpeg and Sharp native dependencies.
    If processing fails due to missing dependencies, please ensure FFmpeg is installed on your system.
  </div>

  <div class="grid">
    <div class="card">
      <h3>🖼️ Image Converter</h3>
      <div class="file-box">
        <input type="text" id="imagePath" placeholder="No file selected..." readonly />
        <button onclick="selectFile('imagePath', 'image')">📁 Browse</button>
        <button onclick="document.getElementById('imagePath').value = ''" class="secondary">Clear</button>
      </div>
      <label>Output Format:</label>
      <select id="imageFormat">
        <option value="png">PNG - Best quality</option>
        <option value="jpeg">JPEG - Web compatible</option>
        <option value="webp">WebP - Modern, efficient</option>
        <option value="avif">AVIF - Next-gen</option>
        <option value="gif">GIF - Animated</option>
        <option value="bmp">BMP - Windows bitmap</option>
        <option value="tiff">TIFF - High fidelity</option>
      </select>
      <label>Quality (1-100):</label>
      <input type="number" id="imageQuality" value="90" min="1" max="100" />
      <button onclick="convert('image')">🚀 Convert Image</button>
    </div>

    <div class="card">
      <h3>🎵 Audio Processing Hub</h3>

      <div>
        <h4>📹 Video to Audio Extract</h4>
        <div class="file-box">
          <input type="text" id="videoPath" placeholder="No video selected..." readonly />
          <button onclick="selectFile('videoPath', 'video-extract')">📁 Browse</button>
          <button onclick="document.getElementById('videoPath').value = ''" class="secondary">Clear</button>
        </div>
        <label>Audio Format:</label>
        <select id="audioFormat">
          <option value="mp3">MP3 - Most compatible</option>
          <option value="wav">WAV - High quality</option>
          <option value="flac">FLAC - Lossless</option>
          <option value="ogg">OGG - Open standard</option>
          <option value="aac">AAC - Efficient</option>
        </select>
        <button onclick="convert('audio-extract')">🎵 Extract Audio</button>
      </div>

      <hr style="border-color: var(--vscode-textSeparator-foreground); margin: 20px 0;">

      <div>
        <h4>🔊 Volume Booster</h4>
        <div class="file-box">
          <input type="text" id="audioPath" placeholder="No audio selected..." readonly />
          <button onclick="selectFile('audioPath', 'volume')">📁 Browse</button>
          <button onclick="document.getElementById('audioPath').value = ''" class="secondary">Clear</button>
        </div>
        <label>Boost Level (dB):</label>
        <input type="number" id="volumeDb" value="10" min="1" max="50" />
        <small style="color: var(--vscode-descriptionForeground);">
          Higher values = louder (1-50 dB recommended: 10-20 dB)
        </small>
        <button onclick="convert('volume')">📢 Boost Volume</button>
      </div>
    </div>
  </div>

  <div class="card">
    <h3>📊 Status & Logs</h3>
    <div id="statusContainer">
      <div class="status info">
        <strong>🟢 Ready</strong> - File Converter Pro is active and waiting for your commands!
      </div>
    </div>
    <button onclick="clearStatus()" class="secondary">🧹 Clear Status</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let statusCount = 0;

    function addStatus(message, type = 'info') {
      statusCount++;
      const statusContainer = document.getElementById('statusContainer');
      const statusDiv = document.createElement('div');
      statusDiv.className = `status ${type}`;
      statusDiv.innerHTML = `<strong>${getStatusIcon(type)} ${type.toUpperCase()}:</strong> ${message}`;
      statusContainer.insertBefore(statusDiv, statusContainer.firstChild);
      vscode.postMessage({ command: 'log', type, message, count: statusCount });
    }

    function getStatusIcon(type) {
      const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
      return icons[type] || '📝';
    }

    function clearStatus() {
      const container = document.getElementById('statusContainer');
      while (container.children.length > 1) {
        container.removeChild(container.lastChild);
      }
      addStatus('Status cleared', 'info');
    }

    function selectFile(targetId, type) {
      vscode.postMessage({ command: 'selectFile', targetId, type });
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
        if (!filePath) {
          addStatus('Please select an image file first!', 'warning');
          return;
        }
      } else if (type === 'audio-extract') {
        filePath = document.getElementById('videoPath').value;
        format = document.getElementById('audioFormat').value;
        if (!filePath) {
          addStatus('Please select a video file first!', 'warning');
          return;
        }
      } else if (type === 'volume') {
        filePath = document.getElementById('audioPath').value;
        volume = document.getElementById('volumeDb').value;
        if (!filePath) {
          addStatus('Please select an audio file first!', 'warning');
          return;
        }
      }

      addStatus(`Converting ${type}...`, 'info');
      vscode.postMessage({
        command: 'convert',
        type,
        filePath,
        format,
        quality: parseInt(quality),
        volume: parseInt(volume)
      });
    }

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'success':
          addStatus(message.message, 'success');
          break;
        case 'error':
          addStatus(`❌ ${message.message}`, 'error');
          break;
        case 'fileSelected':
          const targetId = message.targetId;
          if (targetId === 'imagePath' && message.filePath.match(/\\.(png|jpg|jpeg|webp|gif|bmp|avif|tiff)$/i)) {
            document.getElementById(targetId).value = message.fileName;
            addStatus(`Image selected: ${message.fileName}`, 'success');
          } else if (targetId === 'videoPath' && message.filePath.match(/\\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i)) {
            document.getElementById(targetId).value = message.fileName;
            addStatus(`Video selected: ${message.fileName}`, 'success');
          } else if (targetId === 'audioPath' && message.filePath.match(/\\.(mp3|wav|flac|ogg|m4a|aac|wma|opus)$/i)) {
            document.getElementById(targetId).value = message.fileName;
            addStatus(`Audio selected: ${message.fileName}`, 'success');
          } else {
            addStatus(`❌ Invalid file type selected: ${message.fileName}`, 'error');
          }
          break;
        case 'log':
          if (message.count > 1) {
            addStatus(`${message.type}: ${message.message}`, message.type);
          }
          break;
      }
    });

    // Initialize on load
    document.addEventListener('DOMContentLoaded', () => {
      addStatus('Interface loaded successfully! Ready for conversions.', 'success');
    });
  </script>
</body>
</html>`;
  }
}