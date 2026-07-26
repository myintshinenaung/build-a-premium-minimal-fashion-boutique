import type { InventoryAlert } from "@/types/inventory-intelligence";

const labels: Record<InventoryAlert["level"], string> = {
  low_stock: "Low stock",
  critical_stock: "Critical",
  out_of_stock: "Out of stock",
  overstock: "Overstock"
};

export function InventoryAlertTable({ alerts }: { alerts: InventoryAlert[] }) {
  if (alerts.length === 0) {
    return <p className="text-sm text-stone">No active stock alerts.</p>;
  }

  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
          <tr>
            <th className="px-5 py-4 font-medium">Product</th>
            <th className="px-5 py-4 font-medium">SKU</th>
            <th className="px-5 py-4 font-medium">Available</th>
            <th className="px-5 py-4 font-medium">Alert</th>
            <th className="px-5 py-4 font-medium">Threshold</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={`${alert.productId}-${alert.level}`} className="border-t border-line">
              <td className="px-5 py-4 font-medium text-ink">{alert.productName}</td>
              <td className="px-5 py-4 text-stone">{alert.sku}</td>
              <td className="px-5 py-4 text-ink">{alert.available}</td>
              <td className="px-5 py-4 text-ink">{labels[alert.level]}</td>
              <td className="px-5 py-4 text-stone">{alert.threshold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
