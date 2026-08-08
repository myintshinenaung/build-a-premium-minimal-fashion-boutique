import type { Metadata } from "next";
import { AccountShell } from "@/features/account/ui/storefront/AccountShell";
import { OrdersList } from "@/features/account/ui/storefront/OrdersList";
import { accountOrderService, requireCustomerPage } from "@/features/account/server";

export const metadata: Metadata = {
  title: "My Orders"
};

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const session = await requireCustomerPage("/account/orders");
  const orders = await accountOrderService.listOrders(session.account.id);

  return (
    <AccountShell title="My Orders" description="Review your NOVORA order history.">
      <OrdersList orders={orders} />
    </AccountShell>
  );
}
