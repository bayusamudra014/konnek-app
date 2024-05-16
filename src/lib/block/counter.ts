import { Cipher } from "@/lib/cipher/Cipher";
import { Padding } from "@/lib/encoder/Padding";
import { mergeUint8Array, splitUint8Array, xorArray } from "@/lib/ArrayUtil";
import { numberToUint8Array } from "../CipherUtil";

const CTR_BLOCK_SIZE = 16;

export class CTRBlock implements Cipher {
  private pad = new Padding(CTR_BLOCK_SIZE, 0, 256);

  constructor(private blockCipher: Cipher) {}

  encrypt(plaintext: Uint8Array): Uint8Array {
    const paddedPlaintext = this.pad.pad(plaintext);
    return this.doOperation(paddedPlaintext);
  }

  decrypt(ciphertext: Uint8Array): Uint8Array {
    const paddedPlaintext = this.doOperation(ciphertext);
    return this.pad.unpad(paddedPlaintext);
  }

  private doOperation(data: Uint8Array) {
    const blocks = splitUint8Array(data, CTR_BLOCK_SIZE);

    let counter = 0;
    const result = [];

    for (const block of blocks) {
      const conterBit = numberToUint8Array(counter, CTR_BLOCK_SIZE);
      const encryptedCounter = this.blockCipher.encrypt(conterBit);

      const ciphertext = xorArray(encryptedCounter, block);
      result.push(ciphertext);

      counter = (counter + 1) % (1 << CTR_BLOCK_SIZE);
    }

    return mergeUint8Array(result);
  }
}
