import { prisma } from "@/lib/prisma";

export async function recordPostPerformance(
  generatedPostId: string,
  delayHours: 24 | 72 = 24
) {
  // First, get the generated post to find platform and user
  const generatedPost = await prisma.generatedPost.findUnique({
    where: { id: generatedPostId },
    include: { user: { include: { oauthTokens: true } } },
  });

  if (!generatedPost) {
    throw new Error(`GeneratedPost not found: ${generatedPostId}`);
  }

  // TODO: Fetch actual metrics from Instagram/Twitter APIs using user's OAuth tokens
  // For now, we'll use placeholder data to demonstrate the flow

  // In production, you'd fetch:
  // - Instagram: GET /media/:id?fields=like_count,comments_count,saved,reach
  // - Twitter: GET /tweets/:id?tweet.fields=public_metrics

  // For demo purposes, let's calculate a fake engagement rate
  const likes = Math.floor(Math.random() * 500);
  const comments = Math.floor(Math.random() * 50);
  const shares = Math.floor(Math.random() * 30);
  const saves = Math.floor(Math.random() * 100);
  const reach = Math.floor(Math.random() * 5000);

  // Calculate engagement rate: (likes + comments + shares + saves) / reach * 100
  const engagementRate = reach > 0 ? (likes + comments + shares + saves) / reach : 0;

  const measuredAt = new Date();
  measuredAt.setHours(measuredAt.getHours() + delayHours);

  return prisma.postMetrics.create({
    data: {
      generatedPostId,
      platform: "instagram", // We'd determine this from the actual post data
      likes,
      comments,
      shares,
      saves,
      reach,
      engagementRate,
      measuredAt,
    },
  });
}

export async function getCMOContext(userId: string): Promise<string> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get active CMO instructions
  const activeInstructions = await prisma.cMOInstruction.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: "desc" },
  });

  // Get all posts from last 30 days with metrics
  const posts = await prisma.generatedPost.findMany({
    where: {
      userId,
      status: "posted",
      postedAt: { gte: thirtyDaysAgo },
    },
    include: { postMetrics: true },
  });

  let performanceContext = "";
  if (posts.length === 0) {
    performanceContext = "No performance data available yet. This is the first strategy for this brand.";
  } else {
    // Find best and worst performing posts
    const postsWithMetrics = posts.filter((p) => p.postMetrics.length > 0);

    if (postsWithMetrics.length === 0) {
      performanceContext = `${posts.length} posts published in last 30 days. No performance metrics available yet.`;
    } else {
      const sortedByER = [...postsWithMetrics].sort((a, b) => {
        const aER = a.postMetrics[0]?.engagementRate ?? 0;
        const bER = b.postMetrics[0]?.engagementRate ?? 0;
        return bER - aER;
      });

      const bestPost = sortedByER[0];
      const worstPost = sortedByER[sortedByER.length - 1];

      // Calculate platform performance
      const instagramPosts = postsWithMetrics.filter(
        (p) => p.postMetrics[0]?.platform === "instagram"
      );
      const twitterPosts = postsWithMetrics.filter(
        (p) => p.postMetrics[0]?.platform === "twitter"
      );

      const avgInstagramER =
        instagramPosts.length > 0
          ? instagramPosts.reduce(
              (sum, p) => sum + (p.postMetrics[0]?.engagementRate ?? 0),
              0
            ) / instagramPosts.length
          : 0;
      const avgTwitterER =
        twitterPosts.length > 0
          ? twitterPosts.reduce(
              (sum, p) => sum + (p.postMetrics[0]?.engagementRate ?? 0),
              0
            ) / twitterPosts.length
          : 0;

      let platformInsight = "";
      if (avgInstagramER > 0 && avgTwitterER > 0) {
        const ratio = avgInstagramER / avgTwitterER;
        if (ratio > 1.5) {
          platformInsight = `Instagram outperforms Twitter by ${ratio.toFixed(1)}x for this brand.`;
        } else if (ratio < 0.66) {
          platformInsight = `Twitter outperforms Instagram by ${(1 / ratio).toFixed(1)}x for this brand.`;
        } else {
          platformInsight = "Both platforms perform similarly for this brand.";
        }
      }

      const bestPostMetrics = bestPost.postMetrics[0];
      const worstPostMetrics = worstPost.postMetrics[0];

      performanceContext = `Last 30 days: ${posts.length} posts. Best performing: ${bestPostMetrics?.platform} ${
        // In a real app, we'd track content type on GeneratedPost
        "post"
      } (${(bestPostMetrics?.engagementRate * 100).toFixed(1)}% ER). Worst: ${
        worstPostMetrics?.platform
      } ${
        // In a real app, we'd track content type on GeneratedPost
        "post"
      } (${(worstPostMetrics?.engagementRate * 100).toFixed(1)}% ER). ${platformInsight}`;
    }
  }

  // Combine performance context with instructions
  const parts = [performanceContext];
  if (activeInstructions.length > 0) {
    parts.push(`Standing instructions from the brand: ${activeInstructions.map(i => `- ${i.instruction}`).join(' ')}`);
  }

  return parts.join(' ');
}
