import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAuthRequestClient } from "@/features/identity/infrastructure/supabase-auth-server";
import { accountRepository } from "@/features/account/infrastructure/account-repository";
import {
  AccountNotFoundError,
  AccountValidationError,
  AddressNotFoundError,
  OrderAccessError
} from "@/features/account/application/account-errors";
import type { CustomerProfile } from "@/types/account";
import type { User } from "@supabase/supabase-js";

export type AuthorizedCustomerSession = {
  account: CustomerProfile;
  withAuthCookies: (response: NextResponse) => NextResponse;
};

export async function requireCustomerApiSession(request: NextRequest): Promise<AuthorizedCustomerSession | NextResponse> {
  const { supabase, withAuthCookies } = createSupabaseAuthRequestClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return withAuthCookies(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
  }

  const account = await accountRepository.getOrCreateForUser(mapAuthUser(user));

  return {
    account,
    withAuthCookies
  };
}

export function handleAccountApiError(error: unknown) {
  if (error instanceof AccountValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (error instanceof AccountNotFoundError || error instanceof AddressNotFoundError || error instanceof OrderAccessError) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  const message = error instanceof Error ? error.message : "Something went wrong.";
  return NextResponse.json({ message }, { status: 500 });
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
