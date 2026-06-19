import { Queue, type Job, type JobsOptions } from "bullmq";
import { getRedisConnection } from "@/lib/redis";
import { defaultJobOptions } from "@/server/queues/defaults";

export const METRICS_QUEUE_NAME = "metrics";
export const METRICS_JOB_NAME = "record-post-metrics";
export const METRICS_CONCURRENCY = 5;

export type MetricsJobData = {
  generatedPostId: string;
  delayHours: 24 | 72;
};

let metricsQueue: Queue<MetricsJobData> | undefined;

export function getMetricsQueue() {
  const connection = getRedisConnection();
  if (!connection) {
    console.warn("Redis not configured—metrics queue unavailable");
    return undefined;
  }
  
  metricsQueue ??= new Queue<MetricsJobData>(METRICS_QUEUE_NAME, {
    connection,
    defaultJobOptions,
  });
  return metricsQueue;
}

export async function addMetricsJob(
  data: MetricsJobData,
  options?: JobsOptions
): Promise<Job<MetricsJobData> | undefined> {
  const queue = getMetricsQueue();
  if (!queue) {
    console.warn("Redis not configured—can't add metrics job");
    return undefined;
  }
  const delayMs = data.delayHours * 60 * 60 * 1000;
  return queue.add(METRICS_JOB_NAME, data, {
    ...options,
    delay: delayMs,
  });
}
