import { useIsMobile } from "hooks";
import Head from "next/head";

const GithubRibbon = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <Head>
        <script
          type="text/javascript"
          src="https://cdn.jsdelivr.net/npm/fork-corner/dist/fork-corner.min.js"
          defer
          async
        />
      </Head>
      <div>
        <a
          href="https://github.com/dyegoaurelio/whatsapp-video-compressor.wasm"
          target="_blank"
          rel="noreferrer"
          id="fork-corner"
          className={`fork-corner fc-animate fc-theme-github ${
            isMobile ? "fc-pos-br" : "fc-pos-tr"
          }`}
        />
      </div>
    </>
  );
};

export default GithubRibbon;
