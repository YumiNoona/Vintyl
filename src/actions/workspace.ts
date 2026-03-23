"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma";
import axios from "axios";

export const verifyAccessToWorkspace = async (workspaceId: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 403 };

    const isUserInWorkspace = await client.workspace.findUnique({
      where: {
        id: workspaceId,
        OR: [
          {
            user: { clerkId: user.id },
          },
          {
            members: {
              every: {
                user: { clerkId: user.id },
              },
            },
          },
        ],
      },
    });

    return {
      status: 200,
      data: { workspace: isUserInWorkspace },
    };
  } catch (error) {
    return { status: 403, data: { workspace: null } };
  }
};

export const getWorkspaceFolders = async (workspaceId: string) => {
  try {
    const isFolders = await client.folder.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { videos: true },
        },
      },
    });

    if (isFolders && isFolders.length > 0) {
      return { status: 200, data: isFolders };
    }

    return { status: 404, data: [] };
  } catch (error) {
    return { status: 403, data: [] };
  }
};

export const getAllUserVideos = async (workspaceId: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404, data: [] };

    const videos = await client.video.findMany({
      where: {
        OR: [{ workspaceId }, { folderId: workspaceId }],
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        source: true,
        processing: true,
        folder: { select: { id: true, name: true } },
        user: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

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
    const user = await currentUser();
    if (!user) return { status: 404 };

    const workspaces = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        subscription: { select: { plan: true } },
        workspace: {
          select: { id: true, name: true, type: true },
        },
        members: {
          select: {
            workspace: {
              select: { id: true, name: true, type: true },
            },
          },
        },
      },
    });

    if (workspaces) {
      return { status: 200, data: workspaces };
    }

    return { status: 400 };
  } catch (error) {
    return { status: 400 };
  }
};

export const createWorkspace = async (name: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404 };

    const authorized = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { subscription: { select: { plan: true } } },
    });

    const isPro = authorized?.subscription?.plan === "PRO";
    const workspaceType = isPro ? "PUBLIC" : "PERSONAL";

    const workspace = await client.user.update({
      where: { clerkId: user.id },
      data: {
        workspace: {
          create: {
            name,
            type: workspaceType,
          },
        },
      },
    });

    if (workspace) {
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
    const isNewFolder = await client.workspace.update({
      where: { id: workspaceId },
      data: {
        folders: {
          create: { name: "Untitled" },
        },
      },
    });

    if (isNewFolder) {
      return { status: 200, message: "New folder created" };
    }

    return { status: 400, message: "Could not create folder" };
  } catch (error) {
    return { status: 500, message: "Internal error" };
  }
};

export const renameFolders = async (folderId: string, name: string) => {
  try {
    const folder = await client.folder.update({
      where: { id: folderId },
      data: { name },
    });

    if (folder) {
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
    const user = await currentUser();
    if (!user) return { status: 404 };

    const senderInfo = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, firstName: true, lastName: true },
    });

    if (senderInfo?.id) {
      const workspace = await client.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true },
      });

      if (workspace) {
        const invite = await client.invite.create({
          data: {
            senderId: senderInfo.id,
            receiverId,
            workspaceId,
            content: `You are invited to join ${workspace.name} workspace`,
          },
        });

        await client.user.update({
          where: { clerkId: user.id },
          data: {
            notifications: {
              create: {
                content: `${user.firstName} ${user.lastName} invited a member to ${workspace.name}`,
              },
            },
          },
        });

        if (invite) {
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
    const location = await client.video.update({
      where: { id: videoId },
      data: {
        folderId: folderId || null,
        workspaceId: workSpaceId,
      },
    });

    if (location) return { status: 200, data: "folder changed successfully" };

    return { status: 404, data: "workspace/folder not found" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const acceptInvite = async (inviteId: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 401 };

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser) return { status: 404, data: "User not found" };

    const invite = await client.invite.findUnique({
      where: { id: inviteId },
      include: { workspace: { select: { name: true } } },
    });

    if (!invite) return { status: 404, data: "Invite not found" };
    if (invite.accepted) return { status: 400, data: "Invite already accepted" };

    // Accept invite and add as member
    await client.$transaction([
      client.invite.update({
        where: { id: inviteId },
        data: { accepted: true },
      }),
      client.member.create({
        data: {
          userId: dbUser.id,
          workspaceId: invite.workspaceId,
        },
      }),
      client.notification.create({
        data: {
          userId: invite.senderId!,
          content: `${user.firstName} accepted the invite to ${invite.workspace.name}`,
        },
      }),
    ]);

    return { status: 200, data: "Invite accepted" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const getWorkspaceMembers = async (workspaceId: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 403 };

    const members = await client.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        members: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

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
    const user = await currentUser();
    if (!user) return { status: 403 };

    const folder = await client.folder.delete({
      where: {
        id: folderId,
      },
    });

    if (folder) {
      return { status: 200, data: "Folder deleted" };
    }

    return { status: 400, data: "Folder not found" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const renameWorkspace = async (workspaceId: string, name: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 403 };

    const workspace = await client.workspace.update({
      where: {
        id: workspaceId,
        user: { clerkId: user.id },
      },
      data: { name },
    });

    if (workspace) {
      return { status: 200, data: "Workspace renamed" };
    }

    return { status: 400, data: "Workspace not found" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 403 };

    const workspace = await client.workspace.delete({
      where: {
        id: workspaceId,
        user: { clerkId: user.id },
      },
    });

    if (workspace) {
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
  parentFolderId?: string | null
) => {
  try {
    const folder = await client.folder.update({
      where: { id: folderId },
      data: {
        workspaceId,
        // Assuming schema has parentFolderId for nesting, if not we ignore it
        ...(parentFolderId !== undefined && { parentFolderId }),
      },
    });

    if (folder) return { status: 200, data: "Folder moved successfully" };

    return { status: 404, data: "Folder not found" };
  } catch (error) {
    return { status: 500, data: "Internal error" };
  }
};

export const getHowToPost = async () => {
  try {
    const posts = await axios.get(process.env.CLOUD_WAYS_POSTS as string);
    if (posts.data) {
      // Return the first post as showcased in the transcript
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
    const video = await client.video.update({
      where: { id: videoId },
      data: {
        title,
        description,
      },
    });
    if (video) return { status: 200, data: "Video details updated" };
    return { status: 404, data: "Video not found" };
  } catch (error) {
    return { status: 400, data: "Failed to update video" };
  }
};
