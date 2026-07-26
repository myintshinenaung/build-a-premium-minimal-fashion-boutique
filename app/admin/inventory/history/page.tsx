import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StockTimeline } from "@/features/inventory/client";
import { getInventoryHistory } from "@/features/inventory/server";

export const metadata: Metadata = {
  title: "Inventory History"
};

export const dynamic = "force-dynamic";

type InventoryHistoryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InventoryHistoryPage({ searchParams }: InventoryHistoryPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getInventoryHistory(resolvedSearchParams ?? {});

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Inventory Movement" description="Complete audit trail of stock changes with before/after quantities." />
      <StockTimeline items={data.items} />
    </section>
  );
}
