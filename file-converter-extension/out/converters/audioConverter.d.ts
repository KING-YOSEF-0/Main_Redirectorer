export interface AudioConvertOptions {
    outputFormat?: string;
    bitrate?: string;
}
export interface VolumeOptions {
    gainDb: number;
    outputFormat?: string;
}
export declare class AudioConverter {
    static readonly VIDEO_INPUTS: string[];
    static readonly AUDIO_INPUTS: string[];
    static readonly OUTPUT_FORMATS: string[];
    static extractAudio(inputPath: string, options?: AudioConvertOptions): Promise<string>;
    static boostVolume(inputPath: string, options: VolumeOptions): Promise<string>;
}
//# sourceMappingURL=audioConverter.d.ts.map