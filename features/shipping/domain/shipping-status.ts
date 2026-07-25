export const SHIPPING_STATUSES = ["pending", "shipped"] as const;

export type ShippingStatus = (typeof SHIPPING_STATUSES)[number];

export function canMarkOrderShipped(shippingStatus: ShippingStatus) {
  return shippingStatus === "pending";
}
