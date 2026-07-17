import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderButtons } from "@/components/product/OrderButtons";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ShareProduct } from "@/components/product/ShareProduct";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCategoryBySlug, getProductBySlug, getRelatedProducts } from "@/lib/storefront/catalog";
import { formatPrice, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product"
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Atelier Lune`,
      description: product.description,
      images: [product.images[0]]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [relatedProducts, category] = await Promise.all([
    getRelatedProducts(product),
    getCategoryBySlug(slugify(product.category))
  ]);
  const categoryHref = category ? `/categories/${category.slug}` : `/categories/${slugify(product.category)}`;

  return (
    <>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <ProductGallery product={product} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-6 flex items-center gap-2 text-sm text-stone">
            <Link href="/shop" className="underline underline-offset-8">
              Shop
            </Link>
            <span>/</span>
            <Link href={categoryHref} className="underline underline-offset-8">
              {product.category}
            </Link>
          </div>

          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">{product.category}</p>
              <h1 className="mt-3 text-3xl font-medium leading-tight text-ink md:text-5xl">{product.name}</h1>
            </div>
            <p className="pt-2 text-lg text-ink">{formatPrice(product.price)}</p>
          </div>

          <p className="mt-6 text-sm leading-7 text-stone md:text-base">{product.description}</p>

          <div className="mt-8 border-y border-line py-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-stone">Stock status</span>
              <span className="text-sm font-medium text-ink">{product.stockStatus}</span>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">Sizes</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className="min-w-12 border border-line px-4 py-3 text-sm text-ink transition-colors hover:border-ink"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">Colors</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className="inline-flex items-center gap-2 border border-line px-3 py-2 text-sm text-ink transition-colors hover:border-ink"
                >
                  <span className="h-4 w-4 rounded-full border border-white ring-1 ring-line" style={{ backgroundColor: color.hex }} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <OrderButtons product={product} />
          </div>

          <div className="mt-4">
            <ShareProduct product={product} />
          </div>

          <div className="mt-10">
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">Description</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone">
              {product.details.map((detail) => (
                <li key={detail} className="border-b border-line pb-3">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
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
