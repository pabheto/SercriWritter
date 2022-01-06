import "../styles/globals.css";
import "antd/dist/antd.css";

import "regenerator-runtime/runtime";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
export default MyApp;
