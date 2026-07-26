"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CartLineItem } from "@/features/cart/client";
import { selectCartSubtotal, useCartStore } from "@/features/cart/infrastructure/store";
import { FLAT_RATE_SHIPPING_METHOD } from "@/features/checkout/domain/shipping";
import type { OrderSummary } from "@/features/promotions";
import { useTranslator } from "@/features/i18n/client";
import { formatPrice } from "@/lib/utils";

type CheckoutFormProps = {
  flatRateShippingMmk: number;
};

const inputClass =
  "mt-2 w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

function buildInitialSummary(subtotal: number, shippingMmk: number): OrderSummary {
  return {
    subtotalMmk: subtotal,
    discountMmk: 0,
    shippingMmk,
    taxMmk: 0,
    totalMmk: subtotal + shippingMmk,
    coupon: null
  };
}

export function CheckoutForm({ flatRateShippingMmk }: CheckoutFormProps) {
  const { t } = useTranslator();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = selectCartSubtotal(items);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [township, setTownship] = useState("");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [summary, setSummary] = useState<OrderSummary>(() => buildInitialSummary(subtotal, flatRateShippingMmk));
  const [error, setError] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

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

  const promotionPayload = useMemo(
    () => ({
      shippingMethod: FLAT_RATE_SHIPPING_METHOD,
      items: cartPayload
    }),
    [cartPayload]
  );

  useEffect(() => {
    if (!appliedCouponCode) {
      setSummary(buildInitialSummary(subtotal, flatRateShippingMmk));
    }
  }, [appliedCouponCode, flatRateShippingMmk, subtotal]);

  async function refreshSummaryWithoutCoupon() {
    const response = await fetch("/api/promotions/remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(promotionPayload)
    });
    const payload = (await response.json()) as { summary?: OrderSummary; message?: string };

    if (!response.ok || !payload.summary) {
      setSummary(buildInitialSummary(subtotal, flatRateShippingMmk));
      return;
    }

    setSummary(payload.summary);
  }

  async function handleApplyCoupon() {
    setCouponError("");
    setIsApplyingCoupon(true);

    try {
      const response = await fetch("/api/promotions/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...promotionPayload,
          code: couponCode
        })
      });
      const payload = (await response.json()) as { summary?: OrderSummary; message?: string };

      if (!response.ok || !payload.summary) {
        setCouponError(payload.message ?? t("checkout.couponError"));
        return;
      }

      setSummary(payload.summary);
      setAppliedCouponCode(payload.summary.coupon?.code ?? couponCode.trim().toUpperCase());
    } catch {
      setCouponError(t("checkout.couponError"));
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  async function handleRemoveCoupon() {
    setCouponError("");
    setAppliedCouponCode("");
    setCouponCode("");
    await refreshSummaryWithoutCoupon();
  }

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
          items: cartPayload,
          couponCode: appliedCouponCode
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
              <span className="mt-1 block text-sm text-stone">{formatPrice(summary.coupon?.freeShipping ? 0 : flatRateShippingMmk)}</span>
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

        <div className="mt-6 border-t border-line pt-6">
          <label className="block">
            <span className={labelClass}>{t("checkout.couponCode")}</span>
            <div className="mt-2 flex gap-2">
              <input
                className="w-full border border-line bg-white px-3 py-3 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                disabled={Boolean(appliedCouponCode)}
              />
              {appliedCouponCode ? (
                <button
                  type="button"
                  onClick={() => void handleRemoveCoupon()}
                  className="shrink-0 border border-line px-4 text-sm font-medium text-ink transition-colors hover:bg-mist"
                >
                  {t("checkout.removeCoupon")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleApplyCoupon()}
                  disabled={!couponCode.trim() || isApplyingCoupon}
                  className="shrink-0 border border-ink bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("checkout.applyCoupon")}
                </button>
              )}
            </div>
          </label>
          {appliedCouponCode ? <p className="mt-2 text-xs text-stone">{t("checkout.couponApplied", { code: appliedCouponCode })}</p> : null}
          {couponError ? <p className="mt-2 text-xs text-red-700">{couponError}</p> : null}
        </div>

        <div className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
          <div className="flex items-center justify-between gap-4 text-stone">
            <span>{t("checkout.subtotal")}</span>
            <span className="text-ink">{formatPrice(summary.subtotalMmk)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-stone">
            <span>{t("checkout.discount")}</span>
            <span className="text-ink">{summary.discountMmk > 0 ? `-${formatPrice(summary.discountMmk)}` : formatPrice(0)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-stone">
            <span>{t("checkout.shippingLabel")}</span>
            <span className="text-ink">{formatPrice(summary.shippingMmk)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-stone">
            <span>{t("checkout.tax")}</span>
            <span className="text-ink">{formatPrice(summary.taxMmk)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line pt-3 text-base font-medium text-ink">
            <span>{t("checkout.grandTotal")}</span>
            <span>{formatPrice(summary.totalMmk)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
