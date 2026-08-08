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

async function HomepageMerchandising() {
  const [{ newArrivals, recommended, trending }, products] = await Promise.all([
    getHomepageV1ProductSections(),
    getProducts()
  ]);

  const featuredIds = new Set(
    [...(newArrivals?.products ?? []), ...(recommended?.products ?? []), ...(trending?.products ?? [])].map(
      (product) => product.id
    )
  );

  const justForYou = products.filter((product) => !featuredIds.has(product.id)).slice(0, 12);
  const justForYouProducts = justForYou.length >= 4 ? justForYou : products.slice(0, 12);
  const feedProducts = products;

  return (
    <>
      <HomepageRail section={newArrivals} />
      <HomepageRail section={recommended} />
      <HomepageRail section={trending} />
      <FeaturedStores />
      <JustForYouSection products={justForYouProducts} />
      <MarketplaceProductFeed products={feedProducts} />
    </>
  );
}

export default async function HomePage() {
  const heroSlides = await getHeroBannerSlides();

  return (
    <>
      <MarketplaceHeader />
      <main id="main-content" className="mx-auto max-w-7xl overflow-x-hidden pb-24 md:pb-10">
        <HeroBannerSlider slides={heroSlides} />
        <Suspense fallback={<ProductRailsSkeleton />}>
          <HomepageMerchandising />
        </Suspense>
      </main>
      <MarketplaceBottomNav />
    </>
  );
}
