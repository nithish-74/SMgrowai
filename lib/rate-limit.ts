import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export async function checkRateLimit(
  userId: string,
  action: "import" | "scan",
  maxRequests: number,
  windowSeconds: number
) {
  const key = `rate_limit:${userId}:${action}`;
  const current = await redis.get(key);
  
  if (current === null) {
    await redis.setex(key, windowSeconds, 1);
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  const count = Number(current);
  if (count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  await redis.incr(key);
  return { allowed: true, remaining: maxRequests - count - 1 };
}
