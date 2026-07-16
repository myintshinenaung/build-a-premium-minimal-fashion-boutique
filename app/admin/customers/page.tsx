import type { Metadata } from "next";
import { Users } from "lucide-react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";
import { formatMmk } from "@/lib/admin-data";
import { customerService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Customers"
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const adminCustomers = await customerService.getCustomers();

  return (
    <AdminPlaceholderPage
      title="Customers"
      description="Placeholder customer profiles for future CRM, order history, and private notes."
      icon={<Users size={22} strokeWidth={1.7} />}
    >
      <div className="border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-[0.18em] text-stone">
              <tr>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Phone</th>
                <th className="px-5 py-4 font-medium">Orders</th>
                <th className="px-5 py-4 font-medium">Lifetime Value</th>
                <th className="px-5 py-4 font-medium">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {adminCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-line">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{customer.name}</p>
                    <p className="mt-1 text-xs text-stone">{customer.id}</p>
                  </td>
                  <td className="px-5 py-4 text-stone">{customer.phone}</td>
                  <td className="px-5 py-4 text-stone">{customer.orders}</td>
                  <td className="px-5 py-4 text-ink">{formatMmk(customer.lifetimeValueMmk)}</td>
                  <td className="px-5 py-4 text-stone">{customer.lastOrderAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPlaceholderPage>
  );
}
