import type { NextRequest } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

const DEFAULT_LIMIT = 120;
const WINDOW_MS = 60_000;

export function checkRateLimit(request: NextRequest, limit = DEFAULT_LIMIT, windowMs = WINDOW_MS) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  buckets.set(key, current);

  if (current.count > limit) {
    return {
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000)
    };
  }

  return null;
}

export function applySecurityHeaders(headers: Headers) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("X-XSS-Protection", "0");
  return headers;
}
