import { createPaymentInputSchema } from "@/features/payment/domain/payment-schemas";
import { canStartPayment } from "@/features/payment/domain/payment-status";
import {
  PaymentConfigurationError,
  PaymentConflictError,
  PaymentValidationError
} from "@/features/payment/application/payment-errors";
import { getPaymentAdapter } from "@/features/payment/infrastructure/payment-adapter-registry";
import { retrieveOpenStripeCheckoutSession } from "@/features/payment/infrastructure/stripe-adapter";
import { orderRepository } from "@/features/orders/infrastructure/order-repository";
import { getSiteUrl } from "@/lib/storefront/site-url";
import { ZodError } from "zod";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid payment request.";
}

export type CreatePaymentResult = {
  checkoutUrl: string;
  sessionId: string;
  orderId: string;
};

export async function createPayment(input: unknown): Promise<CreatePaymentResult> {
  let parsed;

  try {
    parsed = createPaymentInputSchema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new PaymentValidationError(formatZodError(error));
    }

    throw error;
  }

  const order = await orderRepository.getById(parsed.orderId);

  if (!order) {
    throw new PaymentValidationError("Order not found.");
  }

  if (order.paymentStatus === "paid") {
    throw new PaymentConflictError("This order has already been paid.");
  }

  if (order.paymentStatus === "processing" && order.paymentId) {
    const existingSession = await retrieveOpenStripeCheckoutSession(order.paymentId);

    if (existingSession) {
      return {
        checkoutUrl: existingSession.checkoutUrl,
        sessionId: existingSession.sessionId,
        orderId: order.id
      };
    }
  }

  if (!canStartPayment(order.paymentStatus)) {
    throw new PaymentConflictError("Payment cannot be started for this order.");
  }

  const adapter = getPaymentAdapter();
  const siteUrl = getSiteUrl();
  const stripeIdempotencyKey = `payment-${order.id}-${parsed.idempotencyKey}`;

  let session;

  try {
    session = await adapter.createCheckoutSession({
      orderId: order.id,
      amountMmk: order.totalMmk,
      customerEmail: order.customerEmail || undefined,
      customerName: order.customer,
      successUrl: `${siteUrl}/checkout/confirmation/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/checkout?cancelled=1`,
      idempotencyKey: stripeIdempotencyKey
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("STRIPE_SECRET_KEY")) {
      throw new PaymentConfigurationError("Payment provider is not configured.");
    }

    throw error;
  }

  await orderRepository.updatePayment({
    orderId: order.id,
    paymentId: session.sessionId,
    paymentProvider: adapter.provider,
    paymentStatus: "processing"
  });

  return {
    checkoutUrl: session.checkoutUrl,
    sessionId: session.sessionId,
    orderId: order.id
  };
}
