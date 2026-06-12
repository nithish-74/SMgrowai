import { prisma } from "@/lib/prisma";
import { callLlm } from "@/lib/llm";

type DigestData = {
  subject: string;
  html: string;
};

export async function buildDailyDigest(userId: string): Promise<DigestData> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = dayNames[today.getDay()];
  const dateString = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const brand = await prisma.brand.findUnique({
    where: { userId },
  });
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!brand || !user?.email) {
    throw new Error("Brand or user email not found");
  }

  // Get today's scheduled posts
  const todayPosts = await prisma.plannedPost.findMany({
    where: {
      userId,
      scheduledDay: todayName.toLowerCase() as any,
      status: { notIn: ["skipped", "posted"] },
    },
  });

  // Get yesterday's post metrics
  const yesterdayPosts = await prisma.postMetrics.findMany({
    where: {
      generatedPost: { userId },
      createdAt: {
        gte: new Date(yesterday.setHours(0, 0, 0, 0)),
        lte: new Date(today.setHours(0, 0, 0, 0)),
      },
    },
    include: { generatedPost: true },
  });

  // Get competitor insight
  const competitorPosts = await prisma.competitorPost.findMany({
    where: {
      userId,
      postedAt: {
        gte: new Date(yesterday.setHours(0, 0, 0, 0)),
      },
    },
    orderBy: { engagementRate: "desc" },
    take: 1,
  });

  // Generate suggested action via Claude
  const suggestedActionPrompt = `You are a senior CMO. Given the following context, suggest one specific, actionable thing the brand should consider doing today. Keep it concise (1-2 sentences).

Brand: ${brand.name}
Top competitor post: ${
    competitorPosts.length > 0
      ? `${competitorPosts[0].platform}: ${competitorPosts[0].caption}`
      : "No competitor posts available"
  }`;

  const suggestedAction = await callLlm(
    "You are a senior CMO, providing one specific, actionable daily suggestion.",
    suggestedActionPrompt
  );

  const subject = `Your CMO briefing — ${todayName}, ${dateString}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .header {
          background: #7c3aed;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .section {
          margin: 20px 0;
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .section-title {
          font-weight: bold;
          color: #7c3aed;
          margin-bottom: 10px;
        }
        .post-item {
          margin: 8px 0;
          padding: 8px;
          background: white;
          border-radius: 4px;
        }
        .insight-box {
          background: #ede9fe;
          border-left: 4px solid #7c3aed;
          padding: 12px;
          border-radius: 0 4px 4px 0;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Your CMO Briefing</h1>
        <p>${todayName}, ${dateString}</p>
      </div>

      <div class="section">
        <div class="section-title">What's scheduled today</div>
        ${
          todayPosts.length > 0
            ? todayPosts
                .map(
                  (post) => `
              <div class="post-item">
                <strong>${post.platform}</strong> — ${post.contentType} — ${post.topic}
              </div>
            `
                )
                .join("")
            : `
              <div class="post-item">No posts scheduled for today.</div>
            `
        }
      </div>

      <div class="section">
        <div class="section-title">Yesterday's performance</div>
        ${
          yesterdayPosts.length > 0
            ? yesterdayPosts
                .map(
                  (metric) => `
              <div class="post-item">
                ${metric.generatedPost.platform} — 
                Engagement: ${(metric.engagementRate * 100).toFixed(1)}% —
                Likes: ${metric.likes} — Comments: ${metric.comments}
              </div>
            `
                )
                .join("")
            : `
              <div class="post-item">No performance data from yesterday.</div>
            `
        }
      </div>

      <div class="section">
        <div class="section-title">Competitor insight</div>
        ${
          competitorPosts.length > 0
            ? `
              <div class="insight-box">
                ${(competitorPosts[0] as any).competitorDomain} posted something that got ${(
                (competitorPosts[0] as any).engagementRate * 100
              ).toFixed(1)}% engagement: "${
                (competitorPosts[0] as any).caption?.slice(0, 150)
              }${(competitorPosts[0] as any).caption?.length > 150 ? "..." : ""}"
              </div>
            `
            : `
              <div class="post-item">No new competitor posts to analyze.</div>
            `
        }
      </div>

      <div class="section">
        <div class="section-title">Suggested action</div>
        <div class="insight-box">${suggestedAction}</div>
      </div>

      <div style="text-align: center; color: #666; margin-top: 30px; font-size: 12px;">
        You're receiving this because you have daily CMO briefings enabled for ${brand.name}.
      </div>
    </body>
    </html>
  `;

  return {
    subject,
    html,
  };
}
