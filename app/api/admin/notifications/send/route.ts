import { createNotificationPostRoute } from "@/features/notifications/application/notification-route";
import { processSendNotificationRequest } from "@/features/notifications/application/notification-service";

export const POST = createNotificationPostRoute(async (body) => processSendNotificationRequest(body));
