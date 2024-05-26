import { CipherType } from "./CipherType";
import { ValidationError } from "./ValidationError";
import { CTRBlock } from "./crypto/block/counter";
import { Cipher } from "./crypto/cipher/Cipher";
import { MeongCipher } from "./crypto/cipher/MeongCipher";
import { encodeString } from "./encoder/Encoder";
import { Padding } from "./encoder/Padding";

export function encryptFromString(
  type: CipherType,
  key: string,
  message: string
): Uint8Array {
  const cipher = getCipher(type, Buffer.from(key));
  return cipher.encrypt(encodeString(message));
}

export function encryptRawBuffer(
  type: CipherType,
  key: string,
  buffer: Buffer
): Uint8Array {
  const cipher = getCipher(type, Buffer.from(key));
  return cipher.encrypt(buffer);
}

export function encryptFile(type: CipherType, key: string, buffer: Buffer) {
  const result = encryptRawBuffer(type, key, buffer);
  return result;
}

export function encryptString(
  type: CipherType,
  key: string,
  data: string
): string {
  const cipher = getCipher(type, Buffer.from(key));
  return Buffer.from(cipher.encrypt(encodeString(data))).toString("base64");
}

export function decryptToString(
  type: CipherType,
  key: string,
  message: string
): string {
  const cipher = getCipher(type, Buffer.from(key));
  const ciphertext = Buffer.from(message, "base64").valueOf();
  return Buffer.from(cipher.decrypt(ciphertext)).toString("utf-8");
}

export function decryptFile(
  type: CipherType,
  key: string,
  encryptedFile: Buffer
): Buffer {
  const cipher = getCipher(type, Buffer.from(key));
  const result = cipher.decrypt(encryptedFile);

  return Buffer.from(result);
}

export function getCipher(type: CipherType, key: Uint8Array): Cipher {
  const cipher = new MeongCipher(key);

  switch (type) {
    case CipherType.CTR:
      return new CTRBlock(cipher);
    default:
      throw new ValidationError("Invalid block type");
  }
}

export function numberToUint8Array(num: number, byteSize: number) {
  const result = new Uint8Array(byteSize);

  for (let i = 0; i < byteSize; i++) {
    result[i] = (num >> (i * 8)) & 0xff;
  }

  return result;
}

export function masterKeyGenerator(key: string) {
  const keyBuffer = encodeString(key).slice(0, 16);

  if (keyBuffer.length != 16) {
    const pad = new Padding(16, 0, 256);
    return pad.pad(keyBuffer);
  }

  return keyBuffer;
}
