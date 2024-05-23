import { SHA512 } from "@/lib/crypto/digest/SHA2";
import { SchnorrSignature } from "@/lib/crypto/digest/Schnorr";
import { BrainpoolP512r1 } from "@/lib/crypto/math/EllipticCurve";

describe("Schnorr Signature Test", () => {
  it("should able to sign and verify signature", async () => {
    const sign = new SchnorrSignature(new BrainpoolP512r1(), new SHA512());
    const [privateKey, publicKey] = sign.generatePairKey();

    sign.privateKey = privateKey;
    sign.publicKey = publicKey;

    const data = new TextEncoder().encode("Hello World");
    const signature = await sign.calculate(data);
    expect(signature).toBeDefined();

    const result = sign.verify(data, signature);
    expect(result).toBeTruthy();

    signature[0] = signature[0] ^ 0xff;
    const result2 = await sign.verify(data, signature);
    expect(result2).toBeFalsy();
  });
});
