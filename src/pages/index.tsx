"use client";

import CenterPage from "@/client/components/CenterPage";
import auth from "@/client/context/AuthContext";
import { getPermission, useMessaging } from "@/client/hooks/messaging";
import log from "@/lib/logger";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

export default function Homepage() {
  const { token, certificateKey, setToken, setCipher, setCertificateKey } =
    useContext(auth);
  const toast = useToast();
  const router = useRouter();
  const { permission } = useMessaging();

  const onLogout = async () => {
    setToken(null);
    setCipher(null);
    setCertificateKey(null);

    router.push("/login");
  };

  const [peerId, setPeerId] = useState("");

  useEffect(() => {
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

  const onStartMessage = () => {
    const trimmedPeerId = peerId.trim();
    log.info({
      msg: "start message",
      name: "homepage",
      peerId,
    });

    if (trimmedPeerId === "") {
      toast({
        status: "error",
        position: "bottom",
        title: "Messaging",
        description: "Please enter user id",
      });

      return;
    }

    if (trimmedPeerId === certificateKey!.userId) {
      toast({
        status: "error",
        position: "bottom",
        title: "Messaging",
        description: "You can't send message to yourself",
      });

      return;
    }

    router.push(`/message/${trimmedPeerId.trim()}`);
  };

  return (
    <CenterPage>
      <Box>
        <Box>
          <Heading mb={2}>Welcome</Heading>
          <Text mb={8}>Welcome to Konnek Messaging</Text>
          <Text mb={8}>Your id: {certificateKey?.userId}</Text>
        </Box>
        <Box mb={8}>
          <Heading as="h2" size="md" mb={2}>
            Start Message
          </Heading>
          <FormControl mb={3} isRequired>
            <FormLabel>User Id</FormLabel>
            <Input
              type="text"
              size="md"
              value={peerId}
              onChange={(el) => setPeerId(el.target.value)}
              required
            />
            <FormHelperText>Enter user id to send message</FormHelperText>
          </FormControl>
          <Button colorScheme="green" onClick={onStartMessage}>
            Start Messaging
          </Button>
        </Box>
        <Box>
          <Heading as="h2" size="md" mb={2}>
            Account Management
          </Heading>
          <Button colorScheme="red" onClick={onLogout}>
            Logout
          </Button>
        </Box>
      </Box>
    </CenterPage>
  );
}
