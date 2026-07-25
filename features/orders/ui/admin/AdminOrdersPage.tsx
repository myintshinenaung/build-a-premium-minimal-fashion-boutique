import { ShoppingBag } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatMmk } from "@/lib/admin-data";
import { orderService } from "@/features/orders/application/order-service";

export async function AdminOrdersPage() {
  const adminOrders = await orderService.getOrders();

  return (
    <AdminPlaceholderPage
      title="Orders"
      description="Placeholder order management for future Messenger, Viber, and checkout workflows."
      icon={<ShoppingBag size={22} strokeWidth={1.7} />}
    >
      <div className="border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
              <tr>
                <th className="px-5 py-4 font-medium">Order</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Channel</th>
                <th className="px-5 py-4 font-medium">Total</th>
                <th className="px-5 py-4 font-medium">Status</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPlaceholderPage>
  );
}
