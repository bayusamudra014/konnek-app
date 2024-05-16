import { flattenUint8Array } from "@/lib/ArrayUtil";

describe("Test array util", () => {
  it("should flatten array of Uint8Array correctly", () => {
    const arr1 = new Uint8Array([1, 2, 3]);
    const arr2 = new Uint8Array([4, 5, 6]);
    const arr3 = new Uint8Array([7, 8, 9]);

    const result = flattenUint8Array([arr1, arr2, arr3]);
    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });
});
