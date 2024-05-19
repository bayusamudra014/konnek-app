import { BrainpoolP512r1, SECP256R1 } from "@/lib/crypto/math/EllipticCurve";
import { CipherElipticEncoder } from "@/lib/encoder/ElipticEncoder";

describe("Eliptic curve encoder", () => {
  it("should able to encode and decode it correctly", () => {
    const encoder = new CipherElipticEncoder(new SECP256R1(), 16);
    const textEncoder = new TextEncoder();

    const msg = textEncoder.encode(`Halo, Dunia. Apa kabarnya hari ini?`);
    const result = encoder.encode(msg);

    expect(result.length).toBe(3);

    const decoded = encoder.decode(result);
    expect(decoded).toStrictEqual(msg);
  });

  it("should able to encode and decode it correctly", () => {
    const encoder = new CipherElipticEncoder(new BrainpoolP512r1(), 40);
    const textEncoder = new TextEncoder();

    const msg = textEncoder.encode(`Halo, Dunia. Apa kabarnya hari ini?`);
    const result = encoder.encode(msg);

    expect(result.length).toBe(1);

    const decoded = encoder.decode(result);
    expect(decoded).toStrictEqual(msg);
  });
});
