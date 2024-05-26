"use client";

import CenterPage from "@/client/components/CenterPage";
import auth from "@/client/context/AuthContext";
import { getPermission, useMessaging } from "@/client/hooks/messaging";
import log from "@/lib/logger";
import { Box, Button, Heading, Text, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

export default function Homepage() {
  const { token, cipher } = useContext(auth);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    console.log("token", token);
    if (token === null) {
      router.push("/login");
    }
  }, []);

  if (token === null) {
    return (
      <CenterPage>
        <Box>
          <Heading mb={2}>Access Denied</Heading>
          <Text mb={8}>You should have logged in to access this page</Text>
          <Button
            onClick={() => {
              router.push("/login");
            }}
          >
            Login
          </Button>
        </Box>
      </CenterPage>
    );
  }

  const { token: fcmToken, permission } = useMessaging((data) => {
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

  if (permission !== "granted") {
    return (
      <CenterPage>
        <Box>
          <Heading mb={2}>Notification is Required</Heading>
          <Text mb={8}>
            You should allow notification to use this application
          </Text>
          <Button
            onClick={async () => {
              if (await getPermission()) {
                window.location.reload();
              }
            }}
          >
            Allow Notification
          </Button>
        </Box>
      </CenterPage>
    );
  }

  return (
    <Box>
      <Heading>Hello, World</Heading>
      <Text>Your current token: {token}</Text>
    </Box>
  );
}
