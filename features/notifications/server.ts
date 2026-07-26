/** Server-only notification exports. */
export {
  archiveNotification,
  deleteNotification,
  getAdminNotifications,
  getAdminUnreadCount,
  getFailedNotificationLogs,
  getNotificationDeliveryLogs,
  getNotificationTemplates,
  handleNotificationServiceError,
  markNotificationsRead,
  processSendNotificationRequest
} from "@/features/notifications/application/notification-service";
export {
  sendAdminNotification,
  sendCustomerNotification,
  sendNotification,
  type DeliveryResult
} from "@/features/notifications/application/send-notification";
export {
  createNotificationGetRoute,
  createNotificationPatchRoute,
  createNotificationPostRoute,
  handleNotificationApiError
} from "@/features/notifications/application/notification-route";
export { buildNotificationContent, renderTemplate } from "@/features/notifications/domain/notification-templates";
