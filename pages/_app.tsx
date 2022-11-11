import { AppProps } from "next/app";
import Head from "next/head";
import "styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/fork-corner/dist/fork-corner.min.css"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
