import { notFound } from "next/navigation";
import { ProductGallery, ProductPurchasePanel } from "@/features/catalog/client";
import { getCategoryBySlug, getProductBySlug } from "@/features/catalog/server";
import { ProductReviewsSection } from "@/features/reviews/client";
import {
  getRelatedProducts,
  getSimilarProducts,
  getTrendingProducts
} from "@/features/recommendations/server";
import { ProductRecommendationsSection } from "@/features/recommendations/ui/storefront/ProductRecommendationsSection";
import { RecentlyViewedTracker } from "@/features/search/client";
import { getTranslator } from "@/features/i18n/server";
import { buildPageMetadata, getStoreSettings } from "@/features/settings/server";
import { STOREFRONT_DISPLAY_NAME } from "@/lib/storefront/brand";
import { slugify } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getStoreSettings()]);

  if (!product) {
    return {
      title: "Product"
    };
  }

  return buildPageMetadata({ ...settings, storeName: STOREFRONT_DISPLAY_NAME }, {
    title: product.name,
    description: product.description,
    openGraphImage: product.images[0]
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [{ t }, product] = await Promise.all([getTranslator(), getProductBySlug(slug)]);
  if (!product) notFound();

  const [relatedProducts, similarProducts, trendingProducts, category] = await Promise.all([
    getRelatedProducts(product.id),
    getSimilarProducts(product.id),
    getTrendingProducts(4, product.id),
    getCategoryBySlug(slugify(product.category))
  ]);
  const categoryHref = category ? `/categories/${category.slug}` : `/categories/${slugify(product.category)}`;

  return (
    <>
      <RecentlyViewedTracker
        id={product.id}
        slug={product.slug}
        name={product.name}
        price={product.price}
        image={product.images[0] ?? "/images/hero-boutique.png"}
        brand={product.brand}
        category={product.category}
      />
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <ProductGallery product={product} />

        <div>
          <ProductPurchasePanel
            product={product}
            storeName={STOREFRONT_DISPLAY_NAME}
            categoryHref={categoryHref}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-6 lg:px-8">
        <ProductReviewsSection productId={product.id} />
      </section>

      <ProductRecommendationsSection
        eyebrow={t("recommendations.relatedEyebrow")}
        title={t("recommendations.relatedTitle")}
        products={relatedProducts.items}
      />

      <ProductRecommendationsSection
        eyebrow={t("recommendations.similarEyebrow")}
        title={t("recommendations.similarTitle")}
        products={similarProducts.items}
      />

      <ProductRecommendationsSection
        eyebrow={t("recommendations.trendingEyebrow")}
        title={t("recommendations.trendingTitle")}
        products={trendingProducts.items}
      />
    </>
  );
}
