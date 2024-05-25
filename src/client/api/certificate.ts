import "client-only";
import storage from "@/client/storage";
import { getBytes, ref } from "firebase/storage";
import log from "@/lib/logger";
import { Certificate, decodeCertificate } from "@/lib/crypto/Certificate";

export interface CertificateResponse {
  isSuccess: boolean;
  message?: string;
  certificate?: Certificate;
}

export async function getCertificate(
  userId: string
): Promise<CertificateResponse> {
  try {
    const client = ref(storage, userId);
    const result = await getBytes(client);
    const certificate = await decodeCertificate(Buffer.from(result), "raw");
    return {
      isSuccess: true,
      certificate,
    };
  } catch (err: any) {
    switch (err?.code) {
      case "storage/object-not-found":
        return {
          isSuccess: false,
          message: "user not found",
        };
      default:
        log.error({ name: "cert:get", msg: "unknown_error", err });
        return {
          isSuccess: false,
          message: "failed to get certificate: " + err.message,
        };
    }
  }
}
