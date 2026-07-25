import type { EmailJob } from "@/features/email/domain/email-job";

export interface EmailQueue {
  enqueue(job: EmailJob): Promise<void>;
}
