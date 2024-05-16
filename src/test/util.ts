import { Cipher } from "@/lib/cipher/Cipher";

export class NullBlockEncryption implements Cipher {
  encrypt(plaintext: Uint8Array): Uint8Array {
    return plaintext;
  }

  decrypt(ciphertext: Uint8Array): Uint8Array {
    return ciphertext;
  }
}
