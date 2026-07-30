"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarketplaceImage } from "@/components/ui/MarketplaceImage";
import type { MarketplaceBannerSlide } from "@/features/content/domain/map-banner-slide";
import { useHasHydrated } from "@/lib/hooks/use-has-hydrated";
import { cn } from "@/lib/utils";

export type HeroSlide = MarketplaceBannerSlide;

type HeroBannerSliderProps = {
  slides: HeroSlide[];
  autoplay?: boolean;
  autoplayIntervalMs?: number;
};

export function HeroBannerSlider({
  slides,
  autoplay = true,
  autoplayIntervalMs = 5500
}: HeroBannerSliderProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const hasMounted = useHasHydrated();
  const activeSlides = slides.filter((slide) => slide.active);
  const slideCount = activeSlides.length;
  const displayIndex = hasMounted ? (activeIndex >= slideCount ? 0 : activeIndex) : 0;

  const goTo = useCallback(
    (index: number) => {
      if (slideCount === 0) {
        return;
      }

      setActiveIndex((index + slideCount) % slideCount);
      setProgressKey((current) => current + 1);
    },
    [slideCount]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  const shouldAutoplay = autoplay && !isPaused && hasMounted && activeSlides.some((slide) => slide.autoplay);

  useEffect(() => {
    if (slideCount <= 1 || !shouldAutoplay) {
      return;
    }

    const timer = window.setInterval(goNext, autoplayIntervalMs);
    return () => window.clearInterval(timer);
  }, [autoplayIntervalMs, goNext, shouldAutoplay, slideCount]);

  if (slideCount === 0) {
    return null;
  }

  const activeSlide = activeSlides[displayIndex];

  return (
    <section className="px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8" aria-label="Featured promotions" aria-roledescription="carousel">
      <div
        ref={carouselRef}
        tabIndex={0}
        role="region"
        aria-label="Hero banner carousel"
        className="group/hero relative overflow-hidden rounded-[28px] bg-novora-ink shadow-[0_24px_80px_rgba(17,24,39,0.18)] ring-1 ring-black/5 outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsPaused(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goNext();
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            goPrev();
          } else if (event.key === "Home") {
            event.preventDefault();
            goTo(0);
          } else if (event.key === "End") {
            event.preventDefault();
            goTo(slideCount - 1);
          }
        }}
        onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          if (touchStartX == null) {
            return;
          }

          const delta = event.changedTouches[0]?.clientX - touchStartX;
          if (delta > 50) {
            goPrev();
          } else if (delta < -50) {
            goNext();
          }

          setTouchStartX(null);
        }}
      >
        <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9] lg:min-h-[420px]">
          {activeSlides.map((slide, index) => {
            const isActive = index === displayIndex;

            return (
              <article
                key={slide.id}
                aria-hidden={!isActive}
                className={cn(
                  "novora-hero-slide absolute inset-0 transition-[opacity,transform] duration-700 ease-out",
                  isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
                )}
              >
                <MarketplaceImage
                  src={slide.mobileImage}
                  alt={slide.imageAlt}
                  className={cn("absolute inset-0 md:hidden", isActive && "novora-hero-image-drift")}
                  priority={index === 0}
                  sizes="100vw"
                />
                <MarketplaceImage
                  src={slide.desktopImage}
                  alt={slide.imageAlt}
                  className={cn("absolute inset-0 hidden md:block", isActive && "novora-hero-image-drift")}
                  priority={index === 0}
                  sizes="100vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
              </article>
            );
          })}

          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end p-5 sm:p-8 lg:p-10">
            <div className="pointer-events-auto max-w-xl" aria-live="polite" aria-atomic="true">
              {activeSlide.storeName ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">{activeSlide.storeName}</p>
              ) : null}

              {activeSlide.subtitle ? (
                <span className="mt-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-md">
                  {activeSlide.subtitle}
                </span>
              ) : null}

              {activeSlide.headline ? (
                <h1 className="mt-4 text-[2rem] font-bold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                  {activeSlide.headline}
                </h1>
              ) : null}

              {activeSlide.buttonLabel && activeSlide.link ? (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href={activeSlide.link}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-novora-ink shadow-[0_12px_32px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)] active:scale-[0.98]"
                  >
                    {activeSlide.buttonLabel}
                    <ArrowRight size={16} strokeWidth={2.2} />
                  </Link>
                </div>
              ) : null}
            </div>

            {slideCount > 1 ? (
              <div className="pointer-events-auto mt-8 flex items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold tabular-nums text-white/70">
                    {String(displayIndex + 1).padStart(2, "0")}
                    <span className="mx-1.5 text-white/35">/</span>
                    {String(slideCount).padStart(2, "0")}
                  </span>
                  <div className="hidden h-px w-16 bg-white/20 sm:block" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPaused((current) => !current)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    aria-label={isPaused ? "Resume autoplay" : "Pause autoplay"}
                  >
                    {isPaused ? <Play size={15} strokeWidth={2} /> : <Pause size={15} strokeWidth={2} />}
                  </button>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={18} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {slideCount > 1 ? (
          <>
            <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-white/10">
              <div
                key={progressKey}
                className="novora-hero-progress h-full origin-left bg-white/85"
                style={{ animationDuration: `${autoplayIntervalMs}ms` }}
              />
            </div>

            <div className="absolute right-5 top-5 z-30 hidden gap-1.5 sm:flex">
              {activeSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === displayIndex ? "true" : undefined}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === displayIndex ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
