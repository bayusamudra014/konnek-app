import {
  decodeCertificate,
  decodeCertificateKey,
  decodeCertificateRequest,
  encodeCertificate,
  encodeCertificateKey,
  encodeCertificateRequest,
  generateCertificate,
  generateCertificateKey,
  generateCertificateRequest,
  verifyCertificate,
  verifyCertificateRequest,
} from "@/lib/crypto/Certificate";
import { generatePrivateKey } from "@/lib/crypto/Key";
import { extractNonce, generateServerNonce } from "@/lib/crypto/Nonce";

describe("Certificate Request", () => {
  it("should able to generate a certificate request", async () => {
    const key = generatePrivateKey();
    const rawNonce = await generateServerNonce("test", 60);
    const serverNonce = await extractNonce(rawNonce);

    const request = await generateCertificateRequest(
      key,
      key,
      crypto.randomUUID(),
      serverNonce
    );
    const certificateReq = await verifyCertificateRequest(request);
    expect(certificateReq).toBeTruthy();
  });

  it("should able to encode certificate request", async () => {
    const key = generatePrivateKey();
    const rawNonce = await generateServerNonce("test", 60);
    const serverNonce = await extractNonce(rawNonce);

    const request = await generateCertificateRequest(
      key,
      key,
      crypto.randomUUID(),
      serverNonce
    );
    const formatted = await encodeCertificateRequest(request);
    expect(formatted).toBeDefined();

    const certificateReq = await decodeCertificateRequest(formatted);
    expect(certificateReq).toStrictEqual(request);
    expect(verifyCertificateRequest(certificateReq)).resolves.toBeTruthy();
  });

  it("should able to detect invalid certificate request", async () => {
    const key = generatePrivateKey();
    const key2 = generatePrivateKey();
    const rawNonce = await generateServerNonce("test", 60);
    const serverNonce = await extractNonce(rawNonce);

    const request = await generateCertificateRequest(
      key,
      key2,
      crypto.randomUUID(),
      serverNonce
    );
    const formatted = await encodeCertificateRequest(request);

    const certificateReq = await decodeCertificateRequest(formatted);
    expect(certificateReq).toBeDefined();

    expect(verifyCertificateRequest(certificateReq)).resolves.toBe(false);
  });
});

describe("Certificate", () => {
  it("should able to generate a certificate", async () => {
    const key = generatePrivateKey();
    const keyMaster = generatePrivateKey();
    const rawNonce = await generateServerNonce("test", 60);
    const serverNonce = await extractNonce(rawNonce);
    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();

    const request = await generateCertificateRequest(key, key, id, serverNonce);
    const certificateReq = await verifyCertificateRequest(request);
    expect(certificateReq).toBeTruthy();

    const certificate = await generateCertificate(request, id2, keyMaster);
    expect(certificate).toBeDefined();

    const okResult = await verifyCertificate(certificate, keyMaster);
    expect(okResult).toBeTruthy();

    const badResult = await verifyCertificate(certificate, key);
    expect(badResult).toBeFalsy();
  });

  it("should able to detect invalid certificate", async () => {
    const key = generatePrivateKey();
    const keyMaster = generatePrivateKey();
    const keyMaster2 = generatePrivateKey();
    const rawNonce = await generateServerNonce("test", 60);
    const serverNonce = await extractNonce(rawNonce);
    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();

    const request = await generateCertificateRequest(key, key, id, serverNonce);
    const certificateReq = await verifyCertificateRequest(request);
    expect(certificateReq).toBeTruthy();

    const certificate = await generateCertificate(request, id2, keyMaster2);
    expect(certificate).toBeDefined();
    expect(await verifyCertificate(certificate, keyMaster)).toBeFalsy();
    expect(await verifyCertificate(certificate, key)).toBeFalsy();
  });

  it("should able to encode and decode certificate", async () => {
    const key = generatePrivateKey();
    const keyMaster = generatePrivateKey();
    const rawNonce = await generateServerNonce("test", 60);
    const serverNonce = await extractNonce(rawNonce);
    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();

    const request = await generateCertificateRequest(key, key, id, serverNonce);
    const certificateReq = await verifyCertificateRequest(request);
    expect(certificateReq).toBeTruthy();

    const certificate = await generateCertificate(request, id2, keyMaster);
    expect(certificate).toBeDefined();

    const formatted = await encodeCertificate(certificate);
    expect(formatted).toBeDefined();

    const decoded = await decodeCertificate(formatted);
    expect(decoded).toBeDefined();
    expect(decoded).toStrictEqual(certificate);

    const okResult = await verifyCertificate(decoded, keyMaster);
    expect(okResult).toBeTruthy();
  });
});

describe("Certificate with Key test", () => {
  it("should able to generate certificate key", async () => {
    const key = generatePrivateKey();
    const keyMaster = generatePrivateKey();
    const rawNonce = await generateServerNonce("test", 60);
    const serverNonce = await extractNonce(rawNonce);
    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();

    const request = await generateCertificateRequest(key, key, id, serverNonce);
    const certificateReq = await verifyCertificateRequest(request);
    expect(certificateReq).toBeTruthy();

    const certificate = await generateCertificate(request, id2, keyMaster);
    expect(certificate).toBeDefined();

    const okResult = await verifyCertificate(certificate, keyMaster);
    expect(okResult).toBeTruthy();

    const certKey = generateCertificateKey(certificate, key);
    expect(certKey).toBeDefined();
  });

  it("should able to encode and decode certificate key", async () => {
    const key = generatePrivateKey();
    const keyMaster = generatePrivateKey();
    const rawNonce = await generateServerNonce("test", 60);
    const serverNonce = await extractNonce(rawNonce);
    const id = crypto.randomUUID();
    const id2 = crypto.randomUUID();

    const request = await generateCertificateRequest(key, key, id, serverNonce);
    const certificateReq = await verifyCertificateRequest(request);
    expect(certificateReq).toBeTruthy();

    const certificate = await generateCertificate(request, id2, keyMaster);
    expect(certificate).toBeDefined();

    const okResult = await verifyCertificate(certificate, keyMaster);
    expect(okResult).toBeTruthy();

    const certKey = await generateCertificateKey(certificate, key);
    expect(certKey).toBeDefined();

    const encodeKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    const encoded = await encodeCertificateKey(certKey, encodeKey, "raw");
    const decoded = await decodeCertificateKey(encoded, encodeKey, "raw");

    expect(decoded).toStrictEqual(certKey);
  });
});
