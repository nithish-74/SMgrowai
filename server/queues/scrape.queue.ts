import { Queue, type Job, type JobsOptions } from "bullmq";
import { getRedisConnection } from "@/lib/redis";
import { defaultJobOptions } from "@/server/queues/defaults";

export const SCRAPE_QUEUE_NAME = "scrape";
export const SCRAPE_JOB_NAME = "scrape-product";
/** Worker concurrency — use when creating the scrape Worker */
export const SCRAPE_CONCURRENCY = 2;

export type ScrapeJobData = {
  productId: string;
  url: string;
};

let scrapeQueue: Queue<ScrapeJobData> | undefined;

export function getScrapeQueue() {
  scrapeQueue ??= new Queue<ScrapeJobData>(SCRAPE_QUEUE_NAME, {
    connection: getRedisConnection(),
    defaultJobOptions,
  });
  return scrapeQueue;
}

export async function addScrapeJob(
  data: ScrapeJobData,
  options?: JobsOptions
): Promise<Job<ScrapeJobData>> {
  return getScrapeQueue().add(SCRAPE_JOB_NAME, data, options);
}
