import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatMmk } from "@/lib/admin-data";
import {
  AnalyticsDateRangeFilter,
  AnalyticsPieChart,
  AnalyticsSection,
  AnalyticsTable
} from "@/features/analytics/client";
import { getAnalyticsOrders } from "@/features/analytics/server";

export const metadata: Metadata = {
  title: "Order Analytics"
};

export const dynamic = "force-dynamic";

type AnalyticsOrdersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsOrdersPage({ searchParams }: AnalyticsOrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getAnalyticsOrders(resolvedSearchParams ?? {});

  const statusItems = Object.entries(data.statuses).map(([label, value]) => ({ label, value }));

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Order Analytics" description="Operational order status distribution and recent activity." />

      <Suspense fallback={<div className="h-24 border border-line bg-white" />}>
        <AnalyticsDateRangeFilter from={data.range.from} to={data.range.to} />
      </Suspense>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsSection title="Order Status Distribution">
          <AnalyticsPieChart items={statusItems.filter((item) => item.value > 0)} />
        </AnalyticsSection>
        <AnalyticsSection title="Status Counts">
          <AnalyticsTable columns={["Status", "Orders"]} rows={statusItems.map((item) => [item.label, item.value])} />
        </AnalyticsSection>
      </div>

      <AnalyticsSection title="Recent Orders">
        <AnalyticsTable
          columns={["Order", "Customer", "Total", "Status", "Payment", "Shipping", "Date"]}
          rows={data.recentOrders.map((order) => [
            order.id,
            order.customer,
            formatMmk(order.totalMmk),
            order.status,
            order.paymentStatus,
            order.shippingStatus,
            order.createdAt
          ])}
        />
      </AnalyticsSection>
    </section>
  );
}
