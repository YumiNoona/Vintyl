import { NextRequest, NextResponse } from "next/server"
import { getVideoPathByKey, videoExists } from "@/lib/storage-local"
import fs from "fs"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const decodedKey = decodeURIComponent(key)

    if (!videoExists(decodedKey)) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const filePath = getVideoPathByKey(decodedKey)
    const stat = fs.statSync(filePath)
    const ext = decodedKey.split('.').pop()?.toLowerCase() || 'webm'

    const mimeTypes: Record<string, string> = {
      webm: 'video/webm',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'

    const fileBuffer = fs.readFileSync(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(stat.size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 })
  }
}
