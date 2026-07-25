export const EMAIL_TEMPLATES = ["order_confirmation", "payment_success", "shipping"] as const;

export type EmailTemplateId = (typeof EMAIL_TEMPLATES)[number];
