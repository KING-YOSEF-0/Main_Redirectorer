import * as vscode from 'vscode';
import * as path from 'path';
import { ImageConverter } from './converters/imageConverter';
import { AudioConverter } from './converters/audioConverter';
import { FileOps } from './utils/fileOps';

export function activate(context: vscode.ExtensionContext) {
  console.log('File Converter Pro is now active!');

  const panel = new ConverterPanel(context);

  const openPanel = vscode.commands.registerCommand('fileConverterPro.openPanel', () => {
    panel.show();
  });

  const convertImage = vscode.commands.registerCommand('fileConverterPro.convertImage', async () => {
    try {
      const input = await vscode.window.showOpenDialog({
        canSelectMany: false,
        canSelectFolders: false,
        filters: {
          Images: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'avif', 'tiff'],
          AllMedia: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'avif', 'tiff', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'],
        },
      });
      if (!input || !input[0]) return;
      const formats = ['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'tiff'];
      const format = await vscode.window.showQuickPick(formats, { placeHolder: 'Choose output format' });
      if (!format) return;
      const quality = await vscode.workspace.getConfiguration('fileConverterPro').get('imageQuality', 90);
      const result = await ImageConverter.convert(input[0].fsPath, { format, quality });
      vscode.window.showInformationMessage(`Converted → ${path.basename(result)}`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`Image conversion failed: ${err.message}`);
    }
  });

  const extractAudio = vscode.commands.registerCommand('fileConverterPro.extractAudio', async () => {
    try {
      const input = await vscode.window.showOpenDialog({
        canSelectMany: false,
        canSelectFolders: false,
        filters: {
          Videos: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg'],
          AllMedia: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg', 'mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'],
        },
      });
      if (!input || !input[0]) return;
      const out = await AudioConverter.extractAudio(input[0].fsPath, {
        outputFormat: 'mp3',
        bitrate: await vscode.workspace.getConfiguration('fileConverterPro').get('audioBitrate', '192k'),
      });
      vscode.window.showInformationMessage(`Audio extracted → ${path.basename(out)}`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`Audio extraction failed: ${err.message}`);
    }
  });

  const boostVolume = vscode.commands.registerCommand('fileConverterPro.boostVolume', async () => {
    try {
      const input = await vscode.window.showOpenDialog({
        canSelectMany: false,
        canSelectFolders: false,
        filters: {
          Audio: ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'wma', 'opus'],
          AllMedia: ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'wma', 'opus', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'avif', 'tiff', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'],
        },
      });
      if (!input || !input[0]) return;
      const db = await vscode.window.showInputBox({
        prompt: 'Volume boost in dB (1-50)',
        value: String(await vscode.workspace.getConfiguration('fileConverterPro').get('volumeBoostDb', 10)),
        validateInput: (v: string) => {
          const n = Number(v);
          return (n >= 1 && n <= 50) ? undefined : 'Enter 1-50';
        },
      });
      if (!db) return;
      const out = await AudioConverter.boostVolume(input[0].fsPath, { gainDb: Number(db) });
      vscode.window.showInformationMessage(`Volume boosted → ${path.basename(out)}`);
    } catch (err: any) {
      vscode.window.showErrorMessage(`Volume boost failed: ${err.message}`);
    }
  });

  const batchConvert = vscode.commands.registerCommand('fileConverterPro.batchConvert', async () => {
    try {
      const dir = await vscode.window.showOpenDialog({ canSelectMany: false, canSelectFolders: true });
      if (!dir || !dir[0]) return;
      const files = await FileOps.findFiles(dir[0].fsPath, ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.avif', '.tiff']);
      if (files.length === 0) {
        vscode.window.showWarningMessage('No supported images found in folder.');
        return;
      }
      const format = await vscode.window.showQuickPick(['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'tiff'], { placeHolder: 'Choose output format' });
      if (!format) return;
      const quality = await vscode.workspace.getConfiguration('fileConverterPro').get('imageQuality', 90);

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Converting ${files.length} images...`,
        cancellable: false,
      }, async (progress) => {
        let done = 0;
        for (const f of files) {
          try {
            await ImageConverter.convert(f, { format, quality });
          } catch { /* skip bad files */ }
          progress.report({ increment: (100 / files.length), message: path.basename(f) });
          done++;
        }
        vscode.window.showInformationMessage(`Batch complete: ${done}/${files.length} converted.`);
      });
    } catch (err: any) {
      vscode.window.showErrorMessage(`Batch conversion failed: ${err.message}`);
    }
  });

  context.subscriptions.push(openPanel, convertImage, extractAudio, boostVolume, batchConvert);
}

export function deactivate() {}

function getQuality(): number {
  return vscode.workspace.getConfiguration('fileConverterPro').get('imageQuality', 90);
}

function getAudioBitrate(): string {
  return vscode.workspace.getConfiguration('fileConverterPro').get('audioBitrate', '192k');
}

function getVolumeBoost(): number {
  return vscode.workspace.getConfiguration('fileConverterPro').get('volumeBoostDb', 10);
}