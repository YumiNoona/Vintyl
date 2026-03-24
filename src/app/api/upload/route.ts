import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { getStorageClient } from "@/lib/storage"

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient()
    const { data: { user: authUser } } = await supabaseServer.auth.getUser()

    const body = await req.json()
    const { fileName, contentType, workspaceId, folderId } = body

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const supabaseStorage = getStorageClient()

    // Resolve Supabase Auth ID to internal User ID
    const { data: internalUser } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("supabaseId", authUser.id)
      .single()

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
    const { data: uploadData, error: uploadError } = await supabaseStorage.storage
      .from(bucketName)
      .createSignedUploadUrl(key)

    if (uploadError) {
      console.error("Supabase signed URL error:", uploadError)
      return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 })
    }

    // Get the public URL for the source path
    const { data: publicUrlData } = supabaseStorage.storage.from(bucketName).getPublicUrl(key)
    const sourcePath = publicUrlData.publicUrl

    // Save video record in Supabase
    await supabaseAdmin.from("Video").insert({
      id: videoId,
      title: fileName,
      source: sourcePath,
      workspaceId,
      folderId: folderId || null,
      userId: internalUser.id,
      processing: true,
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
