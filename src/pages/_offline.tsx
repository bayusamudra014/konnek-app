import CenterPage from "@/client/components/CenterPage";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import React from "react";

export default function Offline() {
  return (
    <CenterPage>
      <Box>
        <Heading mb={2}>Offline :(</Heading>
        <Text mb={8}>You are offline right now. Please try again later</Text>
        <Button
          onClick={() => {
            location.reload();
          }}
        >
          Refresh
        </Button>
      </Box>
    </CenterPage>
  );
}
