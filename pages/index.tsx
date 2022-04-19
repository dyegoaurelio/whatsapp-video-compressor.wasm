import React, { useState, useEffect } from "react";
// import './App.css';

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const ffmpeg = createFFmpeg({
  corePath: "ffmpeg-core.js",
  log: true,
});

const IS_COMPATIBLE = typeof SharedArrayBuffer === "function";

function App() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState<File>();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  useEffect(() => {
    load();
  }, []);

  const compressToWppSize = async () => {
    const inputStr = "test.mp4";
    const outputStr = "teste.mp4";
    // Write the file to memory
    if (video) {
      ffmpeg.FS("writeFile", inputStr, await fetchFile(video));

      // Run the FFMpeg command
      await ffmpeg.run(
        "-y",
        "-i",
        inputStr,
        "-c:v",
        "libx264",
        "-b:v",
        "16000k",
        "-c:a",
        "aac",
        "-b:a",
        "128k",

        "-vsync",
        "cfr",
        outputStr
      );

      // // Read the result
      const data = ffmpeg.FS("readFile", "teste.mp4");

      // // Create a URL
      var link = document.createElement("a");
      link.href = window.URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      link.download = "teste.mp4";
      link.click();
    }
  };

  return ready ? (
    <div className="App">
      {video && (
        <video controls width="250" src={URL.createObjectURL(video)}></video>
      )}

      <input
        type="file"
        onChange={(e) => {
          const v = e.target.files?.item(0);
          if (v) setVideo(v);
        }}
      />

      <h3>Result</h3>

      <button onClick={compressToWppSize}>Convert</button>
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default App;
