import { Boxes } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";
import { inventoryService } from "@/features/inventory/application/inventory-service";

export async function AdminInventoryPage() {
  const inventory = await inventoryService.listProductInventory();

  return (
    <AdminPlaceholderPage
      title="Inventory"
      description="Track on-hand stock, active reservations, available units, and low-stock alerts."
      icon={<Boxes size={22} strokeWidth={1.7} />}
    >
      <div className="border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
              <tr>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">SKU</th>
                <th className="px-5 py-4 font-medium">Current</th>
                <th className="px-5 py-4 font-medium">Reserved</th>
                <th className="px-5 py-4 font-medium">Available</th>
                <th className="px-5 py-4 font-medium">Low Stock</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.productId} className="border-t border-line">
                  <td className="px-5 py-4 font-medium text-ink">{item.productName}</td>
                  <td className="px-5 py-4 text-stone">{item.sku}</td>
                  <td className="px-5 py-4 text-ink">{item.current}</td>
                  <td className="px-5 py-4 text-stone">{item.reserved}</td>
                  <td className="px-5 py-4 text-ink">{item.available}</td>
                  <td className="px-5 py-4">
                    {item.isLowStock ? (
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
      </div>
    </AdminPlaceholderPage>
  );
}
