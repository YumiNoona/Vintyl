import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDb } from "@/lib/db"
import { uploadVideo } from "@/lib/storage-local"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const workspaceId = formData.get("workspaceId") as string
    const folderId = formData.get("folderId") as string
    const fileName = formData.get("fileName") as string

    if (!file || !workspaceId || !fileName) {
      return NextResponse.json({ error: "Missing file, workspaceId, or fileName" }, { status: 400 })
    }

    const videoId = uuidv4()
    const ext = fileName.split(".").pop() || "webm"
    const key = `${videoId}.${ext}`
    const sourcePath = `/api/video/${key}`

    const buf = Buffer.from(await file.arrayBuffer())
    await uploadVideo(key, buf, file.type)

    const db = getDb()
    const now = new Date().toISOString()
    db.prepare(
      `INSERT INTO "Video" (id, title, source, workspaceId, folderId, userId, processing, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?)`
    ).run(videoId, fileName, sourcePath, workspaceId, folderId || null, user.id, now)

    return NextResponse.json({ videoId, source: sourcePath })
  } catch (error) {
    console.error("Direct upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
