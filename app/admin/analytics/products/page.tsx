import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatMmk } from "@/lib/admin-data";
import { AnalyticsDateRangeFilter, AnalyticsSection, AnalyticsTable } from "@/features/analytics/client";
import { getAnalyticsProducts } from "@/features/analytics/server";

export const metadata: Metadata = {
  title: "Product Analytics"
};

export const dynamic = "force-dynamic";

type AnalyticsProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsProductsPage({ searchParams }: AnalyticsProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getAnalyticsProducts(resolvedSearchParams ?? {});

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Product Analytics" description="Sales, ratings, wishlist, and stock performance by product." />

      <Suspense fallback={<div className="h-24 border border-line bg-white" />}>
        <AnalyticsDateRangeFilter from={data.range.from} to={data.range.to} />
      </Suspense>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsSection title="Top Selling Products">
          <AnalyticsTable
            columns={["Product", "Units", "Revenue"]}
            rows={data.topSelling.map((product) => [product.name, product.units, formatMmk(product.revenueMmk)])}
          />
        </AnalyticsSection>
        <AnalyticsSection title="Worst Selling Products">
          <AnalyticsTable
            columns={["Product", "Units", "Revenue"]}
            rows={data.worstSelling.map((product) => [product.name, product.units, formatMmk(product.revenueMmk)])}
          />
        </AnalyticsSection>
        <AnalyticsSection title="Highest Rated Products">
          <AnalyticsTable
            columns={["Product", "Rating", "Reviews"]}
            rows={data.highestRated.map((product) => [product.name, product.averageRating, product.reviewCount])}
          />
        </AnalyticsSection>
        <AnalyticsSection title="Most Reviewed Products">
          <AnalyticsTable
            columns={["Product", "Reviews"]}
            rows={data.mostReviewed.map((product) => [product.name, product.reviewCount])}
          />
        </AnalyticsSection>
        <AnalyticsSection title="Most Wishlisted Products">
          <AnalyticsTable
            columns={["Product", "Wishlists"]}
            rows={data.mostWishlisted.map((product) => [product.name, product.wishlistCount])}
          />
        </AnalyticsSection>
        <AnalyticsSection title="Low Stock Products">
          <AnalyticsTable
            columns={["Product", "Stock", "Warning"]}
            rows={data.lowStock.map((product) => [product.name, product.stockQuantity, product.lowStockWarning])}
          />
        </AnalyticsSection>
      </div>
    </section>
  );
}
