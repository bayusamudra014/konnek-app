import {
  decodePrivateKey,
  decodePublicKey,
  encodePrivateKey,
  encodePublicKey,
  generatePrivateKey,
} from "@/lib/crypto/Key";
import exp from "constants";

describe("Private key test", () => {
  it("should generate a private key in raw mode", async () => {
    const key = generatePrivateKey();
    const encodeKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const encodedRaw = await encodePrivateKey(key, encodeKey, "raw");

    const decodedRaw = await decodePrivateKey(encodedRaw, encodeKey, "raw");
    expect(decodedRaw).toStrictEqual(key);
  });

  it("should generate a private key in base64 mode", async () => {
    const key = generatePrivateKey();
    const encodeKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    const encodedRaw = await encodePrivateKey(key, encodeKey, "base64");

    const decodedRaw = await decodePrivateKey(encodedRaw, encodeKey, "base64");
    expect(decodedRaw).toStrictEqual(key);
  });
});

describe("Public key test", () => {
  it("should generate public key in raw mode", async () => {
    const key = generatePrivateKey();

    const encodedRaw = await encodePublicKey(key, "raw");
    const decodedRaw = await decodePublicKey(encodedRaw, "raw");

    expect(decodedRaw).toStrictEqual({
      signPublicKey: key.signPublicKey,
      encPublicKey: key.encPublicKey,
      signAlg: key.signAlg,
      encAlg: key.encAlg,
    });
  });

  it("should generate public key in base64 mode", async () => {
    const key = generatePrivateKey();

    const encodedRaw = await encodePublicKey(key, "raw");
    const decodedRaw = await decodePublicKey(encodedRaw, "raw");

    expect(decodedRaw).toStrictEqual({
      signPublicKey: key.signPublicKey,
      encPublicKey: key.encPublicKey,
      signAlg: key.signAlg,
      encAlg: key.encAlg,
    });
  });
});
