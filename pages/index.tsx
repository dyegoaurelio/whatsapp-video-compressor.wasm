import React, { useState, useEffect } from "react";
// import './App.css';

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const MAX_BITS = 15.6 * 8000;
const MAX_SIZE = 16e6;
const AUDIO_BITRATE = 128;

let _duration = 0;
const ffmpeg = createFFmpeg({
  corePath: "ffmpeg-core.js",
  // log: true,
  logger: ({ message }) => {
    const regex = /Duration: (\d{2})\:(\d{2})\:(\d{2})\.(\d{2})/gm;
    const matches = regex.exec(String(message));
    if (matches != null) {
      const h = Number(matches[1]);
      const m = Number(matches[2]);
      const s = Number(matches[3]);
      const ms = Number(matches[4]);
      _duration = h * 3600 + m * 60 + s;
    }
  },
});

const IS_COMPATIBLE = typeof SharedArrayBuffer === "function";
const inputStr = "test.mp4";
const outputStr = "teste.mp4";

function millisToMinutesAndSeconds(millis: number) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (parseFloat(seconds) < 10 ? "0" : "") + seconds;
}

const useLoadFfmpeg = () => {
  const [ready, setReady] = useState(false);

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  useEffect(() => {
    load();
  }, []);

  return ready;
};

const getDuration = async () => {
  await ffmpeg.run("-i", inputStr);
  return _duration;
};

const getBitrate = async () => {
  const duration = await getDuration();
  const bitrate = Math.floor(MAX_BITS / duration) - AUDIO_BITRATE;
  return bitrate;
};

function App() {
  const ready = useLoadFfmpeg();
  const [video, setVideo] = useState<File>();
  const [finished, setFinished] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    (async () => {
      if (video) {
        ffmpeg.FS("writeFile", inputStr, await fetchFile(video));
      }
    })();
  }, [video]);

  const compressToWppSize = async () => {
    if (video) {
      setConverting(true);
      setFinished(false);
      // Run the FFMpeg command
      const bitrate = await getBitrate();
      const startTime = performance.now();
      await ffmpeg.run(
        "-y",
        "-i",
        inputStr,
        "-c:v",
        "libx264",
        "-b:v",
        `${bitrate}k`,
        "-c:a",
        "aac",
        "-b:a",
        `${AUDIO_BITRATE}k`,
        "-vsync",
        "cfr",
        outputStr
      );
      console.log("FIM DA CONVERSÃO");
      console.log(
        "tempo ",
        millisToMinutesAndSeconds(performance.now() - startTime)
      );

      // // Read the result
      const data = ffmpeg.FS("readFile", "teste.mp4");

      // // Create a URL
      setFinished(true);
      setConverting(false);
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
      <br />f : {finished ? "y" : "n"}
      <br />c : {converting ? "y" : "n"}
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default App;
