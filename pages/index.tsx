import Header from "components/Header";
import {
  useCompressToWppSize,
  useGetCompressProgress,
  useLoadFfmpeg,
  useFfmpegVideo,
} from "hooks";
import React, { useEffect, useRef } from "react";
import { extractFileName } from "utils";
import { ffmpeg, _time, outputStr } from "utils/ffmpeg";
import classes from "styles/index.module.css";
import ProgressBar from "components/ProgressBar";

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
        <div className={classes.upload_container}>
          <div className={classes.upload_content}>
            <div>
              <h4>Select a video to convert.</h4>
              <input
                type="file"
                id={classes.video_upload}
                disabled={converting}
                ref={inputRef}
                onChange={(e) => {
                  const v = e.target.files?.item(0);
                  if (v) setVideo(v)
                }}
              />
            </div>
            <div>
              <ul>
                <li>
                  All processing is done privately and securely on your machine!
                </li>
                <li>
                  Now this website <b>works offline!</b>{" "}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {ready ? (
          <div className={classes.result_container}>
            {(video && !converting) && (
            <button
              id={classes.convert_btn}
              onClick={handleStartConversion}
            >
              CONVERT
            </button>
            )}
            { (converting || finished) && (
              <div>
                <h3>Result</h3>
                <div className={classes.progressbar_wrapper}>
                  <div>
                    <ProgressBar
                      bgcolor="black"
                      completed={finished ? 100 : parseInt(progress)}
                      />
                    {finished && <h4><b>Finished!</b></h4>}
                  </div>
                </div>
              </div>
            ) }
            <br />
            <br />
            <a
              style={{
                display: finished ? "inline" : "none",
              }}
              ref={downloadRef}
            >
              <button><h4>DOWNLOAD</h4></button>
            </a>
          </div>
        ) : (
          <p>Loading resources ...</p>
        )}
      </div>
    </div>
  );
}

export default App;
