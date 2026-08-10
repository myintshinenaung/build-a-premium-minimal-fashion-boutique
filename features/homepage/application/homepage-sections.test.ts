import { describe, expect, it } from "vitest";
import {
  buildHomepageSectionFromRail,
  findHomepageRail,
  HOMEPAGE_DB_RAIL_IDS
} from "@/features/homepage/application/homepage-sections";
import type { Product } from "@/types/product";
import type { ProductRailCard } from "@/types/product-rail";

function product(id: string, name: string): Product {
  return {
    id,
    name,
    slug: id,
    sku: id,
    price: 1000,
    images: ["/images/ivory-dress.png"],
    category: "Dresses",
    brand: "Daily Outfit",
    description: "",
    details: [],
    colors: [],
    sizes: [],
    tags: [],
    variants: [],
    stockStatus: "In stock",
    newArrival: false,
    bestSeller: false
  };
}

function rail(partial: Partial<ProductRailCard> & Pick<ProductRailCard, "id" | "title" | "products">): ProductRailCard {
  return {
    subtitle: "",
    badge: "",
    description: "",
    ...partial
  };
}

describe("homepage product rail composition", () => {
  const rails = [
    rail({
      id: HOMEPAGE_DB_RAIL_IDS.trending,
      title: "Trending Now",
      products: [product("a", "A"), product("b", "B"), product("c", "C"), product("d", "D")]
    }),
    rail({
      id: HOMEPAGE_DB_RAIL_IDS.newArrivals,
      title: "New Arrivals",
      products: [product("e", "E"), product("f", "F"), product("g", "G")]
    }),
    rail({
      id: HOMEPAGE_DB_RAIL_IDS.recommended,
      title: "Best Sellers",
      products: [product("h", "H"), product("i", "I"), product("j", "J")]
    })
  ];

  it("prefers stable DB rail ids over title matching", () => {
    expect(findHomepageRail(rails, HOMEPAGE_DB_RAIL_IDS.newArrivals, /new\s*arrival/i)?.id).toBe(
      "pr-daily-new-arrivals"
    );
    expect(findHomepageRail(rails, HOMEPAGE_DB_RAIL_IDS.recommended, /best\s*seller/i)?.id).toBe(
      "pr-daily-best-sellers"
    );
    expect(findHomepageRail(rails, HOMEPAGE_DB_RAIL_IDS.trending, /trend/i)?.id).toBe("pr-daily-trending");
  });

  it("maps Best Sellers rail products into Recommended without using fallbacks", () => {
    const section = buildHomepageSectionFromRail({
      rail: findHomepageRail(rails, HOMEPAGE_DB_RAIL_IDS.recommended, /best\s*seller/i),
      displayTitle: "Recommended",
      defaultSubtitle: "fallback subtitle",
      fallbackId: "homepage-recommended",
      fallbackProducts: [product("fallback", "Fallback")]
    });

    expect(section?.id).toBe("pr-daily-best-sellers");
    expect(section?.title).toBe("Recommended");
    expect(section?.products).toHaveLength(3);
    expect(section?.products.map((entry) => entry.id)).toEqual(["h", "i", "j"]);
  });

  it("uses heuristic fallback only when the DB rail is missing or empty", () => {
    const missing = buildHomepageSectionFromRail({
      rail: undefined,
      displayTitle: "New Arrivals",
      defaultSubtitle: "Fresh styles on NOVORA",
      fallbackId: "homepage-new-arrivals",
      fallbackProducts: [product("fallback-1", "Fallback 1")],
      badge: "New"
    });

    expect(missing?.id).toBe("homepage-new-arrivals");
    expect(missing?.products.map((entry) => entry.id)).toEqual(["fallback-1"]);

    const empty = buildHomepageSectionFromRail({
      rail: rail({ id: "pr-empty", title: "New Arrivals", products: [] }),
      displayTitle: "New Arrivals",
      defaultSubtitle: "Fresh styles on NOVORA",
      fallbackId: "homepage-new-arrivals",
      fallbackProducts: [product("fallback-2", "Fallback 2")]
    });

    expect(empty?.id).toBe("homepage-new-arrivals");
    expect(empty?.products.map((entry) => entry.id)).toEqual(["fallback-2"]);
  });
});
