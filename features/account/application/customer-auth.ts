import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  customerAuthCredentialsSchema,
  customerForgotPasswordSchema,
  customerSignUpSchema
} from "@/features/account/domain/auth-schemas";
import { AccountValidationError } from "@/features/account/application/account-errors";
import { accountRepository } from "@/features/account/infrastructure/account-repository";
import { createSupabaseAuthRouteClient } from "@/features/identity/infrastructure/supabase-auth-server";
import { getSiteUrl } from "@/lib/storefront/site-url";

function formatZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid account details.";
}

function parseOrThrow<T>(schema: { parse: (input: unknown) => T }, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AccountValidationError(formatZodError(error));
    }

    throw error;
  }
}

function mapAuthUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
  const metadata = user.user_metadata ?? {};

  return {
    userId: user.id,
    name: typeof metadata.full_name === "string" ? metadata.full_name : user.email?.split("@")[0] ?? "Customer",
    email: user.email ?? "",
    phone: typeof metadata.phone === "string" ? metadata.phone : "",
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : ""
  };
}

export async function signInCustomer(request: NextRequest, body: unknown) {
  const parsed = parseOrThrow(customerAuthCredentialsSchema, body);
  const { supabase, withSessionCookies } = createSupabaseAuthRouteClient(request);
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password
  });

  if (error) {
    return withSessionCookies(NextResponse.json({ message: error.message }, { status: 401 }));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return withSessionCookies(NextResponse.json({ message: "Unable to sign in." }, { status: 401 }));
  }

  const account = await accountRepository.getOrCreateForUser(mapAuthUser(user));

  return withSessionCookies(NextResponse.json({ ok: true, profile: account }));
}

export async function signUpCustomer(request: NextRequest, body: unknown) {
  const parsed = parseOrThrow(customerSignUpSchema, body);
  const { supabase, withSessionCookies } = createSupabaseAuthRouteClient(request);
  const { data, error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
    options: {
      data: {
        full_name: parsed.name
      },
      emailRedirectTo: `${getSiteUrl()}/account`
    }
  });

  if (error) {
    return withSessionCookies(NextResponse.json({ message: error.message }, { status: 400 }));
  }

  if (data.user) {
    await accountRepository.getOrCreateForUser(
      mapAuthUser({
        id: data.user.id,
        email: data.user.email,
        user_metadata: {
          ...(data.user.user_metadata ?? {}),
          full_name: parsed.name
        }
      })
    );
  }

  if (!data.session) {
    return withSessionCookies(
      NextResponse.json({
        ok: true,
        requiresEmailConfirmation: true,
        message: "Check your email to confirm your account, then sign in."
      })
    );
  }

  const account = data.user
    ? await accountRepository.getOrCreateForUser(mapAuthUser(data.user))
    : null;

  return withSessionCookies(NextResponse.json({ ok: true, profile: account, requiresEmailConfirmation: false }));
}

export async function signOutCustomer(request: NextRequest) {
  const { supabase, withSessionCookies } = createSupabaseAuthRouteClient(request);
  const { error } = await supabase.auth.signOut();

  if (error) {
    return withSessionCookies(NextResponse.json({ message: error.message }, { status: 400 }));
  }

  return withSessionCookies(NextResponse.json({ ok: true }));
}

export async function requestCustomerPasswordReset(request: NextRequest, body: unknown) {
  const parsed = parseOrThrow(customerForgotPasswordSchema, body);
  const { supabase, withSessionCookies } = createSupabaseAuthRouteClient(request);
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
    redirectTo: `${getSiteUrl()}/account`
  });

  if (error) {
    return withSessionCookies(NextResponse.json({ message: error.message }, { status: 400 }));
  }

  return withSessionCookies(
    NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link has been sent."
    })
  );
}
