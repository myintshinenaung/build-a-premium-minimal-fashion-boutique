import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AnalyticsBarChart,
  AnalyticsDateRangeFilter,
  AnalyticsKpiGrid,
  AnalyticsSection,
  AnalyticsTable
} from "@/features/analytics/client";
import { getAnalyticsReviews } from "@/features/analytics/server";
import { MessageSquare, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Review Analytics"
};

export const dynamic = "force-dynamic";

type AnalyticsReviewsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsReviewsPage({ searchParams }: AnalyticsReviewsPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getAnalyticsReviews(resolvedSearchParams ?? {});

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Review Analytics" description="Rating quality, moderation backlog, and distribution." />

      <Suspense fallback={<div className="h-24 border border-line bg-white" />}>
        <AnalyticsDateRangeFilter from={data.range.from} to={data.range.to} />
      </Suspense>

      <AnalyticsKpiGrid
        items={[
          {
            label: "Average Rating",
            value: String(data.averageRating),
            helper: `${data.totalReviews} published reviews`,
            icon: <Star size={19} strokeWidth={1.7} />
          },
          {
            label: "Pending Reviews",
            value: String(data.pendingReviews),
            helper: "Awaiting moderation",
            icon: <MessageSquare size={19} strokeWidth={1.7} />
          }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsSection title="Rating Distribution">
          <AnalyticsBarChart
            items={Object.entries(data.distribution).map(([label, value]) => ({ label: `${label} stars`, value }))}
          />
        </AnalyticsSection>
        <AnalyticsSection title="Distribution Table">
          <AnalyticsTable
            columns={["Rating", "Reviews"]}
            rows={Object.entries(data.distribution).map(([label, value]) => [`${label} stars`, value])}
          />
        </AnalyticsSection>
      </div>
    </section>
  );
}
