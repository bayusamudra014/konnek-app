import Digest from "./Digest";

export class SHA256 implements Digest {
  async calculate(data: Uint8Array): Promise<Uint8Array> {
    const result = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(result);
  }

  async verify(data: Uint8Array, hash: Uint8Array): Promise<boolean> {
    const result = await this.calculate(data);
    return (
      hash
        .map((byte, index) => byte ^ result[index])
        .reduce((a, b) => a + b, 0) === 0
    );
  }
}

export class SHA512 implements Digest {
  async calculate(data: Uint8Array): Promise<Uint8Array> {
    const result = await crypto.subtle.digest("SHA-512", data);
    return new Uint8Array(result);
  }

  async verify(data: Uint8Array, hash: Uint8Array): Promise<boolean> {
    const result = await this.calculate(data);
    return (
      hash
        .map((byte, index) => byte ^ result[index])
        .reduce((a, b) => a + b, 0) === 0
    );
  }
}
