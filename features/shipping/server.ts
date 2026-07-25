/** Server-only shipping exports. Import from Server Components and route handlers. */
export { getFlatRateShippingMmk, getShippingFee } from "@/features/shipping/application/get-shipping-fee";
export { shipOrder } from "@/features/shipping/application/ship-order";
export { ShippingConflictError, ShippingValidationError } from "@/features/shipping/application/shipping-errors";
export { DEFAULT_FLAT_RATE_SHIPPING_MMK, FLAT_RATE_SHIPPING_METHOD } from "@/features/shipping/domain/shipping-method";
export type { ShippingMethod } from "@/features/shipping/domain/shipping-method";
export type { ShippingStatus } from "@/features/shipping/domain/shipping-status";
