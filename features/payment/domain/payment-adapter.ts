import type { PaymentProvider } from "@/features/payment/domain/payment-provider";

export type CreateCheckoutSessionInput = {
  orderId: string;
  amountMmk: number;
  customerEmail?: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
};

export type CreateCheckoutSessionResult = {
  sessionId: string;
  checkoutUrl: string;
};

export type PaymentWebhookEvent = {
  id: string;
  type: string;
  orderId: string | null;
  paymentId: string | null;
  paidAt: string | null;
};

export interface PaymentAdapter {
  readonly provider: PaymentProvider;
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult>;
  constructWebhookEvent(payload: string, signature: string): PaymentWebhookEvent;
}
