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
  metricsQueue ??= new Queue<MetricsJobData>(METRICS_QUEUE_NAME, {
    connection: getRedisConnection(),
    defaultJobOptions,
  });
  return metricsQueue;
}

export async function addMetricsJob(
  data: MetricsJobData,
  options?: JobsOptions
): Promise<Job<MetricsJobData>> {
  const delayMs = data.delayHours * 60 * 60 * 1000;
  return getMetricsQueue().add(METRICS_JOB_NAME, data, {
    ...options,
    delay: delayMs,
  });
}
