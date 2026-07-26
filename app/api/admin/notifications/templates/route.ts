import { createNotificationGetRoute } from "@/features/notifications/application/notification-route";
import { getNotificationTemplates } from "@/features/notifications/application/notification-service";

export const GET = createNotificationGetRoute(async () => getNotificationTemplates());
