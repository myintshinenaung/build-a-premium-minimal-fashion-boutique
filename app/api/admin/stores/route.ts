import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession } from "@/features/identity/server";
import { storeService, StoreValidationError } from "@/features/stores/server";

export async function GET(request: NextRequest) {
  const session = await requireAdminApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const [stores, platformCategories] = await Promise.all([
      storeService.list(),
      storeService.listPlatformCategories()
    ]);
    return NextResponse.json({ stores, platformCategories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load stores.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdminApiSession(request);
  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const body = await request.json();
    const store = await storeService.create(body);
    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    if (error instanceof StoreValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unable to create store.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
