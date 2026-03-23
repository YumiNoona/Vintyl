"use server";

import { client } from "@/lib/prisma";

export const getVideoDetails = async (videoId: string) => {
  try {
    const video = await client.video.findUnique({
      where: { id: videoId },
      include: {
        folder: { select: { id: true, name: true } },
        user: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
            clerkId: true,
            trial: { select: { trial: true } },
            subscription: { select: { plan: true } },
          },
        },
      },
    });

    if (video) {
      return { status: 200, data: video, author: true };
    }

    return { status: 404, data: null };
  } catch (error) {
    return { status: 400, data: null };
  }
};

export const getVideoComments = async (videoId: string) => {
  try {
    const comments = await client.comment.findMany({
      where: {
        videoId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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
    const newComment = await client.comment.create({
      data: {
        comment,
        videoId,
        userId,
        commentId: commentId || undefined,
        reply: !!commentId,
      },
    });

    if (newComment) {
      return { status: 200, data: "Comment posted" };
    }

    return { status: 400, data: "Failed to post comment" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const incrementVideoViews = async (videoId: string) => {
  try {
    const video = await client.video.findUnique({
      where: { id: videoId },
      select: { userId: true, title: true },
    });

    if (!video) return { status: 404 };

    // Increment view count
    await client.video.update({
      where: { id: videoId },
      data: { views: { increment: 1 } },
    });

    // Create a notification for the video owner if it exists
    if (video.userId) {
      await client.notification.create({
        data: {
          userId: video.userId,
          content: `Someone just viewed your video: ${video.title || "Untitled"}`,
        },
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
    const video = await client.video.findUnique({
      where: { id: videoId },
    });

    if (!video) return { status: 404 };

    // In a real world, we'd download the file from S3 and send to Whisper
    // For this simulation, we'll mark it as transcribed with placeholder text
    // and then trigger the summary generation
    
    await client.video.update({
      where: { id: videoId },
      data: {
        transcript: "This is an AI-generated transcript of your video recording. Our Whisper model has processed the audio track and extracted the spoken words accurately.",
      },
    });

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
    const video = await client.video.findUnique({
      where: { id: videoId },
    });

    if (!video || !video.transcript) return { status: 404 };

    // Simulation of GPT summary generation
    const summary = "In this video, the recorder demonstrates the platform features and discusses the integration between the desktop and web components. Key points include the new AI pipeline and the streamlined sharing UX.";
    
    await client.video.update({
      where: { id: videoId },
      data: {
        summary,
        processing: false, // Finished!
      },
    });

    return { status: 200 };
  } catch (error) {
    console.error("Summary error:", error);
    return { status: 500 };
  }
};
