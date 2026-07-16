import type { Metadata } from "next";
import { ProductManager } from "@/components/admin/forms/ProductManager";
import { categoryService, productService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Products",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [adminProducts, adminCategories] = await Promise.all([
    productService.getProducts(),
    categoryService.getCategories(),
  ]);

  return (
    <>
      <h1 style={{ color: "red", fontSize: 40 }}>
        Products = {adminProducts.length}
      </h1>

      <ProductManager
        initialProducts={adminProducts}
        categories={adminCategories}
      />
    </>
  );
}