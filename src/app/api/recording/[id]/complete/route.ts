import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { id } = await params
    const body = await req.json()
    const { filename } = body

    const { data: user } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("supabaseId", id)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // FIX #13: source is stored as a full Supabase public URL, not just the filename.
    // Using .like() matches ".../<filename>" correctly instead of an exact eq() that always misses.
    const { data: videos } = await supabaseAdmin
      .from("Video")
      .select("id")
      .eq("userId", user.id)
      .like("source", `%${filename}%`)
      .limit(1)

    if (!videos || videos.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from("Video")
      .update({ processing: false })
      .eq("id", videos[0].id)

    if (!error) {
      return NextResponse.json({ status: 200 })
    }

    return NextResponse.json({ error: "Video not found" }, { status: 404 })
  } catch (error) {
    console.error("Error in completing video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}