import { createRepositoryError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerAddressRow } from "@/lib/supabase/types";
import type { CustomerAddress } from "@/types/account";

export type AddressCreateInput = {
  accountId: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  township: string;
  isDefault: boolean;
};

export type AddressUpdateInput = {
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  township: string;
  isDefault: boolean;
};

function createAddressId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ADDR-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export const addressRepository = {
  async listByAccountId(accountId: string): Promise<CustomerAddress[]> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("account_id", accountId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []).map(addressFromRow);
    } catch (error) {
      throw createRepositoryError("Unable to load customer addresses", error);
    }
  },

  async getByIdForAccount(addressId: string, accountId: string): Promise<CustomerAddress | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("id", addressId)
        .eq("account_id", accountId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? addressFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to load customer address", error);
    }
  },

  async create(input: AddressCreateInput): Promise<CustomerAddress> {
    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("customer_addresses")
        .insert({
          id: createAddressId(),
          account_id: input.accountId,
          label: input.label,
          recipient_name: input.recipientName,
          phone: input.phone,
          address_line: input.addressLine,
          township: input.township,
          is_default: input.isDefault,
          created_at: timestamp,
          updated_at: timestamp
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return addressFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to create customer address", error);
    }
  },

  async update(addressId: string, accountId: string, input: AddressUpdateInput): Promise<CustomerAddress | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("customer_addresses")
        .update({
          label: input.label,
          recipient_name: input.recipientName,
          phone: input.phone,
          address_line: input.addressLine,
          township: input.township,
          is_default: input.isDefault,
          updated_at: new Date().toISOString()
        })
        .eq("id", addressId)
        .eq("account_id", accountId)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? addressFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to update customer address", error);
    }
  },

  async delete(addressId: string, accountId: string): Promise<boolean> {
    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from("customer_addresses").delete().eq("id", addressId).eq("account_id", accountId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw createRepositoryError("Unable to delete customer address", error);
    }
  },

  async clearDefaultForAccount(accountId: string, exceptAddressId?: string) {
    try {
      const supabase = createSupabaseServerClient();
      let query = supabase.from("customer_addresses").update({ is_default: false, updated_at: new Date().toISOString() }).eq("account_id", accountId);

      if (exceptAddressId) {
        query = query.neq("id", exceptAddressId);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }
    } catch (error) {
      throw createRepositoryError("Unable to update default customer address", error);
    }
  },

  async setDefault(addressId: string, accountId: string) {
    await this.clearDefaultForAccount(accountId, addressId);

    try {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase
        .from("customer_addresses")
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq("id", addressId)
        .eq("account_id", accountId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw createRepositoryError("Unable to set default customer address", error);
    }
  }
};

function addressFromRow(row: CustomerAddressRow): CustomerAddress {
  return {
    id: row.id,
    accountId: row.account_id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    addressLine: row.address_line,
    township: row.township,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
