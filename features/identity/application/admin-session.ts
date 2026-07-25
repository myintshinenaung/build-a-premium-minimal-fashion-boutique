import type { User } from "@supabase/supabase-js";
import type { AdminUser } from "@/features/identity/domain/admin-user";
import { isAuthorizedAdmin } from "@/features/identity/domain/authorization";
import { createSupabaseAuthServerClient } from "@/features/identity/infrastructure/supabase-auth-server";

export type { AdminUser };

export function mapSupabaseUserToAdminUser(user: User): AdminUser {
  const metadata = user.user_metadata ?? {};

  return {
    name: typeof metadata.full_name === "string" ? metadata.full_name : user.email?.split("@")[0] ?? "Admin",
    email: user.email ?? "",
    role: typeof metadata.role === "string" ? metadata.role : "Store Manager"
  };
}

export async function getAdminUser() {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !isAuthorizedAdmin(user)) {
    return null;
  }

  return mapSupabaseUserToAdminUser(user);
}
