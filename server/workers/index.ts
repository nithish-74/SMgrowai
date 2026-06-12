import type { Worker } from "bullmq";
import { prisma } from "@/lib/prisma";
import {
  getGenerateQueue,
  getPostQueue,
  getScanQueue,
  getScrapeQueue,
  getSocialContentQueue,
  getMetricsQueue,
} from "@/server/queues";
import { startScrapeWorker } from "./scrapeWorker";
import { startScanWorker } from "./scanWorker";
import { startGenerateWorker } from "./generateWorker";
import { startPostWorker } from "./postWorker";
import { startSocialContentWorker } from "./social-content.worker";
import { startDigestWorker } from "./digestWorker";
import { startMetricsWorker } from "./metricsWorker";

type NamedWorker = {
  name: string;
  instance: Worker;
};

let workers: NamedWorker[] = [];
let isShuttingDown = false;

function waitForWorkerReady(worker: Worker, name: string): Promise<void> {
  return new Promise((resolve) => {
    const onReady = () => {
      console.log(`[workers] ${name} ready`);
      resolve();
    };

    worker.once("ready", onReady);
  });
}

async function startWorkers() {
  workers = [
    { name: "scrape", instance: startScrapeWorker() },
    { name: "scan", instance: startScanWorker() },
    { name: "generate", instance: startGenerateWorker() },
    { name: "post", instance: startPostWorker() },
    { name: "social-content", instance: startSocialContentWorker() },
    { name: "metrics", instance: startMetricsWorker() },
    { name: "digest", instance: startDigestWorker() },
  ];

  await Promise.all(
    workers.map(({ name, instance }) => waitForWorkerReady(instance, name))
  );
}

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`[workers] ${signal} received, shutting down...`);

  try {
    await Promise.all(workers.map(({ instance }) => instance.close()));
    console.log("[workers] All Bull MQ workers closed");

    const queues = [
      getScrapeQueue(),
      getScanQueue(),
      getGenerateQueue(),
      getPostQueue(),
      getSocialContentQueue(),
      getMetricsQueue(),
    ];
    await Promise.all(queues.map((queue) => queue.close()));
    console.log("[workers] All queues closed");

    await prisma.$disconnect();
    console.log("[workers] Prisma disconnected");
  } catch (error) {
    console.error("[workers] Error during shutdown", error);
    process.exit(1);
  }

  process.exit(0);
}

async function main() {
  console.log("[workers] Starting worker process...");

  await prisma.$connect();
  console.log("[workers] Prisma connected");

  await startWorkers();

  console.log(`[workers] All ${workers.length} workers ready`);

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error("[workers] Fatal startup error", error);
  void prisma.$disconnect().finally(() => process.exit(1));
});
