import {
  useCompressToWppSize,
  useGetCompressProgress,
  useLoadFfmpeg,
} from "hooks";
import React, { useState, useEffect, useRef } from "react";
import { extractFileName } from "utils";
import { ffmpeg, _time, outputStr } from "utils/ffmpeg";

function App() {
  const ready = useLoadFfmpeg();
  const [video, setVideo] = useState<File>();
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const { finished, converting, handleStartConversion } =
    useCompressToWppSize(video);

  const progress = useGetCompressProgress(converting);

  useEffect(() => {
    if (finished && !converting && downloadRef.current && video) {
      // // Read the result
      const data = ffmpeg.FS("readFile", outputStr);
      var link = downloadRef.current;
      link.href = window.URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      link.download = `${extractFileName(video.name)}-WPP.mp4`;
      link.click();
    }
  }, [finished, converting]);

  return ready ? (
    <div className="App">
      <input
        type="file"
        disabled={converting}
        onChange={(e) => {
          const v = e.target.files?.item(0);
          if (v) setVideo(v);
        }}
      />
      <h3>Result</h3>
      <button disabled={!video || converting} onClick={handleStartConversion}>
        Convert
      </button>
      <br />f : {finished ? "y" : "n"}
      <br />c : {converting ? "y" : "n"}
      <br />p : {finished ? "100" : progress} %
      <br />
      <br />
      <a
        style={{
          display: finished ? "inline" : "none",
        }}
        ref={downloadRef}
      >
        DOWNLOAD
      </a>
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default App;
