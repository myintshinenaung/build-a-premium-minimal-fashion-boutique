import {
  createOrderInputSchema,
  type CreateOrderInput
} from "@/features/checkout/domain/checkout-schemas";
import {
  CheckoutValidationError,
  validateCheckoutCart
} from "@/features/checkout/application/validate-cart";
import { getShippingFee } from "@/features/shipping/server";
import {
  InsufficientStockError,
  releaseOrderReservations,
  reserveOrderInventory
} from "@/features/inventory/application/order-reservations";
import { orderRepository } from "@/features/orders/infrastructure/order-repository";
import { PromotionValidationError, recordCouponRedemption, resolveCheckoutPromotion } from "@/features/promotions/server";
import type { StorefrontOrder } from "@/types/order";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid checkout details.";
}

function createOrderId() {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export async function createOrder(
  input: unknown,
  options?: { accountId?: string | null; isAuthenticated?: boolean }
): Promise<StorefrontOrder> {
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
  const email = parsed.customer.email?.trim() ?? "";
  const orderId = createOrderId();

  let promotion;

  try {
    promotion = await resolveCheckoutPromotion(parsed.couponCode, validatedCart.subtotalMmk, shippingMmk, {
      isAuthenticated: options?.isAuthenticated ?? Boolean(options?.accountId)
    });
  } catch (error) {
    if (error instanceof PromotionValidationError) {
      throw new CheckoutValidationError(error.message);
    }

    throw error;
  }

  const { summary, coupon } = promotion;

  try {
    await reserveOrderInventory(orderId, validatedCart.items);
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      throw new CheckoutValidationError(`Out of stock. ${error.message}`);
    }

    throw error;
  }

  try {
    const order = await orderRepository.create({
      id: orderId,
      accountId: options?.accountId ?? null,
      couponId: coupon?.id ?? null,
      couponCode: coupon?.code ?? null,
      discountMmk: summary.discountMmk,
      taxMmk: summary.taxMmk,
      customer: parsed.customer.name.trim(),
      customerPhone: parsed.customer.phone.trim(),
      customerEmail: email,
      shippingAddress: parsed.customer.address.trim(),
      township: parsed.customer.township.trim(),
      notes: parsed.customer.notes?.trim() ?? "",
      subtotalMmk: summary.subtotalMmk,
      shippingMmk: summary.shippingMmk,
      totalMmk: summary.totalMmk,
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

    if (coupon) {
      await recordCouponRedemption(coupon.id);
    }

    return order;
  } catch (error) {
    await releaseOrderReservations(orderId);
    throw error;
  }
}
