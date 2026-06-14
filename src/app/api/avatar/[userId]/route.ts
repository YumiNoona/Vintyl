import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const AVATARS_DIR = path.join(process.cwd(), 'uploads', 'avatars')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const [id, ext] = userId.split('.')

    const avatarPath = path.join(AVATARS_DIR, ext ? userId : `${id}.png`)

    if (!fs.existsSync(avatarPath)) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(avatarPath)
    const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 })
  }
}
