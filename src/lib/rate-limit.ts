/**
 * Simple in-memory rate limiter for development/small production use.
 * For high traffic, swap with Redis-based solution like Upstash.
 */

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const cache = new Map<string, RateLimitRecord>();

export function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = cache.get(identifier);

  if (!record || now > record.resetTime) {
    cache.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}
