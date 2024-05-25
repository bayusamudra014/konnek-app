import fs from "fs";
import { encodePrivateKey, generatePrivateKey } from "@/lib/crypto/Key";
import {
  encodeCertificate,
  encodeCertificateKey,
  generateCertificate,
  generateCertificateKey,
  generateCertificateRequest,
} from "@/lib/crypto/Certificate";
import BlumBlumShub from "@/lib/crypto/random/BlumBlumShub";

async function main() {
  const keypath = process.argv[2];
  const password = process.argv[3];

  if (!keypath || !password) {
    console.error("Usage: yarn generate:ca <keypath> <password>");
    console.error("[ERROR] Missing arguments");
    process.exit(1);
  }

  if (password.length != 16) {
    console.error("Usage: yarn generate:ca <keypath> <password>");
    console.error("[ERROR] Password must be 16 characters long");
    process.exit(1);
  }

  const key = generatePrivateKey();
  const nonce = BlumBlumShub.nextBigInt(32);
  const certReq = await generateCertificateRequest(
    key,
    key,
    "master_ca",
    nonce
  );

  const certificate = await generateCertificate(certReq, "master_ca", key);
  const encKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const certificateKey = await generateCertificateKey(certificate, key);
  const result = await encodeCertificateKey(certificateKey, encKey, "raw");

  fs.writeFileSync(keypath, result);
}

main();
