import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InventoryAlertTable } from "@/features/inventory/client";
import { getInventoryAlerts } from "@/features/inventory/server";

export const metadata: Metadata = {
  title: "Inventory Alerts"
};

export const dynamic = "force-dynamic";

export default async function InventoryAlertsPage() {
  const data = await getInventoryAlerts();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Stock Alerts"
        description={`Low ${data.settings.lowStockThreshold}, critical ${data.settings.criticalStockThreshold}, overstock ${data.settings.overstockThreshold}.`}
      />
      <InventoryAlertTable alerts={data.alerts} />
    </section>
  );
}
