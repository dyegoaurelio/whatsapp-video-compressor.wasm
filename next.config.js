/** @type {import('next').NextConfig} */
const shareFfmpeg = require("./shareFfmpeg.js");

const nextConfig = {
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
    ];
  },

  webpack(config) {
    shareFfmpeg();
    return config;
  },
};

module.exports = nextConfig;
