import { cache } from "react";
import { getProducts } from "@/features/catalog/application/catalog";
import { isBannerScheduleActive } from "@/features/content/domain/banner-schedule";
import { applyFlashSaleDiscount } from "@/features/flash-sale/domain/map-flash-sale-product";
import { flashSaleService } from "@/features/flash-sale/application/flash-sale-service";
import { CACHE_TAGS, CACHE_TTLS } from "@/features/performance/domain/cache-tags";
import { createCachedLoader } from "@/features/performance/infrastructure/cache-store";
import { ACTIVE_PLATFORM_STORE_ID } from "@/lib/storefront/brand";
import type { FlashSaleSectionData } from "@/types/flash-sale";

const loadFlashSaleSectionData = createCachedLoader(
  "storefront-flash-sale",
  [CACHE_TAGS.promotions, CACHE_TAGS.homepage],
  CACHE_TTLS.homepage,
  async (): Promise<FlashSaleSectionData | null> => {
    const flashSale = await flashSaleService.getActiveFlashSaleForStore(ACTIVE_PLATFORM_STORE_ID);

    if (!flashSale || flashSale.status !== "Published") {
      return null;
    }

    if (!isBannerScheduleActive(flashSale.startsAt, flashSale.endsAt)) {
      return null;
    }

    if (!flashSale.endsAt) {
      return null;
    }

    const endsAtMs = Date.parse(flashSale.endsAt);
    if (Number.isNaN(endsAtMs) || endsAtMs <= Date.now()) {
      return null;
    }

    if (flashSale.items.length === 0) {
      return null;
    }

    const products = await getProducts();
    const productById = new Map(products.map((product) => [product.id, product]));

    const saleProducts = flashSale.items
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((item) => {
        const product = productById.get(item.productId);
        if (!product) {
          return null;
        }

        return applyFlashSaleDiscount(product, item.discountPercent);
      })
      .filter((product): product is NonNullable<typeof product> => product !== null);

    if (saleProducts.length === 0) {
      return null;
    }

    return {
      id: flashSale.id,
      sectionTitle: flashSale.sectionTitle,
      sectionSubtitle: flashSale.sectionSubtitle,
      badgeText: flashSale.badgeText,
      endsAt: flashSale.endsAt,
      products: saleProducts
    };
  }
);

export const getFlashSaleSectionData = cache(loadFlashSaleSectionData);
