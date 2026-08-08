import { describe, expect, it } from "vitest";
import { ACTIVE_PLATFORM_STORE_ID, PLATFORM_STORES } from "@/lib/storefront/brand";
import { mapPlatformStoresToFeaturedCards } from "@/features/homepage/domain/featured-stores";

describe("mapPlatformStoresToFeaturedCards", () => {
  it("maps platform store constants without inventing stores", () => {
    const cards = mapPlatformStoresToFeaturedCards(PLATFORM_STORES);

    expect(cards).toHaveLength(PLATFORM_STORES.length);
    expect(cards.map((card) => card.id)).toEqual(PLATFORM_STORES.map((store) => store.id));
  });

  it("marks only the active store as active and preserves coming-soon hrefs", () => {
    const cards = mapPlatformStoresToFeaturedCards(PLATFORM_STORES);
    const active = cards.find((card) => card.id === ACTIVE_PLATFORM_STORE_ID);
    const comingSoon = cards.filter((card) => card.href === null);

    expect(active?.isActive).toBe(true);
    expect(active?.href).toBe("/");
    expect(comingSoon.length).toBeGreaterThan(0);
    expect(cards.filter((card) => card.isActive)).toHaveLength(1);
  });
});
