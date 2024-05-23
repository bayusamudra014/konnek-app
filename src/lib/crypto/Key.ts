import { SHA512 } from "@/lib/crypto/digest/SHA2";
import { SchnorrSignature } from "@/lib/crypto/digest/Schnorr";
import {
  BrainpoolP512r1,
  EllipticCurvePoint,
  decodeElipticCurve,
  encodeElipticCurve,
} from "@/lib/crypto/math/EllipticCurve";
import { ECElgamalCipher } from "./cipher/Elgamal";
import {
  decodeArrayUint8,
  encodeArrayUint8,
  encodeBigInteger,
} from "../encoder/Encoder";
import { PrivateKey, PublicKey } from "./KeyInterface";
import { ENC_ALGORITHM, SIGN_ALGORITHM } from "./const";

export function generatePrivateKey(): PrivateKey {
  const sign = new SchnorrSignature(new BrainpoolP512r1(), new SHA512());
  const [signPrivateKey, signPublicKey] = sign.generatePairKey() as [
    bigint,
    EllipticCurvePoint
  ];

  const enc = new ECElgamalCipher(new BrainpoolP512r1(), 40);
  const [encPrivateKey, encPublicKey] = enc.generatePairKey() as [
    bigint,
    EllipticCurvePoint
  ];

  return {
    signPrivateKey,
    signPublicKey,
    encPrivateKey,
    encPublicKey,
    signAlg: SIGN_ALGORITHM,
    encAlg: ENC_ALGORITHM,
  };
}

export async function encodePrivateKey(
  key: PrivateKey,
  encKey: CryptoKey
): Promise<string>;
export async function encodePrivateKey(
  key: PrivateKey,
  encKey: CryptoKey,
  bufferEncoding: "raw"
): Promise<Buffer>;
export async function encodePrivateKey(
  key: PrivateKey,
  encKey: CryptoKey,
  bufferEncoding: BufferEncoding
): Promise<string>;
export async function encodePrivateKey(
  key: PrivateKey,
  encKey: CryptoKey,
  bufferEncoding: BufferEncoding | "raw" = "base64"
) {
  const { signPrivateKey, signPublicKey, encPrivateKey, encPublicKey } = key;

  const data = JSON.stringify({
    sign_priv: Buffer.from(encodeBigInteger(signPrivateKey)).toString("base64"),
    enc_priv: Buffer.from(encodeBigInteger(encPrivateKey)).toString("base64"),
    sign_pub: Buffer.from(encodeElipticCurve(signPublicKey)).toString("base64"),
    enc_pub: Buffer.from(encodeElipticCurve(encPublicKey)).toString("base64"),
    sign_alg: SIGN_ALGORITHM,
    enc_alg: ENC_ALGORITHM,
  });

  const counter = await crypto.getRandomValues(new Uint8Array(16));

  const result = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: counter,
    },
    encKey,
    new TextEncoder().encode(data)
  );

  const buffer = new Uint8Array(result.byteLength + counter.byteLength);
  buffer.set(counter, 0);
  buffer.set(new Uint8Array(result), counter.byteLength);

  if (bufferEncoding === "raw") return Buffer.from(buffer);
  return Buffer.from(buffer).toString(bufferEncoding);
}

export async function decodePrivateKey(
  dataKey: string,
  password: string,
  bufferEncoding: BufferEncoding = "base64"
): Promise<PrivateKey> {
  const encKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "AES-GCM",
    false,
    ["decrypt"]
  );
  const dataDecoded = new Uint8Array(Buffer.from(dataKey, bufferEncoding));
  const counter = new Uint8Array(dataDecoded.slice(0, 16));
  const data = new Uint8Array(dataDecoded.slice(16, dataDecoded.length));

  const result = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: counter,
    },
    encKey,
    data
  );

  const { sign_priv, enc_priv, sign_pub, enc_pub, sign_alg, enc_alg } =
    JSON.parse(new TextDecoder().decode(result));

  return {
    signPrivateKey: BigInt(Buffer.from(sign_priv, "base64").toString()),
    signPublicKey: decodeElipticCurve(sign_pub),
    encPrivateKey: BigInt(Buffer.from(enc_priv, "base64").toString()),
    encPublicKey: decodeElipticCurve(enc_pub),
    signAlg: sign_alg,
    encAlg: enc_alg,
  };
}

export async function getPublicKey(key: PrivateKey): Promise<PublicKey> {
  const { signPublicKey, encPublicKey, encAlg, signAlg } = key;
  return { signPublicKey, encPublicKey, encAlg, signAlg };
}

export async function encodePublicKey(key: PublicKey): Promise<string>;
export async function encodePublicKey(
  key: PublicKey,
  bufferEncoding: "raw"
): Promise<Buffer>;
export async function encodePublicKey(
  key: PublicKey,
  bufferEncoding: BufferEncoding
): Promise<string>;
export async function encodePublicKey(
  key: PublicKey,
  bufferEncoding: BufferEncoding | "raw" = "base64"
) {
  const { signPublicKey, encPublicKey, encAlg, signAlg } = key;
  const textEncoder = new TextEncoder();
  const result = Buffer.from(
    encodeArrayUint8([
      encodeElipticCurve(signPublicKey),
      encodeElipticCurve(encPublicKey),
      textEncoder.encode(encAlg),
      textEncoder.encode(signAlg),
    ])
  );

  if (bufferEncoding === "raw") return result;
  return result.toString(bufferEncoding);
}

export async function decodePublicKey(
  data: string,
  bufferEncoding: BufferEncoding = "base64"
): Promise<PublicKey> {
  const [signPublicKey, encPublicKey, encAlg, signAlg] = decodeArrayUint8(
    new Uint8Array(Buffer.from(data, bufferEncoding))
  );

  return {
    signPublicKey: decodeElipticCurve(signPublicKey),
    encPublicKey: decodeElipticCurve(encPublicKey),
    encAlg: new TextDecoder().decode(encAlg),
    signAlg: new TextDecoder().decode(signAlg),
  };
}
