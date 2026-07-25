import type { EmailAdapter } from "@/features/email/domain/email-adapter";
import { DEFAULT_EMAIL_PROVIDER, type EmailProvider } from "@/features/email/domain/email-provider";
import { EmailConfigurationError } from "@/features/email/application/email-errors";
import { resendEmailAdapter } from "@/features/email/infrastructure/resend-adapter";

const adapters: Record<EmailProvider, EmailAdapter> = {
  resend: resendEmailAdapter
};

export function getEmailAdapter(provider: EmailProvider = DEFAULT_EMAIL_PROVIDER): EmailAdapter {
  const adapter = adapters[provider];

  if (!adapter) {
    throw new EmailConfigurationError(`Email provider "${provider}" is not supported.`);
  }

  return adapter;
}
