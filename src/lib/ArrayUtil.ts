export function flattenUint8Array(array: Uint8Array[]): Uint8Array {
  const size = array.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(size);

  let offset = 0;
  for (const arr of array) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
}

export function xorArray(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length !== b.length) {
    throw new Error("Array length mismatch");
  }

  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }

  return result;
}

export function unpackBit(data: Uint8Array): number[] {
  const result = [] as number[];

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < 8; j++) {
      result.push((data[i] >> j) & 1);
    }
  }

  return result;
}

export function packBit(data: number[]): Uint8Array {
  const result = new Uint8Array(Math.ceil(data.length / 8));

  for (let i = 0; i < data.length; i++) {
    result[Math.floor(i / 8)] |= data[i] << i % 8;
  }

  return result;
}

export function splitUint8Array(data: Uint8Array, size: number): Uint8Array[] {
  const result = [] as Uint8Array[];

  for (let i = 0; i < data.length; i += size) {
    result.push(data.slice(i, i + size));
  }

  return result;
}

export function mergeUint8Array(data: Uint8Array[]): Uint8Array {
  const size = data.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(size);

  let offset = 0;
  for (const arr of data) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
}
