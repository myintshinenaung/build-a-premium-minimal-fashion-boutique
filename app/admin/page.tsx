import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Package, ShoppingBag, Star, Users } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatMmk } from "@/lib/admin-data";
import { categoryService, orderService, productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Dashboard Overview"
};

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [adminProducts, adminCategories, adminOrders] = await Promise.all([productService.getProducts(), categoryService.getCategories(), orderService.getOrders()]);
  const publishedProducts = adminProducts.filter((product) => product.status === "Published").length;
  const lowStockProducts = adminProducts.filter((product) => product.stockQuantity <= product.lowStockWarning).length;
  const orderTotal = adminOrders.reduce((sum, order) => sum + order.totalMmk, 0);
  const featuredProducts = adminProducts.filter((product) => product.featured).slice(0, 4);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Dashboard Overview"
        description="A calm Version 2 operational snapshot for catalog, order, customer, and stock management."
        action={
          <Link
            href="/admin/products"
            className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-stone"
          >
            Manage Products
            <ArrowRight size={17} strokeWidth={1.7} />
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Products" value={String(adminProducts.length)} helper={`${publishedProducts} published`} icon={<Package size={19} strokeWidth={1.7} />} />
        <AdminMetricCard label="Orders" value={String(adminOrders.length)} helper={`${formatMmk(orderTotal)} in order value`} icon={<ShoppingBag size={19} strokeWidth={1.7} />} />
        <AdminMetricCard label="Categories" value={String(adminCategories.length)} helper="Reorderable catalog groups" icon={<Star size={19} strokeWidth={1.7} />} />
        <AdminMetricCard label="Customers" value="3" helper={`${lowStockProducts} low-stock products`} icon={<Users size={19} strokeWidth={1.7} />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="border border-line bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-line p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Featured products</p>
              <h2 className="mt-2 text-xl font-medium text-ink">Homepage-ready edit</h2>
            </div>
            <Link href="/admin/products" className="text-sm text-stone underline underline-offset-8">
              View all
            </Link>
          </div>
          <div className="divide-y divide-line">
            {featuredProducts.map((product) => (
              <div key={product.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-medium text-ink">{product.name}</p>
                  <p className="mt-1 text-sm text-stone">
                    {product.sku} - Stock {product.stockQuantity} - Warn {product.lowStockWarning}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <AdminStatusBadge status={product.status} />
                  <span className="text-sm text-ink">{formatMmk(product.priceMmk)}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-line bg-white">
          <div className="border-b border-line p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone">Recent orders</p>
            <h2 className="mt-2 text-xl font-medium text-ink">Order placeholders</h2>
          </div>
          <div className="divide-y divide-line">
            {adminOrders.map((order) => (
              <div key={order.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">{order.id}</p>
                    <p className="mt-1 text-sm text-stone">{order.customer}</p>
                  </div>
                  <AdminStatusBadge status={order.status} />
                </div>
                <p className="mt-4 text-sm text-stone">
                  {formatMmk(order.totalMmk)} via {order.channel}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
