import "server-only";

import NodeCache from "node-cache";
import { Certificate, decodeCertificate } from "@/lib/crypto/Certificate";
import storageAdmin from "./storage";

const cache = new NodeCache();
const CACHE_TIME = parseInt(process.env.NEXT_PUBLIC_CACHE_TIME ?? "30_000");

const userBucket = storageAdmin.bucket();

export async function getCertificate(
  userId: string
): Promise<Certificate | null> {
  if (cache.get(userId)) {
    return cache.get(userId) ?? null;
  }

  if (/^[a-zA-Z0-9-\_]+$/g.test(userId) !== true) {
    return null;
  }

  const downloaded = (await storageAdmin.bucket().file(userId).download())[0];
  if (!downloaded) {
    return null;
  }

  const certificate = await decodeCertificate(downloaded, "raw");
  cache.set(userId, certificate, CACHE_TIME);

  return certificate;
}

export async function isUserExist(userId: string) {
  if (/^[a-zA-Z0-9-\_]+$/g.test(userId) !== true) {
    return false;
  }

  return (await storageAdmin.bucket().file(userId).exists())[0];
}

export async function uploadCertificate(userId: string, certificate: Buffer) {
  if (/^[a-zA-Z0-9-\_]+$/g.test(userId) !== true) {
    throw new Error("user id is not valid");
  }

  await userBucket.file(userId).save(certificate);
}
