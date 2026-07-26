import { NextResponse, type NextRequest } from "next/server";
import {
  createSupabaseAuthRouteClient,
  getAdminAuthorizationErrorMessage,
  isAuthorizedAdmin,
  jsonError
} from "@/features/identity/server";
import { recordAdminLoginAttempt } from "@/features/security/server";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const { supabase, withSessionCookies } = createSupabaseAuthRouteClient(request);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      await recordAdminLoginAttempt({
        request,
        email,
        success: false,
        failureReason: error.message
      }).catch(() => undefined);

      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!isAuthorizedAdmin(user)) {
      await supabase.auth.signOut();
      await recordAdminLoginAttempt({
        request,
        user,
        email,
        success: false,
        failureReason: getAdminAuthorizationErrorMessage()
      }).catch(() => undefined);

      return withSessionCookies(
        NextResponse.json({ message: getAdminAuthorizationErrorMessage() }, { status: 403 })
      );
    }

    await recordAdminLoginAttempt({
      request,
      user,
      email,
      success: true
    }).catch(() => undefined);

    return withSessionCookies(NextResponse.json({ ok: true }));
  } catch (error) {
    return jsonError(error);
  }
}
