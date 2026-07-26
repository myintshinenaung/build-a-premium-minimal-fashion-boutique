export const NOTIFICATION_TYPES = [
  "order_created",
  "order_paid",
  "order_shipped",
  "order_delivered",
  "order_cancelled",
  "inventory_low_stock",
  "inventory_out_of_stock",
  "coupon_expiring",
  "new_review",
  "security_alert",
  "login_alert"
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TEMPLATE_CATEGORIES = ["order", "inventory", "marketing", "security", "review"] as const;
export type NotificationTemplateCategory = (typeof NOTIFICATION_TEMPLATE_CATEGORIES)[number];

export const NOTIFICATION_CHANNELS = ["in_app", "email", "webhook", "push"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_STATUSES = ["unread", "read", "archived"] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export const DELIVERY_STATUSES = ["pending", "sent", "failed"] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export type RecipientType = "admin" | "customer";

export type NotificationTemplate = {
  id: string;
  name: string;
  category: NotificationTemplateCategory;
  notificationType: NotificationType;
  subjectTemplate: string;
  bodyTemplate: string;
  channels: NotificationChannel[];
  enabled: boolean;
  updatedAt: string;
};

export type NotificationRecord = {
  id: string;
  recipientType: RecipientType;
  recipientId: string;
  recipientEmail: string | null;
  notificationType: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  channel: NotificationChannel;
  status: NotificationStatus;
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
};

export type NotificationDeliveryLog = {
  id: string;
  notificationId: string | null;
  templateId: string | null;
  channel: NotificationChannel;
  status: DeliveryStatus;
  recipient: string;
  payload: Record<string, unknown>;
  error: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type NotificationsListResponse = {
  items: NotificationRecord[];
  unreadCount: number;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type NotificationTemplatesResponse = {
  items: NotificationTemplate[];
};

export type NotificationDeliveryLogsResponse = {
  items: NotificationDeliveryLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SendNotificationInput = {
  notificationType: NotificationType;
  recipientType: RecipientType;
  recipientId: string;
  recipientEmail?: string | null;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
};

export const TEMPLATE_CATEGORY_LABELS: Record<NotificationTemplateCategory, string> = {
  order: "Order",
  inventory: "Inventory",
  marketing: "Marketing",
  security: "Security",
  review: "Review"
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  order_created: "Order Created",
  order_paid: "Order Paid",
  order_shipped: "Order Shipped",
  order_delivered: "Order Delivered",
  order_cancelled: "Order Cancelled",
  inventory_low_stock: "Inventory Low Stock",
  inventory_out_of_stock: "Inventory Out Of Stock",
  coupon_expiring: "Coupon Expiring",
  new_review: "New Review",
  security_alert: "Security Alert",
  login_alert: "Login Alert"
};
