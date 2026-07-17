import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAuthRouteClient } from "@/lib/supabase/auth-server";

export async function requireAdminApiSession(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createSupabaseAuthRouteClient(request, response);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    return null;
  }

  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export function jsonError(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Something went wrong.";

  return NextResponse.json({ message }, { status });
}
