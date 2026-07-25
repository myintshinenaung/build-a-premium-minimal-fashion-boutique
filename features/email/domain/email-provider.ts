export const EMAIL_PROVIDERS = ["resend"] as const;

export type EmailProvider = (typeof EMAIL_PROVIDERS)[number];

export const DEFAULT_EMAIL_PROVIDER: EmailProvider = "resend";
