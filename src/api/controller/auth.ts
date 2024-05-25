import "server-only";

import jwt from "jsonwebtoken";
import { decodeArrayUint8 } from "@/lib/encoder/Encoder";

const macKey = process.env.MAC_KEY;
const encryptionKey = process.env.ENCRYPTION_KEY;

export async function parseToken(token: string): Promise<[string, Uint8Array]> {
  if (!macKey) {
    throw new Error("mac_key_error");
  }

  let sessionKey;
  let userId;
  try {
    const payload = jwt.verify(token, macKey) as {
      session: string;
      userId: string;
    };

    userId = payload.userId;
    if (/^[a-zA-Z0-9-\_]+$/.test(userId) !== true) {
      throw new Error("user_id_not_allowed");
    }

    const [iv, ct] = decodeArrayUint8(Buffer.from(payload.session, "base64"));
    const encKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(encryptionKey),
      "AES-GCM",
      false,
      ["decrypt"]
    );
    sessionKey = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      encKey,
      ct
    );
  } catch (err) {
    throw new Error("token_invalid");
  }

  if (!sessionKey) {
    throw new Error("session_key_not_found");
  }

  return [userId, new Uint8Array(sessionKey)];
}
