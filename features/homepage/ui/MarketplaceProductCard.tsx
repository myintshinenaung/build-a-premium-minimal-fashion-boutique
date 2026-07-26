import Link from "next/link";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";
import { WishlistButton } from "@/features/wishlist/client";
import type { Product } from "@/types/product";
import { cn, formatPrice } from "@/lib/utils";

type MarketplaceProductCardProps = {
  product: Product;
  priority?: boolean;
  compact?: boolean;
  badge?: string;
};

export function MarketplaceProductCard({
  product,
  priority = false,
  compact = false,
  badge
}: MarketplaceProductCardProps) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <article className={cn("group shrink-0", compact ? "w-[140px] sm:w-[160px]" : "w-[152px] sm:w-[180px]")}>
      <div className="relative overflow-hidden rounded-2xl bg-novora-surface shadow-sm ring-1 ring-novora-border/60 transition-shadow duration-300 group-hover:shadow-md">
        <WishlistButton productId={product.id} className="absolute right-2 top-2 z-10" compact />
        {badge ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-novora-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {badge}
          </span>
        ) : null}
        {discount ? (
          <span className="absolute bottom-2 left-2 z-10 rounded-md bg-novora-sale px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        ) : null}
        <Link href={`/product/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
          <BoutiqueImage
            src={product.images[0]}
            alt={product.name}
            className="aspect-[4/5]"
            imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            priority={priority}
            sizes="180px"
          />
        </Link>
      </div>
      <Link href={`/product/${product.slug}`} className="mt-2.5 block space-y-1">
        <p className="line-clamp-2 text-xs font-medium leading-4 text-novora-ink sm:text-sm">{product.name}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold text-novora-ink">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <span className="text-xs text-novora-muted line-through">{formatPrice(product.compareAtPrice)}</span>
          ) : null}
        </div>
        {product.reviewCount ? (
          <p className="text-[11px] text-novora-muted">
            ★ {product.averageRating?.toFixed(1)} ({product.reviewCount})
          </p>
        ) : null}
      </Link>
    </article>
  );
}
