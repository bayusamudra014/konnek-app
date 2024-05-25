import "server-only";

import { registerUser } from "@/api/controller/register";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { certificate_request, server_nonce_token } = await req.json();

  if (certificate_request === undefined || server_nonce_token === undefined) {
    return NextResponse.json(
      {
        status: "failed",
        message: "invalid payload",
        data: null,
      },
      { status: 400 }
    );
  }

  const ip =
    req.ip ??
    headers().get("x-client-ip") ??
    headers().get("x-forwarded-for") ??
    headers().get("x-real-ip") ??
    headers().get("forwarded-for");

  return registerUser(certificate_request, server_nonce_token, ip);
}
