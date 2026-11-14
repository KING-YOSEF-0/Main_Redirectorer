# File Converter Pro Extension

A comprehensive VS Code extension for file conversion and processing.

## Features

### 1. Image Converter
- **Supported formats**: PNG, JPEG, WebP, AVIF, GIF, BMP, TIFF
- **Quality control**: Up to 100% quality settings
- **Batch processing**: Convert entire folders
- **Resize**: Specify width and height
- **Grayscale**: Convert to black and white

### 2. Audio & Video Processing
- **Video to Audio**: Extract audio from MP4, MOV, AVI, MKV, etc. → MP3, WAV, FLAC
- **Volume Boost**: Increase audio volume up to 50 dB
- **Bitrate control**: Customize output audio quality
- **Sample rate**: Set audio sampling rates
- **Channel control**: Mono/stereo processing

### 3. File Operations
- **Safe path handling**: Restrict to user directories
- **File hashing**: Generate checksums
- **Copy/Move/Delete**: Safe file operations
- **Directory listing**: Browse folders
- **File info**: Size, type, modified date

### 4. User Interface
- **Webview panel**: Full-featured hub with drag-and-drop
- **Quick actions**: Context menu integration
- **Keyboard shortcuts**: Ctrl+Alt+C (Cmd+Alt+C on Mac)
- **Progress tracking**: Visual feedback
- **Error handling**: Clear messages

## Commands

### Panel Commands
- `File Converter Pro: Open Panel` (Ctrl+Alt+C / Cmd+Alt+C)
- Access via Command Palette

### File Actions (Right-click Context Menu)
- **Image files**: Convert with context menu
- **Video files**: Extract audio
- **Audio files**: Boost volume
- **Folders**: Batch convert images

## Configuration

### Settings
```json
"fileConverterPro.outputFolder": "",                    // Default output folder
"fileConverterPro.imageQuality": 90,                     // Image quality (1-100)
"fileConverterPro.audioBitrate": "192k",                // Audio bitrate
"fileConverterPro.volumeBoostDb": 10,                   // Volume boost (dB)
```

## Installation

1. **Open VS Code**
2. **Go to Extensions** (Ctrl+Shift+X / Cmd+Shift+X)
3. **Search** "File Converter Pro"
4. **Install** the extension by "king-yosef"

## Usage

### Basic Image Conversion
1. Right-click an image file → **File Converter Pro: Convert Image**
2. Select output format (PNG, JPEG, WebP, etc.)
3. Quality settings applied

### Audio Extraction
1. Right-click a video file → **File Converter Pro: Extract Audio**
2. Default output is MP3 with 192k bitrate

### Volume Boosting
1. Right-click an audio file → **File Converter Pro: Boost Volume**
2. Enter dB value (1-50)
3. New boosted file created

### Batch Processing
1. Right-click a folder → **File Converter Pro: Batch Convert**
2. Select output format
3. All supported images converted

## Development

### Building
```bash
npm run compile
```

### Packaging
```bash
npm run package
```

### Publishing
```bash
npm run publish
```

### Technology Stack

- **Runtime**: Node.js
- **Image Processing**: Sharp (Node.js image library)
- **Audio/Video**: FFmpeg (fluent-ffmpeg)
- **Framework**: TypeScript
- **IDE**: VS Code Extension API

## Safety Features

- **Path safety**: Restricts operations to user directories
- **Permission checks**: Prevents access outside safe zones
- **Error handling**: Graceful failure with clear messages
- **Validation**: Input validation for all operations

## Troubleshooting

### Common Issues

1. **Ffmpeg not found**: Install FFmpeg on system
2. **Sharp not available**: Native dependencies may need installation
3. **Permission errors**: Check path safety restrictions

### Support

For issues and feature requests, contact the extension author.

## Future Enhancements

- **Video enhancement**: AI-powered quality improvement
- **OCR**: Text recognition from images
- **Video editing**: Trim, merge, and split operations
- **Metadata**: Add EXIF data and tags
- **Cloud integration**: Upload to cloud storage

## License

This extension is provided as a prototype. Use responsibly and within applicable laws and regulations.

## Version

v1.0.0 - Initial Release