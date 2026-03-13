import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getUploadUrl } from "@/lib/s3"
import { v4 as uuid } from "crypto"

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileName, contentType, workspaceId } = await req.json()

    if (!fileName || !contentType || !workspaceId) {
      return NextResponse.json(
        { error: "Missing fileName, contentType, or workspaceId" },
        { status: 400 }
      )
    }

    // Generate unique S3 key
    const videoId = crypto.randomUUID()
    const ext = fileName.split(".").pop() || "webm"
    const key = `videos/${workspaceId}/${videoId}.${ext}`

    const uploadUrl = await getUploadUrl(key, contentType)

    return NextResponse.json({
      uploadUrl,
      key,
      videoId,
    })
  } catch (error) {
    console.error("Upload URL error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
