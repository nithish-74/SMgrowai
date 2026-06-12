import type { OAuthProvider } from "@prisma/client";
import { Worker, type Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { getValidOAuthToken } from "@/lib/oauth/tokens";
import { fetchInstagramPosts } from "@/lib/social/scan-instagram";
import { fetchTwitterPosts } from "@/lib/social/scan-twitter";
import { getRedisConnection } from "@/lib/redis";
import { addGenerateJob } from "@/server/queues/generate.queue";
import {
  SCAN_CONCURRENCY,
  SCAN_QUEUE_NAME,
  type ScanJobData,
} from "@/server/queues/scan.queue";

type ScannedPostInput = {
  postId: string;
  caption: string | null;
  mediaUrl: string | null;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
};

async function upsertScannedPosts(
  userId: string,
  provider: OAuthProvider,
  posts: ScannedPostInput[]
) {
  for (const post of posts) {
    await prisma.scannedPost.upsert({
      where: {
        userId_provider_postId: {
          userId,
          provider,
          postId: post.postId,
        },
      },
      create: {
        userId,
        provider,
        postId: post.postId,
        caption: post.caption,
        mediaUrl: post.mediaUrl,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        engagementRate: post.engagementRate,
      },
      update: {
        caption: post.caption,
        mediaUrl: post.mediaUrl,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        engagementRate: post.engagementRate,
      },
    });
  }
}

async function scanInstagram(userId: string) {
  const token = await getValidOAuthToken(userId, "instagram");
  const posts = await fetchInstagramPosts(token.accessToken);
  await upsertScannedPosts(userId, "instagram", posts);
  return posts.length;
}

async function scanTwitter(userId: string) {
  const token = await getValidOAuthToken(userId, "twitter");
  const posts = await fetchTwitterPosts(token.accessToken);
  await upsertScannedPosts(userId, "twitter", posts);
  return posts.length;
}

async function bothProvidersReady(userId: string): Promise<boolean> {
  const tokens = await prisma.oAuthToken.findMany({
    where: { userId },
    select: { provider: true },
  });

  const hasInstagram = tokens.some((t) => t.provider === "instagram");
  const hasTwitter = tokens.some((t) => t.provider === "twitter");

  if (!hasInstagram || !hasTwitter) {
    return false;
  }

  const [instagramCount, twitterCount] = await Promise.all([
    prisma.scannedPost.count({ where: { userId, provider: "instagram" } }),
    prisma.scannedPost.count({ where: { userId, provider: "twitter" } }),
  ]);

  return instagramCount > 0 && twitterCount > 0;
}

async function tryEnqueueGenerate(userId: string) {
  if (!(await bothProvidersReady(userId))) {
    return { enqueued: false as const, reason: "awaiting_both_providers" };
  }

  const product = await prisma.product.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!product) {
    return { enqueued: false as const, reason: "no_product" };
  }

  const existingPosts = await prisma.generatedPost.count({
    where: { userId, productId: product.id },
  });

  if (existingPosts > 0) {
    return { enqueued: false as const, reason: "already_generated" };
  }

  await addGenerateJob(
    { productId: product.id, userId },
    { jobId: `generate-${userId}-${product.id}` }
  );

  return {
    enqueued: true as const,
    productId: product.id,
  };
}

async function processScanJob(job: Job<ScanJobData>) {
  const { userId, provider } = job.data;

  const upserted =
    provider === "instagram"
      ? await scanInstagram(userId)
      : await scanTwitter(userId);

  const generateResult = await tryEnqueueGenerate(userId);

  return {
    userId,
    provider,
    upserted,
    generate: generateResult,
  };
}

export function startScanWorker() {
  const worker = new Worker<ScanJobData>(SCAN_QUEUE_NAME, processScanJob, {
    connection: getRedisConnection(),
    concurrency: SCAN_CONCURRENCY,
  });

  worker.on("failed", (job, err) => {
    console.error("[scan] Job failed", {
      jobId: job?.id,
      userId: job?.data.userId,
      provider: job?.data.provider,
      attemptsMade: job?.attemptsMade,
      error: err.message,
    });
  });

  worker.on("completed", (job, result) => {
    console.log("[scan] Job completed", {
      jobId: job.id,
      userId: job.data.userId,
      provider: job.data.provider,
      result,
    });
  });

  return worker;
}
