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
exports.FileOps = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const os = __importStar(require("os"));
const vscode = __importStar(require("vscode"));
class FileOps {
    static isSafePath(filePath) {
        const normalized = path.resolve(filePath);
        const home = os.homedir();
        const workspace = vscode.workspace.rootPath || '';
        if (normalized.startsWith(home))
            return true;
        if (workspace && normalized.startsWith(workspace))
            return true;
        if (this.SAFE_DIRS.some(dir => normalized.startsWith(dir)))
            return true;
        return false;
    }
    static ensureSafe(filePath) {
        if (!this.isSafePath(filePath)) {
            throw new Error(`Access denied: ${filePath} is outside safe directories.`);
        }
    }
    static getFileInfo(filePath) {
        this.ensureSafe(filePath);
        const stat = fs.statSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        return {
            name: path.basename(filePath),
            path: filePath,
            size: stat.size,
            extension: ext,
            isDirectory: stat.isDirectory(),
            lastModified: stat.mtimeMs,
            mimeType: this.getMimeType(ext),
        };
    }
    static formatSize(bytes) {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
    }
    static getMimeType(ext) {
        const map = {
            '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp',
            '.avif': 'image/avif', '.tiff': 'image/tiff', '.tif': 'image/tiff',
            '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.avi': 'video/x-msvideo',
            '.mkv': 'video/x-matroska', '.webm': 'video/webm', '.flv': 'video/x-flv',
            '.wmv': 'video/x-ms-wmv', '.m4v': 'video/x-m4v',
            '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.flac': 'audio/flac',
            '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
            '.mpg': 'video/mpeg', '.mpeg': 'video/mpeg',
        };
        return map[ext] || 'application/octet-stream';
    }
    static isImage(ext) {
        return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif', '.tiff', '.tif'].includes(ext);
    }
    static isVideo(ext) {
        return ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.mpg', '.mpeg'].includes(ext);
    }
    static isAudio(ext) {
        return ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.opus', '.wma'].includes(ext);
    }
    static async copyFile(src, dest) {
        this.ensureSafe(src);
        this.ensureSafe(dest);
        await fs.promises.copyFile(src, dest);
    }
    static async moveFile(src, dest) {
        this.ensureSafe(src);
        this.ensureSafe(dest);
        await fs.promises.rename(src, dest);
    }
    static async deleteFile(filePath) {
        this.ensureSafe(filePath);
        await fs.promises.unlink(filePath);
    }
    static async listDirectory(dirPath) {
        this.ensureSafe(dirPath);
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        const results = [];
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            try {
                const stat = await fs.promises.stat(fullPath);
                const ext = path.extname(entry.name).toLowerCase();
                results.push({
                    name: entry.name,
                    path: fullPath,
                    size: stat.size,
                    extension: ext,
                    isDirectory: entry.isDirectory(),
                    lastModified: stat.mtimeMs,
                    mimeType: this.getMimeType(ext),
                });
            }
            catch {
                // skip inaccessible entries
            }
        }
        return results.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory)
                return a.isDirectory ? 1 : -1;
            return a.name.localeCompare(b.name);
        });
    }
    static async createDirectory(dirPath) {
        this.ensureSafe(dirPath);
        await fs.promises.mkdir(dirPath, { recursive: true });
    }
    static async hashFile(filePath, algorithm = 'sha256') {
        this.ensureSafe(filePath);
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash(algorithm);
            const stream = fs.createReadStream(filePath);
            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
    static async findFiles(dirPath, extensions = []) {
        this.ensureSafe(dirPath);
        const results = [];
        const walk = async (currentDir) => {
            const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isDirectory()) {
                    await walk(fullPath);
                }
                else {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (extensions.length === 0 || extensions.includes(ext)) {
                        results.push(fullPath);
                    }
                }
            }
        };
        await walk(dirPath);
        return results;
    }
    static getTempDir() {
        const dir = path.join(os.tmpdir(), 'file-converter-pro');
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        return dir;
    }
}
exports.FileOps = FileOps;
FileOps.SAFE_DIRS = [
    path.join(os.tmpdir(), 'file-converter-pro'),
    path.join(os.homedir(), 'Desktop'),
    path.join(os.homedir(), 'Documents'),
    path.join(os.homedir(), 'Downloads'),
    path.join(os.homedir(), 'Pictures'),
    path.join(os.homedir(), 'Videos'),
    path.join(os.homedir(), 'Music'),
];
//# sourceMappingURL=fileOps.js.map