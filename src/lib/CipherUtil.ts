import { CipherType } from "./CipherType";
import { ValidationError } from "./ValidationError";
import { CTRBlock } from "./block/counter";
import { Cipher } from "./cipher/Cipher";
import { MeongCipher } from "./cipher/MeongCipher";
import { encodeString } from "./encoder/Encoder";
import { Padding } from "./encoder/Padding";
import CBC from "./block/CBC";
import CFB from "./block/CFB";
import { OFB } from "./block/OFB";
import ECB from "./block/ECB";

export function encryptFromString(
  type: CipherType,
  key: string,
  message: string
): Uint8Array {
  const cipher = getCipher(type, key);
  return cipher.encrypt(encodeString(message));
}

export function encryptRawBuffer(
  type: CipherType,
  key: string,
  buffer: Buffer
): Uint8Array {
  const cipher = getCipher(type, key);
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
  const cipher = getCipher(type, key);
  return Buffer.from(cipher.encrypt(encodeString(data))).toString("base64");
}

export function decryptToString(
  type: CipherType,
  key: string,
  message: string
): string {
  const cipher = getCipher(type, key);
  const ciphertext = Buffer.from(message, "base64").valueOf();
  return Buffer.from(cipher.decrypt(ciphertext)).toString("utf-8");
}

export function decryptFile(
  type: CipherType,
  key: string,
  encryptedFile: Buffer
): Buffer {
  const cipher = getCipher(type, key);
  const result = cipher.decrypt(encryptedFile);

  return Buffer.from(result);
}

export function getCipher(type: CipherType, key: string): Cipher {
  const masterKey = masterKeyGenerator(key);
  const cipher = new MeongCipher(masterKey);

  switch (type) {
    case CipherType.CTR:
      return new CTRBlock(cipher);
    case CipherType.CBC:
      return new CBC(cipher);
    case CipherType.CFB:
      return new CFB(cipher);
    case CipherType.OFB:
      return new OFB(cipher);
    case CipherType.ECB:
      return new ECB(cipher);
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
