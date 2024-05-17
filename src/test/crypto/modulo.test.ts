import { bigmodinv, bigmodsqrt } from "@/lib/crypto/math/modulo";

describe("Inverse Modulo test", () => {
  it("should able to create inverse", () => {
    const p = BigInt(47);
    const x = BigInt(12);

    const inv = bigmodinv(x, p);
    expect((x * inv) % p).toBe(BigInt(1));
  });
});

describe("Root Modulo Finder", () => {
  it("should able to find square root", () => {
    const p = BigInt(47);
    const a = BigInt(12);

    const result = bigmodsqrt(a, p);
    expect((result * result) % p).toBe(a);
  });

  it("should able to find square root 2 with big number", () => {
    const p = BigInt(
      "0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"
    );
    const a = BigInt("14");

    const result = bigmodsqrt(a, p);
    expect((result * result) % p).toBe(a);
  });
});
