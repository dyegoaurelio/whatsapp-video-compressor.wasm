import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { calculateLogSeconds } from "utils";

const MAX_BITS = 15.6 * 8000;
const MAX_SIZE = 16e6;
export const AUDIO_BITRATE = 128;
const regexDuration = /Duration: (\d{2})\:(\d{2})\:(\d{2})\.(\d{2})/gm;
const regexTime = /time=(\d{2})\:(\d{2})\:(\d{2})\.(\d{2})/gm;

export const inputStr = "INPUT.mp4";
export const outputStr = "OUTPUT.mp4";

const IS_COMPATIBLE = typeof SharedArrayBuffer === "function";

if (!IS_COMPATIBLE)
  alert(
    "Your current web browser version isn't compatible with this application!\nPlease update your web browser."
  );

let watchDuration = true;
let _duration = 0;
let watchTime = false;
export let _time = 0;

export const setWatchTime = (param: boolean) => {
  watchTime = param;
};

export const setWatchDuration = (param: boolean) => {
  watchDuration = param;
};

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

export const ffmpeg = createFFmpeg({
  corePath: "ffmpeg-core.js?v=1",
  // log: true,
  logger: ({ message }) => {
    if (watchTime) updateTime(message);
    if (watchDuration) updateDuration(message);
  },
});

const getDuration = async () => {
  await ffmpeg.run("-i", inputStr);
  return _duration;
};

export let storedDuration = 0;
export const getBitrate = async () => {
  const duration = await getDuration();
  storedDuration = duration;
  const bitrate = Math.floor(MAX_BITS / duration) - AUDIO_BITRATE;
  return bitrate;
};
