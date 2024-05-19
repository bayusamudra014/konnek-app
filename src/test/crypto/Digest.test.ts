import { SHA256 } from "@/lib/crypto/digest/SHA2";

describe("SHA2 Digest Test", () => {
  it("should able to calculate hash", async () => {
    const hash = new SHA256();

    const data = new TextEncoder().encode("Hello World");
    const data2 = new TextEncoder().encode("Hello Worlde");
    const result = await hash.calculate(data);

    expect(result).toBeDefined();
    expect(await hash.verify(data, result)).toBeTruthy();
    expect(await hash.verify(data2, result)).toBeFalsy();
  });
});
