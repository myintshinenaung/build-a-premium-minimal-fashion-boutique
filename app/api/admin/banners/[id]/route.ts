import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdminApiSession } from "@/lib/admin-api";
import { bannerService } from "@/lib/services";
import type { BannerUpdateInput } from "@/lib/repositories/banner-repository";

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

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
