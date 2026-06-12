import { Worker, type Job } from "bullmq";
import { getRedisConnection } from "@/lib/redis";
import {
  METRICS_CONCURRENCY,
  METRICS_QUEUE_NAME,
  type MetricsJobData,
} from "@/server/queues/metrics.queue";
import { recordPostPerformance } from "@/server/cmo/memory";

async function processMetricsJob(job: Job<MetricsJobData>) {
  const { generatedPostId, delayHours } = job.data;

  try {
    await recordPostPerformance(generatedPostId, delayHours);
    return { success: true, generatedPostId, delayHours };
  } catch (error) {
    console.error("[metrics] Job failed", {
      jobId: job.id,
      generatedPostId,
      delayHours,
      error: error instanceof Error ? error.message : error,
    });
    return {
      success: false,
      generatedPostId,
      delayHours,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function startMetricsWorker() {
  const worker = new Worker<MetricsJobData>(
    METRICS_QUEUE_NAME,
    processMetricsJob,
    {
      connection: getRedisConnection(),
      concurrency: METRICS_CONCURRENCY,
    }
  );

  worker.on("completed", (job, result) => {
    console.log("[metrics] Job completed", {
      jobId: job.id,
      generatedPostId: job.data.generatedPostId,
      result,
    });
  });

  return worker;
}
