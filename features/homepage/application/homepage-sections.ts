import { getProductRailsSectionData } from "@/features/product-rails/server";
import {
  getBestSellerRecommendations,
  getNewArrivalRecommendations,
  getTrendingProducts
} from "@/features/recommendations/server";
import type { Product } from "@/types/product";
import type { ProductRailCard } from "@/types/product-rail";

export type HomepageProductSection = {
  id: string;
  title: string;
  subtitle: string;
  products: Product[];
  badge?: string;
  actionHref?: string;
  actionLabel?: string;
};

/** Stable DB rail ids from Sprint 5 seed / live data. */
export const HOMEPAGE_DB_RAIL_IDS = {
  newArrivals: "pr-daily-new-arrivals",
  recommended: "pr-daily-best-sellers",
  trending: "pr-daily-trending"
} as const;

export function findHomepageRail(
  rails: ProductRailCard[],
  railId: string,
  titlePattern: RegExp
): ProductRailCard | undefined {
  return rails.find((rail) => rail.id === railId) ?? rails.find((rail) => titlePattern.test(rail.title));
}

function toSection(
  id: string,
  title: string,
  subtitle: string,
  products: Product[],
  options?: { badge?: string; actionHref?: string; actionLabel?: string }
): HomepageProductSection | null {
  if (products.length === 0) {
    return null;
  }

  return {
    id,
    title,
    subtitle,
    products,
    badge: options?.badge,
    actionHref: options?.actionHref,
    actionLabel: options?.actionLabel
  };
}

/**
 * Builds one homepage section from a DB rail when it has products.
 * Falls back to heuristic products only when the rail is missing or empty.
 */
export function buildHomepageSectionFromRail(options: {
  rail: ProductRailCard | undefined;
  displayTitle: string;
  defaultSubtitle: string;
  fallbackId: string;
  fallbackProducts: Product[];
  badge?: string;
  actionHref?: string;
  actionLabel?: string;
}): HomepageProductSection | null {
  const { rail, displayTitle, defaultSubtitle, fallbackId, fallbackProducts, badge, actionHref, actionLabel } =
    options;

  if (rail && rail.products.length > 0) {
    return toSection(rail.id, displayTitle, rail.subtitle || defaultSubtitle, rail.products, {
      badge: badge ?? (rail.badge || undefined),
      actionHref,
      actionLabel
    });
  }

  return toSection(fallbackId, displayTitle, defaultSubtitle, fallbackProducts, {
    badge,
    actionHref,
    actionLabel
  });
}

/**
 * Resolves V1 homepage rails in fixed marketing order:
 * New Arrivals → Recommended → Trending.
 *
 * Source of truth: published product_rails for daily-outfit (via getProductRailsSectionData).
 * Heuristic recommendations are used only when the matching DB rail is missing or empty.
 */
export async function getHomepageV1ProductSections(): Promise<{
  newArrivals: HomepageProductSection | null;
  recommended: HomepageProductSection | null;
  trending: HomepageProductSection | null;
}> {
  const railsData = await getProductRailsSectionData();
  const rails = railsData?.rails ?? [];

  const newArrivalsRail = findHomepageRail(rails, HOMEPAGE_DB_RAIL_IDS.newArrivals, /new\s*arrival/i);
  const recommendedRail = findHomepageRail(rails, HOMEPAGE_DB_RAIL_IDS.recommended, /best\s*seller/i);
  const trendingRail = findHomepageRail(rails, HOMEPAGE_DB_RAIL_IDS.trending, /trend/i);

  const needsNewArrivalFallback = !(newArrivalsRail && newArrivalsRail.products.length > 0);
  const needsRecommendedFallback = !(recommendedRail && recommendedRail.products.length > 0);
  const needsTrendingFallback = !(trendingRail && trendingRail.products.length > 0);

  const [newArrivalRecs, bestSellerRecs, trendingRecs] = await Promise.all([
    needsNewArrivalFallback ? getNewArrivalRecommendations(12) : Promise.resolve({ items: [] as Product[] }),
    needsRecommendedFallback ? getBestSellerRecommendations(12) : Promise.resolve({ items: [] as Product[] }),
    needsTrendingFallback ? getTrendingProducts(12) : Promise.resolve({ items: [] as Product[] })
  ]);

  const newArrivals = buildHomepageSectionFromRail({
    rail: newArrivalsRail,
    displayTitle: "New Arrivals",
    defaultSubtitle: "Fresh styles on NOVORA",
    fallbackId: "homepage-new-arrivals",
    fallbackProducts: newArrivalRecs.items,
    badge: "New",
    actionHref: "/shop?sort=newest",
    actionLabel: "See all"
  });

  const recommended = buildHomepageSectionFromRail({
    rail: recommendedRail,
    displayTitle: "Recommended",
    defaultSubtitle: "Popular picks based on what shoppers love",
    fallbackId: "homepage-recommended",
    fallbackProducts: bestSellerRecs.items,
    actionHref: "/shop?sort=popularity",
    actionLabel: "See all"
  });

  const trending = buildHomepageSectionFromRail({
    rail: trendingRail,
    displayTitle: "Trending",
    defaultSubtitle: "What’s catching attention right now",
    fallbackId: "homepage-trending",
    fallbackProducts: trendingRecs.items,
    actionHref: "/shop?sort=popularity",
    actionLabel: "See all"
  });

  return { newArrivals, recommended, trending };
}
