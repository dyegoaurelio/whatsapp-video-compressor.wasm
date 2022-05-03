import React, { useState, useEffect, useRef } from "react";
// import './App.css';

import { fetchFile } from "@ffmpeg/ffmpeg";
import { millisToMinutesAndSeconds } from "utils";
import {
  ffmpeg,
  storedDuration,
  _time,
  setWatchTime,
  getBitrate,
  inputStr,
  AUDIO_BITRATE,
  outputStr,
  setWatchDuration,
} from "utils/ffmpeg";

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

const useGetCompressProgress = (converting: boolean) => {
  const [progress, setProgress] = useState(0);
  const interval = useRef<NodeJS.Timer>();

  const updateProgress = () => {
    setProgress(_time / storedDuration);
  };

  useEffect(() => {
    if (converting) {
      setWatchTime(true);
      interval.current = setInterval(updateProgress, 2000);
    }
    if (!converting) {
      setWatchTime(false);
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
        setWatchDuration(true);
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
