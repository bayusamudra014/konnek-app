import {
  extractNonce,
  generateServerNonce,
  verifyServerNonce,
} from "@/lib/crypto/Nonce";

describe("Nonce test", () => {
  it("should generate a nonce and verify it", async () => {
    const nonce = await generateServerNonce("test", 60);
    expect(nonce).toBeDefined();

    const extractedNonce = await extractNonce(nonce);
    expect(extractedNonce).toBeDefined();

    const output = await verifyServerNonce(nonce, "test");
    expect(output).toBeDefined();
    expect(output).toEqual(extractedNonce);
  });

  it("should throw an error if nonce is expired", async () => {
    const nonce = await generateServerNonce("test", 0);
    expect(nonce).toBeDefined();

    await expect(verifyServerNonce(nonce, "test")).rejects.toThrow(
      new Error("jwt expired")
    );
  });
});
