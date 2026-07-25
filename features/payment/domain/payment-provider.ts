export const PAYMENT_PROVIDERS = ["stripe"] as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const DEFAULT_PAYMENT_PROVIDER: PaymentProvider = "stripe";
