"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  product: Product;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = product.images[activeIndex] ?? product.images[0];

  return (
    <div>
      <BoutiqueImage
        src={activeImage}
        alt={`${product.name} view ${activeIndex + 1}`}
        className="aspect-[4/5] rounded-[2px]"
        priority
        sizes="(min-width: 1024px) 58vw, 100vw"
      />
      <div className="mt-4 grid grid-cols-3 gap-3">
        {product.images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative aspect-[4/5] overflow-hidden rounded-[2px] border transition-colors",
              activeIndex === index ? "border-ink" : "border-transparent"
            )}
            aria-label={`Show ${product.name} image ${index + 1}`}
          >
            <BoutiqueImage src={image} alt="" className="h-full w-full" sizes="120px" />
          </button>
        ))}
      </div>
    </div>
  );
}
