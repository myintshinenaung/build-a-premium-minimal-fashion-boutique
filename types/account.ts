import type { Locale } from "@/features/i18n/domain/config";

export type CustomerProfile = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  preferredLanguage: Locale;
  createdAt: string;
  updatedAt: string;
};

export type CustomerAddress = {
  id: string;
  accountId: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  township: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderTimelineEvent = {
  key: string;
  label: string;
  at: string;
  description?: string;
};

export type AccountOrderSummary = {
  id: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  totalMmk: number;
  createdAt: string;
  itemCount: number;
};

export type AccountOrderDetail = AccountOrderSummary & {
  customer: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  township: string;
  notes: string;
  subtotalMmk: number;
  shippingMmk: number;
  paymentProvider: string | null;
  paidAt: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  items: Array<{
    id: string;
    productName: string;
    productSlug: string;
    image: string;
    size: string;
    color: string;
    quantity: number;
    lineTotalMmk: number;
  }>;
  timeline: OrderTimelineEvent[];
};
