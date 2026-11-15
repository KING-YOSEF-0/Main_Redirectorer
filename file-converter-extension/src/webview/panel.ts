import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ImageConverter } from '../converters/imageConverter';
import { AudioConverter } from '../converters/audioConverter';

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
              targetId: message.targetId,
            });
          }
          break;
      }
    });

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  public dispose() {
    if (this.panel) {
      this.panel.dispose();
      this.panel = undefined;
    }
  }

  private getHtmlContent(): string {
    const htmlPath = path.join(this.context.extensionPath, 'media', 'index.html');
    return fs.readFileSync(htmlPath, 'utf8');
  }
}