import {
  EllipticCurve,
  type EllipticCurvePoint,
} from "@/lib/crypto/math/EllipticCurve";
import { Random } from "@/lib/crypto/random";
import BlumBlumShub from "../random/BlumBlumShub";
import { encodeBigInteger } from "@/lib/encoder/Encoder";

export default class ElipticCurveDiffieHellman {
  constructor(
    private curve: EllipticCurve,
    private random: Random = BlumBlumShub
  ) {}

  public generatePairKey(): [bigint, EllipticCurvePoint] {
    const privateKey = this.random.nextBigIntRange(BigInt(0), this.curve.N);
    const publicKey = this.curve.G.multiply(privateKey);

    return [privateKey, publicKey];
  }

  public generateSharedSecret(
    peerPublicKey: EllipticCurvePoint,
    ownPrivateKey: bigint,
    size: number = 32
  ): Uint8Array {
    const sharedKey = peerPublicKey.multiply(ownPrivateKey);

    const calculatedResult = encodeBigInteger(sharedKey.X);
    const result = new Uint8Array(size);

    for (let i = 0; i < calculatedResult.length && i < size; i++) {
      result[i] = calculatedResult[i];
    }

    return result;
  }
}
