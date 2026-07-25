import { z } from "zod";
import { FLAT_RATE_SHIPPING_METHOD } from "@/features/checkout/domain/shipping";

export const checkoutCartItemSchema = z.object({
  variantId: z.string().min(1),
  productId: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  quantity: z.number().int().min(1).max(99)
});

export const checkoutCustomerSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  phone: z.string().trim().min(6, "Phone is required."),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address.")]).optional(),
  address: z.string().trim().min(5, "Address is required."),
  township: z.string().trim().min(2, "Township is required."),
  notes: z.string().trim().max(500).optional().or(z.literal(""))
});

export const createOrderInputSchema = z.object({
  customer: checkoutCustomerSchema,
  shippingMethod: z.literal(FLAT_RATE_SHIPPING_METHOD),
  items: z.array(checkoutCartItemSchema).min(1, "Your cart is empty.")
});

export type CheckoutCartItemInput = z.infer<typeof checkoutCartItemSchema>;
export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
