import type { OrderChannel, OrderStatus } from "@/lib/supabase/types";

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
  createdAt: string;
  items: StorefrontOrderItem[];
};
