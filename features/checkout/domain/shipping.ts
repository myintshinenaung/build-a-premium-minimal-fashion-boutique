import {
  DEFAULT_FLAT_RATE_SHIPPING_MMK,
  FLAT_RATE_SHIPPING_METHOD,
  type ShippingMethod
} from "@/features/shipping/domain/shipping-method";

export { DEFAULT_FLAT_RATE_SHIPPING_MMK as FLAT_RATE_SHIPPING_MMK, FLAT_RATE_SHIPPING_METHOD };
export type { ShippingMethod };

/** @deprecated Use getShippingFee from @/features/shipping/server for configurable rates. */
export function getShippingFee(method: ShippingMethod) {
  if (method === FLAT_RATE_SHIPPING_METHOD) {
    return DEFAULT_FLAT_RATE_SHIPPING_MMK;
  }

  return 0;
}
