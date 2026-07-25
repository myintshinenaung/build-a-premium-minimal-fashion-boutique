import {
  buildOrderConfirmationJob,
  buildPaymentSuccessJob,
  buildShippingJob
} from "@/features/email/application/build-email-jobs";
import { EmailDeliveryError } from "@/features/email/application/email-errors";
import { syncEmailQueue } from "@/features/email/infrastructure/sync-email-queue";
import { orderRepository } from "@/features/orders/infrastructure/order-repository";
import type { StorefrontOrder } from "@/types/order";

function hasCustomerEmail(order: Pick<StorefrontOrder, "customerEmail">) {
  return Boolean(order.customerEmail.trim());
}

export async function sendPaymentSuccessNotifications(orderId: string) {
  try {
    const order = await orderRepository.getById(orderId);

    if (!order || !hasCustomerEmail(order)) {
      return;
    }

    await syncEmailQueue.enqueue(await buildOrderConfirmationJob(order));
    await syncEmailQueue.enqueue(await buildPaymentSuccessJob(order));
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      console.error(`Payment notification email failed for ${orderId}`, error);
      return;
    }

    console.error(`Unable to queue payment notifications for ${orderId}`, error);
  }
}

export async function sendShippingNotification(order: StorefrontOrder) {
  try {
    if (!hasCustomerEmail(order)) {
      return;
    }

    await syncEmailQueue.enqueue(await buildShippingJob(order));
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      console.error(`Shipping notification email failed for ${order.id}`, error);
      return;
    }

    console.error(`Unable to queue shipping notification for ${order.id}`, error);
  }
}
