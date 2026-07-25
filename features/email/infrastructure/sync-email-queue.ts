import type { EmailQueue } from "@/features/email/domain/email-queue";
import { EmailConfigurationError } from "@/features/email/application/email-errors";
import { getEmailAdapter } from "@/features/email/infrastructure/email-adapter-registry";

/**
 * Synchronous queue implementation for MVP.
 * Jobs are delivered immediately; the interface can be backed by a durable queue later.
 */
export const syncEmailQueue: EmailQueue = {
  async enqueue(job) {
    try {
      const adapter = getEmailAdapter();
      await adapter.send({
        to: job.to,
        subject: job.subject,
        html: job.html,
        text: job.text
      });
    } catch (error) {
      if (error instanceof EmailConfigurationError) {
        console.warn(`Email skipped (${job.template}): ${error.message}`);
        return;
      }

      throw error;
    }
  }
};
