import "server-only";

import { login } from "@/api/controller/login";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user_id, dh_public, server_token, firebase_id, signature } =
    await req.json();

  if (
    user_id === undefined ||
    dh_public === undefined ||
    server_token === undefined ||
    firebase_id === undefined ||
    signature === undefined
  ) {
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

  return login(
    user_id,
    Buffer.from(dh_public, "base64"),
    server_token,
    firebase_id,
    Buffer.from(signature, "base64"),
    ip
  );
}
