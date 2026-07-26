import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatMmk } from "@/lib/admin-data";
import {
  AnalyticsBarChart,
  AnalyticsDateRangeFilter,
  AnalyticsLineChart,
  AnalyticsSection,
  AnalyticsTable
} from "@/features/analytics/client";
import { getAnalyticsSales } from "@/features/analytics/server";

export const metadata: Metadata = {
  title: "Sales Analytics"
};

export const dynamic = "force-dynamic";

type AnalyticsSalesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsSalesPage({ searchParams }: AnalyticsSalesPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getAnalyticsSales(resolvedSearchParams ?? {});

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Sales Analytics" description="Daily, weekly, monthly, and yearly sales performance." />

      <Suspense fallback={<div className="h-24 border border-line bg-white" />}>
        <AnalyticsDateRangeFilter from={data.range.from} to={data.range.to} period={data.period} showPeriod />
      </Suspense>

      <AnalyticsSection title="Sales Trend" description={`${data.period} sales and revenue for the selected range.`}>
        <AnalyticsLineChart
          labels={data.series.map((entry) => entry.label)}
          values={data.series.map((entry) => entry.revenueMmk)}
          valuePrefix=""
        />
      </AnalyticsSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsSection title="Orders by Period">
          <AnalyticsBarChart items={data.series.map((entry) => ({ label: entry.label, value: entry.orders }))} />
        </AnalyticsSection>
        <AnalyticsSection title="Sales Table">
          <AnalyticsTable
            columns={["Period", "Orders", "Revenue"]}
            rows={data.series.map((entry) => [entry.label, entry.orders, formatMmk(entry.revenueMmk)])}
          />
        </AnalyticsSection>
      </div>
    </section>
  );
}
