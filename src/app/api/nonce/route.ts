import { generateNonceResponse } from "@/api/controller/nonce";

export async function POST() {
  return generateNonceResponse();
}
