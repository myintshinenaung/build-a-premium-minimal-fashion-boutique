import type { User } from "@supabase/supabase-js";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

export type AdminUser = {
  name: string;
  email: string;
  role: string;
};

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

  return user ? mapSupabaseUserToAdminUser(user) : null;
}
