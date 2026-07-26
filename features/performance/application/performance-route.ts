import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { applySecurityHeaders } from "@/features/security/application/api-security";
import { clearAllCaches, invalidateCacheTags } from "@/features/performance/application/cache-invalidation";
import {
  getCacheStatus,
  getPerformanceOverview,
  getQueueStatus,
  getSystemHealth
} from "@/features/performance/application/performance-service";
import { parseClearCacheBody } from "@/features/performance/domain/performance-schemas";
import { recordApiTiming } from "@/features/performance/infrastructure/metrics-store";
import type { CacheTag } from "@/types/performance";

function secureJson(data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  applySecurityHeaders(response.headers);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function withPerformanceRoute(request: NextRequest, handler: () => Promise<unknown>) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) {
    return unauthorized;
  }

  const startedAt = performance.now();

  try {
    const data = await handler();
    const response = secureJson(data);
    response.headers.set("Server-Timing", `app;dur=${(performance.now() - startedAt).toFixed(2)}`);
    recordApiTiming(request.nextUrl.pathname, performance.now() - startedAt);
    return response;
  } catch (error) {
    recordApiTiming(request.nextUrl.pathname, performance.now() - startedAt);
    if (error instanceof ZodError) {
      return secureJson({ message: error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
    }
    return jsonError(error);
  }
}

export async function GET_PERFORMANCE(request: NextRequest) {
  return withPerformanceRoute(request, () => getPerformanceOverview());
}

export async function GET_CACHE(request: NextRequest) {
  return withPerformanceRoute(request, () => getCacheStatus());
}

export async function POST_CLEAR_CACHE(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();
    const input = parseClearCacheBody(body);

    if (input.all) {
      await clearAllCaches();
    } else if (input.tags?.length) {
      await invalidateCacheTags(input.tags as CacheTag[]);
    } else {
      await clearAllCaches();
    }

    return secureJson({ ok: true, cache: await getCacheStatus() });
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET_SYSTEM_HEALTH(request: NextRequest) {
  return withPerformanceRoute(request, () => getSystemHealth());
}

export async function GET_QUEUES(request: NextRequest) {
  return withPerformanceRoute(request, () => getQueueStatus());
}

export function withPublicCacheHeaders(response: NextResponse, maxAgeSeconds = 60, staleWhileRevalidateSeconds = 300) {
  response.headers.set(
    "Cache-Control",
    `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`
  );
  return response;
}

export function withApiTiming(request: NextRequest, response: NextResponse, startedAt: number) {
  const durationMs = performance.now() - startedAt;
  recordApiTiming(request.nextUrl.pathname, durationMs);
  response.headers.set("Server-Timing", `app;dur=${durationMs.toFixed(2)}`);
  return response;
}
