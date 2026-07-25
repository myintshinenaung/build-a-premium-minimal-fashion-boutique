import type { AdminStatus } from "@/types/admin";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BannerPlacement = "Homepage Hero" | "New Collection" | "Announcement";
export type OrderStatus = "Pending" | "Confirmed" | "Packed" | "Completed";
export type OrderChannel = "Messenger" | "Viber" | "Phone" | "Web";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed";
export type PaymentProvider = "stripe";
export type ShippingStatus = "pending" | "shipped";
export type ReservationStatus = "active" | "released" | "consumed";

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category_id: string;
  brand: string;
  price_mmk: number;
  sale_price_mmk: number | null;
  cost_price_mmk: number;
  description: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock_quantity: number;
  low_stock_warning: number;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  on_sale: boolean;
  status: AdminStatus;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  product_count: number;
  sort_order: number;
  status: AdminStatus;
};

export type BannerRow = {
  id: string;
  title: string;
  placement: BannerPlacement;
  image: string;
  eyebrow: string;
  headline: string;
  cta_label: string;
  cta_href: string;
  status: AdminStatus;
};

export type SettingsRow = {
  id: string;
  store_name: string;
  logo: string;
  store_description: string;
  facebook: string;
  messenger: string;
  viber: string;
  telegram: string;
  tiktok: string;
  instagram: string;
  email: string;
  phone: string;
  address: string;
  google_map: string;
  currency: string;
  timezone: string;
  hero_title_en?: string;
  hero_title_my?: string;
  hero_subtitle_en?: string;
  hero_subtitle_my?: string;
  hero_marketing_headline_en?: string;
  hero_marketing_headline_my?: string;
  hero_cta_label_en?: string;
  hero_cta_label_my?: string;
  hero_secondary_cta_label_en?: string;
  hero_secondary_cta_label_my?: string;
  hero_primary_cta_href?: string;
  hero_secondary_cta_href?: string;
  hero_background_image?: string;
  flat_rate_shipping_mmk: number;
  updated_at: string;
};

export type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  orders: number;
  lifetime_value_mmk: number;
  last_order_at: string;
};

export type OrderRow = {
  id: string;
  customer: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  township: string;
  notes: string;
  subtotal_mmk: number;
  shipping_mmk: number;
  total_mmk: number;
  status: OrderStatus;
  channel: OrderChannel;
  payment_id: string | null;
  payment_provider: PaymentProvider | null;
  payment_status: PaymentStatus;
  paid_at: string | null;
  shipping_status: ShippingStatus;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
};

export type PaymentEventRow = {
  id: string;
  provider: PaymentProvider;
  event_type: string;
  order_id: string | null;
  processed_at: string;
};

export type InventoryReservationRow = {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  status: ReservationStatus;
  reference_type: string | null;
  reference_id: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  product_slug: string;
  image: string;
  size: string;
  color: string;
  unit_price_mmk: number;
  quantity: number;
  line_total_mmk: number;
};

export type Database = {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: Omit<ProductRow, "id" | "updated_at"> & Partial<Pick<ProductRow, "id" | "updated_at">>;
        Update: Partial<Omit<ProductRow, "id">>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: Omit<CategoryRow, "id"> & Partial<Pick<CategoryRow, "id">>;
        Update: Partial<Omit<CategoryRow, "id">>;
        Relationships: [];
      };
      banners: {
        Row: BannerRow;
        Insert: Omit<BannerRow, "id"> & Partial<Pick<BannerRow, "id">>;
        Update: Partial<Omit<BannerRow, "id">>;
        Relationships: [];
      };
      settings: {
        Row: SettingsRow;
        Insert: Omit<SettingsRow, "id" | "updated_at"> & Partial<Pick<SettingsRow, "id" | "updated_at">>;
        Update: Partial<Omit<SettingsRow, "id">>;
        Relationships: [];
      };
      customers: {
        Row: CustomerRow;
        Insert: Omit<CustomerRow, "id"> & Partial<Pick<CustomerRow, "id">>;
        Update: Partial<Omit<CustomerRow, "id">>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Omit<OrderRow, "id" | "created_at"> & Partial<Pick<OrderRow, "id" | "created_at">>;
        Update: Partial<Omit<OrderRow, "id">>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: Omit<OrderItemRow, "id"> & Partial<Pick<OrderItemRow, "id">>;
        Update: Partial<Omit<OrderItemRow, "id">>;
        Relationships: [];
      };
      payment_events: {
        Row: PaymentEventRow;
        Insert: Omit<PaymentEventRow, "processed_at"> & Partial<Pick<PaymentEventRow, "processed_at">>;
        Update: Partial<Omit<PaymentEventRow, "id">>;
        Relationships: [];
      };
      inventory_reservations: {
        Row: InventoryReservationRow;
        Insert: Omit<InventoryReservationRow, "created_at" | "updated_at"> &
          Partial<Pick<InventoryReservationRow, "created_at" | "updated_at">>;
        Update: Partial<Omit<InventoryReservationRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      admin_status: AdminStatus;
      banner_placement: BannerPlacement;
      order_status: OrderStatus;
      order_channel: OrderChannel;
    };
    CompositeTypes: Record<string, never>;
  };
};
