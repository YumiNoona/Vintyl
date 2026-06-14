"use server";

import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";

export const getSubscription = async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 401, data: null };

    const db = getDb();
    const subscription = db.prepare('SELECT * FROM "Subscription" WHERE userId = ?').get(user.id) as any;

    if (!subscription) {
      return { status: 200, data: { plan: 'ENTERPRISE' } };
    }

    return { status: 200, data: subscription };
  } catch {
    return { status: 500, data: null };
  }
};

export const createCheckoutSession = async (_plan: "PRO" | "TEAM") => {
  return { status: 200, data: null };
};
