import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
  }

  try {
    const db = getDb()
    db.prepare("SELECT 1").get()
    checks.database = "connected"
  } catch (err) {
    console.error("Health Check DB Error:", err)
    checks.database = "disconnected"
    checks.status = "degraded"
  }

  checks.env_gemini = process.env.GEMINI_API_KEY ? "set" : "missing"
  checks.mode = "offline"

  const statusCode = checks.status === "ok" ? 200 : 503
  return NextResponse.json(checks, { status: statusCode })
}
