import type { PaymentAdapter } from "@/features/payment/domain/payment-adapter";
import { DEFAULT_PAYMENT_PROVIDER, type PaymentProvider } from "@/features/payment/domain/payment-provider";
import { PaymentConfigurationError } from "@/features/payment/application/payment-errors";
import { stripePaymentAdapter } from "@/features/payment/infrastructure/stripe-adapter";

const adapters: Record<PaymentProvider, PaymentAdapter> = {
  stripe: stripePaymentAdapter
};

export function getPaymentAdapter(provider: PaymentProvider = DEFAULT_PAYMENT_PROVIDER): PaymentAdapter {
  const adapter = adapters[provider];

  if (!adapter) {
    throw new PaymentConfigurationError(`Payment provider "${provider}" is not supported.`);
  }

  return adapter;
}

export { stripePaymentAdapter };
