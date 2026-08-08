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

function findRailByTitle(rails: ProductRailCard[], pattern: RegExp): ProductRailCard | undefined {
  return rails.find((rail) => pattern.test(rail.title));
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
 * Resolves V1 homepage rails in fixed order:
 * New Arrivals → Recommended → Trending.
 * Prefers admin product rails when titles match; falls back to heuristic recommendations.
 */
export async function getHomepageV1ProductSections(): Promise<{
  newArrivals: HomepageProductSection | null;
  recommended: HomepageProductSection | null;
  trending: HomepageProductSection | null;
}> {
  const [railsData, newArrivalRecs, bestSellerRecs, trendingRecs] = await Promise.all([
    getProductRailsSectionData(),
    getNewArrivalRecommendations(12),
    getBestSellerRecommendations(12),
    getTrendingProducts(12)
  ]);

  const rails = railsData?.rails ?? [];
  const newArrivalsRail = findRailByTitle(rails, /new\s*arrival/i);
  const trendingRail = findRailByTitle(rails, /trend/i);
  const bestSellersRail = findRailByTitle(rails, /best\s*seller/i);

  const newArrivals = toSection(
    newArrivalsRail?.id ?? "homepage-new-arrivals",
    "New Arrivals",
    newArrivalsRail?.subtitle || "Fresh styles on NOVORA",
    newArrivalsRail?.products ?? newArrivalRecs.items,
    {
      badge: newArrivalsRail?.badge || "New",
      actionHref: "/shop?sort=newest",
      actionLabel: "See all"
    }
  );

  const recommendedProducts = bestSellersRail?.products ?? bestSellerRecs.items;
  const recommended = toSection(
    bestSellersRail?.id ?? "homepage-recommended",
    "Recommended",
    bestSellersRail?.subtitle || "Popular picks based on what shoppers love",
    recommendedProducts.length > 0 ? recommendedProducts : trendingRecs.items,
    {
      actionHref: "/shop?sort=popularity",
      actionLabel: "See all"
    }
  );

  const trending = toSection(
    trendingRail?.id ?? "homepage-trending",
    "Trending",
    trendingRail?.subtitle || "What’s catching attention right now",
    trendingRail?.products ?? trendingRecs.items,
    {
      actionHref: "/shop?sort=popularity",
      actionLabel: "See all"
    }
  );

  return { newArrivals, recommended, trending };
}
