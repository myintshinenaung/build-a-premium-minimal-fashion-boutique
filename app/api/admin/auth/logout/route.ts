import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAuthRouteClient } from "@/lib/supabase/auth-server";
import { jsonError } from "@/lib/admin-api";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ ok: true });
    const supabase = createSupabaseAuthRouteClient(request, response);
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return response;
  } catch (error) {
    return jsonError(error);
  }
}
