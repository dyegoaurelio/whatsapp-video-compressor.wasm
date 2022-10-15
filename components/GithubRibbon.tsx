import Head from "next/head";

const GithubRibbon = () => (
  <>
    <Head>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/fork-corner/dist/fork-corner.min.css"
      />
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
        className="fork-corner fc-pos-tr fc-animate fc-theme-github"
      />
    </div>
  </>
);

export default GithubRibbon;
