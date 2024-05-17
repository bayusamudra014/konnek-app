import { encodeBigInteger } from "@/lib/encoder/Encoder";
import { Random } from ".";

export class BlumBlumShub extends Random {
  private state: bigint;
  private memory: Uint8Array = new Uint8Array();
  private idx = 0;
  private n: bigint;

  constructor(seed: bigint, p: bigint, q: bigint) {
    super();
    this.state = seed;
    this.n = p * q;

    // Initial Shuffle
    for (let i = 0; i < 4096; i++) {
      this.state = (this.state * this.state) % this.n;
    }
  }

  private shuffle() {
    this.state = (this.state * this.state) % this.n;

    this.memory = encodeBigInteger(this.state as any);
    this.idx = 0;
  }

  nextByte() {
    if (this.memory.length - this.idx <= 0) {
      this.shuffle();
    }

    const result = this.memory[this.idx];
    this.idx++;

    return result;
  }
}

const random = new BlumBlumShub(
  BigInt(new Date().getTime()),
  BigInt("0xb886ea9b8c390fd635a7c135f782c85fce92549a9f7523af4f438ff71be70a5d"),
  BigInt("0xf618de3b24b7d8bdab9edd3296ee4004786c56b1258778568da3be50a14c3021")
);

export default random;
