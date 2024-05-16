import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "success",
      message: "Server is running",
      data: null,
    },
    { status: 200 }
  );
}
