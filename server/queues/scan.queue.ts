import type { OAuthProvider } from "@prisma/client";
import { Queue, type Job, type JobsOptions } from "bullmq";
import { getRedisConnection } from "@/lib/redis";
import { defaultJobOptions } from "@/server/queues/defaults";

export const SCAN_QUEUE_NAME = "scan";
export const SCAN_JOB_NAME = "scan-provider";
/** Worker concurrency — use when creating the scan Worker */
export const SCAN_CONCURRENCY = 5;

export type ScanJobData = {
  userId: string;
  provider: OAuthProvider;
};

let scanQueue: Queue<ScanJobData> | undefined;

export function getScanQueue() {
  const connection = getRedisConnection();
  if (!connection) {
    console.warn("Redis not configured—scan queue unavailable");
    return undefined;
  }
  
  scanQueue ??= new Queue<ScanJobData>(SCAN_QUEUE_NAME, {
    connection,
    defaultJobOptions,
  });
  return scanQueue;
}

export async function addScanJob(
  data: ScanJobData,
  options?: JobsOptions
): Promise<Job<ScanJobData> | undefined> {
  const queue = getScanQueue();
  if (!queue) {
    console.warn("Redis not configured—can't add scan job");
    return undefined;
  }
  return queue.add(SCAN_JOB_NAME, data, options);
}
