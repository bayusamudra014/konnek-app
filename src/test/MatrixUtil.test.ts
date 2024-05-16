import { inverseModuloMatrix, multiplyMatrixMod } from "../lib/Matrix";
import * as math from "mathjs";

describe("Test matrix util", () => {
  it("should get inverse matrix (3x3) correctly", () => {
    const matrix = [
      [6, 24, 1],
      [13, 16, 10],
      [20, 17, 15],
    ];

    const inv = inverseModuloMatrix(matrix, 26);
    expect(inv.toArray()).toEqual([
      [8, 5, 10],
      [21, 8, 21],
      [21, 12, 8],
    ]);
  });

  it("should get inverse matrix (2x2) correctly", () => {
    const matrix = [
      [3, 10],
      [15, 9],
    ];

    const inv = inverseModuloMatrix(matrix, 26);
    expect(inv.toArray()).toEqual([
      [5, 6],
      [9, 19],
    ]);
  });

  it("should get inverse matrix correctly and multiply back to identity", () => {
    const arrMatrix = [
      [6, 24, 1],
      [13, 16, 10],
      [20, 17, 15],
    ];

    const matrix = math.matrix(arrMatrix);
    const inv = inverseModuloMatrix(arrMatrix, 26);

    const identity = multiplyMatrixMod(matrix, inv, 26);
    const expected = math.identity(3);

    expect(identity).toStrictEqual(expected);
  });
});
