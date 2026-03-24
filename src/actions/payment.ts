"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export const getSubscription = async () => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 401, data: null };

    const { data: dbUser } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("supabaseId", user.id)
      .single();

    if (!dbUser) return { status: 404, data: null };

    const { data: subscription } = await supabaseAdmin
      .from("Subscription")
      .select("*")
      .eq("userId", dbUser.id)
      .single();

    return { status: 200, data: subscription };
  } catch {
    return { status: 500, data: null };
  }
};

export const createCheckoutSession = async (plan: "PRO" | "TEAM") => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: 401, data: null };

    const { data: dbUser } = await supabaseAdmin
      .from("User")
      .select("id, email, Subscription(plan, customerId)")
      .eq("supabaseId", user.id)
      .single();

    if (!dbUser) return { status: 404, data: null };

    const subscription = (dbUser as any).Subscription;

    // If already subscribed to the same plan, return portal link
    if (subscription?.plan === plan && subscription?.customerId) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.customerId,
        return_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard`,
      });
      return { status: 200, data: portalSession.url };
    }

    const priceId =
      plan === "PRO"
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_TEAM_PRICE_ID;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId as string,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment?cancelled=true`,
      customer_email: user.email,
      metadata: {
        supabaseId: user.id,
        userId: (dbUser as any).id,
        plan: plan,
      },
    });

    return { status: 200, data: session.url };
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return { status: 500, data: null };
  }
};
