import { Queue, type Job, type JobsOptions } from "bullmq";
import { getRedisConnection } from "@/lib/redis";
import { defaultJobOptions } from "@/server/queues/defaults";

export const POST_QUEUE_NAME = "post";
export const POST_JOB_NAME = "publish-post";
/** Worker concurrency — use when creating the post Worker */
export const POST_CONCURRENCY = 10;

export type PostJobData = {
  generatedPostId: string;
  scheduledAt: Date | string;
};

let postQueue: Queue<PostJobData> | undefined;

export function getPostQueue() {
  postQueue ??= new Queue<PostJobData>(POST_QUEUE_NAME, {
    connection: getRedisConnection(),
    defaultJobOptions,
  });
  return postQueue;
}

function getDelayMs(scheduledAt: Date | string): number | undefined {
  const at =
    scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  if (Number.isNaN(at.getTime())) return undefined;
  const delay = at.getTime() - Date.now();
  return delay > 0 ? delay : undefined;
}

export async function addPostJob(
  data: PostJobData,
  options?: JobsOptions
): Promise<Job<PostJobData>> {
  const delay = getDelayMs(data.scheduledAt);
  return getPostQueue().add(POST_JOB_NAME, data, {
    ...options,
    ...(delay !== undefined ? { delay } : {}),
  });
}
