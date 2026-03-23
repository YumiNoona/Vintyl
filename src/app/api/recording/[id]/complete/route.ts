import { client } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { filename } = body

    const user = await client.user.findUnique({
      where: { clerkId: id },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const video = await client.video.updateMany({
      where: {
        source: filename,
        userId: user.id
      },
      data: {
        processing: false,
      }
    })

    if (video) {
      return NextResponse.json({ status: 200 })
    }

    return NextResponse.json({ error: "Video not found" }, { status: 404 })
  } catch (error) {
    console.error("Error in completing video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
