export const FLAT_RATE_SHIPPING_METHOD = "flat_rate" as const;

export type ShippingMethod = typeof FLAT_RATE_SHIPPING_METHOD;

export const DEFAULT_FLAT_RATE_SHIPPING_MMK = 5000;
