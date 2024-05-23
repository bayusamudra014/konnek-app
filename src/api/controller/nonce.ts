import { generateServerNonce } from "@/lib/crypto/Nonce";
import log from "@/lib/logger";
import { NextResponse } from "next/server";

const macKey = process.env.MAC_KEY;
const nonceLivetime = parseInt(process.env.NONCE_LIVETIME ?? "60");

export async function generateNonceResponse() {
  if (!macKey) {
    log.error({ name: "nonce", msg: "no_mac_key" });
    return NextResponse.json(
      {
        status: "failed",
        message: "internal server error",
        data: null,
      },
      { status: 500 }
    );
  }

  try {
    const token = await generateServerNonce(macKey, nonceLivetime);
    return NextResponse.json(
      {
        status: "success",
        message: "token generated",
        data: { token },
      },
      { status: 200 }
    );
  } catch (err) {
    log.error({ name: "nonce", msg: "inernal_error", details: err });
    return NextResponse.json(
      {
        status: "failed",
        message: "internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
