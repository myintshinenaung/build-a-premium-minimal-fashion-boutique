import { z } from "zod";

export const shipOrderInputSchema = z.object({
  carrier: z.string().trim().min(1, "Carrier is required."),
  trackingNumber: z.string().trim().min(1, "Tracking number is required.")
});

export type ShipOrderInput = z.infer<typeof shipOrderInputSchema>;
