import { ZodError } from "zod";
import type { AdminAccessContext } from "@/features/security/application/admin-access";
import { sendNotification } from "@/features/notifications/application/send-notification";
import {
  markReadSchema,
  parseDeliveryLogQuery,
  parseNotificationQuery,
  sendNotificationSchema
} from "@/features/notifications/domain/notification-schemas";
import {
  deliveryLogRepository,
  notificationRepository,
  templateRepository
} from "@/features/notifications/infrastructure/notification-repository";

export class NotificationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationValidationError";
  }
}

export function handleNotificationServiceError(error: unknown) {
  if (error instanceof NotificationValidationError || error instanceof ZodError) {
    const message = error instanceof ZodError ? error.issues[0]?.message ?? "Invalid request." : error.message;
    return { message, status: 400 };
  }

  return {
    message: error instanceof Error ? error.message : "Something went wrong.",
    status: 500
  };
}

export async function getAdminNotifications(
  searchParams: URLSearchParams,
  adminContext?: Pick<AdminAccessContext, "userId">
) {
  const query = parseNotificationQuery(searchParams);
  const recipientId = adminContext?.userId ?? "admin";

  const [list, unreadCount] = await Promise.all([
    notificationRepository.list({
      page: query.page,
      pageSize: query.pageSize,
      recipientType: "admin",
      recipientId,
      status: query.status,
      notificationType: query.notificationType,
      from: query.from,
      to: query.to
    }),
    notificationRepository.countUnread("admin", recipientId)
  ]);

  return {
    ...list,
    unreadCount
  };
}

export async function getNotificationTemplates() {
  const items = await templateRepository.list();
  return { items };
}

export async function getNotificationDeliveryLogs(searchParams: URLSearchParams) {
  const query = parseDeliveryLogQuery(searchParams);
  return deliveryLogRepository.list({
    page: query.page,
    pageSize: query.pageSize,
    status: query.status,
    channel: query.channel
  });
}

export async function getFailedNotificationLogs(searchParams: URLSearchParams) {
  const query = parseDeliveryLogQuery(searchParams);
  return deliveryLogRepository.list({
    page: query.page,
    pageSize: query.pageSize,
    status: "failed",
    channel: query.channel
  });
}

export async function processSendNotificationRequest(body: unknown) {
  const input = sendNotificationSchema.parse(body);
  return sendNotification(input);
}

export async function markNotificationsRead(body: unknown, adminContext: Pick<AdminAccessContext, "userId">) {
  const input = markReadSchema.parse(body);
  const readItems = [];
  const archivedItems = [];

  if (input.all) {
    readItems.push(...(await notificationRepository.markAllRead("admin", adminContext.userId)));
  } else if (input.ids?.length) {
    readItems.push(...(await notificationRepository.markRead(input.ids)));
  }

  if (input.archiveIds?.length) {
    for (const id of input.archiveIds) {
      archivedItems.push(await notificationRepository.archive(id));
    }
  }

  return {
    items: [...readItems, ...archivedItems],
    count: readItems.length + archivedItems.length,
    readCount: readItems.length,
    archivedCount: archivedItems.length
  };
}

export async function archiveNotification(id: string) {
  return notificationRepository.archive(id);
}

export async function deleteNotification(id: string) {
  await notificationRepository.delete(id);
  return { ok: true };
}

export async function getAdminUnreadCount(adminUserId: string) {
  return notificationRepository.countUnread("admin", adminUserId);
}
