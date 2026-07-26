export const CACHE_TAGS = {
  catalog: "catalog",
  products: "products",
  categories: "categories",
  reviews: "reviews",
  recommendations: "recommendations",
  search: "search",
  analytics: "analytics",
  inventory: "inventory",
  homepage: "homepage",
  settings: "settings",
  banners: "banners",
  promotions: "promotions"
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const CACHE_TTLS = {
  catalog: 300,
  reviews: 300,
  recommendations: 300,
  search: 300,
  analytics: 120,
  inventory: 60,
  homepage: 300,
  settings: 600,
  banners: 600
} as const;

export const INVALIDATION_GROUPS = {
  catalog: [
    CACHE_TAGS.catalog,
    CACHE_TAGS.products,
    CACHE_TAGS.categories,
    CACHE_TAGS.recommendations,
    CACHE_TAGS.search,
    CACHE_TAGS.homepage
  ],
  reviews: [CACHE_TAGS.reviews, CACHE_TAGS.recommendations, CACHE_TAGS.search],
  inventory: [CACHE_TAGS.inventory, CACHE_TAGS.products],
  analytics: [CACHE_TAGS.analytics],
  homepage: [CACHE_TAGS.homepage, CACHE_TAGS.banners, CACHE_TAGS.settings],
  settings: [CACHE_TAGS.settings, CACHE_TAGS.homepage],
  banners: [CACHE_TAGS.banners, CACHE_TAGS.homepage],
  promotions: [CACHE_TAGS.promotions, CACHE_TAGS.analytics]
} as const;

export const MAX_API_PAYLOAD_BYTES = 512_000;

export const SLOW_QUERY_THRESHOLD_MS = 500;
export const SLOW_API_THRESHOLD_MS = 750;

export const JOB_TYPES = [
  "email",
  "inventory_sync",
  "analytics_aggregation",
  "cleanup",
  "cache_refresh"
] as const;

export type JobType = (typeof JOB_TYPES)[number];
export type JobStatus = "pending" | "running" | "completed" | "failed";

export type CacheEntryStat = {
  key: string;
  tags: string[];
  requests: number;
  misses: number;
  lastMissAt: string | null;
  revalidateSeconds: number;
};

export type CacheStatsResponse = {
  entries: CacheEntryStat[];
  totalRequests: number;
  totalMisses: number;
  hitRate: number;
};

export type SlowEndpointStat = {
  path: string;
  count: number;
  averageMs: number;
  maxMs: number;
  lastSeenAt: string;
};

export type SlowQueryStat = {
  label: string;
  count: number;
  averageMs: number;
  maxMs: number;
  lastSeenAt: string;
};

export type QueueJobRecord = {
  id: string;
  type: JobType;
  status: JobStatus;
  payload: Record<string, unknown>;
  attempts: number;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type QueueStatsResponse = {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  jobs: QueueJobRecord[];
};

export type SystemHealthResponse = {
  status: "healthy" | "degraded" | "unhealthy";
  database: { connected: boolean; latencyMs: number | null };
  cache: CacheStatsResponse;
  memory: { heapUsedMb: number; rssMb: number };
  uptimeSeconds: number;
  checkedAt: string;
};

export type PerformanceOverviewResponse = {
  cache: CacheStatsResponse;
  slowEndpoints: SlowEndpointStat[];
  slowQueries: SlowQueryStat[];
  queues: QueueStatsResponse;
  system: SystemHealthResponse;
  recentErrors: Array<{ source: string; message: string; createdAt: string }>;
};
