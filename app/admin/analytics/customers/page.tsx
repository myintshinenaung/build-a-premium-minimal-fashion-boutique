import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatMmk } from "@/lib/admin-data";
import {
  AnalyticsBarChart,
  AnalyticsDateRangeFilter,
  AnalyticsKpiGrid,
  AnalyticsSection,
  AnalyticsTable
} from "@/features/analytics/client";
import { getAnalyticsCustomers } from "@/features/analytics/server";
import { Repeat, UserPlus, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Customer Analytics"
};

export const dynamic = "force-dynamic";

type AnalyticsCustomersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsCustomersPage({ searchParams }: AnalyticsCustomersPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getAnalyticsCustomers(resolvedSearchParams ?? {});

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Customer Analytics" description="Acquisition, retention, and lifetime value insights." />

      <Suspense fallback={<div className="h-24 border border-line bg-white" />}>
        <AnalyticsDateRangeFilter from={data.range.from} to={data.range.to} />
      </Suspense>

      <AnalyticsKpiGrid
        items={[
          {
            label: "New Customers",
            value: String(data.newCustomers),
            helper: "Created in selected range",
            icon: <UserPlus size={19} strokeWidth={1.7} />
          },
          {
            label: "Returning Customers",
            value: String(data.returningCustomers),
            helper: `${data.repeatPurchaseRate}% repeat purchase rate`,
            icon: <Repeat size={19} strokeWidth={1.7} />
          },
          {
            label: "Customer LTV",
            value: formatMmk(data.customerLifetimeValueMmk),
            helper: "Average lifetime value",
            icon: <Users size={19} strokeWidth={1.7} />
          }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsSection title="Customer Growth">
          <AnalyticsBarChart
            items={data.series.map((entry) => ({ label: entry.label, value: entry.newCustomers + entry.returningCustomers }))}
          />
        </AnalyticsSection>
        <AnalyticsSection title="Top Customers">
          <AnalyticsTable
            columns={["Customer", "Orders", "Lifetime Value"]}
            rows={data.topCustomers.map((customer) => [customer.name, customer.orders, formatMmk(customer.lifetimeValueMmk)])}
          />
        </AnalyticsSection>
      </div>
    </section>
  );
}
