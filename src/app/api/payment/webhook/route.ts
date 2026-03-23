import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
        const session = event.data.object as any;
        const supabaseId = session.metadata?.supabaseId;
        const customerId = session.customer as string;
        
        let plan: any = session.metadata?.plan;
        
        if (!plan) {
           const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
           const priceId = lineItems.data[0]?.price?.id;
           if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) plan = "STANDARD";
           else if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "PRO";
           else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) plan = "TEAM";
           else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) plan = "ENTERPRISE";
        }

        if (supabaseId) {
            // Get user id first
            const { data: user } = await supabaseAdmin
                .from("User")
                .select("id")
                .eq("supabaseId", supabaseId)
                .single();

            if (user) {
                await supabaseAdmin.from("Subscription").upsert({
                    userId: user.id,
                    customerId,
                    plan: plan || "PRO",
                });
            }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        await supabaseAdmin
            .from("Subscription")
            .update({ plan: "FREE" })
            .eq("customerId", customerId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        const priceId = subscription.items.data[0].price.id;
        let plan: any = "FREE";

        if (isActive) {
          if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) {
            plan = "STANDARD";
          } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            plan = "PRO";
          } else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
            plan = "TEAM";
          } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
            plan = "ENTERPRISE";
          }
        }

        await supabaseAdmin
            .from("Subscription")
            .update({ plan })
            .eq("customerId", customerId);
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
