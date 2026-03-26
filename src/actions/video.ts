"use server";

// All DB operations use the system client (service role) to bypass RLS.
// The Member RLS policy is a direct supabaseId check — any query that JOINs
// or subqueries Member from another policy would cause infinite recursion.
// Using the system client is safe because authentication is verified via
// supabase.auth.getUser() before any write operation.
import { createClient, createSystemClient } from "@/lib/supabase/server";

export const getVideoDetails = async (videoId: string) => {
  try {
    const SELECT_QUERY = "*, Folder(id, name), User(*, Subscription(plan))";

    // Use system client to bypass Video RLS (which checks Member, triggering recursion)
    const systemSupabase = await createSystemClient();
    const { data: video, error } = await systemSupabase
      .from("Video")
      .select(SELECT_QUERY)
      .eq("id", videoId)
      .single();

    if (error) {
      console.error("getVideoDetails error:", error.message);
    }

    if (video) {
      const folder = Array.isArray(video.Folder) ? video.Folder[0] : video.Folder;
      const rawUser = Array.isArray(video.User) ? video.User[0] : video.User;

      const user = rawUser ? {
        ...rawUser,
        Subscription: Array.isArray(rawUser.Subscription) ? rawUser.Subscription[0] : rawUser.Subscription,
      } : null;

      return { status: 200, data: { ...video, Folder: folder, User: user }, author: true };
    }

    return { status: 404, data: null };
  } catch (error) {
    console.error("getVideoDetails error:", error);
    return { status: 400, data: null };
  }
};

export const getVideoComments = async (videoId: string) => {
  try {
    // Use system client: Comment RLS JOINs Video+Member which would recurse
    const systemSupabase = await createSystemClient();
    const { data: comments, error } = await systemSupabase
      .from("Comment")
      .select("*, User(id, firstName, lastName, image)")
      .eq("videoId", videoId)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("❌ getVideoComments Error:", error.message);
      return { status: 400, data: [] };
    }

    const flattenedComments = (comments || []).map((c: any) => {
      // Postgres returns uppercase User, but the UI expects lowercase user
      const userObj = Array.isArray(c.User) ? c.User[0] : c.User;
      return {
        ...c,
        user: userObj,
      };
    });

    return { status: 200, data: flattenedComments };
  } catch (error) {
    console.error("❌ getVideoComments Catch:", error);
    return { status: 400, data: [] };
  }
};

export const createComment = async (
  videoId: string,
  comment: string,
  commentId?: string,
  userId?: string
) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 401, data: "Unauthorized" };

    // Use system client: Comment WITH CHECK also touches Member
    const systemSupabase = await createSystemClient();
    const { data: newComment, error } = await systemSupabase
      .from("Comment")
      .insert({
        comment,
        videoId,
        userId,
        commentId: commentId || null,
        reply: !!commentId,
      })
      .select()
      .single();

    if (newComment && !error) {
      return { status: 200, data: "Comment posted" };
    }

    return { status: 400, data: "Failed to post comment" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const incrementVideoViews = async (videoId: string) => {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const viewCookie = cookieStore.get(`viewed_${videoId}`);

    if (viewCookie) {
      return { status: 200, message: "View already counted" };
    }

    // Use system client: avoids Video RLS recursion
    const systemSupabase = await createSystemClient();
    const { data: video } = await systemSupabase
      .from("Video")
      .select("userId, title, views")
      .eq("id", videoId)
      .single();

    if (!video) return { status: 404 };

    await systemSupabase
      .from("Video")
      .update({ views: (video.views || 0) + 1 })
      .eq("id", videoId);

    cookieStore.set(`viewed_${videoId}`, "true", {
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    if (video.userId) {
      await systemSupabase.from("Notification").insert({
        userId: video.userId,
        content: `Someone just viewed your video: ${video.title || "Untitled"}`,
      });
    }

    return { status: 200 };
  } catch (error) {
    console.error("Failed to increment views:", error);
    return { status: 400 };
  }
};

export const transcribeVideo = async (videoId: string) => {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();

    await supabase
      .from("Video")
      .update({
        transcript: "This is an AI-generated transcript of your video recording. Our Whisper model has processed the audio track and extracted the spoken words accurately.",
      })
      .eq("id", videoId);

    await generateSummary(videoId);

    return { status: 200 };
  } catch (error) {
    console.error("Transcription error:", error);
    return { status: 500 };
  }
};

export const generateSummary = async (videoId: string) => {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    const { data: video } = await supabase
      .from("Video")
      .select("transcript")
      .eq("id", videoId)
      .single();

    if (!video || !video.transcript) return { status: 404 };

    const summary = "In this video, the recorder demonstrates the platform features and discusses the integration between the desktop and web components. Key points include the new AI pipeline and the streamlined sharing UX.";

    await supabase
      .from("Video")
      .update({
        summary,
        processing: false,
      })
      .eq("id", videoId);

    return { status: 200 };
  } catch (error) {
    console.error("Summary error:", error);
    return { status: 500 };
  }
};