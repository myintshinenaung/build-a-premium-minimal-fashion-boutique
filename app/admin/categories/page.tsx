import type { Metadata } from "next";
import { CategoryManager } from "@/features/catalog/client";
import { categoryService } from "@/features/catalog/server";

export const metadata: Metadata = {
  title: "Categories"
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const adminCategories = await categoryService.getCategories();

  return <CategoryManager initialCategories={adminCategories} />;
}
