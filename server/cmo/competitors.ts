import { prisma } from "@/lib/prisma";
import { callLlm } from "@/lib/llm";
import { checkLimit } from "@/lib/check-limits";

export async function scanCompetitors(userId: string) {
  const brand = await prisma.brand.findUnique({
    where: { userId },
  });

  if (!brand) {
    throw new Error("Brand not found for user");
  }

  const competitors = brand.competitors || [];

  for (const competitorDomain of competitors) {
    // Derive Twitter handle from domain (remove TLD, e.g., example.com -> example)
    const handle = competitorDomain.split(".")[0];

    // For this example, we'll create placeholder CompetitorPost entries
    // In a real implementation, you'd use Twitter API here!
    const placeholderPosts = [];
    for (let i = 0; i < 5; i++) {
      placeholderPosts.push({
        userId,
        competitorDomain,
        platform: "twitter" as const,
        postUrl: `https://twitter.com/${handle}/status/${Date.now() + i}`,
        caption: `Check out our new ${competitorDomain} product! #${handle} #marketing`,
        engagementRate: Math.random() * 10,
        postedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      });
    }

    // Upsert placeholder posts
    for (const postData of placeholderPosts) {
      await prisma.competitorPost.create({
        data: postData,
      });
    }
  }
}

export async function analyseCompetitorPosts(userId: string): Promise<string> {
  const competitorPosts = await prisma.competitorPost.findMany({
    where: { userId },
    orderBy: { postedAt: "desc" },
    take: 10,
  });

  if (competitorPosts.length === 0) {
    return "No competitor posts available to analyse yet.";
  }

  const systemPrompt =
    "You are a senior CMO analysing competitor content. Identify: what topics they're pushing, what's getting engagement, any gaps we could exploit. Return 3 bullet insights max. Keep it concise and actionable.";
  const userPrompt = `Here are the competitor posts from the last week:\n\n${competitorPosts
    .map(
      (post, i) =>
        `${i + 1}. [${post.platform}] ${
          post.caption
        }\nEngagement rate: ${post.engagementRate.toFixed(1)}%\nPosted: ${post.postedAt.toISOString()}`
    )
    .join("\n\n")}`;

  const analysis = await callLlm(systemPrompt, userPrompt);
  return analysis;
}
