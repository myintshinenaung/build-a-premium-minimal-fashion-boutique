"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarketplaceProductCard } from "@/features/homepage/ui/MarketplaceProductCard";
import type { FlashSaleSectionData } from "@/types/flash-sale";

type FlashSaleSectionProps = {
  data: FlashSaleSectionData;
};

const EMPTY_COUNTDOWN = { hours: 0, minutes: 0, seconds: 0 };

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function getCountdownTo(endIso: string) {
  const endMs = Date.parse(endIso);
  const totalSeconds = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, expired: totalSeconds <= 0 };
}

export function FlashSaleSection({ data }: FlashSaleSectionProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState(EMPTY_COUNTDOWN);
  const [isExpired, setIsExpired] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const tick = () => {
      const next = getCountdownTo(data.endsAt);
      setCountdown(next);
      setIsExpired(next.expired);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [data.endsAt]);

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    setCanScrollLeft(rail.scrollLeft > 8);
    setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [data.products.length, updateScrollState]);

  const scrollByAmount = useCallback(
    (direction: -1 | 1) => {
      const rail = railRef.current;
      if (!rail) {
        return;
      }

      rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.75, 320), behavior: "smooth" });
      window.setTimeout(updateScrollState, 320);
    },
    [updateScrollState]
  );

  if (isExpired || data.products.length === 0) {
    return null;
  }

  return (
    <section
      className="relative mt-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-novora-accentSoft via-white to-novora-surface py-6 ring-1 ring-novora-border/50"
      aria-label={data.sectionTitle || "Flash sale"}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          {data.badgeText ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-novora-accent">{data.badgeText}</p>
          ) : null}
          {data.sectionTitle ? (
            <h2 className="mt-1 text-xl font-bold tracking-tight text-novora-ink sm:text-2xl">{data.sectionTitle}</h2>
          ) : null}
          {data.sectionSubtitle ? <p className="mt-1 text-sm text-novora-muted">{data.sectionSubtitle}</p> : null}
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl bg-novora-ink px-3 py-2 text-white shadow-[0_12px_32px_rgba(17,24,39,0.18)]">
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-sm font-bold tabular-nums">{pad(countdown.hours)}</span>
          <span className="text-sm font-bold">:</span>
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-sm font-bold tabular-nums">{pad(countdown.minutes)}</span>
          <span className="text-sm font-bold">:</span>
          <span className="rounded-md bg-white/10 px-2.5 py-1 text-sm font-bold tabular-nums">{pad(countdown.seconds)}</span>
        </div>
      </div>

      <div className="relative">
        {canScrollLeft ? (
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-novora-border/70 bg-white/95 text-novora-ink shadow-md transition-all hover:-translate-y-[calc(50%+2px)] hover:shadow-lg sm:flex"
            aria-label="Scroll flash sale left"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
        ) : null}

        {canScrollRight ? (
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-novora-border/70 bg-white/95 text-novora-ink shadow-md transition-all hover:-translate-y-[calc(50%+2px)] hover:shadow-lg sm:flex"
            aria-label="Scroll flash sale right"
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
          className="novora-flash-sale-rail flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 scrollbar-none sm:gap-5 sm:px-6 lg:px-8"
        >
          {data.products.map((product, index) => (
            <MarketplaceProductCard
              key={product.id}
              product={product}
              priority={index < 3}
              size="large"
              badge={data.badgeText || undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FlashSaleSectionSkeleton() {
  return (
    <section className="mt-8 animate-pulse rounded-[28px] bg-gradient-to-br from-novora-accentSoft/70 via-white to-novora-surface py-6 ring-1 ring-novora-border/40">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded-full bg-novora-border/60" />
          <div className="h-7 w-48 rounded-xl bg-novora-border/60 sm:w-64" />
          <div className="h-4 w-56 rounded-lg bg-novora-border/40" />
        </div>
        <div className="h-11 w-40 rounded-2xl bg-novora-ink/20" />
      </div>
      <div className="flex gap-4 overflow-hidden px-4 sm:gap-5 sm:px-6 lg:px-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-[180px] shrink-0 sm:w-[220px] md:w-[240px]">
            <div className="aspect-[4/5] rounded-[24px] bg-novora-border/50" />
            <div className="mt-3 h-4 w-3/4 rounded bg-novora-border/40" />
            <div className="mt-2 h-4 w-1/2 rounded bg-novora-border/30" />
          </div>
        ))}
      </div>
    </section>
  );
}
