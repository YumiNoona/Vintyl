"use server";

import { createClient, createSystemClient } from "@/lib/supabase/server";
import { getSubscription } from "./payment";
import { cache } from "react";

export const onAuthenticatedUser = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log("⚠️ onAuthenticatedUser: No user session found");
      return { status: 403 };
    }

    console.log("👤 onAuthenticatedUser: Session found for", user.email);

    // Use SYSTEM CLIENT to bypass RLS for user lookup/sync
    const systemSupabase = await createSystemClient();

    // Fetch from our public.User table
    const { data: userExists, error: dbError } = await systemSupabase
      .from("User")
      .select("*, workspace:Workspace(*), subscription:Subscription(plan)")
      .eq("supabaseId", user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error("❌ onAuthenticatedUser: DB Lookup Error:", dbError.message);
    }

    if (userExists) {
      console.log("✅ onAuthenticatedUser: User record found in DB");
      if (!userExists.subscription) {
        console.log("🔄 Triggering Stripe sync fallback via getSubscription()...");
        await getSubscription();
      }
      return { status: 200, user: userExists };
    }

    console.log("❓ onAuthenticatedUser: No record in public.User table. Attempting manual sync fallback with system client.");
    // Manual sync fallback: Create the user using system client to bypass RLS
    // We also ensure Workspace and Subscription exist to prevent dashboard crashes
    const { data: newUser, error: createError } = await systemSupabase
      .from("User")
      .insert({
        supabaseId: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        image: user.user_metadata?.avatar_url || ""
      })
      .select("*, workspace:Workspace(*), subscription:Subscription(plan)")
      .single();

    if (newUser && !createError) {
      console.log("✅ onAuthenticatedUser: Manually created user record (Bypassed RLS)");
      
      // Ensure Subscription exists (Idempotent)
      await systemSupabase.from("Subscription").upsert({ userId: newUser.id, plan: 'FREE' }, { onConflict: 'userId' });
      
      // Ensure Workspace exists (Idempotent-ish via select fallback)
      let wsId: string | undefined;
      const { data: existingWS } = await systemSupabase.from("Workspace").select("id").eq("userId", newUser.id).limit(1).single();
      
      if (existingWS) {
        wsId = existingWS.id;
      } else {
        const { data: newWS } = await systemSupabase.from("Workspace").insert({ userId: newUser.id, name: 'Personal Workspace', type: 'PERSONAL' }).select().single();
        wsId = newWS?.id;
      }
      
      if (wsId) {
        // Ensure Membership exists (Idempotent)
        await systemSupabase.from("Member").upsert({ userId: newUser.id, workspaceId: wsId, supabaseId: user.id }, { onConflict: 'userId, workspaceId' });
        
        // Return enriched user
        const { data: enrichedUser, error: enrichError } = await systemSupabase
          .from("User")
          .select("*, workspace:Workspace(*), subscription:Subscription(plan)")
          .eq("id", newUser.id)
          .single();
          
        if (enrichedUser && !enrichError) {
            console.log("✅ onAuthenticatedUser: Successfully enriched fallback record with workspace.");
            return { status: 201, user: enrichedUser };
        }

        // Final fallback if enrichment failed
        return { 
            status: 201, 
            user: { 
                ...newUser, 
                workspace: wsId ? [{ id: wsId, name: 'Personal Workspace', type: 'PERSONAL' }] : [],
                subscription: { plan: 'FREE' }
            } 
        };
      }

      return { status: 201, user: newUser };
    }

    if (createError) {
      console.error("❌ onAuthenticatedUser: Manual creation failed even with system client:", createError.message);
    }

    return { status: 404 };
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('dynamic-server-error')) {
      throw error;
    }
    console.error("❌ AUTH ERROR in onAuthenticatedUser:", error);
    return { status: 500 };
  }
});

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
      const flattenedUsers = users.map((u: any) => ({
        ...u,
        subscription: u.Subscription?.[0] || null,
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

    const { data: userProfile } = await supabase
      .from("User")
      .select("id, image, firstName, lastName, email")
      .eq("supabaseId", user.id)
      .single();

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

    // Update public.User table (Wait for this before returning)
    const { error } = await supabase
      .from("User")
      .update({ firstName, lastName, image })
      .eq("supabaseId", user.id);

    if (error) {
      console.error("❌ updateUserProfile DB Error:", error.message);
      return { status: 400, data: "Could not update profile table" };
    }

    // Update Auth Metadata as well for session consistency
    const updateData: any = { first_name: firstName, last_name: lastName };
    if (image) updateData.avatar_url = image;
    
    await supabase.auth.updateUser({ data: updateData });

    return { status: 200, data: "Profile updated successfully" };
  } catch (error) {
    console.error("❌ updateUserProfile Catch:", error);
    return { status: 500, data: "Internal error" };
  }
};
