import { extractNonce } from "@/lib/crypto/Nonce";
import http from "@/lib/http";
import log from "@/lib/logger";

export interface NonceResponse {
  isSuccess: boolean;
  nonce?: bigint;
  message?: string;
  token?: string;
}

export async function getNonce(): Promise<NonceResponse> {
  try {
    const { data } = await http.post("/nonce");

    if (data.status !== "success") {
      log.error({
        name: "nonce",
        msg: "failed to get nonce",
        cause: data.message,
      });
      return { isSuccess: false, message: "failed to get nonce" };
    }

    const nonce = await extractNonce(data.data.token);
    return { isSuccess: true, nonce, token: data.data.token };
  } catch (err: any) {
    log.error({ name: "nonce", msg: "unknown_error", err });
    return { isSuccess: false, message: "failed to get nonce: " + err.message };
  }
}
