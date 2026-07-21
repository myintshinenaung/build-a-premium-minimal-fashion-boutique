"use client";

import { cn } from "@/lib/utils";
import { isColorSelectable, isSizeSelectable } from "@/lib/storefront/variants";
import { useTranslator } from "@/lib/i18n/use-translator";
import type { Product } from "@/types/product";

type VariantSelectorsProps = {
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
};

export function VariantSelectors({
  product,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange
}: VariantSelectorsProps) {
  const { t } = useTranslator();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">{t("product.size")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const selectable = isSizeSelectable(product, size, selectedColor);
            const selected = selectedSize === size;

            return (
              <button
                key={size}
                type="button"
                disabled={!selectable}
                aria-pressed={selected}
                onClick={() => onSizeChange(size)}
                className={cn(
                  "min-w-12 border px-4 py-3 text-sm transition-colors",
                  selected ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink",
                  !selectable && "cursor-not-allowed border-line/70 text-stone/50 line-through hover:border-line/70"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink">{t("product.color")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {product.colors.map((color) => {
            const selectable = isColorSelectable(product, color.name, selectedSize);
            const selected = selectedColor === color.name;

            return (
              <button
                key={color.name}
                type="button"
                disabled={!selectable}
                aria-pressed={selected}
                onClick={() => onColorChange(color.name)}
                className={cn(
                  "inline-flex items-center gap-2 border px-3 py-2 text-sm transition-colors",
                  selected ? "border-ink bg-mist text-ink" : "border-line text-ink hover:border-ink",
                  !selectable && "cursor-not-allowed border-line/70 text-stone/50 hover:border-line/70"
                )}
              >
                <span
                  className={cn(
                    "h-4 w-4 rounded-full border border-white ring-1 ring-line",
                    !selectable && "opacity-40"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
