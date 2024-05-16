import { Cipher } from "../cipher/Cipher";
import { flattenUint8Array } from "../ArrayUtil";
import { Padding } from "../encoder/Padding";
import { xorArray } from "../ArrayUtil";
import { IV } from "./const";
import { flatten } from "mathjs";

export class OFB implements Cipher {
  padding = new Padding(16, 0, 256);
  private r_bit_size: number = 1;
  constructor(private blockCipher: Cipher) {}
  encrypt(plaintext: Uint8Array): Uint8Array {
    var added_plain_text = this.padding.pad(plaintext);
    let register: Uint8Array = IV.slice();
    let encryptedBytes: Uint8Array[] = [];
    const numIterations = added_plain_text.length / this.r_bit_size;

    for (let i = 0; i < numIterations; i++) {
      const miniBlockStart = i * this.r_bit_size;
      const miniBlockEnd = Math.min(
        miniBlockStart + this.r_bit_size,
        added_plain_text.length
      );
      let currentMiniBlock = added_plain_text.slice(
        miniBlockStart,
        miniBlockEnd
      );
      let encrypted_reg: Uint8Array = this.blockCipher.encrypt(register);
      let miniEcnryptedReg = encrypted_reg.slice(0, currentMiniBlock.length);
      register.copyWithin(0, miniEcnryptedReg.length); //shifting left
      register[register.length - 1] = miniEcnryptedReg[0];
      let c1 = xorArray(currentMiniBlock, miniEcnryptedReg);
      encryptedBytes.push(c1);
    }
    let flattenArray = flattenUint8Array(encryptedBytes);
    return flattenArray;
  }

  decrypt(ciphertext: Uint8Array): Uint8Array {
    let register: Uint8Array = IV.slice();
    const decryptedBytes: Uint8Array[] = [];
    const numIterations = Math.ceil(ciphertext.length / this.r_bit_size);

    for (let i = 0; i < numIterations; i++) {
      let encryptedReg = this.blockCipher.encrypt(register);
      let miniEcnryptedReg = encryptedReg.slice(0, this.r_bit_size);
      const miniBlockStart = i * this.r_bit_size;
      const miniBlockEnd = Math.min(
        miniBlockStart + this.r_bit_size,
        ciphertext.length
      );
      const currentMiniBlock = ciphertext.slice(miniBlockStart, miniBlockEnd);
      register.copyWithin(0, miniEcnryptedReg.length);
      register[register.length - 1] = miniEcnryptedReg[0];
      const xor_result = xorArray(miniEcnryptedReg, currentMiniBlock);
      decryptedBytes.push(xor_result);
    }

    const flatten_array = flattenUint8Array(decryptedBytes);
    return this.padding.unpad(flatten_array);
  }
}
