import { Suspense } from "react";
import { getProducts } from "@/features/catalog/server";
import { getHeroBannerSlides } from "@/features/content/server";
import { getHomepageV1ProductSections } from "@/features/homepage/application/homepage-sections";
import {
  FeaturedStores,
  HeroBannerSlider,
  JustForYouSection,
  MarketplaceBottomNav,
  MarketplaceHeader,
  MarketplaceProductFeed,
  ProductRailsSkeleton
} from "@/features/homepage/client";
import { HorizontalProductRail } from "@/features/homepage/ui/HorizontalProductRail";
import type { HomepageProductSection } from "@/features/homepage/application/homepage-sections";
import { getFeaturedStoreCards } from "@/features/stores/server";

export const revalidate = 300;

function HomepageRail({ section }: { section: HomepageProductSection | null }) {
  if (!section) {
    return null;
  }

  return (
    <HorizontalProductRail
      title={section.title}
      subtitle={section.subtitle}
      products={section.products}
      badge={section.badge}
      actionHref={section.actionHref}
      actionLabel={section.actionLabel}
    />
  );
}

async function HomepageMerchandising({ storeCards }: { storeCards: Awaited<ReturnType<typeof getFeaturedStoreCards>> }) {
  const [{ newArrivals, recommended, trending }, products] = await Promise.all([
    getHomepageV1ProductSections(),
    getProducts()
  ]);

  // Products already shown in the three primary DB-backed rails (or their fallbacks).
  const featuredIds = new Set(
    [...(newArrivals?.products ?? []), ...(recommended?.products ?? []), ...(trending?.products ?? [])].map(
      (product) => product.id
    )
  );

  // Composition-only dedupe: do not reintroduce rail products into Just For You / feed.
  const remainingProducts = products.filter((product) => !featuredIds.has(product.id));
  const justForYouProducts = remainingProducts.slice(0, 12);
  const feedProducts = remainingProducts;

  return (
    <>
      <HomepageRail section={newArrivals} />
      <HomepageRail section={recommended} />
      <HomepageRail section={trending} />
      <FeaturedStores stores={storeCards} />
      <JustForYouSection products={justForYouProducts} />
      <MarketplaceProductFeed products={feedProducts} />
    </>
  );
}

export default async function HomePage() {
  const [heroSlides, storeCards] = await Promise.all([getHeroBannerSlides(), getFeaturedStoreCards()]);

  return (
    <>
      <MarketplaceHeader stores={storeCards} />
      <main id="main-content" className="mx-auto max-w-7xl overflow-x-hidden pb-24 md:pb-10">
        <HeroBannerSlider slides={heroSlides} />
        <Suspense fallback={<ProductRailsSkeleton />}>
          <HomepageMerchandising storeCards={storeCards} />
        </Suspense>
      </main>
      <MarketplaceBottomNav />
    </>
  );
}
