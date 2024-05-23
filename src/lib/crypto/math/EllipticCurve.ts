import {
  decodeArrayBigInteger,
  encodeArrayBigInteger,
  encodeBigInteger,
} from "@/lib/encoder/Encoder";
import { bigmodinv } from "./modulo";
import { Group, GroupPoint } from "./Group";

export class EllipticCurvePoint implements GroupPoint {
  private x: bigint;
  private y: bigint;
  private p: bigint;
  private a: bigint;
  private b: bigint;

  constructor(
    x: bigint | number,
    y: bigint | number,
    p: bigint | number,
    a: bigint | number,
    b: bigint | number
  ) {
    this.x = typeof x === "number" ? BigInt(x) : x;
    this.y = typeof y === "number" ? BigInt(y) : y;
    this.p = typeof p === "number" ? BigInt(p) : p;
    this.a = typeof a === "number" ? BigInt(a) : a;
    this.b = typeof b === "number" ? BigInt(b) : b;
  }

  toBytes(): Uint8Array {
    const x = this.x;
    const y = this.y;

    return encodeArrayBigInteger([x, y]);
  }

  get X(): bigint {
    return this.x;
  }

  get Y(): bigint {
    return this.y;
  }

  get A(): bigint {
    return this.a;
  }

  get B(): bigint {
    return this.b;
  }

  get P(): bigint {
    return this.p;
  }

  public equals(point: EllipticCurvePoint): boolean {
    return this.x == point.x && this.y == point.y;
  }

  public toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  public add(point: EllipticCurvePoint): EllipticCurvePoint {
    if (this.x == BigInt("-1") && this.y == BigInt("-1")) {
      return new EllipticCurvePoint(point.x, point.y, this.p, this.a, this.b);
    }

    if (this.x == point.x && (this.y + point.y) % this.p == BigInt(0)) {
      return new EllipticCurvePoint(
        BigInt(-1),
        BigInt(-1),
        this.p,
        this.a,
        this.b
      );
    }

    let lambda = this.calculateLambda(point) % this.p;
    lambda = lambda < 0 ? lambda + this.p : lambda;

    let x = (lambda * lambda - this.x - point.x) % this.p;
    let y = (lambda * (this.x - x) - this.y) % this.p;

    if (x < 0) x += this.p;
    if (y < 0) y += this.p;

    return new EllipticCurvePoint(x, y, this.p, this.a, this.b);
  }

  private calculateLambda(point: EllipticCurvePoint): bigint {
    if (this.equals(point)) {
      return (
        (BigInt(3) * this.x * this.x + this.a) *
        bigmodinv(BigInt(2) * this.y, this.p)
      );
    }

    const diff = (point.x - this.x + this.p) % this.p;
    return (point.y - this.y) * bigmodinv(diff, this.p);
  }

  public inverse(): EllipticCurvePoint {
    return new EllipticCurvePoint(
      this.x,
      this.p - this.y,
      this.p,
      this.a,
      this.b
    );
  }

  public multiply(n: bigint | number): EllipticCurvePoint {
    if (typeof n == "number") n = BigInt(n);

    if (n < 0) return this.multiply(-n).inverse();

    let result = new EllipticCurvePoint(-1, -1, this.p, this.a, this.b);
    let multiplier = new EllipticCurvePoint(
      this.x,
      this.y,
      this.p,
      this.a,
      this.b
    );

    while (n > 0) {
      if (n & BigInt(1)) {
        result = result.add(multiplier);
      }

      multiplier = multiplier.add(multiplier);
      n >>= BigInt(1);
    }

    return result;
  }
}

export class EllipticCurve implements Group {
  private p: bigint;
  private a: bigint;
  private b: bigint;

  constructor(p: bigint | number, a: bigint | number, b: bigint | number) {
    this.p = typeof p === "number" ? BigInt(p) : p;
    this.a = typeof a === "number" ? BigInt(a) : a;
    this.b = typeof b === "number" ? BigInt(b) : b;
  }

  public createPoint(
    x: bigint | number,
    y: bigint | number
  ): EllipticCurvePoint {
    // Check wheter the point is on the curve
    x = typeof x === "number" ? BigInt(x) : x;
    y = typeof y === "number" ? BigInt(y) : y;

    if (this.isPointOnCurve(x, y)) {
      throw new Error("Point is not on the curve");
    }

    return new EllipticCurvePoint(x, y, this.p, this.a, this.b);
  }

  public isPointOnCurve(x: bigint | number, y: bigint | number): boolean {
    x = typeof x === "number" ? BigInt(x) : x;
    y = typeof y === "number" ? BigInt(y) : y;
    return (y * y) % this.p != (x * x * x + this.a * x + this.b) % this.p;
  }

  public calculateYSquared(x: bigint): bigint {
    return (x * x * x + this.a * x + this.b) % this.p;
  }

  public createInfinityPoint(): EllipticCurvePoint {
    return new EllipticCurvePoint(
      BigInt(-1),
      BigInt(-1),
      this.p,
      this.a,
      this.b
    );
  }

  get N(): bigint {
    throw new Error("Not implemented");
  }

  get G(): EllipticCurvePoint {
    throw new Error("Not implemented");
  }

  get P(): bigint {
    return this.p;
  }

  get A(): bigint {
    return this.a;
  }

  get B(): bigint {
    return this.b;
  }
}

export class SECP256R1 extends EllipticCurve {
  constructor() {
    super(
      BigInt(
        "0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"
      ),
      BigInt(
        "0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc"
      ),
      BigInt(
        "0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b"
      )
    );
  }

  get G(): EllipticCurvePoint {
    return this.createPoint(
      BigInt(
        "0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"
      ),
      BigInt(
        "0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"
      )
    );
  }

  get N(): bigint {
    return BigInt(
      "0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"
    );
  }
}

export class BrainpoolP512r1 extends EllipticCurve {
  constructor() {
    super(
      BigInt(
        "0xaadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca703308717d4d9b009bc66842aecda12ae6a380e62881ff2f2d82c68528aa6056583a48f3"
      ),
      BigInt(
        "0x7830a3318b603b89e2327145ac234cc594cbdd8d3df91610a83441caea9863bc2ded5d5aa8253aa10a2ef1c98b9ac8b57f1117a72bf2c7b9e7c1ac4d77fc94ca"
      ),
      BigInt(
        "0x3df91610a83441caea9863bc2ded5d5aa8253aa10a2ef1c98b9ac8b57f1117a72bf2c7b9e7c1ac4d77fc94cadc083e67984050b75ebae5dd2809bd638016f723"
      )
    );
  }

  get G(): EllipticCurvePoint {
    return this.createPoint(
      BigInt(
        "0x81aee4bdd82ed9645a21322e9c4c6a9385ed9f70b5d916c1b43b62eef4d0098eff3b1f78e2d0d48d50d1687b93b97d5f7c6d5047406a5e688b352209bcb9f822"
      ),
      BigInt(
        "0x7dde385d566332ecc0eabfa9cf7822fdf209f70024a57b1aa000c55b881f8111b2dcde494a5f485e5bca4bd88a2763aed1ca2b2fa8f0540678cd1e0f3ad80892"
      )
    );
  }

  get N(): bigint {
    return BigInt(
      "0xaadd9db8dbe9c48b3fd4e6ae33c9fc07cb308db3b3c9d20ed6639cca70330870553e5c414ca92619418661197fac10471db1d381085ddaddb58796829ca90069"
    );
  }
}

export function encodeElipticCurve(point: EllipticCurvePoint): Uint8Array {
  return encodeArrayBigInteger([point.A, point.B, point.P, point.X, point.Y]);
}

export function decodeElipticCurve(data: Uint8Array): EllipticCurvePoint {
  const [a, b, p, x, y] = decodeArrayBigInteger(data);
  return new EllipticCurvePoint(x, y, p, a, b);
}
