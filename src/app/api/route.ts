import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "success",
      message: "server is running",
      data: null,
    },
    { status: 200 }
  );
}
