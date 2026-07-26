import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InventoryTransferForm } from "@/features/inventory/client";
import { getInventoryDashboard } from "@/features/inventory/server";

export const metadata: Metadata = {
  title: "Inventory Transfers"
};

export const dynamic = "force-dynamic";

export default async function InventoryTransfersPage() {
  const data = await getInventoryDashboard();
  const products = data.items.map((item) => ({ id: item.productId, name: item.productName }));

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Warehouse Transfers" description="Move stock between warehouses with full movement tracking." />
      <InventoryTransferForm products={products} warehouses={data.warehouses} />
    </section>
  );
}
