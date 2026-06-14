import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDb } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient()
    const { data: { user: authUser } } = await supabaseServer.auth.getUser()

    const body = await req.json()
    const { fileName, contentType, workspaceId, folderId } = body

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!fileName || !contentType || !workspaceId) {
      return NextResponse.json(
        { error: "Missing fileName, contentType, or workspaceId" },
        { status: 400 }
      )
    }

    const videoId = uuidv4()
    const ext = fileName.split(".").pop() || "webm"
    const key = `${videoId}.${ext}`

    const sourcePath = `/api/video/${key}`

    const db = getDb()
    const now = new Date().toISOString()

    db.prepare(
      `INSERT INTO "Video" (id, title, source, workspaceId, folderId, userId, processing, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
    ).run(videoId, fileName, sourcePath, workspaceId, folderId || null, authUser.id, now)

    return NextResponse.json({
      uploadUrl: `/api/video/${key}`,
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
