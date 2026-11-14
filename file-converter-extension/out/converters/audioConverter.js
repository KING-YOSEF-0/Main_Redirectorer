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
exports.AudioConverter = void 0;
const ffmpeg = __importStar(require("fluent-ffmpeg"));
const path = __importStar(require("path"));
class AudioConverter {
    static async extractAudio(inputPath, options = {}) {
        const ext = path.extname(inputPath).toLowerCase();
        if (!this.VIDEO_INPUTS.includes(ext)) {
            throw new Error(`Input must be a video file, got: ${ext}`);
        }
        const outFormat = options.outputFormat || 'mp3';
        if (!this.OUTPUT_FORMATS.includes(outFormat)) {
            throw new Error(`Unsupported output format: ${outFormat}`);
        }
        const dir = path.dirname(inputPath);
        const base = path.basename(inputPath, ext);
        const outputPath = path.join(dir, base + '_audio.' + outFormat);
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .noVideo()
                .audioCodec(outFormat)
                .audioBitrate(options.bitrate || '192k')
                .on('error', (err) => reject(err))
                .on('end', () => resolve(outputPath))
                .save(outputPath);
        });
    }
    static async boostVolume(inputPath, options) {
        const ext = path.extname(inputPath).toLowerCase();
        if (!this.AUDIO_INPUTS.includes(ext)) {
            throw new Error(`Input must be an audio file, got: ${ext}`);
        }
        const outFormat = options.outputFormat || path.extname(inputPath).slice(1);
        const dir = path.dirname(inputPath);
        const base = path.basename(inputPath, ext);
        const outputPath = path.join(dir, base + '_boosted.' + outFormat);
        return new Promise((resolve, reject) => {
            const command = ffmpeg(inputPath)
                .audioFilter('volume=' + options.gainDb + 'dB');
            command
                .on('error', (err) => reject(err))
                .on('end', () => resolve(outputPath))
                .save(outputPath);
        });
    }
    static async getDuration(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err)
                    reject(err);
                else
                    resolve(metadata.format.duration || 0);
            });
        });
    }
}
exports.AudioConverter = AudioConverter;
AudioConverter.VIDEO_INPUTS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.mpg', '.mpeg'];
AudioConverter.AUDIO_INPUTS = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.wma', '.opus'];
AudioConverter.OUTPUT_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'];
//# sourceMappingURL=audioConverter.js.map