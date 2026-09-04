import { NextRequest, NextResponse } from "next/server";

// Per-instance fixed-window counters. On serverless deployments each
// instance holds its own map, so the effective limit across N warm
// instances is up to N times maxRequests. That's an accepted tradeoff
// for abuse-prevention limits given no shared store is available.
const buckets = new Map<string, { count: number; windowStart: number }>();

const PRUNE_THRESHOLD = 1000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (buckets.size > PRUNE_THRESHOLD) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.windowStart + windowMs < now) {
        buckets.delete(bucketKey);
      }
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.windowStart + windowMs < now) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (bucket.count < maxRequests) {
    bucket.count += 1;
    return { allowed: true, remaining: maxRequests - bucket.count, retryAfterSeconds: 0 };
  }

  const retryAfterSeconds = Math.ceil((bucket.windowStart + windowMs - now) / 1000);
  return { allowed: false, remaining: 0, retryAfterSeconds };
}

// ponytail: trusts a single reverse-proxy hop. X-Forwarded-For entries
// prepended by the client are spoofable; only the entry appended by our
// own proxy/edge (the rightmost one) is trustworthy. If another proxy is
// ever added in front of this app, this needs a TRUSTED_PROXY_HOPS count
// to pick the right hop instead of always taking the last one.
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

// Read-only counterpart to checkRateLimit: reports current bucket state
// without consuming a slot. Used for status/"peek" endpoints.
export function peekRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const bucket = buckets.get(key);

  if (!bucket || bucket.windowStart + windowMs < now) {
    return { allowed: true, remaining: maxRequests, retryAfterSeconds: 0 };
  }

  const remaining = Math.max(0, maxRequests - bucket.count);
  const retryAfterSeconds =
    remaining > 0 ? 0 : Math.ceil((bucket.windowStart + windowMs - now) / 1000);
  return { allowed: remaining > 0, remaining, retryAfterSeconds };
}

export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { success: false, error: "RATE_LIMITED" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
