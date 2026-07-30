import type { User } from "@supabase/supabase-js";
import type { AdminUser } from "@/features/identity/domain/admin-user";
import { isAuthorizedAdmin } from "@/features/identity/domain/authorization";
import { createSupabaseAuthServerClient } from "@/features/identity/infrastructure/supabase-auth-server";
import { hasSupabaseEnv } from "@/lib/supabase/client";

export type { AdminUser };

export function mapSupabaseUserToAdminUser(user: User): AdminUser {
  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    name: typeof metadata.full_name === "string" ? metadata.full_name : user.email?.split("@")[0] ?? "Admin",
    email: user.email ?? "",
    role: typeof metadata.role === "string" ? metadata.role : "Store Manager"
  };
}

export async function getAdminUser() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !isAuthorizedAdmin(user)) {
    return null;
  }

  return mapSupabaseUserToAdminUser(user);
}
