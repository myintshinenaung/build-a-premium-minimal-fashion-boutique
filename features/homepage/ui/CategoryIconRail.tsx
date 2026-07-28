"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarketplaceImage } from "@/components/ui/MarketplaceImage";
import type { CategoryRailItem } from "@/features/catalog/domain/map-category-rail";
import { cn } from "@/lib/utils";

type CategoryIconRailProps = {
  categories: CategoryRailItem[];
};

export function CategoryIconRail({ categories }: CategoryIconRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    setCanScrollLeft(rail.scrollLeft > 8);
    setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 8);
  }, []);

  const scrollByAmount = useCallback((direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.72, 280), behavior: "smooth" });
    window.setTimeout(updateScrollState, 320);
  }, [updateScrollState]);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [categories.length, updateScrollState]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="relative pt-5 sm:pt-6" aria-label="Shop by category">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-10 bg-gradient-to-r from-white to-transparent sm:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-10 bg-gradient-to-l from-white to-transparent sm:block" />

      {canScrollLeft ? (
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-novora-border/70 bg-white/95 text-novora-ink shadow-md transition-all hover:-translate-y-[calc(50%+2px)] hover:shadow-lg sm:flex"
          aria-label="Scroll categories left"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
      ) : null}

      {canScrollRight ? (
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-novora-border/70 bg-white/95 text-novora-ink shadow-md transition-all hover:-translate-y-[calc(50%+2px)] hover:shadow-lg sm:flex"
          aria-label="Scroll categories right"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      ) : null}

      <div
        ref={(node) => {
          railRef.current = node;
          if (node) {
            updateScrollState();
          }
        }}
        onScroll={updateScrollState}
        className="novora-category-rail flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-3 pt-1 scrollbar-none sm:gap-4 sm:px-6 lg:px-8"
      >
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex w-[76px] shrink-0 snap-start flex-col items-center gap-2.5 sm:w-[88px] md:w-[96px]"
          >
            <div
              className={cn(
                "relative h-[76px] w-[76px] overflow-hidden rounded-[22px] bg-novora-surface shadow-[0_8px_24px_rgba(17,24,39,0.08)] ring-1 ring-novora-border/50 transition-all duration-300",
                "group-hover:-translate-y-1 group-hover:shadow-[0_16px_36px_rgba(17,24,39,0.14)] group-hover:ring-novora-accent/30",
                "group-active:scale-[0.97] sm:h-[84px] sm:w-[84px] sm:rounded-[24px] md:h-[92px] md:w-[92px]"
              )}
            >
              <MarketplaceImage
                src={category.image}
                alt={category.name}
                className="h-full w-full"
                sizes="(max-width: 640px) 76px, 92px"
                priority={index < 4}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <span className="line-clamp-2 max-w-full text-center text-[11px] font-semibold leading-4 text-novora-ink transition-colors group-hover:text-novora-accent sm:text-xs">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
