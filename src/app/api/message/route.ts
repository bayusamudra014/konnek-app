import { getMessages, sendMessage } from "@/api/controller/message";
import log from "@/lib/logger";
import { NextRequest } from "next/server";
import "server-only";

export async function GET(req: NextRequest) {
  const [type, token, ...rest] =
    req.headers.get("Authorization")?.split(" ") ?? [];
  const after = req.nextUrl.searchParams.get("after");

  if (!token || type !== "Bearer" || rest.length > 0) {
    log.info({ name: "message:get", msg: "unauthorized access" });
    return new Response(
      JSON.stringify({
        status: "failed",
        message: "unauthorized access",
        data: null,
      }),
      { status: 401 }
    );
  }

  return getMessages(token, after);
}

export async function POST(req: NextRequest) {
  const [type, token, ...rest] =
    req.headers.get("Authorization")?.split(" ") ?? [];
  const { payload } = await req.json();

  if (!token || type !== "Bearer" || rest.length > 0) {
    log.info({ name: "message:get", msg: "unauthorized access" });
    return new Response(
      JSON.stringify({
        status: "failed",
        message: "unauthorized access",
        data: null,
      }),
      { status: 401 }
    );
  }

  if (!payload) {
    return new Response(
      JSON.stringify({
        status: "failed",
        message: "invalid request",
        data: null,
      }),
      { status: 400 }
    );
  }

  return sendMessage(token, payload);
}
