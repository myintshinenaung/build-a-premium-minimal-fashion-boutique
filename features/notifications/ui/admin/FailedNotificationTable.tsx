import { DeliveryLogTable } from "@/features/notifications/ui/admin/DeliveryLogTable";
import type { NotificationDeliveryLog } from "@/types/notifications";

type FailedNotificationTableProps = {
  items: NotificationDeliveryLog[];
};

export function FailedNotificationTable({ items }: FailedNotificationTableProps) {
  return <DeliveryLogTable items={items} />;
}
