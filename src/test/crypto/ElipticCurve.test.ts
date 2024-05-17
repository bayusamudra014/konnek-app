import {
  BrainpoolP512r1,
  EllipticCurve,
  SECP256R1,
} from "@/lib/crypto/math/EllipticCurve";

describe("Eliptic Curve test", () => {
  it("should able to do addition", () => {
    const curve = new EllipticCurve(47, 7, 2);
    const p1 = curve.createPoint(3, 12);
    const p2 = curve.createPoint(5, 31);

    const r1 = p1.add(p2);
    const r2 = p2.add(p1);

    expect(r1.equals(r2)).toBeTruthy();
    expect(r1.X).toBe(BigInt(0));
    expect(r1.Y).toBe(BigInt(40));

    expect(r2.X).toBe(BigInt(0));
    expect(r2.Y).toBe(BigInt(40));

    const inv = curve.createInfinityPoint();
    const r3 = inv.add(inv);
    expect(r3.equals(inv)).toBeTruthy();

    const r4 = p1.add(p1.inverse());
    expect(r4.equals(inv)).toBeTruthy();
  });

  it("should able to do multiplication", () => {
    const curve = new EllipticCurve(47, 7, 2);
    const p1 = curve.createPoint(45, 36);

    const r1 = p1.multiply(1);
    expect(r1.equals(p1)).toBeTruthy();

    const r2 = p1.multiply(3);
    expect(r2.equals(curve.createPoint(43, 45))).toBeTruthy();

    const r3 = p1.multiply(4);
    expect(r3.equals(curve.createPoint(38, 3))).toBeTruthy();

    const r4 = p1.multiply(13);
    expect(r4.equals(curve.createPoint(23, 43))).toBeTruthy();

    const r5 = p1.multiply(24);
    expect(r5.equals(curve.createInfinityPoint())).toBeTruthy();

    const r6 = p1.multiply(0);
    expect(r6.equals(curve.createInfinityPoint())).toBeTruthy();

    const r7 = p1.multiply(-1);
    expect(r7.equals(curve.createPoint(45, 11))).toBeTruthy();
  });
});

describe("Eliptic Curve secp256r1 test", () => {
  const curve = new SECP256R1();

  it("should able to create G point", () => {
    expect(curve.G).toBeDefined();
  });
});

describe("Eliptic Curve BrainpoolP512r1 test", () => {
  const curve = new BrainpoolP512r1();

  it("should able to create G point", () => {
    expect(curve.G).toBeDefined();
  });
});
