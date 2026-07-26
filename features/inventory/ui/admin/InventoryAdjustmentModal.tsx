"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type InventoryAdjustmentModalProps = {
  products: Array<{ id: string; name: string }>;
};

export function InventoryAdjustmentModal({ products }: InventoryAdjustmentModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("0");
  const [reason, setReason] = useState("");
  const [movementType, setMovementType] = useState<"manual_adjustment" | "damage" | "return">("manual_adjustment");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/admin/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: Number(quantity), reason, movementType })
    });

    setPending(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Unable to adjust inventory.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center border border-line px-4 text-sm text-ink hover:border-ink">
        Adjust Stock
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 sm:items-center">
          <form onSubmit={handleSubmit} className="w-full max-w-lg border border-line bg-white p-5">
            <h2 className="text-lg font-medium text-ink">Manual Adjustment</h2>
            <div className="mt-4 space-y-4">
              <label className="grid gap-2 text-sm">
                <span>Product</span>
                <select value={productId} onChange={(event) => setProductId(event.target.value)} className="h-11 border border-line px-3">
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                <span>Quantity (+/-)</span>
                <input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="h-11 border border-line px-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Type</span>
                <select value={movementType} onChange={(event) => setMovementType(event.target.value as typeof movementType)} className="h-11 border border-line px-3">
                  <option value="manual_adjustment">Manual adjustment</option>
                  <option value="damage">Damage</option>
                  <option value="return">Return</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm">
                <span>Reason</span>
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-24 border border-line px-3 py-2" />
              </label>
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="h-11 px-4 text-sm text-stone">
                Cancel
              </button>
              <button type="submit" disabled={pending} className="h-11 bg-ink px-4 text-sm text-white disabled:opacity-50">
                Save Adjustment
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
