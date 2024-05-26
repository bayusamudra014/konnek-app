import CenterPage from "@/client/components/CenterPage";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useRef, useState } from "react";
import icon from "@/icon/icon.png";
import Head from "next/head";
import { useRouter } from "next/router";
import { getPermission, useMessaging } from "@/client/hooks/messaging";
import { decodeCertificateKeyFile, login } from "@/client/api/login";
import AuthContext from "@/client/context/AuthContext";

export default function Login() {
  const {
    token,
    cipher,
    certificateKey,
    setCipher,
    setToken,
    setCertificateKey,
  } = useContext(AuthContext);

  const [onLoad, setLoad] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const fileRef = useRef<HTMLInputElement>(null);
  const [fileValid, setFileValid] = useState(true);
  const [fileErrorMessage, setFileErrorMessage] = useState("");

  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const { token: fcmToken, permission } = useMessaging();

  useEffect(() => {
    if (token !== null && cipher !== null && certificateKey !== null) {
      router.push("/");
      return;
    }

    setToken(null);
    setCipher(null);
    setCertificateKey(null);
  }, []);

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

  if (!fcmToken) {
    return (
      <CenterPage>
        <Box>
          <Heading mb={2}>Google Service Blocked</Heading>
          <Text mb={8}>
            You should allow google service to use this application
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

  const onLogin = async () => {
    setLoad(true);
    try {
      const file = fileRef.current?.files?.[0];
      if (!file) {
        setFileValid(false);
        setFileErrorMessage("Private key is required");
      }

      if (password === "") {
        setPasswordValid(false);
        setPasswordErrorMessage("Password is required");
      }

      if (!file || password === "") {
        return;
      }

      setFileValid(true);
      setPasswordValid(true);

      const certificateKey = await decodeCertificateKeyFile(file, password);

      if (!certificateKey.isSuccess) {
        if (certificateKey.message?.indexOf("Invalid password") != -1) {
          setPasswordValid(false);
          setPasswordErrorMessage("Password is not correct");
        }

        toast({
          title: "Login Failed",
          description: certificateKey.message,
          duration: 3000,
          isClosable: true,
          status: "error",
        });
        return;
      }

      if (!fcmToken) {
        toast({
          title: "Login Failed",
          description: "Failed to get FCM token. Please wait a moment",
          duration: 3000,
          isClosable: true,
          status: "error",
        });
        return;
      }

      const result = await login(certificateKey.certificateKey!, fcmToken);

      if (!result.isSuccess) {
        toast({
          title: "Login Failed",
          description: result.message,
          duration: 3000,
          isClosable: true,
          status: "error",
        });
        return;
      }

      setToken(result.token!);
      setCipher(result.cipher!);
      setCertificateKey(certificateKey.certificateKey!);

      toast({
        title: "Login Success",
        description: "You have successfully logged in",
        duration: 3000,
        isClosable: true,
        status: "success",
      });

      router.push("/");
    } finally {
      setLoad(false);
    }
  };

  return (
    <CenterPage>
      <Head>
        <title>Login | Konnek App</title>
      </Head>
      <Box
        mb={6}
        display="flex"
        flexDirection="row"
        gap={4}
        alignItems="center"
      >
        <Image src={icon.src} width="60px" height="60px" alt="Konnek App" />
        <Heading>Konnek App</Heading>
      </Box>
      <Box>
        <Heading as="h2" size="md" mb={4}>
          Login Page
        </Heading>
        <FormControl mb={3} isRequired isInvalid={!fileValid}>
          <FormLabel>Private Key</FormLabel>
          <Input type="file" size="md" ref={fileRef} required />
          {!fileValid && (
            <FormErrorMessage>{fileErrorMessage}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl mb={6} isRequired isInvalid={!passwordValid}>
          <FormLabel mb={2}>Password</FormLabel>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={show ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          {!passwordValid && (
            <FormErrorMessage>{passwordErrorMessage}</FormErrorMessage>
          )}
        </FormControl>
        <Box display="flex" gap={3} alignItems="center">
          <Button colorScheme="green" onClick={onLogin} isLoading={onLoad}>
            Login
          </Button>
          <Link
            href="#"
            onClick={() => router.push("/register")}
            color="green.500"
          >
            Create new account
          </Link>
        </Box>
      </Box>
    </CenterPage>
  );
}
