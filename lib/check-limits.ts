import { prisma } from "./prisma";
import { getPlanLimits } from "./plans";

export type Action = "create_post" | "add_competitor" | "send_digest";

export async function checkLimit(
  userId: string,
  action: Action
): Promise<{ allowed: boolean; message?: string }> {
  let subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        userId,
        plan: "free",
        status: "active",
      },
    });
  }

  const limits = getPlanLimits(subscription.plan);

  if (action === "create_post") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const postsThisMonth = await prisma.generatedPost.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    if (postsThisMonth >= limits.postsPerMonth) {
      return {
        allowed: false,
        message: `You've used all ${limits.postsPerMonth} posts this month. Upgrade to create more!`,
      };
    }
  }

  if (action === "add_competitor") {
    const brand = await prisma.brand.findUnique({
      where: { userId },
      select: { competitors: true },
    });
    if (brand && brand.competitors.length >= limits.competitors) {
      return {
        allowed: false,
        message: `You can only track ${limits.competitors} competitors on this plan. Upgrade to track more!`,
      };
    }
  }

  if (action === "send_digest") {
    if (!limits.digest) {
      return {
        allowed: false,
        message: `Daily digest is only available on paid plans. Upgrade to get your daily CMO briefing!`,
      };
    }
  }

  return { allowed: true };
}
