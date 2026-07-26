import type { JobStatus, JobType, QueueJobRecord, QueueStatsResponse } from "@/types/performance";

function createJobId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JOB-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

const jobs: QueueJobRecord[] = [];
const MAX_JOBS = 200;

export const jobQueue = {
  enqueue(type: JobType, payload: Record<string, unknown> = {}) {
    const job: QueueJobRecord = {
      id: createJobId(),
      type,
      status: "pending",
      payload,
      attempts: 0,
      error: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null
    };

    jobs.unshift(job);
    if (jobs.length > MAX_JOBS) {
      jobs.length = MAX_JOBS;
    }

    return job;
  },

  list(limit = 50) {
    return jobs.slice(0, limit);
  },

  getStats(): QueueStatsResponse {
    const stats = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      jobs: jobs.slice(0, 50)
    };

    for (const job of jobs) {
      stats[job.status] += 1;
    }

    return stats;
  },

  markRunning(jobId: string) {
    const job = jobs.find((entry) => entry.id === jobId);
    if (!job) return null;
    job.status = "running";
    job.startedAt = new Date().toISOString();
    job.attempts += 1;
    return job;
  },

  markCompleted(jobId: string) {
    const job = jobs.find((entry) => entry.id === jobId);
    if (!job) return null;
    job.status = "completed";
    job.completedAt = new Date().toISOString();
    return job;
  },

  markFailed(jobId: string, error: string) {
    const job = jobs.find((entry) => entry.id === jobId);
    if (!job) return null;
    job.status = "failed";
    job.error = error;
    job.completedAt = new Date().toISOString();
    return job;
  }
};

export function enqueueCacheRefresh(tags: string[]) {
  return jobQueue.enqueue("cache_refresh", { tags });
}

export function enqueueInventorySync(productId?: string) {
  return jobQueue.enqueue("inventory_sync", productId ? { productId } : {});
}

export function enqueueAnalyticsAggregation() {
  return jobQueue.enqueue("analytics_aggregation");
}

export function enqueueCleanupJob(scope: string) {
  return jobQueue.enqueue("cleanup", { scope });
}

export function enqueueEmailJob(template: string, recipient: string) {
  return jobQueue.enqueue("email", { template, recipient });
}
