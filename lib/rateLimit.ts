import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

type Bucket = "createSession" | "joinSession" | "toggleClaim" | "markPaid";

const configs: Record<Bucket, { requests: number; windowSeconds: number }> = {
  createSession: { requests: 5, windowSeconds: 60 },
  joinSession: { requests: 15, windowSeconds: 60 },
  toggleClaim: { requests: 60, windowSeconds: 60 },
  markPaid: { requests: 20, windowSeconds: 60 },
};

let redis: Redis | null = null;
const limiters: Partial<Record<Bucket, Ratelimit>> = {};

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function getLimiter(bucket: Bucket): Ratelimit | null {
  if (limiters[bucket]) return limiters[bucket]!;
  const client = getRedis();
  if (!client) return null;
  const { requests, windowSeconds } = configs[bucket];
  limiters[bucket] = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    prefix: `snaptab:${bucket}`,
    analytics: false,
  });
  return limiters[bucket]!;
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

// If Upstash isn't configured (local dev), rate limits soft-pass so the app still works.
// In production, missing keys should be treated as a deploy misconfiguration.
export async function enforceRateLimit(bucket: Bucket): Promise<{ ok: true } | { ok: false; error: string }> {
  const limiter = getLimiter(bucket);
  if (!limiter) return { ok: true };
  const ip = await getClientIp();
  const { success } = await limiter.limit(`${bucket}:${ip}`);
  if (!success) {
    return { ok: false, error: "Too many requests. Give it a moment and try again." };
  }
  return { ok: true };
}
