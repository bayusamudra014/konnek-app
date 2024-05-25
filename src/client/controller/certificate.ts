import "client-only";
import { MemoryCache } from "memory-cache-node";
import storage from "@/client/storage";
import { getBytes, ref } from "firebase/storage";
import log from "@/lib/logger";
import { decodeCertificate } from "@/lib/crypto/Certificate";

const CACHE_TIME = parseInt(process.env.NEXT_PUBLIC_CACHE_TIME ?? "30_000");
const cache = new MemoryCache(CACHE_TIME, 100);

export async function getCertificate(userId: string) {
  const client = ref(storage, userId);

  if (cache.hasItem(userId)) {
    return cache.retrieveItemValue(userId);
  }

  try {
    const result = await getBytes(client);
    const certificate = await decodeCertificate(Buffer.from(result), "raw");

    cache.storeExpiringItem(userId, certificate, CACHE_TIME);
  } catch (err: any) {
    switch (err?.code) {
      case "storage/object-not-found":
        return null;
      default:
        log.error({ name: "cert:get", msg: "unknown_error", err });
    }
  }
}
