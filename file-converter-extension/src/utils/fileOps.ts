import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';
import * as vscode from 'vscode';

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  extension: string;
  isDirectory: boolean;
  lastModified: number;
  mimeType: string;
}

export class FileOps {
  static readonly SAFE_DIRS = [
    path.join(os.tmpdir(), 'file-converter-pro'),
    path.join(os.homedir(), 'Desktop'),
    path.join(os.homedir(), 'Documents'),
    path.join(os.homedir(), 'Downloads'),
    path.join(os.homedir(), 'Pictures'),
    path.join(os.homedir(), 'Videos'),
    path.join(os.homedir(), 'Music'),
  ];

  static isSafePath(filePath: string): boolean {
    const normalized = path.resolve(filePath);
    const home = os.homedir();
    const workspace = vscode.workspace.rootPath || '';

    if (normalized.startsWith(home)) return true;
    if (workspace && normalized.startsWith(workspace)) return true;
    if (this.SAFE_DIRS.some(dir => normalized.startsWith(dir))) return true;
    return false;
  }

  static ensureSafe(filePath: string): void {
    if (!this.isSafePath(filePath)) {
      throw new Error(`Access denied: ${filePath} is outside safe directories.`);
    }
  }

  static getFileInfo(filePath: string): FileInfo {
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

  static formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
  }

  static getMimeType(ext: string): string {
    const map: Record<string, string> = {
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

  static isImage(ext: string): boolean {
    return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif', '.tiff', '.tif'].includes(ext);
  }

  static isVideo(ext: string): boolean {
    return ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.mpg', '.mpeg'].includes(ext);
  }

  static isAudio(ext: string): boolean {
    return ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.opus', '.wma'].includes(ext);
  }

  static async copyFile(src: string, dest: string): Promise<void> {
    this.ensureSafe(src);
    this.ensureSafe(dest);
    await fs.promises.copyFile(src, dest);
  }

  static async moveFile(src: string, dest: string): Promise<void> {
    this.ensureSafe(src);
    this.ensureSafe(dest);
    await fs.promises.rename(src, dest);
  }

  static async deleteFile(filePath: string): Promise<void> {
    this.ensureSafe(filePath);
    await fs.promises.unlink(filePath);
  }

  static async listDirectory(dirPath: string): Promise<FileInfo[]> {
    this.ensureSafe(dirPath);
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const results: FileInfo[] = [];

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
      } catch {
        // skip inaccessible entries
      }
    }

    return results.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }

  static async createDirectory(dirPath: string): Promise<void> {
    this.ensureSafe(dirPath);
    await fs.promises.mkdir(dirPath, { recursive: true });
  }

  static async hashFile(filePath: string, algorithm: string = 'sha256'): Promise<string> {
    this.ensureSafe(filePath);
    return new Promise<string>((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  static async findFiles(dirPath: string, extensions: string[] = []): Promise<string[]> {
    this.ensureSafe(dirPath);
    const results: string[] = [];

    const walk = async (currentDir: string) => {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
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

  static getTempDir(): string {
    const dir = path.join(os.tmpdir(), 'file-converter-pro');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
}