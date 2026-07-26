"use client";

import type { InventoryForecastItem } from "@/types/inventory-intelligence";

export function InventoryForecastChart({ items }: { items: InventoryForecastItem[] }) {
  const topItems = items.slice(0, 8);
  const max = Math.max(...topItems.map((item) => item.weeklyDemand), 1);

  return (
    <div className="space-y-4">
      {topItems.map((item) => (
        <div key={item.productId}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-stone">{item.productName}</span>
            <span className="font-medium text-ink">{item.weeklyDemand} / week</span>
          </div>
          <div className="h-3 bg-mist">
            <div className="h-3 bg-ink" style={{ width: `${(item.weeklyDemand / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
