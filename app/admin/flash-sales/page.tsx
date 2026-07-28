import type { Metadata } from "next";
import { productService } from "@/features/catalog/server";
import { FlashSaleManager } from "@/features/flash-sale/client";
import { flashSaleService } from "@/features/flash-sale/server";

export const metadata: Metadata = {
  title: "Flash Sale Manager"
};

export const dynamic = "force-dynamic";

export default async function AdminFlashSalesPage() {
  const [flashSales, products] = await Promise.all([flashSaleService.getFlashSales(), productService.getProducts()]);

  return <FlashSaleManager initialFlashSales={flashSales} products={products} />;
}
