import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import type { StorefrontBanner } from "@/types/storefront";

type NewCollectionBannerLabels = {
  viewNewArrivals: string;
  fallbackImageAlt: string;
};

type NewCollectionBannerProps = {
  banner: StorefrontBanner | null;
  labels: NewCollectionBannerLabels;
};

export function NewCollectionBanner({ banner, labels }: NewCollectionBannerProps) {
  if (!banner) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <BoutiqueImage
          src={banner.image}
          alt={banner.imageAlt || labels.fallbackImageAlt}
          className="aspect-[16/10] rounded-[2px]"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <div className="max-w-xl lg:justify-self-end">
          {banner.eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone">{banner.eyebrow}</p>
          ) : null}
          {banner.headline ? (
            <h2 className="mt-4 text-3xl font-medium leading-tight text-ink md:text-5xl">{banner.headline}</h2>
          ) : null}
          {banner.ctaLabel ? (
            <Link
              href={banner.ctaHref}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-8"
            >
              {banner.ctaLabel || labels.viewNewArrivals}
              <ArrowRight size={16} strokeWidth={1.6} />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
