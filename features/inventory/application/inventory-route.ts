import { NextResponse, type NextRequest } from "next/server";
import { mapSupabaseUserToAdminUser } from "@/features/identity/application/admin-session";
import { requireAdminApiSession } from "@/features/identity/server";
import { createSupabaseAuthRequestClient } from "@/features/identity/infrastructure/supabase-auth-server";

type InventoryGetHandler = (searchParams: URLSearchParams) => Promise<unknown>;
type InventoryPostHandler = (body: unknown, actor: { userId: string | null; userName: string }) => Promise<unknown>;

export function createInventoryGetRoute(handler: InventoryGetHandler, handleError: (error: unknown) => NextResponse) {
  return async function GET(request: NextRequest) {
    const unauthorized = await requireAdminApiSession(request);
    if (unauthorized) return unauthorized;

    try {
      const data = await handler(request.nextUrl.searchParams);
      return NextResponse.json(data);
    } catch (error) {
      return handleError(error);
    }
  };
}

export function createInventoryPostRoute(handler: InventoryPostHandler, handleError: (error: unknown) => NextResponse) {
  return async function POST(request: NextRequest) {
    const unauthorized = await requireAdminApiSession(request);
    if (unauthorized) return unauthorized;

    try {
      const { supabase } = createSupabaseAuthRequestClient(request);
      const {
        data: { user }
      } = await supabase.auth.getUser();
      const actor = user
        ? { userId: user.id, userName: mapSupabaseUserToAdminUser(user).name }
        : { userId: null, userName: "Admin" };
      const body = await request.json();
      const data = await handler(body, actor);
      return NextResponse.json(data);
    } catch (error) {
      return handleError(error);
    }
  };
}
