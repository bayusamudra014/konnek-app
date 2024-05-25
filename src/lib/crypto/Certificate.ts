import { sign, verify } from ".";
import {
  decodeArrayUint8,
  decodeBigInteger,
  encodeArrayUint8,
  encodeBigInteger,
} from "../encoder/Encoder";
import { encodePublicKey } from "./Key";
import { PrivateKey, PublicKey } from "./KeyInterface";
import { decodeElipticCurve, encodeElipticCurve } from "./math/EllipticCurve";
import { Random } from "./random";
import BlumBlumShub from "./random/BlumBlumShub";

export interface CertificateKey extends Certificate, PrivateKey {}

export interface Certificate extends PublicKey {
  nonce: bigint;
  userId: string;
  issuerId: string;
  issuerSignature: Uint8Array;
}

export interface CertificateRequest extends PublicKey {
  userId: string;
  serverNonce: bigint;
  clientNonce: bigint;
  signature: Uint8Array;
}

export async function generateCertificateRequest(
  publicKey: PublicKey,
  privateKey: PrivateKey,
  userId: string,
  serverNonce: bigint,
  random: Random = BlumBlumShub
): Promise<CertificateRequest> {
  const pubkey = await encodePublicKey(publicKey, "raw");
  const userIdEncoded = new TextEncoder().encode(userId);
  const serverNonceEncoded = encodeBigInteger(serverNonce);

  const clientNonce = random.nextBigInt(64);
  const clientNonceEncoded = encodeBigInteger(clientNonce);

  const signedContent = encodeArrayUint8([
    pubkey,
    userIdEncoded,
    serverNonceEncoded,
    clientNonceEncoded,
  ]);

  const signature = await sign(signedContent, privateKey);
  const data: CertificateRequest = {
    signPublicKey: publicKey.signPublicKey,
    signAlg: publicKey.signAlg,
    encPublicKey: publicKey.encPublicKey,
    encAlg: publicKey.encAlg,
    signature,
    userId,
    serverNonce,
    clientNonce,
  };

  return data;
}

export async function generateCertificate(
  certificateRequest: CertificateRequest,
  issuerId: string,
  privateKey: PrivateKey,
  random: Random = BlumBlumShub
): Promise<Certificate> {
  const pubkey = await encodePublicKey(certificateRequest, "raw");

  const nonce = random.nextBigInt(64);
  const encodedNonce = encodeBigInteger(nonce);

  const encoder = new TextEncoder();
  const userIdEncoded = encoder.encode(certificateRequest.userId);
  const issuerIdEncoded = encoder.encode(issuerId);

  const signedContent = encodeArrayUint8([
    pubkey,
    userIdEncoded,
    issuerIdEncoded,
    encodedNonce,
  ]);

  const issuerSignature = await sign(signedContent, privateKey);

  return {
    userId: certificateRequest.userId,
    signPublicKey: certificateRequest.signPublicKey,
    encPublicKey: certificateRequest.encPublicKey,
    signAlg: certificateRequest.signAlg,
    encAlg: certificateRequest.encAlg,
    issuerId,
    nonce,
    issuerSignature,
  };
}

export async function verifyCertificate(
  certificate: Certificate,
  issuerPublicKey: PublicKey
): Promise<boolean> {
  const pubkey = await encodePublicKey(certificate, "raw");

  const encoder = new TextEncoder();
  const issuerIdEncoded = encoder.encode(certificate.issuerId);
  const userIdEncoded = encoder.encode(certificate.userId);
  const nonceEncoded = encodeBigInteger(certificate.nonce);

  const signedContent = encodeArrayUint8([
    pubkey,
    userIdEncoded,
    issuerIdEncoded,
    nonceEncoded,
  ]);

  return await verify(
    signedContent,
    certificate.issuerSignature,
    issuerPublicKey
  );
}

export async function verifyCertificateRequest(
  certificateRequest: CertificateRequest
): Promise<boolean> {
  const pubkey = await encodePublicKey(certificateRequest, "raw");
  const userIdEncoded = new TextEncoder().encode(certificateRequest.userId);
  const clientNonceEncoded = encodeBigInteger(certificateRequest.clientNonce);
  const serverNonceEncoded = encodeBigInteger(certificateRequest.serverNonce);

  const signedContent = encodeArrayUint8([
    pubkey,
    userIdEncoded,
    serverNonceEncoded,
    clientNonceEncoded,
  ]);

  return await verify(
    signedContent,
    certificateRequest.signature,
    certificateRequest
  );
}

export async function encodeCertificate(
  certificate: Certificate
): Promise<string>;
export async function encodeCertificate(
  certificate: Certificate,
  bufferEncoding: "raw"
): Promise<Buffer>;
export async function encodeCertificate(
  certificate: Certificate,
  bufferEncoding: BufferEncoding
): Promise<string>;
export async function encodeCertificate(
  certificate: Certificate,
  bufferEncoding: "raw" | BufferEncoding = "base64"
): Promise<string | Buffer> {
  const textEncoder = new TextEncoder();

  const buffer = Buffer.from(
    encodeArrayUint8([
      encodeElipticCurve(certificate.signPublicKey),
      encodeElipticCurve(certificate.encPublicKey),
      textEncoder.encode(certificate.encAlg),
      textEncoder.encode(certificate.signAlg),
      textEncoder.encode(certificate.userId),
      textEncoder.encode(certificate.issuerId),
      encodeBigInteger(certificate.nonce),
      certificate.issuerSignature,
    ])
  );

  if (bufferEncoding === "raw") return buffer;
  return buffer.toString(bufferEncoding);
}

export async function decodeCertificate(data: string): Promise<Certificate>;
export async function decodeCertificate(
  data: string,
  bufferEncoding: BufferEncoding
): Promise<Certificate>;
export async function decodeCertificate(
  data: Buffer,
  bufferEncoding: "raw"
): Promise<Certificate>;
export async function decodeCertificate(
  data: string | Buffer,
  bufferEncoding: BufferEncoding | "raw" = "base64"
): Promise<Certificate> {
  const rawPayload =
    bufferEncoding === "raw"
      ? (data as Buffer)
      : Buffer.from(data as string, bufferEncoding);
  const payload = decodeArrayUint8(rawPayload);
  if (payload.length !== 8) throw new Error("Invalid certificate data");

  const [
    signPublicKey,
    encPublicKey,
    encAlg,
    signAlg,
    userId,
    issuerId,
    nonce,
    issuerSignature,
  ] = payload;

  return {
    signPublicKey: decodeElipticCurve(signPublicKey),
    encPublicKey: decodeElipticCurve(encPublicKey),
    encAlg: new TextDecoder().decode(encAlg),
    signAlg: new TextDecoder().decode(signAlg),
    userId: new TextDecoder().decode(userId),
    issuerId: new TextDecoder().decode(issuerId),
    nonce: decodeBigInteger(nonce),
    issuerSignature: new Uint8Array(issuerSignature),
  };
}

export async function encodeCertificateRequest(
  certificateRequest: CertificateRequest
): Promise<string>;
export async function encodeCertificateRequest(
  certificateRequest: CertificateRequest,
  bufferEncoding: "raw"
): Promise<Buffer>;
export async function encodeCertificateRequest(
  certificateRequest: CertificateRequest,
  bufferEncoding: BufferEncoding
): Promise<string>;
export async function encodeCertificateRequest(
  certificateRequest: CertificateRequest,
  bufferEncoding: "raw" | BufferEncoding = "base64"
): Promise<string | Buffer> {
  const textEncoder = new TextEncoder();
  const buffer = Buffer.from(
    encodeArrayUint8([
      encodeElipticCurve(certificateRequest.signPublicKey),
      encodeElipticCurve(certificateRequest.encPublicKey),
      textEncoder.encode(certificateRequest.encAlg),
      textEncoder.encode(certificateRequest.signAlg),
      textEncoder.encode(certificateRequest.userId),
      encodeBigInteger(certificateRequest.serverNonce),
      encodeBigInteger(certificateRequest.clientNonce),
      certificateRequest.signature,
    ])
  );

  if (bufferEncoding === "raw") return buffer;
  return buffer.toString("base64");
}

export async function decodeCertificateRequest(
  data: string,
  bufferEncoding: BufferEncoding = "base64"
): Promise<CertificateRequest> {
  const decoded = decodeArrayUint8(Buffer.from(data, bufferEncoding));
  if (decoded.length !== 8) throw new Error("Invalid certificate request data");

  const [
    signPublicKey,
    encPublicKey,
    encAlg,
    signAlg,
    userId,
    serverNonce,
    clientNonce,
    signature,
  ] = decoded;

  const decoder = new TextDecoder();

  return {
    signPublicKey: decodeElipticCurve(signPublicKey),
    encPublicKey: decodeElipticCurve(encPublicKey),
    encAlg: decoder.decode(encAlg),
    signAlg: decoder.decode(signAlg),
    userId: decoder.decode(userId),
    clientNonce: decodeBigInteger(clientNonce),
    serverNonce: decodeBigInteger(serverNonce),
    signature: new Uint8Array(signature),
  };
}

export async function generateCertificateKey(
  certificate: Certificate,
  key: PrivateKey
): Promise<CertificateKey> {
  return {
    ...certificate,
    signPrivateKey: key.signPrivateKey,
    encPrivateKey: key.encPrivateKey,
  };
}

export async function encodeCertificateKey(
  certificateKey: CertificateKey,
  key: CryptoKey
): Promise<string>;
export async function encodeCertificateKey(
  certificateKey: CertificateKey,
  key: CryptoKey,
  bufferEncoding: "raw"
): Promise<Buffer>;
export async function encodeCertificateKey(
  certificateKey: CertificateKey,
  key: CryptoKey,
  bufferEncoding: BufferEncoding
): Promise<string>;
export async function encodeCertificateKey(
  certificateKey: CertificateKey,
  key: CryptoKey,
  bufferEncoding: "raw" | BufferEncoding = "base64"
): Promise<string | Buffer> {
  const textEncoder = new TextEncoder();
  const buffer = Buffer.from(
    encodeArrayUint8([
      encodeElipticCurve(certificateKey.signPublicKey),
      encodeElipticCurve(certificateKey.encPublicKey),
      textEncoder.encode(certificateKey.encAlg),
      textEncoder.encode(certificateKey.signAlg),
      encodeBigInteger(certificateKey.nonce),
      textEncoder.encode(certificateKey.userId),
      textEncoder.encode(certificateKey.issuerId),
      certificateKey.issuerSignature,
      encodeBigInteger(certificateKey.signPrivateKey),
      encodeBigInteger(certificateKey.encPrivateKey),
    ])
  );

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    buffer
  );

  const result = Buffer.from(encodeArrayUint8([iv, new Uint8Array(encrypted)]));

  if (bufferEncoding === "raw") return result;
  return result.toString(bufferEncoding);
}

export async function decodeCertificateKey(
  data: string,
  key: CryptoKey,
  bufferEncoding: BufferEncoding
): Promise<CertificateKey>;
export async function decodeCertificateKey(
  data: Buffer,
  key: CryptoKey,
  bufferEncoding: "raw"
): Promise<CertificateKey>;
export async function decodeCertificateKey(
  data: string | Buffer,
  key: CryptoKey,
  bufferEncoding: BufferEncoding | "raw" = "base64"
): Promise<CertificateKey> {
  const payload =
    bufferEncoding === "raw"
      ? (data as Buffer)
      : Buffer.from(data as string, bufferEncoding);
  const buffer = new Uint8Array(payload);
  const [iv, encrypted] = decodeArrayUint8(payload);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encrypted
  );

  const [
    signPublicKey,
    encPublicKey,
    encAlg,
    signAlg,
    nonce,
    userId,
    issuerId,
    issuerSignature,
    signPrivateKey,
    encPrivateKey,
  ] = decodeArrayUint8(Buffer.from(decrypted));

  const decoder = new TextDecoder();

  return {
    signPublicKey: decodeElipticCurve(signPublicKey),
    encPublicKey: decodeElipticCurve(encPublicKey),
    encAlg: decoder.decode(encAlg),
    signAlg: decoder.decode(signAlg),
    nonce: decodeBigInteger(nonce),
    userId: decoder.decode(userId),
    issuerId: decoder.decode(issuerId),
    issuerSignature: new Uint8Array(issuerSignature),
    signPrivateKey: decodeBigInteger(signPrivateKey),
    encPrivateKey: decodeBigInteger(encPrivateKey),
  };
}
