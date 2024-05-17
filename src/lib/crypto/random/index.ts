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

    for (let i = 0; i < n_bytes; i += 8) {
      result += BigInt(this.nextByte());
      result <<= BigInt(8);
    }

    return result;
  }
}
