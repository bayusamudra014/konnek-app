import * as fs from "fs";

export function encodeString(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function decodeString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function encodeBase64(bytes: Uint8Array): string {
  return btoa(decodeString(bytes));
}

export function decodeBase64(str: string): Uint8Array {
  return encodeString(atob(str));
}

export function readFromFile(path: string): Uint8Array {
  const data = fs.readFileSync(path);
  return new Uint8Array(data);
}

export function writeToFile(path: string, bytes: Uint8Array): void {
  fs.writeFileSync(path, Buffer.from(bytes));
}

export function encodeBigInteger(number: bigint): Uint8Array {
  const result = [] as number[];

  while (number > BigInt(0)) {
    result.push(Number(number % BigInt(256)));
    number >>= BigInt(8);
  }

  return new Uint8Array(result);
}
