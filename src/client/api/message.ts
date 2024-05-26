import "client-only";

import { decrypt, encrypt, sign, verify } from "@/lib/crypto";
import {
  Certificate,
  CertificateKey,
  verifyCertificate,
} from "@/lib/crypto/Certificate";
import { MeongCipher } from "@/lib/crypto/cipher/MeongCipher";
import { encodeArrayUint8, encodeBigInteger } from "@/lib/encoder/Encoder";
import http from "@/lib/http";
import log from "@/lib/logger";
import { getCertificate } from "./certificate";
import { CA_NAME } from "@/lib/crypto/const";
import { StoredMessage, db } from "@/client/db";
import { Cipher } from "@/lib/crypto/cipher/Cipher";

export interface Message {
  to: string;
  from: string;
  timestamp: number;
  signature?: Uint8Array;
  message: string;
}

export interface GetMessageResponse {
  isSuccess: boolean;
  message?: string;
  data?: Message[];
}

export async function getMessages(
  token: string,
  cipher: Cipher,
  after?: number
): Promise<GetMessageResponse> {
  try {
    const encryptedAfter = after
      ? cipher.encrypt(encodeBigInteger(BigInt(after)))
      : null;

    const { data } = await http.get("/message", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        after: encryptedAfter
          ? Buffer.from(encryptedAfter).toString("base64")
          : null,
      },
    });

    if (data.status !== "success") {
      log.error({
        name: "message:get",
        msg: "failed to get messages",
        cause: data.message,
      });
      return {
        isSuccess: false,
        message: "failed to get messages: " + data.message,
      };
    }

    const dataEncrypted = Buffer.from(data.data, "base64");
    const decrypted = Buffer.from(cipher.decrypt(dataEncrypted)).toString(
      "utf-8"
    );
    const messagesRaw = JSON.parse(decrypted);

    const messages: Message[] = messagesRaw.map(
      (el: any) =>
        ({
          to: el.to,
          from: el.from,
          timestamp: el.timestamp,
          signature: el.signature
            ? new Uint8Array(Buffer.from(el.signature, "base64"))
            : undefined,
          message: el.message,
        } as Message)
    );

    return {
      isSuccess: true,
      data: messages,
    };
  } catch (err: any) {
    log.error({ name: "message:get", msg: "unknown_error", err });
    return {
      isSuccess: false,
      message: "failed to get messages: " + err.message,
    };
  }
}

export interface SendMessageResponse {
  isSuccess: boolean;
  message?: string;
}

export async function sendMessage(
  token: string,
  to: string,
  message: string,
  serverCipher: Cipher,
  userId: string,
  certificateKey?: CertificateKey
): Promise<SendMessageResponse> {
  try {
    if (certificateKey && certificateKey.userId !== userId) {
      log.error({
        name: "message:send",
        msg: "invalid user id",
      });
      return {
        isSuccess: false,
        message: "invalid user id",
      };
    }

    const caCertificate = await getCertificate(CA_NAME);
    const peerCertificate = await getCertificate(to);
    if (
      peerCertificate.isSuccess === false ||
      caCertificate.isSuccess === false
    ) {
      log.error({
        name: "message:send",
        msg: "failed to get certificate",
      });
      return {
        isSuccess: false,
        message: "failed to get certificate",
      };
    }

    if (
      !(await verifyCertificate(
        peerCertificate.certificate!,
        caCertificate.certificate!
      ))
    ) {
      log.error({
        name: "message:send",
        msg: "failed to verify certificate",
      });
      return {
        isSuccess: false,
        message: "failed to verify certificate",
      };
    }

    const timestamp = Date.now();
    const messageEncrypted = await encrypt(
      Buffer.from(message),
      peerCertificate.certificate!
    );
    const payload = {
      to,
      message: Buffer.from(messageEncrypted).toString("base64"),
      from: certificateKey?.userId ?? userId,
      timestamp,
      signature: certificateKey
        ? Buffer.from(
            await sign(
              encodeArrayUint8([
                Buffer.from(certificateKey.userId),
                Buffer.from(to),
                encodeBigInteger(BigInt(timestamp)),
                messageEncrypted,
              ]),
              certificateKey
            )
          ).toString("base64")
        : null,
    };

    const parsedBuffer = Buffer.from(JSON.stringify(payload));
    const encrypted = Buffer.from(serverCipher.encrypt(parsedBuffer)).toString(
      "base64"
    );

    const { data } = await http.post(
      "/message",
      { payload: encrypted },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data.status !== "success") {
      log.error({
        name: "message:send",
        msg: "failed to send message",
        cause: data.message,
      });
      return {
        isSuccess: false,
        message: "failed to send message: " + data.message,
      };
    }

    return {
      isSuccess: true,
    };
  } catch (err: any) {
    log.error({ name: "message:send", msg: "failed_send", cause: err });
    return {
      isSuccess: false,
      message: "failed to send message: " + err.message,
    };
  }
}

export interface DecryptedMessage extends Message {}

export interface ValidateMessageResponse {
  isValid: boolean;
  message?: string;
}

export async function validateMessage(
  message: Message
): Promise<ValidateMessageResponse> {
  try {
    if (!message.signature) return { isValid: false, message: "no signature" };

    const caCertificate = await getCertificate(CA_NAME);
    const certificate = await getCertificate(message.from);

    if (!certificate.isSuccess || !caCertificate.isSuccess) {
      log.error({ name: "message:validate", msg: "failed to get certificate" });
      return {
        isValid: false,
        message: "failed to get certificate",
      };
    }

    if (
      !(await verifyCertificate(
        certificate.certificate!,
        caCertificate.certificate!
      ))
    ) {
      log.error({
        name: "message:validate",
        msg: "failed to verify certificate",
      });
      return {
        isValid: false,
        message: "failed to verify certificate",
      };
    }

    const isValid = await verify(
      encodeArrayUint8([
        Buffer.from(message.from),
        Buffer.from(message.to),
        encodeBigInteger(BigInt(message.timestamp)),
        Buffer.from(message.message, "base64"),
      ]),
      message.signature,
      certificate.certificate!
    );

    return {
      isValid,
      message: isValid ? undefined : "message signature does not match",
    };
  } catch (err: any) {
    log.error({
      name: "message:validate",
      msg: "failed to validate",
      cause: err,
    });
    return {
      isValid: false,
      message: "failed to validate message: " + err.message,
    };
  }
}

export interface DecryptMessageResponse {
  isSuccess: boolean;
  message?: string;
  data?: DecryptedMessage;
}

export async function decryptMessage(
  message: Message,
  certificateKey: CertificateKey
): Promise<DecryptMessageResponse> {
  try {
    const decrypted = Buffer.from(
      await decrypt(Buffer.from(message.message, "base64"), certificateKey)
    ).toString("utf-8");

    return {
      isSuccess: true,
      data: {
        to: message.to,
        from: message.from,
        timestamp: message.timestamp,
        signature: message.signature,
        message: decrypted,
      },
    };
  } catch (err: any) {
    log.error({
      name: "message:decrypt",
      msg: "failed to decrypt",
      cause: err,
    });
    return {
      isSuccess: false,
      message: "failed to decrypt message: " + err.message,
    };
  }
}

export interface StoreMessagesResponse {
  isSuccess: boolean;
  message?: string;
}

export async function storeMessages(
  message: Message[]
): Promise<StoreMessagesResponse> {
  try {
    const result: StoredMessage[] = message.map((el) => ({
      to: el.to,
      from: el.from,
      timestamp: el.timestamp,
      signature: el.signature
        ? Buffer.from(el.signature).toString("base64")
        : null,
      message: el.message,
    }));

    await db.messages.bulkPut(result);

    return {
      isSuccess: true,
    };
  } catch (err: any) {
    log.error({
      name: "message:store",
      msg: "failed to store messages",
      cause: err,
    });
    return {
      isSuccess: false,
      message: "failed to store messages: " + err.message,
    };
  }
}

export interface GetStoredMessagesResponse {
  isSuccess: boolean;
  message?: string;
  data?: Message[];
}

export async function getStoredMessages(
  peerId: string
): Promise<GetStoredMessagesResponse> {
  try {
    const result = await db.messages
      .where("from")
      .equals(peerId)
      .or("to")
      .equals(peerId)
      .sortBy("timestamp");
    return {
      isSuccess: true,
      data: result.map((el) => ({
        to: el.to,
        from: el.from,
        timestamp: el.timestamp,
        signature: el.signature
          ? new Uint8Array(Buffer.from(el.signature, "base64"))
          : undefined,
        message: el.message,
      })),
    };
  } catch (err: any) {
    log.error({
      name: "message:get",
      msg: "failed to get stored messages",
      cause: err,
    });
    return {
      isSuccess: false,
      message: "failed to get stored messages: " + err.message,
    };
  }
}
