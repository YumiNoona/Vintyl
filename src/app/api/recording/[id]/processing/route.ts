import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return NextResponse.json({ plan: "ENTERPRISE", status: 200 })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { filename } = body
    const userId = id

    const db = getDb()

    const existingVideo = db.prepare(
      'SELECT id, processing FROM "Video" WHERE source LIKE ? AND userId = ?'
    ).get(`%${filename}%`, userId) as any;

    if (existingVideo) {
      return NextResponse.json({
        status: 200,
        plan: "ENTERPRISE",
        videoId: existingVideo.id,
        isExisting: true,
      });
    }

    const workspace = db.prepare(
      'SELECT id FROM "Workspace" WHERE userId = ? AND type = ?'
    ).get(userId, 'PERSONAL') as any;

    const personalWorkspaceId = workspace?.id;

    if (!personalWorkspaceId) {
      return NextResponse.json({ error: "Personal workspace not found" }, { status: 404 })
    }

    const videoId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO "Video" (id, source, userId, workspaceId, processing, planAtCreation, createdAt) VALUES (?, ?, ?, ?, 1, 'ENTERPRISE', ?)`
    ).run(videoId, filename, userId, personalWorkspaceId, now);

    return NextResponse.json({
      status: 200,
      plan: "ENTERPRISE",
      dailyAIThreshold: 999999,
      aiUsageToday: 0,
      aiBlocked: false,
    })
  } catch (error) {
    console.error("Error in processing video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
