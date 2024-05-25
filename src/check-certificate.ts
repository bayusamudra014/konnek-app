import {
  Certificate,
  decodeCertificate,
  verifyCertificate,
} from "@/lib/crypto/Certificate";
import { PublicKey } from "@/lib/crypto/KeyInterface";
import fs from "fs";

export async function checkCertificate(
  certificateKey: Certificate,
  ca: PublicKey
) {
  console.log("===== CERTIFICATE INFORMATION =====");
  console.log(`User id: ${certificateKey.userId}`);
  console.log(`Issuer id: ${certificateKey.issuerId}`);
  console.log(`Signing Algorithm: ${certificateKey.signAlg}`);
  console.log(`Encryption Algorithm: ${certificateKey.encAlg}`);
  console.log(`====================================`);
  console.log();

  const result = await verifyCertificate(certificateKey, ca);
  if (!result) {
    console.error("[ERROR] Certificate signature is not valid");
    process.exit(1);
  }
}

async function main() {
  if (process.argv[1].indexOf("check-certificate.ts") === -1) {
    return;
  }

  const certificatePath = process.argv[2];
  const caPath = process.argv[3];

  if (!certificatePath || !caPath) {
    console.error("Usage: yarn check:cert <certificate path> <ca path>");
    console.error("[ERROR] Certificate path and CA Path is required");
    process.exit(1);
  }

  const rawCertificate = fs.readFileSync(certificatePath);
  const rawCa = fs.readFileSync(caPath);
  const certificate = await decodeCertificate(rawCertificate, "raw");
  const caCertificate = await decodeCertificate(rawCa, "raw");

  await checkCertificate(certificate, caCertificate);
  console.log("[OK] Certificate is valid");
}

main();
