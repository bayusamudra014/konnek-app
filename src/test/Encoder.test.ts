import {
  BrainpoolP512r1,
  EllipticCurvePoint,
} from "@/lib/crypto/math/EllipticCurve";
import BlumBlumShub from "@/lib/crypto/random/BlumBlumShub";
import {
  decodeArrayBigInteger,
  decodeArrayUint8,
  encodeArrayBigInteger,
  encodeArrayUint8,
} from "@/lib/encoder/Encoder";

describe("Array BigInteger encoder", () => {
  it("should able to encode and decode it back", () => {
    const curve = new BrainpoolP512r1();
    const random = BlumBlumShub;

    const p1 = curve.G.multiply(random.nextBigIntRange(BigInt(10), curve.N));
    const p2 = curve.G.multiply(random.nextBigIntRange(BigInt(10), curve.N));

    const array = [
      BigInt(0),
      BigInt(10),
      p1.X,
      p1.Y,
      p2.X,
      p2.Y,
      BigInt(10),
      BigInt(0),
    ];
    const result = encodeArrayBigInteger(array);

    const decoded = decodeArrayBigInteger(result);
    expect(array).toStrictEqual(decoded);
  });
});

describe("Uint8Array Encoder", () => {
  it("should able to encode and decode uint8array", () => {
    const random = BlumBlumShub;
    const data = [new Uint8Array(0), new Uint8Array(10), new Uint8Array(12500)];

    for (let i = 0; i < data.length; i++) {
      random.nextBytes(data[i]);
    }

    const encoded = encodeArrayUint8(data);
    const decoded = decodeArrayUint8(encoded);

    expect(decoded).toStrictEqual(data);
  });
});
