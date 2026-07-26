import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAuthRouteClient, jsonError } from "@/features/identity/server";
import { recordAdminLogout } from "@/features/security/server";

export async function POST(request: NextRequest) {
  try {
    const { supabase, withSessionCookies } = createSupabaseAuthRouteClient(request);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    await recordAdminLogout({ request, user }).catch(() => undefined);

    return withSessionCookies(NextResponse.json({ ok: true }));
  } catch (error) {
    return jsonError(error);
  }
}
