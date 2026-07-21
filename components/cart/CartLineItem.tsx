"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { useCartStore } from "@/lib/storefront/cart/store";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

type CartLineItemProps = {
  item: CartItem;
};

export function CartLineItem({ item }: CartLineItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <article className="grid grid-cols-[88px_1fr] gap-4 border-b border-line py-5">
      <Link href={`/product/${item.productSlug}`} className="block overflow-hidden rounded-[2px] bg-mist">
        <BoutiqueImage src={item.image} alt={item.productName} className="aspect-[4/5]" sizes="88px" />
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/product/${item.productSlug}`} className="text-sm font-medium text-ink hover:underline">
              {item.productName}
            </Link>
            <p className="mt-1 text-xs text-stone">
              {item.size} / {item.color}
            </p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.productName} from cart`}
            onClick={() => removeItem(item.lineKey)}
            className="inline-flex h-8 w-8 items-center justify-center text-stone transition-colors hover:text-ink"
          >
            <Trash2 size={16} strokeWidth={1.7} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="inline-flex h-10 items-stretch border border-line">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => updateQuantity(item.lineKey, item.quantity - 1)}
              className="inline-flex w-10 items-center justify-center text-ink transition-colors hover:bg-mist"
            >
              <Minus size={14} strokeWidth={1.7} />
            </button>
            <span className="inline-flex min-w-10 items-center justify-center border-x border-line px-2 text-sm text-ink">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={item.quantity >= item.maxQuantity}
              onClick={() => updateQuantity(item.lineKey, item.quantity + 1)}
              className={cn(
                "inline-flex w-10 items-center justify-center text-ink transition-colors",
                item.quantity >= item.maxQuantity ? "cursor-not-allowed text-stone/50" : "hover:bg-mist"
              )}
            >
              <Plus size={14} strokeWidth={1.7} />
            </button>
          </div>
          <p className="text-sm font-medium text-ink">{formatPrice(item.unitPrice * item.quantity)}</p>
        </div>
      </div>
    </article>
  );
}
