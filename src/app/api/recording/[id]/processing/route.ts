import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"
import { PLAN_LIMITS } from "@/shared/planLimits"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
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

    const plan = (subscription?.plan || "FREE") as keyof typeof PLAN_LIMITS
    const limit = PLAN_LIMITS[plan]?.videos || 25

    // 1. Idempotency Check (Prevent duplicate processing for same file)
    const { data: existingVideo } = await supabaseAdmin
      .from("Video")
      .select("id, processing")
      .eq("source", filename)
      .eq("userId", user.id)
      .maybeSingle();

    if (existingVideo) {
      console.log("♻️ Idempotency: Video already exists/processing, skipping creation.", existingVideo.id);
      return NextResponse.json({ 
        status: 200, 
        plan,
        videoId: existingVideo.id,
        isExisting: true
      });
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
    // Added planAtCreation for snapshotting (analytics + retroactive safety)
    const { data: video, error } = await supabaseAdmin
      .from("Video")
      .insert({
        source: filename,
        userId: user.id,
        workspaceId: personalWorkspaceId,
        processing: true,
        planAtCreation: plan, // SNAPSHOT: Store user's plan at time of creation
      })
      .select()
      .single()

    if (video && !error) {
      // Race Condition Protection: Re-check count AFTER insert
      if (limit !== Infinity) {
        const { count } = await supabaseAdmin
          .from("Video")
          .select("*", { count: "exact", head: true })
          .eq("userId", user.id);

        if (count !== null && count > limit) {
          // Exceeded! Cleanup the record just created
          await supabaseAdmin.from("Video").delete().eq("id", video.id);
          return NextResponse.json(
            { message: "Video limit exceeded during parallel upload. Upgrade required." },
            { status: 403 }
          );
        }

        // 2. Soft Limits (UX Warning)
        if (count !== null && count >= limit - 2) {
           console.warn(`📢 Soft Limit reached for ${String(plan)}: ${count}/${limit}`);
           // Send a hint to the client (optional, but good for logging)
        }
      }

      // 3. AI Threshold Enforcement (Future-Proof + Cost Control)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count: aiUsageToday } = await supabaseAdmin
        .from("Video")
        .select("*", { count: "exact", head: true })
        .eq("userId", user.id)
        .gte("createdAt", todayStart.toISOString())
        .not("summary", "is", null);

      const threshold = PLAN_LIMITS[plan]?.dailyAIThreshold ?? 0;
      const aiBlocked = aiUsageToday !== null && aiUsageToday >= threshold;

      return NextResponse.json({ 
        status: 200, 
        plan,
        dailyAIThreshold: threshold,
        aiUsageToday: aiUsageToday || 0,
        aiBlocked
      })
    }
  } catch (error) {
    console.error("Error in processing video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
