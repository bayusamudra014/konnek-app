import logger from "@/middleware/logger";
import { NextRequest, NextResponse } from "next/server";

const middlewareList = [logger];

export function middleware(request: NextRequest) {
  for (const m of middlewareList) {
    m.before(request);
  }

  const response = NextResponse.next();

  for (const m of middlewareList) {
    m.after(request, response);
  }
}
