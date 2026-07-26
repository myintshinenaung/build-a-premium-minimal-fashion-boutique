import { unstable_cache } from "next/cache";
import type { CacheTag } from "@/types/performance";

type CacheEntryState = {
  key: string;
  tags: string[];
  requests: number;
  misses: number;
  lastMissAt: string | null;
  revalidateSeconds: number;
};

const cacheEntries = new Map<string, CacheEntryState>();

function getOrCreateEntry(key: string, tags: readonly string[], revalidateSeconds: number) {
  const existing = cacheEntries.get(key);
  if (existing) {
    return existing;
  }

  const entry: CacheEntryState = {
    key,
    tags: [...tags],
    requests: 0,
    misses: 0,
    lastMissAt: null,
    revalidateSeconds
  };
  cacheEntries.set(key, entry);
  return entry;
}

export function createCachedLoader<T>(
  key: string,
  tags: readonly CacheTag[],
  revalidateSeconds: number,
  loader: () => Promise<T>
) {
  getOrCreateEntry(key, tags, revalidateSeconds);

  const cached = unstable_cache(
    async () => {
      const entry = getOrCreateEntry(key, tags, revalidateSeconds);
      entry.misses += 1;
      entry.lastMissAt = new Date().toISOString();
      return loader();
    },
    [key],
    { tags: [...tags], revalidate: revalidateSeconds }
  );

  return async () => {
    const entry = getOrCreateEntry(key, tags, revalidateSeconds);
    entry.requests += 1;
    return cached();
  };
}

export function getCacheStats() {
  const entries = Array.from(cacheEntries.values()).sort((left, right) => right.requests - left.requests);
  const totalRequests = entries.reduce((sum, entry) => sum + entry.requests, 0);
  const totalMisses = entries.reduce((sum, entry) => sum + entry.misses, 0);
  const hitRate = totalRequests === 0 ? 1 : Math.max(0, (totalRequests - totalMisses) / totalRequests);

  return {
    entries,
    totalRequests,
    totalMisses,
    hitRate: Number(hitRate.toFixed(4))
  };
}

export function resetCacheStats() {
  cacheEntries.clear();
}

export function listRegisteredCacheKeys() {
  return Array.from(cacheEntries.keys());
}
