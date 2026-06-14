"use server";

import { createClient, createSystemClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { deleteVideo as deleteVideoFile } from "@/lib/storage-local";
import path from "path";

export const verifyAccessToWorkspace = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const db = getDb();
    const member = db.prepare(
      'SELECT workspaceId FROM "Member" WHERE workspaceId = ? AND supabaseId = ?'
    ).get(workspaceId, user.id) as any;

    if (!member) return { status: 403 };

    return { status: 200, data: { workspaceId: member.workspaceId } };
  } catch (error) {
    return { status: 403 };
  }
};

export const getFirstWorkspaceForUser = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const db = getDb();
    const member = db.prepare(
      'SELECT workspaceId FROM "Member" WHERE supabaseId = ? LIMIT 1'
    ).get(user.id) as any;

    if (!member) return { status: 404 };
    return { status: 200, workspaceId: member.workspaceId };
  } catch (error) {
    return { status: 500 };
  }
};

export const getWorkspaceFolders = async (workspaceId: string) => {
  try {
    const db = getDb();
    const folders = db.prepare(
      'SELECT id, name, createdAt FROM "Folder" WHERE workspaceId = ? ORDER BY createdAt ASC'
    ).all(workspaceId) as any[];

    if (folders.length > 0) {
      const videos = db.prepare(
        'SELECT id, folderId FROM "Video" WHERE workspaceId = ? AND processing = 0 AND folderId IS NOT NULL'
      ).all(workspaceId) as any[];

      const folderCountMap = new Map<string, number>();
      videos.forEach((video: any) => {
        if (!video.folderId) return;
        folderCountMap.set(video.folderId, (folderCountMap.get(video.folderId) || 0) + 1);
      });

      return {
        status: 200,
        data: folders.map((folder) => ({
          ...folder,
          videoCount: folderCountMap.get(folder.id) || 0,
        })),
      };
    }

    return { status: 404, data: [] };
  } catch (error) {
    return { status: 403, data: [] };
  }
};

export const getAllUserVideos = async (workspaceId: string, folderId?: string) => {
  try {
    const db = getDb();

    let sql = `SELECT v.*, f.id as f_id, f.name as f_name,
               u.id as u_id, u.firstName as u_firstName, u.lastName as u_lastName, u.image as u_image
               FROM "Video" v
               LEFT JOIN "Folder" f ON f.id = v.folderId
               LEFT JOIN "User" u ON u.id = v.userId
               WHERE v.workspaceId = ? AND v.processing = 0`;

    const params: any[] = [workspaceId];

    if (folderId) {
      sql += ' AND v.folderId = ?';
      params.push(folderId);
    }

    sql += ' ORDER BY v.createdAt DESC';

    const videos = db.prepare(sql).all(...params) as any[];

    if (videos.length > 0) {
      const flattenedVideos = videos.map((v: any) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        source: v.source,
        processing: v.processing,
        views: v.views,
        isPublic: v.isPublic,
        transcript: v.transcript,
        summary: v.summary,
        workspaceId: v.workspaceId,
        folderId: v.folderId,
        userId: v.userId,
        planAtCreation: v.planAtCreation,
        createdAt: v.createdAt,
        Folder: v.f_id ? { id: v.f_id, name: v.f_name } : null,
        User: v.u_id ? { firstName: v.u_firstName, lastName: v.u_lastName, image: v.u_image } : null,
      }));
      return { status: 200, data: flattenedVideos };
    }

    return { status: 404, data: [] };
  } catch (error) {
    return { status: 400, data: [] };
  }
};

export const getWorkspaces = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 404 };

    const db = getDb();
    const rows = db.prepare(`
      SELECT u.id, u.supabaseId, u.email, u.firstName, u.lastName, u.image,
             s.plan as sub_plan,
             w.id as ws_id, w.name as ws_name, w.type as ws_type,
             m.workspaceId as m_ws_id
      FROM "User" u
      LEFT JOIN "Subscription" s ON s.userId = u.id
      LEFT JOIN "Workspace" w ON w.userId = u.id
      LEFT JOIN "Member" m ON m.userId = u.id AND m.workspaceId != w.id
      WHERE u.id = ?
    `).all(user.id) as any[];

    if (rows.length > 0) {
      const workspaceMap = new Map<string, any>();

      for (const row of rows) {
        if (row.ws_id && !workspaceMap.has(row.ws_id)) {
          workspaceMap.set(row.ws_id, { id: row.ws_id, name: row.ws_name, type: row.ws_type });
        }
        if (row.m_ws_id && !workspaceMap.has(row.m_ws_id)) {
          const mWs = db.prepare('SELECT id, name, type FROM "Workspace" WHERE id = ?').get(row.m_ws_id) as any;
          if (mWs) workspaceMap.set(mWs.id, mWs);
        }
      }

      return {
        status: 200,
        data: {
          id: rows[0].id,
          supabaseId: rows[0].id,
          email: rows[0].email,
          firstName: rows[0].firstName,
          lastName: rows[0].lastName,
          image: rows[0].image,
          subscription: { plan: rows[0].sub_plan || 'FREE' },
          workspace: Array.from(workspaceMap.values()),
        },
      };
    }

    return { status: 400 };
  } catch (error) {
    return { status: 400 };
  }
};

export const createWorkspace = async (name: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 404 };

    const db = getDb();
    const wsId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO "Workspace" (id, name, type, userId, createdAt) VALUES (?, ?, 'PUBLIC', ?, ?)`
    ).run(wsId, name, user.id, now);

    db.prepare(
      `INSERT INTO "Member" (id, userId, workspaceId, supabaseId, createdAt) VALUES (?, ?, ?, ?, ?)`
    ).run(uuidv4(), user.id, wsId, user.id, now);

    return { status: 201, data: wsId };
  } catch (error) {
    return { status: 400, data: "Internal error" };
  }
};

export const createFolder = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const db = getDb();
    const folderId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO "Folder" (id, name, workspaceId, userId, createdAt) VALUES (?, 'Untitled', ?, ?, ?)`
    ).run(folderId, workspaceId, user.id, now);

    return { status: 200, message: "New folder created" };
  } catch (error) {
    return { status: 500, message: "Internal error" };
  }
};

export const renameFolders = async (folderId: string, name: string) => {
  try {
    const db = getDb();
    db.prepare(`UPDATE "Folder" SET name = ? WHERE id = ?`).run(name, folderId);
    return { status: 200, data: "Folder renamed" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const inviteMembers = async (workspaceId: string, receiverId: string, email: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 404 };

    const db = getDb();
    const senderInfo = db.prepare('SELECT id, firstName, lastName FROM "User" WHERE id = ?').get(user.id) as any;
    if (!senderInfo) return { status: 404, data: "User not found" };

    const workspace = db.prepare('SELECT name FROM "Workspace" WHERE id = ?').get(workspaceId) as any;
    if (!workspace) return { status: 404, data: "Workspace not found" };

    const recipient = db.prepare('SELECT id FROM "User" WHERE id = ?').get(receiverId) as any;
    if (!recipient) return { status: 404, data: "Recipient not found" };

    const inviteId = uuidv4();
    const notifId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO "Invite" (id, senderId, receiverId, workspaceId, email, content, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(inviteId, senderInfo.id, receiverId, workspaceId, email, `You are invited to join ${workspace.name} workspace`, now);

    db.prepare(
      `INSERT INTO "Notification" (id, userId, content, inviteId, createdAt) VALUES (?, ?, ?, ?, ?)`
    ).run(notifId, receiverId, `${senderInfo.firstName} ${senderInfo.lastName} invited you to ${workspace.name}`, inviteId, now);

    return { status: 200, data: "Invite sent" };
  } catch (error) {
    return { status: 400, data: "Internal error" };
  }
};

export const moveVideoLocation = async (videoId: string, workSpaceId: string, folderId: string) => {
  try {
    const db = getDb();
    db.prepare(`UPDATE "Video" SET folderId = ?, workspaceId = ? WHERE id = ?`).run(folderId || null, workSpaceId, videoId);
    return { status: 200, data: "folder changed successfully" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const acceptInvite = async (inviteId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 401 };

    const db = getDb();
    const invite = db.prepare('SELECT * FROM "Invite" WHERE id = ?').get(inviteId) as any;
    if (!invite) return { status: 404, data: "Invite not found" };
    if (invite.accepted) return { status: 400, data: "Invite already accepted" };
    if (invite.email && user.email !== invite.email) {
      return { status: 401, data: "This invite was sent to a different email address" };
    }

    db.prepare(`UPDATE "Invite" SET accepted = 1 WHERE id = ?`).run(inviteId);

    db.prepare(
      `INSERT INTO "Member" (id, userId, workspaceId, supabaseId, createdAt) VALUES (?, ?, ?, ?, ?)`
    ).run(uuidv4(), user.id, invite.workspaceId, user.id, new Date().toISOString());

    const workspace = db.prepare('SELECT name FROM "Workspace" WHERE id = ?').get(invite.workspaceId) as any;
    db.prepare(
      `INSERT INTO "Notification" (id, userId, content, createdAt) VALUES (?, ?, ?, ?)`
    ).run(uuidv4(), invite.senderId, `${user.email} accepted the invite to ${workspace?.name || 'workspace'}`, new Date().toISOString());

    return { status: 200, data: "Invite accepted" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const getWorkspaceMembers = async (workspaceId: string) => {
  try {
    const db = getDb();

    const ws = db.prepare('SELECT id, userId FROM "Workspace" WHERE id = ?').get(workspaceId) as any;
    if (!ws) return { status: 404 };

    const owner = db.prepare('SELECT id, firstName, lastName, email, image FROM "User" WHERE id = ?').get(ws.userId) as any;

    const members = db.prepare(`
      SELECT u.id, u.firstName, u.lastName, u.email, u.image
      FROM "Member" m
      JOIN "User" u ON u.id = m.userId
      WHERE m.workspaceId = ? AND m.userId != ?
    `).all(workspaceId, ws.userId) as any[];

    return {
      status: 200,
      data: {
        id: ws.id,
        user: owner,
        members: members.map((m: any) => ({
          user: m,
        })),
      },
    };
  } catch (error) {
    return { status: 400 };
  }
};

export const deleteFolder = async (folderId: string) => {
  try {
    const db = getDb();
    db.prepare(`DELETE FROM "Folder" WHERE id = ?`).run(folderId);
    return { status: 200, data: "Folder deleted" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const renameWorkspace = async (workspaceId: string, name: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const db = getDb();
    db.prepare(`UPDATE "Workspace" SET name = ? WHERE id = ? AND userId = ?`).run(name, workspaceId, user.id);
    return { status: 200, data: "Workspace renamed" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const db = getDb();
    db.prepare(`DELETE FROM "Workspace" WHERE id = ? AND userId = ?`).run(workspaceId, user.id);
    return { status: 200, data: "Workspace deleted" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const updateFolderLocation = async (folderId: string, workspaceId: string) => {
  try {
    const db = getDb();
    db.prepare(`UPDATE "Folder" SET workspaceId = ? WHERE id = ?`).run(workspaceId, folderId);
    return { status: 200, data: "Folder moved successfully" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const getHowToPost = async () => {
  return { status: 404 };
};

export const editVideoInfo = async (videoId: string, title: string, description: string) => {
  try {
    const db = getDb();
    db.prepare(`UPDATE "Video" SET title = ?, description = ? WHERE id = ?`).run(title, description, videoId);
    return { status: 200, data: "Video details updated" };
  } catch (error) {
    return { status: 400, data: "Failed to update video" };
  }
};

export const deleteVideo = async (videoId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const db = getDb();
    const video = db.prepare('SELECT source FROM "Video" WHERE id = ? AND userId = ?').get(videoId, user.id) as any;

    if (!video) return { status: 404, data: "Video not found or unauthorized" };

    db.prepare(`DELETE FROM "Video" WHERE id = ?`).run(videoId);

    if (video.source) {
      const key = path.basename(video.source);
      deleteVideoFile(key);
    }

    return { status: 200, data: "Video removed permanently" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};
