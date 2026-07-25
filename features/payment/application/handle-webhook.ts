import { PaymentValidationError } from "@/features/payment/application/payment-errors";
import { DEFAULT_PAYMENT_PROVIDER } from "@/features/payment/domain/payment-provider";
import { getPaymentAdapter } from "@/features/payment/infrastructure/payment-adapter-registry";
import { paymentEventRepository } from "@/features/payment/infrastructure/payment-event-repository";
import { sendPaymentSuccessNotifications } from "@/features/email/server";
import { orderRepository } from "@/features/orders/infrastructure/order-repository";

export type HandlePaymentWebhookResult = {
  received: true;
  duplicate: boolean;
  processed: boolean;
};

export async function handlePaymentWebhook(payload: string, signature: string | null): Promise<HandlePaymentWebhookResult> {
  if (!signature) {
    throw new PaymentValidationError("Missing payment webhook signature.");
  }

  const adapter = getPaymentAdapter();
  let event;

  try {
    event = adapter.constructWebhookEvent(payload, signature);
  } catch (error) {
    throw new PaymentValidationError(error instanceof Error ? error.message : "Invalid payment webhook signature.");
  }

  if (await paymentEventRepository.hasProcessed(event.id)) {
    return {
      received: true,
      duplicate: true,
      processed: false
    };
  }

  if (event.type === "checkout.session.completed" && event.orderId && event.paymentId) {
    await orderRepository.updatePayment({
      orderId: event.orderId,
      paymentId: event.paymentId,
      paymentProvider: DEFAULT_PAYMENT_PROVIDER,
      paymentStatus: "paid",
      paidAt: event.paidAt ?? new Date().toISOString(),
      status: "Confirmed"
    });

    await sendPaymentSuccessNotifications(event.orderId);
  }

  if (event.type === "checkout.session.expired" && event.orderId) {
    await orderRepository.updatePayment({
      orderId: event.orderId,
      paymentId: event.paymentId,
      paymentProvider: DEFAULT_PAYMENT_PROVIDER,
      paymentStatus: "failed"
    });
  }

  await paymentEventRepository.markProcessed({
    eventId: event.id,
    provider: adapter.provider,
    eventType: event.type,
    orderId: event.orderId
  });

  return {
    received: true,
    duplicate: false,
    processed: true
  };
}
