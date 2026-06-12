import { prisma } from "@/lib/prisma";
import { callLlmJson } from "@/lib/llm";
import { getCMOContext } from "./memory";
import { scanCompetitors, analyseCompetitorPosts } from "./competitors";

export type WeeklyStrategy = {
  weekOf: string;
  summary: string;
  posts: Array<{
    platform: "instagram" | "twitter";
    contentType: "carousel" | "reel" | "thread" | "single";
    topic: string;
    angle: string;
    reasoning: string;
    scheduledDay:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";
    priority: "high" | "medium" | "low";
  }>;
};

export async function generateWeeklyStrategy(
  userId: string
): Promise<WeeklyStrategy> {
  await scanCompetitors(userId);
  
  const brand = await prisma.brand.findUnique({
    where: { userId },
  });

  if (!brand) {
    throw new Error("Brand not found for user");
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const topScannedPosts = await prisma.scannedPost.findMany({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { engagementRate: "desc" },
    take: 10,
  });

  const lastPostedPosts = await prisma.generatedPost.findMany({
    where: {
      userId,
      status: "posted",
    },
    orderBy: { postedAt: "desc" },
    take: 5,
  });

  const systemPrompt = `You are a senior Chief Marketing Officer (CMO) with decades of experience building social media strategies for consumer brands.

Your role:
1. Analyse the brand's voice, audience, and goals
2. Study what content is currently winning in the space (from scanned posts)
3. Review the brand's recent posted content performance
4. Create a structured weekly content plan that will drive engagement and grow the brand

You will be given:
- Brand details (voice, audience, goals)
- Top 10 scanned posts from last 7 days ordered by engagement
- Last 5 posted content pieces
- Competitor analysis

Return ONLY a JSON object with this structure (no markdown, no extra text):
{
  "weekOf": "ISO date string (start of week, e.g., 2024-01-01T00:00:00.000Z",
  "summary": "2-3 sentence explanation of the strategy in CMO voice",
  "posts": [
    {
      "platform": "instagram" | "twitter",
      "contentType": "carousel" | "reel" | "thread" | "single",
      "topic": "what the post is about",
      "angle": "the specific hook/approach",
      "reasoning": "why this will work for the audience",
      "scheduledDay": "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
      "priority": "high" | "medium" | "low"
    }
  ]
}`;

  const cmoContext = await getCMOContext(userId);
  const competitorAnalysis = await analyseCompetitorPosts(userId);

  const userMessage = `${cmoContext}

Competitor Analysis:
${competitorAnalysis}

Brand:
Name: ${brand.name}
Website: ${brand.website || "N/A"}
Industry: ${brand.industry || "N/A"}
Brand Voice: ${brand.brandVoice}
Target Audience: ${brand.targetAudience}
Goals: ${brand.goals.join(", ")}
Content Pillars: ${brand.contentPillars.join(", ")}
Competitors: ${brand.competitors.join(", ")}
Avoid Topics: ${brand.avoidTopics.join(", ")}

Top 10 Scanned Posts (last 7 days):
${topScannedPosts
  .map(
    (post, i) =>
      `${i + 1}. [${post.provider}] Likes: ${post.likes}, Comments: ${
        post.comments
      }, Shares: ${post.shares}, Engagement Rate: ${post.engagementRate.toFixed(
        2
      )}
   Caption: ${post.caption?.slice(0, 200) || "No caption"}`
  )
  .join("\n\n")}

Last 5 Posted Posts:
${lastPostedPosts
  .map(
    (post, i) =>
      `${i + 1}. Posted at: ${post.postedAt?.toISOString() || "N/A"}
   Caption: ${post.caption.slice(0, 200)}`
  )
  .join("\n\n")}

Generate the weekly strategy.`;

  const strategy = await callLlmJson<WeeklyStrategy>(
    systemPrompt,
    userMessage,
    "weekly-strategy"
  );

  const weekOfDate = new Date(strategy.weekOf);

  await prisma.$transaction(async (tx) => {
    const weeklyPlan = await tx.weeklyPlan.upsert({
      where: {
        userId_weekOf: {
          userId,
          weekOf: weekOfDate,
        },
      },
      create: {
        userId,
        brandId: brand.id,
        weekOf: weekOfDate,
        summary: strategy.summary,
        status: "active",
      },
      update: {
        brandId: brand.id,
        summary: strategy.summary,
        status: "active",
      },
    });

    await tx.plannedPost.deleteMany({
      where: { weeklyPlanId: weeklyPlan.id },
    });

    await tx.plannedPost.createMany({
      data: strategy.posts.map((post) => ({
        weeklyPlanId: weeklyPlan.id,
        userId,
        platform: post.platform as any,
        contentType: post.contentType,
        topic: post.topic,
        angle: post.angle,
        reasoning: post.reasoning,
        scheduledDay: post.scheduledDay,
        priority: post.priority,
        status: "planned",
      })),
    });
  });

  return strategy;
}
