import { client } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { filename } = body // The key/filename used in S3
    const userId = id // This is the Clerk ID sent from Express

    // Resolve Clerk ID to internal Prisma User ID
    const user = await client.user.findUnique({
      where: { clerkId: userId },
      select: { 
        id: true,
        workspace: {
          where: { type: "PERSONAL" },
          select: { id: true }
        },
        subscription: {
          select: { plan: true }
        },
        _count: {
          select: {
            videos: {
              where: {
                createdAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
              },
            },
          },
        },
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.subscription?.plan === "FREE" && user._count.videos >= 25) {
      return NextResponse.json(
        { message: "Free tier limit reached (25 videos/mo)" },
        { status: 403 }
      )
    }

    const personalWorkspaceId = user.workspace[0]?.id

    if (!personalWorkspaceId) {
      return NextResponse.json({ error: "Personal workspace not found" }, { status: 404 })
    }

    // Create a placeholder video record
    const video = await client.video.create({
      data: {
        source: filename,
        userId: user.id,
        workspaceId: personalWorkspaceId,
        processing: true,
      }
    })

    if (video) {
      return NextResponse.json({ 
        status: 200, 
        plan: user.subscription?.plan || "FREE" 
      })
    }

    return NextResponse.json({ error: "Failed to create video" }, { status: 400 })
  } catch (error) {
    console.error("Error in processing video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
