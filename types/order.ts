import type { OrderChannel, OrderStatus, PaymentProvider, PaymentStatus } from "@/lib/supabase/types";

export type StorefrontOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  image: string;
  size: string;
  color: string;
  unitPriceMmk: number;
  quantity: number;
  lineTotalMmk: number;
};

export type StorefrontOrder = {
  id: string;
  customer: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  township: string;
  notes: string;
  subtotalMmk: number;
  shippingMmk: number;
  totalMmk: number;
  status: OrderStatus;
  channel: OrderChannel;
  paymentId: string | null;
  paymentProvider: PaymentProvider | null;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  items: StorefrontOrderItem[];
};
