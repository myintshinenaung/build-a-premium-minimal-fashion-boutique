import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NotificationTemplateTable } from "@/features/notifications/client";
import { getNotificationTemplates } from "@/features/notifications/server";

export const metadata: Metadata = {
  title: "Notification Templates"
};

export const dynamic = "force-dynamic";

export default async function NotificationTemplatesPage() {
  const data = await getNotificationTemplates().catch(() => ({ items: [] }));

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Notification Templates" description="Reusable order, inventory, marketing, security, and review templates." />
      <NotificationTemplateTable items={data.items} />
    </section>
  );
}
