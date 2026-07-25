import { ShoppingBag } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { orderService } from "@/features/orders/application/order-service";
import { ShipOrderAction } from "@/features/shipping/ui/admin/ShipOrderAction";
import { formatMmk } from "@/lib/admin-data";

export async function AdminOrdersPage() {
  const adminOrders = await orderService.getOrders();

  return (
    <AdminPlaceholderPage
      title="Orders"
      description="Review web checkout orders and mark paid orders as shipped with carrier tracking."
      icon={<ShoppingBag size={22} strokeWidth={1.7} />}
    >
      <div className="border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
              <tr>
                <th className="px-5 py-4 font-medium">Order</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Channel</th>
                <th className="px-5 py-4 font-medium">Total</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Shipping</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminOrders.map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="px-5 py-4 font-medium text-ink">{order.id}</td>
                  <td className="px-5 py-4 text-stone">{order.customer}</td>
                  <td className="px-5 py-4 text-stone">{order.channel}</td>
                  <td className="px-5 py-4 text-ink">{formatMmk(order.totalMmk)}</td>
                  <td className="px-5 py-4">
                    <AdminStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 capitalize text-stone">{order.shippingStatus}</td>
                  <td className="px-5 py-4">
                    <ShipOrderAction order={order} />
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
