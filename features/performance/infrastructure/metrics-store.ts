import { SLOW_API_THRESHOLD_MS, SLOW_QUERY_THRESHOLD_MS } from "@/types/performance";

type TimingEntry = {
  count: number;
  totalMs: number;
  maxMs: number;
  lastSeenAt: string;
};

type ErrorEntry = {
  source: string;
  message: string;
  createdAt: string;
};

const slowEndpoints = new Map<string, TimingEntry>();
const slowQueries = new Map<string, TimingEntry>();
const apiTimings = new Map<string, TimingEntry>();
const recentErrors: ErrorEntry[] = [];
const MAX_ERRORS = 100;

function recordTiming(map: Map<string, TimingEntry>, key: string, durationMs: number) {
  const current = map.get(key) ?? { count: 0, totalMs: 0, maxMs: 0, lastSeenAt: new Date().toISOString() };
  current.count += 1;
  current.totalMs += durationMs;
  current.maxMs = Math.max(current.maxMs, durationMs);
  current.lastSeenAt = new Date().toISOString();
  map.set(key, current);
}

export function recordApiTiming(path: string, durationMs: number) {
  recordTiming(apiTimings, path, durationMs);
  if (durationMs >= SLOW_API_THRESHOLD_MS) {
    recordTiming(slowEndpoints, path, durationMs);
  }
}

export function recordQueryTiming(label: string, durationMs: number) {
  if (durationMs >= SLOW_QUERY_THRESHOLD_MS) {
    recordTiming(slowQueries, label, durationMs);
  }
}

export async function timedQuery<T>(label: string, query: () => Promise<T>) {
  const startedAt = performance.now();
  try {
    return await query();
  } finally {
    recordQueryTiming(label, performance.now() - startedAt);
  }
}

export function recordError(source: string, message: string) {
  recentErrors.unshift({ source, message, createdAt: new Date().toISOString() });
  if (recentErrors.length > MAX_ERRORS) {
    recentErrors.length = MAX_ERRORS;
  }
}

function mapTimingEntries(map: Map<string, TimingEntry>) {
  return Array.from(map.entries())
    .map(([key, value]) => ({
      path: key,
      label: key,
      count: value.count,
      averageMs: Number((value.totalMs / value.count).toFixed(2)),
      maxMs: Number(value.maxMs.toFixed(2)),
      lastSeenAt: value.lastSeenAt
    }))
    .sort((left, right) => right.maxMs - left.maxMs);
}

export function getSlowEndpointStats() {
  return mapTimingEntries(slowEndpoints).map(({ label, ...rest }) => ({
    path: label,
    count: rest.count,
    averageMs: rest.averageMs,
    maxMs: rest.maxMs,
    lastSeenAt: rest.lastSeenAt
  }));
}

export function getSlowQueryStats() {
  return mapTimingEntries(slowQueries).map(({ label, ...rest }) => ({
    label,
    count: rest.count,
    averageMs: rest.averageMs,
    maxMs: rest.maxMs,
    lastSeenAt: rest.lastSeenAt
  }));
}

export function getRecentErrors(limit = 20) {
  return recentErrors.slice(0, limit);
}

export function getApiTimingStats() {
  return mapTimingEntries(apiTimings);
}

export function resetMetrics() {
  slowEndpoints.clear();
  slowQueries.clear();
  apiTimings.clear();
  recentErrors.length = 0;
}
