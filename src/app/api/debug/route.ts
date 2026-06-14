import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let dbStatus = "disconnected"
    try {
      const db = getDb()
      db.prepare("SELECT 1").get()
      dbStatus = "connected"
    } catch {}

    return NextResponse.json({
      user: user
        ? {
            id: user.id,
            email: user.email,
          }
        : null,
      database: dbStatus,
      mode: "offline",
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "unknown error" },
      { status: 500 }
    )
  }
}
