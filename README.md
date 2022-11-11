#  whatsapp-video-compressor.wasm


A simple Next.js website to compress videos targeting Whatsapp size limit

Everything is done client side, leveraging [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm), a pure Webassembly / Javascript port of FFmpeg.

## Key features:

- Works offline, since it's a PWA

- Local and private video processing

## Limitations:

- Slow, especially on mobile


## Running locally
After cloning the repository and installing the dependencies, just run 
```bash
npm run dev
```
