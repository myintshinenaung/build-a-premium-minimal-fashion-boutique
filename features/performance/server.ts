/** Server-only performance exports. */
export {
  clearAllCaches,
  invalidateAnalyticsCache,
  invalidateBannerCache,
  invalidateCatalogCache,
  invalidateCacheTags,
  invalidateHomepageCache,
  invalidateInventoryCache,
  invalidatePromotionCache,
  invalidateFeaturedCollectionCache,
  invalidateProductRailCache,
  invalidateReviewCache,
  invalidateSettingsCache
} from "@/features/performance/application/cache-invalidation";
export {
  getCacheStatus,
  getPerformanceOverview,
  getQueueStatus,
  getSystemHealth,
  measureDatabaseLatency
} from "@/features/performance/application/performance-service";
export {
  GET_CACHE,
  GET_PERFORMANCE,
  GET_QUEUES,
  GET_SYSTEM_HEALTH,
  POST_CLEAR_CACHE,
  withApiTiming,
  withPublicCacheHeaders
} from "@/features/performance/application/performance-route";
export {
  CACHE_TAGS,
  CACHE_TTLS,
  INVALIDATION_GROUPS,
  MAX_API_PAYLOAD_BYTES
} from "@/features/performance/domain/cache-tags";
export { buildCursorPage, decodeCursor, encodeCursor, limitPayloadSize } from "@/features/performance/domain/performance-schemas";
export { createCachedLoader, getCacheStats, listRegisteredCacheKeys } from "@/features/performance/infrastructure/cache-store";
export {
  getRecentErrors,
  getSlowEndpointStats,
  getSlowQueryStats,
  recordApiTiming,
  recordError,
  recordQueryTiming,
  timedQuery
} from "@/features/performance/infrastructure/metrics-store";
export {
  enqueueAnalyticsAggregation,
  enqueueCacheRefresh,
  enqueueCleanupJob,
  enqueueEmailJob,
  enqueueInventorySync,
  jobQueue
} from "@/features/performance/infrastructure/job-queue";
