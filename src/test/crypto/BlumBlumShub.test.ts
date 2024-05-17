import BlumBlumShub from "@/lib/crypto/random/BlumBlumShub";

describe("Blum blum shub test", () => {
  it("should able to generate random bytes", () => {
    const result = new Uint8Array(2048);
    const result2 = new Uint8Array(2048);

    BlumBlumShub.nextBytes(result);
    BlumBlumShub.nextBytes(result2);

    expect(result).not.toBe(result2);
  });
});
