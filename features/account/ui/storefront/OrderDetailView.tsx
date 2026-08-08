import Link from "next/link";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import type { AccountOrderDetail } from "@/types/account";
import { formatPrice } from "@/lib/utils";

type OrderDetailViewProps = {
  order: AccountOrderDetail;
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-novora-border bg-white p-5">
        <p className="text-sm font-semibold text-novora-ink">{order.id}</p>
        <p className="mt-1 text-xs text-novora-muted">Placed {formatDate(order.createdAt)}</p>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-novora-muted">Order status</p>
            <p className="mt-1 capitalize text-novora-ink">{order.status}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-novora-muted">Payment status</p>
            <p className="mt-1 capitalize text-novora-ink">{order.paymentStatus}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-novora-muted">Fulfillment</p>
            <p className="mt-1 capitalize text-novora-ink">{order.shippingStatus}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-novora-muted">Total</p>
            <p className="mt-1 font-semibold text-novora-ink">{formatPrice(order.totalMmk)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-novora-border bg-white p-5">
        <h2 className="text-sm font-semibold text-novora-ink">Items</h2>
        <ul className="mt-4 divide-y divide-novora-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <Link href={`/product/${item.productSlug}`} className="shrink-0">
                <BoutiqueImage src={item.image} alt={item.productName} className="h-20 w-16 rounded-xl" sizes="64px" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${item.productSlug}`} className="text-sm font-medium text-novora-ink hover:underline">
                  {item.productName}
                </Link>
                <p className="mt-1 text-xs text-novora-muted">
                  {item.size} · {item.color} · Qty {item.quantity}
                </p>
                <p className="mt-2 text-sm text-novora-ink">{formatPrice(item.lineTotalMmk)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-novora-border bg-white p-5">
        <h2 className="text-sm font-semibold text-novora-ink">Address</h2>
        <p className="mt-3 text-sm text-novora-ink">{order.customer}</p>
        <p className="mt-1 text-sm text-novora-muted">{order.customerPhone}</p>
        {order.customerEmail ? <p className="mt-1 text-sm text-novora-muted">{order.customerEmail}</p> : null}
        <p className="mt-3 text-sm leading-6 text-novora-ink">{order.shippingAddress}</p>
        <p className="mt-1 text-sm text-novora-muted">{order.township}</p>
        {order.notes ? <p className="mt-3 text-sm text-novora-muted">Notes: {order.notes}</p> : null}
      </section>

      <section className="rounded-3xl border border-novora-border bg-white p-5">
        <h2 className="text-sm font-semibold text-novora-ink">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-novora-muted">Subtotal</dt>
            <dd className="text-novora-ink">{formatPrice(order.subtotalMmk)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-novora-muted">Delivery</dt>
            <dd className="text-novora-ink">{formatPrice(order.shippingMmk)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-novora-border pt-2 font-semibold">
            <dt className="text-novora-ink">Total</dt>
            <dd className="text-novora-ink">{formatPrice(order.totalMmk)}</dd>
          </div>
        </dl>
      </section>

      {order.timeline.length > 0 ? (
        <section className="rounded-3xl border border-novora-border bg-white p-5">
          <h2 className="text-sm font-semibold text-novora-ink">Timeline</h2>
          <ol className="mt-4 space-y-3">
            {order.timeline.map((event) => (
              <li key={event.key} className="text-sm">
                <p className="font-medium text-novora-ink">{event.label}</p>
                <p className="mt-0.5 text-xs text-novora-muted">{formatDate(event.at)}</p>
                {event.description ? <p className="mt-1 text-novora-muted">{event.description}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
