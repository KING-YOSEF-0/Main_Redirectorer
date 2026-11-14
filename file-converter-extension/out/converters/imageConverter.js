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
exports.ImageConverter = void 0;
const sharp = __importStar(require("sharp"));
const path = __importStar(require("path"));
class ImageConverter {
    static async convert(inputPath, options) {
        const ext = path.extname(inputPath).toLowerCase();
        if (!this.SUPPORTED_INPUTS.includes(ext)) {
            throw new Error(`Unsupported image format: ${ext}`);
        }
        if (!this.SUPPORTED_OUTPUTS.includes(options.format)) {
            throw new Error(`Unsupported output format: ${options.format}`);
        }
        const dir = path.dirname(inputPath);
        const base = path.basename(inputPath, ext);
        const outExt = '.' + options.format;
        const outputPath = path.join(dir, base + outExt);
        const sharpInstance = sharp;
        let pipeline = sharpInstance(inputPath);
        if (options.width || options.height) {
            pipeline = pipeline.resize(options.width || 0, options.height || 0, { withoutEnlargement: true });
        }
        if (options.grayscale) {
            pipeline = pipeline.grayscale();
        }
        const quality = options.quality ?? 90;
        switch (options.format) {
            case 'png':
                pipeline = pipeline.png({ quality });
                break;
            case 'jpeg':
                pipeline = pipeline.jpeg({ quality });
                break;
            case 'webp':
                pipeline = pipeline.webp({ quality });
                break;
            case 'avif':
                pipeline = pipeline.avif({ quality });
                break;
            case 'gif':
                pipeline = pipeline.gif();
                break;
            case 'bmp':
                pipeline = pipeline.toFormat('raw');
                break;
            case 'tiff':
                pipeline = pipeline.tiff({ quality });
                break;
        }
        await pipeline.toFile(outputPath);
        return outputPath;
    }
}
exports.ImageConverter = ImageConverter;
ImageConverter.SUPPORTED_INPUTS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff', '.tif', '.gif', '.avif'];
ImageConverter.SUPPORTED_OUTPUTS = ['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'tiff'];
//# sourceMappingURL=imageConverter.js.map