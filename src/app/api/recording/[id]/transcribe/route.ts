import { client } from "@/lib/prisma"
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

    // Find the video by its filename in the source path
    const video = await client.video.findFirst({
      where: {
        source: { contains: filename },
        user: { clerkId: id }
      }
    })

    if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    await client.video.update({
      where: { id: video.id },
      data: {
        title: parsedContent.title || video.title,
        summary: parsedContent.summary || video.summary,
        transcript: transcript,
        source: source || video.source, // Update source if a new one (e.g. Supabase) is provided
        processing: false
      }
    })

    console.log("✅ Video transcribed and updated successfully")
    return NextResponse.json({ status: 200 })
  } catch (error) {
    console.error("Error in transcribing video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
