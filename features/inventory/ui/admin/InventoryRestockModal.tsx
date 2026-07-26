"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type InventoryRestockModalProps = {
  products: Array<{ id: string; name: string }>;
};

export function InventoryRestockModal({ products }: InventoryRestockModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [incoming, setIncoming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/admin/inventory/restock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: Number(quantity), reason, incoming })
    });

    setPending(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Unable to restock inventory.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center bg-ink px-4 text-sm text-white hover:bg-stone">
        Restock
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 sm:items-center">
          <form onSubmit={handleSubmit} className="w-full max-w-lg border border-line bg-white p-5">
            <h2 className="text-lg font-medium text-ink">Restock Inventory</h2>
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
                <span>Quantity</span>
                <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="h-11 border border-line px-3" />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={incoming} onChange={(event) => setIncoming(event.target.checked)} />
                <span>Mark as incoming stock</span>
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
                Confirm Restock
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
