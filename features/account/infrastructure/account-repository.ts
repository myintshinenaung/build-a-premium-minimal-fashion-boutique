import { createRepositoryError } from "@/lib/repositories/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CustomerAccountRow } from "@/lib/supabase/types";
import { defaultLocale, isLocale, type Locale } from "@/features/i18n/domain/config";
import type { CustomerProfile } from "@/types/account";

export type AccountCreateInput = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  preferredLanguage?: Locale;
};

export type AccountUpdateInput = {
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  preferredLanguage: Locale;
};

function createAccountId() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ACC-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export const accountRepository = {
  async getByUserId(userId: string): Promise<CustomerProfile | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("customer_accounts").select("*").eq("user_id", userId).maybeSingle();

      if (error) {
        throw error;
      }

      return data ? accountFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to load customer account", error);
    }
  },

  async getById(accountId: string): Promise<CustomerProfile | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.from("customer_accounts").select("*").eq("id", accountId).maybeSingle();

      if (error) {
        throw error;
      }

      return data ? accountFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to load customer account", error);
    }
  },

  async getOrCreateForUser(input: AccountCreateInput): Promise<CustomerProfile> {
    const existing = await this.getByUserId(input.userId);

    if (existing) {
      return existing;
    }

    try {
      const supabase = createSupabaseServerClient();
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from("customer_accounts")
        .insert({
          id: createAccountId(),
          user_id: input.userId,
          name: input.name,
          phone: input.phone,
          email: input.email,
          avatar_url: input.avatarUrl,
          preferred_language: input.preferredLanguage ?? defaultLocale,
          created_at: timestamp,
          updated_at: timestamp
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return accountFromRow(data);
    } catch (error) {
      throw createRepositoryError("Unable to create customer account", error);
    }
  },

  async update(accountId: string, input: AccountUpdateInput): Promise<CustomerProfile | null> {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("customer_accounts")
        .update({
          name: input.name,
          phone: input.phone,
          email: input.email,
          avatar_url: input.avatarUrl,
          preferred_language: input.preferredLanguage,
          updated_at: new Date().toISOString()
        })
        .eq("id", accountId)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? accountFromRow(data) : null;
    } catch (error) {
      throw createRepositoryError("Unable to update customer account", error);
    }
  }
};

function accountFromRow(row: CustomerAccountRow): CustomerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    avatarUrl: row.avatar_url,
    preferredLanguage: isLocale(row.preferred_language) ? row.preferred_language : defaultLocale,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
