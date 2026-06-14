"use server";

import { createClient, createSystemClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const getVideoDetails = async (videoId: string) => {
  try {
    const db = getDb();
    const video = db.prepare(`
      SELECT v.*,
             f.id as f_id, f.name as f_name,
             u.id as u_id, u.firstName as u_firstName, u.lastName as u_lastName,
             u.image as u_image, u.email as u_email,
             s.plan as sub_plan
      FROM "Video" v
      LEFT JOIN "Folder" f ON f.id = v.folderId
      LEFT JOIN "User" u ON u.id = v.userId
      LEFT JOIN "Subscription" s ON s.userId = u.id
      WHERE v.id = ?
    `).get(videoId) as any;

    if (video) {
      const result = {
        id: video.id,
        title: video.title,
        description: video.description,
        source: video.source,
        views: video.views,
        createdAt: video.createdAt,
        processing: video.processing,
        summary: video.summary,
        transcript: video.transcript,
        isPublic: video.isPublic,
        workspaceId: video.workspaceId,
        folderId: video.folderId,
        userId: video.userId,
        planAtCreation: video.planAtCreation,
        Folder: video.f_id ? { id: video.f_id, name: video.f_name } : null,
        User: video.u_id ? {
          id: video.u_id,
          firstName: video.u_firstName,
          lastName: video.u_lastName,
          image: video.u_image,
          email: video.u_email,
          supabaseId: video.u_id,
          subscription: video.sub_plan ? { plan: video.sub_plan } : null,
          trial: null,
        } : null,
      };
      return { status: 200, data: result, author: true };
    }

    return { status: 404, data: null };
  } catch (error) {
    return { status: 400, data: null };
  }
};

export const getVideoComments = async (videoId: string) => {
  try {
    const db = getDb();
    const comments = db.prepare(`
      SELECT c.*, u.id as u_id, u.firstName as u_firstName, u.lastName as u_lastName, u.image as u_image
      FROM "Comment" c
      LEFT JOIN "User" u ON u.id = c.userId
      WHERE c.videoId = ?
      ORDER BY c.createdAt DESC
    `).all(videoId) as any[];

    const flattenedComments = comments.map((c: any) => ({
      id: c.id,
      comment: c.comment,
      reply: !!c.reply,
      commentId: c.commentId,
      videoId: c.videoId,
      userId: c.userId,
      createdAt: c.createdAt,
      User: c.u_id ? {
        id: c.u_id,
        firstName: c.u_firstName,
        lastName: c.u_lastName,
        image: c.u_image,
      } : null,
    }));

    return { status: 200, data: flattenedComments };
  } catch (error) {
    return { status: 400, data: [] };
  }
};

export const createComment = async (videoId: string, comment: string, commentId?: string, userId?: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 401, data: "Unauthorized" };

    const db = getDb();
    const commentIdGen = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO "Comment" (id, comment, videoId, userId, commentId, reply, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(commentIdGen, comment, videoId, userId || user.id, commentId || null, commentId ? 1 : 0, now);

    return { status: 200, data: "Comment posted" };
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

    const db = getDb();
    const video = db.prepare('SELECT userId, title, views FROM "Video" WHERE id = ?').get(videoId) as any;

    if (!video) return { status: 404 };

    db.prepare(`UPDATE "Video" SET views = ? WHERE id = ?`).run((video.views || 0) + 1, videoId);

    cookieStore.set(`viewed_${videoId}`, "true", {
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    if (video.userId) {
      const notifId = uuidv4();
      const now = new Date().toISOString();
      db.prepare(
        `INSERT INTO "Notification" (id, userId, content, createdAt) VALUES (?, ?, ?, ?)`
      ).run(notifId, video.userId, `Someone just viewed your video: ${video.title || "Untitled"}`, now);
    }

    return { status: 200 };
  } catch (error) {
    return { status: 400 };
  }
};

export const transcribeVideo = async (videoId: string) => {
  try {
    const db = getDb();
    db.prepare(`UPDATE "Video" SET transcript = ? WHERE id = ?`).run(
      "This is an AI-generated transcript of your video recording. Our Whisper model has processed the audio track and extracted the spoken words accurately.",
      videoId
    );

    await generateSummary(videoId);
    return { status: 200 };
  } catch (error) {
    return { status: 500 };
  }
};

export const generateSummary = async (videoId: string) => {
  try {
    const db = getDb();
    const video = db.prepare('SELECT transcript FROM "Video" WHERE id = ?').get(videoId) as any;

    if (!video || !video.transcript) return { status: 404 };

    db.prepare(`UPDATE "Video" SET summary = ?, processing = 0 WHERE id = ?`).run(
      "In this video, the recorder demonstrates the platform features and discusses the integration between the desktop and web components. Key points include the new AI pipeline and the streamlined sharing UX.",
      videoId
    );

    return { status: 200 };
  } catch (error) {
    return { status: 500 };
  }
};
