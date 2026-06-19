import { Worker, type Job } from "bullmq";
import type { FormatTemplate, Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { callLlmJson } from "@/lib/llm";
import { getRedisConnection } from "@/lib/redis";
import {
  GENERATE_CONCURRENCY,
  GENERATE_QUEUE_NAME,
  type GenerateJobData,
} from "@/server/queues/generate.queue";
import { addPostJob } from "@/server/queues/post.queue";
import { buildFormatAnalyserPrompt } from "@/server/prompts/formatAnalyser";
import type { FormatAnalyserResult } from "@/server/prompts/formatAnalyser";
import { buildCopyGeneratorPrompt } from "@/server/prompts/copyGenerator";
import type {
  InstagramCopyResult,
  TwitterCopyResult,
} from "@/server/prompts/copyGenerator";

async function analyseFormat(posts: Awaited<ReturnType<typeof fetchScannedPosts>>) {
  const { systemPrompt, userMessage } = buildFormatAnalyserPrompt(posts);

  try {
    return await callLlmJson<FormatAnalyserResult>(
      systemPrompt,
      userMessage,
      "format-analyser"
    );
  } catch (error) {
    throw new Error(
      `Format analysis failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}

async function generateInstagramCopy(
  product: Product,
  template: FormatTemplate
): Promise<InstagramCopyResult> {
  const { systemPrompt, userMessage } = buildCopyGeneratorPrompt(
    product,
    template,
    "instagram"
  );

  try {
    return await callLlmJson<InstagramCopyResult>(
      systemPrompt,
      userMessage,
      "copy-instagram"
    );
  } catch (error) {
    throw new Error(
      `Instagram copy generation failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}

async function generateTwitterCopy(
  product: Product,
  template: FormatTemplate
): Promise<TwitterCopyResult> {
  const { systemPrompt, userMessage } = buildCopyGeneratorPrompt(
    product,
    template,
    "twitter"
  );

  try {
    return await callLlmJson<TwitterCopyResult>(
      systemPrompt,
      userMessage,
      "copy-twitter"
    );
  } catch (error) {
    throw new Error(
      `Twitter copy generation failed: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}

async function fetchScannedPosts(userId: string) {
  return prisma.scannedPost.findMany({
    where: { userId },
    orderBy: { engagementRate: "desc" },
    take: 5,
  });
}

async function processGenerateJob(job: Job<GenerateJobData>) {
  const { productId, userId } = job.data;

  const [product, user, scannedPosts] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, autoPost: true },
    }),
    fetchScannedPosts(userId),
  ]);

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }
  if (product.userId !== userId) {
    throw new Error(`Product ${productId} does not belong to user ${userId}`);
  }
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const formatResult = await analyseFormat(scannedPosts);

  const template = await prisma.formatTemplate.create({
    data: {
      scannedPostIds: scannedPosts.map((p) => p.id),
      hookType: formatResult.hookType,
      structurePattern: formatResult.structurePattern,
      ctaStyle: formatResult.ctaStyle,
    },
  });

  const [instagramCopy, twitterCopy] = await Promise.all([
    generateInstagramCopy(product, template),
    generateTwitterCopy(product, template),
  ]);

  const postStatus = user.autoPost ? "approved" : "draft";

  const [instagramPost, twitterPost] = await prisma.$transaction([
    prisma.generatedPost.create({
      data: {
        userId,
        productId,
        formatTemplateId: template.id,
        caption: instagramCopy.caption,
        slidesCopy: instagramCopy.slidesCopy,
        threadDraft: null,
        status: postStatus,
      },
    }),
    prisma.generatedPost.create({
      data: {
        userId,
        productId,
        formatTemplateId: template.id,
        caption: twitterCopy.thread[0] ?? "",
        slidesCopy: [],
        threadDraft: JSON.stringify(twitterCopy.thread),
        status: postStatus,
      },
    }),
  ]);

  if (user.autoPost) {
    const scheduledAt = new Date();
    await Promise.all([
      addPostJob({ generatedPostId: instagramPost.id, scheduledAt }),
      addPostJob({ generatedPostId: twitterPost.id, scheduledAt }),
    ]);
  }

  return {
    formatTemplateId: template.id,
    instagramPostId: instagramPost.id,
    twitterPostId: twitterPost.id,
    autoPostEnqueued: user.autoPost,
  };
}

export function startGenerateWorker() {
  const connection = getRedisConnection();
  if (!connection) {
    console.warn("[generate] Redis not configured, skipping generate worker");
    return null;
  }

  const worker = new Worker<GenerateJobData>(
    GENERATE_QUEUE_NAME,
    processGenerateJob,
    {
      connection,
      concurrency: GENERATE_CONCURRENCY,
    }
  );

  worker.on("failed", (job, err) => {
    console.error("[generate] Job failed", {
      jobId: job?.id,
      productId: job?.data.productId,
      userId: job?.data.userId,
      attemptsMade: job?.attemptsMade,
      error: err.message,
    });
  });

  worker.on("completed", (job, result) => {
    console.log("[generate] Job completed", {
      jobId: job.id,
      productId: job.data.productId,
      result,
    });
  });

  return worker;
}
