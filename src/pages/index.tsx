import { useMessaging } from "@/hooks/messaging";
import log from "@/lib/logger";
import { Box, Heading, Text, useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import styles from "../pages/index.module.css";
import Button from "../components/Button";

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
      <div className={styles.container}>
        {/* Left Area */}
        <div className={styles.leftArea}>
          <h1 className={styles.title}>Welcome to Secure Chat!</h1>
        </div>

        {/* Right Area */}
        <div className={styles.rightArea}>
          <div className={styles.buttonContainer}>
            <Button href="/login" className={styles.loginButton}>
              Log In
            </Button>
            <Button href="/signup" className={styles.signupButton}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
      <Text>Your current token: {token}</Text>
    </Box>
  );
}
