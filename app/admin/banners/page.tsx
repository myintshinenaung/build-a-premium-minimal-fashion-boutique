import type { Metadata } from "next";
import { BannerManager } from "@/features/content/client";
import { bannerService } from "@/features/content/server";

export const metadata: Metadata = {
  title: "Banner Manager"
};

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const adminBanners = await bannerService.getBanners();

  return <BannerManager initialBanners={adminBanners} />;
}
