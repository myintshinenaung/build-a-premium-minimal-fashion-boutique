import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";
import { getSupabaseConfig } from "./client";

export async function createSupabaseAuthServerClient() {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies.
        }
      }
    }
  });
}

export function createSupabaseAuthRouteClient(request: NextRequest) {
  const { url, anonKey } = getSupabaseConfig();
  let sessionResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
        });
        sessionResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          sessionResponse.cookies.set(name, value, options);
        });
      }
    }
  });

  return {
    supabase,
    withSessionCookies(response: NextResponse) {
      sessionResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie);
      });

      return response;
    }
  };
}

// Read auth cookies from the incoming request in route handlers (matches proxy.ts).
export function createSupabaseAuthRequestClient(request: NextRequest) {
  const { url, anonKey } = getSupabaseConfig();
  const responseCookies = new Map<
    string,
    { name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] }
  >();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          responseCookies.set(name, { name, value, options });
        });
      }
    }
  });

  return {
    supabase,
    withAuthCookies(response: NextResponse) {
      responseCookies.forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      });

      return response;
    }
  };
}
