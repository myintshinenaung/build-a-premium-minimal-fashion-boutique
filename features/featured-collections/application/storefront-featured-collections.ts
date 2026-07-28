import { cache } from "react";
import { getProducts } from "@/features/catalog/application/catalog";
import { isBannerScheduleActive } from "@/features/content/domain/banner-schedule";
import { featuredCollectionService } from "@/features/featured-collections/application/featured-collection-service";
import { CACHE_TAGS, CACHE_TTLS } from "@/features/performance/domain/cache-tags";
import { createCachedLoader } from "@/features/performance/infrastructure/cache-store";
import { ACTIVE_PLATFORM_STORE_ID } from "@/lib/storefront/brand";
import type { FeaturedCollectionsSectionData } from "@/types/featured-collection";

const loadFeaturedCollectionsSectionData = createCachedLoader(
  "storefront-featured-collections",
  [CACHE_TAGS.featuredCollections, CACHE_TAGS.homepage],
  CACHE_TTLS.homepage,
  async (): Promise<FeaturedCollectionsSectionData | null> => {
    const collections = await featuredCollectionService.getPublishedFeaturedCollectionsForStore(
      ACTIVE_PLATFORM_STORE_ID
    );

    if (collections.length === 0) {
      return null;
    }

    const activeCollections = collections.filter((collection) =>
      isBannerScheduleActive(collection.startsAt, collection.endsAt)
    );

    if (activeCollections.length === 0) {
      return null;
    }

    const products = await getProducts();
    const productById = new Map(products.map((product) => [product.id, product]));

    const cards = activeCollections
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((collection) => {
        const collectionProducts = collection.items
          .sort((left, right) => left.sortOrder - right.sortOrder)
          .map((item) => productById.get(item.productId))
          .filter((product): product is NonNullable<typeof product> => product !== undefined);

        if (!collection.title.trim() || !collection.coverImage.trim()) {
          return null;
        }

        return {
          id: collection.id,
          title: collection.title,
          subtitle: collection.subtitle,
          coverImage: collection.coverImage,
          buttonText: collection.buttonText,
          buttonUrl: collection.buttonUrl,
          products: collectionProducts
        };
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);

    if (cards.length === 0) {
      return null;
    }

    return { collections: cards };
  }
);

export const getFeaturedCollectionsSectionData = cache(loadFeaturedCollectionsSectionData);
