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
    const privateKey = this.random.nextBigInt(256);
    const publicKey = this.curve.G.multiply(privateKey);

    return [privateKey, publicKey];
  }

  public generateSharedSecret(
    peerPublicKey: EllipticCurvePoint,
    ownPrivateKey: bigint
  ): Uint8Array {
    const sharedKey = peerPublicKey.multiply(ownPrivateKey);

    const calculatedResult = encodeBigInteger(sharedKey.X);
    const result = new Uint8Array(32);

    for (let i = 0; i < calculatedResult.length && i < 32; i++) {
      result[i] = calculatedResult[i];
    }

    return result;
  }
}
