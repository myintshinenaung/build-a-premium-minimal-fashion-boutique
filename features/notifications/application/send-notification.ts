import { buildNotificationContent, getDefaultTemplateForType } from "@/features/notifications/domain/notification-templates";
import {
  deliveryLogRepository,
  notificationRepository,
  templateRepository
} from "@/features/notifications/infrastructure/notification-repository";
import { enqueueEmailJob } from "@/features/performance/infrastructure/job-queue";
import type { NotificationChannel, NotificationRecord, NotificationType, RecipientType, SendNotificationInput } from "@/types/notifications";

export type DeliveryResult = {
  notification: NotificationRecord | null;
  deliveries: Array<{ channel: NotificationChannel; status: "sent" | "failed" | "pending"; error?: string }>;
};

async function resolveTemplate(notificationType: NotificationType) {
  const stored = await templateRepository.getByType(notificationType);
  if (stored) {
    return {
      id: stored.id,
      subjectTemplate: stored.subjectTemplate,
      bodyTemplate: stored.bodyTemplate,
      channels: stored.channels
    };
  }

  const fallback = getDefaultTemplateForType(notificationType);
  return {
    id: null,
    subjectTemplate: fallback.subject,
    bodyTemplate: fallback.body,
    channels: ["in_app", "email"] as NotificationChannel[]
  };
}

async function deliverEmail(
  recipientEmail: string | null | undefined,
  title: string,
  body: string,
  notificationId: string | null,
  templateId: string | null
) {
  if (!recipientEmail) {
    await deliveryLogRepository.create({
      notificationId,
      templateId,
      channel: "email",
      status: "failed",
      recipient: "unknown",
      error: "Recipient email is required for email delivery."
    });
    return { channel: "email" as const, status: "failed" as const, error: "Missing recipient email" };
  }

  try {
    enqueueEmailJob("notification", recipientEmail);
    await deliveryLogRepository.create({
      notificationId,
      templateId,
      channel: "email",
      status: "pending",
      recipient: recipientEmail,
      payload: { title, body }
    });
    return { channel: "email" as const, status: "pending" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email queue failed.";
    await deliveryLogRepository.create({
      notificationId,
      templateId,
      channel: "email",
      status: "failed",
      recipient: recipientEmail,
      error: message
    });
    return { channel: "email" as const, status: "failed" as const, error: message };
  }
}

async function deliverWebhook(recipient: string, payload: Record<string, unknown>, notificationId: string | null) {
  await deliveryLogRepository.create({
    notificationId,
    channel: "webhook",
    status: "pending",
    recipient,
    payload
  });
  return { channel: "webhook" as const, status: "pending" as const };
}

async function deliverPush(recipient: string, payload: Record<string, unknown>, notificationId: string | null) {
  await deliveryLogRepository.create({
    notificationId,
    channel: "push",
    status: "pending",
    recipient,
    payload
  });
  return { channel: "push" as const, status: "pending" as const };
}

export async function sendNotification(input: SendNotificationInput): Promise<DeliveryResult> {
  const template = await resolveTemplate(input.notificationType);
  const data = input.data ?? {};
  const content = buildNotificationContent(template, data);
  const channels = input.channels ?? template.channels ?? ["in_app"];
  const deliveries: DeliveryResult["deliveries"] = [];
  let notification: NotificationRecord | null = null;

  if (channels.includes("in_app")) {
    notification = await notificationRepository.create({
      recipientType: input.recipientType,
      recipientId: input.recipientId,
      recipientEmail: input.recipientEmail,
      notificationType: input.notificationType,
      title: content.title,
      body: content.body,
      data,
      channel: "in_app"
    });

    await deliveryLogRepository.create({
      notificationId: notification.id,
      templateId: template.id,
      channel: "in_app",
      status: "sent",
      recipient: input.recipientId,
      payload: { title: content.title, body: content.body },
      sentAt: new Date().toISOString()
    });

    deliveries.push({ channel: "in_app", status: "sent" });
  }

  if (channels.includes("email")) {
    deliveries.push(
      await deliverEmail(input.recipientEmail, content.title, content.body, notification?.id ?? null, template.id)
    );
  }

  if (channels.includes("webhook")) {
    deliveries.push(
      await deliverWebhook(input.recipientId, { title: content.title, body: content.body, ...data }, notification?.id ?? null)
    );
  }

  if (channels.includes("push")) {
    deliveries.push(await deliverPush(input.recipientId, { title: content.title, body: content.body }, notification?.id ?? null));
  }

  return { notification, deliveries };
}

export async function sendAdminNotification(
  adminUserId: string,
  adminEmail: string | null,
  notificationType: NotificationType,
  data: Record<string, unknown> = {}
) {
  return sendNotification({
    notificationType,
    recipientType: "admin",
    recipientId: adminUserId,
    recipientEmail: adminEmail,
    data
  });
}

export async function sendCustomerNotification(
  accountId: string,
  email: string | null,
  notificationType: NotificationType,
  data: Record<string, unknown> = {}
) {
  return sendNotification({
    notificationType,
    recipientType: "customer",
    recipientId: accountId,
    recipientEmail: email,
    data
  });
}
