import type { Metadata } from "next";
import { Suspense } from "react";
import {
  DollarSign,
  Package,
  Percent,
  RotateCcw,
  ShoppingBag,
  Star,
  Users
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatMmk } from "@/lib/admin-data";
import {
  AnalyticsDateRangeFilter,
  AnalyticsKpiGrid,
  AnalyticsSection,
  AnalyticsTable
} from "@/features/analytics/client";
import { getAnalyticsOverview } from "@/features/analytics/server";

export const metadata: Metadata = {
  title: "Analytics Overview"
};

export const dynamic = "force-dynamic";

type AnalyticsOverviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsOverviewPage({ searchParams }: AnalyticsOverviewPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getAnalyticsOverview(resolvedSearchParams ?? {});

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Analytics Overview"
        description="Revenue, order, customer, coupon, and operational KPIs for the selected date range."
      />

      <Suspense fallback={<div className="h-24 border border-line bg-white" />}>
        <AnalyticsDateRangeFilter from={data.range.from} to={data.range.to} />
      </Suspense>

      <AnalyticsKpiGrid
        items={[
          {
            label: "Total Revenue",
            value: formatMmk(data.kpis.totalRevenueMmk),
            helper: "Paid orders in range",
            icon: <DollarSign size={19} strokeWidth={1.7} />
          },
          {
            label: "Total Orders",
            value: String(data.kpis.totalOrders),
            helper: "Orders placed in range",
            icon: <ShoppingBag size={19} strokeWidth={1.7} />
          },
          {
            label: "Total Customers",
            value: String(data.kpis.totalCustomers),
            helper: "Registered customer accounts",
            icon: <Users size={19} strokeWidth={1.7} />
          },
          {
            label: "Total Products",
            value: String(data.kpis.totalProducts),
            helper: "Published catalog products",
            icon: <Package size={19} strokeWidth={1.7} />
          },
          {
            label: "Average Order Value",
            value: formatMmk(data.kpis.averageOrderValueMmk),
            helper: "Based on paid orders",
            icon: <DollarSign size={19} strokeWidth={1.7} />
          },
          {
            label: "Conversion Rate",
            value: `${data.kpis.conversionRate}%`,
            helper: "Paid orders / total orders",
            icon: <Percent size={19} strokeWidth={1.7} />
          },
          {
            label: "Refund Rate",
            value: `${data.kpis.refundRate}%`,
            helper: "Refunds are not tracked in the current schema",
            icon: <RotateCcw size={19} strokeWidth={1.7} />
          }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsSection title="Coupon Analytics" description="Usage and discount totals for the selected range.">
          <AnalyticsKpiGrid
            items={[
              {
                label: "Total Coupons",
                value: String(data.coupons.totalCoupons),
                helper: `${data.coupons.activeCoupons} active`,
                icon: <Star size={19} strokeWidth={1.7} />
              },
              {
                label: "Coupon Usage",
                value: String(data.coupons.couponUsage),
                helper: `${formatMmk(data.coupons.discountAmountMmk)} discounted`,
                icon: <RotateCcw size={19} strokeWidth={1.7} />
              }
            ]}
          />
          <div className="mt-6">
            <AnalyticsTable
              columns={["Coupon", "Usage", "Discount"]}
              rows={data.coupons.topCoupons.map((coupon) => [coupon.code, coupon.usageCount, formatMmk(coupon.discountAmountMmk)])}
            />
          </div>
        </AnalyticsSection>

        <AnalyticsSection title="Recent Orders" description="Latest orders within the selected range.">
          <AnalyticsTable
            columns={["Order", "Customer", "Total", "Status", "Date"]}
            rows={data.recentOrders.map((order) => [
              order.id,
              order.customer,
              formatMmk(order.totalMmk),
              order.status,
              order.createdAt
            ])}
          />
        </AnalyticsSection>
      </div>
    </section>
  );
}
