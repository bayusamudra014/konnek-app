import { readFileSync, writeFileSync } from "fs";
import {
  decodeCertificateKey,
  encodeCertificate,
} from "./lib/crypto/Certificate";

async function extractCertificate(
  certificateKeyData: Buffer,
  password: string,
  mode: BufferEncoding | "raw"
) {
  const encKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "AES-GCM",
    false,
    ["decrypt"]
  );

  if (mode !== "raw") {
    certificateKeyData = Buffer.from(
      certificateKeyData.toString("utf-8"),
      mode
    );
  }

  const certificateKey = await decodeCertificateKey(
    certificateKeyData,
    encKey,
    "raw"
  );

  return encodeCertificate(certificateKey, mode as any);
}

async function main() {
  const utility = process.argv[2];

  if (utility === "convert-certkey") {
    const certificateKeyPath = process.argv[3];
    const password = process.argv[4];
    const output = process.argv[5];
    const format = process.argv[6] ?? "raw";

    if (!certificateKeyPath || !password) {
      console.error(
        "Usage: yarn util:cert convert-certkey <certificate-key> <password> <output> [format=raw]"
      );
      console.error("[ERROR] Certificte Key and Password required");
      process.exit(1);
    }

    if (password.length !== 16) {
      console.error(
        "Usage: yarn convert:certificate <certificate-key> <password> [format=raw]"
      );
      console.error("[ERROR] Password must be 16 characters long");
      process.exit(1);
    }

    const rawData = readFileSync(certificateKeyPath);
    const result = await extractCertificate(rawData, password, format as any);

    writeFileSync(output, result);
  }
}

main();
