import { describe, expect, it } from "vitest";
import { isBannerScheduleActive } from "@/features/content/domain/banner-schedule";
import { mapBannerToMarketplaceSlide } from "@/features/content/domain/map-banner-slide";
import { mapAdminBannerToStorefrontBanner } from "@/features/content/domain/map-banners";
import type { AdminBanner } from "@/types/admin";

const sampleBanner: AdminBanner = {
  id: "bnr-test",
  title: "Spring campaign",
  placement: "Homepage Hero",
  image: "/images/hero.png",
  mobileImage: "/images/hero-mobile.png",
  eyebrow: "New season",
  headline: "Daily Outfit",
  ctaLabel: "Shop now",
  ctaHref: "/shop",
  storeName: "Daily Outfit",
  sortOrder: 2,
  startsAt: "2026-07-01T00:00:00.000Z",
  endsAt: "2026-12-31T23:59:59.000Z",
  status: "Published"
};

describe("banner mappers", () => {
  it("maps admin banner fields to storefront banner without hardcoded fallbacks", () => {
    const storefront = mapAdminBannerToStorefrontBanner(sampleBanner);

    expect(storefront.desktopImage).toBe("/images/hero.png");
    expect(storefront.mobileImage).toBe("/images/hero-mobile.png");
    expect(storefront.storeName).toBe("Daily Outfit");
    expect(storefront.sortOrder).toBe(2);
    expect(storefront.active).toBe(true);
  });

  it("maps storefront banner to hero slide", () => {
    const slide = mapBannerToMarketplaceSlide(mapAdminBannerToStorefrontBanner(sampleBanner));

    expect(slide.headline).toBe("Daily Outfit");
    expect(slide.subtitle).toBe("New season");
    expect(slide.storeName).toBe("Daily Outfit");
    expect(slide.link).toBe("/shop");
  });
});

describe("isBannerScheduleActive", () => {
  it("returns true when now is inside the schedule window", () => {
    expect(
      isBannerScheduleActive("2026-07-01T00:00:00.000Z", "2026-12-31T23:59:59.000Z", new Date("2026-07-15T12:00:00.000Z"))
    ).toBe(true);
  });

  it("returns false before start date", () => {
    expect(isBannerScheduleActive("2026-08-01T00:00:00.000Z", null, new Date("2026-07-15T12:00:00.000Z"))).toBe(false);
  });
});
