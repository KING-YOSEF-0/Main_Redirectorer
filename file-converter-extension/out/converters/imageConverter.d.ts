export interface ImageConvertOptions {
    format: string;
    quality?: number;
    width?: number;
    height?: number;
    grayscale?: boolean;
}
export declare class ImageConverter {
    static readonly SUPPORTED_INPUTS: string[];
    static readonly SUPPORTED_OUTPUTS: string[];
    static convert(inputPath: string, options: ImageConvertOptions): Promise<string>;
}
//# sourceMappingURL=imageConverter.d.ts.map