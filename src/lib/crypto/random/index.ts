export abstract class Random {
  public abstract nextByte(): number;

  public nextBytes(bytes: Uint8Array): Uint8Array {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = this.nextByte();
    }

    return bytes;
  }

  public nextBigInt(n_bytes: number): bigint {
    let result = BigInt(0);

    for (let i = 0; i < n_bytes; i += 1) {
      result += BigInt(this.nextByte());
      result <<= BigInt(8);
    }

    return result;
  }

  public nextBigIntRange(min: bigint, max: bigint): bigint {
    const diff = max - min;
    const n_bytes = diff.toString(2).length / 8;

    const random = this.nextBigInt(n_bytes);
    const result = (random % diff) + min;

    return result;
  }

  public nextFloat(): number {
    return this.nextByte() / 256;
  }
}
