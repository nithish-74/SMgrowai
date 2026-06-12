import { Worker, type Job } from "bullmq";
import { getRedisConnection } from "@/lib/redis";
import {
  SOCIAL_CONTENT_QUEUE_NAME,
  type SocialContentJobData,
} from "@/server/queues/social-content";
import { SOCIAL_CONTENT_SYSTEM_PROMPT } from "@/server/prompts";

async function processSocialContentJob(job: Job<SocialContentJobData>) {
  const { userId, platform, prompt } = job.data;

  // Placeholder: wire to your LLM provider using OPENAI_API_KEY
  console.log("[social-content]", {
    jobId: job.id,
    userId,
    platform,
    systemPrompt: SOCIAL_CONTENT_SYSTEM_PROMPT.slice(0, 80),
    prompt,
  });

  return { status: "queued-for-llm", jobId: job.id };
}

export function createSocialContentWorker() {
  return new Worker<SocialContentJobData>(
    SOCIAL_CONTENT_QUEUE_NAME,
    processSocialContentJob,
    { connection: getRedisConnection() }
  );
}

/** @alias createSocialContentWorker */
export const startSocialContentWorker = createSocialContentWorker;
