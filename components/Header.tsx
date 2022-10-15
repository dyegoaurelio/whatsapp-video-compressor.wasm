import styles from "styles/header.module.css";
import dynamic from "next/dynamic";
import { FC, Suspense } from "react";

const GithubRibbon = dynamic(() => import("components/GithubRibbon"), {
  //   suspense: true,
  ssr: false,
});

const Header: FC<{ pageReady: boolean }> = ({ pageReady = true }) => (
  <header id={styles.header}>
    <div id={styles.content}>
      <img id={styles.wpp_logo} height={40} src="/whatsapp-icon.svg" />
      <h3>whatsapp-video-compressor.wasm</h3>
    </div>

    <Suspense fallback={`Loading...`}>{pageReady && <GithubRibbon />}</Suspense>
  </header>
);

export default Header;
