import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: dbCheck, error: dbError } = await supabase.from("User").select("id").limit(1)

    return NextResponse.json({
      supabaseUser: user
        ? {
            id: user.id,
            email: user.email,
          }
        : null,
      database: !dbError ? "connected" : "error",
      env: {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "present" : "missing",
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "present" : "missing",
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || "unknown error",
      },
      { status: 500 }
    )
  }
}
