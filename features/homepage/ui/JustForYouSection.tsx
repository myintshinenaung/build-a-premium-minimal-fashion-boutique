import type { Product } from "@/types/product";
import { HorizontalProductRail } from "@/features/homepage/ui/HorizontalProductRail";

type JustForYouSectionProps = {
  products: Product[];
};

/**
 * Non-personalized fallback rail for V1.
 * Uses catalog product ordering — not AI personalization.
 */
export function JustForYouSection({ products }: JustForYouSectionProps) {
  return (
    <HorizontalProductRail
      title="Just For You"
      subtitle="Hand-picked from what’s available on NOVORA"
      products={products}
      actionLabel="See all"
      actionHref="/shop"
    />
  );
}
