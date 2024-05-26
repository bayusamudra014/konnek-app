import { Box, ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";

import "@/client/firebase";
import theme from "@/styles/theme";
import { AuthContextProvider } from "@/client/context/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthContextProvider>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </AuthContextProvider>
  );
}
