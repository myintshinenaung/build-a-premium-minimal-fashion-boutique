"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  image: string;
  imageAlt: string;
  eyebrow?: string;
  headline: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type HeroBannerSliderProps = {
  slides: HeroSlide[];
};

export function HeroBannerSlider({ slides }: HeroBannerSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const slideCount = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (slideCount === 0) {
        return;
      }

      setActiveIndex((index + slideCount) % slideCount);
    },
    [slideCount]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (slideCount <= 1) {
      return;
    }

    const timer = window.setInterval(goNext, 5000);
    return () => window.clearInterval(timer);
  }, [goNext, slideCount]);

  if (slideCount === 0) {
    return null;
  }

  return (
    <section className="px-4 pt-4 sm:px-6 lg:px-8" aria-label="Featured promotions">
      <div
        className="relative overflow-hidden rounded-3xl bg-novora-surface shadow-soft ring-1 ring-novora-border/60"
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
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <article key={slide.id} className="relative min-w-full">
              <BoutiqueImage
                src={slide.image}
                alt={slide.imageAlt}
                className="aspect-[16/9] sm:aspect-[21/9]"
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                {slide.eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">{slide.eyebrow}</p>
                ) : null}
                <h1 className="mt-2 max-w-lg text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                  {slide.headline}
                </h1>
                {slide.ctaLabel && slide.ctaHref ? (
                  <Link
                    href={slide.ctaHref}
                    className="mt-4 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-novora-ink transition-transform hover:scale-[1.02]"
                  >
                    {slide.ctaLabel}
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {slideCount > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-novora-ink shadow-sm transition hover:bg-white sm:inline-flex"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-novora-ink shadow-sm transition hover:bg-white sm:inline-flex"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
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
