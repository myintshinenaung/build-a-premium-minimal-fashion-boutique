import type {
  OrderChannel,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  ShippingStatus
} from "@/lib/supabase/types";
import type { ReviewStatus } from "@/types/review";

export type AnalyticsDateRange = {
  from: string;
  to: string;
};

export type AnalyticsPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type AnalyticsOrderRecord = {
  id: string;
  accountId: string | null;
  customer: string;
  totalMmk: number;
  subtotalMmk: number;
  discountMmk: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider | null;
  channel: OrderChannel;
  shippingStatus: ShippingStatus;
  couponId: string | null;
  couponCode: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type AnalyticsOrderItemRecord = {
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  lineTotalMmk: number;
  isPaid: boolean;
};

export type AnalyticsProductRecord = {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  stockQuantity: number;
  lowStockWarning: number;
  status: string;
};

export type AnalyticsCustomerRecord = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AnalyticsReviewRecord = {
  id: string;
  productId: string;
  rating: number;
  status: ReviewStatus;
  createdAt: string;
};

export type AnalyticsCouponRecord = {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  usageCount: number;
  usageLimit: number | null;
};

export type AnalyticsWishlistRecord = {
  productId: string;
  count: number;
};

export type AnalyticsSnapshot = {
  orders: AnalyticsOrderRecord[];
  orderItems: AnalyticsOrderItemRecord[];
  products: AnalyticsProductRecord[];
  customers: AnalyticsCustomerRecord[];
  reviews: AnalyticsReviewRecord[];
  coupons: AnalyticsCouponRecord[];
  wishlistCounts: AnalyticsWishlistRecord[];
};

export type AnalyticsOverviewResponse = {
  range: AnalyticsDateRange;
  kpis: {
    totalRevenueMmk: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    averageOrderValueMmk: number;
    conversionRate: number;
    refundRate: number;
  };
  coupons: {
    totalCoupons: number;
    activeCoupons: number;
    couponUsage: number;
    discountAmountMmk: number;
    topCoupons: Array<{ code: string; name: string; usageCount: number; discountAmountMmk: number }>;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    totalMmk: number;
    status: string;
    createdAt: string;
  }>;
};

export type AnalyticsSalesResponse = {
  range: AnalyticsDateRange;
  period: AnalyticsPeriod;
  series: Array<{ label: string; orders: number; revenueMmk: number }>;
};

export type AnalyticsRevenueResponse = {
  range: AnalyticsDateRange;
  byCategory: Array<{ label: string; revenueMmk: number; orders: number }>;
  byBrand: Array<{ label: string; revenueMmk: number; orders: number }>;
  byPaymentMethod: Array<{ label: string; revenueMmk: number; orders: number }>;
  overTime: Array<{ label: string; revenueMmk: number }>;
};

export type AnalyticsProductResponse = {
  range: AnalyticsDateRange;
  topSelling: Array<{ productId: string; name: string; units: number; revenueMmk: number }>;
  worstSelling: Array<{ productId: string; name: string; units: number; revenueMmk: number }>;
  highestRated: Array<{ productId: string; name: string; averageRating: number; reviewCount: number }>;
  mostReviewed: Array<{ productId: string; name: string; reviewCount: number }>;
  mostWishlisted: Array<{ productId: string; name: string; wishlistCount: number }>;
  lowStock: Array<{ productId: string; name: string; stockQuantity: number; lowStockWarning: number }>;
};

export type AnalyticsCustomerResponse = {
  range: AnalyticsDateRange;
  newCustomers: number;
  returningCustomers: number;
  repeatPurchaseRate: number;
  topCustomers: Array<{ customerKey: string; name: string; orders: number; lifetimeValueMmk: number }>;
  customerLifetimeValueMmk: number;
  series: Array<{ label: string; newCustomers: number; returningCustomers: number }>;
};

export type AnalyticsOrderResponse = {
  range: AnalyticsDateRange;
  statuses: Record<
    "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded",
    number
  >;
  recentOrders: Array<{
    id: string;
    customer: string;
    totalMmk: number;
    status: string;
    paymentStatus: string;
    shippingStatus: string;
    createdAt: string;
  }>;
};

export type AnalyticsReviewResponse = {
  range: AnalyticsDateRange;
  averageRating: number;
  totalReviews: number;
  pendingReviews: number;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
};
