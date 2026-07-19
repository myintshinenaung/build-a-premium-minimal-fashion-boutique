import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAuthRouteClient } from "@/lib/supabase/auth-server";
import { jsonError } from "@/lib/admin-api";

type ForgotPasswordBody = {
  email?: string;
};

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ForgotPasswordBody;
    const email = body.email?.trim();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const { supabase, withSessionCookies } = createSupabaseAuthRouteClient(request);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/admin/login`
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return withSessionCookies(NextResponse.json({ ok: true }));
  } catch (error) {
    return jsonError(error);
  }
}
