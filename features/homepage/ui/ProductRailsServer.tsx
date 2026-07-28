import { getProductRailsSectionData } from "@/features/product-rails/server";
import { ProductRailsSection } from "@/features/homepage/ui/ProductRailsSection";

export async function ProductRailsServer() {
  const data = await getProductRailsSectionData();

  if (!data) {
    return null;
  }

  return <ProductRailsSection data={data} />;
}
