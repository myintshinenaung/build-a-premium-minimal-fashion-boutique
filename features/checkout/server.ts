/** Server-only checkout exports. Import from Server Components and route handlers. */
export { createOrder } from "@/features/checkout/application/create-order";
export { validateCheckoutCart } from "@/features/checkout/application/validate-cart";
export { FLAT_RATE_SHIPPING_MMK, FLAT_RATE_SHIPPING_METHOD } from "@/features/checkout/domain/shipping";
export { CheckoutPage, OrderConfirmationPage } from "@/features/checkout/ui/storefront/CheckoutPage";
