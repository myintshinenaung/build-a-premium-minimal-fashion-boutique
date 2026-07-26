"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type InventoryTransferFormProps = {
  products: Array<{ id: string; name: string }>;
  warehouses: Array<{ id: string; name: string }>;
};

export function InventoryTransferForm({ products, warehouses }: InventoryTransferFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [sourceWarehouseId, setSourceWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(warehouses[1]?.id ?? warehouses[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/admin/inventory/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, sourceWarehouseId, destinationWarehouseId, quantity: Number(quantity), reason })
    });

    setPending(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(payload?.message ?? "Unable to transfer inventory.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-white p-5">
      <h2 className="text-lg font-medium text-ink">Warehouse Transfer</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm md:col-span-2">
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
          <span>Source warehouse</span>
          <select value={sourceWarehouseId} onChange={(event) => setSourceWarehouseId(event.target.value)} className="h-11 border border-line px-3">
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span>Destination warehouse</span>
          <select value={destinationWarehouseId} onChange={(event) => setDestinationWarehouseId(event.target.value)} className="h-11 border border-line px-3">
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span>Quantity</span>
          <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="h-11 border border-line px-3" />
        </label>
        <label className="grid gap-2 text-sm md:col-span-2">
          <span>Reason</span>
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-24 border border-line px-3 py-2" />
        </label>
      </div>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      <div className="mt-5">
        <button type="submit" disabled={pending} className="h-11 bg-ink px-4 text-sm text-white disabled:opacity-50">
          Transfer Stock
        </button>
      </div>
    </form>
  );
}
