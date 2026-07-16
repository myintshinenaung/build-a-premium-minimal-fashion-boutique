import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderRow } from "@/lib/supabase/types";
import type { AdminOrder } from "@/types/admin";

export const orderRepository = {
  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(orderFromRow);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load orders", error);
    }
  }
};

function orderFromRow(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    customer: row.customer,
    totalMmk: row.total_mmk,
    status: row.status,
    channel: row.channel,
    createdAt: row.created_at
  };
}
