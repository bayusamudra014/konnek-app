import fs from "fs";
import {
  CertificateKey,
  decodeCertificateKey,
  verifyCertificate,
} from "@/lib/crypto/Certificate";
import { ENC_ALGORITHM, SIGN_ALGORITHM } from "@/lib/crypto/const";
import BlumBlumShub from "@/lib/crypto/random/BlumBlumShub";
import { decrypt, encrypt, sign, verify } from "@/lib/crypto";
import { checkCertificate } from "./check-certificate";

async function main() {
  const keypath = process.argv[2];
  const password = process.argv[3];

  if (!keypath || !password) {
    console.error("Usage: yarn check:ca <keypath> <password>");
    console.error("[ERROR] Missing arguments");
    process.exit(1);
  }

  if (password.length != 16) {
    console.error("Usage: yarn generate:ca <keypath> <certificate> <password>");
    console.error("[ERROR] Password must be 16 characters long");
    process.exit(1);
  }

  const certificateKeyData = fs.readFileSync(keypath);
  const encKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const certificateKey = await decodeCertificateKey(
    certificateKeyData,
    encKey,
    "raw"
  );

  await checkCertificate(certificateKey, certificateKey);
  if (certificateKey.userId !== "master_ca") {
    console.error(`[ERROR] User id is not CA`);
    process.exit(1);
  }

  await testEncryption(certificateKey);
  await testSigning(certificateKey);

  console.log("[OK] All are correct");
}

async function testEncryption(certificateKey: CertificateKey) {
  const message = BlumBlumShub.nextBytes(new Uint8Array(256));

  console.log("[CHECK] Checking Encryption");

  if (certificateKey.encAlg !== ENC_ALGORITHM) {
    console.error(
      `[ERROR] Encryption algorithm "${certificateKey.encAlg}" is not supported`
    );
    process.exit(1);
  }

  const ct = await encrypt(message, certificateKey);
  const pt = await decrypt(ct, certificateKey);

  if (pt === message) {
    console.error(`[ERROR] Encryption key pair is not match`);
    process.exit(1);
  }
}

async function testSigning(certificateKey: CertificateKey) {
  const message = BlumBlumShub.nextBytes(new Uint8Array(256));

  console.log("[CHECK] Checking Signing");

  if (certificateKey.signAlg !== SIGN_ALGORITHM) {
    console.error(
      `[ERROR] Signing algorithm "${certificateKey.signAlg}" is not supported`
    );
    process.exit(1);
  }

  const digest = await sign(message, certificateKey);
  const result = await verify(message, digest, certificateKey);

  if (result !== true) {
    console.error(`[ERROR] Signing key pait is not match`);
    process.exit(1);
  }
}

main();
