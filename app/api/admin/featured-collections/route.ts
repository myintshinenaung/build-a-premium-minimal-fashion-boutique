import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import {
  featuredCollectionService,
  type FeaturedCollectionCreateInput
} from "@/features/featured-collections/server";
import { invalidateFeaturedCollectionCache } from "@/features/performance/server";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const collections = await featuredCollectionService.getFeaturedCollections();
    return NextResponse.json({ collections });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const input = (await request.json()) as FeaturedCollectionCreateInput;
    const collection = await featuredCollectionService.createFeaturedCollection(input);
    await invalidateFeaturedCollectionCache();

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
