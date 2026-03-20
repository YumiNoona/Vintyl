import { client } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { filename, content, transcript } = body
    // content is the JSON string from GPT-3.5/4o (title and summary)
    
    const parsedContent = JSON.parse(content)

    const video = await client.video.updateMany({
      where: {
        source: filename,
        userId: (await client.user.findUnique({ where: { clerkId: params.id }, select: { id: true } }))?.id
      },
      data: {
        title: parsedContent.title,
        description: parsedContent.summary,
        transcript: transcript,
      }
    })

    if (video) {
        console.log("✅ Video transcribed successfully")
      return NextResponse.json({ status: 200 })
    }

    return NextResponse.json({ error: "Video not found" }, { status: 404 })
  } catch (error) {
    console.error("Error in transcribing video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
