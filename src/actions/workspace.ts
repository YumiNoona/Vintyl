"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma";

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

    if (authorized?.subscription?.plan === "PRO") {
      const workspace = await client.user.update({
        where: { clerkId: user.id },
        data: {
          workspace: {
            create: {
              name,
              type: "PUBLIC",
            },
          },
        },
      });

      if (workspace) {
        return { status: 201, data: "Workspace created" };
      }
    }

    return {
      status: 401,
      data: "You are not authorized to create a workspace",
    };
  } catch (error) {
    return { status: 400 };
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
