import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import {
  featuredCollectionService,
  type FeaturedCollectionUpdateInput
} from "@/features/featured-collections/server";
import { invalidateFeaturedCollectionCache } from "@/features/performance/server";

type FeaturedCollectionRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: FeaturedCollectionRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const input = (await request.json()) as FeaturedCollectionUpdateInput;
    const collection = await featuredCollectionService.updateFeaturedCollection(id, input);
    await invalidateFeaturedCollectionCache();

    if (!collection) {
      return NextResponse.json({ message: "Featured collection not found" }, { status: 404 });
    }

    return NextResponse.json({ collection });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: FeaturedCollectionRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await featuredCollectionService.deleteFeaturedCollection(id);
    await invalidateFeaturedCollectionCache();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
