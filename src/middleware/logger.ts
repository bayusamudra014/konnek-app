import log from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { Middleware } from "./base";
import { headers } from "next/headers";

function after(request: NextRequest, response: NextResponse) {
  const path = request.nextUrl.pathname;

  const ip =
    request.ip ??
    headers().get("x-client-ip") ??
    headers().get("x-forwarded-for") ??
    headers().get("x-real-ip") ??
    headers().get("forwarded-for");

  const method = request.method;

  const status = response.status;

  log.info({
    name: "request",
    method,
    path,
    ip,
    status,
    msg: "user_request",
  });
}

export default {
  before: () => {},
  after,
} as Middleware;
