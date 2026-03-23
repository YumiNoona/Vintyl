import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
  }

  // Database check via Supabase
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("User").select("id").limit(1)
    if (error) throw error
    checks.database = "connected"
  } catch (err) {
    console.error("Health Check DB Error:", err)
    checks.database = "disconnected"
    checks.status = "degraded"
  }

  // Environment variable check
  checks.env_supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing"
  checks.env_supabase_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "missing"
  checks.env_gemini = process.env.GEMINI_API_KEY ? "set" : "missing"
  checks.env_stripe = process.env.STRIPE_SECRET_KEY ? "set" : "missing"

  const statusCode = checks.status === "ok" ? 200 : 503
  return NextResponse.json(checks, { status: statusCode })
}
