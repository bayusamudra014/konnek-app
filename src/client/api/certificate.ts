import "client-only";
import storage from "@/client/storage";
import { getBytes, ref } from "firebase/storage";
import log from "@/lib/logger";
import { decodeCertificate } from "@/lib/crypto/Certificate";

export async function getCertificate(userId: string) {
  const client = ref(storage, userId);

  try {
    const result = await getBytes(client);
    const certificate = await decodeCertificate(Buffer.from(result), "raw");
    return certificate;
  } catch (err: any) {
    switch (err?.code) {
      case "storage/object-not-found":
        return null;
      default:
        log.error({ name: "cert:get", msg: "unknown_error", err });
    }
  }
}
