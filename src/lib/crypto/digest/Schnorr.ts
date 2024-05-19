import { Random } from "@/lib/crypto/random";
import Digest from "./Digest";
import BlumBlumShub from "@/lib/crypto/random/BlumBlumShub";

export class SchnorrSignature implements Digest {
  constructor(private _hash: Digest, private _random: Random = BlumBlumShub) {}

  calculate(data: Uint8Array): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  }

  verify(data: Uint8Array, hash: Uint8Array): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
