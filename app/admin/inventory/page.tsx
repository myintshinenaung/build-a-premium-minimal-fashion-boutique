import type { Metadata } from "next";
import { Boxes, Package, ShoppingCart, TrendingUp, Truck, Warehouse } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatMmk } from "@/lib/admin-data";
import {
  InventoryAdjustmentModal,
  InventoryKpiGrid,
  InventoryRestockModal,
  InventoryTable
} from "@/features/inventory/client";
import { getInventoryDashboard } from "@/features/inventory/server";

export const metadata: Metadata = {
  title: "Inventory Overview"
};

export const dynamic = "force-dynamic";

export default async function InventoryOverviewPage() {
  const data = await getInventoryDashboard();
  const products = data.items.map((item) => ({ id: item.productId, name: item.productName }));

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Inventory Dashboard"
        description="Track stock levels, reservations, incoming inventory, and warehouse value."
        action={
          <div className="flex flex-wrap gap-3">
            <InventoryAdjustmentModal products={products} />
            <InventoryRestockModal products={products} />
          </div>
        }
      />

      <InventoryKpiGrid
        items={[
          { label: "Total Stock", value: String(data.kpis.totalStock), helper: "On-hand units", icon: <Boxes size={19} strokeWidth={1.7} /> },
          { label: "Available Stock", value: String(data.kpis.availableStock), helper: "Ready to sell", icon: <Package size={19} strokeWidth={1.7} /> },
          { label: "Reserved Stock", value: String(data.kpis.reservedStock), helper: "Held in reservations", icon: <ShoppingCart size={19} strokeWidth={1.7} /> },
          { label: "Low Stock", value: String(data.kpis.lowStock), helper: `${data.kpis.outOfStock} out of stock`, icon: <TrendingUp size={19} strokeWidth={1.7} /> },
          { label: "Incoming Stock", value: String(data.kpis.incomingStock), helper: "Awaiting receipt", icon: <Truck size={19} strokeWidth={1.7} /> },
          { label: "Inventory Value", value: formatMmk(data.kpis.inventoryValueMmk), helper: `${data.warehouses.length} warehouses`, icon: <Warehouse size={19} strokeWidth={1.7} /> }
        ]}
      />

      <InventoryTable items={data.items} />
    </section>
  );
}
