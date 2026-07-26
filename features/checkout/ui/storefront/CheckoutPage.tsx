import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CheckoutForm } from "@/features/checkout/ui/storefront/CheckoutForm";
import { getFlatRateShippingMmk } from "@/features/shipping/server";
import { getTranslator } from "@/features/i18n/server";
import type { MessageKey } from "@/features/i18n/domain/message-keys";
import { orderRepository } from "@/features/orders/infrastructure/order-repository";
import type { PaymentStatus, ShippingStatus } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/utils";

const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

const paymentStatusKeys: Record<PaymentStatus, MessageKey> = {
  pending: "checkout.paymentStatusPending",
  processing: "checkout.paymentStatusProcessing",
  paid: "checkout.paymentStatusPaid",
  failed: "checkout.paymentStatusFailed"
};

const shippingStatusKeys: Record<ShippingStatus, MessageKey> = {
  pending: "checkout.shippingStatusPending",
  shipped: "checkout.shippingStatusShipped"
};

export async function CheckoutPage() {
  const [{ t }, flatRateShippingMmk] = await Promise.all([getTranslator(), getFlatRateShippingMmk()]);

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={t("checkout.eyebrow")} title={t("checkout.title")} description={t("checkout.description")} />
      <CheckoutForm flatRateShippingMmk={flatRateShippingMmk} />
    </section>
  );
}

export async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const [{ t }, order] = await Promise.all([getTranslator(), orderRepository.getById(orderId)]);

  if (!order) {
    notFound();
  }

  const shippingAddress = [order.shippingAddress, order.township].filter(Boolean).join(", ");

  return (
    <section className="mx-auto max-w-[960px] px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow={t("checkout.confirmationEyebrow")}
        title={t("checkout.confirmationTitle")}
        description={t("checkout.confirmationDescription")}
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="border border-line bg-white p-6">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className={labelClass}>{t("checkout.orderNumber")}</dt>
              <dd className="mt-1 font-medium text-ink">{order.id}</dd>
            </div>
            <div>
              <dt className={labelClass}>{t("checkout.orderStatus")}</dt>
              <dd className="mt-1 text-ink">{order.status}</dd>
            </div>
            <div>
              <dt className={labelClass}>{t("checkout.paymentStatus")}</dt>
              <dd className="mt-1 text-ink">{t(paymentStatusKeys[order.paymentStatus])}</dd>
            </div>
            <div>
              <dt className={labelClass}>{t("checkout.shippingStatus")}</dt>
              <dd className="mt-1 text-ink">{t(shippingStatusKeys[order.shippingStatus])}</dd>
            </div>
            {order.carrier ? (
              <div>
                <dt className={labelClass}>{t("checkout.carrier")}</dt>
                <dd className="mt-1 text-ink">{order.carrier}</dd>
              </div>
            ) : null}
            {order.trackingNumber ? (
              <div>
                <dt className={labelClass}>{t("checkout.trackingNumber")}</dt>
                <dd className="mt-1 text-ink">{order.trackingNumber}</dd>
              </div>
            ) : null}
            <div>
              <dt className={labelClass}>{t("checkout.shippingAddress")}</dt>
              <dd className="mt-1 text-ink">
                <p>{order.customer}</p>
                <p>{order.customerPhone}</p>
                {order.customerEmail ? <p>{order.customerEmail}</p> : null}
                <p className="mt-2">{shippingAddress}</p>
                {order.notes ? <p className="mt-2 text-stone">{order.notes}</p> : null}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border border-line bg-white p-6">
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">{t("checkout.orderedItems")}</h2>
          <ul className="mt-4 space-y-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 border-b border-line pb-4 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-ink">{item.productName}</p>
                  <p className="mt-1 text-xs text-stone">
                    {item.size} / {item.color} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-ink">{formatPrice(item.lineTotalMmk)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
            <div className="flex items-center justify-between gap-4 text-stone">
              <span>{t("checkout.subtotal")}</span>
              <span className="text-ink">{formatPrice(order.subtotalMmk)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-stone">
              <span>{t("checkout.discount")}</span>
              <span className="text-ink">{order.discountMmk > 0 ? `-${formatPrice(order.discountMmk)}` : formatPrice(0)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-stone">
              <span>{t("checkout.shippingLabel")}</span>
              <span className="text-ink">{formatPrice(order.shippingMmk)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-stone">
              <span>{t("checkout.tax")}</span>
              <span className="text-ink">{formatPrice(order.taxMmk)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line pt-3 text-base font-medium text-ink">
              <span>{t("checkout.grandTotal")}</span>
              <span>{formatPrice(order.totalMmk)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex h-12 items-center justify-center border border-ink px-6 text-sm font-medium text-ink transition-colors hover:bg-mist"
        >
          {t("checkout.continueShopping")}
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-stone"
        >
          {t("checkout.backHome")}
        </Link>
      </div>
    </section>
  );
}
