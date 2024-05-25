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
  decodeBigInteger,
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

  const payload = [
    encodeBigInteger(signPrivateKey),
    encodeElipticCurve(signPublicKey),
    encodeBigInteger(encPrivateKey),
    encodeElipticCurve(encPublicKey),
    Buffer.from(key.signAlg),
    Buffer.from(key.encAlg),
  ];
  const data = encodeArrayUint8(payload);

  const counter = await crypto.getRandomValues(new Uint8Array(16));

  const result = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: counter,
    },
    encKey,
    data
  );

  const buffer = encodeArrayUint8([counter, new Uint8Array(result)]);

  if (bufferEncoding === "raw") return Buffer.from(buffer);
  return Buffer.from(buffer).toString(bufferEncoding);
}

export async function decodePrivateKey(
  dataKey: string,
  encKey: CryptoKey
): Promise<PrivateKey>;
export async function decodePrivateKey(
  dataKey: Buffer,
  encKey: CryptoKey,
  bufferEncoding: "raw"
): Promise<PrivateKey>;
export async function decodePrivateKey(
  dataKey: string,
  encKey: CryptoKey,
  bufferEncoding: BufferEncoding
): Promise<PrivateKey>;
export async function decodePrivateKey(
  dataKey: string | Buffer,
  encKey: CryptoKey,
  bufferEncoding: BufferEncoding | "raw" = "base64"
): Promise<PrivateKey> {
  const dataDecoded =
    bufferEncoding !== "raw"
      ? new Uint8Array(Buffer.from(dataKey as string, bufferEncoding))
      : new Uint8Array(dataKey as Buffer);
  const [counter, data] = decodeArrayUint8(dataDecoded);

  const dec = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: counter,
    },
    encKey,
    data
  );

  const [sign_priv, sign_pub, enc_priv, enc_pub, sign_alg, enc_alg] =
    decodeArrayUint8(new Uint8Array(dec));

  const textDecoder = new TextDecoder();
  const result = {
    signPrivateKey: decodeBigInteger(sign_priv),
    signPublicKey: decodeElipticCurve(sign_pub),
    encPrivateKey: decodeBigInteger(enc_priv),
    encPublicKey: decodeElipticCurve(enc_pub),
    signAlg: textDecoder.decode(sign_alg),
    encAlg: textDecoder.decode(enc_alg),
  };
  return result;
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

export async function decodePublicKey(data: string): Promise<PublicKey>;
export async function decodePublicKey(
  data: Buffer,
  bufferEncoding: "raw"
): Promise<PublicKey>;
export async function decodePublicKey(
  data: string | Buffer,
  bufferEncoding: BufferEncoding | "raw" = "base64"
): Promise<PublicKey> {
  const payload =
    bufferEncoding === "raw"
      ? (data as Buffer)
      : Buffer.from(data as string, bufferEncoding);
  const [signPublicKey, encPublicKey, encAlg, signAlg] = decodeArrayUint8(
    new Uint8Array(payload)
  );

  return {
    signPublicKey: decodeElipticCurve(signPublicKey),
    encPublicKey: decodeElipticCurve(encPublicKey),
    encAlg: new TextDecoder().decode(encAlg),
    signAlg: new TextDecoder().decode(signAlg),
  };
}
