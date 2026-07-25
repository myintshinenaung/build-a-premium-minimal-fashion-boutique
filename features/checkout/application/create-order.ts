import {
  createOrderInputSchema,
  type CreateOrderInput
} from "@/features/checkout/domain/checkout-schemas";
import {
  CheckoutValidationError,
  validateCheckoutCart
} from "@/features/checkout/application/validate-cart";
import { getShippingFee } from "@/features/shipping/server";
import { orderRepository } from "@/features/orders/infrastructure/order-repository";
import type { StorefrontOrder } from "@/types/order";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid checkout details.";
}

function createOrderId() {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export async function createOrder(input: unknown): Promise<StorefrontOrder> {
  let parsed: CreateOrderInput;

  try {
    parsed = createOrderInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new CheckoutValidationError(formatZodError(error));
    }

    throw error;
  }

  const validatedCart = await validateCheckoutCart(parsed.items);
  const shippingMmk = await getShippingFee(parsed.shippingMethod);
  const totalMmk = validatedCart.subtotalMmk + shippingMmk;
  const email = parsed.customer.email?.trim() ?? "";
  const orderId = createOrderId();

  return orderRepository.create({
    id: orderId,
    customer: parsed.customer.name.trim(),
    customerPhone: parsed.customer.phone.trim(),
    customerEmail: email,
    shippingAddress: parsed.customer.address.trim(),
    township: parsed.customer.township.trim(),
    notes: parsed.customer.notes?.trim() ?? "",
    subtotalMmk: validatedCart.subtotalMmk,
    shippingMmk,
    totalMmk,
    channel: "Web",
    status: "Pending",
    items: validatedCart.items.map((item, index) => ({
      id: `${orderId}-${index + 1}`,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      productSlug: item.productSlug,
      image: item.image,
      size: item.size,
      color: item.color,
      unitPriceMmk: item.unitPriceMmk,
      quantity: item.quantity,
      lineTotalMmk: item.lineTotalMmk
    }))
  });
}
