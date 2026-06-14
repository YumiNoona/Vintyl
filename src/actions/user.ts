"use server";

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const onAuthenticatedUser = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { status: 403 };
    }

    const db = getDb();

    const userExists = db.prepare(`
      SELECT u.*, w.id as ws_id, w.name as ws_name, w.type as ws_type,
             s.plan as sub_plan
      FROM "User" u
      LEFT JOIN "Workspace" w ON w.userId = u.id
      LEFT JOIN "Subscription" s ON s.userId = u.id
      WHERE u.id = ?
    `).get(user.id) as any;

    if (userExists) {
      const workspaces: any[] = [];
      if (userExists.ws_id) {
        workspaces.push({ id: userExists.ws_id, name: userExists.ws_name, type: userExists.ws_type });
      }

      return {
        status: 200,
        user: {
          id: userExists.id,
          supabaseId: userExists.id,
          email: userExists.email,
          firstName: userExists.firstName,
          lastName: userExists.lastName,
          image: userExists.image,
          workspace: workspaces,
          subscription: userExists.sub_plan ? { plan: userExists.sub_plan } : null,
        },
      };
    }

    return { status: 404, message: "User not found" };
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('dynamic-server-error')) {
      throw error;
    }
    return { status: 500 };
  }
});

export const getNotifications = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 404, data: [] };

    const db = getDb();
    const notifications = db.prepare(
      'SELECT id, content, createdAt, inviteId FROM "Notification" WHERE userId = ? ORDER BY createdAt DESC'
    ).all(user.id) as any[];

    if (notifications.length > 0) {
      return {
        status: 200,
        data: {
          notifications,
          _count: { notifications: notifications.length },
        },
      };
    }

    return { status: 404, data: [] };
  } catch (error) {
    return { status: 400, data: [] };
  }
};

export const searchUsers = async (query: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 404, data: undefined };

    const db = getDb();
    const users = db.prepare(`
      SELECT u.id, u.firstName, u.lastName, u.image, u.email, s.plan as sub_plan
      FROM "User" u
      LEFT JOIN "Subscription" s ON s.userId = u.id
      WHERE (LOWER(u.firstName) LIKE LOWER(?) OR LOWER(u.lastName) LIKE LOWER(?) OR LOWER(u.email) LIKE LOWER(?))
      AND u.id != ?
    `).all(`%${query}%`, `%${query}%`, `%${query}%`, user.id) as any[];

    if (users.length > 0) {
      const flattenedUsers = users.map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        image: u.image,
        email: u.email,
        subscription: { plan: u.sub_plan || 'FREE' },
      }));
      return { status: 200, data: flattenedUsers };
    }

    return { status: 404, data: undefined };
  } catch (error) {
    return { status: 500, data: undefined };
  }
};

export const getUserProfile = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 404 };

    const db = getDb();
    const userProfile = db.prepare(
      'SELECT id, image, firstName, lastName, email FROM "User" WHERE id = ?'
    ).get(user.id) as any;

    if (userProfile) return { status: 200, data: userProfile };
    return { status: 404 };
  } catch (error) {
    return { status: 500 };
  }
};

export const updateUserProfile = async (firstName: string, lastName: string, image?: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 404 };

    const db = getDb();
    const updates: any = { firstName, lastName };
    if (image) updates.image = image;

    const setClauses = Object.keys(updates).map(k => `"${k}" = ?`).join(', ');
    const vals = Object.values(updates);
    vals.push(user.id);
    db.prepare(`UPDATE "User" SET ${setClauses} WHERE id = ?`).run(...vals);

    return { status: 200, data: "Profile updated successfully" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};
