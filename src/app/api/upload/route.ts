import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getUploadUrl } from "@/lib/s3"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    let authUser = await currentUser()
    
    const body = await req.json()
    const { fileName, contentType, workspaceId, clerkId, folderId } = body

    const clerkUserId = authUser?.id || clerkId;

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Resolve Clerk ID to internal Prisma User ID
    const internalUser = await client.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }
    });

    if (!internalUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

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

    // Check for placeholder credentials and use mock if needed
    const isMock = process.env.AWS_ACCESS_KEY_ID === "your_access_key" || !process.env.AWS_ACCESS_KEY_ID
    
    let uploadUrl: string
    if (isMock) {
      console.log("🛠️ Using MOCK upload path for development")
      uploadUrl = `${process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000"}/api/upload/mock`
    } else {
      uploadUrl = await getUploadUrl(key, contentType)
    }

    // Save video record in Prisma
    const cloudFrontUrl = process.env.CLOUDFRONT_URL
    const sourcePath = cloudFrontUrl ? `${cloudFrontUrl}/${key}` : `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    await client.video.create({
      data: {
        id: videoId,
        title: fileName,
        source: sourcePath,
        workspaceId,
        folderId: folderId || null,
        userId: internalUser.id,
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
