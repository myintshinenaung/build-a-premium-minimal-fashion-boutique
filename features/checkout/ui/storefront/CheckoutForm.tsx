"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CartLineItem } from "@/features/cart/client";
import { selectCartSubtotal, useCartStore } from "@/features/cart/infrastructure/store";
import { FLAT_RATE_SHIPPING_METHOD } from "@/features/checkout/domain/shipping";
import { useTranslator } from "@/features/i18n/client";
import { formatPrice } from "@/lib/utils";

type CheckoutFormProps = {
  flatRateShippingMmk: number;
};

const inputClass =
  "mt-2 w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

export function CheckoutForm({ flatRateShippingMmk }: CheckoutFormProps) {
  const { t } = useTranslator();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = selectCartSubtotal(items);
  const total = subtotal + flatRateShippingMmk;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [township, setTownship] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartPayload = useMemo(
    () =>
      items.map((item) => ({
        variantId: item.variantId,
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      })),
    [items]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer: {
            name,
            phone,
            email,
            address,
            township,
            notes
          },
          shippingMethod: FLAT_RATE_SHIPPING_METHOD,
          items: cartPayload
        })
      });

      const payload = (await response.json()) as { orderId?: string; message?: string };

      if (!response.ok || !payload.orderId) {
        setError(payload.message ?? t("checkout.submitError"));
        return;
      }

      const paymentResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: payload.orderId,
          idempotencyKey: crypto.randomUUID()
        })
      });

      const paymentPayload = (await paymentResponse.json()) as { checkoutUrl?: string; message?: string };

      if (!paymentResponse.ok || !paymentPayload.checkoutUrl) {
        setError(paymentPayload.message ?? t("checkout.paymentError"));
        return;
      }

      clearCart();
      window.location.assign(paymentPayload.checkoutUrl);
    } catch {
      setError(t("checkout.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 border border-line bg-white p-8 text-center">
        <p className="text-sm text-stone">{t("checkout.emptyCart")}</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-12 items-center justify-center border border-ink px-6 text-sm font-medium text-ink transition-colors hover:bg-mist"
        >
          {t("checkout.continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="border border-line bg-white p-6 sm:p-8">
        <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">{t("checkout.customerInformation")}</h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelClass}>{t("checkout.name")}</span>
            <input
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className="block">
            <span className={labelClass}>{t("checkout.phone")}</span>
            <input
              className={inputClass}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              required
            />
          </label>

          <label className="block">
            <span className={labelClass}>{t("checkout.emailOptional")}</span>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClass}>{t("checkout.address")}</span>
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              autoComplete="street-address"
              required
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClass}>{t("checkout.township")}</span>
            <input
              className={inputClass}
              value={township}
              onChange={(event) => setTownship(event.target.value)}
              required
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClass}>{t("checkout.notes")}</span>
            <textarea
              className={`${inputClass} min-h-20 resize-y`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("checkout.notesPlaceholder")}
            />
          </label>
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">{t("checkout.shipping")}</h3>
          <label className="mt-4 flex cursor-pointer items-start gap-3 border border-line p-4">
            <input type="radio" name="shipping" checked readOnly className="mt-1 accent-ink" />
            <span>
              <span className="block text-sm font-medium text-ink">{t("checkout.flatRateShipping")}</span>
              <span className="mt-1 block text-sm text-stone">{formatPrice(flatRateShippingMmk)}</span>
            </span>
          </label>
        </div>

        {error ? <p className="mt-6 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 inline-flex h-12 w-full items-center justify-center bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t("checkout.redirectingToPayment") : t("checkout.placeOrder")}
        </button>
      </form>

      <aside className="border border-line bg-white p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
        <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">{t("checkout.orderSummary")}</h2>

        <div className="mt-4">
          {items.map((item) => (
            <CartLineItem key={item.lineKey} item={item} />
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
          <div className="flex items-center justify-between gap-4 text-stone">
            <span>{t("checkout.subtotal")}</span>
            <span className="text-ink">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-stone">
            <span>{t("checkout.shippingLabel")}</span>
            <span className="text-ink">{formatPrice(flatRateShippingMmk)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line pt-3 text-base font-medium text-ink">
            <span>{t("checkout.total")}</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
