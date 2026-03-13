import { NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
  }

  // Database check
  try {
    await client.$queryRaw`SELECT 1`
    checks.database = "connected"
  } catch {
    checks.database = "disconnected"
    checks.status = "degraded"
  }

  // Environment variable check
  checks.env_database = process.env.DATABASE_URL ? "set" : "missing"
  checks.env_clerk = process.env.CLERK_SECRET_KEY ? "set" : "missing"
  checks.env_openai = process.env.OPENAI_API_KEY ? "set" : "missing"
  checks.env_stripe = process.env.STRIPE_SECRET_KEY ? "set" : "missing"
  checks.env_aws = process.env.AWS_ACCESS_KEY_ID ? "set" : "missing"

  const statusCode = checks.status === "ok" ? 200 : 503
  return NextResponse.json(checks, { status: statusCode })
}
