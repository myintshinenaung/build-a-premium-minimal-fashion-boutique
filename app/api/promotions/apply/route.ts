import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAuthRequestClient } from "@/features/identity/infrastructure/supabase-auth-server";
import { applyCoupon, handlePromotionApiError } from "@/features/promotions/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supabase } = createSupabaseAuthRequestClient(request);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const summary = await applyCoupon(body, { isAuthenticated: Boolean(user) });

    return NextResponse.json({ summary });
  } catch (error) {
    return handlePromotionApiError(error);
  }
}
