import type { EmailTemplateId } from "@/features/email/domain/email-template";

export type EmailJob = {
  id: string;
  template: EmailTemplateId;
  to: string;
  subject: string;
  html: string;
  text: string;
  metadata?: Record<string, string>;
};

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult = {
  id: string;
};
