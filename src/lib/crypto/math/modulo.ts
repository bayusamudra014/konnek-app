export function bigmodinv(a: bigint, m: bigint): bigint {
  let b = m;
  let [x, res] = [BigInt(0), BigInt(1)];

  while (a > BigInt(1)) {
    let q = a / b;
    [a, b] = [b, a % b];
    [x, res] = [res - q * x, x];
  }

  return res < BigInt(0) ? res + m : res;
}

export function modinv(a: number, m: number): number {
  let b = m;
  let [x, res] = [0, 1];

  while (a > 1) {
    let q = a / b;
    [a, b] = [b, a % b];
    [x, res] = [res - q * x, x];
  }

  return res < 0 ? res + m : res;
}

export function bigmodpow(a: bigint, b: bigint, m: bigint): bigint {
  let result = BigInt(1);
  a %= m;

  while (b > 0) {
    if (b & BigInt(1)) {
      result = (result * a) % m;
    }

    b >>= BigInt(1);
    a = (a * a) % m;
  }

  return result;
}

export function bigmodsqrt(a: bigint, p: bigint): bigint {
  if (p % BigInt(4) !== BigInt(3)) {
    throw new Error("p % 4 must be 3");
  }

  return bigmodpow(a, (p + BigInt(1)) >> BigInt(2), p);
}
