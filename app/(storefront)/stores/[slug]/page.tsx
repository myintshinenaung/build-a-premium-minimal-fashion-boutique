import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogByStoreId } from "@/features/catalog/server";
import { MarketplaceProductCard } from "@/features/homepage/client";
import { MarketplaceTabPage } from "@/features/homepage/ui/MarketplaceTabPage";
import { getStoreBySlug } from "@/features/stores/server";
import { MarketplaceImage } from "@/components/ui/MarketplaceImage";

type StorePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store || store.status !== "active") {
    return { title: "Store" };
  }

  return {
    title: store.name,
    description: store.description
  };
}

export default async function StoreDetailPage({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store || store.status !== "active") {
    notFound();
  }

  const catalog = await getCatalogByStoreId(store.id);

  return (
    <MarketplaceTabPage title={store.name} description={store.description || "Store catalog on NOVORA"}>
      {store.coverImage ? (
        <div className="mb-8 overflow-hidden rounded-3xl">
          <MarketplaceImage
            src={store.coverImage}
            alt={store.name}
            className="aspect-[21/9] w-full"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        </div>
      ) : null}

      {catalog.categories.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-novora-ink">Categories</h2>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {catalog.categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="shrink-0 rounded-full bg-novora-surface px-4 py-2 text-sm font-medium text-novora-ink"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-novora-ink">Products</h2>
          <Link href="/shop" className="text-sm font-medium text-novora-muted hover:text-novora-ink">
            Shop all
          </Link>
        </div>
        {catalog.products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-novora-border px-5 py-10 text-center text-sm text-novora-muted">
            No published products in this store yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            {catalog.products.map((product, index) => (
              <MarketplaceProductCard key={product.id} product={product} priority={index < 4} size="fluid" />
            ))}
          </div>
        )}
      </section>
    </MarketplaceTabPage>
  );
}
