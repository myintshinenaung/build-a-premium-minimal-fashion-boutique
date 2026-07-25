/** Server-only email exports. Import from Server Components and route handlers. */
export { sendPaymentSuccessNotifications, sendShippingNotification } from "@/features/email/application/notification-service";
export { EmailConfigurationError, EmailDeliveryError } from "@/features/email/application/email-errors";
export type { EmailTemplateId } from "@/features/email/domain/email-template";
