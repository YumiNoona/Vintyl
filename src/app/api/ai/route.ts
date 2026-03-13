import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { processVideoWithAI, transcribeVideo, generateVideoSummary } from "@/actions/ai"

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { videoId, action } = await req.json()

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 })
    }

    let result

    switch (action) {
      case "transcribe":
        result = await transcribeVideo(videoId)
        break
      case "summarize":
        result = await generateVideoSummary(videoId)
        break
      case "process":
      default:
        result = await processVideoWithAI(videoId)
        break
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("AI processing error:", error)
    return NextResponse.json(
      { error: "AI processing failed" },
      { status: 500 }
    )
  }
}
