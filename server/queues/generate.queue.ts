import { Queue, type Job, type JobsOptions } from "bullmq";
import { getRedisConnection } from "@/lib/redis";
import { defaultJobOptions } from "@/server/queues/defaults";

export const GENERATE_QUEUE_NAME = "generate";
export const GENERATE_JOB_NAME = "generate-post";
/** Worker concurrency — use when creating the generate Worker */
export const GENERATE_CONCURRENCY = 3;

export type GenerateJobData = {
  productId: string;
  userId: string;
};

let generateQueue: Queue<GenerateJobData> | undefined;

export function getGenerateQueue() {
  generateQueue ??= new Queue<GenerateJobData>(GENERATE_QUEUE_NAME, {
    connection: getRedisConnection(),
    defaultJobOptions,
  });
  return generateQueue;
}

export async function addGenerateJob(
  data: GenerateJobData,
  options?: JobsOptions
): Promise<Job<GenerateJobData>> {
  return getGenerateQueue().add(GENERATE_JOB_NAME, data, options);
}
