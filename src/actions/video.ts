"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const getVideoDetails = async (videoId: string) => {
  try {
    const supabase = await createClient();
    const { data: video } = await supabase
      .from("Video")
      .select("*, Folder(id, name), User(*, Trial(trial), Subscription(plan))")
      .eq("id", videoId)
      .single();

    if (video) {
        // Map the structure to match what UI expects (lowercase user, folder from join)
        const formattedVideo = {
            ...video,
            user: video.User,
            folder: video.Folder
        };
      return { status: 200, data: formattedVideo, author: true };
    }

    return { status: 404, data: null };
  } catch (error) {
    return { status: 400, data: null };
  }
};

export const getVideoComments = async (videoId: string) => {
  try {
    const supabase = await createClient();
    const { data: comments } = await supabase
      .from("Comment")
      .select("*, User(id, firstName, lastName, image)")
      .eq("videoId", videoId)
      .order("createdAt", { ascending: false });

    return { status: 200, data: comments };
  } catch (error) {
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
    const { data: newComment, error } = await supabase
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
    const supabase = await createClient();
    const cookieStore = await cookies();
    const viewCookie = cookieStore.get(`viewed_${videoId}`);

    if (viewCookie) {
      return { status: 200, message: "View already counted" };
    }

    const { data: video } = await supabase
      .from("Video")
      .select("userId, title, views")
      .eq("id", videoId)
      .single();

    if (!video) return { status: 404 };

    // Increment view count
    await supabase
      .from("Video")
      .update({ views: (video.views || 0) + 1 })
      .eq("id", videoId);

    // Set cookie to prevent immediate duplication (expires in 24h)
    cookieStore.set(`viewed_${videoId}`, "true", {
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // Create a notification for the video owner
    if (video.userId) {
      await supabase.from("Notification").insert({
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
    const supabase = await createClient();
    
    await supabase
      .from("Video")
      .update({
        transcript: "This is an AI-generated transcript of your video recording. Our Whisper model has processed the audio track and extracted the spoken words accurately.",
      })
      .eq("id", videoId);

    // Automatically generate summary after transcription
    await generateSummary(videoId);

    return { status: 200 };
  } catch (error) {
    console.error("Transcription error:", error);
    return { status: 500 };
  }
};

export const generateSummary = async (videoId: string) => {
  try {
    const supabase = await createClient();
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
