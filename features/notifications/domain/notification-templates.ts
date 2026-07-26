import type { NotificationTemplateCategory, NotificationType } from "@/types/notifications";

export function renderTemplate(template: string, data: Record<string, unknown>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = data[key];
    return value == null ? "" : String(value);
  });
}

export function getDefaultTemplateForType(type: NotificationType) {
  const map: Record<NotificationType, { category: NotificationTemplateCategory; subject: string; body: string }> = {
    order_created: {
      category: "order",
      subject: "Order {{orderNumber}} received",
      body: "Your order {{orderNumber}} has been created."
    },
    order_paid: {
      category: "order",
      subject: "Payment confirmed for {{orderNumber}}",
      body: "Payment for order {{orderNumber}} was successful."
    },
    order_shipped: {
      category: "order",
      subject: "Order {{orderNumber}} shipped",
      body: "Your order {{orderNumber}} is on the way."
    },
    order_delivered: {
      category: "order",
      subject: "Order {{orderNumber}} delivered",
      body: "Your order {{orderNumber}} has been delivered."
    },
    order_cancelled: {
      category: "order",
      subject: "Order {{orderNumber}} cancelled",
      body: "Your order {{orderNumber}} was cancelled."
    },
    inventory_low_stock: {
      category: "inventory",
      subject: "Low stock: {{productName}}",
      body: "{{productName}} is below the low stock threshold ({{quantity}} remaining)."
    },
    inventory_out_of_stock: {
      category: "inventory",
      subject: "Out of stock: {{productName}}",
      body: "{{productName}} is out of stock."
    },
    coupon_expiring: {
      category: "marketing",
      subject: "Coupon {{couponCode}} expiring soon",
      body: "Your coupon {{couponCode}} expires on {{expiresAt}}."
    },
    new_review: {
      category: "review",
      subject: "New review on {{productName}}",
      body: "A new {{rating}}-star review was submitted for {{productName}}."
    },
    security_alert: {
      category: "security",
      subject: "Security alert: {{title}}",
      body: "{{message}}"
    },
    login_alert: {
      category: "security",
      subject: "New login detected",
      body: "A login was detected from {{deviceLabel}} at {{timestamp}}."
    }
  };

  return map[type];
}

export function buildNotificationContent(
  template: { subjectTemplate: string; bodyTemplate: string },
  data: Record<string, unknown>
) {
  return {
    title: renderTemplate(template.subjectTemplate, data),
    body: renderTemplate(template.bodyTemplate, data)
  };
}
