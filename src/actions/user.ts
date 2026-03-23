"use server";

import { createClient } from "@/lib/supabase/server";

export const onAuthenticatedUser = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { status: 403 };

    // Fetch from our public.User table
    const { data: userExists } = await supabase
      .from("User")
      .select("*, workspace:Workspace(*), subscription:Subscription(plan)")
      .eq("supabaseId", user.id)
      .single();

    if (userExists) {
      return { status: 200, user: userExists };
    }

    // Fallback: If for some reason the trigger didn't create the user yet, 
    // or we need to wait for it. In production, the trigger is very fast.
    return { status: 404 };
  } catch (error) {
    console.error("❌ AUTH ERROR:", error);
    return { status: 500 };
  }
};

export const getNotifications = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 404, data: [] };

    const { data: notifications } = await supabase
      .from("User")
      .select("Notification(*)")
      .eq("supabaseId", user.id)
      .single();

    if (notifications && (notifications as any).Notification.length > 0) {
      return { 
        status: 200, 
        data: { 
            notifications: (notifications as any).Notification,
            _count: { notifications: (notifications as any).Notification.length }
        } 
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

    const { data: users } = await supabase
      .from("User")
      .select("id, Subscription(plan), firstName, lastName, image, email")
      .or(`firstName.ilike.%${query}%,lastName.ilike.%${query}%,email.ilike.%${query}%`)
      .not("supabaseId", "eq", user.id);

    if (users && users.length > 0) {
        // Map to match previous Prisma structure if needed
      return { status: 200, data: users };
    }

    return { status: 404, data: undefined };
  } catch (error) {
    return { status: 500, data: undefined };
  }
};
