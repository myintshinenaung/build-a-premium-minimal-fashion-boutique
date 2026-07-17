import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/lib/admin-api";
import { bannerService } from "@/lib/services";
import type { BannerCreateInput } from "@/lib/repositories/banner-repository";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const banners = await bannerService.getBanners();
    return NextResponse.json({ banners });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const input = (await request.json()) as BannerCreateInput;
    const banner = await bannerService.createBanner(input);

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
