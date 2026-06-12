export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanKey } from "@/lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  typescript: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed.`, err);
      return new NextResponse(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`, {
        status: 400,
      });
    }

    console.log(`🔔  Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as PlanKey;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (!userId) {
          console.error("No userId in session metadata");
          return new NextResponse(null, { status: 200 });
        }

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: customerId,
            stripePriceId: session.line_items?.data[0].price?.id,
            stripeSubscriptionId: subscriptionId,
            plan: plan || "starter",
            status: "active",
            currentPeriodEnd: null,
          },
          update: {
            stripeCustomerId: customerId,
            stripePriceId: session.line_items?.data[0].price?.id,
            stripeSubscriptionId: subscriptionId,
            plan: plan || "starter",
            status: "active",
          },
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        let plan: PlanKey = "free";
        if (priceId === process.env.STRIPE_PRICE_ID_STARTER) plan = "starter";
        else if (priceId === process.env.STRIPE_PRICE_ID_PRO) plan = "pro";

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan,
            status: subscription.status === "past_due" ? "past_due" : "active",
            currentPeriodEnd: null,
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: "free",
            status: "canceled",
          },
        });
        break;
      }
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in Stripe webhook:", error);
    return new NextResponse(null, { status: 500 });
  }
}
