import { Worker, Queue, Job } from "bullmq";
import { getRedisConnection } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { buildDailyDigest } from "@/server/cmo/digest";
import { Resend } from "resend";

const DIGEST_QUEUE_NAME = "daily-digest";

const digestQueue = new Queue(DIGEST_QUEUE_NAME, {
  connection: getRedisConnection(),
});

async function processDigestJob(job: Job) {
  console.log("[digest] Processing daily digest job");

  const users = await prisma.user.findMany({
    where: {
      digestEnabled: true,
      brand: { isNot: null },
      email: { not: null },
    },
    include: { brand: true },
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.DIGEST_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error("DIGEST_FROM_EMAIL is required");
  }

  for (const user of users) {
      if (!user.email) continue;
      try {
        console.log(`[digest] Building digest for user ${user.id}`);
        const { subject, html } = await buildDailyDigest(user.id);

        await resend.emails.send({
          from: fromEmail,
          to: user.email,
          subject,
          html,
        });

        console.log(`[digest] Sent to ${user.email}`);
      } catch (error) {
        console.error(`[digest] Failed to send to ${user.email}:`, error);
      }
    }
}

export function startDigestWorker() {
  const worker = new Worker(
    DIGEST_QUEUE_NAME,
    processDigestJob,
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  );

  // Add repeatable job: every day at 7am UTC
  digestQueue.add(
    "daily-digest-job",
    {},
    {
      repeat: {
        pattern: "0 7 * * *",
        tz: "UTC",
      },
      jobId: "daily-digest-job",
    }
  );

  worker.on("completed", (job) => {
    console.log("[digest] Job completed");
  });

  worker.on("failed", (job, error) => {
    console.error("[digest] Job failed:", error);
  });

  return worker;
}
