import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductGrid } from "@/features/catalog/server";
import type { Product } from "@/types/product";

type ProductRecommendationsSectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  emptyMessage?: string;
};

export function ProductRecommendationsSection({
  eyebrow,
  title,
  description,
  products,
  emptyMessage
}: ProductRecommendationsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-10">
        <ProductGrid products={products} emptyMessage={emptyMessage} />
      </div>
    </section>
  );
}
