import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InventoryForecastChart } from "@/features/inventory/client";
import { getInventoryForecast } from "@/features/inventory/server";

export const metadata: Metadata = {
  title: "Inventory Forecast"
};

export const dynamic = "force-dynamic";

export default async function InventoryForecastPage() {
  const data = await getInventoryForecast();

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Demand Forecast" description="Sales velocity, demand projections, and suggested reorder quantities." />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="border border-line bg-white p-5">
          <InventoryForecastChart items={data.items} />
        </div>
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
              <tr>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">Daily</th>
                <th className="px-5 py-4 font-medium">Weekly</th>
                <th className="px-5 py-4 font-medium">Days Left</th>
                <th className="px-5 py-4 font-medium">Reorder</th>
              </tr>
            </thead>
            <tbody>
              {data.items.slice(0, 12).map((item) => (
                <tr key={item.productId} className="border-t border-line">
                  <td className="px-5 py-4 font-medium text-ink">{item.productName}</td>
                  <td className="px-5 py-4 text-stone">{item.dailySalesVelocity}</td>
                  <td className="px-5 py-4 text-stone">{item.weeklyDemand}</td>
                  <td className="px-5 py-4 text-stone">{item.estimatedDaysRemaining ?? "—"}</td>
                  <td className="px-5 py-4 text-ink">{item.suggestedReorderQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
