import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    HAS_GEMINI_KEY: !!process.env.GEMINI_API_KEY,
    HAS_GROQ_KEY: !!process.env.GROQ_API_KEY,
  })
}
