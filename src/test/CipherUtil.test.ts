import { masterKeyGenerator } from "@/lib/CipherUtil";

describe("Mater key generation test", () => {
  it("should able to make master key when length less than 16", () => {
    const result = masterKeyGenerator("1234");
    expect(result.length).toBe(16);
  });

  it("should able to make master key when length 16", () => {
    const result = masterKeyGenerator("1234567890123456");

    expect(result.length).toBe(16);
  });

  it("should able to make master key when length greater than 16", () => {
    const result = masterKeyGenerator("123456789012345612354");

    expect(result.length).toBe(16);
  });
});
