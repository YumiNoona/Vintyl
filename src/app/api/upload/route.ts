import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getUploadUrl } from "@/lib/s3"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    let authUser = await currentUser()
    
    const body = await req.json()
    const { fileName, contentType, workspaceId, clerkId } = body

    // Fallback for desktop app testing
    if (!authUser && !clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = authUser?.id || clerkId;

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

    // Save video record in Prisma
    const cloudFrontUrl = process.env.CLOUDFRONT_URL
    const sourcePath = cloudFrontUrl ? `${cloudFrontUrl}/${key}` : `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    await client.video.create({
      data: {
        id: videoId,
        title: fileName,
        source: sourcePath,
        workspaceId,
        userId: userId!,
        processing: true,
      }
    })

    return NextResponse.json({
      uploadUrl,
      key,
      videoId,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error("Upload URL error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
