import Link from "next/link";
import type { AccountOrderSummary } from "@/types/account";
import { formatPrice } from "@/lib/utils";

type OrdersListProps = {
  orders: AccountOrderSummary[];
};

function formatDate(value: string) {
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

export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-novora-border bg-novora-surface/50 px-5 py-10 text-center">
        <p className="text-sm text-novora-muted">You have no orders yet.</p>
        <Link
          href="/shop"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-novora-ink px-5 text-sm font-medium text-white"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/account/orders/${order.id}`}
            className="block rounded-3xl border border-novora-border bg-white p-5 transition-colors hover:bg-novora-surface/60"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-novora-ink">{order.id}</p>
                <p className="mt-1 text-xs text-novora-muted">{formatDate(order.createdAt)}</p>
              </div>
              <p className="text-sm font-semibold text-novora-ink">{formatPrice(order.totalMmk)}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-novora-muted">
              <span className="rounded-full bg-novora-surface px-2.5 py-1 capitalize">{order.status}</span>
              <span className="rounded-full bg-novora-surface px-2.5 py-1 capitalize">
                Payment: {order.paymentStatus}
              </span>
              <span className="rounded-full bg-novora-surface px-2.5 py-1">
                {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
