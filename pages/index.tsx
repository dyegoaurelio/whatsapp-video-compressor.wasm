import React, { useState, useEffect, useRef } from "react";
// import './App.css';

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const MAX_BITS = 15.6 * 8000;
const MAX_SIZE = 16e6;
const AUDIO_BITRATE = 128;
const regexDuration = /Duration: (\d{2})\:(\d{2})\:(\d{2})\.(\d{2})/gm;
const regexTime = /time=(\d{2})\:(\d{2})\:(\d{2})\.(\d{2})/gm;

const calculateLogSeconds = (matches: Array<string>) => {
  const h = Number(matches[1]);
  const m = Number(matches[2]);
  const s = Number(matches[3]);
  const ms = Number(matches[4]);
  return h * 3600 + m * 60 + s + ms / 1000;
};

let watchDuration = true;
let _duration = 0;
let watchTime = false;
let _time = 0;

const updateDuration = (message: string) => {
  const matchesDuration = regexDuration.exec(String(message));
  if (matchesDuration != null) {
    _duration = calculateLogSeconds(matchesDuration);
  }
};

const updateTime = (message: string) => {
  const matchesTime = regexTime.exec(String(message));
  if (matchesTime != null) {
    _time = calculateLogSeconds(matchesTime);
  }
};

const ffmpeg = createFFmpeg({
  corePath: "ffmpeg-core.js",
  // log: true,
  logger: ({ message }) => {
    if (watchTime) updateTime(message);
    if (watchDuration) updateDuration(message);
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

let storedDuration = 0;
const getBitrate = async () => {
  const duration = await getDuration();
  storedDuration = duration;
  const bitrate = Math.floor(MAX_BITS / duration) - AUDIO_BITRATE;
  return bitrate;
};

const useGetCompressProgress = (converting: boolean) => {
  const [progress, setProgress] = useState(0);
  const interval = useRef<NodeJS.Timer>();

  const updateProgress = () => {
    setProgress(_time / storedDuration);
  };

  useEffect(() => {
    if (converting) {
      watchTime = true;
      interval.current = setInterval(updateProgress, 2000);
    }
    if (!converting) {
      watchTime = false;
      interval.current && clearInterval(interval.current);
    }
  }, [converting]);
  return progress;
};

const useCompressToWppSize = (video: File | undefined) => {
  const [finished, setFinished] = useState(false);
  const [converting, setConverting] = useState(false);
  const [shouldConvertVideo, setShouldConvertVideo] = useState(false);

  const handleStartConversion = () => {
    setShouldConvertVideo(true);
  };

  const handleFinishConversion = () => {
    setShouldConvertVideo(false);
  };

  useEffect(() => {
    if (finished && shouldConvertVideo) handleFinishConversion();
  }, [finished, shouldConvertVideo]);

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

      // // Create a URL
      setFinished(true);
      setConverting(false);
    }
  };

  useEffect(() => {
    if (video && shouldConvertVideo) compressToWppSize();
  }, [video, shouldConvertVideo]);

  return { finished, converting, handleStartConversion };
};

const useWriteVideo = (video: File | undefined) => {
  useEffect(() => {
    (async () => {
      if (video) {
        ffmpeg.FS("writeFile", inputStr, await fetchFile(video));
        watchDuration = true;
      }
    })();
  }, [video]);
};

function App() {
  const ready = useLoadFfmpeg();
  const [video, setVideo] = useState<File>();

  useWriteVideo(video);

  const { finished, converting, handleStartConversion } =
    useCompressToWppSize(video);

  const progress = useGetCompressProgress(converting);

  useEffect(() => {
    if (finished && !converting) {
      // // Read the result
      const data = ffmpeg.FS("readFile", outputStr);
      var link = document.createElement("a");
      link.href = window.URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      link.download = outputStr;
      link.click();
    }
  }, [finished, converting]);

  return ready ? (
    <div className="App">
      <input
        type="file"
        onChange={(e) => {
          const v = e.target.files?.item(0);
          if (v) setVideo(v);
        }}
      />
      <h3>Result</h3>
      <button onClick={handleStartConversion}>Convert</button>
      <br />f : {finished ? "y" : "n"}
      <br />c : {converting ? "y" : "n"}
      <br />p : {progress.toFixed(2)}
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default App;
