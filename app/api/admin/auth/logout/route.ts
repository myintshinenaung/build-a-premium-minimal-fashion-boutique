import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAuthRouteClient } from "@/lib/supabase/auth-server";
import { jsonError } from "@/lib/admin-api";

export async function POST(request: NextRequest) {
  try {
    const { supabase, withSessionCookies } = createSupabaseAuthRouteClient(request);
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return withSessionCookies(NextResponse.json({ ok: true }));
  } catch (error) {
    return jsonError(error);
  }
}
