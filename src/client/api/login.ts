import "client-only";

import { sign } from "@/lib/crypto";
import { CertificateKey, decodeCertificateKey } from "@/lib/crypto/Certificate";
import { MeongCipher } from "@/lib/crypto/cipher/MeongCipher";
import DiffieHellman from "@/lib/crypto/keyexchange/ElipticCurveDiffieHellman";
import {
  BrainpoolP512r1,
  decodeElipticCurve,
  encodeElipticCurve,
} from "@/lib/crypto/math/EllipticCurve";
import { encodeArrayUint8, encodeBigInteger } from "@/lib/encoder/Encoder";
import http from "@/lib/http";
import log from "@/lib/logger";
import { getNonce } from "@/client/api/nonce";
import { SHA256 } from "@/lib/crypto/digest/SHA2";
import { CTRBlock } from "@/lib/crypto/block/counter";
import { Cipher } from "@/lib/crypto/cipher/Cipher";
import { getCipher } from "@/lib/CipherUtil";
import { CipherType } from "@/lib/CipherType";

export interface LoginResponse {
  isSuccess: boolean;
  message?: string;
  token?: string;
  cipher?: Cipher;
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

    const { token: encryptedToken, dh_public: rawServerPubDh } = data.data;
    const serverPubDh = decodeElipticCurve(
      Buffer.from(rawServerPubDh, "base64")
    );

    const sessionKey = dh.generateSharedSecret(serverPubDh, privDh);
    const cipher = getCipher(CipherType.CTR, sessionKey);

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

export interface DecodeCertificateKey {
  isSuccess: boolean;
  certificateKey?: CertificateKey;
  message?: string;
}

export async function decodeCertificateKeyFile(
  file: Blob,
  password: string
): Promise<DecodeCertificateKey> {
  try {
    const buffer = Buffer.from(await file.text(), "base64");
    const hash = new SHA256();
    const hashPassword = await hash.calculate(Buffer.from(password, "utf-8"));

    const key = await crypto.subtle.importKey(
      "raw",
      hashPassword,
      "AES-GCM",
      true,
      ["decrypt"]
    );

    const result = await decodeCertificateKey(buffer, key, "raw");

    return {
      isSuccess: true,
      certificateKey: result,
    };
  } catch (err: any) {
    if (err instanceof DOMException) {
      log.error({
        name: "login:decode_certificate_key",
        msg: "wrong password",
        cause: err,
      });

      return {
        isSuccess: false,
        message: "failed to decode certificate key: wrong password",
      };
    }

    log.error({
      name: "login:decode_certificate_key",
      msg: "failed to decode certificate key",
      cause: err,
    });

    return {
      isSuccess: false,
      message: "failed to decode certificate key: " + err.message,
    };
  }
}
