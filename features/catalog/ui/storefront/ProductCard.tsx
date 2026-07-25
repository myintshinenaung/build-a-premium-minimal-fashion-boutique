import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { BoutiqueImage } from "@/components/ui/BoutiqueImage";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
        <BoutiqueImage
          src={product.images[0]}
          alt={product.name}
          className="aspect-[4/5] rounded-[2px]"
          imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
        />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium leading-5 text-ink">{product.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone">{product.category}</p>
          </div>
          <p className="text-sm text-ink">{formatPrice(product.price)}</p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex -space-x-1">
            {product.colors.slice(0, 3).map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="h-4 w-4 rounded-full border border-white ring-1 ring-line"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
          <div className="flex gap-2 text-[11px] uppercase tracking-[0.18em] text-stone">
            {product.newArrival ? <span>New</span> : null}
            {product.bestSeller ? <span>Best</span> : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
