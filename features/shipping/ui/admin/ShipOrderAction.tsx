"use client";

import { PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestAdminJson } from "@/features/identity/client";
import type { AdminOrder } from "@/types/admin";

const inputClass =
  "mt-2 w-full border border-line bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-stone/70 focus:border-ink";
const labelClass = "text-xs font-medium uppercase tracking-[0.18em] text-stone";

type ShipOrderActionProps = {
  order: AdminOrder;
};

export function ShipOrderAction({ order }: ShipOrderActionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (order.shippingStatus === "shipped") {
    return (
      <div className="text-xs text-stone">
        <p>{order.carrier ?? "—"}</p>
        <p className="mt-1">{order.trackingNumber ?? "—"}</p>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await requestAdminJson<{ order: AdminOrder }>(`/api/orders/${encodeURIComponent(order.id)}/ship`, {
        method: "POST",
        body: JSON.stringify({ carrier, trackingNumber })
      });

      setIsOpen(false);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to mark order as shipped.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 border border-ink px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-mist"
      >
        <PackageCheck size={15} strokeWidth={1.7} />
        Mark as Shipped
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-[220px] space-y-3">
      <label className="block">
        <span className={labelClass}>Carrier</span>
        <input className={inputClass} value={carrier} onChange={(event) => setCarrier(event.target.value)} required />
      </label>
      <label className="block">
        <span className={labelClass}>Tracking number</span>
        <input
          className={inputClass}
          value={trackingNumber}
          onChange={(event) => setTrackingNumber(event.target.value)}
          required
        />
      </label>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-ink px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-stone disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Confirm shipment"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setError("");
          }}
          className="border border-line px-3 py-2 text-xs font-medium text-stone transition-colors hover:bg-mist"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
