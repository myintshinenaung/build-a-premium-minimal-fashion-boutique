import type { Metadata } from "next";
import { productService } from "@/features/catalog/server";
import { ProductRailManager } from "@/features/product-rails/client";
import { productRailService } from "@/features/product-rails/server";

export const metadata: Metadata = {
  title: "Product Rail Manager"
};

export const dynamic = "force-dynamic";

export default async function AdminProductRailsPage() {
  const [rails, products] = await Promise.all([productRailService.getProductRails(), productService.getProducts()]);

  return <ProductRailManager initialRails={rails} products={products} />;
}
