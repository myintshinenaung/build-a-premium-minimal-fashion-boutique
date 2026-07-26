import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  CacheStatusPanel,
  ClearCacheButton,
  QueueStatusPanel,
  SlowEndpointsTable,
  SystemHealthPanel
} from "@/features/performance/client";
import { getPerformanceOverview } from "@/features/performance/server";

export const metadata: Metadata = {
  title: "Performance Overview"
};

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const data = await getPerformanceOverview();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Performance Dashboard"
        description="Monitor cache efficiency, slow endpoints, background queues, and system health."
        action={<ClearCacheButton />}
      />

      <SystemHealthPanel system={data.system} />
      <CacheStatusPanel cache={data.cache} />
      <SlowEndpointsTable endpoints={data.slowEndpoints} queries={data.slowQueries} />
      <QueueStatusPanel queues={data.queues} />
    </section>
  );
}
