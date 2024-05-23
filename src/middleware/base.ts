import { NextRequest, NextResponse } from "next/server";

export interface Middleware {
  before(request: NextRequest): void;
  after(request: NextRequest, response: NextResponse): void;
}
