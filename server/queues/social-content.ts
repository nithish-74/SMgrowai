import { Queue } from "bullmq";
import { getRedisConnection } from "@/lib/redis";
import { defaultJobOptions } from "@/server/queues/defaults";

export const SOCIAL_CONTENT_QUEUE_NAME = "social-content";

export type SocialContentJobData = {
  userId: string;
  platform: "instagram" | "twitter";
  prompt: string;
};

let socialContentQueue: Queue<SocialContentJobData> | undefined;

export function getSocialContentQueue() {
  const connection = getRedisConnection();
  if (!connection) {
    console.warn("Redis not configured—social content queue unavailable");
    return undefined;
  }
  
  socialContentQueue ??= new Queue<SocialContentJobData>(SOCIAL_CONTENT_QUEUE_NAME, {
    connection,
    defaultJobOptions,
  });
  return socialContentQueue;
}
