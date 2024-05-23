import { PrivateKey, PublicKey } from "@/lib/crypto/KeyInterface";
import { SchnorrSignature } from "./digest/Schnorr";
import { BrainpoolP512r1 } from "./math/EllipticCurve";
import { SHA512 } from "./digest/SHA2";
import { ECElgamalCipher } from "./cipher/Elgamal";
import { ENC_ALGORITHM, SIGN_ALGORITHM } from "./const";

export async function sign(
  data: Uint8Array,
  key: PrivateKey
): Promise<Uint8Array> {
  const { signPrivateKey, signAlg } = key;

  if (signAlg !== SIGN_ALGORITHM) {
    throw new Error("Sign algorithm is not supported");
  }

  const sign = new SchnorrSignature(new BrainpoolP512r1(), new SHA512());
  sign.privateKey = signPrivateKey;
  return await sign.calculate(data);
}

export async function verify(
  data: Uint8Array,
  signature: Uint8Array,
  key: PublicKey
): Promise<boolean> {
  const { signPublicKey, signAlg } = key;

  if (signAlg !== SIGN_ALGORITHM) {
    throw new Error("Sign algorithm is not supported");
  }

  const sign = new SchnorrSignature(new BrainpoolP512r1(), new SHA512());
  sign.publicKey = signPublicKey;
  return await sign.verify(data, signature);
}

export async function encrypt(
  data: Uint8Array,
  key: PublicKey
): Promise<Uint8Array> {
  const { encPublicKey, encAlg } = key;

  if (encAlg !== ENC_ALGORITHM) {
    throw new Error("Encryption algorithm is not supported");
  }

  const cipher = new ECElgamalCipher(new BrainpoolP512r1(), 40);
  cipher.peerPublic = encPublicKey;

  return await cipher.encrypt(data);
}

export async function decrypt(
  data: Uint8Array,
  key: PrivateKey
): Promise<Uint8Array> {
  const { encPrivateKey, encAlg } = key;

  if (encAlg !== ENC_ALGORITHM) {
    throw new Error("Encryption algorithm is not supported");
  }

  const cipher = new ECElgamalCipher(new BrainpoolP512r1(), 40);
  cipher.key = encPrivateKey;

  return await cipher.decrypt(data);
}
