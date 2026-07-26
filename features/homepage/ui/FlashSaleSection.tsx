"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MarketplaceProductCard } from "@/features/homepage/ui/MarketplaceProductCard";
import type { Product } from "@/types/product";

type FlashSaleSectionProps = {
  products: Product[];
};

function getEndOfDayCountdown() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const totalSeconds = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const [countdown, setCountdown] = useState(getEndOfDayCountdown());
  const saleProducts = products.slice(0, 8);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getEndOfDayCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (saleProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 rounded-3xl bg-gradient-to-br from-novora-accentSoft via-white to-novora-surface py-6 ring-1 ring-novora-border/50">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-novora-accent">Flash Sale</p>
          <h2 className="mt-1 text-lg font-semibold text-novora-ink sm:text-xl">Today&apos;s best deals</h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-novora-ink px-3 py-2 text-white">
          <span className="rounded-md bg-white/10 px-2 py-1 text-sm font-bold tabular-nums">{pad(countdown.hours)}</span>
          <span className="text-sm font-bold">:</span>
          <span className="rounded-md bg-white/10 px-2 py-1 text-sm font-bold tabular-nums">{pad(countdown.minutes)}</span>
          <span className="text-sm font-bold">:</span>
          <span className="rounded-md bg-white/10 px-2 py-1 text-sm font-bold tabular-nums">{pad(countdown.seconds)}</span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:gap-4 sm:px-6 lg:px-8">
        {saleProducts.map((product, index) => (
          <MarketplaceProductCard key={product.id} product={product} priority={index < 2} compact badge="Sale" />
        ))}
      </div>

      <div className="mt-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="inline-flex rounded-full bg-novora-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-novora-accent/90"
        >
          View all deals
        </Link>
      </div>
    </section>
  );
}
