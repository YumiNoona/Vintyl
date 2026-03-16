import { NextResponse } from "next/server";

export async function PUT() {
  console.log("📦 Mock S3 PUT received and accepted");
  return NextResponse.json({ success: true });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
