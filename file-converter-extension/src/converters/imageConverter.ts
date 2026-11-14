import * as sharp from 'sharp';
import * as path from 'path';

export interface ImageConvertOptions {
  format: string;
  quality?: number;
  width?: number;
  height?: number;
  grayscale?: boolean;
}

export class ImageConverter {
  static readonly SUPPORTED_INPUTS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff', '.tif', '.gif', '.avif'];
  static readonly SUPPORTED_OUTPUTS = ['png', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'tiff'];

  static async convert(inputPath: string, options: ImageConvertOptions): Promise<string> {
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

    const sharpInstance = sharp as any;
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