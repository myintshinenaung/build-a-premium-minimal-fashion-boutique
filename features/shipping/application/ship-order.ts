import { shipOrderInputSchema } from "@/features/shipping/domain/shipping-schemas";
import { canMarkOrderShipped } from "@/features/shipping/domain/shipping-status";
import { ShippingConflictError, ShippingValidationError } from "@/features/shipping/application/shipping-errors";
import { sendShippingNotification } from "@/features/email/server";
import { orderRepository } from "@/features/orders/infrastructure/order-repository";
import type { StorefrontOrder } from "@/types/order";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid shipping details.";
}

export async function shipOrder(orderId: string, input: unknown): Promise<StorefrontOrder> {
  let parsed;

  try {
    parsed = shipOrderInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ShippingValidationError(formatZodError(error));
    }

    throw error;
  }

  const order = await orderRepository.getById(orderId);

  if (!order) {
    throw new ShippingValidationError("Order not found.");
  }

  if (!canMarkOrderShipped(order.shippingStatus)) {
    throw new ShippingConflictError("This order has already been shipped.");
  }

  const updatedOrder = await orderRepository.updateShipping({
    orderId,
    shippingStatus: "shipped",
    carrier: parsed.carrier,
    trackingNumber: parsed.trackingNumber,
    status: "Packed"
  });

  if (!updatedOrder) {
    throw new ShippingValidationError("Order not found.");
  }

  await sendShippingNotification(updatedOrder);

  return updatedOrder;
}
