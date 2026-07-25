"use client";

import { useCallback, useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import type { Product } from "@/types/product";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  product: Product;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isHoverZoom, setIsHoverZoom] = useState(false);
  const activeImage = product.images[activeIndex] ?? product.images[0];

  const handlePointerMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  }, []);

  useEffect(() => {
    if (!isZoomOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsZoomOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomOpen]);

  const zoomStyle = {
    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
    transform: isHoverZoom || isZoomOpen ? "scale(2)" : "scale(1)"
  } as const;

  return (
    <>
      <div>
        <button
          type="button"
          aria-label={`Open zoom view for ${product.name}`}
          onClick={() => setIsZoomOpen(true)}
          onMouseEnter={() => setIsHoverZoom(true)}
          onMouseLeave={() => setIsHoverZoom(false)}
          onMouseMove={handlePointerMove}
          className="group relative block w-full overflow-hidden rounded-[2px] bg-mist"
        >
          <div className="aspect-[4/5] overflow-hidden">
            <BoutiqueImage
              src={activeImage}
              alt={`${product.name} view ${activeIndex + 1}`}
              className="h-full w-full"
              imageClassName="object-cover object-center transition-transform duration-300 ease-out"
              imageStyle={zoomStyle}
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          </div>
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white/90 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-ink backdrop-blur">
            <ZoomIn size={14} strokeWidth={1.7} />
            Zoom
          </span>
        </button>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {product.images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-[2px] border transition-colors sm:w-28",
                activeIndex === index ? "border-ink" : "border-transparent hover:border-line"
              )}
              aria-label={`Show ${product.name} image ${index + 1}`}
              aria-current={activeIndex === index}
            >
              <BoutiqueImage src={image} alt="" className="h-full w-full" sizes="120px" />
            </button>
          ))}
        </div>
      </div>

      {isZoomOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close zoom view"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink transition-colors hover:bg-mist"
          >
            <X size={18} strokeWidth={1.7} />
          </button>
          <div
            className="relative max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-[2px] bg-white"
            onMouseMove={handlePointerMove}
          >
            <div className="aspect-[4/5] max-h-[85vh] w-full overflow-hidden">
              <BoutiqueImage
                src={activeImage}
                alt={`${product.name} zoomed view`}
                className="h-full w-full"
                imageClassName="object-cover object-center transition-transform duration-150 ease-out"
                imageStyle={zoomStyle}
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
