import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatMmk } from "@/lib/admin-data";
import {
  AnalyticsBarChart,
  AnalyticsDateRangeFilter,
  AnalyticsLineChart,
  AnalyticsPieChart,
  AnalyticsSection,
  AnalyticsTable
} from "@/features/analytics/client";
import { getAnalyticsRevenue } from "@/features/analytics/server";

export const metadata: Metadata = {
  title: "Revenue Analytics"
};

export const dynamic = "force-dynamic";

type AnalyticsRevenuePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsRevenuePage({ searchParams }: AnalyticsRevenuePageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getAnalyticsRevenue(resolvedSearchParams ?? {});

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Revenue Analytics" description="Revenue breakdown by category, brand, payment method, and time." />

      <Suspense fallback={<div className="h-24 border border-line bg-white" />}>
        <AnalyticsDateRangeFilter from={data.range.from} to={data.range.to} />
      </Suspense>

      <AnalyticsSection title="Revenue Over Time">
        <AnalyticsLineChart
          labels={data.overTime.map((entry) => entry.label)}
          values={data.overTime.map((entry) => entry.revenueMmk)}
        />
      </AnalyticsSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsSection title="Revenue by Category">
          <AnalyticsPieChart items={data.byCategory.map((entry) => ({ label: entry.label, value: entry.revenueMmk }))} />
        </AnalyticsSection>
        <AnalyticsSection title="Revenue by Brand">
          <AnalyticsBarChart items={data.byBrand.map((entry) => ({ label: entry.label, value: entry.revenueMmk }))} />
        </AnalyticsSection>
        <AnalyticsSection title="Revenue by Payment Method">
          <AnalyticsBarChart items={data.byPaymentMethod.map((entry) => ({ label: entry.label, value: entry.revenueMmk }))} />
        </AnalyticsSection>
        <AnalyticsSection title="Revenue Tables">
          <AnalyticsTable
            columns={["Category", "Orders", "Revenue"]}
            rows={data.byCategory.map((entry) => [entry.label, entry.orders, formatMmk(entry.revenueMmk)])}
          />
        </AnalyticsSection>
      </div>
    </section>
  );
}
