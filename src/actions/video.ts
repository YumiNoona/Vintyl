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
        commentId: null,
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
    await client.video.update({
      where: { id: videoId },
      data: { views: { increment: 1 } },
    });
    return { status: 200 };
  } catch {
    return { status: 400 };
  }
};
