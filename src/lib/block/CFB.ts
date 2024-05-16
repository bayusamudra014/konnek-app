import { Cipher } from "../cipher/Cipher";
import { flattenUint8Array } from "../ArrayUtil";
import { Padding } from "../encoder/Padding";
import { xorArray } from "../ArrayUtil";
import { IV } from "./const";

export default class CFB implements Cipher {
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
      let c1 = xorArray(currentMiniBlock, miniEcnryptedReg);
      encryptedBytes.push(c1);
      register.copyWithin(0, c1.length); //shifting left
      register[register.length - 1] = c1[0];
    }
    return flattenUint8Array(encryptedBytes);
  }

  decrypt(ciphertext: Uint8Array): Uint8Array {
    let registerDecrypt: Uint8Array = IV.slice();
    const decryptedBytes: Uint8Array[] = [];
    const numIterations = Math.ceil(ciphertext.length / this.r_bit_size);

    // var XOR_Factor = IV;

    for (let i = 0; i < numIterations; i++) {
      const encryptedReg = this.blockCipher.encrypt(registerDecrypt);
      const miniEcnryptedReg = encryptedReg.slice(0, this.r_bit_size);
      const miniBlockStart = i * this.r_bit_size;
      const miniBlockEnd = Math.min(
        miniBlockStart + this.r_bit_size,
        ciphertext.length
      );
      const currentMiniBlock = ciphertext.slice(miniBlockStart, miniBlockEnd);
      const xor_result = xorArray(miniEcnryptedReg, currentMiniBlock);

      decryptedBytes.push(xor_result);
      registerDecrypt.copyWithin(0, currentMiniBlock.length);
      registerDecrypt[registerDecrypt.length - 1] = currentMiniBlock[0];
    }

    const flatten_array = flattenUint8Array(decryptedBytes);
    return this.padding.unpad(flatten_array);
  }
}
