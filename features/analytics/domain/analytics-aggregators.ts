import { buildRatingDistribution, calculateAverageRating } from "@/features/reviews/domain/rating-calculator";
import type {
  AnalyticsCustomerResponse,
  AnalyticsDateRange,
  AnalyticsOrderRecord,
  AnalyticsOrderResponse,
  AnalyticsOverviewResponse,
  AnalyticsPeriod,
  AnalyticsProductResponse,
  AnalyticsReviewResponse,
  AnalyticsRevenueResponse,
  AnalyticsSalesResponse,
  AnalyticsSnapshot
} from "@/types/analytics";

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function isWithinRange(dateValue: string, range: AnalyticsDateRange) {
  const date = parseDate(dateValue.slice(0, 10));
  return date >= parseDate(range.from) && date <= parseDate(range.to);
}

export function filterOrdersByRange(orders: AnalyticsOrderRecord[], range: AnalyticsDateRange) {
  return orders.filter((order) => isWithinRange(order.createdAt, range));
}

export function isPaidOrder(order: AnalyticsOrderRecord) {
  return order.paymentStatus === "paid";
}

export function mapAnalyticsOrderStatus(order: AnalyticsOrderRecord) {
  if (order.paymentStatus === "failed") {
    return "cancelled" as const;
  }

  if (order.status === "Completed") {
    return "delivered" as const;
  }

  if (order.shippingStatus === "shipped") {
    return "shipped" as const;
  }

  if (order.paymentStatus === "processing" || order.status === "Confirmed" || order.status === "Packed") {
    return "processing" as const;
  }

  if (order.paymentStatus === "paid") {
    return "paid" as const;
  }

  return "pending" as const;
}

function bucketLabel(date: Date, period: AnalyticsPeriod) {
  if (period === "yearly") {
    return String(date.getUTCFullYear());
  }

  if (period === "monthly") {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  if (period === "weekly") {
    const day = date.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(date);
    weekStart.setUTCDate(date.getUTCDate() + diff);
    return formatDateKey(weekStart);
  }

  return formatDateKey(date);
}

function buildTimeBuckets(range: AnalyticsDateRange, period: AnalyticsPeriod) {
  const buckets: string[] = [];
  const cursor = parseDate(range.from);
  const end = parseDate(range.to);

  while (cursor <= end) {
    const label = bucketLabel(cursor, period);

    if (buckets[buckets.length - 1] !== label) {
      buckets.push(label);
    }

    if (period === "yearly") {
      cursor.setUTCFullYear(cursor.getUTCFullYear() + 1);
      continue;
    }

    if (period === "monthly") {
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      continue;
    }

    if (period === "weekly") {
      cursor.setUTCDate(cursor.getUTCDate() + 7);
      continue;
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return buckets;
}

function sumRevenue(orders: AnalyticsOrderRecord[]) {
  return orders.filter(isPaidOrder).reduce((sum, order) => sum + order.totalMmk, 0);
}

function productNameLookup(snapshot: AnalyticsSnapshot) {
  return new Map(snapshot.products.map((product) => [product.id, product.name]));
}

export function buildOverviewAnalytics(snapshot: AnalyticsSnapshot, range: AnalyticsDateRange): AnalyticsOverviewResponse {
  const orders = filterOrdersByRange(snapshot.orders, range);
  const paidOrders = orders.filter(isPaidOrder);
  const totalRevenueMmk = sumRevenue(orders);
  const totalOrders = orders.length;
  const averageOrderValueMmk = paidOrders.length > 0 ? Math.round(totalRevenueMmk / paidOrders.length) : 0;
  const conversionRate = totalOrders > 0 ? Math.round((paidOrders.length / totalOrders) * 1000) / 10 : 0;
  const refundRate = 0;

  const couponUsageByCode = new Map<string, { code: string; name: string; usageCount: number; discountAmountMmk: number }>();

  for (const order of paidOrders) {
    if (!order.couponCode) {
      continue;
    }

    const current = couponUsageByCode.get(order.couponCode) ?? {
      code: order.couponCode,
      name: order.couponCode,
      usageCount: 0,
      discountAmountMmk: 0
    };

    current.usageCount += 1;
    current.discountAmountMmk += order.discountMmk;
    couponUsageByCode.set(order.couponCode, current);
  }

  for (const coupon of snapshot.coupons) {
    const current = couponUsageByCode.get(coupon.code);

    if (current) {
      current.name = coupon.name;
    }
  }

  return {
    range,
    kpis: {
      totalRevenueMmk,
      totalOrders,
      totalCustomers: snapshot.customers.length,
      totalProducts: snapshot.products.filter((product) => product.status === "Published").length,
      averageOrderValueMmk,
      conversionRate,
      refundRate
    },
    coupons: {
      totalCoupons: snapshot.coupons.length,
      activeCoupons: snapshot.coupons.filter((coupon) => coupon.enabled).length,
      couponUsage: paidOrders.filter((order) => Boolean(order.couponCode)).length,
      discountAmountMmk: paidOrders.reduce((sum, order) => sum + order.discountMmk, 0),
      topCoupons: Array.from(couponUsageByCode.values())
        .sort((left, right) => right.discountAmountMmk - left.discountAmountMmk || right.usageCount - left.usageCount)
        .slice(0, 5)
    },
    recentOrders: orders.slice(0, 8).map((order) => ({
      id: order.id,
      customer: order.customer,
      totalMmk: order.totalMmk,
      status: mapAnalyticsOrderStatus(order),
      createdAt: order.createdAt
    }))
  };
}

export function buildSalesAnalytics(
  snapshot: AnalyticsSnapshot,
  range: AnalyticsDateRange,
  period: AnalyticsPeriod
): AnalyticsSalesResponse {
  const orders = filterOrdersByRange(snapshot.orders, range);
  const buckets = buildTimeBuckets(range, period);
  const bucketMap = new Map(buckets.map((label) => [label, { label, orders: 0, revenueMmk: 0 }]));

  for (const order of orders) {
    const label = bucketLabel(parseDate(order.createdAt.slice(0, 10)), period);
    const bucket = bucketMap.get(label);

    if (!bucket) {
      continue;
    }

    bucket.orders += 1;

    if (isPaidOrder(order)) {
      bucket.revenueMmk += order.totalMmk;
    }
  }

  return {
    range,
    period,
    series: buckets.map((label) => bucketMap.get(label)!)
  };
}

export function buildRevenueAnalytics(snapshot: AnalyticsSnapshot, range: AnalyticsDateRange): AnalyticsRevenueResponse {
  const orders = filterOrdersByRange(snapshot.orders, range).filter(isPaidOrder);
  const paidOrderIds = new Set(orders.map((order) => order.id));
  const items = snapshot.orderItems.filter((item) => paidOrderIds.has(item.orderId));
  const productById = new Map(snapshot.products.map((product) => [product.id, product]));

  const byCategory = new Map<string, { label: string; revenueMmk: number; orders: number }>();
  const byBrand = new Map<string, { label: string; revenueMmk: number; orders: number }>();
  const byPaymentMethod = new Map<string, { label: string; revenueMmk: number; orders: number }>();
  const overTime = new Map<string, { label: string; revenueMmk: number }>();

  for (const item of items) {
    const product = productById.get(item.productId);
    const categoryLabel = product?.categoryName ?? "Uncategorized";
    const brandLabel = product?.brand || "Unbranded";
    const categoryEntry = byCategory.get(categoryLabel) ?? { label: categoryLabel, revenueMmk: 0, orders: 0 };
    categoryEntry.revenueMmk += item.lineTotalMmk;
    categoryEntry.orders += 1;
    byCategory.set(categoryLabel, categoryEntry);

    const brandEntry = byBrand.get(brandLabel) ?? { label: brandLabel, revenueMmk: 0, orders: 0 };
    brandEntry.revenueMmk += item.lineTotalMmk;
    brandEntry.orders += 1;
    byBrand.set(brandLabel, brandEntry);
  }

  for (const order of orders) {
    const paymentLabel = order.paymentProvider ?? order.channel;
    const paymentEntry = byPaymentMethod.get(paymentLabel) ?? { label: paymentLabel, revenueMmk: 0, orders: 0 };
    paymentEntry.revenueMmk += order.totalMmk;
    paymentEntry.orders += 1;
    byPaymentMethod.set(paymentLabel, paymentEntry);

    const timeLabel = order.createdAt.slice(0, 10);
    const timeEntry = overTime.get(timeLabel) ?? { label: timeLabel, revenueMmk: 0 };
    timeEntry.revenueMmk += order.totalMmk;
    overTime.set(timeLabel, timeEntry);
  }

  const sortByRevenue = <T extends { revenueMmk: number }>(entries: T[]) =>
    entries.sort((left, right) => right.revenueMmk - left.revenueMmk);

  return {
    range,
    byCategory: sortByRevenue(Array.from(byCategory.values())),
    byBrand: sortByRevenue(Array.from(byBrand.values())),
    byPaymentMethod: sortByRevenue(Array.from(byPaymentMethod.values())),
    overTime: Array.from(overTime.values()).sort((left, right) => left.label.localeCompare(right.label))
  };
}

export function buildProductAnalytics(
  snapshot: AnalyticsSnapshot,
  range: AnalyticsDateRange,
  limit: number
): AnalyticsProductResponse {
  const orders = filterOrdersByRange(snapshot.orders, range).filter(isPaidOrder);
  const paidOrderIds = new Set(orders.map((order) => order.id));
  const items = snapshot.orderItems.filter((item) => paidOrderIds.has(item.orderId));
  const productNames = productNameLookup(snapshot);
  const sales = new Map<string, { productId: string; name: string; units: number; revenueMmk: number }>();

  for (const item of items) {
    const current = sales.get(item.productId) ?? {
      productId: item.productId,
      name: item.productName,
      units: 0,
      revenueMmk: 0
    };
    current.units += item.quantity;
    current.revenueMmk += item.lineTotalMmk;
    sales.set(item.productId, current);
  }

  const sortedSales = Array.from(sales.values()).sort(
    (left, right) => right.units - left.units || right.revenueMmk - left.revenueMmk
  );

  const reviewGroups = new Map<string, Array<{ rating: number }>>();

  for (const review of snapshot.reviews.filter((entry) => entry.status === "published")) {
    const current = reviewGroups.get(review.productId) ?? [];
    current.push({ rating: review.rating });
    reviewGroups.set(review.productId, current);
  }

  const highestRated = Array.from(reviewGroups.entries())
    .map(([productId, reviews]) => ({
      productId,
      name: productNames.get(productId) ?? productId,
      averageRating: calculateAverageRating(reviews),
      reviewCount: reviews.length
    }))
    .filter((entry) => entry.reviewCount > 0)
    .sort((left, right) => right.averageRating - left.averageRating || right.reviewCount - left.reviewCount)
    .slice(0, limit);

  const mostReviewed = Array.from(reviewGroups.entries())
    .map(([productId, reviews]) => ({
      productId,
      name: productNames.get(productId) ?? productId,
      reviewCount: reviews.length
    }))
    .sort((left, right) => right.reviewCount - left.reviewCount)
    .slice(0, limit);

  const mostWishlisted = snapshot.wishlistCounts
    .map((entry) => ({
      productId: entry.productId,
      name: productNames.get(entry.productId) ?? entry.productId,
      wishlistCount: entry.count
    }))
    .sort((left, right) => right.wishlistCount - left.wishlistCount)
    .slice(0, limit);

  const lowStock = snapshot.products
    .filter((product) => product.stockQuantity <= product.lowStockWarning)
    .map((product) => ({
      productId: product.id,
      name: product.name,
      stockQuantity: product.stockQuantity,
      lowStockWarning: product.lowStockWarning
    }))
    .sort((left, right) => left.stockQuantity - right.stockQuantity)
    .slice(0, limit);

  return {
    range,
    topSelling: sortedSales.slice(0, limit),
    worstSelling: [...sortedSales].reverse().slice(0, limit),
    highestRated,
    mostReviewed,
    mostWishlisted,
    lowStock
  };
}

export function buildCustomerAnalytics(snapshot: AnalyticsSnapshot, range: AnalyticsDateRange): AnalyticsCustomerResponse {
  const orders = filterOrdersByRange(snapshot.orders, range);
  const paidOrders = orders.filter(isPaidOrder);
  const newCustomers = snapshot.customers.filter((customer) => isWithinRange(customer.createdAt.slice(0, 10), range)).length;

  const ordersByCustomer = new Map<string, { customerKey: string; name: string; orders: number; lifetimeValueMmk: number }>();

  for (const order of paidOrders) {
    const customerKey = order.accountId ?? `${order.customer}:${order.customer}`;
    const current = ordersByCustomer.get(customerKey) ?? {
      customerKey,
      name: order.customer,
      orders: 0,
      lifetimeValueMmk: 0
    };
    current.orders += 1;
    current.lifetimeValueMmk += order.totalMmk;
    ordersByCustomer.set(customerKey, current);
  }

  const returningCustomers = Array.from(ordersByCustomer.values()).filter((entry) => entry.orders > 1).length;
  const repeatPurchaseRate =
    ordersByCustomer.size > 0 ? Math.round((returningCustomers / ordersByCustomer.size) * 1000) / 10 : 0;
  const customerLifetimeValueMmk =
    ordersByCustomer.size > 0
      ? Math.round(
          Array.from(ordersByCustomer.values()).reduce((sum, entry) => sum + entry.lifetimeValueMmk, 0) /
            ordersByCustomer.size
        )
      : 0;

  const buckets = buildTimeBuckets(range, "monthly");
  const seriesMap = new Map(
    buckets.map((label) => [label, { label, newCustomers: 0, returningCustomers: 0 } as { label: string; newCustomers: number; returningCustomers: number }])
  );

  for (const customer of snapshot.customers) {
    const label = bucketLabel(parseDate(customer.createdAt.slice(0, 10)), "monthly");
    const bucket = seriesMap.get(label);

    if (bucket && isWithinRange(customer.createdAt.slice(0, 10), range)) {
      bucket.newCustomers += 1;
    }
  }

  for (const entry of Array.from(ordersByCustomer.values())) {
    if (entry.orders <= 1) {
      continue;
    }

    const matchingOrders = paidOrders.filter((order) => (order.accountId ?? order.customer) === entry.customerKey);

    for (const order of matchingOrders) {
      const label = bucketLabel(parseDate(order.createdAt.slice(0, 10)), "monthly");
      const bucket = seriesMap.get(label);

      if (bucket) {
        bucket.returningCustomers += 1;
      }
    }
  }

  return {
    range,
    newCustomers,
    returningCustomers,
    repeatPurchaseRate,
    topCustomers: Array.from(ordersByCustomer.values())
      .sort((left, right) => right.lifetimeValueMmk - left.lifetimeValueMmk || right.orders - left.orders)
      .slice(0, 10),
    customerLifetimeValueMmk,
    series: buckets.map((label) => seriesMap.get(label)!)
  };
}

export function buildOrderAnalytics(snapshot: AnalyticsSnapshot, range: AnalyticsDateRange): AnalyticsOrderResponse {
  const orders = filterOrdersByRange(snapshot.orders, range);
  const statuses = {
    pending: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0
  };

  for (const order of orders) {
    statuses[mapAnalyticsOrderStatus(order)] += 1;
  }

  return {
    range,
    statuses,
    recentOrders: orders.slice(0, 12).map((order) => ({
      id: order.id,
      customer: order.customer,
      totalMmk: order.totalMmk,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      createdAt: order.createdAt
    }))
  };
}

export function buildReviewAnalytics(snapshot: AnalyticsSnapshot, range: AnalyticsDateRange): AnalyticsReviewResponse {
  const reviews = snapshot.reviews.filter((review) => isWithinRange(review.createdAt.slice(0, 10), range));
  const publishedReviews = reviews.filter((review) => review.status === "published");
  const distribution = buildRatingDistribution(publishedReviews);

  return {
    range,
    averageRating: calculateAverageRating(publishedReviews),
    totalReviews: publishedReviews.length,
    pendingReviews: reviews.filter((review) => review.status === "pending").length,
    distribution: {
      "1": distribution[1],
      "2": distribution[2],
      "3": distribution[3],
      "4": distribution[4],
      "5": distribution[5]
    }
  };
}
