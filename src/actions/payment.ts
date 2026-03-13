"use server";

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

export const getSubscription = async () => {
  try {
    const user = await currentUser();
    if (!user) return { status: 401, data: null };

    const subscription = await client.subscription.findFirst({
      where: {
        user: { clerkId: user.id },
      },
    });

    return { status: 200, data: subscription };
  } catch {
    return { status: 500, data: null };
  }
};

export const createCheckoutSession = async () => {
  try {
    const user = await currentUser();
    if (!user) return { status: 401, data: null };

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      include: { subscription: true },
    });

    if (!dbUser) return { status: 404, data: null };

    // If already PRO, return portal link
    if (
      dbUser.subscription?.plan === "PRO" &&
      dbUser.subscription.customerId
    ) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.subscription.customerId,
        return_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard`,
      });
      return { status: 200, data: portalSession.url };
    }

    // Create checkout session for PRO plan
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID as string,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment?cancelled=true`,
      customer_email: user.emailAddresses[0]?.emailAddress,
      metadata: {
        clerkId: user.id,
        userId: dbUser.id,
      },
    });

    return { status: 200, data: session.url };
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return { status: 500, data: null };
  }
};
