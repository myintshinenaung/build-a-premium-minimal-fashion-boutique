import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NotificationDashboard } from "@/features/notifications/client";
import { getAdminNotifications } from "@/features/notifications/server";
import { getAdminUser } from "@/features/identity/server";
import type { NotificationType } from "@/types/notifications";

export const metadata: Metadata = {
  title: "Notification Dashboard"
};

export const dynamic = "force-dynamic";

type NotificationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const user = await getAdminUser();
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();

  const notificationType = resolvedSearchParams.notificationType;
  const from = resolvedSearchParams.from;
  const to = resolvedSearchParams.to;

  if (typeof notificationType === "string" && notificationType) {
    params.set("notificationType", notificationType);
  }

  if (typeof from === "string" && from) {
    params.set("from", from);
  }

  if (typeof to === "string" && to) {
    params.set("to", to);
  }

  const data = user
    ? await getAdminNotifications(params, { userId: user.id }).catch(() => ({
        items: [],
        unreadCount: 0,
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 1
      }))
    : { items: [], unreadCount: 0, total: 0, page: 1, pageSize: 20, totalPages: 1 };

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Notification Center"
        description="In-app notifications with unread counts, read state, and delivery tracking."
      />
      <NotificationDashboard
        items={data.items}
        unreadCount={data.unreadCount}
        filters={{
          notificationType:
            typeof notificationType === "string" ? (notificationType as NotificationType) : undefined,
          from: typeof from === "string" ? from : undefined,
          to: typeof to === "string" ? to : undefined
        }}
      />
    </section>
  );
}
