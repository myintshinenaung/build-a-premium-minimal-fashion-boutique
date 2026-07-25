export const FLAT_RATE_SHIPPING_METHOD = "flat_rate" as const;
export const FLAT_RATE_SHIPPING_MMK = 5000;

export type ShippingMethod = typeof FLAT_RATE_SHIPPING_METHOD;

export function getShippingFee(method: ShippingMethod) {
  if (method === FLAT_RATE_SHIPPING_METHOD) {
    return FLAT_RATE_SHIPPING_MMK;
  }

  return 0;
}
