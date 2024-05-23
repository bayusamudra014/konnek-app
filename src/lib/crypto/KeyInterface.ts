import { EllipticCurvePoint } from "./math/EllipticCurve";

export interface PublicKey {
  signPublicKey: EllipticCurvePoint;
  encPublicKey: EllipticCurvePoint;
  signAlg: string;
  encAlg: string;
}

export interface PrivateKey extends PublicKey {
  signPrivateKey: bigint;
  encPrivateKey: bigint;
}
