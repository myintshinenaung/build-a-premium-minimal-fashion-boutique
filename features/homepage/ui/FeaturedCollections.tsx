"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketplaceImage } from "@/components/ui/MarketplaceImage";
import { SectionHeading } from "@/features/homepage/ui/SectionHeading";
import type { FeaturedCollectionsSectionData } from "@/types/featured-collection";

type FeaturedCollectionsProps = {
  data: FeaturedCollectionsSectionData;
};

export function FeaturedCollections({ data }: FeaturedCollectionsProps) {
  if (data.collections.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 sm:mt-14">
      <SectionHeading title="Featured Collections" />
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:gap-5 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:px-8 xl:grid-cols-2">
        {data.collections.map((collection) => (
          <article
            key={collection.id}
            className="group relative overflow-hidden rounded-[1.75rem] bg-novora-surface shadow-sm ring-1 ring-novora-border/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:ring-novora-border"
          >
            <div className="relative aspect-[16/11] overflow-hidden sm:aspect-[16/10]">
              <MarketplaceImage
                src={collection.coverImage}
                alt={collection.title}
                className="h-full w-full"
                imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-novora-ink/70 via-novora-ink/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{collection.title}</h3>
                {collection.subtitle ? (
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/85 sm:text-[15px]">{collection.subtitle}</p>
                ) : null}
                {collection.buttonText && collection.buttonUrl ? (
                  <Link
                    href={collection.buttonUrl}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-novora-ink transition-all duration-300 hover:bg-white hover:gap-2.5"
                  >
                    {collection.buttonText}
                    <ArrowRight size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                ) : null}
              </div>
            </div>

            {collection.products.length > 0 ? (
              <div className="border-t border-novora-border/60 px-4 py-3 sm:px-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-novora-muted">
                  {collection.products.length} curated product{collection.products.length === 1 ? "" : "s"}
                </p>
                <div className="mt-2 flex -space-x-2">
                  {collection.products.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white transition-transform duration-300 group-hover:translate-y-[-2px]"
                    >
                      <MarketplaceImage
                        src={product.images[0] ?? ""}
                        alt={product.name}
                        className="h-full w-full"
                        sizes="40px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function FeaturedCollectionsSkeleton() {
  return (
    <section className="mt-12 sm:mt-14" aria-busy="true" aria-label="Loading featured collections">
      <div className="mb-4 px-4 sm:px-6 lg:px-8">
        <div className="h-6 w-48 animate-pulse rounded-full bg-novora-border/70" />
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:gap-5 sm:px-6 lg:gap-6 lg:px-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[1.75rem] bg-novora-surface ring-1 ring-novora-border/60"
          >
            <div className="aspect-[16/11] animate-pulse bg-novora-border/50 sm:aspect-[16/10]" />
            <div className="space-y-2 px-4 py-3 sm:px-5">
              <div className="h-3 w-28 animate-pulse rounded-full bg-novora-border/60" />
              <div className="flex -space-x-2">
                {Array.from({ length: 3 }).map((__, thumbIndex) => (
                  <div key={thumbIndex} className="h-10 w-10 animate-pulse rounded-full bg-novora-border/60 ring-2 ring-white" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
