import { createRepositoryError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PaymentProvider } from "@/features/payment/domain/payment-provider";

export type PaymentEventRecord = {
  id: string;
  provider: PaymentProvider;
  eventType: string;
  orderId: string | null;
  processedAt: string;
};

export const paymentEventRepository = {
  async hasProcessed(eventId: string): Promise<boolean> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("payment_events").select("id").eq("id", eventId).maybeSingle();

      if (error) {
        throw error;
      }

      return Boolean(data);
    } catch (error) {
      throw createRepositoryError("Unable to check payment event", error);
    }
  },

  async markProcessed(input: {
    eventId: string;
    provider: PaymentProvider;
    eventType: string;
    orderId: string | null;
  }): Promise<void> {
    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("payment_events").insert({
        id: input.eventId,
        provider: input.provider,
        event_type: input.eventType,
        order_id: input.orderId
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw createRepositoryError("Unable to record payment event", error);
    }
  }
};
