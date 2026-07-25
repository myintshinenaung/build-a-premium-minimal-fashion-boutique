export const PAYMENT_STATUSES = ["pending", "processing", "paid", "failed"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export function canStartPayment(paymentStatus: PaymentStatus) {
  return paymentStatus === "pending" || paymentStatus === "failed";
}
