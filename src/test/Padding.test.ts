import { decodeString, encodeString } from "@/lib/encoder/Encoder";
import { Padding } from "@/lib/encoder/Padding";

describe("Test padding", () => {
  it("should able to pad and unpad when have one pad", () => {
    const padding = new Padding(20, 65, 26);
    const text = "HALOHALO";

    const result = padding.pad(encodeString(text));
    expect(result.length).toBe(20);

    const unpad = padding.unpad(result);
    expect(unpad).toStrictEqual(encodeString(text));
  });

  it("should able to pad and unpad when have data more than one block", () => {
    const padding = new Padding(20, 65, 26);
    const text = "HALOHALOBANDUNGIBUKOTAPERHIANGAN";

    const result = padding.pad(encodeString(text));
    expect(result.length).toBe(40);

    const unpad = padding.unpad(result);
    expect(unpad).toStrictEqual(encodeString(text));
  });

  it("should able to pad and unpad when block size reached", () => {
    const padding = new Padding(20, 65, 26);
    const text = "HALOWHALOWHALOWHALOW";

    const result = padding.pad(encodeString(text));
    expect(result.length).toBe(40);

    const unpad = padding.unpad(result);
    expect(unpad).toStrictEqual(encodeString(text));
  });

  it("should able to pad and unpad when wrapped", () => {
    const padding = new Padding(20, 65, 5, true);
    const text = "BECAK";

    const result = padding.pad(encodeString(text));
    expect(result.length).toBe(20);

    const unpad = padding.unpad(result);
    expect(decodeString(unpad)).toStrictEqual(text);
  });

  it("should able to pad and unpad when wrapped with first char", () => {
    const padding = new Padding(20, 65, 5, true);
    const text = "BECAA";

    const result = padding.pad(encodeString(text));
    expect(result.length).toBe(20);

    const unpad = padding.unpad(result);
    expect(decodeString(unpad)).toStrictEqual(text);
  });
});
