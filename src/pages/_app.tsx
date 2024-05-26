import "../styles/globals.css";
import type { AppProps } from "next/app";
import Header from "@/components/Header";
import { DarkModeProvider, useDarkMode } from "@/context/DarkModeContext";

//cannot find name darkmode
//darkmode is not defined

function MyApp({ Component, pageProps }: AppProps) {
  const { isDarkMode } = useDarkMode();
  return (
    <DarkModeProvider>
      <div className={isDarkMode ? "dark" : ""}>
        <Header />
        <Component {...pageProps} />
      </div>
    </DarkModeProvider>
  );
}

export default MyApp;
