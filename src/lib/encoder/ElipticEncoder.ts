import {
  EllipticCurve,
  type EllipticCurvePoint,
} from "@/lib/crypto/math/EllipticCurve";
import { Random } from "@/lib/crypto/random";
import { decodeBigInteger, encodeBigInteger } from "./Encoder";
import BlumBlumShub from "@/lib/crypto/random/BlumBlumShub";
import { bigmodpow, bigmodsqrt } from "@/lib/crypto/math/modulo";
import { Padding } from "./Padding";

export class CipherElipticEncoder {
  private padding: Padding;

  constructor(
    private curve: EllipticCurve,
    private dictionaryByteSize: number,
    private random: Random = BlumBlumShub,
    private k: bigint = BigInt(-1)
  ) {
    if (dictionaryByteSize < 1) {
      throw new Error("dictionaryByteSize must be greater than 0");
    }

    const dictSize = BigInt(1) << BigInt(8 * dictionaryByteSize);
    if (this.curve.N < dictSize) {
      throw new Error("Selected Eliptic curve cannot be used");
    }

    if (this.k <= BigInt(0)) {
      this.k = this.curve.N / dictSize;
    }

    if (this.k * dictSize > this.curve.N) {
      throw new Error("Dictionary size is not enough");
    }

    this.padding = new Padding(dictionaryByteSize, 0, 256);
  }

  private getPointFromByte(byte: Uint8Array): EllipticCurvePoint {
    const value = decodeBigInteger(byte);

    let x = value * this.k;
    let adder = this.random.nextBigIntRange(
      BigInt(0),
      BigInt(Math.floor(Number(this.k)))
    );
    let ySqr = this.curve.calculateYSquared(x + adder);
    const start = adder;

    while (
      bigmodpow(ySqr, (this.curve.P - BigInt(1)) >> BigInt(1), this.curve.P) !==
      BigInt(1)
    ) {
      adder = (adder + BigInt(1)) % this.k;
      ySqr = this.curve.calculateYSquared(x + adder);

      if (start === adder) {
        throw new Error(`Failed to parse message ${byte}`);
      }
    }

    x = x + adder;

    const y = bigmodsqrt(ySqr, this.curve.P);
    return this.curve.createPoint(
      x,
      this.random.nextFloat() < 0.5 ? y : this.curve.P - y
    );
  }

  public encode(message: Uint8Array): EllipticCurvePoint[] {
    const result = [] as EllipticCurvePoint[];
    message = this.padding.pad(message);

    for (let i = 0; i < message.length; i += this.dictionaryByteSize) {
      const byte = message.slice(i, i + this.dictionaryByteSize);
      const point = this.getPointFromByte(byte);

      result.push(point);
    }

    return result;
  }

  public decode(message: EllipticCurvePoint[]): Uint8Array {
    const result = new Uint8Array(message.length * this.dictionaryByteSize);
    let idx = 0;

    for (const point of message) {
      const xMessage = point.X / this.k;
      const message = encodeBigInteger(xMessage);

      for (let i = 0; i < this.dictionaryByteSize; i++) {
        result[idx + i] = message[i];
      }

      idx += this.dictionaryByteSize;
    }

    return this.padding.unpad(result);
  }
}
