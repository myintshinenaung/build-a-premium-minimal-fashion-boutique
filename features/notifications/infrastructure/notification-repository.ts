import { createRepositoryError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  NotificationDeliveryLogRow,
  NotificationRow,
  NotificationTemplateRow
} from "@/lib/supabase/types";
import type {
  DeliveryStatus,
  NotificationChannel,
  NotificationDeliveryLog,
  NotificationRecord,
  NotificationStatus,
  NotificationTemplate,
  NotificationType,
  RecipientType
} from "@/types/notifications";

function createNotificationId(prefix: string) {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

function templateFromRow(row: NotificationTemplateRow): NotificationTemplate {
  return {
    id: row.id,
    name: row.name,
    category: row.category as NotificationTemplate["category"],
    notificationType: row.notification_type as NotificationType,
    subjectTemplate: row.subject_template,
    bodyTemplate: row.body_template,
    channels: row.channels as NotificationChannel[],
    enabled: row.enabled,
    updatedAt: row.updated_at
  };
}

function notificationFromRow(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    recipientType: row.recipient_type as RecipientType,
    recipientId: row.recipient_id,
    recipientEmail: row.recipient_email,
    notificationType: row.notification_type as NotificationType,
    title: row.title,
    body: row.body,
    data: row.data ?? {},
    channel: row.channel as NotificationChannel,
    status: row.status as NotificationStatus,
    readAt: row.read_at,
    archivedAt: row.archived_at,
    createdAt: row.created_at
  };
}

function deliveryLogFromRow(row: NotificationDeliveryLogRow): NotificationDeliveryLog {
  return {
    id: row.id,
    notificationId: row.notification_id,
    templateId: row.template_id,
    channel: row.channel as NotificationChannel,
    status: row.status as DeliveryStatus,
    recipient: row.recipient,
    payload: row.payload ?? {},
    error: row.error,
    sentAt: row.sent_at,
    createdAt: row.created_at
  };
}

export const templateRepository = {
  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("notification_templates").select("*").order("name");

      if (error) {
        throw error;
      }

      return (data ?? []).map(templateFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to load notification templates", error);
    }
  },

  async getByType(notificationType: NotificationType) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("notification_type", notificationType)
        .eq("enabled", true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? templateFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to load notification template", error);
    }
  }
};

export const notificationRepository = {
  async create(input: {
    recipientType: RecipientType;
    recipientId: string;
    recipientEmail?: string | null;
    notificationType: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channel?: NotificationChannel;
    status?: NotificationStatus;
  }) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          id: createNotificationId("NTF"),
          recipient_type: input.recipientType,
          recipient_id: input.recipientId,
          recipient_email: input.recipientEmail ?? null,
          notification_type: input.notificationType,
          title: input.title,
          body: input.body,
          data: input.data ?? {},
          channel: input.channel ?? "in_app",
          status: input.status ?? "unread",
          read_at: null,
          archived_at: null
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return notificationFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to create notification", error);
    }
  },

  async list(params: {
    page: number;
    pageSize: number;
    recipientType?: RecipientType;
    recipientId?: string;
    status?: NotificationStatus;
    notificationType?: NotificationType;
    from?: string;
    to?: string;
  }) {
    try {
      const supabase = createSupabaseServerClient();
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;

      let query = supabase.from("notifications").select("*", { count: "exact" }).order("created_at", { ascending: false });

      if (params.recipientType) {
        query = query.eq("recipient_type", params.recipientType);
      }

      if (params.recipientId) {
        query = query.eq("recipient_id", params.recipientId);
      }

      if (params.status) {
        query = query.eq("status", params.status);
      }

      if (params.notificationType) {
        query = query.eq("notification_type", params.notificationType);
      }

      if (params.from) {
        query = query.gte("created_at", `${params.from}T00:00:00.000Z`);
      }

      if (params.to) {
        query = query.lte("created_at", `${params.to}T23:59:59.999Z`);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw error;
      }

      const total = count ?? 0;

      return {
        items: (data ?? []).map(notificationFromRow),
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.max(1, Math.ceil(total / params.pageSize))
      };
    } catch (error) {
      throw createRepositoryError("Unable to load notifications", error);
    }
  },

  async countUnread(recipientType: RecipientType, recipientId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_type", recipientType)
        .eq("recipient_id", recipientId)
        .eq("status", "unread");

      if (error) {
        throw error;
      }

      return count ?? 0;
    } catch (error) {
      throw createRepositoryError("Unable to count unread notifications", error);
    }
  },

  async markRead(ids: string[]) {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("notifications")
        .update({ status: "read", read_at: timestamp })
        .in("id", ids)
        .select("*");

      if (error) {
        throw error;
      }

      return (data ?? []).map(notificationFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to mark notifications as read", error);
    }
  },

  async markAllRead(recipientType: RecipientType, recipientId: string) {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("notifications")
        .update({ status: "read", read_at: timestamp })
        .eq("recipient_type", recipientType)
        .eq("recipient_id", recipientId)
        .eq("status", "unread")
        .select("*");

      if (error) {
        throw error;
      }

      return (data ?? []).map(notificationFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to mark all notifications as read", error);
    }
  },

  async archive(id: string) {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("notifications")
        .update({ status: "archived", archived_at: timestamp })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return notificationFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to archive notification", error);
    }
  },

  async delete(id: string) {
    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("notifications").delete().eq("id", id);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw createRepositoryError("Unable to delete notification", error);
    }
  }
};

export const deliveryLogRepository = {
  async create(input: {
    notificationId?: string | null;
    templateId?: string | null;
    channel: NotificationChannel;
    status: DeliveryStatus;
    recipient: string;
    payload?: Record<string, unknown>;
    error?: string | null;
    sentAt?: string | null;
  }) {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("notification_delivery_logs")
        .insert({
          id: createNotificationId("DLV"),
          notification_id: input.notificationId ?? null,
          template_id: input.templateId ?? null,
          channel: input.channel,
          status: input.status,
          recipient: input.recipient,
          payload: input.payload ?? {},
          error: input.error ?? null,
          sent_at: input.sentAt ?? null
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return deliveryLogFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to record delivery log", error);
    }
  },

  async list(params: {
    page: number;
    pageSize: number;
    status?: DeliveryStatus;
    channel?: NotificationChannel;
  }) {
    try {
      const supabase = createSupabaseServerClient();
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;

      let query = supabase
        .from("notification_delivery_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (params.status) {
        query = query.eq("status", params.status);
      }

      if (params.channel) {
        query = query.eq("channel", params.channel);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        throw error;
      }

      const total = count ?? 0;

      return {
        items: (data ?? []).map(deliveryLogFromRow),
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.max(1, Math.ceil(total / params.pageSize))
      };
    } catch (error) {
      throw createRepositoryError("Unable to load delivery logs", error);
    }
  }
};

export function createNotificationRecordId() {
  return createNotificationId("NTF");
}
