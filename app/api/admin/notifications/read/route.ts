import { createNotificationPatchRoute } from "@/features/notifications/application/notification-route";
import { markNotificationsRead } from "@/features/notifications/application/notification-service";

export const PATCH = createNotificationPatchRoute(async (body, context) => markNotificationsRead(body, context));
