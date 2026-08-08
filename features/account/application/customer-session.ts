import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  createSupabaseAuthRequestClient,
  createSupabaseAuthServerClient
} from "@/features/identity/infrastructure/supabase-auth-server";
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

  return resolveCustomerSession(user);
}

/** Server Components / pages: read the current customer session from cookies. */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const supabase = await createSupabaseAuthServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    return resolveCustomerSession(user);
  } catch {
    return null;
  }
}

export async function requireCustomerPage(nextPath = "/account"): Promise<CustomerSession> {
  const session = await getCustomerSession();

  if (!session) {
    const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/account";
    redirect(`/account?next=${encodeURIComponent(safeNext)}`);
  }

  return session;
}

export async function getOptionalCustomerAccountId(request: NextRequest) {
  const session = await getCustomerSessionFromRequest(request);
  return session?.account.id ?? null;
}

async function resolveCustomerSession(user: User | null): Promise<CustomerSession | null> {
  if (!user) {
    return null;
  }

  const account = await accountRepository.getOrCreateForUser(mapAuthUser(user));

  return {
    userId: user.id,
    account
  };
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
