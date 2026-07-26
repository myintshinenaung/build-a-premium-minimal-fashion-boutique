import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FailedNotificationTable } from "@/features/notifications/client";
import { getFailedNotificationLogs } from "@/features/notifications/server";

export const metadata: Metadata = {
  title: "Failed Notifications"
};

export const dynamic = "force-dynamic";

export default async function FailedNotificationsPage() {
  const data = await getFailedNotificationLogs(new URLSearchParams()).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1
  }));

  return (
    <section className="space-y-6">
      <AdminPageHeader title="Failed Notifications" description="Review delivery failures across all channels." />
      <FailedNotificationTable items={data.items} />
    </section>
  );
}
