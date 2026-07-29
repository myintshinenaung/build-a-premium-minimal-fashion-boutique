import { describe, expect, it } from "vitest";
import {
  buildCustomerAnalytics,
  buildOrderAnalytics,
  buildOverviewAnalytics,
  buildProductAnalytics,
  buildReviewAnalytics,
  buildRevenueAnalytics,
  buildSalesAnalytics,
  mapAnalyticsOrderStatus
} from "@/features/analytics/domain/analytics-aggregators";
import type { AnalyticsSnapshot } from "@/types/analytics";

const snapshot: AnalyticsSnapshot = {
  orders: [
    {
      id: "ORD-1",
      accountId: "ACC-1",
      customer: "Aye Aye",
      totalMmk: 120000,
      subtotalMmk: 120000,
      discountMmk: 10000,
      status: "Completed",
      paymentStatus: "paid",
      paymentProvider: "stripe",
      channel: "Web",
      shippingStatus: "shipped",
      couponId: "CPN-1",
      couponCode: "WELCOME10",
      createdAt: "2026-07-01",
      paidAt: "2026-07-01T10:00:00.000Z"
    },
    {
      id: "ORD-2",
      accountId: "ACC-2",
      customer: "Min Khant",
      totalMmk: 80000,
      subtotalMmk: 80000,
      discountMmk: 0,
      status: "Pending",
      paymentStatus: "pending",
      paymentProvider: null,
      channel: "Web",
      shippingStatus: "pending",
      couponId: null,
      couponCode: null,
      createdAt: "2026-07-10",
      paidAt: null
    },
    {
      id: "ORD-3",
      accountId: "ACC-1",
      customer: "Aye Aye",
      totalMmk: 50000,
      subtotalMmk: 50000,
      discountMmk: 0,
      status: "Confirmed",
      paymentStatus: "processing",
      paymentProvider: "stripe",
      channel: "Web",
      shippingStatus: "pending",
      couponId: null,
      couponCode: null,
      createdAt: "2026-07-15",
      paidAt: null
    }
  ],
  orderItems: [
    { orderId: "ORD-1", productId: "PROD-1", productName: "Silk Dress", quantity: 1, lineTotalMmk: 120000, isPaid: true },
    { orderId: "ORD-2", productId: "PROD-2", productName: "Wool Blazer", quantity: 1, lineTotalMmk: 80000, isPaid: false },
    { orderId: "ORD-3", productId: "PROD-1", productName: "Silk Dress", quantity: 1, lineTotalMmk: 50000, isPaid: false }
  ],
  products: [
    {
      id: "PROD-1",
      name: "Silk Dress",
      brand: "Daily Outfit",
      categoryId: "CAT-1",
      categoryName: "Dresses",
      stockQuantity: 2,
      lowStockWarning: 5,
      status: "Published"
    },
    {
      id: "PROD-2",
      name: "Wool Blazer",
      brand: "Luxe Lane",
      categoryId: "CAT-2",
      categoryName: "Outerwear",
      stockQuantity: 12,
      lowStockWarning: 5,
      status: "Published"
    }
  ],
  customers: [
    { id: "ACC-1", name: "Aye Aye", email: "aye@example.com", createdAt: "2026-07-01T08:00:00.000Z" },
    { id: "ACC-2", name: "Min Khant", email: "min@example.com", createdAt: "2026-07-09T08:00:00.000Z" }
  ],
  reviews: [
    { id: "REV-1", productId: "PROD-1", rating: 5, status: "published", createdAt: "2026-07-02T08:00:00.000Z" },
    { id: "REV-2", productId: "PROD-1", rating: 4, status: "published", createdAt: "2026-07-03T08:00:00.000Z" },
    { id: "REV-3", productId: "PROD-2", rating: 3, status: "pending", createdAt: "2026-07-12T08:00:00.000Z" }
  ],
  coupons: [{ id: "CPN-1", code: "WELCOME10", name: "Welcome 10", enabled: true, usageCount: 1, usageLimit: 100 }],
  wishlistCounts: [
    { productId: "PROD-1", count: 4 },
    { productId: "PROD-2", count: 1 }
  ]
};

const range = { from: "2026-07-01", to: "2026-07-31" };

describe("analytics aggregators", () => {
  it("maps order statuses for analytics buckets", () => {
    expect(mapAnalyticsOrderStatus(snapshot.orders[0])).toBe("delivered");
    expect(mapAnalyticsOrderStatus(snapshot.orders[1])).toBe("pending");
    expect(mapAnalyticsOrderStatus(snapshot.orders[2])).toBe("processing");
  });

  it("builds overview KPIs and coupon analytics", () => {
    const overview = buildOverviewAnalytics(snapshot, range);

    expect(overview.kpis.totalRevenueMmk).toBe(120000);
    expect(overview.kpis.totalOrders).toBe(3);
    expect(overview.kpis.totalCustomers).toBe(2);
    expect(overview.coupons.discountAmountMmk).toBe(10000);
    expect(overview.coupons.topCoupons[0]?.code).toBe("WELCOME10");
  });

  it("builds sales and revenue analytics", () => {
    const sales = buildSalesAnalytics(snapshot, range, "daily");
    const revenue = buildRevenueAnalytics(snapshot, range);

    expect(sales.series.some((entry) => entry.revenueMmk === 120000)).toBe(true);
    expect(revenue.byCategory[0]?.label).toBe("Dresses");
    expect(revenue.byBrand[0]?.label).toBe("Daily Outfit");
  });

  it("builds product, customer, order, and review analytics", () => {
    const products = buildProductAnalytics(snapshot, range, 5);
    const customers = buildCustomerAnalytics(snapshot, range);
    const orders = buildOrderAnalytics(snapshot, range);
    const reviews = buildReviewAnalytics(snapshot, range);

    expect(products.topSelling[0]?.productId).toBe("PROD-1");
    expect(products.mostWishlisted[0]?.wishlistCount).toBe(4);
    expect(products.lowStock[0]?.productId).toBe("PROD-1");
    expect(customers.topCustomers[0]?.lifetimeValueMmk).toBe(120000);
    expect(orders.statuses.delivered).toBe(1);
    expect(reviews.averageRating).toBe(4.5);
    expect(reviews.pendingReviews).toBe(1);
  });
});

