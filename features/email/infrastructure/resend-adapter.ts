import { Resend } from "resend";
import type { EmailAdapter } from "@/features/email/domain/email-adapter";
import type { SendEmailInput, SendEmailResult } from "@/features/email/domain/email-job";
import { EmailDeliveryError } from "@/features/email/application/email-errors";
import { getEmailFromAddress, getResendApiKey } from "@/features/email/infrastructure/resend-config";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(getResendApiKey());
  }

  return resendClient;
}

export const resendEmailAdapter: EmailAdapter = {
  provider: "resend",

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: getEmailFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text
    });

    if (error) {
      throw new EmailDeliveryError(error.message);
    }

    if (!data?.id) {
      throw new EmailDeliveryError("Resend did not return a message id.");
    }

    return { id: data.id };
  }
};
