import { getCategories, getProducts } from "@/features/catalog/server";
import { getStorefrontBanners } from "@/features/content/server";
import {
  BrandShowcase,
  CategoryIconRail,
  FeaturedCollections,
  FlashSaleSection,
  HeroBannerSlider,
  HorizontalProductRail,
  MarketplaceBottomNav,
  MarketplaceHeader,
  type HeroSlide
} from "@/features/homepage/client";
import {
  getBestSellerRecommendations,
  getNewArrivalRecommendations,
  getTrendingProducts
} from "@/features/recommendations/server";
import { getStoreSettings } from "@/features/settings/server";
import type { StorefrontBanner, StorefrontSettings } from "@/types/storefront";

export const revalidate = 300;

function buildHeroSlides(banners: StorefrontBanner[], settings: StorefrontSettings): HeroSlide[] {
  const bannerSlides: HeroSlide[] = banners
    .filter((banner) => ["Homepage Hero", "New Collection", "Announcement"].includes(banner.placement))
    .map((banner) => ({
      id: banner.id,
      image: banner.image,
      imageAlt: banner.imageAlt,
      eyebrow: banner.eyebrow,
      headline: banner.headline,
      ctaLabel: banner.ctaLabel,
      ctaHref: banner.ctaHref
    }));

  if (bannerSlides.length > 0) {
    return bannerSlides;
  }

  return [
    {
      id: "hero-settings",
      image: settings.hero.backgroundImage,
      imageAlt: settings.hero.imageAlt,
      eyebrow: settings.hero.title,
      headline: settings.hero.marketingHeadline || settings.storeName,
      ctaLabel: settings.hero.ctaLabel,
      ctaHref: settings.hero.primaryCtaHref
    }
  ];
}

export default async function HomePage() {
  const [
    settings,
    categories,
    banners,
    products,
    bestSellerRecommendations,
    newArrivalRecommendations,
    trendingRecommendations
  ] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getStorefrontBanners(),
    getProducts(),
    getBestSellerRecommendations(10),
    getNewArrivalRecommendations(10),
    getTrendingProducts(10)
  ]);

  const heroSlides = buildHeroSlides(banners, settings);
  const brands = Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
  const recommendedProducts = bestSellerRecommendations.items.slice(0, 10);

  return (
    <>
      <MarketplaceHeader storeName={settings.storeName} />
      <main id="main-content" className="mx-auto max-w-7xl pb-24 md:pb-10">
        <HeroBannerSlider slides={heroSlides} />
        <CategoryIconRail categories={categories} />
        <div className="px-0 sm:px-0">
          <FlashSaleSection products={bestSellerRecommendations.items} />
        </div>
        <FeaturedCollections categories={categories} />
        <HorizontalProductRail
          title="Trending Now"
          subtitle="Popular picks across Daily Outfit"
          products={trendingRecommendations.items}
          actionLabel="View all"
          actionHref="/shop"
        />
        <HorizontalProductRail
          title="New Arrivals"
          subtitle="Fresh styles added this week"
          products={newArrivalRecommendations.items}
          actionLabel="Shop new"
          actionHref="/shop?sort=new"
          badge="New"
        />
        <HorizontalProductRail
          title="Recommended For You"
          subtitle="Based on what shoppers love"
          products={recommendedProducts}
          actionLabel="See more"
          actionHref="/shop"
        />
        <BrandShowcase brands={brands} />
      </main>
      <MarketplaceBottomNav />
    </>
  );
}
