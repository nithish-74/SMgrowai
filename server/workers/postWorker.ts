import type { GeneratedPost, GeneratedPostStatus, OAuthProvider, Product } from "@prisma/client";
import { Worker, type Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { parseJsonString } from "@/lib/parse-json";
import { getValidOAuthToken } from "@/lib/oauth/tokens";
import {
  publishInstagramPost,
  type InstagramMediaType,
} from "@/lib/social/instagram";
import { publishTwitterThread } from "@/lib/social/twitter";
import { getRedisConnection } from "@/lib/redis";
import {
  POST_CONCURRENCY,
  POST_QUEUE_NAME,
  type PostJobData,
} from "@/server/queues/post.queue";
import { addMetricsJob } from "@/server/queues/metrics.queue";

function resolveProvider(post: GeneratedPost): OAuthProvider {
  return post.threadDraft ? "twitter" : "instagram";
}

function resolveInstagramMediaType(product: Product): InstagramMediaType {
  return product.images.length > 1 ? "carousel" : "single";
}

function getInstagramImageUrls(
  product: Product,
  mediaType: InstagramMediaType
): string[] {
  if (product.images.length === 0) {
    throw new Error("Product has no images for Instagram publishing");
  }

  if (mediaType === "single") {
    return [product.images[0]];
  }

  return product.images;
}

function parseTwitterThread(threadDraft: string): string[] {
  const parsed = parseJsonString<unknown>(threadDraft, "threadDraft");
  if (!Array.isArray(parsed) || parsed.some((t) => typeof t !== "string")) {
    throw new Error("Invalid threadDraft: expected JSON array of strings");
  }
  return parsed;
}

const POSTABLE_STATUSES: GeneratedPostStatus[] = ["approved"];

function assertPostableStatus(status: GeneratedPostStatus) {
  if (!POSTABLE_STATUSES.includes(status)) {
    throw new Error(
      `Post cannot be published with status "${status}" (expected approved)`
    );
  }
}

async function markPostPosted(generatedPostId: string) {
  await prisma.generatedPost.update({
    where: { id: generatedPostId },
    data: {
      status: "posted",
      postedAt: new Date(),
      postError: null,
    },
  });
}

async function markPostFailed(generatedPostId: string, error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown posting error";

  await prisma.generatedPost.update({
    where: { id: generatedPostId },
    data: {
      status: "failed",
      postError: message,
    },
  });
}

async function postToInstagram(
  post: GeneratedPost & { product: Product }
) {
  const token = await getValidOAuthToken(post.userId, "instagram");
  const mediaType = resolveInstagramMediaType(post.product);
  const imageUrls = getInstagramImageUrls(post.product, mediaType);

  return publishInstagramPost({
    accessToken: token.accessToken,
    caption: post.caption,
    imageUrls,
    mediaType,
  });
}

async function postToTwitter(post: GeneratedPost & { product: Product }) {
  if (!post.threadDraft) {
    throw new Error("Twitter post is missing threadDraft");
  }

  const token = await getValidOAuthToken(post.userId, "twitter");
  const tweets = parseTwitterThread(post.threadDraft);

  return publishTwitterThread({
    accessToken: token.accessToken,
    tweets,
    mediaUrls: post.product.images.length > 0 ? post.product.images : undefined,
  });
}

async function processPostJob(job: Job<PostJobData>) {
  const { generatedPostId } = job.data;

  const post = await prisma.generatedPost.findUnique({
    where: { id: generatedPostId },
    include: { product: true },
  });

  if (!post) {
    throw new Error(`GeneratedPost not found: ${generatedPostId}`);
  }

  if (post.status === "posted") {
    return { skipped: true, reason: "already_posted" };
  }

  if (post.status === "rejected" || post.status === "failed") {
    return { skipped: true, reason: post.status };
  }

  assertPostableStatus(post.status);

  const provider = resolveProvider(post);

  try {
    if (provider === "instagram") {
      await postToInstagram(post);
    } else {
      await postToTwitter(post);
    }

    await markPostPosted(generatedPostId);

    // Schedule metrics jobs
    await addMetricsJob({ generatedPostId, delayHours: 24 });
    await addMetricsJob({ generatedPostId, delayHours: 72 });

    return { success: true, provider };
  } catch (error) {
    await markPostFailed(generatedPostId, error);
    console.error("[post] Job failed", {
      jobId: job.id,
      generatedPostId,
      provider,
      error: error instanceof Error ? error.message : error,
    });
    return {
      success: false,
      provider,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function startPostWorker() {
  const connection = getRedisConnection();
  if (!connection) {
    console.warn("[post] Redis not configured, skipping post worker");
    return null;
  }

  const worker = new Worker<PostJobData>(POST_QUEUE_NAME, processPostJob, {
    connection,
    concurrency: POST_CONCURRENCY,
  });

  worker.on("completed", (job, result) => {
    console.log("[post] Job completed", {
      jobId: job.id,
      generatedPostId: job.data.generatedPostId,
      result,
    });
  });

  return worker;
}
