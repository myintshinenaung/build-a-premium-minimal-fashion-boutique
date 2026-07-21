import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCategoryBySlug, getProductBySlug, getRelatedProducts } from "@/lib/storefront/catalog";
import { buildPageMetadata } from "@/lib/storefront/metadata";
import { getStoreSettings } from "@/lib/storefront/settings";
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

  return buildPageMetadata(settings, {
    title: product.name,
    description: product.description,
    openGraphImage: product.images[0]
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [relatedProducts, category, settings] = await Promise.all([
    getRelatedProducts(product),
    getCategoryBySlug(slugify(product.category)),
    getStoreSettings()
  ]);
  const categoryHref = category ? `/categories/${category.slug}` : `/categories/${slugify(product.category)}`;

  return (
    <>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <ProductGallery product={product} />

        <div>
          <ProductPurchasePanel
            product={product}
            storeName={settings.storeName}
            categoryHref={categoryHref}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Related products" title="Complete the edit" />
        <div className="mt-10">
          <ProductGrid products={relatedProducts} />
        </div>
      </section>
    </>
  );
}
