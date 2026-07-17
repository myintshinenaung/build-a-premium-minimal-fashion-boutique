import { cache } from "react";
import { categoryService, productService } from "@/lib/services";
import {
  assignUniqueProductSlugs,
  mapAdminCategoryToCategory,
  mapAdminProductToProduct
} from "@/lib/storefront/map-catalog";
import type { Category, Product } from "@/types/product";

type Catalog = {
  categories: Category[];
  products: Product[];
};

const getCatalog = cache(async (): Promise<Catalog> => {
  const [adminCategories, adminProducts] = await Promise.all([
    categoryService.getCategories(),
    productService.getProducts({ status: "Published" })
  ]);

  const publishedCategories = adminCategories.filter((category) => category.status === "Published");
  const categoryById = new Map(publishedCategories.map((category) => [category.id, category]));

  const products = assignUniqueProductSlugs(
    adminProducts
      .filter((product) => product.status === "Published" && categoryById.has(product.categoryId))
      .map((product) => mapAdminProductToProduct(product, categoryById.get(product.categoryId)!.name))
  );

  return {
    categories: publishedCategories.map(mapAdminCategoryToCategory),
    products
  };
});

export async function getCategories() {
  const { categories } = await getCatalog();
  return categories;
}

export async function getProducts() {
  const { products } = await getCatalog();
  return products;
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProductsByCategory(categoryName: string) {
  const products = await getProducts();
  return products.filter((product) => product.category === categoryName);
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const products = await getProducts();

  return products
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .concat(products.filter((item) => item.slug !== product.slug && item.category !== product.category))
    .slice(0, limit);
}

export async function getBestSellers(limit = 4) {
  const products = await getProducts();
  return products.filter((product) => product.bestSeller).slice(0, limit);
}

export async function getNewArrivals(limit = 4) {
  const products = await getProducts();
  return products.filter((product) => product.newArrival).slice(0, limit);
}

export async function getProductSlugs() {
  const products = await getProducts();
  return products.map((product) => product.slug);
}

export async function getCategorySlugs() {
  const categories = await getCategories();
  return categories.map((category) => category.slug);
}
