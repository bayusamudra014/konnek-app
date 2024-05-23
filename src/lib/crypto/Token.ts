import jwt from "jsonwebtoken";

export async function generateToken(
  type: "access" | "refresh",
  userid: string,
  tokenKey: string,
  encryptKey: CryptoKey,
  sessionKey: Buffer
) {
  const counter = crypto.getRandomValues(new Uint8Array(16));
  const encryptedSession = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: counter,
    },
    encryptKey,
    sessionKey
  );

  const token = {
    type,
    userid,
    sessionId:
      Buffer.from(counter).toString("base64") +
      "." +
      Buffer.from(encryptedSession).toString("base64"),
  };

  return jwt.sign(token, tokenKey, { algorithm: "HS256" });
}

export async function verifyToken(
  token: string,
  tokenKey: string,
  encryptKey: CryptoKey
) {
  const { type, userid, sessionId } = jwt.verify(token, tokenKey) as any;
  const [counter, encryptedSession] = sessionId.split(".");

  const sessionKey = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: Buffer.from(counter, "base64"),
    },
    encryptKey,
    Buffer.from(encryptedSession, "base64")
  );

  return { type, userid, sessionKey };
}
