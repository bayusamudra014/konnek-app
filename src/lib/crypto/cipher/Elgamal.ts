import {
  EllipticCurve,
  EllipticCurvePoint,
} from "@/lib/crypto/math/EllipticCurve";
import { Cipher } from "./Cipher";
import BlumBlumShub from "@/lib/crypto/random/BlumBlumShub";
import { Random } from "@/lib/crypto/random";
import { CipherElipticEncoder } from "@/lib/encoder/ElipticEncoder";
import {
  decodeArrayBigInteger,
  decodeArrayUint8,
  encodeArrayBigInteger,
  encodeArrayUint8,
} from "@/lib/encoder/Encoder";

export class ElgamalCipher implements Cipher {
  private _encoder: CipherElipticEncoder;

  constructor(
    private _curve: EllipticCurve,
    _dictionaryByteSize: number,
    private _random: Random = BlumBlumShub,
    private _key: bigint | null = null,
    private _peerPublic: EllipticCurvePoint | null = null
  ) {
    this._encoder = new CipherElipticEncoder(
      _curve,
      _dictionaryByteSize,
      _random
    );
  }

  set key(value: bigint) {
    this._key = value;
  }

  set peerPublic(value: EllipticCurvePoint) {
    this._peerPublic = value;
  }

  get peerPublic() {
    return this._peerPublic!;
  }

  generateKey() {
    const privateKey = this._random.nextBigIntRange(BigInt(0), this._curve.N);
    const publicKey = this._curve.G.multiply(privateKey);

    this._key = privateKey;
    return publicKey;
  }

  encrypt(plaintext: Uint8Array): Uint8Array {
    if (this._peerPublic === null) {
      throw new Error("Public key is not set");
    }

    const encoded = this._encoder.encode(plaintext);
    const result = [] as Uint8Array[];

    for (const i of encoded) {
      const k = this._random.nextBigIntRange(
        BigInt(0),
        this._curve.N - BigInt(1)
      );
      const r = this._curve.G.multiply(k);
      const s = this._peerPublic.multiply(k).add(i);

      result.push(this.encodeEncrypted(r, s));
    }

    return encodeArrayUint8(result);
  }

  decrypt(ciphertext: Uint8Array): Uint8Array {
    if (this._key === null) {
      throw new Error("Private key is not set");
    }

    const parts = decodeArrayUint8(ciphertext);

    const points = [] as EllipticCurvePoint[];
    for (const part of parts) {
      const [r, s] = this.decodeEncrypted(part);

      const privateInverse = r.multiply(this._key).inverse();
      const result = s.add(privateInverse);
      points.push(result);
    }

    return this._encoder.decode(points);
  }

  private encodeEncrypted(
    r: EllipticCurvePoint,
    s: EllipticCurvePoint
  ): Uint8Array {
    const result = [r.X, r.Y, s.X, s.Y];
    return encodeArrayBigInteger(result);
  }

  private decodeEncrypted(
    data: Uint8Array
  ): [EllipticCurvePoint, EllipticCurvePoint] {
    const [rX, rY, sX, sY] = decodeArrayBigInteger(data);
    const rA = this._curve.A;
    const rB = this._curve.B;
    const rP = this._curve.P;

    return [
      new EllipticCurvePoint(
        BigInt(rX),
        BigInt(rY),
        BigInt(rP),
        BigInt(rA),
        BigInt(rB)
      ),
      new EllipticCurvePoint(
        BigInt(sX),
        BigInt(sY),
        BigInt(rP),
        BigInt(rA),
        BigInt(rB)
      ),
    ];
  }
}
