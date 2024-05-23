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
import jwt from "jsonwebtoken";

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

  const signedContent = new Uint8Array(
    pubkey.length +
      userIdEncoded.length +
      serverNonceEncoded.length +
      clientNonceEncoded.length
  );

  signedContent.set(pubkey);
  signedContent.set(userIdEncoded, pubkey.length);
  signedContent.set(serverNonceEncoded, pubkey.length + userIdEncoded.length);
  signedContent.set(
    clientNonceEncoded,
    pubkey.length + userIdEncoded.length + serverNonceEncoded.length
  );

  const signature = await sign(signedContent, privateKey);
  const data: CertificateRequest = {
    ...publicKey,
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

  const signedContent = new Uint8Array(
    pubkey.length +
      userIdEncoded.length +
      issuerIdEncoded.length +
      encodedNonce.length
  );
  signedContent.set(pubkey);
  signedContent.set(userIdEncoded, pubkey.length);
  signedContent.set(issuerIdEncoded, pubkey.length + userIdEncoded.length);
  signedContent.set(
    encodedNonce,
    pubkey.length + userIdEncoded.length + issuerIdEncoded.length
  );

  const issuerSignature = await sign(signedContent, privateKey);

  return {
    ...certificateRequest,
    issuerId,
    issuerSignature,
    nonce,
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

  const signedContent = new Uint8Array(
    pubkey.length +
      userIdEncoded.length +
      issuerIdEncoded.length +
      nonceEncoded.length
  );
  signedContent.set(pubkey);
  signedContent.set(userIdEncoded, pubkey.length);
  signedContent.set(issuerIdEncoded, pubkey.length + userIdEncoded.length);
  signedContent.set(
    nonceEncoded,
    pubkey.length + userIdEncoded.length + issuerIdEncoded.length
  );

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

  const signedContent = new Uint8Array(
    pubkey.length +
      userIdEncoded.length +
      clientNonceEncoded.length +
      serverNonceEncoded.length
  );
  signedContent.set(pubkey);
  signedContent.set(userIdEncoded, pubkey.length);
  signedContent.set(serverNonceEncoded, pubkey.length + userIdEncoded.length);
  signedContent.set(
    clientNonceEncoded,
    pubkey.length + userIdEncoded.length + serverNonceEncoded.length
  );

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

export async function decodeCertificate(
  data: string,
  bufferEncoding: BufferEncoding = "base64"
): Promise<Certificate> {
  const [
    signPublicKey,
    encPublicKey,
    encAlg,
    signAlg,
    userId,
    issuerId,
    nonce,
    issuerSignature,
  ] = decodeArrayUint8(Buffer.from(data, bufferEncoding));

  return {
    signPublicKey: decodeElipticCurve(signPublicKey),
    encPublicKey: decodeElipticCurve(encPublicKey),
    encAlg: new TextDecoder().decode(encAlg),
    signAlg: new TextDecoder().decode(signAlg),
    userId: new TextDecoder().decode(userId),
    issuerId: new TextDecoder().decode(issuerId),
    nonce: decodeBigInteger(nonce),
    issuerSignature,
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
  const [
    signPublicKey,
    encPublicKey,
    encAlg,
    signAlg,
    userId,
    serverNonce,
    clientNonce,
    signature,
  ] = decodeArrayUint8(Buffer.from(data, bufferEncoding));

  const decoder = new TextDecoder();

  return {
    signPublicKey: decodeElipticCurve(signPublicKey),
    encPublicKey: decodeElipticCurve(encPublicKey),
    encAlg: decoder.decode(encAlg),
    signAlg: decoder.decode(signAlg),
    userId: decoder.decode(userId),
    clientNonce: decodeBigInteger(clientNonce),
    serverNonce: decodeBigInteger(serverNonce),
    signature,
  };
}

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
