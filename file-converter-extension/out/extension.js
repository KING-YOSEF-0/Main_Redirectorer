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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const imageConverter_1 = require("./converters/imageConverter");
const audioConverter_1 = require("./converters/audioConverter");
const fileOps_1 = require("./utils/fileOps");
const panel_1 = require("./webview/panel");
function activate(context) {
    console.log('File Converter Pro is now active!');
    const panel = new panel_1.ConverterPanel(context);
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
            if (!input || !input[0])
                return;
            const formats = ['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'tiff'];
            const format = await vscode.window.showQuickPick(formats, { placeHolder: 'Choose output format' });
            if (!format)
                return;
            const quality = await vscode.workspace.getConfiguration('fileConverterPro').get('imageQuality', 90);
            const result = await imageConverter_1.ImageConverter.convert(input[0].fsPath, { format, quality });
            vscode.window.showInformationMessage(`Converted → ${path.basename(result)}`);
        }
        catch (err) {
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
            if (!input || !input[0])
                return;
            const out = await audioConverter_1.AudioConverter.extractAudio(input[0].fsPath, {
                outputFormat: 'mp3',
                bitrate: await vscode.workspace.getConfiguration('fileConverterPro').get('audioBitrate', '192k'),
            });
            vscode.window.showInformationMessage(`Audio extracted → ${path.basename(out)}`);
        }
        catch (err) {
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
            if (!input || !input[0])
                return;
            const db = await vscode.window.showInputBox({
                prompt: 'Volume boost in dB (1-50)',
                value: String(await vscode.workspace.getConfiguration('fileConverterPro').get('volumeBoostDb', 10)),
                validateInput: (v) => {
                    const n = Number(v);
                    return (n >= 1 && n <= 50) ? undefined : 'Enter 1-50';
                },
            });
            if (!db)
                return;
            const out = await audioConverter_1.AudioConverter.boostVolume(input[0].fsPath, { gainDb: Number(db) });
            vscode.window.showInformationMessage(`Volume boosted → ${path.basename(out)}`);
        }
        catch (err) {
            vscode.window.showErrorMessage(`Volume boost failed: ${err.message}`);
        }
    });
    const batchConvert = vscode.commands.registerCommand('fileConverterPro.batchConvert', async () => {
        try {
            const dir = await vscode.window.showOpenDialog({ canSelectMany: false, canSelectFolders: true });
            if (!dir || !dir[0])
                return;
            const files = await fileOps_1.FileOps.findFiles(dir[0].fsPath, ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.avif', '.tiff']);
            if (files.length === 0) {
                vscode.window.showWarningMessage('No supported images found in folder.');
                return;
            }
            const format = await vscode.window.showQuickPick(['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'tiff'], { placeHolder: 'Choose output format' });
            if (!format)
                return;
            const quality = await vscode.workspace.getConfiguration('fileConverterPro').get('imageQuality', 90);
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Converting ${files.length} images...`,
                cancellable: false,
            }, async (progress) => {
                let done = 0;
                for (const f of files) {
                    try {
                        await imageConverter_1.ImageConverter.convert(f, { format, quality });
                    }
                    catch { /* skip bad files */ }
                    progress.report({ increment: (100 / files.length), message: path.basename(f) });
                    done++;
                }
                vscode.window.showInformationMessage(`Batch complete: ${done}/${files.length} converted.`);
            });
        }
        catch (err) {
            vscode.window.showErrorMessage(`Batch conversion failed: ${err.message}`);
        }
    });
    context.subscriptions.push(openPanel, convertImage, extractAudio, boostVolume, batchConvert, panel);
}
function deactivate() { }
function getQuality() {
    return vscode.workspace.getConfiguration('fileConverterPro').get('imageQuality', 90);
}
function getAudioBitrate() {
    return vscode.workspace.getConfiguration('fileConverterPro').get('audioBitrate', '192k');
}
function getVolumeBoost() {
    return vscode.workspace.getConfiguration('fileConverterPro').get('volumeBoostDb', 10);
}
//# sourceMappingURL=extension.js.map