import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    DATABASE_URL_PREVIEW: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 50) + "..."
      : "UNDEFINED",
    NODE_ENV: process.env.NODE_ENV,
    ALL_ENV_KEYS: Object.keys(process.env).filter(
      (k) => k.includes("DATABASE") || k.includes("CLERK") || k.includes("STRIPE")
    ),
  })
}
