import { Box, Button, useColorMode } from "@chakra-ui/react";
import React from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export default function CenterPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <Button
        position="fixed"
        right={10}
        top={10}
        width="fit-content"
        onClick={toggleColorMode}
      >
        {colorMode === "light" ? <MdDarkMode /> : <MdLightMode />}
      </Button>
      <Box
        minH="100vh"
        minW="100vw"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        {children}
      </Box>
    </>
  );
}
