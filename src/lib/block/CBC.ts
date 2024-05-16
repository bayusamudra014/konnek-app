import { Cipher } from "../cipher/Cipher";
import { flattenUint8Array } from "../ArrayUtil";
import { Padding } from "../encoder/Padding";
import { xorArray } from "../ArrayUtil";
import { IV } from "./const";

export default class CBC implements Cipher {
  padding = new Padding(16, 0, 256);
  private BLOCK_SIZE = 16; //ukuran block 128 bit

  constructor(private blockCipher: Cipher) {}

  encrypt(plaintext: Uint8Array): Uint8Array {
    var XOR_Factor: Uint8Array = IV;
    var added_plaintext = this.padding.pad(plaintext);
    const numBlocks = Math.ceil(added_plaintext.length / this.BLOCK_SIZE);
    let encryptedBytes: Uint8Array[] = [];

    for (let i = 0; i < numBlocks; i++) {
      const blockStart = i * this.BLOCK_SIZE;
      const blockEnd = Math.min(
        blockStart + this.BLOCK_SIZE,
        added_plaintext.length
      );
      const currentBlock = added_plaintext.slice(blockStart, blockEnd);
      const xor_result = xorArray(currentBlock, XOR_Factor);
      const encryptedBlock = this.blockCipher.encrypt(xor_result);
      XOR_Factor = encryptedBlock;
      encryptedBytes.push(encryptedBlock);
    }
    return flattenUint8Array(encryptedBytes);
  }

  decrypt(ciphertext: Uint8Array): Uint8Array {
    const numBlocks = Math.ceil(ciphertext.length / this.BLOCK_SIZE);
    const decryptedBytes: Uint8Array[] = [];
    var XOR_Factor = IV;

    for (let i = 0; i < numBlocks; i++) {
      const blockStart = i * this.BLOCK_SIZE;
      const blockEnd = Math.min(
        blockStart + this.BLOCK_SIZE,
        ciphertext.length
      );
      const currentBlock = ciphertext.slice(blockStart, blockEnd);
      const decryptedBlock = this.blockCipher.decrypt(currentBlock);
      const xor_result = xorArray(decryptedBlock, XOR_Factor);
      XOR_Factor = currentBlock;
      decryptedBytes.push(xor_result);
    }

    const flatten_bytes = flattenUint8Array(decryptedBytes);
    return this.padding.unpad(flatten_bytes);
  }
}
