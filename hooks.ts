import { useState, useEffect, useRef } from "react";
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

export const useLoadFfmpeg = () => {
  const [ready, setReady] = useState(false);

  const load = async () => {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();
    setReady(true);
  };

  useEffect(() => {
    load();
  }, []);

  return ready;
};

export const useGetCompressProgress = (converting: boolean) => {
  const [progress, setProgress] = useState((0).toFixed(1));
  const interval = useRef<NodeJS.Timer>();

  const updateProgress = () => {
    const progress = (_time / storedDuration) * 100;
    setProgress(progress.toFixed(1));
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

export const useCompressToWppSize = (video: File | undefined) => {
  const [finished, setFinished] = useState(false);
  const [converting, setConverting] = useState(false);

  const handleStartConversion = () => !converting && compressToWppSize();

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

  return { finished, converting, handleStartConversion };
};

export const useFfmpegVideo = (ffmpegReady: boolean) => {
  const [video, setVideo] = useState<File>();

  useEffect(() => {
    (async () => {
      if (video && ffmpegReady) {
        ffmpeg.FS("writeFile", inputStr, await fetchFile(video));
        setWatchDuration(true);
      }
    })();
  }, [video, ffmpegReady]);

  return { video, setVideo };
};

export const useIsMobile = () => {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1000
  );

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 768;

  return isMobile;
};
