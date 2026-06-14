import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { filename, content, transcript, source } = body

    const parsedContent = JSON.parse(content)

    const db = getDb()
    const videos = db.prepare(
      'SELECT id, title, summary, source FROM "Video" WHERE userId = ? AND source LIKE ? LIMIT 1'
    ).all(id, `%${filename}%`) as any[];

    if (videos.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const video = videos[0];

    db.prepare(
      `UPDATE "Video" SET title = ?, summary = ?, transcript = ?, source = ?, processing = 0 WHERE id = ?`
    ).run(
      parsedContent.title || video.title,
      parsedContent.summary || video.summary,
      transcript,
      source || video.source,
      video.id
    );

    return NextResponse.json({ status: 200 })
  } catch (error) {
    console.error("Error in transcribing video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
