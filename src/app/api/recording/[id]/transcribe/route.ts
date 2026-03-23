import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { filename, content, transcript, source } = body
    
    const parsedContent = JSON.parse(content)

    const { data: user } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("supabaseId", id)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the video by its filename in the source path
    const { data: videos } = await supabaseAdmin
      .from("Video")
      .select("id, title, summary, source")
      .eq("userId", user.id)
      .like("source", `%${filename}%`)
      .limit(1)

    if (!videos || videos.length === 0) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const video = videos[0];

    const { error } = await supabaseAdmin
      .from("Video")
      .update({
        title: parsedContent.title || video.title,
        summary: parsedContent.summary || video.summary,
        transcript: transcript,
        source: source || video.source, // Update source if a new one (e.g. Supabase) is provided
        processing: false
      })
      .eq("id", video.id)

    if (error) throw error;

    console.log("✅ Video transcribed and updated successfully")
    return NextResponse.json({ status: 200 })
  } catch (error) {
    console.error("Error in transcribing video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
