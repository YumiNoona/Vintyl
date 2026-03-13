"use server";

import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma";

export const onAuthenticatedUser = async () => {
  try {
    console.log("🔐 AUTH START");

    const user = await currentUser();
    console.log("👤 CLERK USER:", user?.id, user?.emailAddresses?.[0]?.emailAddress);

    if (!user) {
      console.log("❌ No Clerk user found");
      return { status: 403 };
    }

    const userExists = await client.user.findUnique({
      where: { clerkId: user.id },
      include: {
        workspace: true,
        subscription: {
          select: { plan: true },
        },
      },
    });

    console.log("🔍 EXISTING USER:", userExists?.id || "NOT FOUND");

    if (userExists) {
      return { status: 200, user: userExists };
    }

    console.log("🆕 Creating new user...");

    const newUser = await client.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        image: user.imageUrl,
        studio: { create: {} },
        subscription: { create: {} },
        workspace: {
          create: {
            name: `${user.firstName || "My"}'s Workspace`,
            type: "PERSONAL",
          },
        },
      },
      include: {
        workspace: true,
        subscription: {
          select: { plan: true },
        },
      },
    });

    console.log("✅ NEW USER CREATED:", newUser.id);
    console.log("📁 WORKSPACE:", newUser.workspace?.[0]?.id);

    if (newUser) {
      return { status: 201, user: newUser };
    }

    return { status: 400 };
  } catch (error) {
    console.error("❌ AUTH ERROR:", error);
    return { status: 500 };
  }
};

export const getNotifications = async () => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404, data: [] };

    const notifications = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        notifications: true,
        _count: {
          select: { notifications: true },
        },
      },
    });

    if (notifications && notifications.notifications.length > 0) {
      return { status: 200, data: notifications };
    }

    return { status: 404, data: [] };
  } catch (error) {
    return { status: 400, data: [] };
  }
};

export const searchUsers = async (query: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404, data: undefined };

    const users = await client.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } },
        ],
        NOT: [{ clerkId: user.id }],
      },
      select: {
        id: true,
        subscription: { select: { plan: true } },
        firstName: true,
        lastName: true,
        image: true,
        email: true,
      },
    });

    if (users && users.length > 0) {
      return { status: 200, data: users };
    }

    return { status: 404, data: undefined };
  } catch (error) {
    return { status: 500, data: undefined };
  }
};
