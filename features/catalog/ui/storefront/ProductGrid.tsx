import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  emptyMessage?: string;
};

export function ProductGrid({ products, emptyMessage = "No pieces found." }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="border border-line bg-white px-5 py-10 text-center text-sm text-stone">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product, index) => (
        <ProductCard key={product.slug} product={product} priority={index < 2} />
      ))}
    </div>
  );
}
