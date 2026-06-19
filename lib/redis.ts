import type { ConnectionOptions } from "bullmq";

/**
 * Bull MQ connection options for Upstash Redis.
 * Upstash requires TLS — use rediss:// or enable tls on the connection.
 */
export function getRedisConnection(): ConnectionOptions {
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;

  if (url) {
    return { url, maxRetriesPerRequest: null };
  }

  const host = process.env.UPSTASH_REDIS_HOST;
  const port = Number(process.env.UPSTASH_REDIS_PORT ?? 6379);
  const password = process.env.UPSTASH_REDIS_PASSWORD;

  if (!host || !password) {
    throw new Error(
      "Missing Redis config: set UPSTASH_REDIS_URL or UPSTASH_REDIS_HOST + UPSTASH_REDIS_PASSWORD"
    );
  }

  return {
    host,
    port,
    password,
    tls: {},
    maxRetriesPerRequest: null,
  };
}
