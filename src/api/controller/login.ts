import { verifyServerNonce } from "@/lib/crypto/Nonce";
import log from "@/lib/logger";
import { NextResponse } from "next/server";
import { getCertificate } from "../certificate";
import { verifyCertificate } from "@/lib/crypto/Certificate";
import {
  BrainpoolP512r1,
  decodeElipticCurve,
  encodeElipticCurve,
} from "@/lib/crypto/math/EllipticCurve";
import { verify } from "@/lib/crypto";
import { encodeArrayUint8, encodeBigInteger } from "@/lib/encoder/Encoder";
import DiffieHellman from "@/lib/crypto/keyexchange/ElipticCurveDiffieHellman";
import jwt from "jsonwebtoken";
import { MeongCipher } from "@/lib/crypto/cipher/MeongCipher";
import firestoreAdmin from "../firestore";

const macKey = process.env.MAC_KEY;
const encryptionKey = process.env.ENCRYPTION_KEY;
const tokenLifetime = parseInt(process.env.REFRESH_TOKEN_LIVETIME ?? "7200");

export async function login(
  userId: string,
  diffieHellmanPublicKey: Uint8Array,
  serverNonceToken: string,
  firebaseId: string,
  signature: Uint8Array,
  ip: string | null
) {
  if (/^[a-zA-Z0-9-\_]+$/.test(userId) !== true) {
    log.info({
      name: "register",
      msg: "user_id_not_allowed",
      data: { userId },
    });
    return NextResponse.json(
      {
        status: "failed",
        message: "user id is not allowed",
        data: null,
      },
      { status: 400 }
    );
  }

  if (!macKey) {
    log.error({ name: "register", msg: "no_mac_key" });
    return NextResponse.json(
      {
        status: "failed",
        message: "internal server error",
        data: null,
      },
      { status: 500 }
    );
  }

  let serverNonce;
  try {
    serverNonce = await verifyServerNonce(serverNonceToken, macKey);
  } catch (err) {
    log.info({ name: "login", msg: "bad_nonce" });
    return NextResponse.json(
      {
        status: "failed",
        message: "invalid nonce",
        data: null,
      },
      { status: 400 }
    );
  }

  const userCertificate = await getCertificate(userId);
  if (!userCertificate) {
    log.info({ name: "login", msg: "user_not_found", data: { userId } });
    return NextResponse.json(
      {
        status: "failed",
        message: "user not registered",
        data: null,
      },
      { status: 400 }
    );
  }

  const caCertificate = await getCertificate("master_ca");
  if (!caCertificate) {
    log.error({ name: "login", msg: "ca_not_found" });
    return NextResponse.json(
      {
        status: "failed",
        message: "internal server error",
        data: null,
      },
      { status: 500 }
    );
  }

  if (!(await verifyCertificate(userCertificate, caCertificate))) {
    log.info({
      name: "login",
      msg: "user_certificate_tampered",
      data: { userId },
    });
    return NextResponse.json(
      {
        status: "failed",
        message: "user has been disabled",
        data: null,
      },
      { status: 400 }
    );
  }

  if (userCertificate.userId !== userId) {
    log.info({
      name: "login",
      msg: "user_id_not_match",
      data: { userId, certificateUserId: userCertificate.userId },
    });
    return NextResponse.json(
      {
        status: "failed",
        message: "user has been disabled",
        data: null,
      },
      { status: 400 }
    );
  }

  // Signature Check
  const signatureCheck = await verify(
    encodeArrayUint8([
      Buffer.from(userId),
      encodeBigInteger(serverNonce),
      diffieHellmanPublicKey,
      Buffer.from(firebaseId),
    ]),
    signature,
    userCertificate
  );

  if (!signatureCheck) {
    log.info({
      name: "login",
      msg: "signature_invalid",
      data: { userId },
    });
    return NextResponse.json(
      {
        status: "failed",
        message: "signature invalid",
        data: null,
      },
      { status: 400 }
    );
  }
  // From here, all checks are passed

  // Generate token
  const dh = new DiffieHellman(new BrainpoolP512r1());
  const [secret, pubkey] = dh.generatePairKey();

  const clientPubKey = decodeElipticCurve(diffieHellmanPublicKey);
  const sharedSecret = dh.generateSharedSecret(clientPubKey, secret);

  const encKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(encryptionKey),
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const iv = await crypto.getRandomValues(new Uint8Array(16));
  const encryptedSecret = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    encKey,
    sharedSecret
  );
  const ciphertext = encodeArrayUint8([iv, new Uint8Array(encryptedSecret)]);

  const token = jwt.sign(
    {
      session: Buffer.from(ciphertext).toString("base64"),
      userId,
    },
    macKey,
    {
      expiresIn: tokenLifetime,
    }
  );

  const cipher = new MeongCipher(sharedSecret);
  const encToken = Buffer.from(cipher.encrypt(Buffer.from(token))).toString(
    "base64"
  );
  const dhPublicServer = Buffer.from(encodeElipticCurve(pubkey)).toString(
    "base64"
  );

  // Save user info to database
  await firestoreAdmin.collection(`user_login`).doc(userId).set({
    firebaseId,
  });

  log.info({
    name: "login",
    msg: "user_login",
    data: { userId, ip },
  });

  return NextResponse.json({
    status: "success",
    message: "login success",
    data: {
      token: encToken,
      dh_public: dhPublicServer,
    },
  });
}
