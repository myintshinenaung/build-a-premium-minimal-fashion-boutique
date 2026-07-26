import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeliveryLogTable } from "@/features/notifications/client";
import { getNotificationDeliveryLogs } from "@/features/notifications/server";

export const metadata: Metadata = {
  title: "Delivery Logs"
};

export const dynamic = "force-dynamic";

export default async function NotificationDeliveryLogsPage() {
  const data = await getNotificationDeliveryLogs(new URLSearchParams()).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1
  }));

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Delivery Logs" description="Track in-app, email, webhook, and push delivery attempts." />
      <DeliveryLogTable items={data.items} />
    </section>
  );
}
