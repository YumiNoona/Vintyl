import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { client } from "@/lib/prisma"
import { supabase } from "@/lib/storage"

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

    // Generate unique Key
    const videoId = crypto.randomUUID()
    const ext = fileName.split(".").pop() || "webm"
    const key = `${videoId}.${ext}`
    const bucketName = "vintyl-videos"

    // Create a signed upload URL for Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(key)

    if (uploadError) {
      console.error("Supabase signed URL error:", uploadError)
      return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
    }

    // Get the public URL for the source path
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(key)
    const sourcePath = publicUrlData.publicUrl

    // Save video record in Prisma
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
      uploadUrl: uploadData.signedUrl,
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
