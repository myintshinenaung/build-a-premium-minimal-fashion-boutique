import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/features/identity/server";
import { bannerService, type BannerUpdateInput } from "@/features/content/server";
import { invalidateBannerCache } from "@/features/performance/server";

type BannerRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: BannerRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const input = (await request.json()) as BannerUpdateInput;
    const banner = await bannerService.updateBanner(id, input);
    await invalidateBannerCache();

    if (!banner) {
      return NextResponse.json({ message: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ banner });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: BannerRouteContext) {
  const unauthorized = await requireAdminApiSession(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await bannerService.deleteBanner(id);
    await invalidateBannerCache();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
