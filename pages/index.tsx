import Header from "components/Header";
import {
  useCompressToWppSize,
  useGetCompressProgress,
  useLoadFfmpeg,
  useFfmpegVideo,
} from "hooks";
import React, { useState, useEffect, useRef } from "react";
import { extractFileName } from "utils";
import { ffmpeg, _time, outputStr } from "utils/ffmpeg";
import classes from "styles/index.module.css";

function App() {
  const ready = useLoadFfmpeg();
  const { video, setVideo } = useFfmpegVideo(ready);

  const { finished, converting, handleStartConversion } =
    useCompressToWppSize(video);

  const progress = useGetCompressProgress(converting);

  const downloadRef = useRef<HTMLAnchorElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!video && inputRef.current?.value) {
      // update state when browser autofill input data
      const v = inputRef.current.files?.item(0);
      if (v) setVideo(v);
    }
  });

  useEffect(() => {
    if (finished && !converting && downloadRef.current && video) {
      // // Download the result
      const data = ffmpeg.FS("readFile", outputStr);
      var link = downloadRef.current;
      link.href = window.URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
      link.download = `${extractFileName(video.name)}-WPP.mp4`;
      link.click();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, converting]);

  return (
    <div>
      <Header pageReady={ready} />
      <div className={classes.content}>
        <div>
          <h3>A tool for compressing videos in order to share on Whatsapp.</h3>
          <section>
            Often you need to send a video through Whatsapp, but it isn&apos;t
            compatible or exceeds the size limit.
          </section>
          <section>
            This tool converts the file into a compatible format within the{" "}
            <b>20 MB</b> size limit.
          </section>
        </div>
        <input
          type="file"
          id={classes.video_upload}
          disabled={converting}
          ref={inputRef}
          onChange={(e) => {
            const v = e.target.files?.item(0);
            if (v) setVideo(v);
          }}
        />

        <div>
          <h4>Select a video above to convert it.</h4>
          <ul>
            <li>
              All processing is done privately and securely on your machine!
            </li>
            <li>Now this website <b>works offline !</b> </li>
          </ul>
        </div>

        {ready ? (
          <>
            <button
              id={classes.convert_btn}
              disabled={!video || converting}
              onClick={handleStartConversion}
            >
              Convert
            </button>
            <h3>Results</h3>
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
          </>
        ) : (
          <p>Loading resources ...</p>
        )}
      </div>
    </div>
  );
}

export default App;
