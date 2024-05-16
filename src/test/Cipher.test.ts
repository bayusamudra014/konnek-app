import {
  shiftFunction,
  roundKeyGeneration,
  subtitute,
  subtituteInv,
  permute1,
  permute1Inv,
  permute2,
  permute2Inv,
  splitBlock,
  mergeBlock,
  MeongCipher,
} from "@/lib/cipher/MeongCipher";

describe("Meong cipher test", () => {
  it("shoud able to encrypt and decrypt", () => {
    const data = new Uint8Array([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ]);
    const key = new Uint8Array([
      16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    ]);
    const cipher = new MeongCipher(key);

    const encrypted = cipher.encrypt(data);
    expect(encrypted.length).toBe(16);
    expect(encrypted).not.toStrictEqual(data);

    const decrypted = cipher.decrypt(encrypted);
    expect(decrypted).toStrictEqual(data);
  });

  it("shoud able to encrypt and decrypt with zeros keys", () => {
    const data = new Uint8Array(new Array(16).fill(224));
    const key = new Uint8Array(new Array(16).fill(0));
    const cipher = new MeongCipher(key);

    const encrypted = cipher.encrypt(data);
    expect(encrypted.length).toBe(16);
    expect(encrypted).not.toStrictEqual(data);

    const decrypted = cipher.decrypt(encrypted);
    expect(decrypted).toStrictEqual(data);
  });

  it("shoud able to encrypt and decrypt with same keys", () => {
    const data = new Uint8Array(new Array(16).fill(224));
    const key = new Uint8Array(new Array(16).fill(1));
    const cipher = new MeongCipher(key);

    const encrypted = cipher.encrypt(data);
    expect(encrypted.length).toBe(16);
    expect(encrypted).not.toStrictEqual(data);

    const decrypted = cipher.decrypt(encrypted);
    expect(decrypted).toStrictEqual(data);
  });

  it("shoud able to encrypt and decrypt with identity keys", () => {
    const data = new Uint8Array(
      new Array(16).fill(0).map((_) => Math.floor(Math.random() * 256))
    );
    const key = new Uint8Array([
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ]);
    const cipher = new MeongCipher(key);

    const encrypted = cipher.encrypt(data);
    expect(encrypted.length).toBe(16);
    expect(encrypted).not.toStrictEqual(data);

    const decrypted = cipher.decrypt(encrypted);
    expect(decrypted).toStrictEqual(data);
  });

  it("performance test", () => {
    const key = new Uint8Array(
      new Array(16).fill(0).map((_) => Math.floor(Math.random() * 256))
    );
    const cipher = new MeongCipher(key);
    const data = new Uint8Array(
      new Array(16).fill(0).map((_) => Math.floor(Math.random() * 256))
    );

    for (let i = 0; i < 1_000; i++) {
      const encrypted = cipher.encrypt(data);
      expect(encrypted.length).toBe(16);
      expect(encrypted).not.toStrictEqual(data);

      const decrypted = cipher.decrypt(encrypted);
      expect(decrypted).toStrictEqual(data);
    }
  });
});

describe("Shift function test", () => {
  it("shoud able to shift left", () => {
    const testcase = new Uint8Array([
      1,
      2,
      3,
      4, //
      5,
      6,
      7,
      8, //
      9,
      10,
      11,
      12, //
      13,
      14,
      15,
      16,
    ]);

    const expected = new Uint8Array([
      1,
      2,
      3,
      4, //
      6,
      7,
      8,
      5, //
      11,
      12,
      9,
      10, //
      16,
      13,
      14,
      15,
    ]);

    const result = shiftFunction(testcase, "left", 4);
    expect(result).toStrictEqual(expected);
  });

  it("shoud able to right", () => {
    const testcase = new Uint8Array([
      1,
      2,
      3,
      4, //
      5,
      6,
      7,
      8, //
      9,
      10,
      11,
      12, //
      13,
      14,
      15,
      16,
    ]);

    const expected = new Uint8Array([
      1,
      2,
      3,
      4, //
      8,
      5,
      6,
      7, //
      11,
      12,
      9,
      10, //
      14,
      15,
      16,
      13,
    ]);

    const result = shiftFunction(testcase, "right", 4);
    expect(result).toStrictEqual(expected);
  });
});

describe("Round key generation test", () => {
  it("shoud able to round key", () => {
    const masterKey = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      masterKey[i] = i;
    }

    const result = roundKeyGeneration(masterKey);
    expect(result.length).toBe(10);
  });
});

describe("Subtitute function test", () => {
  it("shoud able to value and convert it back", () => {
    const testcase = [];

    for (let i = 0; i < 256; i++) {
      testcase.push(i);
    }

    const tcArray = new Uint8Array(testcase);
    const result = subtitute(tcArray);
    const resultInv = subtituteInv(result);

    expect(resultInv).toStrictEqual(tcArray);
  });
});

describe("Permutation test", () => {
  it("shoud able to permute using permute1 function", () => {
    const data = new Uint8Array([
      9, 246, 89, 89, 54, 27, 232, 166, 142, 89, 51, 248, 94, 216, 197, 242,
    ]);

    const result = permute1(data);
    expect(result.length).toBe(16);

    const resultInv = permute1Inv(result);
    expect(resultInv).toStrictEqual(data);
    expect(resultInv).not.toStrictEqual(result);
  });

  it("shoud able to permute using permute2 function", () => {
    const data = new Uint8Array(
      new Array(16).fill(0).map((_) => Math.floor(Math.random() * 256))
    );

    const result = permute2(data);
    expect(result.length).toBe(16);

    const resultInv = permute2Inv(result);
    expect(resultInv).toStrictEqual(data);
    expect(resultInv).not.toStrictEqual(result);
  });
});

describe("Splitting Test", () => {
  it("shoud able to split and join", () => {
    const data = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      data[i] = i;
    }

    const [left, right] = splitBlock(data);
    const joined = mergeBlock([left, right]);

    expect(joined).toStrictEqual(data);
  });
});
