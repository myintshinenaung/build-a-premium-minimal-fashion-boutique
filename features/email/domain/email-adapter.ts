import type { EmailProvider } from "@/features/email/domain/email-provider";
import type { SendEmailInput, SendEmailResult } from "@/features/email/domain/email-job";

export interface EmailAdapter {
  readonly provider: EmailProvider;
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
