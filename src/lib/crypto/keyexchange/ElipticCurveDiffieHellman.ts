import { type EllipticCurvePoint } from "@/lib/crypto/math/EllipticCurve";
import { Random } from "@/lib/crypto/random";
import BlumBlumShub from "@/lib/crypto/random/BlumBlumShub";
import { encodeBigInteger } from "@/lib/encoder/Encoder";
import { Group } from "@/lib/crypto/math/Group";

export default class DiffieHellman {
  constructor(private _group: Group, private random: Random = BlumBlumShub) {}

  public generatePairKey(): [bigint, EllipticCurvePoint] {
    const privateKey = this.random.nextBigIntRange(BigInt(0), this._group.N);
    const publicKey = this._group.G.multiply(privateKey);

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
