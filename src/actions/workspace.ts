"use server";

import { createClient, createSystemClient } from "@/lib/supabase/server";
import axios from "axios";
const { PLAN_LIMITS } = require("../../shared/planLimits");

export const verifyAccessToWorkspace = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { status: 403 };

    // Use system client to bypass the self-referencing RLS policy on Member
    // which causes 0 rows to be returned even for valid members
    const systemSupabase = await createSystemClient();
    const { data: member, error } = await systemSupabase
      .from("Member")
      .select("workspaceId")
      .eq("workspaceId", workspaceId)
      .eq("supabaseId", user.id)
      .maybeSingle();

    if (error || !member) {
      console.log("❌ verifyAccessToWorkspace: Access denied via Member table", { workspaceId, supabaseId: user.id });
      return { status: 403 };
    }

    return {
      status: 200,
      data: { workspaceId: member.workspaceId },
    };
  } catch (error) {
    console.error("❌ verifyAccessToWorkspace Error:", error);
    return { status: 403 };
  }
};

export const getFirstWorkspaceForUser = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    // Use system client to bypass the same RLS issue on Member table
    const systemSupabase = await createSystemClient();
    const { data: member, error } = await systemSupabase
      .from("Member")
      .select("workspaceId")
      .eq("supabaseId", user.id)
      .limit(1)
      .maybeSingle();

    if (error || !member) return { status: 404 };

    return { status: 200, workspaceId: member.workspaceId };
  } catch (error) {
    return { status: 500 };
  }
};

export const getWorkspaceFolders = async (workspaceId: string) => {
  try {
    // Use system client to bypass RLS circular dependency on Folder table
    const systemSupabase = await createSystemClient();
    const { data: folders, error } = await systemSupabase
      .from("Folder")
      .select("id, name, createdAt")
      .eq("workspaceId", workspaceId)
      .order("createdAt", { ascending: true });

    if (error) console.error("getWorkspaceFolders error:", error.message);

    if (folders && folders.length > 0) {
      const { data: videos } = await systemSupabase
        .from("Video")
        .select("id, folderId")
        .eq("workspaceId", workspaceId)
        .eq("processing", false)
        .not("folderId", "is", null);

      const folderCountMap = new Map<string, number>();
      (videos || []).forEach((video: { folderId: string | null }) => {
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

export const getAllUserVideos = async (
  workspaceId: string,
  folderId?: string
) => {
  try {
    // Use system client to bypass RLS circular dependency on Video table
    const systemSupabase = await createSystemClient();

    // Query only by workspaceId — folderId is a child of workspace, not an alternative root
    let query = systemSupabase
      .from("Video")
      .select("*, Folder(id, name), User(firstName, lastName, image)")
      .eq("workspaceId", workspaceId)
      .eq("processing", false);

    if (folderId) {
      query = query.eq("folderId", folderId);
    }

    const { data: videos, error } = await query.order("createdAt", {
      ascending: false,
    });

    if (error) console.error("getAllUserVideos error:", error.message);

    if (videos && videos.length > 0) {
      // Flatten User and Folder relations for each video
      const flattenedVideos = videos.map((v: any) => ({
        ...v,
        User: Array.isArray(v.User) ? v.User[0] : v.User,
        Folder: Array.isArray(v.Folder) ? v.Folder[0] : v.Folder,
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

    const { data: userData } = await supabase
      .from("User")
      .select("subscription:Subscription(plan), workspace:Workspace(id, name, type), Member(workspace:Workspace(id, name, type))")
      .eq("supabaseId", user.id)
      .single();

    if (userData) {
      const allWorkspaces = [
        ...(userData.workspace || []),
        ...(userData.Member?.map((m: any) => m.workspace).filter(Boolean) || [])
      ];

      // Deduplicate by id — prevents double entries when user is member of own workspace
      const uniqueWorkspaces = Array.from(
        new Map(allWorkspaces.map((w: any) => [w.id, w])).values()
      );

      // Flatten Subscription
      const subscription = Array.isArray(userData.subscription)
        ? userData.subscription[0]
        : userData.subscription;

      return {
        status: 200,
        data: {
          ...userData,
          workspace: uniqueWorkspaces,
          subscription: subscription
        }
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

    // Use SYSTEM CLIENT to bypass RLS for provisioning
    const systemSupabase = await createSystemClient();

    // Lookup the internal User ID first
    const { data: dbUser } = await systemSupabase
      .from("User")
      .select("id")
      .eq("supabaseId", user.id)
      .single();

    if (!dbUser) return { status: 404, data: "User record not found" };

    // Check subscription using internal user ID (not supabase auth ID)
    const { data: authorized } = await systemSupabase
      .from("Subscription")
      .select("plan")
      .eq("userId", dbUser.id)
      .single();

    const plan = authorized?.plan || "FREE";
    const isPro = plan === "PRO";

    // All manually created workspaces should be PUBLIC to prevent hitting the 
    // unique_personal_workspace constraint in Postgres. 
    // If you explicitly want to stop FREE users from creating workspaces, 
    // return a 403 error string here instead of silently returning the old ID.
    const workspaceType = "PUBLIC";

    const { data: workspace, error } = await systemSupabase
      .from("Workspace")
      .insert({
        name,
        type: workspaceType,
        userId: dbUser.id
      })
      .select()
      .single();

    if (workspace && !error) {
      // Add membership for owner using correct unique constraint (workspaceId, supabaseId)
      await systemSupabase.from("Member").upsert(
        { userId: dbUser.id, workspaceId: workspace.id, supabaseId: user.id },
        { onConflict: "workspaceId, supabaseId" }
      );

      return {
        status: 201,
        data: workspace.id
      };
    }

    if (error) {
      console.error("❌ createWorkspace Error:", error.message);
    }

    return { status: 400, data: "Failed to create workspace" };
  } catch (error) {
    console.error("❌ createWorkspace Catch:", error);
    return { status: 400, data: "Internal error" };
  }
};

export const createFolder = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { status: 403 };

    // Use system client to bypass RLS for User lookup and Folder insert
    const systemSupabase = await createSystemClient();
    const { data: dbUser } = await systemSupabase.from("User").select("id").eq("supabaseId", authUser.id).single();
    if (!dbUser) return { status: 404 };

    const { data: folder, error } = await systemSupabase
      .from("Folder")
      .insert({ workspaceId, userId: dbUser.id, name: "Untitled" })
      .select()
      .single();

    if (error) {
      console.error("❌ createFolder Error:", error.message);
      return { status: 400, message: "Could not create folder" };
    }

    if (folder) {
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/dashboard/${workspaceId}`);
      return { status: 200, message: "New folder created" };
    }

    return { status: 400, message: "Failed to create folder" };
  } catch (error) {
    return { status: 500, message: "Internal error" };
  }
};

export const renameFolders = async (folderId: string, name: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };
    // Use system client: Folder RLS checks Member which would recurse
    const systemSupabase = await createSystemClient();
    const { error } = await systemSupabase
      .from("Folder")
      .update({ name })
      .eq("id", folderId);

    if (!error) {
      return { status: 200, data: "Folder renamed" };
    }

    return { status: 400, data: "Folder does not exist" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const inviteMembers = async (
  workspaceId: string,
  receiverId: string,
  email: string
) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 404 };

    const { data: senderInfo } = await supabase
      .from("User")
      .select("id, firstName, lastName")
      .eq("supabaseId", user.id)
      .single();

    if (senderInfo?.id) {
      const { data: workspace } = await supabase
        .from("Workspace")
        .select("name")
        .eq("id", workspaceId)
        .single();

      if (workspace) {
        // Enforce Member Limit based on Plan
        const { data: userPlanData } = await supabase
          .from("User")
          .select("Subscription(plan)")
          .eq("supabaseId", user.id)
          .single();
        
        const plan = (userPlanData?.Subscription as any)?.plan || "FREE";
        const limit = (PLAN_LIMITS as any)[plan]?.members || 1;

        const { count: currentMembers } = await supabase
          .from("Member")
          .select("*", { count: "exact", head: true })
          .eq("workspaceId", workspaceId);

        if (currentMembers !== null && currentMembers >= limit) {
          return { status: 403, data: `Member limit reached for ${plan} plan (${limit}). Upgrade required.` };
        }

        const systemSupabase = await createSystemClient();
        const { data: recipient } = await systemSupabase
          .from("User")
          .select("supabaseId")
          .eq("id", receiverId)
          .single();

        const { data: newInvite, error: inviteError } = await supabase
          .from("Invite")
          .insert({
            senderId: senderInfo.id,
            receiverId,
            receiverSupabaseId: recipient?.supabaseId,
            workspaceId,
            email,
            content: `You are invited to join ${workspace.name} workspace`,
          })
          .select("id")
          .single();

        // FIX #7: Store inviteId on the notification so the activity page
        // can pass the correct invite ID to InviteAcceptButton (not notification.id)
        await supabase.from("Notification").insert({
          userId: receiverId,
          content: `${senderInfo.firstName} ${senderInfo.lastName} invited you to ${workspace.name}`,
          inviteId: newInvite?.id ?? null,
        });

        if (!inviteError) {
          return { status: 200, data: "Invite sent" };
        }

        return { status: 400, data: "Invite not sent" };
      }

      return { status: 404, data: "Workspace not found" };
    }

    return { status: 404, data: "Recipient not found" };
  } catch (error) {
    return { status: 400, data: "Internal error" };
  }
};

export const moveVideoLocation = async (
  videoId: string,
  workSpaceId: string,
  folderId: string
) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };
    // Use system client: Video RLS checks Member which would recurse
    const systemSupabase = await createSystemClient();
    const { error } = await systemSupabase
      .from("Video")
      .update({
        folderId: folderId || null,
        workspaceId: workSpaceId,
      })
      .eq("id", videoId);

    if (!error) return { status: 200, data: "folder changed successfully" };

    return { status: 404, data: "workspace/folder not found" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const acceptInvite = async (inviteId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 401 };

    const { data: dbUser } = await supabase
      .from("User")
      .select("id")
      .eq("supabaseId", user.id)
      .single();

    if (!dbUser) return { status: 404, data: "User not found" };

    const { data: invite } = await supabase
      .from("Invite")
      .select("*, Workspace(name)")
      .eq("id", inviteId)
      .single();

    if (!invite) return { status: 404, data: "Invite not found" };
    if (invite.accepted) return { status: 400, data: "Invite already accepted" };

    if (invite.email && user.email !== invite.email) {
      return { status: 401, data: "This invite was sent to a different email address" };
    }

    const { error: inviteUpdateError } = await supabase
      .from("Invite")
      .update({ accepted: true })
      .eq("id", inviteId);

    const { error: memberError } = await supabase
      .from("Member")
      .insert({
        userId: dbUser.id,
        workspaceId: invite.workspaceId,
        supabaseId: user.id
      });

    await supabase.from("Notification").insert({
      userId: invite.senderId!,
      content: `${user.user_metadata?.first_name || user.email} accepted the invite to ${invite.Workspace.name}`,
    });

    if (inviteUpdateError || memberError) throw new Error("Failed to accept invite");

    return { status: 200, data: "Invite accepted" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const getWorkspaceMembers = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { status: 403 };

    const { data: members, error } = await supabase
      .from("Workspace")
      .select(`
        id,
        User (
          id,
          firstName,
          lastName,
          email,
          image
        ),
        members:Member (
          user:User (
            id,
            firstName,
            lastName,
            email,
            image
          )
        )
      `)
      .eq("id", workspaceId)
      .single();

    if (error || !members) return { status: 404 };

    // PostgREST might return relations as arrays. We flatten them for the frontend.
    const owner = Array.isArray(members.User) ? members.User[0] : members.User;

    // Deduplicate members list by unique userId
    const memberMap = new Map();
    (members.members || []).forEach((m: any) => {
      const u = Array.isArray(m.user) ? m.user[0] : m.user;
      if (u && u.id !== owner?.id) {
        memberMap.set(u.id, { ...m, user: u });
      }
    });

    return {
      status: 200,
      data: {
        ...members,
        user: owner,
        members: Array.from(memberMap.values()),
      },
    };
  } catch (error) {
    console.error("❌ getWorkspaceMembers Error:", error);
    return { status: 400 };
  }
};

export const deleteFolder = async (folderId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };
    // Use system client: Folder RLS checks Member which would recurse
    const systemSupabase = await createSystemClient();
    const { error } = await systemSupabase
      .from("Folder")
      .delete()
      .eq("id", folderId);

    if (!error) {
      return { status: 200, data: "Folder deleted" };
    }

    return { status: 400, data: "Folder not found" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const renameWorkspace = async (workspaceId: string, name: string) => {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return { status: 403 };

    // Lookup internal User ID
    const { data: dbUser } = await supabase.from("User").select("id").eq("supabaseId", authUser.id).single();
    if (!dbUser) return { status: 404 };

    const { error } = await supabase
      .from("Workspace")
      .update({ name })
      .eq("id", workspaceId)
      .eq("userId", dbUser.id);

    if (!error) {
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/dashboard/${workspaceId}`);
      revalidatePath("/dashboard");
      return { status: 200, data: "Workspace renamed" };
    }

    return { status: 400, data: "Workspace not found" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    // FIX #6: Must use internal User.id (not supabase auth UUID) to match Workspace.userId FK
    const systemSupabase = await createSystemClient();
    const { data: dbUser } = await systemSupabase
      .from("User")
      .select("id")
      .eq("supabaseId", user.id)
      .single();

    if (!dbUser) return { status: 404, data: "User not found" };

    const { error } = await systemSupabase
      .from("Workspace")
      .delete()
      .eq("id", workspaceId)
      .eq("userId", dbUser.id);

    if (!error) {
      return { status: 200, data: "Workspace deleted" };
    }

    return { status: 400, data: "Workspace not found" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const updateFolderLocation = async (
  folderId: string,
  workspaceId: string,
) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };
    // Use system client: Folder RLS checks Member which would recurse
    const systemSupabase = await createSystemClient();
    const { error } = await systemSupabase
      .from("Folder")
      .update({ workspaceId })
      .eq("id", folderId);

    if (!error) return { status: 200, data: "Folder moved successfully" };

    return { status: 404, data: "Folder not found" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const getHowToPost = async () => {
  try {
    const posts = await axios.get(process.env.CLOUD_WAYS_POSTS as string);
    if (posts.data) {
      return {
        status: 200,
        data: {
          title: posts.data[0].title.rendered,
          content: posts.data[0].content.rendered,
        },
      };
    }
    return { status: 404 };
  } catch (error) {
    return { status: 400 };
  }
};

export const editVideoInfo = async (
  videoId: string,
  title: string,
  description: string
) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };
    // Use system client: Video RLS checks Member which would recurse
    const systemSupabase = await createSystemClient();
    const { error } = await systemSupabase
      .from("Video")
      .update({ title, description })
      .eq("id", videoId);

    if (!error) return { status: 200, data: "Video details updated" };
    return { status: 404, data: "Video not found" };
  } catch (error) {
    return { status: 400, data: "Failed to update video" };
  }
};

export const deleteVideo = async (videoId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const systemSupabase = await createSystemClient();
    const { data: dbUser } = await systemSupabase
      .from("User")
      .select("id")
      .eq("supabaseId", user.id)
      .single();

    if (!dbUser) return { status: 404, data: "User not found" };

    const { data: video } = await systemSupabase
      .from("Video")
      .select("source")
      .eq("id", videoId)
      .eq("userId", dbUser.id)
      .single();

    if (!video) return { status: 404, data: "Video not found or unauthorized" };

    const key = video.source.split("/").pop();
    if (!key) throw new Error("Could not parse storage key");

    const { error: dbError } = await systemSupabase
      .from("Video")
      .delete()
      .eq("id", videoId);

    if (dbError) throw dbError;

    const { error: storageError } = await supabase.storage
      .from("vintyl-videos")
      .remove([key]);

    if (storageError) {
      console.error("Supabase Storage Delete Error:", storageError);
    }

    return { status: 200, data: "Video removed permanently" };
  } catch (error) {
    console.error("Delete Error:", error);
    return { status: 500, data: "Internal error" };
  }
};