import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/forms/CategoryManager";
import { categoryService } from "@/lib/services";

export const metadata: Metadata = {
  title: "Categories"
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const adminCategories = await categoryService.getCategories();

  return <CategoryManager initialCategories={adminCategories} />;
}
