import { Suspense } from "react";
import { getCategoryRailItems, getProducts } from "@/features/catalog/server";
import { getHeroBannerSlides } from "@/features/content/server";
import {
  BrandShowcase,
  CategoryIconRail,
  FeaturedCollectionsSkeleton,
  FlashSaleSectionSkeleton,
  HeroBannerSlider,
  MarketplaceBottomNav,
  MarketplaceHeader,
  ProductRailsSkeleton
} from "@/features/homepage/client";
import { FeaturedCollectionsServer } from "@/features/homepage/ui/FeaturedCollectionsServer";
import { FlashSaleSectionServer } from "@/features/homepage/ui/FlashSaleSectionServer";
import { ProductRailsServer } from "@/features/homepage/ui/ProductRailsServer";

export const revalidate = 300;

export default async function HomePage() {
  const [heroSlides, categoryRailItems, products] = await Promise.all([
    getHeroBannerSlides(),
    getCategoryRailItems(),
    getProducts()
  ]);
  const brands = Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <>
      <MarketplaceHeader />
      <main id="main-content" className="mx-auto max-w-7xl pb-24 md:pb-10">
        <HeroBannerSlider slides={heroSlides} />
        <CategoryIconRail categories={categoryRailItems} />
        <div className="px-0 sm:px-0">
          <Suspense fallback={<FlashSaleSectionSkeleton />}>
            <FlashSaleSectionServer />
          </Suspense>
        </div>
        <Suspense fallback={<FeaturedCollectionsSkeleton />}>
          <FeaturedCollectionsServer />
        </Suspense>
        <Suspense fallback={<ProductRailsSkeleton />}>
          <ProductRailsServer />
        </Suspense>
        <BrandShowcase brands={brands} />
      </main>
      <MarketplaceBottomNav />
    </>
  );
}
