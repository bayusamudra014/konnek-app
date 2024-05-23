import { useMessaging } from "@/hooks/messaging";
import log from "@/lib/logger";
import { Box, Heading, Text, useToast } from "@chakra-ui/react";
import { useEffect } from "react";

export default function Homepage() {
  const toast = useToast();
  const { token, permission } = useMessaging((data) => {
    log.info({
      msg: "get message",
      name: "homepage",
      data,
    });
    toast({
      status: "info",
      position: "bottom",
      title: "Messaging",
      description: "new message arrive",
    });
  });

  useEffect(() => {
    toast({
      status: "info",
      position: "bottom",
      title: "Messaging",
      description: "Token was changed",
    });
  }, [token]);

  useEffect(() => {
    toast({
      status: "info",
      position: "bottom",
      title: "Messaging",
      description: `Permission was changed to ${permission}`,
    });
  }, [permission]);

  return (
    <Box>
      <Heading>Hello, World</Heading>
      <Text>Your current token: {token}</Text>
    </Box>
  );
}
