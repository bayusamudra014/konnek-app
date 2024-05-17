import ElipticCurveDiffieHellman from "@/lib/crypto/keyexchange/ElipticCurveDiffieHellman";
import { SECP256R1 } from "@/lib/crypto/math/EllipticCurve";

describe("Diffie Hellman Test", () => {
  it("should able to create secret", () => {
    const ecdh = new ElipticCurveDiffieHellman(new SECP256R1());
    const [alicePrivate, alicePublic] = ecdh.generatePairKey();
    const [bobPrivate, bobPublic] = ecdh.generatePairKey();

    const bobSecret = ecdh.generateSharedSecret(alicePublic, bobPrivate);
    const aliceSecret = ecdh.generateSharedSecret(bobPublic, alicePrivate);

    expect(bobSecret).toStrictEqual(aliceSecret);
    expect(bobSecret.length).toBe(32);
  });
});
