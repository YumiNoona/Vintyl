import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { client } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const clerkId = session.metadata?.clerkId;
        const customerId = session.customer as string;
        const plan = (session.metadata?.plan as "PRO" | "TEAM") || "PRO";

        if (clerkId) {
          await client.user.update({
            where: { clerkId },
            data: {
              subscription: {
                upsert: {
                  create: {
                    customerId,
                    plan: plan,
                  },
                  update: {
                    customerId,
                    plan: plan,
                  },
                },
              },
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        await client.subscription.updateMany({
          where: { customerId },
          data: { plan: "FREE" },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        const priceId = subscription.items.data[0].price.id;
        let plan: "PRO" | "TEAM" | "FREE" = "FREE";

        if (isActive) {
          if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
            plan = "TEAM";
          } else {
            plan = "PRO";
          }
        }

        await client.subscription.updateMany({
          where: { customerId },
          data: { plan },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
