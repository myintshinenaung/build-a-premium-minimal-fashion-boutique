import type { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { createSupabaseAuthRequestClient } from "@/features/identity/infrastructure/supabase-auth-server";
import { accountRepository } from "@/features/account/infrastructure/account-repository";
import type { CustomerProfile } from "@/types/account";

export type CustomerSession = {
  userId: string;
  account: CustomerProfile;
};

export async function getCustomerSessionFromRequest(request: NextRequest): Promise<CustomerSession | null> {
  const { supabase } = createSupabaseAuthRequestClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const account = await accountRepository.getOrCreateForUser(mapAuthUser(user));

  return {
    userId: user.id,
    account
  };
}

export async function getOptionalCustomerAccountId(request: NextRequest) {
  const session = await getCustomerSessionFromRequest(request);
  return session?.account.id ?? null;
}

function mapAuthUser(user: User) {
  const metadata = user.user_metadata ?? {};

  return {
    userId: user.id,
    name: typeof metadata.full_name === "string" ? metadata.full_name : user.email?.split("@")[0] ?? "Customer",
    email: user.email ?? "",
    phone: typeof metadata.phone === "string" ? metadata.phone : "",
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : ""
  };
}
