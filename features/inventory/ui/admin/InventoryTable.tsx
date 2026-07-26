import type { ProductInventorySnapshot } from "@/features/inventory/domain/reservation";

export function InventoryTable({ items }: { items: ProductInventorySnapshot[] }) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
          <tr>
            <th className="px-5 py-4 font-medium">Product</th>
            <th className="px-5 py-4 font-medium">SKU</th>
            <th className="px-5 py-4 font-medium">Current</th>
            <th className="px-5 py-4 font-medium">Reserved</th>
            <th className="px-5 py-4 font-medium">Available</th>
            <th className="px-5 py-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId} className="border-t border-line">
              <td className="px-5 py-4 font-medium text-ink">{item.productName}</td>
              <td className="px-5 py-4 text-stone">{item.sku}</td>
              <td className="px-5 py-4 text-ink">{item.current}</td>
              <td className="px-5 py-4 text-stone">{item.reserved}</td>
              <td className="px-5 py-4 text-ink">{item.available}</td>
              <td className="px-5 py-4">
                {item.available <= 0 ? (
                  <span className="inline-flex border border-ink px-2 py-1 text-xs font-medium uppercase tracking-[0.12em] text-ink">
                    Out of stock
                  </span>
                ) : item.isLowStock ? (
                  <span className="inline-flex border border-ink px-2 py-1 text-xs font-medium uppercase tracking-[0.12em] text-ink">
                    Low stock
                  </span>
                ) : (
                  <span className="text-stone">OK</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
