import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AccountShell } from "@/features/account/ui/storefront/AccountShell";
import { OrderDetailView } from "@/features/account/ui/storefront/OrderDetailView";
import { accountOrderService, OrderAccessError, requireCustomerPage } from "@/features/account/server";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id}` };
}

export default async function AccountOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const session = await requireCustomerPage(`/account/orders/${id}`);

  try {
    const order = await accountOrderService.getOrder(session.account.id, id);

    return (
      <AccountShell title="Order detail" description={order.id} backHref="/account/orders" backLabel="My Orders">
        <OrderDetailView order={order} />
      </AccountShell>
    );
  } catch (error) {
    if (error instanceof OrderAccessError) {
      notFound();
    }

    throw error;
  }
}
