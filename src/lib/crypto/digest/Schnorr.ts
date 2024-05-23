import { Random } from "@/lib/crypto/random";
import Digest from "./Digest";
import BlumBlumShub from "@/lib/crypto/random/BlumBlumShub";
import { Group } from "@/lib/crypto/math/Group";
import {
  decodeArrayUint8,
  decodeBigInteger,
  encodeArrayUint8,
  encodeBigInteger,
} from "@/lib/encoder/Encoder";
import { GroupPoint } from "../math/Group";

export class SchnorrSignature implements Digest {
  constructor(
    private _group: Group,
    private _hash: Digest,
    private _random: Random = BlumBlumShub,
    private _privateKey: bigint | null = null,
    private _publicKey: GroupPoint | null = null
  ) {}

  set privateKey(value: bigint) {
    this._privateKey = value;
  }

  set publicKey(value: GroupPoint) {
    this._publicKey = value;
  }

  generatePairKey(): [bigint, GroupPoint] {
    const privateKey = this._random.nextBigIntRange(BigInt(0), this._group.N);
    const publicKey = this._group.G.multiply(
      privateKey
    ).inverse() as GroupPoint;

    this._privateKey = privateKey;
    this._publicKey = publicKey;

    return [privateKey, publicKey];
  }

  async calculate(data: Uint8Array): Promise<Uint8Array> {
    if (this._privateKey === null) {
      throw new Error("Private key is not set");
    }

    const r = this._random.nextBigIntRange(BigInt(0), this._group.N);
    const R = this._group.G.multiply(r) as GroupPoint;
    const point = R.toBytes();

    const payload = new Uint8Array(point.length + data.length);
    payload.set(point, 0);
    payload.set(data, point.length);

    const hash = await this._hash.calculate(payload);
    const y = encodeBigInteger(r + this._privateKey * decodeBigInteger(hash));

    return encodeArrayUint8([hash, y]);
  }

  async verify(
    data: Uint8Array,
    signatureDigest: Uint8Array
  ): Promise<boolean> {
    if (this._publicKey === null) {
      throw new Error("Public key is not set");
    }

    const [hashData, yBytes] = decodeArrayUint8(signatureDigest);
    const e = decodeBigInteger(hashData);
    const y = decodeBigInteger(yBytes);

    const x = this._group.G.multiply(y).add(this._publicKey.multiply(e));
    const xBytes = x.toBytes();

    const payload = new Uint8Array(xBytes.length + data.length);
    payload.set(xBytes, 0);
    payload.set(data, xBytes.length);

    return this._hash.verify(payload, hashData);
  }
}
