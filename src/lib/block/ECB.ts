import { Cipher } from "../cipher/Cipher";
import { flattenUint8Array } from "../ArrayUtil";
import { Padding } from "../encoder/Padding";
export default class ECB implements Cipher {
  private BLOCK_SIZE = 16; //ukuran block 128 bit
  padding = new Padding(16, 0, 256);

  constructor(private blockCipher: Cipher) {}

  encrypt(plaintext: Uint8Array): Uint8Array {
    const encryptedBytes: Uint8Array[] = [];
    const added_plaintext = this.padding.pad(plaintext);
    const numBlocks = Math.ceil(added_plaintext.length / this.BLOCK_SIZE);

    for (let i = 0; i < numBlocks; i++) {
      const blockStart = i * this.BLOCK_SIZE;
      const blockEnd = Math.min(
        blockStart + this.BLOCK_SIZE,
        added_plaintext.length
      );
      const currentBlock = added_plaintext.slice(blockStart, blockEnd);
      const encryptedBlock = this.blockCipher.encrypt(currentBlock);
      encryptedBytes.push(encryptedBlock);
    }
    return flattenUint8Array(encryptedBytes);
  }

  decrypt(ciphertext: Uint8Array): Uint8Array {
    const numBlocks = Math.ceil(ciphertext.length / this.BLOCK_SIZE);
    const decryptedBytes: Uint8Array[] = [];

    for (let i = 0; i < numBlocks; i++) {
      const blockStart = i * this.BLOCK_SIZE;
      const blockEnd = Math.min(
        blockStart + this.BLOCK_SIZE,
        ciphertext.length
      );
      const currentBlock = ciphertext.slice(blockStart, blockEnd);
      const decryptedBlock = this.blockCipher.decrypt(currentBlock);
      decryptedBytes.push(decryptedBlock);
    }
    //belum dikasih unpad
    const flatten_bytes = flattenUint8Array(decryptedBytes);
    return this.padding.unpad(flatten_bytes);
  }
}
