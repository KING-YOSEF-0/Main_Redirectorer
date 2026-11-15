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
const fs = __importStar(require("fs"));
const imageConverter_1 = require("../converters/imageConverter");
const audioConverter_1 = require("../converters/audioConverter");
class ConverterPanel {
    constructor(context) {
        this.context = context;
    }
    show() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            return;
        }
        this.panel = vscode.window.createWebviewPanel('fileConverterPro', 'File Converter Pro', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [this.context.extensionUri],
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
    dispose() {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
    }
    getHtmlContent() {
        const htmlPath = path.join(this.context.extensionPath, 'media', 'index.html');
        return fs.readFileSync(htmlPath, 'utf8');
    }
}
exports.ConverterPanel = ConverterPanel;
//# sourceMappingURL=panel.js.map