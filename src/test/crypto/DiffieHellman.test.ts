import DiffieHellman from "@/lib/crypto/keyexchange/ElipticCurveDiffieHellman";
import { BrainpoolP512r1, SECP256R1 } from "@/lib/crypto/math/EllipticCurve";

describe("Diffie Hellman Test", () => {
  it("should able to create secret", () => {
    const ecdh = new DiffieHellman(new SECP256R1());
    const [alicePrivate, alicePublic] = ecdh.generatePairKey();
    const [bobPrivate, bobPublic] = ecdh.generatePairKey();

    const bobSecret = ecdh.generateSharedSecret(alicePublic, bobPrivate);
    const aliceSecret = ecdh.generateSharedSecret(bobPublic, alicePrivate);

    expect(bobSecret).toStrictEqual(aliceSecret);
    expect(bobSecret.length).toBe(32);
  });

  it("should able to create secret (brainpoolp512r1)", () => {
    const ecdh = new DiffieHellman(new BrainpoolP512r1());
    const [alicePrivate, alicePublic] = ecdh.generatePairKey();
    const [bobPrivate, bobPublic] = ecdh.generatePairKey();

    const bobSecret = ecdh.generateSharedSecret(alicePublic, bobPrivate, 64);
    const aliceSecret = ecdh.generateSharedSecret(bobPublic, alicePrivate, 64);

    expect(bobSecret).toStrictEqual(aliceSecret);
    expect(bobSecret.length).toBe(64);
  });
});
