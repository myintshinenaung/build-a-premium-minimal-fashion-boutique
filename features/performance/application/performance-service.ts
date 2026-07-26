import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCacheStats } from "@/features/performance/infrastructure/cache-store";
import { jobQueue } from "@/features/performance/infrastructure/job-queue";
import {
  getRecentErrors,
  getSlowEndpointStats,
  getSlowQueryStats,
  recordError
} from "@/features/performance/infrastructure/metrics-store";
import { timedQuery } from "@/features/performance/infrastructure/metrics-store";
import type { PerformanceOverviewResponse, SystemHealthResponse } from "@/types/performance";

const bootTime = Date.now();

export async function getSystemHealth(): Promise<SystemHealthResponse> {
  const startedAt = performance.now();
  let connected = false;
  let latencyMs: number | null = null;

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("products").select("id", { count: "exact", head: true });
    latencyMs = Number((performance.now() - startedAt).toFixed(2));
    connected = !error;
    if (error) {
      recordError("database", error.message);
    }
  } catch (error) {
    recordError("database", error instanceof Error ? error.message : "Database check failed.");
  }

  const memory = process.memoryUsage();
  const cache = getCacheStats();
  const status = connected && cache.hitRate >= 0 ? "healthy" : connected ? "degraded" : "unhealthy";

  return {
    status,
    database: { connected, latencyMs },
    cache,
    memory: {
      heapUsedMb: Number((memory.heapUsed / (1024 * 1024)).toFixed(2)),
      rssMb: Number((memory.rss / (1024 * 1024)).toFixed(2))
    },
    uptimeSeconds: Math.floor((Date.now() - bootTime) / 1000),
    checkedAt: new Date().toISOString()
  };
}

export async function getPerformanceOverview(): Promise<PerformanceOverviewResponse> {
  const [system] = await Promise.all([getSystemHealth()]);

  return {
    cache: system.cache,
    slowEndpoints: getSlowEndpointStats(),
    slowQueries: getSlowQueryStats(),
    queues: jobQueue.getStats(),
    system,
    recentErrors: getRecentErrors()
  };
}

export async function getCacheStatus() {
  return getCacheStats();
}

export async function getQueueStatus() {
  return jobQueue.getStats();
}

export async function measureDatabaseLatency() {
  return timedQuery("system-health.products-count", async () => {
    const supabase = createSupabaseServerClient();
    const { count, error } = await supabase.from("products").select("id", { count: "exact", head: true });
    if (error) {
      throw error;
    }
    return count ?? 0;
  });
}
