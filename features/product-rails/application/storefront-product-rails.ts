import { cache } from "react";
import { getProducts } from "@/features/catalog/application/catalog";
import { isBannerScheduleActive } from "@/features/content/domain/banner-schedule";
import { productRailService } from "@/features/product-rails/application/product-rail-service";
import { CACHE_TAGS, CACHE_TTLS } from "@/features/performance/domain/cache-tags";
import { createCachedLoader } from "@/features/performance/infrastructure/cache-store";
import { ACTIVE_PLATFORM_STORE_ID } from "@/lib/storefront/brand";
import type { ProductRailsSectionData } from "@/types/product-rail";

/**
 * Storefront product rails from Supabase `product_rails` / `product_rail_items`.
 * Filters published rails by product_rails.store_id (daily-outfit).
 * Resolves items through the catalog product list (no products.store_id required).
 * Unresolved product ids are skipped; rails that end up empty are omitted.
 */
const loadProductRailsSectionData = createCachedLoader(
  "storefront-product-rails",
  [CACHE_TAGS.productRails, CACHE_TAGS.homepage],
  CACHE_TTLS.homepage,
  async (): Promise<ProductRailsSectionData | null> => {
    const rails = await productRailService.getPublishedProductRailsForStore(ACTIVE_PLATFORM_STORE_ID);

    if (rails.length === 0) {
      return null;
    }

    const activeRails = rails.filter((rail) => isBannerScheduleActive(rail.startsAt, rail.endsAt));

    if (activeRails.length === 0) {
      return null;
    }

    const products = await getProducts();
    const productById = new Map(products.map((product) => [product.id, product]));

    const cards = activeRails
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((rail) => {
        if (!rail.title.trim()) {
          return null;
        }

        const railProducts = rail.items
          .sort((left, right) => left.sortOrder - right.sortOrder)
          .map((item) => productById.get(item.productId))
          .filter((product): product is NonNullable<typeof product> => product !== undefined);

        if (railProducts.length === 0) {
          return null;
        }

        return {
          id: rail.id,
          title: rail.title,
          subtitle: rail.subtitle,
          badge: rail.badgeText,
          description: rail.description,
          products: railProducts
        };
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);

    if (cards.length === 0) {
      return null;
    }

    return { rails: cards };
  }
);

export const getProductRailsSectionData = cache(loadProductRailsSectionData);
