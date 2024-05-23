export interface GroupPoint {
  add(point: any): any;
  inverse(): any;
  multiply(n: bigint | number): any;
  toBytes(): Uint8Array;
}

export interface Group {
  get N(): bigint;
  get G(): GroupPoint;
}
