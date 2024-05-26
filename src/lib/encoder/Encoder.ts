export function encodeString(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function decodeString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function encodeBase64(bytes: Uint8Array): string {
  return btoa(decodeString(bytes));
}

export function decodeBase64(str: string): Uint8Array {
  return encodeString(atob(str));
}

export function encodeBigInteger(number: bigint, size = 0): Uint8Array {
  const result = [] as number[];

  while (number > BigInt(0)) {
    result.push(Number(number % BigInt(256)));
    number >>= BigInt(8);
  }

  while (result.length < size) {
    result.push(0);
  }

  return new Uint8Array(result);
}

export function decodeBigInteger(bytes: Uint8Array): bigint {
  let result = BigInt(0);

  for (let i = bytes.length - 1; i >= 0; i--) {
    result <<= BigInt(8);
    result += BigInt(bytes[i]);
  }

  return result;
}

const BIGINT_PARAMETER_BITLENGTH = 1;
export function encodeArrayBigInteger(data: bigint[]) {
  const convertedData = data.map(encodeBigInteger);
  return encodeArrayUint8(convertedData, BIGINT_PARAMETER_BITLENGTH);
}

export function decodeArrayBigInteger(data: Uint8Array): bigint[] {
  const result = decodeArrayUint8(data, BIGINT_PARAMETER_BITLENGTH).map(
    decodeBigInteger
  );
  return result;
}

export function encodeArrayUint8(
  data: Uint8Array[],
  parameterBitLength = 2
): Uint8Array {
  const maxLength = BigInt(1) << BigInt(parameterBitLength * 8);
  let result = new Uint8Array();

  for (const value of data) {
    const length = BigInt(value.length);

    if (length >= maxLength) {
      throw new Error("Encode failed: Number is too big");
    }

    const encodedLength = encodeBigInteger(length, parameterBitLength);

    const tmpResult = new Uint8Array(
      result.length + encodedLength.length + value.length
    );

    tmpResult.set(result, 0);
    tmpResult.set(encodedLength, result.length);
    tmpResult.set(value, result.length + encodedLength.length);
    result = tmpResult;
  }

  return result;
}

export function decodeArrayUint8(
  data: Uint8Array,
  parameterBitLength = 2
): Uint8Array[] {
  const result = [] as Uint8Array[];

  let i = 0;
  while (i < data.length) {
    const length = Number(
      decodeBigInteger(data.slice(i, i + parameterBitLength))
    );
    const value = data.slice(
      i + parameterBitLength,
      i + parameterBitLength + length
    );

    result.push(value);
    i = i + parameterBitLength + length;
  }

  return result;
}
