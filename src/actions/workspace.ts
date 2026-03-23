"use server";

import { createClient } from "@/lib/supabase/server";
import axios from "axios";

export const verifyAccessToWorkspace = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const { data: workspace } = await supabase
      .from("Workspace")
      .select("*, Member(*)")
      .eq("id", workspaceId)
      .or(`userId.eq.${user.id},Member.userId.eq.${user.id}`)
      .single();

    if (!workspace) return { status: 403 };

    return {
      status: 200,
      data: { workspace },
    };
  } catch (error) {
    return { status: 403, data: { workspace: null } };
  }
};

export const getWorkspaceFolders = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: folders } = await supabase
      .from("Folder")
      .select("*, Video(count)")
      .eq("workspaceId", workspaceId);

    if (folders && folders.length > 0) {
      return { status: 200, data: folders };
    }

    return { status: 404, data: [] };
  } catch (error) {
    return { status: 403, data: [] };
  }
};

export const getAllUserVideos = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 404, data: [] };

    const { data: videos } = await supabase
      .from("Video")
      .select("*, Folder(id, name), User(firstName, lastName, image)")
      .or(`workspaceId.eq.${workspaceId},folderId.eq.${workspaceId}`)
      .order("createdAt", { ascending: true });

    if (videos && videos.length > 0) {
      return { status: 200, data: videos };
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
        const flattenedWorkspaces = [
            ...(userData.workspace || []),
            ...(userData.Member?.map((m: any) => m.workspace).filter(Boolean) || [])
        ];
      return { status: 200, data: { ...userData, workspace: flattenedWorkspaces } };
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

    const { data: authorized } = await supabase
      .from("Subscription")
      .select("plan")
      .eq("userId", user.id)
      .single();

    const isPro = authorized?.plan === "PRO";
    const workspaceType = isPro ? "PUBLIC" : "PERSONAL";

    const { data: workspace, error } = await supabase
      .from("Workspace")
      .insert({
        name,
        type: workspaceType,
        userId: user.id
      })
      .select()
      .single();

    if (workspace && !error) {
      return { 
        status: 201, 
        data: `Workspace created as ${workspaceType.toLowerCase()}` 
      };
    }

    return { status: 400, data: "Failed to create workspace" };
  } catch (error) {
    return { status: 400, data: "Internal error" };
  }
};

export const createFolder = async (workspaceId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: folder, error } = await supabase
      .from("Folder")
      .insert({ workspaceId, userId: user?.id, name: "Untitled" })
      .select()
      .single();

    if (folder && !error) {
      return { status: 200, message: "New folder created" };
    }

    return { status: 400, message: "Could not create folder" };
  } catch (error) {
    return { status: 500, message: "Internal error" };
  }
};

export const renameFolders = async (folderId: string, name: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
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
        const { error: inviteError } = await supabase
          .from("Invite")
          .insert({
            senderId: senderInfo.id,
            receiverId,
            workspaceId,
            email,
            content: `You are invited to join ${workspace.name} workspace`,
          });

        await supabase.from("Notification").insert({
          userId: receiverId,
          content: `${senderInfo.firstName} ${senderInfo.lastName} invited you to ${workspace.name}`,
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
    const { error } = await supabase
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const { data: members } = await supabase
      .from("Workspace")
      .select("user:User(id, firstName, lastName, email, image), members:Member(user:User(id, firstName, lastName, email, image))")
      .eq("id", workspaceId)
      .single();

    if (!members) return { status: 404 };

    return {
      status: 200,
      data: members,
    };
  } catch (error) {
    return { status: 400 };
  }
};

export const deleteFolder = async (folderId: string) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const { error } = await supabase
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 403 };

    const { error } = await supabase
      .from("Workspace")
      .update({ name })
      .eq("id", workspaceId)
      .eq("userId", user.id);

    if (!error) {
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

    const { error } = await supabase
      .from("Workspace")
      .delete()
      .eq("id", workspaceId)
      .eq("userId", user.id);

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
    const { error } = await supabase
      .from("Folder")
      .update({
        workspaceId,
      })
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
    const { error } = await supabase
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

    const { data: video } = await supabase
      .from("Video")
      .select("source")
      .eq("id", videoId)
      .eq("userId", user.id)
      .single();

    if (!video) return { status: 404, data: "Video not found or unauthorized" };

    const key = video.source.split("/").pop();
    if (!key) throw new Error("Could not parse storage key");

    const { error: dbError } = await supabase
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
