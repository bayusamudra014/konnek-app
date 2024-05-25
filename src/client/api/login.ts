import { sign } from "@/lib/crypto";
import { CertificateKey } from "@/lib/crypto/Certificate";
import { extractNonce } from "@/lib/crypto/Nonce";
import { MeongCipher } from "@/lib/crypto/cipher/MeongCipher";
import DiffieHellman from "@/lib/crypto/keyexchange/ElipticCurveDiffieHellman";
import {
  BrainpoolP512r1,
  encodeElipticCurve,
} from "@/lib/crypto/math/EllipticCurve";
import { encodeArrayUint8, encodeBigInteger } from "@/lib/encoder/Encoder";
import http from "@/lib/http";
import log from "@/lib/logger";
import "client-only";
import { getNonce } from "./nonce";

export interface LoginResponse {
  isSuccess: boolean;
  message?: string;
  token?: string;
  cipher?: MeongCipher;
}

export async function login(
  certificateKey: CertificateKey,
  firebaseId: string
): Promise<LoginResponse> {
  try {
    const { isSuccess, nonce, message, token: nonceToken } = await getNonce();

    if (!isSuccess) {
      return {
        isSuccess: false,
        message,
      };
    }

    const dh = new DiffieHellman(new BrainpoolP512r1());
    const [privDh, pubDh] = dh.generatePairKey();
    const encodedPubDh = encodeElipticCurve(pubDh);

    const signature = await sign(
      encodeArrayUint8([
        Buffer.from(certificateKey.userId),
        encodeBigInteger(nonce!),
        encodedPubDh,
        Buffer.from(firebaseId),
      ]),
      certificateKey
    );

    const payload = {
      user_id: certificateKey.userId,
      dh_public: Buffer.from(encodedPubDh).toString("base64"),
      server_token: nonceToken,
      firebase_id: firebaseId,
      signature: Buffer.from(signature).toString("base64"),
    };

    const { data } = await http.post("/login", payload);

    if (data.status !== "success") {
      log.error({
        name: "nonce",
        msg: "failed to login",
        cause: data.message,
      });
      return { isSuccess: false, message: "login failed: " + data.message };
    }

    const { token: encryptedToken, dh_public: serverPubDh } = data.data;
    const sessionKey = dh.generateSharedSecret(serverPubDh, privDh);
    const cipher = new MeongCipher(sessionKey);

    const token = Buffer.from(
      await cipher.decrypt(Buffer.from(encryptedToken, "base64"))
    ).toString("utf-8");
    return { isSuccess: true, token, cipher };
  } catch (err: any) {
    log.error({
      name: "login",
      msg: "failed to login",
      cause: err,
    });
    return { isSuccess: false, message: "login failed: " + err.message };
  }
}
