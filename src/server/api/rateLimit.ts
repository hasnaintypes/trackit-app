import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";
import { createLogger } from "@/lib/logging";

const logger = createLogger("rate-limit");

const WINDOW_SECONDS = 60;
const DEFAULT_MAX = 60;
const AI_MAX = 10;

// --- In-memory fallback ---
const memoryMap = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryMap) {
    if (now > entry.resetAt) memoryMap.delete(key);
  }
}, 60_000);

function memoryRateLimit(
  key: string,
  max: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = memoryMap.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + WINDOW_SECONDS * 1000;
    memoryMap.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  entry.count++;
  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: max - entry.count,
    resetAt: entry.resetAt,
  };
}

// --- Redis-backed rate limiters (cached per bucket:max combo) ---
const redisLimiters = new Map<string, Ratelimit>();

function getRedisLimiter(bucket: string, max: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const cacheKey = `${bucket}:${max}`;
  let limiter = redisLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${WINDOW_SECONDS} s`),
      prefix: `ratelimit:${bucket}`,
    });
    redisLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

export async function checkRateLimit(
  userId: string,
  bucket = "default",
  max: number = DEFAULT_MAX,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const limiter = getRedisLimiter(bucket, max);

  if (limiter) {
    try {
      const result = await limiter.limit(userId);
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    } catch (err) {
      logger.warn("Redis rate limit failed, falling back to in-memory", {
        err,
      });
    }
  }

  return memoryRateLimit(`${userId}:${bucket}`, max);
}

export { AI_MAX };
