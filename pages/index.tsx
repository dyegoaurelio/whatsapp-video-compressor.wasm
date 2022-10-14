import {
  useCompressToWppSize,
  useGetCompressProgress,
  useLoadFfmpeg,
} from "hooks";
import React, { useState, useEffect } from "react";
import { ffmpeg, _time, outputStr } from "utils/ffmpeg";

function App() {
  const ready = useLoadFfmpeg();
  const [video, setVideo] = useState<File>();

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
      <br />p : {progress} %
    </div>
  ) : (
    <p>Loading...</p>
  );
}

export default App;
