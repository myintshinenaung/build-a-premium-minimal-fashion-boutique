import { z } from "zod";
import { NOTIFICATION_CHANNELS, NOTIFICATION_STATUSES, NOTIFICATION_TYPES } from "@/types/notifications";

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(NOTIFICATION_STATUSES).optional(),
  notificationType: z.enum(NOTIFICATION_TYPES).optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  recipientType: z.enum(["admin", "customer"]).optional()
});

export const markReadSchema = z
  .object({
    ids: z.array(z.string().trim().min(1)).optional(),
    all: z.boolean().optional(),
    archiveIds: z.array(z.string().trim().min(1)).optional()
  })
  .refine((value) => value.all || (value.ids?.length ?? 0) > 0 || (value.archiveIds?.length ?? 0) > 0, {
    message: "Provide ids, archiveIds, or set all to true."
  });

export const sendNotificationSchema = z.object({
  notificationType: z.enum(NOTIFICATION_TYPES),
  recipientType: z.enum(["admin", "customer"]),
  recipientId: z.string().trim().min(1),
  recipientEmail: z.string().email().optional().nullable(),
  data: z.record(z.string(), z.unknown()).optional(),
  channels: z.array(z.enum(NOTIFICATION_CHANNELS)).optional()
});

export const deliveryLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "sent", "failed"]).optional(),
  channel: z.enum(NOTIFICATION_CHANNELS).optional()
});

export function parseNotificationQuery(searchParams: URLSearchParams | Record<string, string | string[] | undefined>) {
  const input =
    searchParams instanceof URLSearchParams
      ? Object.fromEntries(searchParams.entries())
      : Object.fromEntries(
          Object.entries(searchParams).flatMap(([key, value]) => {
            if (value === undefined) return [];
            return [[key, Array.isArray(value) ? value[0] : value]];
          })
        );

  return notificationQuerySchema.parse(input);
}

export function parseDeliveryLogQuery(searchParams: URLSearchParams | Record<string, string | string[] | undefined>) {
  const input =
    searchParams instanceof URLSearchParams
      ? Object.fromEntries(searchParams.entries())
      : Object.fromEntries(
          Object.entries(searchParams).flatMap(([key, value]) => {
            if (value === undefined) return [];
            return [[key, Array.isArray(value) ? value[0] : value]];
          })
        );

  return deliveryLogQuerySchema.parse(input);
}
