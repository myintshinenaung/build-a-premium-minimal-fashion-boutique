import type { Metadata } from "next";
import { productService } from "@/features/catalog/server";
import { FeaturedCollectionManager } from "@/features/featured-collections/client";
import { featuredCollectionService } from "@/features/featured-collections/server";

export const metadata: Metadata = {
  title: "Featured Collection Manager"
};

export const dynamic = "force-dynamic";

export default async function AdminFeaturedCollectionsPage() {
  const [collections, products] = await Promise.all([
    featuredCollectionService.getFeaturedCollections(),
    productService.getProducts()
  ]);

  return <FeaturedCollectionManager initialCollections={collections} products={products} />;
}
