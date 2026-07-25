import { z } from "zod";

export const createPaymentInputSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required."),
  idempotencyKey: z.string().trim().min(1, "Idempotency key is required.")
});

export type CreatePaymentInput = z.infer<typeof createPaymentInputSchema>;
