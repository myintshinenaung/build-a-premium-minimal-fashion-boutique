import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuthorizationErrorMessage, isAuthorizedAdmin } from "@/lib/admin-authorization";
import { createSupabaseAuthRequestClient } from "@/lib/supabase/auth-server";

export async function requireAdminApiSession(request: NextRequest) {
  const { supabase, withAuthCookies } = createSupabaseAuthRequestClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && isAuthorizedAdmin(user)) {
    return null;
  }

  if (user) {
    await supabase.auth.signOut();
    return withAuthCookies(
      NextResponse.json({ message: getAdminAuthorizationErrorMessage() }, { status: 403 })
    );
  }

  return withAuthCookies(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
}

export function jsonError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Something went wrong.";

  return NextResponse.json({ message }, { status });
}
