import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import type { StorefrontHero } from "@/types/storefront";

type HomeHeroBannerProps = {
  storeName: string;
  hero: StorefrontHero;
};

export function HomeHeroBanner({ storeName, hero }: HomeHeroBannerProps) {
  const marketingHeadline = hero.marketingHeadline.trim();
  const subtitle = hero.subtitle.trim() || "";
  const primaryCtaLabel = hero.ctaLabel.trim();
  const secondaryCtaLabel = hero.secondaryCtaLabel.trim();

  return (
    <section className="relative min-h-[78svh] overflow-hidden">
      <div className="absolute inset-0">
        <BoutiqueImage
          src={hero.backgroundImage}
          alt={hero.imageAlt}
          priority
          className="h-full w-full"
          imageClassName="object-[55%_center] md:object-center"
          sizes="100vw"
        />
      </div>
      <div className="relative mx-auto flex min-h-[78svh] max-w-[1440px] items-end px-4 pb-16 pt-24 sm:px-6 md:pb-20 lg:px-8">
        <div className="max-w-xl">
          {hero.title ? (
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-stone">{hero.title}</p>
          ) : null}
          <h1 className="text-5xl font-medium leading-[0.98] text-ink sm:text-6xl md:text-7xl">{storeName}</h1>
          {marketingHeadline ? (
            <p className="mt-4 text-2xl font-medium leading-tight text-ink sm:text-3xl md:text-4xl">{marketingHeadline}</p>
          ) : null}
          {subtitle ? <p className="mt-6 max-w-md text-base leading-7 text-stone">{subtitle}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {primaryCtaLabel ? (
              <Link
                href={hero.primaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-stone"
              >
                {primaryCtaLabel}
                <ArrowRight size={17} strokeWidth={1.7} />
              </Link>
            ) : null}
            {secondaryCtaLabel ? (
              <Link
                href={hero.secondaryCtaHref}
                className="inline-flex h-12 items-center justify-center border border-ink px-6 text-sm font-medium text-ink transition-colors hover:bg-white/70"
              >
                {secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
