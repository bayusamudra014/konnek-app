import { bigmodinv } from "./modulo";

export class EllipticCurvePoint {
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

  get X(): bigint {
    return this.x;
  }

  get Y(): bigint {
    return this.y;
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

export class EllipticCurve {
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
