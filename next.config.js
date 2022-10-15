/** @type {import('next').NextConfig} */
const shareFfmpeg = require("./shareFfmpeg.js");

const nextConfig = {
  generateEtags: false,
  // reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
      {
        source: "/ffmpeg-core.(js|wasm|worker.js)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  webpack(config) {
    shareFfmpeg();
    return config;
  },
};

module.exports = nextConfig;
