export class Padding {
  constructor(
    private blockSize: number,
    private startCharacter: number,
    private charSize: number,
    private allowWrap: boolean = false
  ) {
    if (!allowWrap && blockSize > charSize) {
      throw new Error("Block size should be smaller than character size");
    }
  }

  pad(data: Uint8Array): Uint8Array {
    const size = data.length;
    const padSize = this.blockSize - (size % this.blockSize);
    const result = new Uint8Array(size + padSize);

    for (let i = 0; i < size; i++) {
      result[i] = data[i];
    }

    for (let i = size; i < size + padSize; i++) {
      result[i] = this.startCharacter + ((i - size) % this.charSize);
    }

    return result;
  }

  unpad(data: Uint8Array): Uint8Array {
    const size = data.length;
    let padSize = 0;

    let lastPad = data[size - 1] - this.startCharacter + 1;

    while (
      size - padSize - lastPad >= 0 &&
      data[size - padSize - lastPad] == this.startCharacter &&
      (padSize == 0 ||
        data[size - padSize - 1] == this.startCharacter + this.charSize - 1)
    ) {
      padSize += lastPad;
      lastPad = data[size - padSize - 1] - this.startCharacter + 1;

      if (!this.allowWrap) {
        break;
      }
    }

    const result = new Uint8Array(size - padSize);
    for (let i = 0; i < size - padSize; i++) {
      result[i] = data[i];
    }

    return result;
  }
}
