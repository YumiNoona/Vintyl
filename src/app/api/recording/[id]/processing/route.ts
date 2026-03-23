import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { filename } = body // The key/filename used in S3
    const userId = id // This is the Supabase Auth ID sent from Express

    // Resolve Supabase Auth ID to internal User ID
    const { data: user } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("supabaseId", userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: subscription } = await supabaseAdmin
      .from("Subscription")
      .select("plan")
      .eq("userId", user.id)
      .single()

    const plan = subscription?.plan || "FREE"

    if (plan === "FREE") {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { count } = await supabaseAdmin
        .from("Video")
        .select("*", { count: "exact", head: true })
        .eq("userId", user.id)
        .gte("createdAt", startOfMonth)

      if (count !== null && count >= 25) {
        return NextResponse.json(
          { message: "Free tier limit reached (25 videos/mo)" },
          { status: 403 }
        )
      }
    }

    const { data: workspace } = await supabaseAdmin
      .from("Workspace")
      .select("id")
      .eq("userId", user.id)
      .eq("type", "PERSONAL")
      .single()

    const personalWorkspaceId = workspace?.id

    if (!personalWorkspaceId) {
      return NextResponse.json({ error: "Personal workspace not found" }, { status: 404 })
    }

    // Create a placeholder video record
    const { data: video, error } = await supabaseAdmin
      .from("Video")
      .insert({
        source: filename,
        userId: user.id,
        workspaceId: personalWorkspaceId,
        processing: true,
      })
      .select()
      .single()

    if (video && !error) {
      return NextResponse.json({ 
        status: 200, 
        plan
      })
    }

    return NextResponse.json({ error: "Failed to create video" }, { status: 400 })
  } catch (error) {
    console.error("Error in processing video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
