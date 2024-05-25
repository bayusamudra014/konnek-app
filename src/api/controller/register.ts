import "server-only";

import {
  decodeCertificateKey,
  decodeCertificateRequest,
  encodeCertificate,
  generateCertificate,
  verifyCertificate,
  verifyCertificateRequest,
} from "@/lib/crypto/Certificate";
import { NextResponse } from "next/server";
import fs from "fs";
import log from "@/lib/logger";
import { verifyServerNonce } from "@/lib/crypto/Nonce";
import { isUserExist, uploadCertificate } from "@/api/certificate";

const caPrivateKey = process.env.CA_PRIVATE_KEY_PATH;
const caPrivateKeyPassword = process.env.CA_PRIVATE_KEY_PASSWORD;
const macKey = process.env.MAC_KEY;

export async function registerUser(
  certificateRequest: string,
  serverNonceToken: string,
  ip: string | null
) {
  if (!caPrivateKey || !fs.existsSync(caPrivateKey)) {
    log.error({ name: "register", msg: "no_admin_private_key" });

    return NextResponse.json(
      {
        status: "failed",
        message: "internal server error",
        data: null,
      },
      { status: 500 }
    );
  }

  if (!caPrivateKeyPassword) {
    log.error({ name: "register", msg: "no_admin_private_key_password" });

    return NextResponse.json(
      {
        status: "failed",
        message: "internal server error",
        data: null,
      },
      { status: 500 }
    );
  }

  const encKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(caPrivateKeyPassword),
    "AES-GCM",
    false,
    ["encrypt"]
  );

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

  const certReq = await decodeCertificateRequest(certificateRequest, "base64");
  try {
    const nonce = await verifyServerNonce(serverNonceToken, macKey);

    if (nonce !== certReq.serverNonce) {
      return NextResponse.json(
        {
          status: "failed",
          message: "invalid nonce",
          data: null,
        },
        { status: 400 }
      );
    }

    certReq.serverNonce = nonce;
  } catch (err) {
    log.info({ name: "register", msg: "bad_nonce" });
    return NextResponse.json(
      {
        status: "failed",
        message: "invalid nonce",
        data: null,
      },
      { status: 400 }
    );
  }

  const caKey = await decodeCertificateKey(
    fs.readFileSync(caPrivateKey),
    encKey,
    "raw"
  );

  if (!(await verifyCertificateRequest(certReq))) {
    log.info({
      name: "register",
      msg: "certificate_request_tampered",
    });
    return NextResponse.json(
      {
        status: "failed",
        message: "certificate request has been tampered",
        data: null,
      },
      { status: 400 }
    );
  }

  const { userId } = certReq;

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

  if (await isUserExist(userId)) {
    log.info({
      name: "register",
      msg: "user_exists",
      data: { userId },
    });

    return NextResponse.json(
      {
        status: "failed",
        message: "user already exist",
        data: null,
      },
      { status: 400 }
    );
  }

  // Generate Certificate
  const certificate = await generateCertificate(certReq, caKey.userId, caKey);

  if (!(await verifyCertificate(certificate, caKey))) {
    log.info({
      name: "register",
      msg: "certificate_generation_failed",
      cause: "generated certificate verification failed",
    });

    return NextResponse.json(
      {
        status: "failed",
        message: "internal server error",
        data: null,
      },
      { status: 500 }
    );
  }

  const rawCert = await encodeCertificate(certificate, "raw");

  try {
    await uploadCertificate(userId, rawCert);
  } catch (err) {
    log.info({
      name: "register",
      msg: "upload_failed",
      cause: err,
    });
    return NextResponse.json(
      {
        status: "failed",
        message: "internal server error",
        data: null,
      },
      { status: 500 }
    );
  }

  const encodedCert = Buffer.from(rawCert).toString("base64");

  log.info({ name: "register", msg: "registered_user", data: { userId, ip } });

  return NextResponse.json(
    {
      status: "success",
      message: "user registered",
      data: { certificate: encodedCert },
    },
    { status: 200 }
  );
}
