import {
  DecryptedMessage,
  decryptMessage,
  getMessages,
  getStoredMessages,
  sendMessage,
  storeMessages,
  validateMessage,
} from "@/client/api/message";
import CenterPage from "@/client/components/CenterPage";
import { getPermission, useMessaging } from "@/client/hooks/messaging";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Switch,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import auth from "@/client/context/AuthContext";
import { FiSend } from "react-icons/fi";
import { IoMdHome } from "react-icons/io";
import { Certificate } from "@/lib/crypto/Certificate";
import { getCertificate } from "@/client/api/certificate";
import log from "@/lib/logger";
import { HiBadgeCheck } from "react-icons/hi";
import { RiForbidFill } from "react-icons/ri";
import { encrypt } from "@/lib/crypto";
import { db } from "@/client/db";

interface ShowMessage extends DecryptedMessage {
  encrypted: string;
}

export default function MessagePage() {
  const startTime = useRef(new Date().getTime());
  const params = useParams<{ peerid: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<ShowMessage[]>([]);
  const { token, certificateKey, cipher } = useContext(auth);
  const [peerCertificate, setPeerCertificate] = useState<Certificate | null>(
    null
  );
  const [isUserExist, setUserExist] = useState<boolean>(true);
  const [isInitializing, setInitializing] = useState<boolean>(true);
  const [isFailed, setFailed] = useState<boolean>(true);
  const [failedCause, setFailedCause] = useState<string>("");

  const [typedMessage, setTypedMessage] = useState<string>("");
  const [withSignature, setWithSignature] = useState<boolean>(true);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);

  const toast = useToast();

  async function fetchMessageFromServerAndStore() {
    const lastMessage = await db.messages.orderBy("timestamp").last();

    if (lastMessage) {
      var lastMessageTimestamp = lastMessage.timestamp;
    } else {
      var lastMessageTimestamp = startTime.current;
    }

    const newMessage = await getMessages(token!, cipher!, lastMessageTimestamp);

    if (!newMessage.isSuccess) {
      toast({
        title: "Failed to get messages",
        description: newMessage.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const decrypted = Promise.all(
      newMessage.data!.map(async (message) => {
        try {
          const result = await decryptMessage(message, certificateKey!);

          if (result === null) {
            return null;
          }

          return {
            from: result.data!.from,
            message: result.data!.message,
            timestamp: result.data!.timestamp,
            signature: result.data!.signature,
            to: result.data!.to,
            encrypted: message.message,
          } as ShowMessage;
        } catch (e: any) {
          log.error({
            name: "message:decrypt",
            msg: "failed to decrypt message",
            cause: e,
          });
          return null;
        }
      })
    );

    const result = (await decrypted).filter(
      (message) => message !== null
    ) as ShowMessage[];

    // Re-encrypt message and store it
    const newEncryptedMessage = result.map(async (message) => {
      if (message.to === certificateKey?.userId) {
        return {
          to: message.to,
          from: message.from,
          timestamp: message.timestamp,
          message: message.encrypted,
          signature: message.signature,
        };
      } else {
        const messageEncrypted = await encrypt(
          Buffer.from(message.message),
          certificateKey!
        );
        return {
          to: message.to,
          from: message.from,
          timestamp: message.timestamp,
          message: Buffer.from(messageEncrypted).toString("base64"),
          signature: message.signature,
        };
      }
    });

    const newEncrypted = await Promise.all(newEncryptedMessage);
    await storeMessages(newEncrypted);
  }

  async function loadFromLocal() {
    if (!peerId || !certificateKey) {
      return;
    }

    const storedMessage = await getStoredMessages(peerId);

    if (!storedMessage.isSuccess) {
      toast({
        title: "Failed to get stored messages",
        description: storedMessage.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const decrypted = Promise.all(
      storedMessage.data!.map(async (message) => {
        try {
          const result = await decryptMessage(message, certificateKey!);

          if (result === null) {
            return null;
          }

          return {
            from: result.data!.from,
            message: result.data!.message,
            timestamp: result.data!.timestamp,
            signature: result.data!.signature,
            to: result.data!.to,
            encrypted: message.message,
          } as ShowMessage;
        } catch (e: any) {
          log.error({
            name: "message:decrypt",
            msg: "failed to decrypt message",
            cause: e,
          });
          return null;
        }
      })
    );

    const result = (await decrypted).filter(
      (message) => message !== null
    ) as ShowMessage[];

    setMessages(result);
  }

  const peerId = params?.peerid;

  const { permission } = useMessaging(async (data) => {
    await fetchMessageFromServerAndStore();
    await loadFromLocal();
  });

  useEffect(() => {
    async function initializing() {
      setInitializing(true);

      try {
        if (token === null || !params) {
          return;
        }

        if (params.peerid === "master_ca") {
          setUserExist(false);
          return;
        }

        const certificate = await getCertificate(params.peerid);
        if (certificate === null) {
          setUserExist(false);
          return;
        }

        if (!certificate.isSuccess) {
          setFailedCause(certificate.message!);
          setFailed(true);
          return;
        }

        await fetchMessageFromServerAndStore();
        await loadFromLocal();

        setUserExist(true);
        setPeerCertificate(certificate.certificate!);
        setFailed(false);
      } catch (e: any) {
        setFailedCause(e.message);
        setFailed(true);
      } finally {
        setInitializing(false);
      }
    }

    initializing();
  }, []);

  useEffect(() => {
    if (token === null) {
      router.push("/login");
    }
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

  if (!params || !params.peerid) {
    return (
      <CenterPage>
        <Box>
          <Heading mb={2}>Bad Request</Heading>
          <Text mb={8}>You need peer id to send message</Text>
          <Button
            onClick={() => {
              router.push("/");
            }}
          >
            Homepage
          </Button>
        </Box>
      </CenterPage>
    );
  }

  if (isInitializing) {
    return (
      <CenterPage>
        <Box>
          <Heading mb={4}>
            Initializing <Spinner />
          </Heading>
          <Text mb={8}>Please wait while initializing</Text>
        </Box>
      </CenterPage>
    );
  }

  if (!isUserExist) {
    return (
      <CenterPage>
        <Box>
          <Heading mb={2}>User Not Found</Heading>
          <Text mb={8}>User with id {params.peerid} not found</Text>
          <Button
            onClick={() => {
              router.push("/");
            }}
          >
            Homepage
          </Button>
        </Box>
      </CenterPage>
    );
  }

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

  if (isFailed) {
    return (
      <CenterPage>
        <Box>
          <Heading mb={2}>Failed</Heading>
          <Text mb={8}>Failed to initialize: {failedCause}</Text>
          <Button
            onClick={() => {
              router.push("/");
            }}
          >
            Homepage
          </Button>
        </Box>
      </CenterPage>
    );
  }

  async function sendMessageToServer() {
    setSendingMessage(true);
    try {
      if (!cipher || !certificateKey || !peerCertificate || !peerId) {
        return;
      }

      await sendMessage(
        token!,
        peerId,
        typedMessage,
        cipher,
        certificateKey.userId,
        withSignature ? certificateKey : undefined
      );

      const encrypted = await encrypt(
        Buffer.from(typedMessage),
        certificateKey
      );

      await storeMessages([
        {
          to: peerId,
          from: certificateKey.userId,
          message: Buffer.from(encrypted).toString("base64"),
          timestamp: new Date().getTime(),
        },
      ]);

      await loadFromLocal();
    } catch (e: any) {
      log.error({
        name: "message:send",
        msg: "failed to send message",
        cause: e,
      });
      toast({
        title: "Failed to send message",
        description: e.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSendingMessage(false);
    }
  }

  return (
    <CenterPage>
      <Card maxW="80vw" width="100%" maxHeight="90vh" height="100vh">
        <CardHeader
          alignItems="center"
          display="flex"
          flexDirection="row"
          gap={3}
        >
          <Avatar name={peerId} size="md" />
          <Text as="h1" fontWeight="bold" fontSize="x-large">
            {peerId}
          </Text>
          <Box ml="auto">
            <FormControl display="flex" alignItems="center">
              <Switch
                id="with-signature"
                onClick={() => setWithSignature(!withSignature)}
                isChecked={withSignature}
              />
              <FormLabel htmlFor="with-signature" ml={2}>
                Use Signature
              </FormLabel>
            </FormControl>
          </Box>
          <Button ml={4} onClick={() => router.push("/")}>
            <IoMdHome />
          </Button>
        </CardHeader>
        <CardBody>
          <Box
            display="flex"
            flexDirection="column"
            gap={4}
            fontSize="large"
            overflow="auto"
            height="70vh"
            padding="20px"
          >
            {messages.map((message) => {
              if (message.from === peerId) {
                return <PeerMessage message={message} />;
              } else {
                return <MyMessage message={message} />;
              }
            })}
          </Box>
        </CardBody>
        <CardFooter>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              type="text"
              placeholder="Send a message"
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                isLoading={sendingMessage}
                onClick={sendMessageToServer}
              >
                <FiSend />
              </Button>
            </InputRightElement>
          </InputGroup>
        </CardFooter>
      </Card>
    </CenterPage>
  );
}

function MyMessage({ message }: { message: ShowMessage }) {
  return (
    <Box
      bg="green.600"
      borderRadius="10px"
      padding="10px 20px"
      width="fit-content"
      marginLeft="auto"
      color="white"
    >
      <Box>
        <Text>{message.message}</Text>
      </Box>
    </Box>
  );
}

function PeerMessage({ message }: { message: ShowMessage }) {
  const [checked, setChecked] = useState<boolean>(false);
  const [valid, setValid] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  async function checkSignature() {
    try {
      setLoading(true);
      const result = await validateMessage({
        from: message.from,
        message: message.encrypted,
        signature: message.signature,
        timestamp: message.timestamp,
        to: message.to,
      });

      if (!result.isValid) {
        log.error({
          name: "message:validate",
          msg: "failed to validate message",
          cause: result.message,
        });
        setValid(false);
        return;
      }

      setValid(true);
    } catch (err) {
      log.error({
        name: "message:validate",
        msg: "failed to validate message",
        cause: err,
      });
      setValid(false);
    } finally {
      setChecked(true);
      setLoading(false);
    }
  }

  return (
    <Box
      bg="gray.600"
      borderRadius="10px"
      padding="10px 20px"
      width="fit-content"
      marginRight="auto"
      color="white"
    >
      <Box display="flex" gap="2" alignContent="center">
        <Text>{message.message}</Text>
        {message.signature && !checked && (
          <Button
            colorScheme="teal"
            size="xs"
            onClick={checkSignature}
            isLoading={isLoading}
          >
            Check
          </Button>
        )}
        {checked && valid && (
          <Tooltip label="Signature Valid">
            <HiBadgeCheck />
          </Tooltip>
        )}
        {checked && !valid && (
          <Tooltip label="Signature Invalid">
            <RiForbidFill />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
