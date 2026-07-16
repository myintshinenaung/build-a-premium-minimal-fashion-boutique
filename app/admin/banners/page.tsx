import type { Metadata } from "next";
import { BannerManager } from "@/components/admin/forms/BannerManager";
import { bannerService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Banner Manager"
};

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const adminBanners = await bannerService.getBanners();

  return <BannerManager initialBanners={adminBanners} />;
}
