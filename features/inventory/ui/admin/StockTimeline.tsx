import type { InventoryMovement } from "@/types/inventory-intelligence";

export function StockTimeline({ items }: { items: InventoryMovement[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-stone">No inventory movements recorded yet.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="border border-line bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-ink">{item.productName}</p>
              <p className="mt-1 text-sm text-stone">
                {item.movementType.replaceAll("_", " ")} · {item.warehouseName}
              </p>
            </div>
            <p className="text-sm text-stone">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
            <p>Qty: {item.quantity}</p>
            <p>Before: {item.quantityBefore}</p>
            <p>After: {item.quantityAfter}</p>
            <p>By: {item.userName}</p>
          </div>
          <p className="mt-3 text-sm text-stone">{item.reason}</p>
        </article>
      ))}
    </div>
  );
}
