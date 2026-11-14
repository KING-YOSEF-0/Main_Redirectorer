export interface FileInfo {
    name: string;
    path: string;
    size: number;
    extension: string;
    isDirectory: boolean;
    lastModified: number;
    mimeType: string;
}
export declare class FileOps {
    static readonly SAFE_DIRS: string[];
    static isSafePath(filePath: string): boolean;
    static ensureSafe(filePath: string): void;
    static getFileInfo(filePath: string): FileInfo;
    static formatSize(bytes: number): string;
    static getMimeType(ext: string): string;
    static isImage(ext: string): boolean;
    static isVideo(ext: string): boolean;
    static isAudio(ext: string): boolean;
    static copyFile(src: string, dest: string): Promise<void>;
    static moveFile(src: string, dest: string): Promise<void>;
    static deleteFile(filePath: string): Promise<void>;
    static listDirectory(dirPath: string): Promise<FileInfo[]>;
    static createDirectory(dirPath: string): Promise<void>;
    static hashFile(filePath: string, algorithm?: string): Promise<string>;
    static findFiles(dirPath: string, extensions?: string[]): Promise<string[]>;
    static getTempDir(): string;
}
//# sourceMappingURL=fileOps.d.ts.map