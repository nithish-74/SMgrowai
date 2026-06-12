import { z } from "zod";
import Stripe from "stripe";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { requireUserId } from "@/server/lib/ownership";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(secretKey, { typescript: true });
}

export const billingRouter = createTRPCRouter({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const userId = requireUserId(ctx);

    let subscription = await ctx.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await ctx.prisma.subscription.create({
        data: {
          userId,
          plan: "free",
          status: "active",
        },
      });
    }

    return subscription;
  }),

  createCheckoutSession: protectedProcedure
    .input(z.object({ plan: z.enum(["starter", "pro"]) }))
    .mutation(async ({ ctx, input }) => {
      const userId = requireUserId(ctx);
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.email) throw new Error("User email not found");

      const subscription = await ctx.prisma.subscription.findUnique({
        where: { userId },
      });
      const priceId = process.env[`STRIPE_PRICE_ID_${input.plan.toUpperCase()}`];

      if (!priceId) {
        throw new Error(`Stripe price ID is not configured for ${input.plan}`);
      }

      const stripe = getStripeClient();

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancel=true`,
        metadata: {
          userId,
          plan: input.plan,
        },
      });

      if (subscription && !subscription.stripeCustomerId && session.customer) {
        await ctx.prisma.subscription.update({
          where: { userId },
          data: {
            stripeCustomerId:
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id,
          },
        });
      }

      return { url: session.url };
    }),
});
