import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderItemRow, OrderRow, PaymentProvider, PaymentStatus, ShippingStatus } from "@/lib/supabase/types";
import type { AdminOrder } from "@/types/admin";
import type { StorefrontOrder, StorefrontOrderItem } from "@/types/order";

export type OrderCreateInput = {
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
  channel: "Web";
  status: AdminOrder["status"];
  items: Array<{
    id: string;
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
  }>;
};

export type OrderPaymentUpdateInput = {
  orderId: string;
  paymentId?: string | null;
  paymentProvider?: PaymentProvider | null;
  paymentStatus: PaymentStatus;
  paidAt?: string | null;
  status?: AdminOrder["status"];
};

export type OrderShippingUpdateInput = {
  orderId: string;
  shippingStatus: ShippingStatus;
  carrier: string;
  trackingNumber: string;
  status?: AdminOrder["status"];
};

export const orderRepository = {
  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(orderFromRow);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load orders", error);
    }
  },

  async getById(id: string): Promise<StorefrontOrder | null> {
    try {
      const supabase = createSupabaseServerClient();
      const [{ data: order, error: orderError }, { data: items, error: itemsError }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", id).order("product_name", { ascending: true })
      ]);

      if (orderError) {
        throw orderError;
      }

      if (itemsError) {
        throw itemsError;
      }

      if (!order) {
        return null;
      }

      return storefrontOrderFromRow(order, items ?? []);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return null;
      }

      throw createRepositoryError("Unable to load order", error);
    }
  },

  async create(input: OrderCreateInput): Promise<StorefrontOrder> {
    try {
      const supabase = createSupabaseServerClient();
      const createdAt = new Date().toISOString().slice(0, 10);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          id: input.id,
          customer: input.customer,
          customer_phone: input.customerPhone,
          customer_email: input.customerEmail,
          shipping_address: input.shippingAddress,
          township: input.township,
          notes: input.notes,
          subtotal_mmk: input.subtotalMmk,
          shipping_mmk: input.shippingMmk,
          total_mmk: input.totalMmk,
          status: input.status,
          channel: input.channel,
          payment_id: null,
          payment_provider: null,
          payment_status: "pending",
          paid_at: null,
          shipping_status: "pending",
          tracking_number: null,
          carrier: null,
          created_at: createdAt
        })
        .select("*")
        .single();

      if (orderError) {
        throw orderError;
      }

      const orderItems: OrderItemRow[] = input.items.map((item) => ({
        id: item.id,
        order_id: input.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        product_slug: item.productSlug,
        image: item.image,
        size: item.size,
        color: item.color,
        unit_price_mmk: item.unitPriceMmk,
        quantity: item.quantity,
        line_total_mmk: item.lineTotalMmk
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) {
        await supabase.from("orders").delete().eq("id", input.id);
        throw itemsError;
      }

      return storefrontOrderFromRow(order, orderItems);
    } catch (error) {
      throw createRepositoryError("Unable to create order", error);
    }
  },

  async updatePayment(input: OrderPaymentUpdateInput): Promise<StorefrontOrder | null> {
    try {
      const supabase = createSupabaseServerClient();
      const updatePayload: {
        payment_status: PaymentStatus;
        payment_id?: string | null;
        payment_provider?: PaymentProvider | null;
        paid_at?: string | null;
        status?: AdminOrder["status"];
      } = {
        payment_status: input.paymentStatus
      };

      if (input.paymentId !== undefined) {
        updatePayload.payment_id = input.paymentId;
      }

      if (input.paymentProvider !== undefined) {
        updatePayload.payment_provider = input.paymentProvider;
      }

      if (input.paidAt !== undefined) {
        updatePayload.paid_at = input.paidAt;
      }

      if (input.status) {
        updatePayload.status = input.status;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", input.orderId)
        .select("*")
        .maybeSingle();

      if (orderError) {
        throw orderError;
      }

      if (!order) {
        return null;
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", input.orderId)
        .order("product_name", { ascending: true });

      if (itemsError) {
        throw itemsError;
      }

      return storefrontOrderFromRow(order, items ?? []);
    } catch (error) {
      throw createRepositoryError("Unable to update order payment", error);
    }
  },

  async updateShipping(input: OrderShippingUpdateInput): Promise<StorefrontOrder | null> {
    try {
      const supabase = createSupabaseServerClient();
      const updatePayload: {
        shipping_status: ShippingStatus;
        carrier: string;
        tracking_number: string;
        status?: AdminOrder["status"];
      } = {
        shipping_status: input.shippingStatus,
        carrier: input.carrier,
        tracking_number: input.trackingNumber
      };

      if (input.status) {
        updatePayload.status = input.status;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", input.orderId)
        .select("*")
        .maybeSingle();

      if (orderError) {
        throw orderError;
      }

      if (!order) {
        return null;
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", input.orderId)
        .order("product_name", { ascending: true });

      if (itemsError) {
        throw itemsError;
      }

      return storefrontOrderFromRow(order, items ?? []);
    } catch (error) {
      throw createRepositoryError("Unable to update order shipping", error);
    }
  }
};

function orderFromRow(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    customer: row.customer,
    totalMmk: row.total_mmk,
    status: row.status,
    channel: row.channel,
    shippingStatus: row.shipping_status,
    carrier: row.carrier,
    trackingNumber: row.tracking_number,
    createdAt: row.created_at
  };
}

function orderItemFromRow(row: OrderItemRow): StorefrontOrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    variantId: row.variant_id,
    productName: row.product_name,
    productSlug: row.product_slug,
    image: row.image,
    size: row.size,
    color: row.color,
    unitPriceMmk: row.unit_price_mmk,
    quantity: row.quantity,
    lineTotalMmk: row.line_total_mmk
  };
}

function storefrontOrderFromRow(row: OrderRow, items: OrderItemRow[]): StorefrontOrder {
  return {
    id: row.id,
    customer: row.customer,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    shippingAddress: row.shipping_address,
    township: row.township,
    notes: row.notes,
    subtotalMmk: row.subtotal_mmk,
    shippingMmk: row.shipping_mmk,
    totalMmk: row.total_mmk,
    status: row.status,
    channel: row.channel,
    paymentId: row.payment_id,
    paymentProvider: row.payment_provider,
    paymentStatus: row.payment_status,
    paidAt: row.paid_at,
    shippingStatus: row.shipping_status,
    trackingNumber: row.tracking_number,
    carrier: row.carrier,
    createdAt: row.created_at,
    items: items.map(orderItemFromRow)
  };
}
