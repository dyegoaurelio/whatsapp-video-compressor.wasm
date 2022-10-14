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
    await ffmpeg.load();
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
  const [shouldConvertVideo, setShouldConvertVideo] = useState(false);

  useWriteVideo(video);

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

export const useWriteVideo = (video: File | undefined) => {
  useEffect(() => {
    (async () => {
      if (video) {
        ffmpeg.FS("writeFile", inputStr, await fetchFile(video));
        setWatchDuration(true);
      }
    })();
  }, [video]);
};
