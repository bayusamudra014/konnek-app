import jwt from "jsonwebtoken";
import { decodeBigInteger } from "@/lib/encoder/Encoder";

export async function generateServerNonce(
  macKey: string,
  nonceLiveTime: number = 30
): Promise<string> {
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const exp = Math.floor(new Date().getTime() / 1000) + nonceLiveTime;

  const data = {
    nonce: decodeBigInteger(nonce).toString(),
    exp: exp,
  };

  return jwt.sign(data, macKey, { algorithm: "HS256" });
}

export async function verifyServerNonce(
  nonce: string,
  macKey: string
): Promise<bigint> {
  const { nonce: nonceValue, exp } = jwt.verify(nonce, macKey, {
    algorithms: ["HS256"],
  }) as any;

  if (exp < Math.floor(new Date().getTime() / 1000)) {
    throw new Error("Nonce is expired");
  }

  return BigInt(nonceValue);
}

export async function extractNonce(nonce: string) {
  const { nonce: nonceValue, exp } = jwt.decode(nonce) as any;

  if (exp < Math.floor(new Date().getTime() / 1000)) {
    throw new Error("Nonce is expired");
  }

  return BigInt(nonceValue);
}
