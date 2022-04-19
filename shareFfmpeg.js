const fs = require("fs");
const path = require("path");

const files = ["ffmpeg-core.js", "ffmpeg-core.wasm", "ffmpeg-core.worker.js"];

const shareFfmpeg = () => {
  console.log("Gerando ffmpeg-core.js ...");

  const originalFolder = path.resolve(
    __dirname,
    "node_modules/@ffmpeg/core/dist"
  );

  const publicFolder = path.resolve(__dirname, "public");

  if (!fs.existsSync(publicFolder)) {
    fs.mkdirSync(publicFolder);
  }

  files.forEach((file) =>
    fs.copyFileSync(`${originalFolder}/${file}`, `${publicFolder}/${file}`)
  );

  console.log("ffmpeg-core.js gerado");
};

module.exports = shareFfmpeg;
