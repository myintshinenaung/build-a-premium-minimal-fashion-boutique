import { cache } from "react";
import { categoryService } from "@/features/catalog/application/category-service";
import { productService } from "@/features/catalog/application/product-service";
import { couponRepository } from "@/features/promotions/infrastructure/coupon-repository";
import { reviewRepository } from "@/features/reviews/infrastructure/review-repository";
import { CACHE_TAGS, CACHE_TTLS } from "@/features/performance/domain/cache-tags";
import { createCachedLoader } from "@/features/performance/infrastructure/cache-store";
import { timedQuery } from "@/features/performance/infrastructure/metrics-store";
import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AnalyticsCustomerRecord,
  AnalyticsOrderItemRecord,
  AnalyticsOrderRecord,
  AnalyticsSnapshot,
  AnalyticsWishlistRecord
} from "@/types/analytics";

const loadAnalyticsSnapshotData = createCachedLoader(
  "analytics-snapshot",
  [CACHE_TAGS.analytics],
  CACHE_TTLS.analytics,
  async (): Promise<AnalyticsSnapshot> => {
    const supabase = createSupabaseServerClient();

    const [adminProducts, adminCategories, coupons, reviews, ordersResult, orderItemsResult, customersResult, wishlistResult] =
      await timedQuery("analytics.snapshot", () =>
        Promise.all([
          productService.getProducts(),
          categoryService.getCategories(),
          couponRepository.list(),
          reviewRepository.listAllForAdmin(),
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("order_items").select("*"),
          supabase.from("customer_accounts").select("*").order("created_at", { ascending: false }),
          supabase.from("wishlist").select("product_id")
        ])
      );

    if (ordersResult.error) {
      throw createRepositoryError("Unable to load analytics orders", ordersResult.error);
    }

    if (orderItemsResult.error) {
      throw createRepositoryError("Unable to load analytics order items", orderItemsResult.error);
    }

    if (customersResult.error && !isRecoverableReadError(customersResult.error)) {
      throw createRepositoryError("Unable to load analytics customers", customersResult.error);
    }

    if (wishlistResult.error && !isRecoverableReadError(wishlistResult.error)) {
      throw createRepositoryError("Unable to load analytics wishlist counts", wishlistResult.error);
    }

    const paidOrderIds = new Set(
      (ordersResult.data ?? []).filter((order) => order.payment_status === "paid").map((order) => order.id)
    );
    const categoryNameById = new Map(adminCategories.map((category) => [category.id, category.name]));
    const wishlistCounts = new Map<string, number>();

    for (const row of wishlistResult.data ?? []) {
      wishlistCounts.set(row.product_id, (wishlistCounts.get(row.product_id) ?? 0) + 1);
    }

    const orders: AnalyticsOrderRecord[] = (ordersResult.data ?? []).map((order) => ({
      id: order.id,
      accountId: order.account_id,
      customer: order.customer,
      totalMmk: order.total_mmk,
      subtotalMmk: order.subtotal_mmk,
      discountMmk: order.discount_mmk,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentProvider: order.payment_provider,
      channel: order.channel,
      shippingStatus: order.shipping_status,
      couponId: order.coupon_id,
      couponCode: order.coupon_code,
      createdAt: order.created_at,
      paidAt: order.paid_at
    }));

    const orderItems: AnalyticsOrderItemRecord[] = (orderItemsResult.data ?? []).map((item) => ({
      orderId: item.order_id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      lineTotalMmk: item.line_total_mmk,
      isPaid: paidOrderIds.has(item.order_id)
    }));

    const customers: AnalyticsCustomerRecord[] = (customersResult.data ?? []).map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      createdAt: customer.created_at
    }));

    const wishlistRecords: AnalyticsWishlistRecord[] = Array.from(wishlistCounts.entries()).map(([productId, count]) => ({
      productId,
      count
    }));

    return {
      orders,
      orderItems,
      products: adminProducts.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        categoryId: product.categoryId,
        categoryName: categoryNameById.get(product.categoryId) ?? "Uncategorized",
        stockQuantity: product.stockQuantity,
        lowStockWarning: product.lowStockWarning,
        status: product.status
      })),
      customers,
      reviews: reviews.map((review) => ({
        id: review.id,
        productId: review.productId,
        rating: review.rating,
        status: review.status,
        createdAt: review.createdAt
      })),
      coupons: coupons.map((coupon) => ({
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        enabled: coupon.enabled,
        usageCount: coupon.usageCount,
        usageLimit: coupon.usageLimit
      })),
      wishlistCounts: wishlistRecords
    };
  }
);

const loadAnalyticsSnapshot = cache(loadAnalyticsSnapshotData);

export const analyticsRepository = {
  loadSnapshot: loadAnalyticsSnapshot
};
