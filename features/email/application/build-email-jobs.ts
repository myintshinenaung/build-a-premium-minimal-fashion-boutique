import type { EmailJob } from "@/features/email/domain/email-job";
import {
  renderOrderConfirmationEmail,
  renderPaymentSuccessEmail,
  renderShippingEmail
} from "@/features/email/infrastructure/templates/render-templates";
import { settingsRepository } from "@/features/settings/infrastructure/settings-repository";
import { defaultStorefrontSettings } from "@/features/settings/domain/defaults";
import type { StorefrontOrder } from "@/types/order";

function createJobId(template: EmailJob["template"], orderId: string) {
  return `${template}-${orderId}-${Date.now()}`;
}

async function getStoreName() {
  const settings = await settingsRepository.get();
  return settings.storeName.trim() || defaultStorefrontSettings.storeName;
}

export async function buildOrderConfirmationJob(order: StorefrontOrder): Promise<EmailJob> {
  const storeName = await getStoreName();
  const rendered = renderOrderConfirmationEmail({ order, storeName });

  return {
    id: createJobId("order_confirmation", order.id),
    template: "order_confirmation",
    to: order.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    metadata: { orderId: order.id }
  };
}

export async function buildPaymentSuccessJob(order: StorefrontOrder): Promise<EmailJob> {
  const storeName = await getStoreName();
  const rendered = renderPaymentSuccessEmail({ order, storeName });

  return {
    id: createJobId("payment_success", order.id),
    template: "payment_success",
    to: order.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    metadata: { orderId: order.id }
  };
}

export async function buildShippingJob(order: StorefrontOrder): Promise<EmailJob> {
  const storeName = await getStoreName();
  const rendered = renderShippingEmail({ order, storeName });

  return {
    id: createJobId("shipping", order.id),
    template: "shipping",
    to: order.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    metadata: { orderId: order.id }
  };
}
