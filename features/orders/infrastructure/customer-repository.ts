import { createRepositoryError, isRecoverableReadError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerRow } from "@/lib/supabase/types";
import type { AdminCustomer } from "@/types/admin";

export const customerRepository = {
  async list() {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("customers").select("*").order("last_order_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(customerFromRow);
    } catch (error) {
      if (isRecoverableReadError(error)) {
        return [];
      }

      throw createRepositoryError("Unable to load customers", error);
    }
  }
};

function customerFromRow(row: CustomerRow): AdminCustomer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    orders: row.orders,
    lifetimeValueMmk: row.lifetime_value_mmk,
    lastOrderAt: row.last_order_at
  };
}
