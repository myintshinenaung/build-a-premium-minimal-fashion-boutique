"use client";

import Link from "next/link";
import {
  Baby,
  Briefcase,
  Footprints,
  Gem,
  Shirt,
  ShoppingBag,
  Sparkles,
  Watch
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import type { Category } from "@/types/product";

const iconByCategory: Record<string, LucideIcon> = {
  Dresses: Sparkles,
  Tops: Shirt,
  Pants: Briefcase,
  Bags: ShoppingBag,
  Shoes: Footprints,
  Accessories: Gem,
  Knitwear: Shirt,
  Outerwear: Shirt,
  Jewelry: Gem,
  Kids: Baby
};

type CategoryIconRailProps = {
  categories: Category[];
};

export function CategoryIconRail({ categories }: CategoryIconRailProps) {
  const items = categories.slice(0, 10);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="pt-6" aria-label="Shop by category">
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:px-6 lg:px-8">
        {items.map((category) => {
          const Icon = iconByCategory[category.name] ?? Watch;

          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group flex w-[72px] shrink-0 flex-col items-center gap-2 sm:w-20"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-novora-surface shadow-sm ring-1 ring-novora-border/60 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md sm:h-[72px] sm:w-[72px]">
                {category.image ? (
                  <BoutiqueImage src={category.image} alt="" className="h-full w-full" sizes="72px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-novora-accent">
                    <Icon size={24} strokeWidth={1.8} />
                  </div>
                )}
              </div>
              <span className="line-clamp-2 text-center text-[11px] font-medium leading-4 text-novora-ink">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
