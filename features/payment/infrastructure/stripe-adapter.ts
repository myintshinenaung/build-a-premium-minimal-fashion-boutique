import Stripe from "stripe";
import type {
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResult,
  PaymentWebhookEvent
} from "@/features/payment/domain/payment-adapter";
import type { PaymentAdapter } from "@/features/payment/domain/payment-adapter";
import { getStripeSecretKey, getStripeWebhookSecret } from "@/features/payment/infrastructure/stripe-config";

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey());
  }

  return stripeClient;
}

function mapWebhookEvent(event: Stripe.Event): PaymentWebhookEvent {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId?.trim() || null;

    return {
      id: event.id,
      type: event.type,
      orderId,
      paymentId: session.id,
      paidAt: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString()
    };
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId?.trim() || null;

    return {
      id: event.id,
      type: event.type,
      orderId,
      paymentId: session.id,
      paidAt: null
    };
  }

  return {
    id: event.id,
    type: event.type,
    orderId: null,
    paymentId: null,
    paidAt: null
  };
}

export const stripePaymentAdapter: PaymentAdapter = {
  provider: "stripe",

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult> {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: input.customerEmail || undefined,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "mmk",
              unit_amount: input.amountMmk,
              product_data: {
                name: `Order ${input.orderId}`,
                description: `Payment for order ${input.orderId}`
              }
            }
          }
        ],
        metadata: {
          orderId: input.orderId,
          customerName: input.customerName
        },
        success_url: input.successUrl,
        cancel_url: input.cancelUrl
      },
      {
        idempotencyKey: input.idempotencyKey
      }
    );

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return {
      sessionId: session.id,
      checkoutUrl: session.url
    };
  },

  constructWebhookEvent(payload: string, signature: string): PaymentWebhookEvent {
    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(payload, signature, getStripeWebhookSecret());

    return mapWebhookEvent(event);
  }
};

export async function retrieveOpenStripeCheckoutSession(sessionId: string): Promise<CreateCheckoutSessionResult | null> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.status !== "open" || !session.url) {
    return null;
  }

  return {
    sessionId: session.id,
    checkoutUrl: session.url
  };
}
