import CenterPage from "@/client/components/CenterPage";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import icon from "@/icon/icon.png";
import {
  encodeCertificateKeyFile,
  generateKeypair,
  register,
} from "@/client/api/register";
import { SHA256 } from "@/lib/crypto/digest/SHA2";
import { downloadBlob } from "@/client/file";

export default function Register() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const [showPasswordVerify, setShowPasswordVerify] = useState(false);
  const [passwordVerify, setPasswordVerify] = useState("");
  const [passwordVerifyValid, setPasswordVerifyValid] = useState(true);
  const [passwordVerifyErrorMessage, setPasswordVerifyErrorMessage] =
    useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userId, setUserId] = useState("test");
  const [fileKey, setFileKey] = useState<Blob | null>(null);
  const [isLoading, setLoading] = useState(false);

  const toast = useToast();

  const onRegister = async () => {
    if (password === "") {
      setPasswordValid(false);
      setPasswordErrorMessage("Password is required");
    }

    if (password.length < 8) {
      setPasswordValid(false);
      setPasswordErrorMessage("Password should be at least 8 characters");
    }

    if (passwordVerify === "") {
      setPasswordVerifyValid(false);
      setPasswordVerifyErrorMessage("Password Verify is required");
    }

    if (password !== passwordVerify) {
      setPasswordVerifyValid(false);
      setPasswordVerifyErrorMessage(
        "Password Verify should be same as Password"
      );
    }

    if (
      password === "" ||
      passwordVerify === "" ||
      password !== passwordVerify
    ) {
      return;
    }

    setPasswordValid(true);
    setPasswordVerifyValid(true);

    setLoading(true);

    const keypairResponse = await generateKeypair();

    if (!keypairResponse.isSuccess) {
      toast({
        title: "Failed to generate keypair",
        description: keypairResponse.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    const registerResponse = await register(keypairResponse.privateKey!);

    if (!registerResponse.isSuccess) {
      toast({
        title: "Failed to register",
        description: registerResponse.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    const userId = registerResponse.certificateKey!.userId;
    setUserId(userId);

    const resultFile = await encodeCertificateKeyFile(
      registerResponse.certificateKey!,
      password
    );

    if (!resultFile.isSuccess) {
      toast({
        title: "Failed to encode certificate key",
        description: resultFile.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    setFileKey(resultFile.file!);
    downloadBlob(resultFile.file!, `${userId}.key`);

    onOpen();
    setLoading(false);
  };

  return (
    <>
      <CenterPage>
        <Head>
          <title>Register | Konnek App</title>
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
            Register Page
          </Heading>

          <FormControl mb={6} isRequired isInvalid={!passwordValid}>
            <FormLabel mb={2}>Password</FormLabel>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            {!passwordValid && (
              <FormErrorMessage>{passwordErrorMessage}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl mb={6} isRequired isInvalid={!passwordValid}>
            <FormLabel mb={2}>Password Verify</FormLabel>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                type={showPasswordVerify ? "text" : "password"}
                placeholder="Enter password"
                value={passwordVerify}
                onChange={(e) => setPasswordVerify(e.target.value)}
                required
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowPasswordVerify(!showPasswordVerify)}
                >
                  {showPasswordVerify ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            {!passwordVerifyValid && (
              <FormErrorMessage>{passwordVerifyErrorMessage}</FormErrorMessage>
            )}
          </FormControl>

          <Box display="flex" gap={3} alignItems="center">
            <Button
              colorScheme="green"
              onClick={onRegister}
              isLoading={isLoading}
            >
              Register
            </Button>
            <Link
              href="#"
              onClick={() => router.push("/login")}
              color="green.500"
            >
              Go to Login Page
            </Link>
          </Box>
        </Box>
      </CenterPage>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <Box p={4}>
            <ModalHeader>Registration Success</ModalHeader>

            <ModalBody>
              <Text mb={3}>
                You're registered to our system. Your private key has been
                downloaded. If you ready, please do login.
              </Text>
              <Box mb={3}>
                <Text>Your User Id is</Text>
                <Text fontWeight="bold" fontSize="20px" fontFamily="monospace">
                  {userId}
                </Text>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Box>
                <Button
                  variant="ghost"
                  mr={3}
                  onClick={() => {
                    if (fileKey) {
                      downloadBlob(fileKey, `${userId}.key`);
                    }
                  }}
                >
                  Download Key
                </Button>
                <Button
                  colorScheme="green"
                  onClick={() => {
                    onClose();
                    router.push("/login");
                  }}
                >
                  Login
                </Button>
              </Box>
            </ModalFooter>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
}
