import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession } from "@/features/identity/server";
import { storeService, StoreNotFoundError, StoreValidationError } from "@/features/stores/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireAdminApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const store = await storeService.update(id, body);
    return NextResponse.json({ store });
  } catch (error) {
    if (error instanceof StoreValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof StoreNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    const message = error instanceof Error ? error.message : "Unable to update store.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
