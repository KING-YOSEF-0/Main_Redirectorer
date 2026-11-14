import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as vscode from 'vscode';

export interface AudioConvertOptions {
  outputFormat?: string;
  bitrate?: string;
  sampleRate?: number;
  channels?: number;
}

export interface VolumeOptions {
  gainDb: number;
  outputFormat?: string;
}

export class AudioConverter {
  static readonly VIDEO_INPUTS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.mpg', '.mpeg'];
  static readonly AUDIO_INPUTS = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.wma', '.opus'];
  static readonly OUTPUT_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'];

  static async extractAudio(inputPath: string, options: AudioConvertOptions = {}): Promise<string> {
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
        .on('error', (err: any) => reject(err))
        .on('end', () => resolve(outputPath))
        .save(outputPath);
    });
  }

  static async boostVolume(inputPath: string, options: VolumeOptions): Promise<string> {
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
        .on('error', (err: any) => reject(err))
        .on('end', () => resolve(outputPath))
        .save(outputPath);
    });
  }

  static async getDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
        if (err) reject(err);
        else resolve(metadata.format.duration || 0);
      });
    });
  }
}