import { ChakraProvider } from "@chakra-ui/react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <ChakraProvider>
          <Main />
          <NextScript />
        </ChakraProvider>
      </body>
    </Html>
  );
}
