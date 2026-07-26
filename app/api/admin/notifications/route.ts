import { createNotificationGetRoute } from "@/features/notifications/application/notification-route";
import { getAdminNotifications } from "@/features/notifications/application/notification-service";

export const GET = createNotificationGetRoute(async (searchParams, context) =>
  getAdminNotifications(searchParams, { userId: context.userId })
);
