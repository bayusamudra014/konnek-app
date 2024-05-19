export default interface Digest {
  calculate(data: Uint8Array): Promise<Uint8Array>;
  verify(data: Uint8Array, hash: Uint8Array): Promise<boolean>;
}
