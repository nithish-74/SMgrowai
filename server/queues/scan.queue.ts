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
  scanQueue ??= new Queue<ScanJobData>(SCAN_QUEUE_NAME, {
    connection: getRedisConnection(),
    defaultJobOptions,
  });
  return scanQueue;
}

export async function addScanJob(
  data: ScanJobData,
  options?: JobsOptions
): Promise<Job<ScanJobData>> {
  return getScanQueue().add(SCAN_JOB_NAME, data, options);
}
